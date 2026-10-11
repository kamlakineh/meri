"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { recognize } from "tesseract.js";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Facility, PharmacyMedicine } from "@/lib/api/types";

interface SearchResult {
  medicine: PharmacyMedicine;
  facility: Facility | null;
}

export function MedicinesSearch() {
  const t = useTranslations("patient");
  const initialName = useSearchParams().get("name") ?? "";

  const [query, setQuery] = useState(initialName);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [orderedKeys, setOrderedKeys] = useState<Set<string>>(new Set());

  async function runSearch(name: string) {
    if (!name.trim()) return;
    setSearching(true);
    try {
      const res = await clientApiFetch<{ data: SearchResult[] }>("/medicines/search", {
        searchParams: { name },
      });
      setResults(res.data);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (!initialName) return;
    queueMicrotask(() => {
      void runSearch(initialName);
    });
  }, [initialName]);

  async function handleScan(file: File) {
    setScanning(true);
    setExtractedText("");
    try {
      const { data } = await recognize(file, "eng");
      setExtractedText(data.text.trim());
    } finally {
      setScanning(false);
    }
  }

  async function order(result: SearchResult, fulfillment: "pickup" | "delivery") {
    if (!result.facility) return;
    const key = `${result.medicine.id}-${fulfillment}`;
    await clientApiFetch("/orders", {
      method: "POST",
      body: {
        pharmacyFacilityId: result.facility.id,
        items: [{ medicineId: result.medicine.id, name: result.medicine.name, quantity: 1 }],
        fulfillment,
      },
    });
    setOrderedKeys((prev) => new Set(prev).add(key));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-1 font-semibold text-foreground">{t("scanPrescriptionTitle")}</h2>
        <p className="mb-3 text-sm text-muted">{t("scanPrescriptionSubtitle")}</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleScan(file);
          }}
          className="text-sm text-foreground"
        />
        {scanning && <p className="mt-2 text-sm text-muted">{t("scanning")}</p>}
        {extractedText && (
          <div className="mt-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("extractedText")}
            </p>
            <p className="mt-1 max-h-32 overflow-y-auto text-sm whitespace-pre-wrap text-foreground">
              {extractedText}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              onClick={() => {
                const firstWord = extractedText.split(/\s+/)[0] ?? "";
                setQuery(firstWord);
                runSearch(firstWord);
              }}
            >
              {t("searchThisText")}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-foreground">{t("medicineSearchTitle")}</h2>
        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            runSearch(query);
          }}
          className="flex gap-2"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("medicineSearchPlaceholder")}
          />
          <Button type="submit" isLoading={searching}>
            {t("searchButton")}
          </Button>
        </form>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((result) => {
            const pickupKey = `${result.medicine.id}-pickup`;
            const deliveryKey = `${result.medicine.id}-delivery`;
            return (
              <Card key={result.medicine.id} className="flex flex-col gap-2 p-4">
                <p className="font-medium text-foreground">
                  {result.medicine.name} {result.medicine.strength}
                </p>
                <p className="text-sm text-muted">{result.facility?.name}</p>
                <div className="flex items-center justify-between">
                  <Badge tone="success">
                    {t("inStockAt")}: {result.medicine.quantity}
                  </Badge>
                  <span className="text-sm text-foreground">ETB {result.medicine.price}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => order(result, "pickup")}
                    disabled={orderedKeys.has(pickupKey)}
                  >
                    {orderedKeys.has(pickupKey) ? t("orderPlaced") : t("orderPickup")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => order(result, "delivery")}
                    disabled={orderedKeys.has(deliveryKey)}
                  >
                    {orderedKeys.has(deliveryKey) ? t("orderPlaced") : t("orderDelivery")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { Minus, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { read, utils } from "xlsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, type Column } from "@/components/table/DataTable";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { PharmacyMedicine } from "@/lib/api/types";

interface ImportRow {
  name: string;
  strength?: string;
  form?: string;
  price: number;
  quantity: number;
}

export function MedicinesManager({
  facilityId,
  medicines,
  labels,
}: {
  facilityId: string;
  medicines: PharmacyMedicine[];
  labels: {
    addMedicineButton: string;
    importButton: string;
    nameLabel: string;
    strengthLabel: string;
    formLabel: string;
    priceLabel: string;
    quantityLabel: string;
    lowStockBadge: string;
    outOfStockBadge: string;
    deleteAction: string;
    noMedicines: string;
  };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function addMedicine(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await clientApiFetch(`/pharmacies/${facilityId}/medicines`, {
        method: "POST",
        body: { name, strength, form, price: Number(price), quantity: Number(quantity) },
      });
      setName("");
      setStrength("");
      setForm("");
      setPrice("");
      setQuantity("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedicine(id: string) {
    setBusyId(id);
    try {
      await clientApiFetch(`/pharmacies/${facilityId}/medicines/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function adjustQuantity(medicine: PharmacyMedicine, delta: number) {
    setBusyId(medicine.id);
    try {
      await clientApiFetch(`/pharmacies/${facilityId}/medicines/${medicine.id}`, {
        method: "PATCH",
        body: { quantity: Math.max(0, medicine.quantity + delta) },
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleImport(file: File) {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json<Record<string, unknown>>(firstSheet);

    const parsed: ImportRow[] = rows
      .map((row) => ({
        name: String(row.name ?? row.Name ?? "").trim(),
        strength: String(row.strength ?? row.Strength ?? ""),
        form: String(row.form ?? row.Form ?? ""),
        price: Number(row.price ?? row.Price ?? 0),
        quantity: Number(row.quantity ?? row.Quantity ?? 0),
      }))
      .filter((row) => row.name);

    if (parsed.length === 0) return;

    await clientApiFetch(`/pharmacies/${facilityId}/medicines/import`, {
      method: "POST",
      body: { rows: parsed },
    });
    router.refresh();
  }

  const columns: Column<PharmacyMedicine>[] = [
    {
      key: "name",
      header: labels.nameLabel,
      render: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.name}</p>
          <p className="text-xs text-muted-foreground">
            {m.strength} {m.form}
          </p>
        </div>
      ),
    },
    { key: "price", header: labels.priceLabel, render: (m) => `ETB ${m.price}` },
    {
      key: "quantity",
      header: labels.quantityLabel,
      render: (m) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustQuantity(m, -1)}
            disabled={busyId === m.id || m.quantity === 0}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted hover:bg-background disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-foreground">{m.quantity}</span>
          <button
            type="button"
            onClick={() => adjustQuantity(m, 1)}
            disabled={busyId === m.id}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted hover:bg-background"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      ),
    },
    {
      key: "stock",
      header: "",
      render: (m) =>
        m.quantity === 0 ? (
          <Badge tone="danger">{labels.outOfStockBadge}</Badge>
        ) : m.quantity < 10 ? (
          <Badge tone="warning">{labels.lowStockBadge}</Badge>
        ) : null,
    },
    {
      key: "actions",
      header: "",
      render: (m) => (
        <button
          type="button"
          onClick={() => deleteMedicine(m.id)}
          disabled={busyId === m.id}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-background"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={addMedicine} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1">
          <Input
            placeholder={labels.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="w-28">
          <Input
            placeholder={labels.strengthLabel}
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          />
        </div>
        <div className="w-28">
          <Input
            placeholder={labels.formLabel}
            value={form}
            onChange={(e) => setForm(e.target.value)}
          />
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder={labels.priceLabel}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder={labels.quantityLabel}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <Button type="submit" isLoading={saving}>
          {labels.addMedicineButton}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> {labels.importButton}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = "";
          }}
        />
      </form>

      <div className="rounded-[var(--radius-card)] border border-border">
        <DataTable
          columns={columns}
          rows={medicines}
          rowKey={(m) => m.id}
          emptyMessage={labels.noMedicines}
        />
      </div>
    </div>
  );
}

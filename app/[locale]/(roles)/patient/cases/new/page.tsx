"use client";

import { nanoid } from "nanoid";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/layout/PageHeader";
import { clientApiFetch } from "@/lib/api/clientFetch";
import { fileToDataUrl, MAX_ATTACHMENT_BYTES } from "@/lib/files";
import type { Case, CaseAttachment } from "@/lib/api/types";

export default function NewCasePage() {
  const t = useTranslations("patient");
  const router = useRouter();

  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const attachments: CaseAttachment[] = await Promise.all(
        files
          .filter((file) => file.size <= MAX_ATTACHMENT_BYTES)
          .map(async (file) => ({
            id: nanoid(8),
            url: await fileToDataUrl(file),
            kind: file.type.startsWith("image/") ? ("photo" as const) : ("file" as const),
          }))
      );

      const created = await clientApiFetch<Case>("/cases", {
        method: "POST",
        body: {
          symptoms,
          durationDays: duration ? Number(duration) : undefined,
          attachments,
        },
      });
      router.push(`/patient/cases/${created.id}`);
    } catch {
      setError(t("genericError"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader title={t("newCaseTitle")} subtitle={t("newCaseSubtitle")} />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label={t("symptomsLabel")} htmlFor="symptoms" required>
            <Textarea
              id="symptoms"
              rows={5}
              placeholder={t("symptomsPlaceholder")}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t("durationLabel")} htmlFor="duration">
            <Input
              id="duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </FormField>
          <FormField label={t("attachmentsLabel")} htmlFor="attachments">
            <input
              id="attachments"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-sm text-foreground"
            />
          </FormField>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={loading}>
            {t("submitCase")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

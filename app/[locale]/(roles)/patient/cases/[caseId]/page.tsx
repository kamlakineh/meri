import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { getCase } from "@/lib/api/cases";
import type { CaseStatus } from "@/lib/api/types";

export const instant = false;

const STATUS_TONE: Record<
  CaseStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  submitted: "info",
  accepted: "success",
  declined: "danger",
  referred: "warning",
  closed: "neutral",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const t = await getTranslations("patient");

  let caseRecord;
  try {
    caseRecord = await getCase(caseId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={t("columns.symptoms")}
        subtitle={new Date(caseRecord.createdAt).toLocaleString()}
        actions={<Badge tone={STATUS_TONE[caseRecord.status]}>{caseRecord.status}</Badge>}
      />

      <Card className="flex flex-col gap-4 p-6">
        <p className="text-foreground">{caseRecord.symptoms}</p>

        {caseRecord.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {caseRecord.attachments.map((attachment) =>
              attachment.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element -- data: URLs from client uploads, not optimizable by next/image
                <img
                  key={attachment.id}
                  src={attachment.url}
                  alt=""
                  className="h-24 w-24 rounded-[var(--radius-control)] border border-border object-cover"
                />
              ) : (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  download
                  className="rounded-[var(--radius-control)] border border-border px-3 py-2 text-sm text-primary"
                >
                  {attachment.id}
                </a>
              )
            )}
          </div>
        )}

        {caseRecord.doctorNotes && (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("doctorNotesLabel")}
            </p>
            <p className="mt-1 text-sm text-foreground">{caseRecord.doctorNotes}</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("prescriptionLabel")}</h2>
        </div>
        {caseRecord.medicines.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">{t("noPrescription")}</p>
        ) : (
          <div className="divide-y divide-border">
            {caseRecord.medicines.map((medicine, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {medicine.name} — {medicine.dosage}
                  </p>
                  <p className="text-sm text-muted">{medicine.instructions}</p>
                </div>
                <Link
                  href={`/patient/medicines?name=${encodeURIComponent(medicine.name)}`}
                  className="shrink-0 rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
                >
                  {t("findInPharmacies")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {caseRecord.doctorId && (
        <Link
          href={`/patient/doctors/${caseRecord.doctorId}?caseId=${caseRecord.id}`}
          className="text-center text-sm font-medium text-primary"
        >
          {t("bookWithDoctor")}
        </Link>
      )}
    </div>
  );
}

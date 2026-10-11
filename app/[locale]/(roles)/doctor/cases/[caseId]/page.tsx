import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CaseEditor } from "@/components/doctor/CaseEditor";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApiError } from "@/lib/api/client";
import { getCase } from "@/lib/api/cases";

export const instant = false;

export default async function DoctorCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const t = await getTranslations("doctor");
  const tPatient = await getTranslations("patient");

  let caseRecord;
  try {
    caseRecord = await getCase(caseId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title={tPatient("columns.symptoms")} subtitle={caseRecord.patientId} />
      <Card className="flex flex-col gap-3 p-6">
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
      </Card>
      <Card className="p-6">
        <CaseEditor
          caseRecord={caseRecord}
          labels={{
            notesLabel: t("caseNotesEditLabel"),
            medicineName: t("medicineNameLabel"),
            dosage: t("dosageLabel"),
            instructions: t("instructionsLabel"),
            addMedicine: t("addMedicine"),
            saveNotes: t("saveNotes"),
            saved: t("changesSaved"),
          }}
        />
      </Card>
    </div>
  );
}

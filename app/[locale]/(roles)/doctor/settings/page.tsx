import { getTranslations } from "next-intl/server";
import { AvailabilityForm } from "@/components/doctor/AvailabilityForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDoctor } from "@/lib/api/doctors";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function DoctorSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  const t = await getTranslations("doctor");
  const doctor = await getDoctor(session!.doctorId!);

  const formatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
  // 2023-01-01 was a Sunday — used only as a reference date to generate localized weekday names.
  const dayLabels = Array.from({ length: 7 }, (_, i) =>
    formatter.format(new Date(Date.UTC(2023, 0, 1 + i)))
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader title={t("availabilityTitle")} />
      <Card className="p-6">
        <AvailabilityForm
          doctor={doctor}
          dayLabels={dayLabels}
          labels={{
            feeLabel: t("feeLabel"),
            weeklyAvailabilityLabel: t("weeklyAvailabilityLabel"),
            saveChanges: t("saveChanges"),
            saved: t("changesSaved"),
          }}
        />
      </Card>
    </div>
  );
}

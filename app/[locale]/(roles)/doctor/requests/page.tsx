import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestsTable } from "@/components/doctor/RequestsTable";
import { listCases } from "@/lib/api/cases";
import { searchFacilities } from "@/lib/api/search";

export const instant = false;

export default async function DoctorRequestsPage() {
  const t = await getTranslations("doctor");

  const [submitted, hospitals, clinics] = await Promise.all([
    listCases({ status: "submitted", pageSize: 50 }),
    searchFacilities({ type: "hospital", pageSize: 20 }),
    searchFacilities({ type: "clinic", pageSize: 20 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("incomingRequestsTitle")} subtitle={t("incomingRequestsSubtitle")} />
      <Card>
        <RequestsTable
          cases={submitted.data}
          facilities={[...hospitals.data, ...clinics.data]}
          labels={{
            accept: t("accept"),
            decline: t("decline"),
            refer: t("refer"),
            referTitle: t("referTitle"),
            referConfirm: t("referConfirm"),
            confirmAcceptTitle: t("confirmAcceptTitle"),
            confirmAcceptBody: t("confirmAcceptBody"),
            confirmDeclineTitle: t("confirmDeclineTitle"),
            confirmDeclineBody: t("confirmDeclineBody"),
          }}
        />
      </Card>
    </div>
  );
}

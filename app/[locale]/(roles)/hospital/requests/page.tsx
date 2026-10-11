import { getTranslations } from "next-intl/server";
import { ReferredCasesTable } from "@/components/hospital/ReferredCasesTable";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { listCases } from "@/lib/api/cases";

export const instant = false;

export default async function HospitalRequestsPage() {
  const t = await getTranslations("hospital");
  const { data } = await listCases({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("requestsTitle")} subtitle={t("requestsSubtitle")} />
      <Card>
        <ReferredCasesTable cases={data} acceptLabel={t("markAccepted")} />
      </Card>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { ApprovalsTable } from "@/components/admin/ApprovalsTable";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { listRegistrations } from "@/lib/api/registrations";

export const instant = false;

export default async function AdminApprovalsPage() {
  const t = await getTranslations("admin");
  const { data: registrations } = await listRegistrations("pending");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("approvalsTitle")} subtitle={t("approvalsSubtitle")} />
      <Card>
        <ApprovalsTable
          registrations={registrations}
          labels={{
            nameHeader: t("columns.name"),
            kindHeader: t("columns.kind"),
            phoneHeader: t("columns.phone"),
            submittedHeader: t("columns.submitted"),
            approve: t("approve"),
            reject: t("reject"),
            viewLicense: t("viewLicense"),
            noApprovals: t("noApprovals"),
          }}
        />
      </Card>
    </div>
  );
}

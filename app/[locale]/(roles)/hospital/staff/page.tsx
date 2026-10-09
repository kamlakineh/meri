import { getTranslations } from "next-intl/server";
import { StaffManager } from "@/components/hospital/StaffManager";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { listStaff } from "@/lib/api/facilities";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function HospitalStaffPage() {
  const session = await getSession();
  const t = await getTranslations("hospital");
  const { data: staff } = await listStaff(session!.facilityId!);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("staffTitle")} />
      <Card className="p-6">
        <StaffManager
          facilityId={session!.facilityId!}
          staff={staff}
          labels={{
            addStaffButton: t("addStaffButton"),
            nameLabel: t("staffNameLabel"),
            specialtyLabel: t("staffSpecialtyLabel"),
            feeLabel: t("staffFeeLabel"),
            removeAction: t("removeAction"),
            noStaff: t("noStaff"),
          }}
        />
      </Card>
    </div>
  );
}

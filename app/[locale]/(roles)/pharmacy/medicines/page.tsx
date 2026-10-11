import { getTranslations } from "next-intl/server";
import { MedicinesManager } from "@/components/pharmacy/MedicinesManager";
import { PageHeader } from "@/components/layout/PageHeader";
import { listMedicines } from "@/lib/api/pharmacyMedicines";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function PharmacyMedicinesPage() {
  const session = await getSession();
  const t = await getTranslations("pharmacy");
  const { data: medicines } = await listMedicines(session!.facilityId!);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("medicinesTitle")} />
      <MedicinesManager
        facilityId={session!.facilityId!}
        medicines={medicines}
        labels={{
          addMedicineButton: t("addMedicineButton"),
          importButton: t("importButton"),
          nameLabel: t("nameLabel"),
          strengthLabel: t("strengthLabel"),
          formLabel: t("formLabel"),
          priceLabel: t("priceLabel"),
          quantityLabel: t("quantityLabel"),
          lowStockBadge: t("lowStockBadge"),
          outOfStockBadge: t("outOfStockBadge"),
          deleteAction: t("deleteAction"),
          noMedicines: t("noMedicines"),
        }}
      />
    </div>
  );
}

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { MedicinesSearch } from "@/components/patient/MedicinesSearch";

export const instant = false;

export default async function MedicinesPage() {
  const t = await getTranslations("patient");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("medicineSearchTitle")} />
      <Suspense fallback={null}>
        <MedicinesSearch />
      </Suspense>
    </div>
  );
}

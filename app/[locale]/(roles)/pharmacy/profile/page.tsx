import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/facility/ProfileForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getFacility } from "@/lib/api/search";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function PharmacyProfilePage() {
  const session = await getSession();
  const t = await getTranslations("hospital");
  const facility = await getFacility(session!.facilityId!);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title={t("profileTitle")} />
      <Card className="p-6">
        <ProfileForm
          facility={facility}
          showSpecialtiesAndDepartments={false}
          labels={{
            nameLabel: t("nameLabel"),
            addressLabel: t("addressLabel"),
            phoneLabel: t("phoneLabel"),
            locationLabel: t("locationLabel"),
            hoursEditorLabel: t("hoursEditorLabel"),
            hoursDayPlaceholder: t("hoursDayPlaceholder"),
            hoursOpenPlaceholder: t("hoursOpenPlaceholder"),
            hoursClosePlaceholder: t("hoursClosePlaceholder"),
            addHoursRow: t("addHoursRow"),
            servicesCsvLabel: t("servicesCsvLabel"),
            specialtiesCsvLabel: t("specialtiesCsvLabel"),
            departmentsCsvLabel: t("departmentsCsvLabel"),
            photoLabel: t("photoLabel"),
            saveProfile: t("saveProfile"),
            saved: t("profileSaved"),
          }}
        />
      </Card>
    </div>
  );
}

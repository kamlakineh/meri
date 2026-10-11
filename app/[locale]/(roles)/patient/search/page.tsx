import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { FacilityMapLoader } from "@/components/map/FacilityMapLoader";
import { FacilityCard } from "@/components/patient/FacilityCard";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { searchFacilities } from "@/lib/api/search";
import type { FacilityType } from "@/lib/api/types";

export const instant = false;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = typeof sp.query === "string" ? sp.query : "";
  const type =
    typeof sp.type === "string" && sp.type ? (sp.type as FacilityType) : undefined;
  const openNow = sp.openNow === "true";
  const sort = (typeof sp.sort === "string" ? sp.sort : "distance") as
    | "distance"
    | "rating"
    | "price";

  const t = await getTranslations("patient");

  const results = await searchFacilities({
    query: query || undefined,
    type,
    openNow: openNow || undefined,
    sort,
    pageSize: 30,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("searchTitle")} subtitle={t("searchSubtitle")} />

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
      >
        <div className="min-w-[200px] flex-1">
          <Input name="query" defaultValue={query} placeholder={t("searchPlaceholder")} />
        </div>
        <Select name="type" defaultValue={type ?? ""} className="w-auto">
          <option value="">{t("filterAllTypes")}</option>
          <option value="hospital">{t("filterHospital")}</option>
          <option value="clinic">{t("filterClinic")}</option>
          <option value="pharmacy">{t("filterPharmacy")}</option>
        </Select>
        <Select name="sort" defaultValue={sort} className="w-auto">
          <option value="distance">{t("sortDistance")}</option>
          <option value="rating">{t("sortRating")}</option>
          <option value="price">{t("sortPrice")}</option>
        </Select>
        <Checkbox
          name="openNow"
          value="true"
          defaultChecked={openNow}
          label={t("filterOpenNow")}
        />
        <Button type="submit">{t("searchButton")}</Button>
      </form>

      <FacilityMapLoader facilities={results.data} />

      {results.data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.data.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              openNowLabel={t("openNowBadge")}
              closedLabel={t("closedBadge")}
              viewProfileLabel={t("viewProfile")}
              directionsLabel={t("directions")}
              reviewsLabel={t.raw("reviewsCount")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

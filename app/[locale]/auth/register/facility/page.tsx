import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { registerAction } from "@/lib/actions/registration";

export const instant = false;

export default async function RegisterFacilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  const t = await getTranslations("register");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <Card className="p-6">
        <h1 className="text-xl font-semibold text-foreground">{t("facilityTitle")}</h1>
        <p className="mt-1 text-sm text-muted">{t("facilitySubtitle")}</p>
        <form action={registerAction} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="kind" value="facility" />
          <input type="hidden" name="locale" value={locale} />
          <FormField label={t("facilityTypeLabel")} htmlFor="facilityType" required>
            <Select
              id="facilityType"
              name="facilityType"
              defaultValue={type === "pharmacy" ? "pharmacy" : type === "clinic" ? "clinic" : "hospital"}
              required
            >
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="pharmacy">Pharmacy</option>
            </Select>
          </FormField>
          <FormField label={t("facilityNameLabel")} htmlFor="name" required>
            <Input id="name" name="name" required />
          </FormField>
          <FormField label={t("phoneLabel")} htmlFor="phone" required>
            <Input id="phone" name="phone" type="tel" required />
          </FormField>
          <FormField label={t("licenseLabel")} htmlFor="license" required>
            <input
              id="license"
              name="license"
              type="file"
              accept="image/*,.pdf"
              required
              className="text-sm text-foreground"
            />
          </FormField>
          <Button type="submit">{t("submit")}</Button>
        </form>
      </Card>
    </div>
  );
}

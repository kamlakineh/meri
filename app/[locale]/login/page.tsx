import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleCard } from "@/components/layout/RoleCard";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { listSeedUsers } from "@/lib/api/devUsers";
import type { Role } from "@/lib/api/types";

export const instant = false;

const ROLE_ORDER: Role[] = ["patient", "doctor", "hospital", "pharmacy", "admin"];

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  const tRegister = await getTranslations("register");
  const { data: users } = await listSeedUsers();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Link href="/auth/phone">
            <Button variant="secondary">{t("phoneSignIn")}</Button>
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {ROLE_ORDER.flatMap((role) =>
          users
            .filter((user) => user.role === role)
            .map((user) => (
              <RoleCard
                key={user.id}
                user={user}
                locale={locale}
                roleLabel={t(`roles.${role}`)}
                continueLabel={t("continueAs", { name: user.name })}
              />
            ))
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <Link href="/auth/register/doctor" className="font-medium text-primary">
          {tRegister("registerDoctorLink")}
        </Link>
        <Link href="/auth/register/facility?type=hospital" className="font-medium text-primary">
          {tRegister("registerFacilityLink")}
        </Link>
        <Link href="/auth/register/facility?type=pharmacy" className="font-medium text-primary">
          {tRegister("registerPharmacyLink")}
        </Link>
      </div>
    </div>
  );
}

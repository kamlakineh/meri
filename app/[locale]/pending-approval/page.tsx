import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PendingApproval } from "@/components/auth/PendingApproval";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { getMe } from "@/lib/api/auth";
import { getSession } from "@/lib/session";

export const instant = false;

/**
 * A sibling route (not nested under a gated layout) is required here: a
 * layout can't block its own {children} by conditionally omitting them from
 * its returned JSX — the child page segment is still rendered and its data
 * shipped in the RSC payload regardless, since `children` arrives
 * pre-resolved. Only `redirect()` (thrown from the layout, see
 * app/[locale]/(roles)/{doctor,hospital,pharmacy}/layout.tsx) actually
 * aborts rendering of the gated subtree.
 */
export default async function PendingApprovalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const [tRegister, tCommon, { user }] = await Promise.all([
    getTranslations("register"),
    getTranslations("common"),
    getMe(),
  ]);

  if (!user.registrationStatus || user.registrationStatus === "approved") {
    redirect(`/${locale}/${session.role}`);
  }

  return (
    <div className="relative">
      <div className="absolute top-6 right-6">
        <LogoutButton locale={locale} label={tCommon("logout")} />
      </div>
      <PendingApproval
        status={user.registrationStatus}
        pendingTitle={tRegister("pendingTitle")}
        pendingBody={tRegister("pendingBody")}
        rejectedTitle={tRegister("rejectedTitle")}
        rejectedBody={tRegister("rejectedBody")}
      />
    </div>
  );
}

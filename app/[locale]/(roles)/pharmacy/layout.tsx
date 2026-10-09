import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavGroup } from "@/components/layout/Sidebar";
import { getMe } from "@/lib/api/auth";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function PharmacyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || session.role !== "pharmacy") {
    redirect(`/${locale}/login`);
  }

  const [tCommon, tNav, tAuth, { user }] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav.pharmacy"),
    getTranslations("auth"),
    getMe(),
  ]);

  if (user.registrationStatus && user.registrationStatus !== "approved") {
    redirect(`/${locale}/pending-approval`);
  }

  const groups: NavGroup[] = [
    {
      items: [
        { key: "home", label: tNav("home"), href: "/pharmacy", icon: "LayoutDashboard" },
      ],
    },
    {
      title: tCommon("workspace"),
      items: [
        {
          key: "medicines",
          label: tNav("medicines"),
          href: "/pharmacy/medicines",
          icon: "Pill",
        },
        { key: "orders", label: tNav("orders"), href: "/pharmacy/orders", icon: "ShoppingCart" },
        { key: "chat", label: tNav("chat"), href: "/pharmacy/chat", icon: "MessageCircle" },
        {
          key: "facility",
          label: tNav("facility"),
          href: "/pharmacy/profile",
          icon: "Building2",
        },
      ],
    },
  ];

  return (
    <DashboardShell
      appName={tCommon("appName")}
      groups={groups}
      userName={session.name}
      roleLabel={tAuth("roles.pharmacy")}
      searchPlaceholder={tCommon("search")}
      locale={locale}
      logoutLabel={tCommon("logout")}
      themeLabel={tCommon("theme")}
    >
      {children}
    </DashboardShell>
  );
}

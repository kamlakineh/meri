import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavGroup } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const [tCommon, tAdmin] = await Promise.all([
    getTranslations("common"),
    getTranslations("admin"),
  ]);

  const groups: NavGroup[] = [
    {
      items: [
        {
          key: "approvals",
          label: tAdmin("approvalsTitle"),
          href: "/admin",
          icon: "UserCheck",
        },
        {
          key: "articles",
          label: tAdmin("articlesTitle"),
          href: "/admin/articles",
          icon: "Newspaper",
        },
      ],
    },
  ];

  return (
    <DashboardShell
      appName={tCommon("appName")}
      groups={groups}
      userName={session.name}
      roleLabel={tAdmin("welcome")}
      searchPlaceholder={tCommon("search")}
      locale={locale}
      logoutLabel={tCommon("logout")}
      themeLabel={tCommon("theme")}
    >
      {children}
    </DashboardShell>
  );
}

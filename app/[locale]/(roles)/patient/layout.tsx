import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavGroup } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || session.role !== "patient") {
    redirect(`/${locale}/login`);
  }

  const [tCommon, tNav, tAuth] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav.patient"),
    getTranslations("auth"),
  ]);

  const groups: NavGroup[] = [
    {
      items: [
        { key: "home", label: tNav("home"), href: "/patient", icon: "LayoutDashboard" },
      ],
    },
    {
      title: tCommon("workspace"),
      items: [
        { key: "search", label: tNav("search"), href: "/patient/search", icon: "Search" },
        {
          key: "cases",
          label: tNav("cases"),
          href: "/patient/history?tab=cases",
          icon: "ClipboardList",
        },
        {
          key: "appointments",
          label: tNav("appointments"),
          href: "/patient/history?tab=appointments",
          icon: "CalendarCheck",
        },
        {
          key: "chat",
          label: tNav("chat"),
          href: "/patient/chat",
          icon: "MessageCircle",
        },
        {
          key: "history",
          label: tNav("history"),
          href: "/patient/history",
          icon: "History",
        },
      ],
    },
  ];

  return (
    <DashboardShell
      appName={tCommon("appName")}
      groups={groups}
      userName={session.name}
      roleLabel={tAuth("roles.patient")}
      searchPlaceholder={tCommon("search")}
      locale={locale}
      logoutLabel={tCommon("logout")}
      themeLabel={tCommon("theme")}
    >
      {children}
    </DashboardShell>
  );
}

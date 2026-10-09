import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavGroup } from "@/components/layout/Sidebar";
import { getMe } from "@/lib/api/auth";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function DoctorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    redirect(`/${locale}/login`);
  }

  const [tCommon, tNav, tAuth, { user }] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav.doctor"),
    getTranslations("auth"),
    getMe(),
  ]);

  if (user.registrationStatus && user.registrationStatus !== "approved") {
    redirect(`/${locale}/pending-approval`);
  }

  const groups: NavGroup[] = [
    {
      items: [
        { key: "home", label: tNav("home"), href: "/doctor", icon: "LayoutDashboard" },
      ],
    },
    {
      title: tCommon("workspace"),
      items: [
        { key: "requests", label: tNav("requests"), href: "/doctor/requests", icon: "Inbox" },
        {
          key: "appointments",
          label: tNav("appointments"),
          href: "/doctor/appointments",
          icon: "CalendarCheck",
        },
        { key: "chat", label: tNav("chat"), href: "/doctor/chat", icon: "MessageCircle" },
        { key: "articles", label: tNav("articles"), href: "/doctor/articles", icon: "Newspaper" },
        { key: "earnings", label: tNav("earnings"), href: "/doctor/earnings", icon: "Wallet" },
        {
          key: "settings",
          label: tNav("settings"),
          href: "/doctor/settings",
          icon: "Settings",
        },
      ],
    },
  ];

  return (
    <DashboardShell
      appName={tCommon("appName")}
      groups={groups}
      userName={session.name}
      roleLabel={tAuth("roles.doctor")}
      searchPlaceholder={tCommon("search")}
      locale={locale}
      logoutLabel={tCommon("logout")}
      themeLabel={tCommon("theme")}
    >
      {children}
    </DashboardShell>
  );
}

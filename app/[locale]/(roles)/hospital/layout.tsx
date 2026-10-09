import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavGroup } from "@/components/layout/Sidebar";
import { getMe } from "@/lib/api/auth";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function HospitalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || session.role !== "hospital") {
    redirect(`/${locale}/login`);
  }

  const [tCommon, tNav, tAuth, { user }] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav.hospital"),
    getTranslations("auth"),
    getMe(),
  ]);

  if (user.registrationStatus && user.registrationStatus !== "approved") {
    redirect(`/${locale}/pending-approval`);
  }

  const groups: NavGroup[] = [
    {
      items: [
        { key: "home", label: tNav("home"), href: "/hospital", icon: "LayoutDashboard" },
      ],
    },
    {
      title: tCommon("workspace"),
      items: [
        { key: "requests", label: tNav("requests"), href: "/hospital/requests", icon: "Inbox" },
        {
          key: "appointments",
          label: tNav("appointments"),
          href: "/hospital/appointments",
          icon: "CalendarCheck",
        },
        { key: "staff", label: tNav("staff"), href: "/hospital/staff", icon: "Users" },
        { key: "chat", label: tNav("chat"), href: "/hospital/chat", icon: "MessageCircle" },
        {
          key: "profile",
          label: tNav("profile"),
          href: "/hospital/profile",
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
      roleLabel={tAuth("roles.hospital")}
      searchPlaceholder={tCommon("search")}
      locale={locale}
      logoutLabel={tCommon("logout")}
      themeLabel={tCommon("theme")}
    >
      {children}
    </DashboardShell>
  );
}

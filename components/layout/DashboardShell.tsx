import type { ReactNode } from "react";
import { Sidebar, type NavGroup } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({
  appName,
  groups,
  userName,
  roleLabel,
  searchPlaceholder,
  locale,
  logoutLabel,
  themeLabel,
  children,
}: {
  appName: string;
  groups: NavGroup[];
  userName: string;
  roleLabel: string;
  searchPlaceholder: string;
  locale: string;
  logoutLabel: string;
  themeLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar appName={appName} groups={groups} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          userName={userName}
          roleLabel={roleLabel}
          searchPlaceholder={searchPlaceholder}
          locale={locale}
          logoutLabel={logoutLabel}
          themeLabel={themeLabel}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

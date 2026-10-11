import type { ReactNode } from "react";
import { IncomingCallBanner } from "@/components/call/IncomingCallBanner";
import { Sidebar, type NavGroup } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({
  appName,
  groups,
  userId,
  userName,
  roleLabel,
  searchPlaceholder,
  locale,
  logoutLabel,
  themeLabel,
  incomingAudioCallLabel,
  incomingVideoCallLabel,
  joinCallLabel,
  dismissCallLabel,
  children,
}: {
  appName: string;
  groups: NavGroup[];
  userId: string;
  userName: string;
  roleLabel: string;
  searchPlaceholder: string;
  locale: string;
  logoutLabel: string;
  themeLabel: string;
  incomingAudioCallLabel: string;
  incomingVideoCallLabel: string;
  joinCallLabel: string;
  dismissCallLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <IncomingCallBanner
        userId={userId}
        audioLabelTemplate={incomingAudioCallLabel}
        videoLabelTemplate={incomingVideoCallLabel}
        joinLabel={joinCallLabel}
        dismissLabel={dismissCallLabel}
      />
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] overflow-hidden bg-surface  md:min-h-[calc(100vh-2.5rem)]">
        <Sidebar
          appName={appName}
          groups={groups}
          locale={locale}
          logoutLabel={logoutLabel}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            userName={userName}
            roleLabel={roleLabel}
            searchPlaceholder={searchPlaceholder}
            themeLabel={themeLabel}
          />
          <main className="flex-1 overflow-y-auto bg-surface p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

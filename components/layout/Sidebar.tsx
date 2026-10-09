"use client";

import {
  Building2,
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  History,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Package,
  Pill,
  Search,
  Settings,
  ShoppingCart,
  Star,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Icons are resolved here, inside the Client Component, from a plain string
// name — React component references can't be passed as props from a Server
// Component (the layouts) across the client boundary.
const ICONS = {
  LayoutDashboard,
  Search,
  ClipboardList,
  CalendarCheck,
  MessageCircle,
  History,
  Inbox,
  Users,
  Building2,
  Newspaper,
  Wallet,
  Settings,
  Pill,
  ShoppingCart,
  Package,
  Star,
  UserCheck,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof ICONS;

export interface NavItem {
  key: string;
  label: string;
  href?: string;
  icon: NavIconName;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export function Sidebar({
  appName,
  groups,
}: {
  appName: string;
  groups: NavGroup[];
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold text-foreground">{appName}</span>
      </div>
      <nav className="flex flex-1 flex-col gap-6">
        {groups.map((group, groupIndex) => (
          <div key={group.title ?? groupIndex} className="flex flex-col gap-1">
            {group.title && (
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = item.href ? pathname === item.href : false;
              const classes = cn(
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : item.href
                    ? "text-foreground hover:bg-background"
                    : "cursor-not-allowed text-muted-foreground"
              );
              const content = (
                <>
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </>
              );
              return item.href ? (
                <Link key={item.key} href={item.href} className={classes}>
                  {content}
                </Link>
              ) : (
                <span key={item.key} className={classes} aria-disabled>
                  {content}
                </span>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

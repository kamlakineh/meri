import { Bell, Mail, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar({
  userName,
  roleLabel,
  searchPlaceholder,
  locale,
  logoutLabel,
  themeLabel,
}: {
  userName: string;
  roleLabel: string;
  searchPlaceholder: string;
  locale: string;
  logoutLabel: string;
  themeLabel: string;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="h-10 w-full max-w-sm rounded-[var(--radius-control)] border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <ThemeToggle label={themeLabel} />

      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted hover:bg-background"
      >
        <Bell className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        className="hidden h-10 w-10 items-center justify-center rounded-full border border-border text-muted hover:bg-background sm:flex"
      >
        <Mail className="h-[18px] w-[18px]" />
      </button>

      <LanguageSwitcher />

      <div className="flex items-center gap-3 border-l border-border pl-3">
        <div className="relative">
          <Avatar name={userName} />
          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" />
        </div>
        <div className="hidden text-sm sm:block">
          <p className="leading-tight font-medium text-foreground">{userName}</p>
          <p className="leading-tight text-muted-foreground">{roleLabel}</p>
        </div>
        <LogoutButton locale={locale} label={logoutLabel} />
      </div>
    </header>
  );
}

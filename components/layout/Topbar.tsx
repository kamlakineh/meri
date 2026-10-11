import { Bell, MessageSquare, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

function IconButton({
  children,
  label,
  dot,
}: {
  children: React.ReactNode;
  label: string;
  dot?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {children}
      {dot && (
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-danger" />
      )}
    </button>
  );
}

export function Topbar({
  userName,
  roleLabel,
  searchPlaceholder,
  themeLabel,
}: {
  userName: string;
  roleLabel: string;
  searchPlaceholder: string;
  themeLabel: string;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-[var(--radius-control)] border border-border bg-surface-muted pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle label={themeLabel} />
        <IconButton label="Messages" dot>
          <MessageSquare className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label="Notifications" dot>
          <Bell className="h-[18px] w-[18px]" />
        </IconButton>

        <LanguageSwitcher />

        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <Avatar name={userName} size={40} />
          <div className="hidden text-sm sm:block">
            <p className="leading-tight font-semibold text-foreground">{userName}</p>
            <p className="leading-tight text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

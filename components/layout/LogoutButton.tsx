import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/session";

export function LogoutButton({
  locale,
  label,
}: {
  locale: string;
  label: string;
}) {
  return (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        {label}
      </button>
    </form>
  );
}

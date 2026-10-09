import { Button } from "@/components/ui/Button";
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
      <Button type="submit" variant="ghost" size="sm">
        {label}
      </Button>
    </form>
  );
}

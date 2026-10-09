import { Button } from "@/components/ui/Button";
import { loginAs } from "@/lib/actions/session";
import type { SeedUser } from "@/lib/api/types";

export function RoleCard({
  user,
  locale,
  roleLabel,
  continueLabel,
}: {
  user: SeedUser;
  locale: string;
  roleLabel: string;
  continueLabel: string;
}) {
  return (
    <form
      action={loginAs}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5"
    >
      <input type="hidden" name="role" value={user.role} />
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="name" value={user.name} />
      <input type="hidden" name="locale" value={locale} />
      {user.facilityId && (
        <input type="hidden" name="facilityId" value={user.facilityId} />
      )}
      {user.doctorId && (
        <input type="hidden" name="doctorId" value={user.doctorId} />
      )}
      <div>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {roleLabel}
        </p>
        <p className="mt-1 font-semibold text-foreground">{user.name}</p>
      </div>
      <Button type="submit" className="mt-1 w-full">
        {continueLabel}
      </Button>
    </form>
  );
}

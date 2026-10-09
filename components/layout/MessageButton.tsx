import { Button } from "@/components/ui/Button";
import { startChatAction } from "@/lib/actions/chat";
import type { Role } from "@/lib/api/types";

export function MessageButton({
  participantUserId,
  participantRole,
  locale,
  label,
  className,
}: {
  participantUserId: string;
  participantRole: Role;
  locale: string;
  label: string;
  className?: string;
}) {
  return (
    <form action={startChatAction}>
      <input type="hidden" name="participantUserId" value={participantUserId} />
      <input type="hidden" name="participantRole" value={participantRole} />
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" variant="secondary" className={className}>
        {label}
      </Button>
    </form>
  );
}

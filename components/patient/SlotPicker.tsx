import { bookAppointmentAction } from "@/lib/actions/appointments";
import type { TimeSlot } from "@/lib/api/types";

export function SlotPicker({
  doctorId,
  slots,
  locale,
  caseId,
  noSlotsLabel,
}: {
  doctorId: string;
  slots: TimeSlot[];
  locale: string;
  caseId?: string;
  noSlotsLabel: string;
}) {
  if (slots.length === 0) {
    return <p className="text-sm text-muted">{noSlotsLabel}</p>;
  }

  const byDay = new Map<string, TimeSlot[]>();
  for (const slot of slots) {
    const day = new Date(slot.start).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    byDay.set(day, [...(byDay.get(day) ?? []), slot]);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...byDay.entries()].map(([day, daySlots]) => (
        <div key={day}>
          <p className="mb-2 text-sm font-medium text-foreground">{day}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <form key={slot.start} action={bookAppointmentAction}>
                <input type="hidden" name="doctorId" value={doctorId} />
                <input type="hidden" name="start" value={slot.start} />
                <input type="hidden" name="end" value={slot.end} />
                <input type="hidden" name="locale" value={locale} />
                {caseId && <input type="hidden" name="caseId" value={caseId} />}
                <button
                  type="submit"
                  className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary hover:bg-primary-soft hover:text-primary"
                >
                  {new Date(slot.start).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </button>
              </form>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

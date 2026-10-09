"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Doctor, WeeklyAvailabilitySlot } from "@/lib/api/types";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface DayWindow {
  enabled: boolean;
  start: string;
  end: string;
}

export function AvailabilityForm({
  doctor,
  dayLabels,
  labels,
}: {
  doctor: Doctor;
  /** Index 0=Sunday..6=Saturday, matching Date#getDay(). */
  dayLabels: string[];
  labels: {
    feeLabel: string;
    weeklyAvailabilityLabel: string;
    saveChanges: string;
    saved: string;
  };
}) {
  const [fee, setFee] = useState(doctor.consultationFee);
  const [windows, setWindows] = useState<Record<number, DayWindow>>(() => {
    const map: Record<number, DayWindow> = {};
    for (const day of DAY_ORDER) map[day] = { enabled: false, start: "09:00", end: "17:00" };
    for (const slot of doctor.weeklyAvailability) {
      map[slot.day] = { enabled: true, start: slot.start, end: slot.end };
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateDay(day: number, patch: Partial<DayWindow>) {
    setWindows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const weeklyAvailability: WeeklyAvailabilitySlot[] = DAY_ORDER.filter(
      (day) => windows[day].enabled
    ).map((day) => ({ day, start: windows[day].start, end: windows[day].end }));
    try {
      await clientApiFetch(`/doctors/${doctor.id}`, {
        method: "PATCH",
        body: { consultationFee: fee, weeklyAvailability },
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xs">
        <label className="mb-1 block text-sm font-medium text-foreground">
          {labels.feeLabel}
        </label>
        <Input
          type="number"
          min={0}
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          {labels.weeklyAvailabilityLabel}
        </p>
        <div className="flex flex-col gap-2">
          {DAY_ORDER.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <Checkbox
                label={dayLabels[day]}
                checked={windows[day].enabled}
                onChange={(e) => updateDay(day, { enabled: e.target.checked })}
              />
              <input
                type="time"
                value={windows[day].start}
                disabled={!windows[day].enabled}
                onChange={(e) => updateDay(day, { start: e.target.value })}
                className="h-9 rounded-[var(--radius-control)] border border-border bg-background px-2 text-sm text-foreground disabled:opacity-50"
              />
              <span className="text-muted">–</span>
              <input
                type="time"
                value={windows[day].end}
                disabled={!windows[day].enabled}
                onChange={(e) => updateDay(day, { end: e.target.value })}
                className="h-9 rounded-[var(--radius-control)] border border-border bg-background px-2 text-sm text-foreground disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} isLoading={saving}>
          {labels.saveChanges}
        </Button>
        {saved && <span className="text-sm text-success">{labels.saved}</span>}
      </div>
    </div>
  );
}

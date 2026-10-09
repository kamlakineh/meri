"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface CalendarEvent {
  /** ISO date string, e.g. an appointment's `start`. */
  date: string;
  tone: "primary" | "accent" | "warning";
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarWidget({
  title,
  events,
  legend,
}: {
  title: string;
  events: CalendarEvent[];
  legend: { label: string; tone: CalendarEvent["tone"] }[];
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const toneDot: Record<CalendarEvent["tone"], string> = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
  };

  const eventsByDay = new Map<number, CalendarEvent["tone"][]>();
  for (const event of events) {
    const d = new Date(event.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), event.tone]);
    }
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-full border border-border p-1 text-muted hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-full border border-border p-1 text-muted hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="py-1">
            {label}
          </div>
        ))}
        {cells.map((day, i) => {
          const isToday =
            day !== null &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const dots = day !== null ? eventsByDay.get(day) : undefined;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-1.5">
              {day !== null && (
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}
                >
                  {day}
                </span>
              )}
              <span className="flex h-1.5 gap-0.5">
                {dots?.slice(0, 3).map((tone, j) => (
                  <span key={j} className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
                ))}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", toneDot[item.tone])} />
            {item.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

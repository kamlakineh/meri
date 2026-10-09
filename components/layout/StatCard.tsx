import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: LucideIcon;
  /** Only pass this when there are two real, comparable numbers to derive it from. */
  trend?: { direction: "up" | "down"; label: string };
  tone?: "default" | "highlight";
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-5",
        tone === "highlight" && "border-transparent bg-primary text-primary-foreground"
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            "text-sm",
            tone === "highlight" ? "text-primary-foreground/80" : "text-muted"
          )}
        >
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              tone === "highlight"
                ? "bg-white/15 text-primary-foreground"
                : "bg-primary-soft text-primary"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <p className="text-3xl font-semibold">{value}</p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              tone === "highlight"
                ? "bg-white/15 text-primary-foreground"
                : trend.direction === "up"
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.label}
          </span>
        )}
      </div>

      {description && (
        <p
          className={cn(
            "text-xs leading-relaxed",
            tone === "highlight" ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </Card>
  );
}

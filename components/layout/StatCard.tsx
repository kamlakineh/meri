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
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border",
              tone === "highlight"
                ? "border-primary-soft bg-primary-soft text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>

      {(trend || description) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                trend.direction === "up"
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.label}
            </span>
          )}
          {description && <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </div>
      )}
    </Card>
  );
}

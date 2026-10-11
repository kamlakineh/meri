"use client";

import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[var(--radius-control)] border bg-surface px-3 text-sm text-foreground outline-none transition-colors",
        "focus:border-primary focus:ring-2 focus:ring-primary-soft",
        invalid ? "border-danger" : "border-border",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

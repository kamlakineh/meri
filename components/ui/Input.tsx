"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-[var(--radius-control)] border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors",
        "focus:border-primary focus:ring-2 focus:ring-primary-soft",
        invalid ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  );
}

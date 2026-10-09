"use client";

import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors",
        "focus:border-primary focus:ring-2 focus:ring-primary-soft",
        invalid ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  );
}

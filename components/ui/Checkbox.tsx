"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;
  return (
    <label
      htmlFor={inputId}
      className="inline-flex items-center gap-2 text-sm text-foreground"
    >
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary-soft",
          className
        )}
        {...props}
      />
      {label}
    </label>
  );
}

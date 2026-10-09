"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // resolvedTheme only reflects the real theme after mount (it reads
  // localStorage/system preference client-side), so the server and the
  // pre-hydration client render must both show the same "light" state —
  // otherwise React logs a hydration mismatch the moment the real value
  // differs from the SSR guess.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required one-time mount flag; this is the client/server render split the hydration fix above depends on, not a fetch-on-mount antipattern
    setMounted(true);
  }, []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-border bg-background px-1 transition-colors"
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full bg-surface shadow-sm transition-transform",
          isDark ? "translate-x-7" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-warning" />
        )}
      </span>
    </button>
  );
}

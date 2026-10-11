"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
    </button>
  );
}

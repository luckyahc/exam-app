"use client";

import { useTheme } from "@/lib/theme/useTheme";
import type { ThemeMode } from "@/lib/theme/constants";

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "system", label: "시스템" },
  { mode: "light", label: "라이트" },
  { mode: "dark", label: "다크" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="테마 선택"
      className="inline-flex rounded-full border border-border bg-surface p-1 text-sm"
    >
      {OPTIONS.map(({ mode, label }) => {
        const active = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(mode)}
            className={
              "rounded-full px-2.5 py-1 transition-colors sm:px-3 " +
              (active ? "bg-primary text-background" : "text-muted hover:text-foreground")
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

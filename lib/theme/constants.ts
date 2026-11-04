export type ThemeMode = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const THEME_MODES: ThemeMode[] = ["system", "light", "dark"];

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function resolveIsDark(mode: ThemeMode, prefersDark: boolean): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return prefersDark;
}

/** theme-color 메타(주소창 색) = 배경 토큰 paper(globals.css) */
export const THEME_COLOR = { light: "#ffffff", dark: "#111111" } as const;

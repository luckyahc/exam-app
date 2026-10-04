import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, setThemeMode, subscribe } from "./themeStore";
import type { ThemeMode } from "./constants";

export function useTheme(): { theme: ThemeMode; setTheme: (mode: ThemeMode) => void } {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, setTheme: setThemeMode };
}

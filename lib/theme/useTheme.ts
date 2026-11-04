import { useSyncExternalStore } from "react";
import {
  getIsDarkServerSnapshot,
  getIsDarkSnapshot,
  getServerSnapshot,
  getSnapshot,
  setThemeMode,
  subscribe,
} from "./themeStore";
import type { ThemeMode } from "./constants";

export function useTheme(): { theme: ThemeMode; setTheme: (mode: ThemeMode) => void } {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, setTheme: setThemeMode };
}

/**
 * 다크 모드 켜짐/꺼짐 스위치용. 처음에는 시스템 설정을 따르고(저장값 "system"),
 * 한 번 바꾸면 "light"/"dark"가 localStorage에 저장되어 시스템 설정보다 우선한다.
 */
export function useDarkMode(): { isDark: boolean; setDark: (dark: boolean) => void } {
  const isDark = useSyncExternalStore(subscribe, getIsDarkSnapshot, getIsDarkServerSnapshot);
  return { isDark, setDark: (dark) => setThemeMode(dark ? "dark" : "light") };
}

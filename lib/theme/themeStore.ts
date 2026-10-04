import { safeGet, safeSet } from "@/lib/storage/safeStorage";
import { THEME_STORAGE_KEY, isThemeMode, resolveIsDark, type ThemeMode } from "./constants";

/**
 * React 외부에 사는 작은 테마 스토어. `useSyncExternalStore`로 구독한다.
 * (컴포넌트 effect 안에서 setState를 직접 호출하는 대신, React가 공식적으로
 * 권장하는 "외부 시스템 구독" 패턴을 사용해 cascading render 경고를 피한다.)
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let current: ThemeMode = "system";
let mediaQuery: MediaQueryList | null = null;

function readStored(): ThemeMode {
  const stored = safeGet(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : "system";
}

function applyClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", resolveIsDark(mode, prefersDark));
}

function emit() {
  for (const listener of listeners) listener();
}

function handleMediaChange() {
  if (current === "system") {
    applyClass("system");
    emit();
  }
}

export function getSnapshot(): ThemeMode {
  return current;
}

export function getServerSnapshot(): ThemeMode {
  return "system";
}

export function subscribe(listener: Listener): () => void {
  const isFirst = listeners.size === 0;
  listeners.add(listener);

  if (isFirst) {
    current = readStored();
    applyClass(current);
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleMediaChange);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && mediaQuery) {
      mediaQuery.removeEventListener("change", handleMediaChange);
      mediaQuery = null;
    }
  };
}

export function setThemeMode(mode: ThemeMode): void {
  current = mode;
  safeSet(THEME_STORAGE_KEY, mode);
  applyClass(mode);
  emit();
}

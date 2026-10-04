import { THEME_STORAGE_KEY } from "./constants";

/**
 * app/layout.tsx의 <head> 최상단에 그대로 주입되는 스크립트.
 * React 하이드레이션 전에 동기적으로 실행되어 다크모드 전환 시
 * 첫 페인트 깜빡임(FOUC)을 막는다. try/catch로 localStorage 접근을 감싼다.
 */
export function noFlashScript(): string {
  const key = JSON.stringify(THEME_STORAGE_KEY);
  return `(function(){
    try {
      var key = ${key};
      var stored = localStorage.getItem(key);
      var mode = stored === "light" || stored === "dark" ? stored : "system";
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark = mode === "dark" || (mode === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  })();`;
}

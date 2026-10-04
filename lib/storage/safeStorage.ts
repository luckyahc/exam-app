/**
 * localStorage는 사용자가 브라우저 설정으로 막아둘 수 있고, SSR/프리렌더링 중에는
 * `window` 자체가 없다. 이 모듈을 거치지 않고 localStorage를 직접 호출하지 말 것.
 * 호출하는 쪽에서도 `useEffect` 내부에서만 사용해야 한다(모듈 자체는 가드하지만,
 * 렌더링 중 호출은 SSR 프리렌더링 결과와 클라이언트 결과가 달라지는 hydration
 * mismatch를 일으킬 수 있다).
 */

/** window.localStorage 객체 자체. 차단·SSR이면 null (접근만으로 예외가 나는 브라우저가 있다). */
export function getBrowserStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function safeGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeGetJSON<T>(key: string): T | null {
  const raw = safeGet(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeSetJSON(key: string, value: unknown): boolean {
  try {
    return safeSet(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

// 실행 엔진 Worker의 네트워크 차단(Sprint 13). Worker는 엔진 파일(같은 출처 /engine/…)만 받을 수 있고,
// 사용자 코드가 실행되는 동안에는 그것도 막는다 — Python의 `js.fetch`·`pyodide.http.pyfetch`가 이 fetch를 쓴다.
// XMLHttpRequest·WebSocket·EventSource는 Worker 시작 때 아예 없앤다(`pyodide.http.open_url`은 XHR을 쓴다).

export const BLOCKED_GLOBALS = ["XMLHttpRequest", "WebSocket", "EventSource"];
export const NETWORK_BLOCKED_MESSAGE = "이 실행 환경에서는 네트워크에 접근할 수 없습니다";

/**
 * @param {typeof fetch} realFetch
 * @param {string} origin 이 Worker의 주소(location.href)
 * @param {() => boolean} isUserCodeRunning
 * @returns {typeof fetch}
 */
export function makeGuardedFetch(realFetch, origin, isUserCodeRunning) {
  const own = new URL(origin).origin;
  return (input, init) => {
    const raw = typeof input === "string" || input instanceof URL ? String(input) : input.url;
    const url = new URL(raw, origin);
    if (isUserCodeRunning() || url.origin !== own || !url.pathname.startsWith("/engine/")) {
      return Promise.reject(new TypeError(NETWORK_BLOCKED_MESSAGE));
    }
    return realFetch(input, init);
  };
}

/** 전역 객체에서 네트워크 생성자를 없앤다 @param {object} scope */
export function removeNetworkGlobals(scope) {
  for (const name of BLOCKED_GLOBALS) {
    try {
      Object.defineProperty(scope, name, { value: undefined, configurable: false, writable: false });
    } catch {
      /* 이미 없음 */
    }
  }
}

/**
 * 알고리즘 족보 정답 검증용 — 재귀·반복문 실행 횟수 세기 (강의 자료 2, Sprint 21).
 * 점근 표기 문항의 정답(Θ 등급)을 n을 두 배로 늘릴 때의 증가율로 확인한다.
 */

/** 하노이 탑(의도대로 원반 1개 이동을 1회로): 이동 횟수 = 2ⁿ − 1 */
export function hanoiMoves(n: number): number {
  return n === 0 ? 0 : 2 * hanoiMoves(n - 1) + 1;
}

/** 중복 재귀 피보나치 fib(n)의 호출 횟수 */
export function fibCalls(n: number): number {
  return n <= 1 ? 1 : 1 + fibCalls(n - 1) + fibCalls(n - 2);
}

/** M21-8 sample: 반복문 n번 + sample(n/2) 두 번 — 덧셈 횟수 */
export function sampleTwoCalls(n: number): number {
  return n <= 1 ? 0 : n + 2 * sampleTwoCalls(Math.floor(n / 2));
}

/** M21-17 sample: return n + 2 * sample(n/2) — 호출 횟수 */
export function sampleOneCall(n: number): number {
  return n <= 1 ? 1 : 1 + sampleOneCall(Math.floor(n / 2));
}

/** M21-10 matMul: for i=1..n, j=i..n, k=j..n — 가장 안쪽 문장 실행 횟수 */
export function matMulTriangular(n: number): number {
  let c = 0;
  for (let i = 1; i <= n; i++) for (let j = i; j <= n; j++) for (let k = j; k <= n; k++) c++;
  return c;
}

/** 유클리드 알고리즘의 재귀 호출 횟수 */
export function euclidCalls(a: number, b: number): number {
  return b === 0 ? 1 : 1 + euclidCalls(b, a % b);
}

/** 점화식 T(n) = Σ T(fᵢ(n)) + g(n) (n ≤ base이면 T = 1)를 값으로 계산 — 증가율 비교용 */
export function recurrence(n: number, parts: readonly ((n: number) => number)[], g: (n: number) => number, base = 1, memo = new Map<number, number>()): number {
  if (n <= base) return 1;
  const hit = memo.get(n);
  if (hit !== undefined) return hit;
  const v = parts.reduce((s, f) => s + recurrence(Math.floor(f(n)), parts, g, base, memo), 0) + g(n);
  memo.set(n, v);
  return v;
}

// ── 증가율 비교(족보 유형 생성 문항, 2026-10-16 — docs/jokbo/algorithm/pattern-analysis.md) ──
// 함수는 ln f를 x = log₂n의 함수로 준다(2ⁿ·n³ 같은 큰 값도 넘치지 않게). 두 지점 x1 < x2에서 ln(f/g)의 변화량이
// 0 근처면 같은 증가율(Θ), 음수면 f가 느리고 양수면 f가 빠르다. 로그 인수 하나의 차이도 x2 = 2·x1이면 ln 2 ≈ 0.69만큼 벌어진다.

export type LnFn = (x: number) => number;
export const GROWTH_EPS = 0.35;

/** n^p · (log₂n)^q · 2^(c·n) · coef 의 ln (x = log₂n) */
export const term =
  (p: number, q = 0, c = 0, coef = 1): LnFn =>
  (x) =>
    p * x * Math.LN2 + q * Math.log(x) + c * 2 ** x * Math.LN2 + Math.log(coef);

/** 여러 항의 합의 ln(가장 큰 항 기준 log-sum-exp) */
export const sum =
  (...ts: LnFn[]): LnFn =>
  (x) => {
    const v = ts.map((t) => t(x));
    const m = Math.max(...v);
    return m + Math.log(v.reduce((s, y) => s + Math.exp(y - m), 0));
  };

/** f와 g의 증가율 비교: -1 = f가 느림(f = o(g)), 0 = 같음(Θ), 1 = f가 빠름 */
export function compareGrowth(f: LnFn, g: LnFn, x1 = 64, x2 = 128): -1 | 0 | 1 {
  const d = f(x2) - g(x2) - (f(x1) - g(x1));
  return Math.abs(d) < GROWTH_EPS ? 0 : d < 0 ? -1 : 1;
}

/**
 * 마스터 정리(기본 세 경우, Lec2 p.63-72) 판정: T(n) = aT(n/b) + f(n)에서 f(n)/h(n) = n^e (log n)^k 꼴의 e·k를
 * 세 지점(x = 64·128·256)에서 구한다. a < 1이면 쓸 수 없음. e < 0 → "h"(h(n)이 다항식만큼 큼), e > 0 → "f", e = k = 0 → "same", 그 밖 → null
 */
export function masterCase(a: number, b: number, f: LnFn): "h" | "f" | "same" | null {
  if (a < 1 || b <= 1) return null;
  const hExp = Math.log(a) / Math.log(b);
  const r = (x: number) => (f(x) - hExp * x * Math.LN2) / Math.LN2; // log₂(f/h)
  const d1 = r(128) - r(64);
  const d2 = r(256) - r(128);
  const e = (d2 - d1) / 64;
  const k = d1 - 64 * e;
  const tol = 1e-3;
  if (e < -tol) return "h";
  if (e > tol) return "f";
  return Math.abs(k) < tol ? "same" : null;
}

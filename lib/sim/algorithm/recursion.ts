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

/**
 * 최근접 점의 쌍(Lec4 p.40-60) — 강의 자료의 ClosestPair(S)를 그대로 따른다(일반 문항 정답 검증용).
 * S는 x-좌표 오름차순, |S| ≤ 3이면 직접 계산, |S|가 홀수면 |SL| = |SR| + 1, 중간 영역 = [왼쪽 중간점 x − d, 오른쪽 중간점 x + d].
 */

export type Point = readonly [x: number, y: number];
export interface Pair {
  a: Point;
  b: Point;
  dist: number;
}

const dist = (p: Point, q: Point) => Math.hypot(p[0] - q[0], p[1] - q[1]);

function brute(s: readonly Point[]): Pair | null {
  let best: Pair | null = null;
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j < s.length; j++) {
      const d = dist(s[i], s[j]);
      if (!best || d < best.dist) best = { a: s[i], b: s[j], dist: d };
    }
  return best;
}

/** 중간 영역에 속하는 점(Lec4 p.46): 왼쪽 부분의 가장 오른쪽 점 x − d 이상, 오른쪽 부분의 가장 왼쪽 점 x + d 이하 */
export function middleRegion(xs: readonly number[], leftSize: number, d: number): number[] {
  const lo = xs[leftSize - 1] - d;
  const hi = xs[leftSize] + d;
  return xs.filter((x) => x >= lo && x <= hi);
}

export interface ClosestPairTrace {
  cpl: Pair;
  cpr: Pair;
  d: number;
  middle: Point[];
  cpc: Pair | null;
  result: Pair;
  /** 첫 호출을 포함한 ClosestPair 호출 수 */
  calls: number;
}

/** 첫 호출의 CPL·CPR·d·중간 영역·CPC와 최종 결과 (|S| ≥ 4) */
export function closestPair(points: readonly Point[]): ClosestPairTrace {
  const s = [...points].sort((p, q) => p[0] - q[0]);
  let calls = 0;
  const go = (t: Point[]): { result: Pair; cpl?: Pair; cpr?: Pair; d?: number; middle?: Point[]; cpc?: Pair | null } => {
    calls++;
    if (t.length <= 3) return { result: brute(t)! };
    const half = Math.ceil(t.length / 2);
    const sl = t.slice(0, half);
    const sr = t.slice(half);
    const cpl = go(sl).result;
    const cpr = go(sr).result;
    const d = Math.min(cpl.dist, cpr.dist);
    const lo = sl[sl.length - 1][0] - d;
    const hi = sr[0][0] + d;
    const middle = t.filter((p) => p[0] >= lo && p[0] <= hi);
    const cpc = brute(middle);
    const result = [cpl, cpc, cpr].filter((p): p is Pair => p !== null).reduce((m, p) => (p.dist < m.dist ? p : m));
    return { result, cpl, cpr, d, middle, cpc };
  };
  const top = go(s);
  return { cpl: top.cpl!, cpr: top.cpr!, d: top.d!, middle: top.middle!, cpc: top.cpc!, result: top.result, calls };
}

/** n개의 점에 대한 ClosestPair 호출 수(첫 호출 포함) — 분할은 |SL| = ⌈n/2⌉, n ≤ 3에서 멈춘다 */
export function closestPairCalls(n: number): number {
  return n <= 3 ? 1 : 1 + closestPairCalls(Math.ceil(n / 2)) + closestPairCalls(Math.floor(n / 2));
}

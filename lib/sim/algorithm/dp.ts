/**
 * 알고리즘 족보 정답 검증용 시뮬레이터 — 동적 계획법·최단 경로 (강의 자료 5, Sprint 21).
 */

/** 행렬 경로(Lec5 p.15-21): 좌상단 → 우하단, 오른쪽·아래로만, 방문 칸 합의 최댓값 */
export function maxPathSum(m: readonly (readonly number[])[]): number {
  const R = m.length;
  const C = m[0].length;
  const d = m.map((row) => row.map(() => 0));
  for (let i = 0; i < R; i++)
    for (let j = 0; j < C; j++) d[i][j] = m[i][j] + Math.max(i > 0 ? d[i - 1][j] : j > 0 ? -Infinity : 0, j > 0 ? d[i][j - 1] : i > 0 ? -Infinity : 0);
  return d[R - 1][C - 1];
}

/**
 * 조약돌 놓기(Lec5 p.22-34): 3행 n열, 가로·세로로 인접한 두 칸에 동시에 놓지 못하고 각 열에 적어도 하나.
 * 한 열의 패턴은 {1행}, {2행}, {3행}, {1행,3행} 네 가지(Lec5 p.26). 모든 경우를 열거해 최댓값을 구한다.
 */
export function pebbleMax(m: readonly (readonly number[])[]): number {
  const patterns = [[0], [1], [2], [0, 2]];
  const cols = m[0].length;
  const compat = (a: number[], b: number[]) => !a.some((r) => b.includes(r));
  const val = (c: number, p: number[]) => p.reduce((s, r) => s + m[r][c], 0);
  let best = patterns.map((p) => val(0, p));
  for (let c = 1; c < cols; c++)
    best = patterns.map((p) => val(c, p) + Math.max(...patterns.map((q, k) => (compat(p, q) ? best[k] : -Infinity))));
  return Math.max(...best);
}

/** 장학금(M23-3): 해마다 1학기·2학기 중 하나 또는 안 받음, 연속된 해의 같은 학기는 불가 — 전수 탐색 */
export function scholarshipMax(rows: readonly (readonly [number, number])[]): number {
  let best = 0;
  const go = (y: number, prev: number, sum: number) => {
    if (y === rows.length) return void (best = Math.max(best, sum));
    go(y + 1, -1, sum);
    for (const s of [0, 1]) if (s !== prev) go(y + 1, s, sum + rows[y][s]);
  };
  go(0, -1, 0);
  return best;
}

/** 연쇄 행렬 곱(Lec5 p.35-53): 차원 p0..pn, m[i][j](1부터) 표 */
export function matrixChain(p: readonly number[]): number[][] {
  const n = p.length - 1;
  const m = Array.from({ length: n + 1 }, () => Array<number>(n + 1).fill(0));
  for (let len = 2; len <= n; len++)
    for (let i = 1; i + len - 1 <= n; i++) {
      const j = i + len - 1;
      m[i][j] = Infinity;
      for (let k = i; k < j; k++) m[i][j] = Math.min(m[i][j], m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]);
    }
  return m;
}

/** LCS 길이 표(Lec5 p.54-64): rows(세로 문자열) × cols(가로 문자열), 0행·0열 포함 */
export function lcsTable(rows: string, cols: string): number[][] {
  const t = Array.from({ length: rows.length + 1 }, () => Array<number>(cols.length + 1).fill(0));
  for (let i = 1; i <= rows.length; i++)
    for (let j = 1; j <= cols.length; j++) t[i][j] = rows[i - 1] === cols[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
  return t;
}

const INF = Infinity;
/** 플로이드-워샬(정점 중심, Lec5 p.123): D(0)에서 중간 정점 0..k-1을 허용한 D(k) */
export function floydUpTo(w: readonly (readonly number[])[], k: number): number[][] {
  const d = w.map((r) => [...r]);
  for (let v = 0; v < k; v++) for (let i = 0; i < d.length; i++) for (let j = 0; j < d.length; j++) if (d[i][v] + d[v][j] < d[i][j]) d[i][j] = d[i][v] + d[v][j];
  return d;
}

/** 간선 수 제한 최단 거리(원문 명칭 "간선을 중심으로 동작하는 플로이드 워샬", Lec5 p.133-138): 간선 m개 이하 L(m) */
export function edgeLimited(w: readonly (readonly number[])[], m: number): number[][] {
  let l = w.map((r) => [...r]);
  for (let s = 2; s <= m; s++) l = l.map((row, i) => row.map((_, j) => Math.min(...l[i].map((x, k) => x + w[k][j]))));
  return l;
}

/** 벨만-포드(Lec5 p.133-138, optional): 시작 정점에서 각 정점까지 최단 거리 */
export function bellmanFord(n: string[], edges: readonly [string, string, number][], src: string): Record<string, number> {
  const d: Record<string, number> = Object.fromEntries(n.map((v) => [v, INF]));
  d[src] = 0;
  for (let it = 0; it < n.length - 1; it++) for (const [u, v, w] of edges) if (d[u] + w < d[v]) d[v] = d[u] + w;
  for (const [u, v, w] of edges) if (d[u] + w < d[v]) throw new Error("음의 사이클");
  return d;
}

/** 편집 거리 표(Lec5 p.65-85, EditDistance): E[i][j] = min{E[i][j-1]+1, E[i-1][j]+1, E[i-1][j-1]+α}, 0행·0열 포함 */
export function editDistanceTable(s: string, t: string): number[][] {
  const e = Array.from({ length: s.length + 1 }, (_, i) => Array.from({ length: t.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= s.length; i++)
    for (let j = 1; j <= t.length; j++) e[i][j] = Math.min(e[i][j - 1] + 1, e[i - 1][j] + 1, e[i - 1][j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1));
  return e;
}

/** 0-1 배낭 표(Lec5 p.87-105, Knapsack): K[i][w], 물건 i = items[i-1] = [무게, 가치] */
export function knapsackTable(items: readonly (readonly [number, number])[], cap: number): number[][] {
  const k = Array.from({ length: items.length + 1 }, () => Array<number>(cap + 1).fill(0));
  for (let i = 1; i <= items.length; i++) {
    const [wi, vi] = items[i - 1];
    for (let w = 1; w <= cap; w++) k[i][w] = wi > w ? k[i - 1][w] : Math.max(k[i - 1][w], k[i - 1][w - wi] + vi);
  }
  return k;
}

/** 배낭 최적해에 담긴 물건 번호(1부터) — 표를 거꾸로 따라간다 */
export function knapsackItems(items: readonly (readonly [number, number])[], cap: number): number[] {
  const k = knapsackTable(items, cap);
  const out: number[] = [];
  for (let i = items.length, w = cap; i > 0; i--)
    if (k[i][w] !== k[i - 1][w]) {
      out.unshift(i);
      w -= items[i - 1][0];
    }
  return out;
}

/** 가치/무게 비율이 큰 물건부터 들어가면 담는 그리디(오답 비교용) */
export function knapsackGreedyByRatio(items: readonly (readonly [number, number])[], cap: number): { items: number[]; value: number } {
  const order = items.map((it, i) => [i + 1, it[1] / it[0]] as const).sort((a, b) => b[1] - a[1]);
  let left = cap;
  let value = 0;
  const picked: number[] = [];
  for (const [i] of order)
    if (items[i - 1][0] <= left) {
      left -= items[i - 1][0];
      value += items[i - 1][1];
      picked.push(i);
    }
  return { items: picked.sort((a, b) => a - b), value };
}

/**
 * 동전 거스름돈(Lec5 p.107-121, DPCoinChange): C[0..n]과 j별 line 6(C[j] 갱신) 실행 횟수.
 * coins = d1 > d2 > … > dk = 1, 바깥 반복 j, 안쪽 반복 i = 1..k(큰 동전부터).
 */
export function coinChange(coins: readonly number[], n: number): { c: number[]; updates: number[] } {
  const c = Array<number>(n + 1).fill(INF);
  const updates = Array<number>(n + 1).fill(0);
  c[0] = 0;
  for (let j = 1; j <= n; j++)
    for (const d of coins)
      if (d <= j && c[j - d] + 1 < c[j]) {
        c[j] = c[j - d] + 1;
        updates[j]++;
      }
  return { c, updates };
}

/** 큰 동전부터 최대한 쓰는 그리디의 동전 수 */
export function greedyCoins(coins: readonly number[], n: number): number {
  let count = 0;
  for (const d of coins) {
    count += Math.floor(n / d);
    n %= d;
  }
  return count;
}

export { INF };

// ── 족보관련1·2 모의시험(2026-10-22, docs/jokbo/algorithm/mock-exams.md) ──

/** 행렬 경로 DP 표 c[i][j](Lec5 p.21, 0행·0열 = 0 포함) */
export function matrixPathTable(m: readonly (readonly number[])[]): number[][] {
  const c = Array.from({ length: m.length + 1 }, () => Array<number>(m[0].length + 1).fill(0));
  for (let i = 1; i <= m.length; i++) for (let j = 1; j <= m[0].length; j++) c[i][j] = m[i - 1][j - 1] + Math.max(c[i - 1][j], c[i][j - 1]);
  return c;
}

/** 조약돌 놓기 DP 표 peb[i][p](Lec5 p.32-34): 열 i(1부터), 패턴 p = 1({1행}) 2({2행}) 3({3행}) 4({1행,3행}) */
export function pebbleTable(m: readonly (readonly number[])[]): number[][] {
  const patterns = [[0], [1], [2], [0, 2]];
  const compat = (a: number[], b: number[]) => !a.some((r) => b.includes(r));
  const val = (c: number, p: number[]) => p.reduce((s, r) => s + m[r][c], 0);
  const t: number[][] = [[]];
  for (let c = 0; c < m[0].length; c++)
    t.push(patterns.map((p) => val(c, p) + (c === 0 ? 0 : Math.max(...patterns.map((q, k) => (compat(p, q) ? t[c][k] : -Infinity))))));
  return t.map((row) => [0, ...row]);
}

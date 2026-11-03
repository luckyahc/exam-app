/**
 * 알고리즘 기말 정답 검증용 시뮬레이터 — 강의 자료 6(그리디 알고리즘, 2026-11-03).
 * 의사코드는 강의 자료 그대로(쪽은 각 함수 주석). 동점 처리 규칙은 지문에 적은 규칙과 같게 둔다.
 */

/** CoinChange(Lec6 p.12): 큰 액면부터 남은 액수를 넘지 않는 동안 계속 취한다. 액면별 개수(액면 순서대로) */
export function greedyCoinCounts(coins: readonly number[], w: number): number[] {
  return coins.map((d) => {
    const k = Math.floor(w / d);
    w -= k * d;
    return k;
  });
}

/** 최소 동전 수(DP, Lec6 p.15-16): C[j] = min{C[j-di] + 1} */
export function minCoins(coins: readonly number[], n: number): number[] {
  const c = Array<number>(n + 1).fill(Infinity);
  c[0] = 0;
  for (let j = 1; j <= n; j++) for (const d of coins) if (d <= j && c[j - d] + 1 < c[j]) c[j] = c[j - d] + 1;
  return c;
}

/** 그리디 동전 수가 1..limit의 모든 액수에서 최소 동전 수와 같은가(액면에 1 포함) */
export function greedyAlwaysOptimal(coins: readonly number[], limit: number): boolean {
  const c = minCoins(coins, limit);
  for (let w = 1; w <= limit; w++) if (greedyCoinCounts(coins, w).reduce((a, b) => a + b, 0) !== c[w]) return false;
  return true;
}

/** Greedy_Sum(Lec6 p.8): 루트에서 가중치가 큰 자식으로만 내려간 합. tree[i] = [w, 왼쪽, 오른쪽](없으면 -1) */
export type TreeNode = readonly [number, number, number];
export function greedyTreeSum(tree: readonly TreeNode[], root = 0): number {
  let x = root;
  let sum = 0;
  for (;;) {
    const [w, l, r] = tree[x];
    sum += w;
    if (l < 0 && r < 0) return sum;
    x = r < 0 || (l >= 0 && tree[l][0] >= tree[r][0]) ? l : r;
  }
}
/** 루트에서 이파리까지 경로 합의 최댓값(최적해) */
export function bestTreeSum(tree: readonly TreeNode[], x = 0): number {
  const [w, l, r] = tree[x];
  if (l < 0 && r < 0) return w;
  return w + Math.max(l >= 0 ? bestTreeSum(tree, l) : -Infinity, r >= 0 ? bestTreeSum(tree, r) : -Infinity);
}

/** FractionalKnapsack(Lec6 p.20-21). items = [이름, 무게, 가치]. 반환: 담은 순서(이름·담은 무게)와 가치 합 v */
export function fractionalKnapsack(items: readonly (readonly [string, number, number])[], cap: number) {
  const s = [...items].sort((a, b) => b[2] / b[1] - a[2] / a[1]);
  const list: { name: string; weight: number }[] = [];
  let w = 0;
  let v = 0;
  let i = 0;
  while (i < s.length && w + s[i][1] <= cap) {
    list.push({ name: s[i][0], weight: s[i][1] });
    w += s[i][1];
    v += s[i][2];
    i++;
  }
  if (cap - w > 0 && i < s.length) {
    list.push({ name: s[i][0], weight: cap - w });
    v += ((cap - w) * s[i][2]) / s[i][1];
  }
  return { list, value: v };
}

/** SetCover(Lec6 p.34): U의 남은 원소를 가장 많이 가진 집합을 고른다(동점이면 번호가 작은 집합 — p.38의 S1). 고른 집합 번호(1부터) 순서 */
export function greedySetCover(universe: readonly number[], sets: readonly (readonly number[])[]): number[] {
  let u = new Set(universe);
  const left = new Set(sets.map((_, i) => i));
  const chosen: number[] = [];
  while (u.size) {
    let best = -1;
    let bestN = 0;
    for (const i of left) {
      const n = sets[i].filter((x) => u.has(x)).length;
      if (n > bestN || (n === bestN && n > 0 && i < best)) [best, bestN] = [i, n];
    }
    if (best < 0) throw new Error("커버 불가");
    u = new Set([...u].filter((x) => !sets[best].includes(x)));
    left.delete(best);
    chosen.push(best + 1);
  }
  return chosen;
}

/** 집합 커버 최적해의 집합 수(모든 조합 검사, Lec6 p.32-33) */
export function optimalSetCoverSize(universe: readonly number[], sets: readonly (readonly number[])[]): number {
  let best = Infinity;
  for (let mask = 1; mask < 1 << sets.length; mask++) {
    const cov = new Set<number>();
    let k = 0;
    sets.forEach((s, i) => {
      if (mask & (1 << i)) {
        k++;
        s.forEach((x) => cov.add(x));
      }
    });
    if (universe.every((x) => cov.has(x))) best = Math.min(best, k);
  }
  return best;
}

/**
 * JobScheduling(Lec6 p.44): 시작 시간 순으로 꺼내, 수행할 수 있는(마지막 작업 종료 ≤ 시작) 기계 중 번호가 가장 작은 기계에 배정,
 * 없으면 새 기계. 시작 시간이 같으면 입력 순서. 반환: 기계별 작업 이름 목록
 */
export function jobScheduling(jobs: readonly (readonly [string, number, number])[]): string[][] {
  const l = [...jobs].map((j, i) => [j, i] as const).sort((a, b) => a[0][1] - b[0][1] || a[1] - b[1]);
  const machines: { end: number; jobs: string[] }[] = [];
  for (const [[name, s, f]] of l) {
    const m = machines.find((x) => x.end <= s);
    if (m) {
      m.end = f;
      m.jobs.push(name);
    } else machines.push({ end: f, jobs: [name] });
  }
  return machines.map((m) => m.jobs);
}

/** 회의실 배정(Lec6 p.50-51): 한 회의실, key 순으로 보며 앞서 고른 회의와 겹치지 않으면 배정(끝 = 다음 시작 허용) */
export function roomSchedule(meetings: readonly (readonly [string, number, number])[], key: "finish" | "start" | "length"): string[] {
  const k = (m: readonly [string, number, number]) => (key === "finish" ? m[2] : key === "start" ? m[1] : m[2] - m[1]);
  const sorted = [...meetings].sort((a, b) => k(a) - k(b) || a[2] - b[2]);
  const picked: (readonly [string, number, number])[] = [];
  for (const m of sorted) if (picked.every((p) => m[2] <= p[1] || m[1] >= p[2])) picked.push(m);
  return picked.sort((a, b) => a[1] - b[1]).map((m) => m[0]);
}

/**
 * HuffmanCoding(Lec6 p.56-62): 빈도가 가장 작은 두 노드 A(더 작은 쪽)·B를 꺼내 A를 왼쪽(0), B를 오른쪽(1) 자식으로.
 * 빈도가 같으면 먼저 Q에 들어간 노드를 작은 쪽으로 본다(지문의 빈도는 동점이 생기지 않게 고른다). 반환: 문자별 코드, 반복 횟수
 */
export function huffman(freq: Readonly<Record<string, number>>): { codes: Record<string, string>; merges: number[] } {
  type N = { f: number; ch?: string; l?: N; r?: N; seq: number };
  let seq = 0;
  let q: N[] = Object.entries(freq).map(([ch, f]) => ({ f, ch, seq: seq++ }));
  const merges: number[] = [];
  const pop = () => {
    q.sort((a, b) => a.f - b.f || a.seq - b.seq);
    return q.shift()!;
  };
  while (q.length >= 2) {
    const a = pop();
    const b = pop();
    const n: N = { f: a.f + b.f, l: a, r: b, seq: seq++ };
    merges.push(n.f);
    q = [...q, n];
  }
  const codes: Record<string, string> = {};
  const walk = (n: N, c: string) => {
    if (n.ch !== undefined) codes[n.ch] = c || "0";
    else {
      walk(n.l!, c + "0");
      walk(n.r!, c + "1");
    }
  };
  walk(q[0], "");
  return { codes, merges };
}

/** 허프만 코드로 비트열 풀기(Lec6 p.63) */
export function huffmanDecode(codes: Readonly<Record<string, string>>, bits: string): string {
  const inv = Object.fromEntries(Object.entries(codes).map(([c, b]) => [b, c]));
  let out = "";
  let cur = "";
  for (const b of bits) {
    cur += b;
    if (inv[cur] !== undefined) {
      out += inv[cur];
      cur = "";
    }
  }
  if (cur) throw new Error("남은 비트");
  return out;
}

// ── 기말 범위 족보(2026-11-03, docs/jokbo/algorithm/inventory.md §4 #112~) 정답 검증용 전수 탐색 ──

/** 순열 전부 */
export function permutations<T>(xs: readonly T[]): T[][] {
  if (xs.length <= 1) return [[...xs]];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

/** 서로 겹치지 않는 구간을 가장 많이 고른 수(전수 탐색, 끝 = 다음 시작 허용). 구간 = [시작, 끝] */
export function maxCompatibleBrute(intervals: readonly (readonly [number, number])[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << intervals.length; mask++) {
    const xs = intervals.filter((_, i) => mask & (1 << i)).sort((a, b) => a[0] - b[0]);
    if (xs.every((x, i) => i === 0 || xs[i - 1][1] <= x[0])) best = Math.max(best, xs.length);
  }
  return best;
}

/** 전자레인지(F23-18): 하나씩 차례로 데우고(데우는 시간 합), 데운 즉시 먹기 시작. 모든 순서 중 마지막 사람이 다 먹는 시각의 최솟값 */
export function lunchMinFinish(boxes: readonly (readonly [number, number])[]): number {
  const finish = (order: (readonly [number, number])[]) => {
    let t = 0;
    let end = 0;
    for (const [heat, eat] of order) {
      t += heat;
      end = Math.max(end, t + eat);
    }
    return end;
  };
  return Math.min(...permutations(boxes).map(finish));
}

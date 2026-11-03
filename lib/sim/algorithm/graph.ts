/**
 * 알고리즘 기말 정답 검증용 시뮬레이터 — 그래프(강의 자료 6 §4.2·4.3, 강의 자료 9, 2026-11-03).
 * 의사코드는 강의 자료 그대로. 동점·인접 순서 규칙은 지문에 적은 규칙과 같게 둔다:
 * 인접 리스트는 주어진 순서, 같은 값이면 정점 이름이 앞선 것(사전순)을 먼저.
 */

export type Edge = readonly [string, string, number];
export type Adj = Readonly<Record<string, readonly string[]>>;

const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** 무향 가중치 그래프의 인접 정보 */
function undirected(edges: readonly Edge[]): Map<string, Map<string, number>> {
  const g = new Map<string, Map<string, number>>();
  for (const [u, v, w] of edges) {
    if (!g.has(u)) g.set(u, new Map());
    if (!g.has(v)) g.set(v, new Map());
    g.get(u)!.set(v, w);
    g.get(v)!.set(u, w);
  }
  return g;
}

/** KruskalMST(Lec6 p.75, Lec9 p.42): 가중치 오름차순, 사이클을 만들면 버린다. 반환: 더한 간선과 버린 간선(고려한 순서) */
export function kruskal(vertices: readonly string[], edges: readonly Edge[]) {
  const parent = new Map(vertices.map((v) => [v, v]));
  const find = (x: string): string => (parent.get(x) === x ? x : find(parent.get(x)!));
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const added: Edge[] = [];
  const discarded: Edge[] = [];
  for (const e of sorted) {
    if (added.length === vertices.length - 1) break;
    const [ru, rv] = [find(e[0]), find(e[1])];
    if (ru === rv) discarded.push(e);
    else {
      parent.set(ru, rv);
      added.push(e);
    }
  }
  return { added, discarded, total: added.reduce((s, e) => s + e[2], 0) };
}

/**
 * PrimMST(Lec6 p.86-87, Lec9 p.39): D[v] = 트리와 v를 잇는 간선의 최소 가중치. D가 최소인 점을 차례로 더한다.
 * 반환: 더한 순서, 각 점을 더한 직후(갱신까지 마친 뒤)의 D, 부모(tree[v]), 가중치 합
 */
export function prim(vertices: readonly string[], edges: readonly Edge[], start: string) {
  const g = undirected(edges);
  const d: Record<string, number> = Object.fromEntries(vertices.map((v) => [v, Infinity]));
  const tree: Record<string, string | null> = Object.fromEntries(vertices.map((v) => [v, null]));
  d[start] = 0;
  const inT = new Set<string>();
  const order: string[] = [];
  const snapshots: Record<string, number>[] = [];
  let total = 0;
  while (inT.size < vertices.length) {
    const u = vertices.filter((v) => !inT.has(v)).sort((a, b) => d[a] - d[b] || byName(a, b))[0];
    inT.add(u);
    order.push(u);
    total += d[u];
    for (const [w, wt] of g.get(u) ?? [])
      if (!inT.has(w) && wt < d[w]) {
        d[w] = wt;
        tree[w] = u;
      }
    snapshots.push({ ...d });
  }
  return { order, snapshots, tree, total };
}

/**
 * Dijkstra / ShortestPath(Lec6 p.103, Lec9 p.60). directed=false면 무향. 음의 간선이 있어도 의사코드 그대로 돌린다(확정한 점은 다시 갱신하지 않음).
 * 반환: 확정 순서, 각 점 확정 직후(간선 완화까지)의 d, 최종 d·prev
 */
export function dijkstra(vertices: readonly string[], edges: readonly Edge[], src: string, directed = true) {
  const adj = new Map<string, [string, number][]>(vertices.map((v) => [v, []]));
  for (const [u, v, w] of edges) {
    adj.get(u)!.push([v, w]);
    if (!directed) adj.get(v)!.push([u, w]);
  }
  const d: Record<string, number> = Object.fromEntries(vertices.map((v) => [v, Infinity]));
  const prev: Record<string, string | null> = Object.fromEntries(vertices.map((v) => [v, null]));
  d[src] = 0;
  const s = new Set<string>();
  const order: string[] = [];
  const snapshots: Record<string, number>[] = [];
  while (s.size < vertices.length) {
    const u = vertices.filter((v) => !s.has(v)).sort((a, b) => d[a] - d[b] || byName(a, b))[0];
    s.add(u);
    order.push(u);
    for (const [v, w] of adj.get(u)!)
      if (!s.has(v) && d[u] + w < d[v]) {
        d[v] = d[u] + w;
        prev[v] = u;
      }
    snapshots.push({ ...d });
  }
  return { order, snapshots, d, prev };
}

/**
 * BellmanFord(Lec9 p.63-70). mode "sequential" = 간선 순서대로 바로 반영, "parallel" = 한 반복에서 직전 반복의 d만 사용(p.64 동시 업데이트).
 * 반환: 반복 i = 1..|V|-1 직후의 d, 음의 사이클 여부
 */
export function bellmanFordRounds(vertices: readonly string[], edges: readonly Edge[], src: string, mode: "sequential" | "parallel") {
  let d: Record<string, number> = Object.fromEntries(vertices.map((v) => [v, Infinity]));
  d[src] = 0;
  const rounds: Record<string, number>[] = [];
  for (let i = 1; i <= vertices.length - 1; i++) {
    const base = mode === "parallel" ? { ...d } : d;
    const next = mode === "parallel" ? { ...d } : d;
    for (const [u, v, w] of edges) if (base[u] + w < next[v]) next[v] = base[u] + w;
    d = next;
    rounds.push({ ...d });
  }
  const negativeCycle = edges.some(([u, v, w]) => d[u] + w < d[v]);
  return { rounds, d, negativeCycle };
}

/** 플로이드-워샬(정점 중심, Lec9 p.83-99): D(0..n)과 직전 원소 Π(n). w[i][j](0부터), 없는 간선 = Infinity */
export function floyd(w: readonly (readonly number[])[]) {
  const n = w.length;
  let d = w.map((r) => [...r]);
  let p: (number | null)[][] = w.map((r, i) => r.map((x, j) => (i !== j && x < Infinity ? i : null)));
  const ds = [d.map((r) => [...r])];
  for (let k = 0; k < n; k++) {
    const nd = d.map((r) => [...r]);
    const np = p.map((r) => [...r]);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (d[i][k] + d[k][j] < d[i][j]) {
          nd[i][j] = d[i][k] + d[k][j];
          np[i][j] = p[k][j];
        }
    d = nd;
    p = np;
    ds.push(d.map((r) => [...r]));
  }
  return { ds, pi: p };
}

/** Π로 i → j 최단 경로(0부터 번호) */
export function floydPath(pi: readonly (readonly (number | null)[])[], i: number, j: number): number[] {
  const path = [j];
  while (path[0] !== i) {
    const p = pi[i][path[0]];
    if (p === null) throw new Error("경로 없음");
    path.unshift(p);
  }
  return path;
}

/** DFS(Lec9 p.27): 정점 순서대로 시작점을 고르고, 인접 리스트 순서대로 방문. 반환: 방문 순서와 완료 순서 */
export function dfs(adj: Adj, vertices: readonly string[] = Object.keys(adj)) {
  const visited = new Set<string>();
  const order: string[] = [];
  const finish: string[] = [];
  const go = (v: string) => {
    visited.add(v);
    order.push(v);
    for (const x of adj[v] ?? []) if (!visited.has(x)) go(x);
    finish.push(v);
  };
  for (const v of vertices) if (!visited.has(v)) go(v);
  return { order, finish };
}

/** BFS(Lec9 p.31): 시작점에서 큐로, 인접 리스트 순서대로. 반환: 방문 순서와 홉 수 */
export function bfs(adj: Adj, s: string) {
  const dist: Record<string, number> = { [s]: 0 };
  const order: string[] = [];
  const q = [s];
  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    for (const v of adj[u] ?? [])
      if (!(v in dist)) {
        dist[v] = dist[u] + 1;
        q.push(v);
      }
  }
  return { order, dist };
}

/** topologicalSort1(Lec9 p.49): 진입 간선이 없는 정점 중 이름이 앞선 것을 고르고 진출 간선과 함께 지운다 */
export function topoSort1(adj: Adj): string[] {
  const vs = Object.keys(adj).sort(byName);
  const indeg: Record<string, number> = Object.fromEntries(vs.map((v) => [v, 0]));
  for (const v of vs) for (const x of adj[v]) indeg[x]++;
  const out: string[] = [];
  const removed = new Set<string>();
  while (out.length < vs.length) {
    const u = vs.find((v) => !removed.has(v) && indeg[v] === 0);
    if (u === undefined) throw new Error("사이클");
    removed.add(u);
    out.push(u);
    for (const x of adj[u]) indeg[x]--;
  }
  return out;
}

/** topologicalSort2(Lec9 p.52): DFS가 정점 v를 끝낼 때 리스트 R의 맨 앞에 넣는다 = 완료 순서의 역순 */
export function topoSort2(adj: Adj, vertices: readonly string[] = Object.keys(adj)): string[] {
  return [...dfs(adj, vertices).finish].reverse();
}

/** 위상 순서인가: 모든 간선 x→y에서 x가 y보다 앞 */
export function isTopoOrder(adj: Adj, order: readonly string[]): boolean {
  const pos = new Map(order.map((v, i) => [v, i]));
  return order.length === Object.keys(adj).length && Object.entries(adj).every(([x, ys]) => ys.every((y) => pos.get(x)! < pos.get(y)!));
}

/** DAG-ShortestPath(Lec9 p.100): 위상 순서(topologicalSort2)대로 각 정점의 진출 간선을 완화 */
export function dagShortestPath(vertices: readonly string[], edges: readonly Edge[], src: string) {
  const adj: Record<string, string[]> = Object.fromEntries(vertices.map((v) => [v, []]));
  for (const [u, v] of edges) adj[u].push(v);
  const order = topoSort2(adj, vertices);
  const d: Record<string, number> = Object.fromEntries(vertices.map((v) => [v, Infinity]));
  d[src] = 0;
  for (const u of order) for (const [x, v, w] of edges) if (x === u && d[u] + w < d[v]) d[v] = d[u] + w;
  return { order, d };
}

/** stronglyConnectedComponent(Lec9 p.105): G의 DFS 완료 시간 → GR을 완료 시간이 큰 정점부터 DFS → 트리 = 강연결요소 */
export function scc(adj: Adj, vertices: readonly string[] = Object.keys(adj)): string[][] {
  const { finish } = dfs(adj, vertices);
  const rev: Record<string, string[]> = Object.fromEntries(vertices.map((v) => [v, []]));
  for (const v of vertices) for (const x of adj[v] ?? []) rev[x].push(v);
  for (const v of vertices) rev[v].sort(byName);
  const seen = new Set<string>();
  const comps: string[][] = [];
  for (const v of [...finish].reverse()) {
    if (seen.has(v)) continue;
    const comp: string[] = [];
    const go = (x: string) => {
      seen.add(x);
      comp.push(x);
      for (const y of rev[x]) if (!seen.has(y)) go(y);
    };
    go(v);
    comps.push(comp.sort(byName));
  }
  return comps;
}

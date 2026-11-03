import { describe, expect, it } from "vitest";
import { edgeLimited } from "./dp";
import { bellmanFordRounds, bfs, dagShortestPath, dfs, dijkstra, floyd, floydPath, isTopoOrder, kruskal, prim, scc, topoSort1, topoSort2 } from "./graph";
import {
  bestTreeSum,
  fractionalKnapsack,
  greedyAlwaysOptimal,
  greedyCoinCounts,
  greedySetCover,
  greedyTreeSum,
  huffman,
  huffmanDecode,
  jobScheduling,
  minCoins,
  optimalSetCoverSize,
  roomSchedule,
} from "./greedy";

// 기준값 = 강의 자료 6(그리디)·9(그래프)의 예제 수치. 쪽은 PDF 쪽.

describe("그리디(Lec6)", () => {
  it("CoinChange p.12: 760원 = 500·100×2·50·10 → 5개, p.13-14: 160원 추가 시 200원은 5개(최소 2개)", () => {
    expect(greedyCoinCounts([500, 100, 50, 10, 1], 760)).toEqual([1, 2, 1, 1, 0]);
    const c = [500, 160, 100, 50, 10, 1];
    expect(greedyCoinCounts(c, 200).reduce((a, b) => a + b)).toBe(5);
    expect(minCoins(c, 200)[200]).toBe(2);
    expect(greedyAlwaysOptimal([500, 100, 50, 10, 1], 2000)).toBe(true);
    expect(greedyAlwaysOptimal(c, 2000)).toBe(false);
  });

  it("DP 동전 p.16: d = 16, 10, 5, 1, n = 20 → C[20] = 2", () => {
    expect(minCoins([16, 10, 5, 1], 20)[20]).toBe(2);
    expect(greedyCoinCounts([16, 10, 5, 1], 20).reduce((a, b) => a + b)).toBe(5);
  });

  it("FractionalKnapsack p.22-24: 용량 40 → 백금 10 + 금 15 + 은 15 = 141만원", () => {
    const r = fractionalKnapsack([["주석", 50, 5], ["백금", 10, 60], ["은", 25, 10], ["금", 15, 75]], 40);
    expect(r.list).toEqual([{ name: "백금", weight: 10 }, { name: "금", weight: 15 }, { name: "은", weight: 15 }]);
    expect(r.value).toBe(141);
  });

  it("SetCover p.35-39: S4 → S6 → S1, 최적해 2개(S2∪S6)", () => {
    const f = [[1, 2, 3, 8], [1, 2, 3, 4, 8], [1, 2, 3, 4], [2, 3, 4, 5, 7, 8], [4, 5, 6, 7], [5, 6, 7, 9, 10], [4, 5, 6, 7], [1, 2, 4, 8], [6, 9], [6, 10]];
    const u = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(greedySetCover(u, f)).toEqual([4, 6, 1]);
    expect(optimalSetCoverSize(u, f)).toBe(2);
  });

  it("JobScheduling p.45-48: 7개 작업 → 기계 3대", () => {
    const t: [string, number, number][] = [["t1", 7, 8], ["t2", 3, 7], ["t3", 1, 5], ["t4", 5, 9], ["t5", 0, 2], ["t6", 6, 8], ["t7", 1, 6]];
    expect(jobScheduling(t)).toHaveLength(3);
  });

  it("회의실 p.51: 종료 시간 순 배정이 가장 많이 배정", () => {
    const m: [string, number, number][] = [["A", 3, 5], ["B", 1, 6], ["C", 6, 7], ["D", 5, 9], ["E", 8, 13], ["F", 7, 14], ["G", 12, 18], ["H", 16, 20]];
    const f = roomSchedule(m, "finish");
    expect(f).toEqual(["A", "C", "E", "H"]);
    expect(roomSchedule(m, "start").length).toBeLessThanOrEqual(f.length);
  });

  it("Huffman p.57-63: A 0, T 100, G 101, C 11, 1,620 bits, 복호화 GTTACGAGAT", () => {
    const h = huffman({ A: 450, T: 90, G: 120, C: 270 });
    expect(h.codes).toEqual({ A: "0", T: "100", G: "101", C: "11" });
    expect(h.merges).toEqual([210, 480, 930]);
    const f = { A: 450, T: 90, G: 120, C: 270 } as Record<string, number>;
    expect(Object.entries(h.codes).reduce((s, [c, b]) => s + f[c] * b.length, 0)).toBe(1620);
    expect(huffmanDecode(h.codes, ["101", "100", "100", "0", "11", "101", "0", "101", "0", "100"].join(""))).toBe("GTTACGAGAT");
  });

  it("Greedy_Sum p.8: 큰 자식만 따라가면 최적이 아닐 수 있다", () => {
    const t = [[1, 1, 2], [5, 3, 4], [3, 5, 6], [1, -1, -1], [2, -1, -1], [9, -1, -1], [1, -1, -1]] as const;
    expect(greedyTreeSum(t)).toBe(8);
    expect(bestTreeSum(t)).toBe(13);
  });
});

describe("그래프(Lec9)", () => {
  // Lec9 p.85-98 플로이드-워샬 예제 그래프(정점 1~5)
  const I = Infinity;
  const W = [
    [0, 3, 8, I, -4],
    [I, 0, I, 1, 7],
    [I, 4, 0, I, I],
    [2, I, -5, 0, I],
    [I, I, I, 6, 0],
  ];

  it("플로이드-워샬 노드 중심 p.85-91: d42(1)=5, d45(1)=-2, d14(2)=4, d34(2)=5, d42(3)=-1", () => {
    const { ds } = floyd(W);
    expect([ds[1][3][1], ds[1][3][4], ds[2][0][3], ds[2][2][3], ds[3][3][1]]).toEqual([5, -2, 4, 5, -1]);
  });

  it("간선 중심 p.76·p.79: l32(2) = 4, l14(2) = 2, L(4) = D(5)", () => {
    expect(edgeLimited(W, 2)[2][1]).toBe(4);
    expect(edgeLimited(W, 2)[0][3]).toBe(2);
    expect(edgeLimited(W, 4)).toEqual(floyd(W).ds[5]);
  });

  it("직전 원소 Π p.81: 1 → 5 → 4 → 3 → 2, 3 → 2 → 4 → 1 → 5", () => {
    const { pi } = floyd(W);
    expect(floydPath(pi, 0, 1).map((x) => x + 1)).toEqual([1, 5, 4, 3, 2]);
    expect(floydPath(pi, 2, 4).map((x) => x + 1)).toEqual([3, 2, 4, 1, 5]);
  });

  const V = ["a", "b", "c", "d", "e", "f"];
  const E: [string, string, number][] = [["a", "b", 4], ["a", "c", 2], ["b", "c", 5], ["b", "d", 10], ["c", "e", 3], ["e", "d", 4], ["d", "f", 11], ["e", "f", 9]];

  it("Kruskal 합 = Prim 합, 신장 트리 간선 n-1개", () => {
    const k = kruskal(V, E);
    expect(k.added).toHaveLength(V.length - 1);
    expect(prim(V, E, "a").total).toBe(k.total);
    expect(prim(V, E, "f").total).toBe(k.total);
  });

  it("음이 아닌 가중치: Dijkstra = Bellman-Ford(순차·병렬), DAG면 DAG-ShortestPath도 같다", () => {
    const dj = dijkstra(V, E, "a");
    expect(bellmanFordRounds(V, E, "a", "sequential").d).toEqual(dj.d);
    expect(bellmanFordRounds(V, E, "a", "parallel").d).toEqual(dj.d);
    expect(dagShortestPath(V, E, "a").d).toEqual(dj.d);
  });

  it("음의 사이클 검출(p.63)", () => {
    expect(bellmanFordRounds(["x", "y", "z"], [["x", "y", 1], ["y", "z", -3], ["z", "y", 1]], "x", "sequential").negativeCycle).toBe(true);
  });

  it("DFS·BFS·위상 정렬·강연결요소", () => {
    const adj = { a: ["b", "c"], b: ["d"], c: ["d"], d: [] };
    expect(dfs(adj).order).toEqual(["a", "b", "d", "c"]);
    expect(bfs(adj, "a")).toEqual({ order: ["a", "b", "c", "d"], dist: { a: 0, b: 1, c: 1, d: 2 } });
    expect(isTopoOrder(adj, topoSort1(adj))).toBe(true);
    expect(isTopoOrder(adj, topoSort2(adj))).toBe(true);
    expect(scc({ a: ["b"], b: ["c"], c: ["a", "d"], d: ["e"], e: ["d"] })).toEqual([["a", "b", "c"], ["d", "e"]]);
  });
});

import { describe, expect, it } from "vitest";
import { edgeLimited } from "@/lib/sim/algorithm/dp";
import { bellmanFordRounds, bfs, dagShortestPath, dfs, dijkstra, floyd, floydPath, isTopoOrder, kruskal, prim, scc, topoSort1, topoSort2 } from "@/lib/sim/algorithm/graph";
import { answerKey } from "@/lib/qtypes/answerKey";
import type { Question } from "@/types/question";
import questions from "./graph";

// 기말 Lec9(그래프) 문항: 형식(docs/final/algorithm-format.md)과 추적·계산 정답 = 시뮬레이터(lib/sim/algorithm/graph.ts).
// 시뮬레이터의 강의 자료 기준값은 lib/sim/algorithm/greedyGraph.test.ts가 고정한다.

type Choice = Question & { choices: string[]; answerIndex: number; answerIndexes: number[] };
const q = (id: string) => questions.find((x) => x.id === `algorithm-graph-${id}`) as Choice;
const picked = (id: string) => q(id).choices[q(id).answerIndex];
const blanks = (id: string) => answerKey(q(id)) as string[];
const show = (x: number) => (x === Infinity ? "∞" : String(x));

const MATS = [
  [[0, 1, 0, 1], [0, 0, 1, 0], [1, 0, 0, 1], [0, 1, 0, 0]],
  [[0, 1, 1, 0], [1, 0, 1, 1], [1, 1, 0, 0], [0, 1, 0, 0]],
  [[0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 0, 0]],
  [[0, 0, 1, 1], [0, 0, 1, 0], [1, 0, 0, 1], [1, 1, 1, 0]],
  [[0, 1, 1, 1], [1, 0, 0, 0], [0, 0, 0, 1], [1, 0, 1, 0]],
];
const M5 = [[0, 1, 1, 0, 1], [1, 0, 1, 1, 0], [1, 1, 0, 1, 1], [0, 1, 1, 0, 1], [1, 0, 1, 1, 0]];
const U8 = { "1": ["3", "2", "4"], "2": ["1", "5"], "3": ["6", "1", "5"], "4": ["7", "1"], "5": ["8", "2", "3"], "6": ["3", "8"], "7": ["4", "8"], "8": ["7", "5", "6"] };
const D7 = { a: ["c"], b: ["c", "f"], c: ["d"], d: [], e: ["a", "b"], f: ["d"], g: ["f"] };
const D7V = ["a", "b", "c", "d", "e", "f", "g"];
const WV = ["r", "a", "b", "c", "d", "e", "f"];
const WE: [string, string, number][] = [["r", "a", 8], ["r", "b", 9], ["r", "c", 11], ["a", "b", 3], ["a", "d", 10], ["b", "c", 13], ["b", "d", 5], ["b", "e", 12], ["c", "e", 7], ["d", "f", 6], ["e", "f", 4]];
const DV = ["r", "a", "b", "c", "d", "e"];
const DE: [string, string, number][] = [["r", "a", 7], ["r", "b", 2], ["b", "a", 3], ["a", "c", 4], ["b", "c", 8], ["b", "d", 6], ["c", "e", 1], ["d", "c", 1], ["d", "e", 5]];
const BV = ["s", "a", "b", "c", "d"];
const BE: [string, string, number][] = [["c", "d", 2], ["b", "c", -3], ["a", "b", 4], ["s", "a", 6], ["s", "b", 8], ["a", "c", 5], ["d", "b", 3]];
const I = Infinity;
const FW = [[0, 4, I, 10], [I, 0, 3, 7], [2, I, 0, I], [I, -1, 5, 0]];
const AV = ["s", "a", "b", "c", "d", "t"];
const AE: [string, string, number][] = [["s", "a", 5], ["s", "b", 3], ["b", "a", 1], ["a", "c", 6], ["b", "c", 9], ["b", "d", 2], ["d", "c", -3], ["c", "t", 2], ["d", "t", 7]];
const SC = { a: ["b"], b: ["c", "e"], c: ["a", "d"], d: ["h"], e: ["f"], f: ["g"], g: ["e", "h"], h: ["i"], i: ["h"] };

describe("알고리즘 기말 Lec9 그래프 — 형식", () => {
  it("id 중복 없음·graph 접두사, slideRef Lec9, 해설에 '근거: 강의자료9 p.'(개념형은 'Lec9 p.X(보기N)')와 '함정:'", () => {
    expect(new Set(questions.map((x) => x.id)).size).toBe(questions.length);
    for (const x of questions) {
      expect(x.id).toMatch(/^algorithm-graph-[a-z]+-\d{3}$/);
      expect(x.slideRef, x.id).toMatch(/^Lec9 p\./);
      expect(x.explanation, x.id).toMatch(/근거: (강의자료9|Lec9) p\.\d+/);
      expect(x.explanation, x.id).toMatch(/함정: /);
    }
  });

  it("중간고사 형식: 보기 5개, 복수 선택은 '모두 고르시오.'(정답 2개 이상)", () => {
    for (const x of questions as Choice[]) {
      if (x.type === "mcq" || x.type === "multi") expect(new Set(x.choices).size, x.id).toBe(5);
      if (x.type === "multi") {
        expect(x.prompt, x.id).toMatch(/모두 고르시오\.$/);
        expect(x.answerIndexes.length, x.id).toBeGreaterThanOrEqual(2);
      }
    }
    const n = (t: string) => questions.filter((x) => x.type === t).length;
    expect([n("mcq"), n("blank"), n("multi")]).toEqual([16, 12, 4]);
  });
});

describe("알고리즘 기말 Lec9 그래프 — 정답 = 시뮬레이터", () => {
  it("인접 행렬: 대칭인 행렬은 하나, 간선 수·차수·인접 배열 크기", () => {
    const sym = MATS.flatMap((m, k) => (m.every((r, i) => r.every((x, j) => x === m[j][i])) ? [k] : []));
    expect(sym).toEqual([q("rep-001").answerIndex]);
    const ones = M5.flat().reduce((a, b) => a + b, 0);
    expect(blanks("rep-002")).toEqual([ones / 2, M5[2].reduce((a, b) => a + b, 0), ones].map(String));
  });

  it("DFS·BFS", () => {
    expect(blanks("search-001")).toEqual([dfs(U8, ["1"]).order.join("")]);
    const b = bfs(U8, "1");
    expect(blanks("search-002")).toEqual([b.order.join("")]);
    expect(picked("search-003")).toMatch(new RegExp(`^${b.dist["8"]}, `));
    const d = dfs(D7, D7V);
    expect(picked("search-004")).toBe(d.finish.join(" "));
    expect(q("search-004").choices[0]).toBe(d.order.join(" "));
  });

  it("프림·크루스칼", () => {
    const p = prim(WV, WE, "r");
    expect(blanks("prim-001")).toEqual([p.order.join(""), p.tree.c, p.tree.e, p.tree.f]);
    const s = p.snapshots[2]; // S = {r, a, b}
    expect(picked("prim-002")).toBe(`d_c = ${show(s.c)}, d_d = ${show(s.d)}, d_e = ${show(s.e)}`);
    const k = kruskal(WV, WE);
    expect(blanks("kruskal-001")).toEqual([k.added.map((e) => e[2]).join(""), String(k.total)]);
    expect(k.total).toBe(p.total);
  });

  it("위상 정렬", () => {
    expect(blanks("topo-001")).toEqual([topoSort1(D7).join("")]);
    expect(blanks("topo-002")).toEqual([topoSort2(D7, D7V).join("")]);
    const valid = q("topo-003").choices.map((c) => isTopoOrder(D7, c.split(" ")));
    expect(valid.flatMap((v, i) => (v ? [] : [i]))).toEqual([q("topo-003").answerIndex]);
  });

  it("다익스트라·벨만-포드", () => {
    const d = dijkstra(DV, DE, "r");
    expect(blanks("dijkstra-001")).toEqual([d.order.join(""), String(d.d.e), d.prev.e]);
    const nv = ["s", "a", "b", "c"];
    const ne: [string, string, number][] = [["s", "a", 2], ["s", "b", 4], ["b", "a", -4], ["a", "c", 3]];
    expect(picked("dijkstra-002")).toBe(`(A) ${dijkstra(nv, ne, "s").d.c}, (B) ${bellmanFordRounds(nv, ne, "s", "sequential").d.c}`);
    const seq = bellmanFordRounds(BV, BE, "s", "sequential");
    const par = bellmanFordRounds(BV, BE, "s", "parallel");
    expect(blanks("bf-001")).toEqual([show(seq.rounds[0].c), show(par.rounds[0].c), show(seq.d.d)]);
    expect(par.d).toEqual(seq.d);
    // DP 관점 d^k = 병렬 업데이트의 k번째 반복
    expect(picked("bf-003")).toBe(`d_c^2 = ${show(par.rounds[1].c)}, d_d^2 = ${show(par.rounds[1].d)}, d_d^3 = ${show(par.rounds[2].d)}`);
    const neg: [string, string, number][] = [["s", "a", 3], ["a", "b", 2], ["b", "c", -6], ["c", "a", 1], ["c", "d", 4]];
    expect(bellmanFordRounds(BV, neg, "s", "sequential").negativeCycle).toBe(true);
  });

  it("플로이드-워샬·DAG·강연결요소", () => {
    const { ds, pi } = floyd(FW);
    expect(blanks("floyd-001")).toEqual([ds[1][2][1], ds[2][3][2], ds[3][3][0]].map(String));
    expect(picked("floyd-002")).toBe(`l_41^(2) = ${edgeLimited(FW, 2)[3][0]}, l_41^(3) = ${edgeLimited(FW, 3)[3][0]}`);
    expect(blanks("floyd-003")).toEqual([floydPath(pi, 3, 0).map((x) => x + 1).join("")]);
    const g = dagShortestPath(AV, AE, "s");
    expect(picked("dag-001")).toBe(`d_c = ${g.d.c}, d_t = ${g.d.t}`);
    expect(bellmanFordRounds(AV, AE, "s", "sequential").d).toEqual(g.d);
    const comps = scc(SC);
    expect(blanks("scc-001")).toEqual([String(comps.length), comps.find((c) => c.includes("e"))!.join("")]);
  });
});

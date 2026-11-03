import { describe, expect, it } from "vitest";
import { knapsackTable } from "@/lib/sim/algorithm/dp";
import { dijkstra, kruskal, prim } from "@/lib/sim/algorithm/graph";
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
} from "@/lib/sim/algorithm/greedy";
import { answerKey } from "@/lib/qtypes/answerKey";
import type { Question } from "@/types/question";
import questions from "./greedy";

// 기말 Lec6(그리디) 문항: 형식(docs/final/algorithm-format.md)과 추적·계산 정답 = 시뮬레이터(lib/sim/algorithm/greedy.ts·graph.ts).
// 시뮬레이터의 강의 자료 기준값은 lib/sim/algorithm/greedyGraph.test.ts가 고정한다.

type Choice = Question & { choices: string[]; answerIndex: number; answerIndexes: number[] };
const q = (id: string) => questions.find((x) => x.id === `algorithm-greedy-${id}`) as Choice;
const picked = (id: string) => q(id).choices[q(id).answerIndex];
const blanks = (id: string) => answerKey(q(id)) as string[];
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const ITEMS: [string, number, number][] = [["A", 8, 40], ["B", 10, 60], ["C", 12, 36], ["D", 6, 42], ["E", 9, 18]];
const U = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const F = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [1, 2, 3, 7, 8, 9, 10], [4, 5, 11, 12], [6, 12]];
const JOBS: [string, number, number][] = [["t1", 2, 6], ["t2", 0, 3], ["t3", 5, 8], ["t4", 1, 4], ["t5", 3, 7], ["t6", 6, 9], ["t7", 4, 5], ["t8", 7, 10]];
const MEET: [string, number, number][] = [["A", 1, 4], ["B", 3, 5], ["C", 0, 6], ["D", 5, 7], ["E", 3, 9], ["F", 5, 9], ["G", 6, 10], ["H", 8, 11], ["I", 8, 12], ["J", 2, 14], ["K", 12, 16]];
const FREQ = { E: 40, A: 25, S: 15, T: 12, R: 5, N: 3 };
const V6 = ["a", "b", "c", "d", "e", "f"];
const E6: [string, string, number][] = [["b", "e", 1], ["b", "d", 2], ["d", "e", 3], ["a", "c", 4], ["d", "f", 5], ["c", "e", 6], ["a", "b", 7], ["c", "d", 8], ["e", "f", 9], ["b", "c", 10]];
const VR = ["s", "a", "b", "c", "d", "t"];
const ER: [string, string, number][] = [["s", "a", 4], ["s", "b", 1], ["b", "a", 2], ["a", "c", 5], ["b", "c", 8], ["b", "d", 10], ["c", "d", 2], ["c", "t", 6], ["d", "t", 3]];

describe("알고리즘 기말 Lec6 그리디 — 형식", () => {
  it("id 중복 없음·greedy 접두사, slideRef Lec6, 해설에 '근거: 강의자료6 p.'와 '함정:'", () => {
    expect(new Set(questions.map((x) => x.id)).size).toBe(questions.length);
    for (const x of questions) {
      expect(x.id).toMatch(/^algorithm-greedy-[a-z]+-\d{3}$/);
      expect(x.slideRef, x.id).toMatch(/^Lec6 p\./);
      expect(x.explanation, x.id).toMatch(/근거: 강의자료6 p\.\d+/);
      expect(x.explanation, x.id).toMatch(/함정: /);
    }
  });

  it("중간고사 형식: 보기 5개, 복수 선택은 '모두 고르시오.'(정답 2개 이상), 단일 선택이 절반 정도", () => {
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

describe("알고리즘 기말 Lec6 그리디 — 정답 = 시뮬레이터", () => {
  it("그리디 이진 트리 합, 동전", () => {
    const t = [[3, 1, 2], [7, 3, 4], [4, 5, 6], [2, -1, -1], [1, -1, -1], [12, -1, -1], [5, -1, -1]] as const;
    expect(picked("tree-001")).toBe(`(A) ${greedyTreeSum(t)}, (B) ${bestTreeSum(t)}`);
    expect(blanks("coin-001")).toEqual([greedyCoinCounts([500, 100, 50, 10, 1], 2786).join("")]);
    const c160 = [500, 160, 100, 50, 10, 1];
    expect(picked("coin-002")).toBe(`(A) ${sum(greedyCoinCounts(c160, 250))}개, (B) ${minCoins(c160, 250)[250]}개`);
    const c = minCoins([16, 10, 5, 1], 20);
    expect(blanks("coin-003")).toEqual([c[15], c[20], sum(greedyCoinCounts([16, 10, 5, 1], 20))].map(String));
    const sets = q("coin-004").choices.map((s) => s.split(", ").map(Number));
    expect(sets.flatMap((s, i) => (greedyAlwaysOptimal(s, 2000) ? [i] : []))).toEqual(q("coin-004").answerIndexes);
  });

  it("부분 배낭·0-1 배낭", () => {
    const r = fractionalKnapsack(ITEMS, 30);
    const last = r.list.at(-1)!;
    expect(blanks("knapsack-001")).toEqual([String(r.value), last.name, String(last.weight)]);
    const k01 = knapsackTable(ITEMS.map(([, w, v]) => [w, v] as [number, number]), 30)[5][30];
    expect(picked("knapsack-002")).toBe(`(A) ${r.value}, (B) ${k01}`);
  });

  it("집합 커버", () => {
    const g = greedySetCover(U, F);
    expect(blanks("setcover-001")).toEqual([g.join("")]);
    expect(picked("setcover-002")).toBe(`(A) ${g.length}, (B) ${optimalSetCoverSize(U, F)}, (C) ${2 ** F.length - 1}`);
  });

  it("작업 스케줄링·회의실 배정", () => {
    const m = jobScheduling(JOBS);
    const at = (t: string) => String(m.findIndex((x) => x.includes(t)) + 1);
    expect(blanks("job-001")).toEqual([String(m.length), at("t6"), at("t8")]);
    expect(blanks("room-002")).toEqual([roomSchedule(MEET, "finish").join("")]);
    expect(picked("room-003")).toBe(`(A) ${roomSchedule(MEET, "start").length}, (B) ${roomSchedule(MEET, "finish").length}`);
  });

  it("허프만", () => {
    const h = huffman(FREQ);
    expect(blanks("huffman-001")).toEqual([h.codes.T, h.codes.S]);
    const list = ["E", "A", "S", "T", "N", "R"].map((c) => `${c} ${h.codes[c]}`).join(", ");
    expect(q("huffman-002").prompt).toContain(list);
    expect(q("huffman-003").prompt).toContain(list);
    const bits = Object.entries(FREQ).reduce((s, [ch, f]) => s + f * h.codes[ch].length, 0);
    expect(blanks("huffman-002")).toEqual([String(bits), String(sum(Object.values(FREQ)) * 8)]);
    expect(blanks("huffman-003")).toEqual([huffmanDecode(h.codes, "1111010110011101")]);
  });

  it("크러스컬·프림·다익스트라", () => {
    const k = kruskal(V6, E6);
    expect(blanks("kruskal-001")).toEqual([k.added.map((e) => e[2]).join(""), String(k.total)]);
    expect(picked("kruskal-002")).toBe(`(A) (${k.discarded[0][0]},${k.discarded[0][1]}), (B) ${k.added.length + k.discarded.length}`);
    const p = prim(V6, E6, "c");
    expect(blanks("prim-001")).toEqual([p.order.join("")]);
    expect(p.total).toBe(k.total);
    const s = p.snapshots[2]; // T = {c, a, e}
    expect(picked("prim-002")).toBe(`D[b] = ${s.b}, D[d] = ${s.d}, D[f] = ${s.f}`);
    const d = dijkstra(VR, ER, "s", false);
    expect(blanks("dijkstra-001")).toEqual([d.order.join(""), String(d.d.t)]);
    const s2 = d.snapshots[1];
    expect(picked("dijkstra-002")).toBe(`D[a] = ${s2.a}, D[c] = ${s2.c}, D[d] = ${s2.d}`);
  });
});

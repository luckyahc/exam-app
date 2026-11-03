import { describe, expect, it } from "vitest";
import { dfsSpanRange, dijkstra, isTopoOrder, bfs, dfs, mstCount, prim, scc } from "@/lib/sim/algorithm/graph";
import { lunchMinFinish, maxCompatibleBrute, roomSchedule } from "@/lib/sim/algorithm/greedy";
import { answerKey } from "@/lib/qtypes/answerKey";
import { isJokbo } from "@/lib/quiz/jokbo";
import type { Question } from "@/types/question";
import { graphJokbo, greedyJokbo } from "./finalJokbo";

// 기말 범위 족보(inventory.md §4 #112~122): F22 = LMS 정답이 시뮬레이터와 같은지, F23(정답표 없음) = 시뮬레이터로 구한 정답.

type Choice = Question & { choices: string[]; answerIndex: number };
const all = [...greedyJokbo, ...graphJokbo];
const q = (id: string) => all.find((x) => x.id === `algorithm-${id}`) as Choice;
const picked = (id: string) => q(id).choices[q(id).answerIndex];
const blanks = (id: string) => answerKey(q(id)) as string[];
const seq = (s: string) => s.split(/\s*->\s*/);

// F22-15·F23-13 그래프: 각 정점의 이웃을 1시 방향부터 시계 방향으로
const CLOCK = { a: ["i", "j", "b"], i: ["h", "j", "a"], h: ["e", "j", "i"], j: ["h", "d", "c", "b", "a", "i"], b: ["j", "c", "a"], c: ["d", "b", "j"], d: ["e", "c", "j"], e: ["g", "f", "d", "h"], g: ["e"], f: ["e"] };

describe("기말 범위 족보", () => {
  it("모두 족보 문항·기말 챕터·보기 순서 고정", () => {
    for (const x of all) {
      expect(isJokbo(x), x.id).toBe(true);
      expect(["greedy", "graph"]).toContain(x.chapter);
      if (x.type === "mcq") expect(x.shuffle, x.id).toBe(false);
    }
    expect([greedyJokbo.length, graphJokbo.length]).toEqual([2, 8]);
  });

  it("그리디: 겨울나기 = 종료 시각 순 배정 = 전수 탐색, 전자레인지 = 순서 전수 탐색", () => {
    const prey: [string, number, number][] = [["A", 1, 4], ["B", 5, 4], ["C", 4, 2], ["D", 5, 1], ["E", 6, 1], ["F", 1, 9], ["G", 1, 3], ["H", 2, 3], ["I", 3, 3], ["J", 3, 1], ["K", 4, 1], ["L", 5, 1]];
    const iv = prey.map(([n, t, d]) => [n, t, t + d] as [string, number, number]);
    expect(blanks("greedy-jokbo-001")).toEqual([String(roomSchedule(iv, "finish").length)]);
    expect(maxCompatibleBrute(iv.map(([, s, f]) => [s, f]))).toBe(roomSchedule(iv, "finish").length);
    expect(blanks("greedy-jokbo-002")).toEqual([String(lunchMinFinish([[1, 4], [1, 9], [1, 3], [2, 3], [3, 1]]))]);
  });

  it("F22 LMS 정답 = 시뮬레이터(다익스트라·프림·시계 방향 DFS)", () => {
    const e: [string, string, number][] = [["0", "a", 8], ["0", "f", 5], ["0", "g", 11], ["a", "b", 10], ["f", "a", 2], ["f", "b", 1], ["f", "g", 3], ["b", "c", 2], ["e", "f", 12], ["e", "c", 5], ["g", "e", 8], ["g", "d", 8], ["d", "e", 7], ["c", "d", 4]];
    expect(picked("graph-jokbo-001")).toBe(String(dijkstra(["0", "a", "b", "c", "d", "e", "f", "g"], e, "0").d.d));
    const pe: [string, string, number][] = [["a", "b", 11], ["b", "c", 14], ["a", "g", 9], ["c", "g", 5], ["a", "f", 7], ["f", "g", 13], ["g", "d", 12], ["f", "d", 8], ["f", "e", 10], ["e", "d", 7]];
    expect(seq(picked("graph-jokbo-002"))).toEqual(prim(["a", "b", "c", "d", "e", "f", "g"], pe, "a").order);
    expect(seq(picked("graph-jokbo-003"))).toEqual(dfs(CLOCK, ["a"]).order);
  });

  it("F23 정답 = 시뮬레이터(위상 정렬·BFS·강연결요소·DFS span·최소 신장 트리 개수)", () => {
    const t = { a: ["d", "b"], b: ["c"], c: [], d: ["e", "f"], e: ["f", "g"], f: ["g", "h"], g: [], h: [] };
    const bad = q("graph-jokbo-004").choices.flatMap((c, i) => (isTopoOrder(t, seq(c)) ? [] : [i]));
    expect(bad).toEqual([q("graph-jokbo-004").answerIndex]);
    expect(seq(picked("graph-jokbo-005"))).toEqual(bfs(CLOCK, "a").order);
    const g = { a: ["i", "j", "b"], b: ["c"], c: ["e"], d: ["c"], e: ["d"], f: ["j", "b", "c"], g: ["f"], h: ["g"], i: ["h"], j: ["i", "h", "b"] };
    const big = scc(g).sort((x, y) => y.length - x.length)[0];
    expect(blanks("graph-jokbo-006")).toEqual([big.join("")]);
    // F23-17 트리: v - s0(이파리 s1~s4) - m0(이파리 4) - n0(이파리 4) - z
    const tree: Record<string, string[]> = { v: ["s0"], s0: ["v", "s1", "s2", "s3", "s4", "m0"], m0: ["s0", "m1", "m2", "m3", "m4", "n0"], n0: ["m0", "n1", "n2", "n3", "n4", "z"] };
    for (const k of ["s", "m", "n"]) for (const i of [1, 2, 3, 4]) tree[`${k}${i}`] = [`${k}0`];
    tree.z = ["n0"];
    expect(blanks("graph-jokbo-007")).toEqual(dfsSpanRange(tree, "v", ["s0", "s1", "s2", "s3", "s4"]).map(String));
    const me: [string, string, number][] = [["x", "A", 5], ["x", "C", 6], ["A", "B", 2], ["A", "E", 2], ["B", "F", 2], ["E", "F", 2], ["E", "H", 2], ["F", "H", 2], ["C", "D", 2], ["C", "G", 2], ["G", "H", 2]];
    expect(blanks("graph-jokbo-008")).toEqual([String(mstCount(["x", "A", "B", "C", "D", "E", "F", "G", "H"], me).count)]);
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { closestPair, closestPairCalls, middleRegion } from "@/lib/sim/algorithm/closestPair";
import { coinChange, editDistanceTable, greedyCoins, knapsackGreedyByRatio, knapsackItems, knapsackTable } from "@/lib/sim/algorithm/dp";
import { answerKey } from "@/lib/qtypes/answerKey";
import { isJokbo } from "@/lib/quiz/jokbo";
import type { Question } from "@/types/question";
import algorithm from "./index";

// 알고리즘 일반 문항(족보에 없던 주제, 2026-10-15): 정답 = lib/sim/algorithm, 대조 기록 = docs/verification/algorithm-general.md

const ROOT = path.resolve(import.meta.dirname, "../../..");
type Choice = Question & { choices: string[]; answerIndex: number };

describe("알고리즘 일반 문항", async () => {
  const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
  const general = all.filter((x) => !isJokbo(x) && !x.basedOn); // 족보 유형 생성 문항(basedOn)은 patterns.test.ts
  const q = (id: string) => all.find((x) => x.id === `algorithm-${id}`) as Choice;
  const picked = (id: string) => q(id).choices[q(id).answerIndex];
  const blanks = (id: string) => answerKey(q(id)) as string[];

  it("최근접 점의 쌍 4 · 편집 거리 3 · 배낭 2 · 동전 거스름돈 3 · 비교 1, 난이도 보통·어려움, 보기 순서 고정", () => {
    expect(general.map((x) => x.id.replace(/^algorithm-/, "").replace(/-\d{3}$/, ""))).toEqual([
      ...Array(4).fill("dc-closest-pair"),
      ...Array(3).fill("dp-edit-distance"),
      ...Array(2).fill("dp-knapsack"),
      ...Array(3).fill("dp-coin-change"),
      "dp-complexity",
    ]);
    for (const x of general) {
      expect([2, 3], x.id).toContain(x.difficulty);
      if (x.type === "mcq") expect(x.shuffle, x.id).toBe(false);
    }
  });

  it("최근접 점의 쌍 정답 = 시뮬레이터", () => {
    const fmt = (xs: number[]) => xs.map((x) => `(${x},-)`).join(", ");
    expect(picked("dc-closest-pair-001")).toBe(fmt(middleRegion([3, 10, 16, 21, 27, 30, 34, 40, 49, 55], 5, 8)));
    const t = closestPair([[2, 20], [8, 4], [14, 12], [19, 30], [22, 34], [26, 10], [31, 22], [40, 40]]);
    expect(blanks("dc-closest-pair-002")).toEqual([t.cpl.dist, t.cpr.dist, t.middle.length, t.result.dist].map(String));
    expect(t.result).toBe(t.cpc);
    expect(blanks("dc-closest-pair-004")).toEqual(["7", "6", String(closestPairCalls(13))]);
  });

  it("편집 거리·배낭·동전 거스름돈 정답 = 시뮬레이터", () => {
    const e = editDistanceTable("bread", "board");
    expect(blanks("dp-edit-distance-001")).toEqual([String(e[2][2] + e[3][3] + e[4][3] + e[5][5])]);
    expect(picked("dp-edit-distance-002")).toBe(String(editDistanceTable("algorithm", "logarithm")[9][9]));

    const k1: [number, number][] = [[3, 25], [4, 30], [2, 15], [5, 40]];
    const k = knapsackTable(k1, 8);
    expect(blanks("dp-knapsack-001")).toEqual([k[2][7], k[3][5], k[4][8]].map(String));
    // 지문 표에 보이는 칸 = 시뮬레이터
    expect([k[1].slice(0, 9), k[2].slice(0, 7), k[2][8], k[3].slice(0, 5), k[3][6]]).toEqual([[0, 0, 0, 25, 25, 25, 25, 25, 25], [0, 0, 0, 25, 30, 30, 30], 55, [0, 0, 15, 25, 30], 45]);
    const k2: [number, number][] = [[6, 48], [5, 35], [5, 34], [2, 8]];
    expect(picked("dp-knapsack-002")).toBe(`${knapsackTable(k2, 10)[4][10]}, 물건 ${knapsackItems(k2, 10).join(", ")}`);
    const g = knapsackGreedyByRatio(k2, 10);
    expect(q("dp-knapsack-002").choices).toContain(`${g.value}, 물건 ${g.items.join(", ")}`);

    const c1 = coinChange([15, 9, 1], 18).c;
    expect(blanks("dp-coin-change-001")).toEqual([c1[10], c1[18], greedyCoins([15, 9, 1], 18)].map(String));
    const c2 = coinChange([10, 7, 1], 21).c;
    expect(blanks("dp-coin-change-002")).toEqual([[13, 14, 17, 21].map((j) => c2[j]).join("")]);
    const c3 = coinChange([14, 9, 5, 1], 18);
    expect(picked("dp-coin-change-003")).toBe(`${c3.updates[18]}회, ${c3.c[18]}`);
    expect(q("dp-coin-change-003").choices).toContain(`${c3.updates[18]}회, ${greedyCoins([14, 9, 5, 1], 18)}`);
  });

  it("docs/verification/algorithm-general.md: id·순서 = 데이터, 정답 열 = 데이터 정답", () => {
    const doc = readFileSync(path.join(ROOT, "docs/verification/algorithm-general.md"), "utf8").split(/\r?\n/);
    const rows = doc.filter((l) => /^\| \d+ \| `algorithm-/.test(l)).map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(general.map((x) => x.id));
    for (const [i, x] of general.entries()) {
      const key = answerKey(x);
      const answer = x.type === "mcq" ? (x as Choice).choices[(x as Choice).answerIndex] : (key as string[]).join(" / ");
      expect(rows[i][5], x.id).toBe(answer);
    }
  });
});

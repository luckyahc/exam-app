import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { bellmanFord, edgeLimited, floydUpTo, INF, lcsTable, matrixChain, maxPathSum, pebbleMax, scholarshipMax } from "@/lib/sim/algorithm/dp";
import { countingSort, isMinHeap, linearSelectRatio, partition, radixPositions, selectStep } from "@/lib/sim/algorithm/sorting";
import { answerKey } from "@/lib/qtypes/answerKey";
import type { Question } from "@/types/question";
import algorithm from "./index";

// Sprint 21 알고리즘 족보: inventory ↔ 데이터, 원문 그대로(보기 순서 고정), 계산·추적 정답 = lib/sim/algorithm, 그림 파일 규칙

const ROOT = path.resolve(import.meta.dirname, "../../..");
const inventory = readFileSync(path.join(ROOT, "docs/jokbo/algorithm/inventory.md"), "utf8");
type Choice = Question & { choices: string[]; answerIndex: number; answerIndexes: number[] };

describe("알고리즘 족보 문항", async () => {
  const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
  const byId = new Map(all.map((q) => [q.id, q]));
  const q = (id: string) => byId.get(`algorithm-${id}`) as Choice;
  const picked = (id: string) => q(id).choices[q(id).answerIndex];
  const pickedMany = (id: string) => q(id).answerIndexes.map((i) => q(id).choices[i]);
  const blank = (id: string) => (answerKey(q(id)) as string[])[0];

  it("inventory의 대표 문항 53개 = 데이터, 출현 기록 107개(같은 문제 54 포함)·중복 없음", () => {
    const reps = [...new Set([...inventory.matchAll(/대표 `(algorithm-[a-z]+-jokbo-\d{3})`/g)].map((m) => m[1]))];
    expect(reps).toHaveLength(53);
    expect(all.map((x) => x.id).sort()).toEqual(reps.sort());
    const occ = all.flatMap((x) => x.jokbo!.occurrences.map((o) => `${o.term} ${o.number}`));
    expect(occ).toHaveLength(107);
    expect(new Set(occ).size).toBe(107);
    for (const m of inventory.matchAll(/\| \d+ \| ([A-Z]\d\d)-([^ |]+) \| [^|]+ \| (?:대표|같은 문제 →) `(algorithm-[a-z]+-jokbo-\d{3})`/g)) {
      const n = m[2] === "미표기" ? "번호 미표기" : m[2];
      expect(byId.get(m[3])!.jokbo!.occurrences.some((o) => o.file && o.number === n), `${m[1]}-${m[2]} → ${m[3]}`).toBe(true);
    }
  });

  it("variantGroup = inventory, 보기 순서 고정", () => {
    for (const m of inventory.matchAll(/대표 `(algorithm-[a-z]+-jokbo-\d{3})`, vg `([a-z-]+)`/g)) expect(byId.get(m[1])!.jokbo!.variantGroup, m[1]).toBe(`algorithm-vg-${m[2]}`);
    for (const x of all) if (x.type === "mcq" || x.type === "multi") expect(x.shuffle, x.id).toBe(false);
  });

  it("그림: public/jokbo/algorithm/<id>.png, 가로 1200px 이하·300KB 이하, 실제 크기 = figure 크기", () => {
    const withFig = all.filter((x) => x.figure);
    expect(withFig.map((x) => x.id)).toEqual(["algorithm-dp-jokbo-010", "algorithm-dp-jokbo-011", "algorithm-dp-jokbo-012", "algorithm-dp-jokbo-013", "algorithm-dp-jokbo-014", "algorithm-dp-jokbo-015"]);
    for (const x of withFig) {
      const file = path.join(ROOT, "public", x.figure!.src);
      const buf = readFileSync(file);
      expect(statSync(file).size, x.id).toBeLessThanOrEqual(300 * 1024);
      expect([buf.readUInt32BE(16), buf.readUInt32BE(20)], x.id).toEqual([x.figure!.width, x.figure!.height]);
      expect(x.figure!.width).toBeLessThanOrEqual(1200);
    }
  });

  it("정렬·선택 정답 = 시뮬레이터", () => {
    expect(picked("sorting-jokbo-001")).toBe(countingSort([3, 2, 3, 1, 1, 4, 2, 3, 1, 2], 4).c2.join(", "));
    expect(picked("sorting-jokbo-002")).toBe(countingSort([3, 4, 2, 1, 1, 4, 2, 3, 1, 2], 4).c2.join(", "));
    const arrs = (s: string) => JSON.parse(s) as number[];
    expect(q("sorting-jokbo-005").choices.filter((c) => isMinHeap(arrs(c)))).toEqual(pickedMany("sorting-jokbo-005"));
    expect(picked("sorting-jokbo-006")).toBe(String(partition([12, 70, 50, 20, 30, 25, 40, 55], 1, 8)));
    expect(picked("sorting-jokbo-007")).toBe(String(partition([50, 70, 30, 20, 55, 25, 40, 12], 1, 8)));
    expect(picked("sorting-jokbo-008")).toBe(String(partition([12, 70, 50, 20, 55, 25, 40, 30], 1, 8)));
    expect(blank("sorting-jokbo-009")).toBe(radixPositions(["0123", "2154", "0222", "0004", "0283", "1560", "1061", "2150"], "0283").join(""));
    expect(picked("dc-jokbo-002")).toBe(linearSelectRatio(7).join(": "));
    expect(picked("dc-jokbo-003")).toBe(linearSelectRatio(9).join(": "));
    const s1 = selectStep([12, 70, 50, 20, 55, 25, 40, 30, 65, 29], 8);
    expect(picked("dc-jokbo-004")).toBe(`(1)은 ${s1.k}, (${s1.call}) 호출, (4)는 ${s1.nextI}`);
    const s2 = selectStep([12, 70, 50, 20, 55, 25, 40, 30, 29, 65], 3);
    expect(picked("dc-jokbo-005")).toBe(`(1)은 ${s2.k}, (${s2.call}) 호출, (4)는 ${s2.nextI}`);
  });

  it("DP·최단 경로 정답 = 시뮬레이터", () => {
    const M = (first: number) => [[first, 7, 2, 5], [5, 3, 11, 18], [7, 9, 3, 3], [8, 10, 14, 9]];
    expect(blank("dp-jokbo-001")).toBe(String(scholarshipMax([[400, 500], [800, 600], [100, 300], [300, 700]])));
    const m = matrixChain([1, 2, 5, 3, 3]);
    expect([blank("dp-jokbo-002"), blank("dp-jokbo-003")]).toEqual([String(m[2][4]), String(m[1][4])]);
    expect(picked("dp-jokbo-004")).toBe(String(maxPathSum(M(6))));
    expect(picked("dp-jokbo-005")).toBe(String(maxPathSum(M(4))));
    expect(blank("dp-jokbo-006")).toBe(String(maxPathSum([[2, 0, 2], [1, 2, 1], [0, 2, 2], [2, 1, 2], [1, 2, 1]])));
    const t = lcsTable("ABCB", "ABCD");
    expect(blank("dp-jokbo-007")).toBe(String(t[2][1] + t[2][2] + t[3][4] + t[4][3]));
    expect(picked("dp-jokbo-008")).toBe(String(pebbleMax([[6, 7, 9, -5], [-8, 10, 11, 9], [11, 12, 7, 4]])));
    expect(picked("dp-jokbo-009")).toBe(String(pebbleMax([[4, 7, 12, -5], [-6, 10, 14, 9], [9, 12, 7, 4]])));
    const W = [[0, 8, 1, 5], [INF, 0, 3, INF], [INF, INF, 0, 3], [INF, -5, INF, 0]];
    const dc = floydUpTo(W, 3);
    expect([picked("dp-jokbo-010"), picked("dp-jokbo-011")]).toEqual([String(dc[1][3]), String(dc[0][3])]);
    expect(blank("dp-jokbo-012")).toBe(String(floydUpTo(W, 4)[0][1]));
    const l2 = edgeLimited(W, 2);
    expect([picked("dp-jokbo-013"), blank("dp-jokbo-014")]).toEqual([String(l2[3][2]), String(l2[1][3])]);
    const e: [string, string, number][] = [
      ["0", "a", 8], ["0", "f", 10], ["0", "g", 13], ["f", "a", -11], ["a", "b", 7], ["f", "b", -5], ["f", "g", -3],
      ["g", "e", 8], ["g", "d", 8], ["e", "f", 12], ["e", "c", 5], ["b", "c", 5], ["c", "d", 4], ["d", "e", -7],
    ];
    expect(picked("dp-jokbo-015")).toBe(String(bellmanFord(["0", "a", "b", "c", "d", "e", "f", "g"], e, "0").e));
  });

  it("충돌 문항(sorting-011)은 해설이 '족보 답(…)과 다름'으로 시작하고 힙 정렬을 정답에서 뺀다", () => {
    expect(q("sorting-jokbo-011").explanation).toMatch(/^족보 답\(삽입·힙·계수 정렬\)과 다름/);
    expect(pickedMany("sorting-jokbo-011")).toEqual(["삽입 정렬", "계수 정렬"]);
  });

  it.each(["analysis", "recurrence", "sorting", "dc", "dp"])("docs/verification/algorithm-%s.md: id·순서 = 데이터, 요약 숫자 = 표", async (ch) => {
    const doc = readFileSync(path.join(ROOT, `docs/verification/algorithm-${ch}.md`), "utf8").split(/\r?\n/);
    const rows = doc.filter((l) => /^\| \d+ \| `algorithm-/.test(l)).map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    const ids = (await algorithm.chapters.find((c) => c.id === ch)!.load()).map((x) => x.id);
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(ids);
    const sum = (label: string) => Number(doc.find((l) => l.startsWith(`| ${label} | `))?.split("|")[2]);
    expect(sum("전체")).toBe(rows.length);
    expect(sum("족보 답 일치")).toBe(rows.filter((r) => r[6] === "일치").length);
    expect(sum("족보 답과 다름(충돌)")).toBe(rows.filter((r) => r[6] === "충돌").length);
    expect(sum("족보 답 없음")).toBe(rows.filter((r) => r[6] === "답 없음").length);
    expect(sum("원본 스캔 대조 수정")).toBe(rows.filter((r) => r[5].startsWith("수정")).length);
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compareGrowth, euclidCalls, hanoiMoves, masterCase, recurrence, sum, term, type LnFn } from "@/lib/sim/algorithm/recursion";
import {
  buildHeapSteps,
  countingSort,
  heapSortComparisons,
  insertionComparisons,
  isMinHeap,
  mergeSortComparisons,
  partition,
  quickSortComparisons,
  radixPositions,
  radixSteps,
} from "@/lib/sim/algorithm/sorting";
import { answerKey } from "@/lib/qtypes/answerKey";
import { isJokbo } from "@/lib/quiz/jokbo";
import type { Question } from "@/types/question";
import algorithm from "./index";

// 족보 유형 생성 문항(강의 자료 2·3, 2026-10-16): 바탕 족보·유형·난이도, 해설 형식, 정답 = lib/sim/algorithm(오답 보기가 정답이 되지 않는지 포함),
// docs/jokbo/algorithm/pattern-analysis.md = 데이터

const ROOT = path.resolve(import.meta.dirname, "../../..");
type Q = Question & { choices: string[]; answerIndex: number; answerIndexes: number[] };
/** 개념 문항 — 시뮬레이터로 정답을 계산할 수 없다(문서의 검증 열 "개념") */
const UNVERIFIED = ["algorithm-sorting-linear-001", "algorithm-sorting-linear-002"];
/** 강의 범위가 애매해 유형 분석에서 뺀 족보(피보나치 중복 재귀 — 출처가 강의 자료 5 DP) */
const EXCLUDED = ["algorithm-recurrence-jokbo-011"];

const [ONE, LOG, N, NLOGN, N2, N3] = [term(0), term(0, 1), term(1), term(1, 1), term(2), term(3)];
/** 여러 지점 값으로 정한 수행 시간 T의 ln (x = log₂n) */
const lnOf =
  (f: (n: number) => number): LnFn =>
  (x) =>
    Math.log(f(2 ** x));
/** 보기 중 T와 같은 증가율(Θ)인 것의 번호 */
const sameAs = (t: LnFn, gs: LnFn[], x1: number, x2: number) => gs.flatMap((g, i) => (compareGrowth(t, g, x1, x2) === 0 ? [i] : []));
type Rel = "O" | "Ω" | "Θ";
/** 모든 입력(입력 종류별 시간 fs)에 공통으로 rel(g)가 성립하는가 */
const holds = (fs: LnFn[], rel: Rel, g: LnFn) =>
  fs.every((f) => {
    const c = compareGrowth(f, g);
    return rel === "O" ? c <= 0 : rel === "Ω" ? c >= 0 : c === 0;
  });

describe("알고리즘 족보 유형 생성 문항", async () => {
  const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
  const pats = all.filter((x) => x.basedOn) as Q[];
  const byId = new Map(all.map((x) => [x.id, x as Q]));
  const q = (id: string) => byId.get(`algorithm-${id}`)!;
  const picked = (id: string) => q(id).choices[q(id).answerIndex];
  const pickedMany = (id: string) => q(id).answerIndexes.map((i) => q(id).choices[i]);
  const blank = (id: string) => (answerKey(q(id)) as string[])[0];
  const truthIdx = (bs: boolean[]) => bs.flatMap((b, i) => (b ? [i] : []));

  it("40문항(최대 40) — 바탕 족보는 강의 자료 2·3 챕터의 족보, 같은 챕터·같은 문항 타입, 족보 표시 없음, 유형마다 보통(2)·어려움(3) 하나 이상", () => {
    expect(pats).toHaveLength(40);
    const kinds = new Map<string, Set<number>>();
    for (const x of pats) {
      expect(x.origin, x.id).toBeUndefined();
      expect(x.jokbo, x.id).toBeUndefined();
      expect(["analysis", "recurrence", "sorting"]).toContain(x.chapter);
      const bases = x.basedOn!.map((id) => byId.get(id)!);
      for (const [i, b] of bases.entries()) {
        expect(b && isJokbo(b), x.basedOn![i]).toBe(true);
        expect(b.chapter, x.id).toBe(x.chapter);
        expect(EXCLUDED).not.toContain(b.id);
      }
      expect(bases.map((b) => b.type), x.id).toContain(x.type);
      expect([2, 3], x.id).toContain(x.difficulty);
      if (x.type === "mcq" || x.type === "multi") expect(x.shuffle, x.id).toBe(false);
      const kind = x.id.replace(/-\d{3}$/, "");
      kinds.set(kind, (kinds.get(kind) ?? new Set()).add(x.difficulty));
    }
    for (const [kind, ds] of kinds) expect([...ds].sort(), kind).toEqual([2, 3]);
  });

  it("해설 = 풀이 + 원문과 달라진 점 1줄 + 함정 1줄", () => {
    const bad = pats.filter((x) => !/^풀이: [^\n]+ 원문과 달라진 점: [^\n]+ 함정: [^\n]+$/.test(x.explanation) || x.explanation.split("원문과 달라진 점:").length !== 2 || x.explanation.split("함정:").length !== 2);
    expect(bad.map((x) => x.id)).toEqual([]);
  });

  it("점근 분석: 입력별 시간 → O·Ω·Θ, 함수 관계, 포함 순서 = 증가율 비교", () => {
    expect(picked("analysis-bound-001")).toBe(holds([N2, N], "Ω", N) ? "예" : "아니오");
    const three = [N2, LOG, NLOGN];
    const pairs: [Rel, LnFn][][] = [[["O", N2], ["Ω", LOG]], [["O", NLOGN], ["Ω", N]], [["Θ", NLOGN]], [["O", N2], ["Ω", NLOGN]]];
    expect(truthIdx(pairs.map((p) => p.every(([r, g]) => holds(three, r, g))))).toEqual([q("analysis-bound-002").answerIndex]);
    const fill = [LOG, NLOGN, sum(term(1, 0, 0, 100), term(0, 0, 0, 5)), N2];
    expect(truthIdx(fill.map((f) => holds([f, N], "Θ", N)))).toEqual([q("analysis-bound-003").answerIndex]);

    // 최악의 경우 = 가장 느린 입력 하나
    type St = ["all" | "worst", Rel, LnFn];
    const judge = (fs: LnFn[], sts: St[]) => {
      const worst = [...fs].sort((f, g) => compareGrowth(g, f))[0];
      return sts.map(([k, r, g]) => holds(k === "all" ? fs : [worst], r, g));
    };
    const falseIdx = (bs: boolean[]) => truthIdx(bs.map((b) => !b));
    expect(falseIdx(judge([N3, N], [["all", "Θ", N3], ["all", "O", N3], ["worst", "Θ", N3], ["all", "Ω", N], ["all", "O", N]]))).toEqual(q("analysis-worst-001").answerIndexes);
    expect(
      falseIdx(judge([NLOGN, N2], [["all", "Θ", N2], ["all", "O", N2], ["all", "Ω", N2], ["all", "Ω", NLOGN], ["worst", "Θ", N2], ["worst", "O", NLOGN]])),
    ).toEqual(q("analysis-worst-002").answerIndexes);

    const rel = (f: LnFn, cs: [Rel, LnFn][], x1?: number, x2?: number) =>
      truthIdx(cs.map(([r, g]) => (c => (r === "O" ? c <= 0 : r === "Ω" ? c >= 0 : c === 0))(compareGrowth(f, g, x1, x2))));
    expect(rel(sum(term(2, 1), term(2, 0, 0, 5)), [["Ω", N2], ["Θ", N2], ["O", N3], ["Ω", N3], ["Θ", term(2, 1)]])).toEqual(q("analysis-relation-001").answerIndexes);
    expect(rel(sum(term(2, -1), term(1, 0, 0, 100)), [["O", N2], ["Ω", N2], ["Θ", N2], ["Ω", NLOGN], ["O", NLOGN], ["Ω", N]])).toEqual(q("analysis-relation-002").answerIndexes);
    // 지수 함수는 n이 1000을 넘어서야 n¹⁰⁰을 앞선다 — x = 10·20(n = 2¹⁰·2²⁰)에서 비교
    const EXP = term(0, 0, 1);
    expect(rel(sum(term(0, 0, 1, 2), term(100)), [["Θ", EXP], ["O", term(100)], ["Ω", term(100)], ["Θ", term(100)], ["Ω", N2]], 10, 20)).toEqual(q("analysis-relation-003").answerIndexes);

    const order = (fs: Record<string, LnFn>) => {
      const ks = Object.keys(fs).sort();
      const sorted = [...ks].sort((a, b) => compareGrowth(fs[a], fs[b], 10, 20));
      return { word: sorted.join(""), ties: sorted.slice(1).filter((k, i) => compareGrowth(fs[k], fs[sorted[i]], 10, 20) === 0).length };
    };
    expect(order({ A: N2, B: ONE, C: EXP, D: N, E: NLOGN, F: LOG, G: N3 })).toEqual({ word: blank("analysis-order-001"), ties: 0 });
    const o2 = order({ A: N2, B: term(0, 1, 0, 2), C: term(0.5), D: term(1, -1), E: EXP, F: NLOGN, G: LOG });
    expect(o2).toEqual({ word: blank("analysis-order-002"), ties: 1 });
  });

  it("점화식: 마스터 정리 적용 여부·해, 코드·반복문 실행 횟수, 재귀 호출 수, 재귀 트리 = 값 계산", () => {
    type Form = { a: number; b: number; f: LnFn } | "minus" | "shift";
    const cannot = (fs: Form[]) => truthIdx(fs.map((x) => typeof x === "string" || masterCase(x.a, x.b, x.f) === null));
    expect(cannot([{ a: 4, b: 2, f: N }, "minus", "shift", { a: 9, b: 3, f: N2 }, { a: 2, b: 2, f: term(1, -1) }])).toEqual(q("recurrence-master-apply-001").answerIndexes);
    expect(cannot([{ a: 2, b: 2, f: NLOGN }, { a: 0.5, b: 2, f: N }, { a: 16, b: 4, f: N2 }, { a: 3, b: 4, f: NLOGN }, { a: 4, b: 2, f: term(2, -1) }])).toEqual(
      q("recurrence-master-apply-002").answerIndexes,
    );

    const T = (a: number, b: number, g: (n: number) => number, base = 1) => lnOf((n) => recurrence(n, Array(a).fill((m: number) => m / b), g, base));
    expect(sameAs(T(4, 2, (n) => n), [N, NLOGN, N2, term(2, 1), N3], 10, 20)).toEqual([q("recurrence-master-001").answerIndex]);
    expect(sameAs(T(7, 2, (n) => n * n), [N2, term(2, 1), term(Math.log2(7)), N3, term(3.5)], 10, 20)).toEqual([q("recurrence-master-002").answerIndex]);
    const as = q("recurrence-master-003").choices.map(Number);
    expect(truthIdx(as.map((a) => compareGrowth(T(a, 4, (n) => n), NLOGN, 12, 24) === 0))).toEqual([q("recurrence-master-003").answerIndex]);

    // 코드를 그대로 옮긴 실행 횟수(반복문 본문 + 기저 1)
    const code1 = (n: number): number => (n <= 1 ? 1 : n + code1(Math.floor(n / 2)));
    const code2 = (n: number): number => (n <= 1 ? 1 : n * n + 4 * code2(Math.floor(n / 2)));
    const halves = (n: number) => {
      let c = 0;
      for (let i = n; i > 1; i = Math.floor(i / 2)) c++;
      return c;
    };
    const code3 = (n: number): number => (n <= 1 ? 1 : halves(n) + 2 * code3(Math.floor(n / 2)));
    const C5 = [LOG, N, NLOGN, N2, term(0.5)];
    expect(sameAs(lnOf(code1), C5, 10, 20)).toEqual([q("recurrence-code-001").answerIndex]);
    expect(sameAs(lnOf(code2), [N2, term(2, 1), N3, NLOGN, term(4)], 10, 20)).toEqual([q("recurrence-code-002").answerIndex]);
    expect(sameAs(lnOf(code3), [LOG, N, NLOGN, term(0, 2), N2], 10, 20)).toEqual([q("recurrence-code-003").answerIndex]);

    const loop1 = (n: number) => {
      let c = 0;
      for (let i = 1; i <= n; i++) for (let j = 1; j <= i; j++) c += j; // for k = 1 to j
      return c;
    };
    const loop2 = (n: number) => {
      let c = 0;
      for (let i = 1; i <= n; i++) for (let j = n; j >= 1; j = Math.floor(j / 2)) c += j; // for k = 1 to j
      return c;
    };
    expect(sameAs(lnOf(loop1), [N, N2, term(2, 1), N3, term(4)], 5, 10)).toEqual([q("recurrence-loop-001").answerIndex]);
    expect(sameAs(lnOf(loop2), [NLOGN, N2, term(2, 1), N3, term(1, 2)], 6, 12)).toEqual([q("recurrence-loop-002").answerIndex]);

    expect(q("recurrence-recursive-001").choices.filter((c) => Number(c) === euclidCalls(89, 55))).toEqual([picked("recurrence-recursive-001")]);
    expect(q("recurrence-recursive-002").choices.filter((c) => hanoiMoves(Number(c)) === 1023)).toEqual([picked("recurrence-recursive-002")]);

    const tree = (parts: ((n: number) => number)[], base = 1) => lnOf((n) => recurrence(n, parts, (m) => m, base));
    expect(sameAs(tree([(n) => n / 3, (n) => (2 * n) / 3]), [N, NLOGN, N2, LOG, term(1.5)], 8, 24)).toEqual([q("recurrence-tree-001").answerIndex]);
    expect(sameAs(tree(Array(4).fill((n: number) => n / 2 + 3), 12), [NLOGN, N, N2, term(2, 1), LOG], 10, 20)).toEqual([q("recurrence-tree-002").answerIndex]);
    expect(sameAs(tree([(n) => n / 4, (n) => n / 4, (n) => n / 2]), [N, NLOGN, N2, term(0.5), term(1.5)], 8, 24)).toEqual([q("recurrence-tree-003").answerIndex]);
  });

  it("정렬: 계수·partition·힙·buildHeap·기수 정렬 = 시뮬레이터, 입력 상태별 비교 횟수", () => {
    const arr = (s: string) => JSON.parse(s) as number[];
    const c1 = countingSort([2, 4, 1, 3, 2, 4, 4, 1, 2, 3], 4);
    expect(picked("sorting-counting-001")).toBe(c1.c2.join(", "));
    expect(q("sorting-counting-001").prompt).toContain(`B[]  = [${c1.b.join(", ")}]`);
    expect(q("sorting-counting-002").choices.filter((c) => countingSort(arr(c), 5).c2.join() === "1,4,4,7,9")).toEqual([picked("sorting-counting-002")]);

    const tail = (id: string) => arr(/- (\[[^\]]+\])$/.exec(q(id).prompt)![1]);
    for (const id of ["sorting-partition-001", "sorting-partition-002"]) {
      const p = String(partition(tail(id), 1, 8));
      expect(q(id).choices.filter((c) => c === p), id).toEqual([picked(id)]);
    }
    expect(q("sorting-partition-003").choices.filter((c) => partition(arr(c), 1, 8) === 5)).toEqual([picked("sorting-partition-003")]);

    for (const id of ["sorting-heap-001", "sorting-heap-002"]) expect(q(id).choices.filter((c) => isMinHeap(arr(c))), id).toEqual(pickedMany(id));

    const steps = buildHeapSteps([40, 30, 50, 10, 20, 60, 70, 5]);
    const shown = Object.fromEntries([...q("sorting-buildheap-001").prompt.matchAll(/\(([A-Z])\) → (\[[^\]]+\])/g)].map((m) => [m[1], m[2]]));
    expect(blank("sorting-buildheap-001").split("").map((k) => shown[k])).toEqual(steps.map((s) => `[${s.join(", ")}]`));
    expect(Object.keys(shown)).toHaveLength(steps.length);
    expect(picked("sorting-buildheap-002")).toBe(String(buildHeapSteps([8, 7, 6, 5, 4, 3, 2, 1]).length));

    const radix: [string, string[], string][] = [
      ["sorting-radix-001", ["0391", "1520", "2043", "0714", "1395", "0602", "2531", "0127"], "0714"],
      ["sorting-radix-002", ["512", "215", "152", "521", "125", "251"], "215"],
    ];
    for (const [id, nums, target] of radix) {
      expect(blank(id), id).toBe(radixPositions(nums, target).join(""));
      for (const s of radixSteps(nums)) expect(q(id).explanation, id).toContain(s.join(" "));
      for (const x of nums) expect(q(id).prompt, id).toContain(x);
    }

    const up = (x: number) => Array.from({ length: 2 ** x }, (_, i) => i + 1);
    const down = (x: number) => up(x).reverse();
    const cmp = (f: (a: number[]) => number, input: (x: number) => number[]) => lnOf((n) => f(input(Math.log2(n))));
    expect(sameAs(cmp(quickSortComparisons, down), [N2, N, term(0.5, 1), term(0.5), NLOGN], 7, 12)).toEqual([q("sorting-input-001").answerIndex]);
    // 정렬된 입력: 삽입 n, 퀵 n²(함정), 병합 n log n — 힙 정렬은 이론상 n log n이지만 족보(교수님) 채점 기준으로 정답
    expect(compareGrowth(cmp(insertionComparisons, up), N, 8, 14)).toBe(0);
    expect(compareGrowth(cmp(quickSortComparisons, up), N2, 7, 12)).toBe(0);
    expect(compareGrowth(cmp(mergeSortComparisons, up), NLOGN, 8, 14)).toBe(0);
    expect(compareGrowth(cmp(heapSortComparisons, up), NLOGN, 8, 14)).toBe(0);
    expect(pickedMany("sorting-input-002")).toEqual(["삽입 정렬", "힙 정렬", "계수 정렬"]);
    expect(q("sorting-input-002").explanation).toMatch(/^풀이: 족보 채점 기준을 따른다 .*이론적으로 힙 정렬은 정렬된 입력에서도 Θ\(n log n\)이다/);
  });

  it("docs/jokbo/algorithm/pattern-analysis.md: 유형표가 강의 자료 2·3 족보를 빠짐없이 한 번씩 묶고, 문항표 = 데이터(id·순서·난이도·정답·검증)", () => {
    const doc = readFileSync(path.join(ROOT, "docs/jokbo/algorithm/pattern-analysis.md"), "utf8").split(/\r?\n/);
    const cells = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const patternRows = doc.filter((l) => /^\| P\d+ \|/.test(l)).map(cells);
    const jokboInDoc = patternRows.flatMap((r) => [...r[2].matchAll(/[a-z]+-jokbo-\d{3}/g)].map((m) => `algorithm-${m[0]}`));
    const scope = all.filter((x) => isJokbo(x) && ["analysis", "recurrence", "sorting"].includes(x.chapter)).map((x) => x.id);
    expect([...jokboInDoc].sort()).toEqual(scope.filter((id) => !EXCLUDED.includes(id)).sort());
    expect(new Set(jokboInDoc).size).toBe(jokboInDoc.length);

    const rows = doc.filter((l) => /^\| \d+ \| `algorithm-/.test(l)).map(cells);
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(pats.map((x) => x.id));
    for (const [i, x] of pats.entries()) {
      const answer = x.type === "mcq" ? picked(x.id.slice(10)) : x.type === "multi" ? pickedMany(x.id.slice(10)).join(" / ") : blank(x.id.slice(10));
      expect(rows[i][3], x.id).toBe(x.difficulty === 2 ? "보통" : "어려움");
      expect(rows[i][5], x.id).toBe(answer);
      expect(rows[i][6], x.id).toBe(UNVERIFIED.includes(x.id) ? "개념" : "시뮬레이터");
    }
  });
});

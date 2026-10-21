import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compareGrowth, euclidCalls, fibCallsOf, hanoiMoves, masterCase, recurrence, term, type LnFn } from "@/lib/sim/algorithm/recursion";
import {
  bubbleComparisons,
  buildHeapSteps,
  countingCAfter,
  countingSort,
  heapSortComparisons,
  heapSortSteps,
  insertionComparisons,
  isMinHeap,
  linearSelectRatio,
  mergeSortComparisons,
  partition,
  quickSortComparisons,
  radixPositions,
  radixSteps,
  selectionComparisons,
  selectStep,
  selectTrace,
} from "@/lib/sim/algorithm/sorting";
import { bellmanFord, coinChange, edgeLimited, editDistanceTable, floydUpTo, greedyCoins, knapsackGreedyByRatio, knapsackItems, knapsackTable, lcsTable, matrixChain, matrixPathTable, pebbleMax, pebbleTable } from "@/lib/sim/algorithm/dp";
import { answerKey } from "@/lib/qtypes/answerKey";
import { isJokbo, isJokboRelated, matchesSource, mockSetOf, parseSource, relatedBadge } from "@/lib/quiz/jokbo";
import { filterQuestions } from "@/lib/quiz/session";
import type { Question } from "@/types/question";
import algorithm from "./index";
import { MOCK1, MOCK2 } from "./mockExams";

// 족보관련1·2 모의시험(2026-10-22): 세트 구성·비율, 해설 형식, 정답 = lib/sim/algorithm(오답 보기가 정답이 되지 않는지 포함),
// 중복 없음, docs/jokbo/algorithm/mock-exams.md §3 주제 표 = 데이터

const ROOT = path.resolve(import.meta.dirname, "../../..");
type Q = Question & { choices: string[]; answerIndex: number; answerIndexes: number[]; answer: boolean };
const I = Infinity;
const CHAPTERS = ["analysis", "recurrence", "sorting", "dc", "dp"] as const;
/** 개념형(슬라이드 근거로만 정답을 정함 — 시뮬레이터로 계산할 값이 없다): 세트-번호 */
const CONCEPT = ["1-003", "1-018", "1-020", "1-021", "1-030", "2-004", "2-011", "2-017", "2-018", "2-021", "2-030"];

const [ONE, LOG, SQRT, N, NLOGN, N2, N3] = [term(0), term(0, 1), term(0.5), term(1), term(1, 1), term(2), term(3)];
const lnOf =
  (f: (n: number) => number): LnFn =>
  (x) =>
    Math.log(f(2 ** x));
/** 보기(증가율 목록) 중 t와 같은 증가율(Θ)인 것의 번호 */
const sameAs = (t: LnFn, gs: LnFn[], x1: number, x2: number) => gs.flatMap((g, i) => (compareGrowth(t, g, x1, x2) === 0 ? [i] : []));
type Rel = "O" | "Ω" | "Θ";
const holds = (fs: LnFn[], rel: Rel, g: LnFn) =>
  fs.every((f) => {
    const c = compareGrowth(f, g);
    return rel === "O" ? c <= 0 : rel === "Ω" ? c >= 0 : c === 0;
  });
const fmtArr = (a: readonly number[]) => `[${a.join(", ")}]`;
/** 지문·보기의 숫자 나열(수치 중복 검사용) */
const numbers = (x: Question) => {
  const c = x as Q;
  return [x.prompt, ...(c.choices ?? [])].join(" ").match(/\d+/g)?.join(",") ?? "";
};

describe("알고리즘 족보관련1·2 모의시험", async () => {
  const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
  const byId = new Map(all.map((x) => [x.id, x as Q]));
  const sets = [MOCK1, MOCK2] as Q[][];
  const mocks = [...MOCK1, ...MOCK2] as Q[];
  const q = (set: 1 | 2, n: number) => sets[set - 1][n - 1];
  const picked = (set: 1 | 2, n: number) => q(set, n).choices[q(set, n).answerIndex];
  const blanks = (set: 1 | 2, n: number) => answerKey(q(set, n)) as string[];
  /** 객관식: 계산값과 같은 보기가 정확히 하나이고 그것이 정답 */
  const onlyAnswer = (set: 1 | 2, n: number, value: string) => {
    expect(q(set, n).choices.filter((c) => c === value), `${set}-${n}`).toHaveLength(1);
    expect(picked(set, n), `${set}-${n}`).toBe(value);
  };
  const truthIdx = (bs: boolean[]) => bs.flatMap((b, i) => (b ? [i] : []));

  it("세트당 30문항(20~30) — id 순서·챕터 로드, 족보관련 분류·세트 분류·뱃지, 세트 순서 고정", () => {
    for (const [s, list] of sets.entries()) {
      expect(list.length).toBeGreaterThanOrEqual(20);
      expect(list.length).toBeLessThanOrEqual(30);
      list.forEach((x, i) => {
        expect(x.id, x.id).toBe(`algorithm-${x.chapter}-mock${s + 1}-${String(i + 1).padStart(3, "0")}`);
        expect(byId.get(x.id), x.id).toBe(x); // 챕터 로드에 들어 있다
        expect(mockSetOf(x)).toBe(s + 1);
        expect(isJokboRelated(x), x.id).toBe(true);
        expect(isJokbo(x), x.id).toBe(false);
        expect(relatedBadge(x)).toBe(s === 0 ? "족보관련1" : "족보관련2");
        if (x.type === "mcq" || x.type === "multi") expect(x.shuffle, x.id).toBe(false);
      });
      // 장 순서대로 놓았다
      expect(list.map((x) => CHAPTERS.indexOf(x.chapter as never))).toEqual([...list.map((x) => CHAPTERS.indexOf(x.chapter as never))].sort((a, b) => a - b));
    }
    expect(new Set(mocks.map((x) => x.id)).size).toBe(60);
    expect(parseSource("mock1")).toBe("mock1");
    expect(all.filter((x) => matchesSource(x, "mock1")).map((x) => x.id).sort()).toEqual(MOCK1.map((x) => x.id).sort());
    expect(all.filter((x) => matchesSource(x, "related")).length).toBe(all.filter((x) => x.basedOn).length);
    // 섞기를 켜도 세트 순서 그대로
    expect(filterQuestions(all, { source: "mock2", shuffle: true, seed: "x" }).map((x) => x.id)).toEqual(MOCK2.map((x) => x.id));
  });

  it("장·타입·난이도 분포 = 족보 대표 문항 비율(세트 30문항 기준 ±1), 두 세트 같음", () => {
    const jokbo = all.filter(isJokbo) as Q[];
    // 족보 원문이 예/아니오 2지선다인 mcq는 원문 형식 ox
    const typeOf = (x: Q) => (x.type === "mcq" && x.choices.length === 2 && x.choices.every((c) => c === "예" || c === "아니오") ? "ox" : x.type);
    const ratio = (xs: Q[], key: (x: Q) => string | number) => {
      const m = new Map<string | number, number>();
      for (const x of xs) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
      return m;
    };
    const jc = ratio(jokbo, (x) => x.chapter);
    const jt = ratio(jokbo, typeOf);
    const jd = ratio(jokbo, (x) => x.difficulty);
    const dist = (list: Q[]) => [ratio(list, (x) => x.chapter), ratio(list, (x) => x.type), ratio(list, (x) => x.difficulty)];
    for (const list of sets) {
      const [c, t, d] = dist(list);
      for (const [k, v] of jc) expect(Math.abs((c.get(k) ?? 0) - (v / jokbo.length) * list.length), `장 ${k}`).toBeLessThanOrEqual(1);
      for (const [k, v] of jt) expect(Math.abs((t.get(k) ?? 0) - (v / jokbo.length) * list.length), `타입 ${k}`).toBeLessThanOrEqual(1);
      for (const [k, v] of jd) expect(Math.abs((d.get(k) ?? 0) - (v / jokbo.length) * list.length), `난이도 ${k}`).toBeLessThanOrEqual(1);
      expect([...t.keys()].every((k) => ["mcq", "ox", "multi", "blank"].includes(k as string))).toBe(true);
    }
    expect(dist(sets[0]).map((m) => [...m].sort())).toEqual(dist(sets[1]).map((m) => [...m].sort()));
  });

  it("basedOn = 족보 문항, 해설 = (형식 참고) + 풀이 + 근거(강의자료 쪽) + 함정 1줄", () => {
    for (const x of mocks) {
      for (const b of x.basedOn!) expect(byId.get(b) && isJokbo(byId.get(b)!), `${x.id} ${b}`).toBe(true);
      const m = /^(?:형식 참고: (algorithm-[a-z]+-jokbo-\d{3})\n)?풀이: [^\n]+\n근거: 강의자료\d p\.[^\n]+\n함정: [^\n]+$/.exec(x.explanation);
      expect(m, x.id).not.toBeNull();
      if (m?.[1]) expect(x.basedOn, x.id).toContain(m[1]);
      expect(x.slideRef, x.id).toMatch(/^Lec[2-5] p\./);
    }
  });

  it("중복 없음 — 세트 사이·기존 문항(족보 원문·족보관련·일반)과 지문이 같거나 수치만 같은 문제 없음", () => {
    const others = all.filter((x) => mockSetOf(x) === null);
    // 지문 + 보기 — 같은 지문 틀(예: 힙 배열 고르기)에 보기만 다른 문항은 다른 문제다
    const norm = (x: Question) => [x.prompt, ...((x as Q).choices ?? [])].join("|").replace(/\s+/g, "");
    const otherPrompts = new Set(others.map(norm));
    const otherNums = new Set(others.map(numbers).filter((s) => s.length > 6));
    for (const x of mocks) {
      expect(otherPrompts.has(norm(x)), x.id).toBe(false);
      const ns = numbers(x);
      if (ns.length > 6) expect(otherNums.has(ns), `${x.id} 수치 ${ns}`).toBe(false);
    }
    expect(new Set(mocks.map(norm)).size).toBe(mocks.length);
    const nums = mocks.map(numbers).filter((s) => s.length > 6);
    expect(new Set(nums).size).toBe(nums.length);
  });

  it("점근 분석: 입력별 시간 → O·Ω·Θ, 증명의 c·n0, 포함 순서 = 증가율 비교", () => {
    // 1-001: 50개 n√n, 20개 n, 나머지 n log n → O(nlogn)?
    const in1 = [term(1.5), N, NLOGN];
    expect(q(1, 1).answer).toBe(holds(in1, "O", NLOGN));
    // 1-002: 3n² − 12 ≥ 2n²가 n ≥ 3에서 성립하는가(n0 = 4부터 성립)
    const ok = (n0: number) => Array.from({ length: 1000 }, (_, i) => n0 + i).every((n) => 3 * n * n - 12 >= 2 * n * n);
    expect(q(1, 2).answer).toBe(ok(3));
    expect(ok(4)).toBe(true);
    // 1-004: 한 입력 n²logn, 나머지 √n — 틀린 것
    const in4 = [term(2, 1), SQRT];
    const claims = [holds(in4, "Θ", SQRT), holds(in4, "O", term(2, 1)), holds(in4, "Ω", SQRT), holds([term(2, 1)], "Θ", term(2, 1)), holds(in4, "O", N2), holds([SQRT], "Θ", SQRT)];
    expect(q(1, 4).answerIndexes).toEqual(truthIdx(claims.map((c) => !c)));
    // 1-005: 이름 → 증가율 순서
    const named: Record<string, LnFn> = { A: N2, B: LOG, C: term(0, 0, 1), D: ONE, E: NLOGN, F: N3, G: N };
    const order = (fs: Record<string, LnFn>) => Object.keys(fs).sort((a, b) => compareGrowth(fs[a], fs[b])).join("");
    expect(blanks(1, 5)).toEqual([order(named)]);
    // 2-001: 30개 √n, 70개 n³, 나머지 n² → O(n³)?(O(n²)은 아니다)
    expect(q(2, 1).answer).toBe(holds([SQRT, N3, N2], "O", N3));
    expect(holds([SQRT, N3, N2], "O", N2)).toBe(false);
    // 2-002: 6n² ≤ 7n² − 30n ≤ 7n² (n ≥ 30), n = 29에서는 하한이 깨진다
    const theta = (n0: number) => Array.from({ length: 2000 }, (_, i) => n0 + i).every((n) => 6 * n * n <= 7 * n * n - 30 * n && 7 * n * n - 30 * n <= 7 * n * n);
    expect(q(2, 2).answer).toBe(theta(30));
    expect(theta(29)).toBe(false);
    // 2-003: 한 입력 2ⁿ → 최악의 경우 O(n)?
    expect(q(2, 3).answer).toBe(holds([term(0, 0, 1)], "O", N));
    // 2-005: 함수 → 증가율 순서
    const fns: Record<string, LnFn> = {
      A: lnOf((n) => 3 * n ** 3 + 2 * n ** 2),
      B: () => Math.log(1000),
      C: lnOf((n) => n * Math.log2(n) + 5 * n),
      D: term(0, 0, 1, 7),
      E: lnOf((n) => 5 * Math.log2(n) + 6),
      F: lnOf((n) => 10 * n + 4),
      G: lnOf((n) => (n * n) / 2 - 5),
    };
    expect(blanks(2, 5)).toEqual([order(fns)]);
  });

  it("점화식: 마스터 정리·적용 범위·재귀 트리·코드 실행 횟수·추정 후 증명 = 시뮬레이터", () => {
    const T = (a: number, b: number, g: (n: number) => number, base = 1) => lnOf((n) => recurrence(n, Array(a).fill((m: number) => m / b), g, base));
    // 1-006: 8T(n/2) + n²logn
    expect(masterCase(8, 2, term(2, 1))).toBe("h");
    expect(sameAs(T(8, 2, (n) => n * n * Math.log2(n)), [term(2, 1), term(2, 2), N3, term(3, 1), N2], 10, 20)).toEqual([q(1, 6).answerIndex]);
    // 1-007: 모양이 아닌 것(빼기·상수 이동) + 세 경우에 들지 않는 것(masterCase = null)
    const apply = [masterCase(3, 2, N2), "빼기", "상수 이동", masterCase(9, 3, term(2, 1)), masterCase(5, 4, N), masterCase(2, 2, SQRT)];
    expect(apply).toEqual(["f", "빼기", "상수 이동", null, "h", "h"]);
    expect(q(1, 7).answerIndexes).toEqual(truthIdx(apply.map((c) => c === null || c === "빼기" || c === "상수 이동")));
    // 재귀 트리
    const tree = (parts: ((n: number) => number)[], base = 1) => lnOf((n) => recurrence(n, parts, (m) => m, base));
    expect(sameAs(tree([(n) => n / 5, (n) => (3 * n) / 5]), [LOG, N, NLOGN, N2, term(0.8)], 8, 24)).toEqual([q(1, 8).answerIndex]);
    expect(sameAs(tree([(n) => n / 2, (n) => n / 3, (n) => n / 6]), [N, NLOGN, N2, LOG, term(1, 2)], 8, 24)).toEqual([q(2, 8).answerIndex]);
    // 1-009: 이중 반복(1+…+n) + sample(n/3) 세 번 — 덧셈 횟수
    const code1 = (n: number): number => (n <= 1 ? 0 : (n * (n + 1)) / 2 + 3 * code1(Math.floor(n / 3)));
    expect(sameAs(lnOf(code1), [N, NLOGN, N2, term(2, 1), N3], 10, 20)).toEqual([q(1, 9).answerIndex]);
    // 1-010: 4T(n/2) + n² = Θ(n²logn)(③), 보기 5의 강화 가정도 성립하지 않는다
    expect(masterCase(4, 2, N2)).toBe("same");
    expect(picked(1, 10)).toContain("Θ(n²logn)");
    expect([4, 16, 64].every((n) => 4 * ((n / 2) ** 2 - n / 2) + n * n > n * n - n)).toBe(true);
    // 1-011: Euclid(30, 18) 4번·6, fib(7)의 fib(3) 5번(보기는 3번 → 옳지 않음), 하노이 2ⁿ − 1
    expect(euclidCalls(30, 18)).toBe(4);
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    expect(gcd(30, 18)).toBe(6);
    expect(fibCallsOf(7, 3)).toBe(5);
    expect(q(1, 11).choices[4]).toContain("3번");
    expect([1, 2, 5, 10].map(hanoiMoves)).toEqual([1, 3, 31, 1023]);
    // 2-006: 2T(n/4) + f(n) = Θ(√n logn)인 f
    const fs = [ONE, LOG, SQRT, N, NLOGN];
    expect(fs.map((f) => masterCase(2, 4, f))).toEqual(["h", "h", "same", "f", "f"]);
    expect(fs.flatMap((f, i) => (masterCase(2, 4, f) === "same" ? [i] : []))).toEqual([q(2, 6).answerIndex]);
    // 2-007: 3T(n/3 + 5) + n
    expect(sameAs(tree(Array(3).fill((n: number) => n / 3 + 5), 20), [N, NLOGN, N2, LOG, term(1, 2)], 10, 20)).toEqual([q(2, 7).answerIndex]);
    // 2-009: T(n) = T(n−1) + n(n+1)/2
    const code2 = (n: number) => {
      let s = 0;
      for (let k = 2; k <= n; k++) s += (k * (k + 1)) / 2;
      return s;
    };
    expect(sameAs(lnOf(code2), [N2, term(2, 1), N3, term(0, 0, 1), term(3, 1)], 6, 12)).toEqual([q(2, 9).answerIndex]);
    // 2-010: cn − 2b + 3 ≤ cn − b ⇔ b ≥ 3 — 보기 중 최솟값
    const works = (b: number) => -2 * b + 3 <= -b;
    expect(q(2, 10).choices.map(Number).filter(works)[0]).toBe(Number(picked(2, 10)));
    expect(q(2, 10).choices.map(Number).filter((b) => b < 3).some(works)).toBe(false);
  });

  it("정렬: 계수·partition·기수·힙·입력 특성 = 시뮬레이터", () => {
    // 1-012 누적 C, 2-012 마지막 for 문 j = 9..6 뒤의 C
    onlyAnswer(1, 12, countingSort([2, 4, 1, 4, 3, 2, 4, 1, 3, 4], 4).c2.join(", "));
    expect(q(1, 12).choices).toContain(countingSort([2, 4, 1, 4, 3, 2, 4, 1, 3, 4], 4).c1.join(", ")); // 함정: 누적 전
    const a12 = [1, 3, 2, 3, 1, 2, 3, 2, 1];
    onlyAnswer(2, 12, countingCAfter(a12, 3, 6).join(", "));
    expect(q(2, 12).choices).toContain(countingCAfter(a12, 3, 7).join(", ")); // 함정: 한 번 덜
    // 1-013 partition 반환 위치, 2-013 이어지는 quickSort 범위
    const p13 = [30, 15, 60, 45, 10, 55, 25, 40];
    onlyAnswer(1, 13, String(partition([...p13], 1, 8)));
    const p2 = [45, 20, 70, 35, 60, 10, 50, 30];
    const r = partition([...p2], 1, 8);
    onlyAnswer(2, 13, `quickSort(A, 1, ${r - 1})와 quickSort(A, ${r + 1}, 8)`);
    // 1-014 기수 정렬 위치, 2-015 2단계 배열
    expect(blanks(1, 14)).toEqual([radixPositions(["2716", "0483", "1352", "3061", "0928", "1745", "2390", "0537"], "1352").join("")]);
    const nums = ["0372", "1245", "0861", "2034", "1563", "0742", "2914", "0135"];
    const steps = radixSteps(nums);
    onlyAnswer(2, 15, steps[1].join(" "));
    expect(q(2, 15).choices).toContain([...nums].sort((x, y) => Number(x[2]) - Number(y[2])).join(" ")); // 함정: 입력에서 바로 십의 자리
    expect(q(2, 15).choices).toContain([...steps[0]].sort((x, y) => Number(x[2]) - Number(y[2]) || Number(x) - Number(y)).join(" ")); // 함정: 값 순서
    // 1-015 heapSort 첫 반복, 2-014 buildHeap 결과
    const hs = heapSortSteps([9, 4, 7, 1, 8, 2, 6, 3]);
    onlyAnswer(1, 15, fmtArr(hs.rounds[0]));
    expect(q(1, 15).choices).toContain(fmtArr(hs.built));
    expect(hs.built).toEqual(buildHeapSteps([9, 4, 7, 1, 8, 2, 6, 3]).at(-1));
    expect(blanks(2, 14)).toEqual([heapSortSteps([8, 5, 9, 2, 6, 1, 7]).built.join("")]);
    // 1-016 힙 배열, 2-016 배열 보기(3·5번)
    expect(q(1, 16).answerIndexes).toEqual(truthIdx(q(1, 16).choices.map((c) => isMinHeap(JSON.parse(c)))));
    expect([isMinHeap([2, 7, 3, 8, 9, 4, 5]), isMinHeap([1, 4, 2, 3, 6, 5, 7])]).toEqual([q(2, 16).answerIndexes.includes(2), q(2, 16).answerIndexes.includes(4)]);
    // 1-017 정렬된 입력에서 Θ(n²)인 정렬: 비교 횟수 증가율
    const up = (x: number) => Array.from({ length: 2 ** x }, (_, i) => i);
    const cmp = (f: (a: number[]) => number) => lnOf((n) => f(up(Math.log2(n))));
    const sorts = [selectionComparisons, bubbleComparisons, insertionComparisons, mergeSortComparisons, quickSortComparisons, heapSortComparisons];
    expect(q(1, 17).answerIndexes).toEqual(truthIdx(sorts.map((f) => compareGrowth(cmp(f), N2, 7, 11) === 0)));
    expect(compareGrowth(cmp(insertionComparisons), N, 7, 11)).toBe(0);
  });

  it("분할 정복: select 추적·linearSelect 비율 = 시뮬레이터", () => {
    const s1 = selectStep([33, 8, 61, 27, 45, 12, 50, 19, 70, 40], 7);
    onlyAnswer(1, 19, `(1)은 ${s1.k}, (${s1.call}) 호출, (4)는 ${s1.nextI}`);
    const t2 = selectTrace([52, 17, 83, 41, 66, 29, 74, 35, 58], 2);
    onlyAnswer(2, 19, `${t2.calls.length}번, ${t2.value}`);
    expect(t2.value).toBe([52, 17, 83, 41, 66, 29, 74, 35, 58].sort((a, b) => a - b)[1]);
    expect(linearSelectRatio(5)).toEqual([7, 3]); // 1-020 지문의 7n/10
    onlyAnswer(2, 20, linearSelectRatio(11).join(": "));
    // 2-021: 정렬된 배열에서 1번째 작은 원소 — 매번 k = n(분할 0 : n−1)
    const sorted = Array.from({ length: 8 }, (_, i) => i + 1);
    expect(selectTrace(sorted, 1).calls.map((c) => c[3])).toEqual([8, 7, 6, 5, 4, 3, 2, null]);
  });

  it("동적 계획: 연쇄 행렬·행렬 경로·조약돌·최단 경로·LCS·편집 거리·배낭·동전 = 시뮬레이터", () => {
    const m1 = matrixChain([4, 10, 3, 12, 5]);
    expect(blanks(1, 22)).toEqual([m1[1][3], m1[1][4]].map(String));
    expect([m1[1][2], m1[2][3], m1[2][4], m1[3][4]]).toEqual([120, 360, 330, 180]); // 지문 표
    const m2 = matrixChain([5, 4, 6, 2, 7]);
    expect(m2[1][4]).toBe(m2[1][3] + 5 * 2 * 7); // k = 3: (A₁A₂A₃)A₄
    expect(m2[1][3]).toBe(m2[2][3] + 5 * 4 * 2); // k = 1: A₁(A₂A₃)
    onlyAnswer(2, 22, `${m2[1][4]}, (A₁(A₂A₃))A₄`);

    const path1 = [[4, 9, 2, 6], [7, 1, 8, 3], [5, 12, 4, 10], [6, 2, 11, 5]];
    onlyAnswer(1, 23, String(matrixPathTable(path1)[4][4]));
    expect(blanks(2, 23)).toEqual([String(matrixPathTable([[3, 8, 1, 7], [6, 2, 9, 4], [10, 5, 3, 8], [2, 11, 6, 1]])[3][4])]);

    const peb1 = [[5, -3, 9, 4, 6], [8, 11, -2, 7, 3], [2, 6, 10, -1, 9]];
    onlyAnswer(1, 24, String(pebbleMax(peb1)));
    expect(Math.max(...pebbleTable(peb1)[5].slice(1))).toBe(pebbleMax(peb1));
    const peb2 = [[7, 2, 8, -4], [-6, 12, 5, 10], [9, 3, 11, 6]];
    expect(blanks(2, 24)).toEqual([pebbleTable(peb2)[3][4], pebbleMax(peb2)].map(String));

    const g1 = [[0, 4, I, 9], [I, 0, 2, I], [3, I, 0, 1], [I, -2, I, 0]];
    const show = (m: number[][]) => m.map((r) => r.map((x) => (x === I ? "∞" : x)));
    expect(show(floydUpTo(g1, 2))).toEqual([[0, 4, 6, 9], ["∞", 0, 2, "∞"], [3, 7, 0, 1], ["∞", -2, 0, 0]]); // 지문 D(b)
    onlyAnswer(1, 25, String(floydUpTo(g1, 3)[1][0]));
    const g4 = [[0, 7, I, 2], [I, 0, 1, I], [4, I, 0, I], [I, 3, 6, 0]];
    expect(floydUpTo(g4, 3)).toEqual([[0, 7, 8, 2], [5, 0, 1, 7], [4, 11, 0, 6], [8, 3, 4, 0]]); // 지문 D(c)
    const d4 = floydUpTo(g4, 4);
    expect(blanks(2, 25)).toEqual([d4[0][2], d4[2][1]].map(String));

    const g2 = [[0, 6, 2, I], [I, 0, I, 1], [I, 3, 0, 7], [4, I, I, 0]];
    const l2 = edgeLimited(g2, 2);
    expect(blanks(1, 26)).toEqual([l2[0][3], l2[1][0]].map(String));
    expect(edgeLimited(g2, 3)[0][3]).toBe(6); // 함정: 간선 3개
    const g3 = [[0, 3, I, 8], [I, 0, 5, 1], [2, I, 0, I], [I, I, -4, 0]];
    onlyAnswer(2, 26, String(edgeLimited(g3, 2)[0][2]));
    expect(q(2, 26).choices).toContain(String(edgeLimited(g3, 3)[0][2]));

    const lcs = lcsTable("BACDB", "BDCAB");
    expect(blanks(1, 27)).toEqual([lcs[4][3], lcs[5][5]].map(String));
    const ed = editDistanceTable("break", "brake");
    expect(blanks(2, 27)).toEqual([ed[3][3], ed[5][5]].map(String));

    const k1: [number, number][] = [[2, 12], [3, 20], [4, 28], [5, 30]];
    expect(blanks(1, 28)).toEqual([knapsackTable(k1, 6)[3][6], knapsackTable(k1, 7)[4][7]].map(String));
    const k2: [number, number][] = [[3, 25], [4, 30], [2, 14], [5, 40]];
    onlyAnswer(2, 29, `${knapsackTable(k2, 9)[4][9]} (물건 ${knapsackItems(k2, 9).join(", ")})`);
    const g = knapsackGreedyByRatio(k2, 9);
    expect(q(2, 29).choices).toContain(`${g.value} (물건 ${g.items.join(", ")})`);

    onlyAnswer(1, 29, `C[14] = ${coinChange([12, 7, 1], 14).c[14]}, 그리디 ${greedyCoins([12, 7, 1], 14)}개`);
    const bf = bellmanFord(["s", "a", "b", "c", "d"], [["s", "a", 6], ["s", "b", 7], ["a", "c", 5], ["a", "d", -4], ["b", "c", -3], ["b", "d", 9], ["c", "a", -2], ["d", "c", 7]], "s");
    onlyAnswer(2, 28, String(bf.d).replace("-", "−"));
  });

  it("개념형 11 · 시뮬레이터 49 — 개념형 객관식·복수 선택은 근거 쪽이 2개 이상(보기별 근거)", () => {
    const concept = mocks.filter((x) => CONCEPT.includes(`${mockSetOf(x)}-${x.id.slice(-3)}`));
    expect(concept).toHaveLength(CONCEPT.length);
    for (const x of concept) expect(x.explanation.split("\n근거: ")[1].match(/p\.\d/g)!.length, x.id).toBeGreaterThanOrEqual(x.type === "ox" ? 1 : 2);
    expect(mocks.length - concept.length).toBe(49);
  });

  it("docs/jokbo/algorithm/mock-exams.md §3: 포함 주제마다 세트 문항 1개 이상, 족보 2회 이상 주제는 두 세트 모두, 모든 세트 문항이 주제에 연결", () => {
    const doc = readFileSync(path.join(ROOT, "docs/jokbo/algorithm/mock-exams.md"), "utf8").split(/\r?\n/);
    const rows = doc.filter((l) => /^\| \d+ \| /.test(l)).map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    expect(rows.map((r) => Number(r[0]))).toEqual(rows.map((_, i) => i + 1));
    const ids = (cell: string) => (cell === "—" ? [] : cell.split(",").map((s) => s.trim()));
    const linked = [new Set<string>(), new Set<string>()];
    let noJokbo = 0;
    let twice = 0;
    for (const [n, topic, , jokboCell, c1, c2, inc] of rows) {
      const jk = ids(jokboCell).map((id) => byId.get(`algorithm-${id}`));
      for (const [i, j] of jk.entries()) expect(j && isJokbo(j), `${topic} ${ids(jokboCell)[i]}`).toBe(true);
      const occ = jk.reduce((s, j) => s + (j?.jokbo?.occurrences.length ?? 0), 0);
      const s1 = ids(c1);
      const s2 = ids(c2);
      for (const [k, list] of [s1, s2].entries())
        for (const no of list) {
          expect(sets[k][Number(no) - 1], `#${n} ${topic} ${no}`).toBeDefined();
          linked[k].add(no);
        }
      if (inc === "포함") {
        expect(s1.length + s2.length, `#${n} ${topic}`).toBeGreaterThan(0);
        if (!jk.length) noJokbo++;
        if (occ >= 2) {
          twice++;
          expect(s1.length > 0 && s2.length > 0, `#${n} ${topic}: 족보 ${occ}회 → 두 세트 모두`).toBe(true);
        }
      } else expect(inc, `#${n}`).toMatch(/^미포함\(/);
    }
    for (const [k, list] of sets.entries()) expect(list.map((_, i) => String(i + 1).padStart(3, "0")).filter((no) => !linked[k].has(no)), `세트 ${k + 1}`).toEqual([]);
    const summary = doc.find((l) => l.startsWith("- 주제 "))!;
    expect(summary).toContain(`주제 ${rows.length}개, 포함 ${rows.filter((r) => r[6] === "포함").length}개`);
    expect(summary).toContain(`족보에 없던 주제 ${noJokbo}개`);
    expect(doc.join("\n")).toContain(`족보 출현 2회 이상인 주제(${twice}개)`);
  });
});

import { describe, expect, it } from "vitest";
import { closestPair, closestPairCalls, middleRegion } from "./closestPair";
import { bellmanFord, coinChange, editDistanceTable, edgeLimited, floydUpTo, greedyCoins, INF, knapsackItems, knapsackTable, lcsTable, matrixChain, maxPathSum, pebbleMax, scholarshipMax } from "./dp";
import { euclidCalls, fibCalls, hanoiMoves, matMulTriangular, recurrence, sampleOneCall, sampleTwoCalls } from "./recursion";
import {
  buildHeapSteps,
  countingSort,
  heapSortComparisons,
  insertionComparisons,
  isMinHeap,
  linearSelectRatio,
  partition,
  quickSortComparisons,
  radixPositions,
  selectStep,
} from "./sorting";

// 기준값: 교수 해설(M22·M21·T22·F22 LMS 화면)과 강의 자료 예제 — docs/jokbo/algorithm/extracted/, docs/verification/algorithm-*.md

describe("정렬·힙·선택 (Lec3·Lec4)", () => {
  it("계수 정렬: M22 9번 해설 C = 3 3 3 1 → 3 6 9 10, T22 3번 해설 C1 = 3 3 2 2 → C2 = 3 6 8 10", () => {
    const a = countingSort([3, 2, 3, 1, 1, 4, 2, 3, 1, 2], 4);
    expect(a.c1).toEqual([3, 3, 3, 1]);
    expect(a.c2).toEqual([3, 6, 9, 10]);
    expect(a.b).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4]);
    const b = countingSort([3, 4, 2, 1, 1, 4, 2, 3, 1, 2], 4);
    expect([b.c1, b.c2, b.b]).toEqual([[3, 3, 2, 2], [3, 6, 8, 10], [1, 1, 1, 2, 2, 2, 3, 3, 4, 4]]);
  });

  it("partition 반환 위치: M21 20번 7(55는 7번째), M22 10번 1(피봇 12), T22 11번 4(30은 4번째)", () => {
    expect(partition([12, 70, 50, 20, 30, 25, 40, 55], 1, 8)).toBe(7);
    expect(partition([50, 70, 30, 20, 55, 25, 40, 12], 1, 8)).toBe(1);
    expect(partition([12, 70, 50, 20, 55, 25, 40, 30], 1, 8)).toBe(4);
  });

  it("select 첫 단계: M21 16번 해설(8번째: k=4, (3) 호출, 4), T22 20번 해설(3번째: k=9, (2) 호출, 3)", () => {
    expect(selectStep([12, 70, 50, 20, 55, 25, 40, 30, 65, 29], 8)).toEqual({ k: 4, call: 3, nextI: 4 });
    expect(selectStep([12, 70, 50, 20, 55, 25, 40, 30, 65, 29], 3)).toEqual({ k: 4, call: 2, nextI: 3 });
    expect(selectStep([12, 70, 50, 20, 55, 25, 40, 30, 29, 65], 3)).toEqual({ k: 9, call: 2, nextI: 3 });
  });

  it("최소 힙 판정: M21 14번 해설 — [12,20,25,40,55,30,70,50]·[12,20,25,50,55,30,40,70]만 힙", () => {
    const heaps = [
      [12, 25, 30, 20, 55, 70, 40, 50],
      [12, 70, 30, 20, 55, 25, 40, 50],
      [12, 20, 25, 70, 55, 30, 40, 50],
      [12, 20, 25, 40, 55, 30, 70, 50],
      [12, 20, 25, 50, 55, 30, 40, 70],
    ].map(isMinHeap);
    expect(heaps).toEqual([false, false, false, true, true]);
  });

  it("buildHeap 단계: M22 번호 미표기 해설 A → F → D → B → G(=E) → H → C", () => {
    expect(buildHeapSteps([50, 70, 30, 20, 55, 25, 40, 12])).toEqual([
      [50, 70, 30, 12, 55, 25, 40, 20],
      [50, 70, 25, 12, 55, 30, 40, 20],
      [50, 12, 25, 70, 55, 30, 40, 20],
      [50, 12, 25, 20, 55, 30, 40, 70],
      [12, 50, 25, 20, 55, 30, 40, 70],
      [12, 20, 25, 50, 55, 30, 40, 70],
    ]);
    // 이미 오름차순이면 buildHeap은 아무것도 바꾸지 않는다(M21 9번 해설 Θ(n))
    expect(buildHeapSteps([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([]);
  });

  it("기수 정렬: M22 11번 해설 0283의 위치 6 8 7 4 (Lec3 p.71 예)", () => {
    expect(radixPositions(["0123", "2154", "0222", "0004", "0283", "1560", "1061", "2150"], "0283")).toEqual([6, 8, 7, 4]);
  });

  it("선형 시간 선택 그룹 크기별 보장 비율: 5개 7:3(Lec4), 7개 5:2(M21 15번), 9개 13:5(M22 14번)", () => {
    expect(linearSelectRatio(5)).toEqual([7, 3]);
    expect(linearSelectRatio(7)).toEqual([5, 2]);
    expect(linearSelectRatio(9)).toEqual([13, 5]);
  });

  it("정렬된 입력: 삽입 정렬 n−1회 비교(선형), 힙 정렬·퀵 정렬은 n이 두 배면 비교가 두 배보다 많이 는다", () => {
    const sorted = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
    expect(insertionComparisons(sorted(1000))).toBe(999);
    const h1 = heapSortComparisons(sorted(1024));
    const h2 = heapSortComparisons(sorted(2048));
    expect(h2 / h1).toBeGreaterThan(2.1); // n log n
    expect(quickSortComparisons(sorted(1000))).toBe((1000 * 999) / 2); // n(n−1)/2
  });
});

describe("재귀·반복문 (Lec2)", () => {
  it("하노이 2ⁿ−1, 피보나치 호출 수 지수 증가", () => {
    expect([1, 2, 3, 10].map(hanoiMoves)).toEqual([1, 3, 7, 1023]);
    expect(fibCalls(20) / fibCalls(19)).toBeCloseTo(1.618, 2);
  });
  it("sample(두 번 호출 + 반복문) = n log n, sample(n + 2·sample(n/2)) 호출 수 = log n + 1", () => {
    expect(sampleTwoCalls(1024)).toBe(1024 * 10);
    expect(sampleOneCall(1024)).toBe(11);
  });
  it("matMul(j=i..n, k=j..n): 실행 횟수 n(n+1)(n+2)/6 = Θ(n³)", () => {
    expect(matMulTriangular(10)).toBe((10 * 11 * 12) / 6);
  });
  it("유클리드: 연속 피보나치 수가 최악 — 호출 수가 log에 비례", () => {
    expect(euclidCalls(24, 14)).toBe(5); // Lec2 p.6 예: Euclid(24,14)→(14,10)→(10,4)→(4,2)→(2,0)
    expect(euclidCalls(832040, 514229)).toBe(29);
  });
  it("T(n)=T(n/4)+T(n/2)+n² = Θ(n²), T(n)=2T(n/2+10)+n = Θ(n log n), T(n)=3T(n/9)+√n = Θ(√n log n)", () => {
    const a = (n: number) => recurrence(n, [(x) => x / 4, (x) => x / 2], (x) => x * x) / (n * n);
    expect(a(2 ** 20) / a(2 ** 10)).toBeCloseTo(1, 1);
    const b = (n: number) => recurrence(n, [(x) => x / 2 + 10, (x) => x / 2 + 10], (x) => x, 20) / (n * Math.log2(n));
    expect(b(2 ** 22) / b(2 ** 16)).toBeCloseTo(1, 0);
    const c = (n: number) => recurrence(n, [(x) => x / 9, (x) => x / 9, (x) => x / 9], Math.sqrt) / (Math.sqrt(n) * Math.log2(n));
    expect(c(9 ** 8) / c(9 ** 6)).toBeCloseTo(1, 0);
  });
});

describe("동적 계획법·최단 경로 (Lec5)", () => {
  const M = (first: number) => [
    [first, 7, 2, 5],
    [5, 3, 11, 18],
    [7, 9, 3, 3],
    [8, 10, 14, 9],
  ];
  it("행렬 경로: F22 13번 해설 60(시작 6), F22 14번 해설 58(시작 4)", () => {
    expect(maxPathSum(M(6))).toBe(60);
    expect(maxPathSum(M(4))).toBe(58);
  });
  it("조약돌 놓기: F22 11번 해설 51, F22 12번 해설 52", () => {
    expect(pebbleMax([[4, 7, 12, -5], [-6, 10, 14, 9], [9, 12, 7, 4]])).toBe(51);
    expect(pebbleMax([[6, 7, 9, -5], [-8, 10, 11, 9], [11, 12, 7, 4]])).toBe(52);
  });
  it("장학금 최대 2000, 계단 친구 최대(오른쪽=남쪽, 위층으로만)", () => {
    expect(scholarshipMax([[400, 500], [800, 600], [100, 300], [300, 700]])).toBe(2000);
    // 1층 → 5층(아래 행부터), 열 = 북·중앙·남
    const floors = [[2, 0, 2], [1, 2, 1], [0, 2, 2], [2, 1, 2], [1, 2, 1]];
    expect(maxPathSum(floors)).toBe(12);
  });
  it("연쇄 행렬 곱 1×2, 2×5, 5×3, 3×3: 표의 10·25·30·45, (A) m(2,4)=48, (B) m(1,4)=34", () => {
    const m = matrixChain([1, 2, 5, 3, 3]);
    expect([m[1][2], m[1][3], m[2][3], m[3][4], m[2][4], m[1][4]]).toEqual([10, 25, 30, 45, 48, 34]);
  });
  it("LCS 표(행 A·B·C·B, 열 A·B·C·D): (5)+(6)+(12)+(15) = 1+2+3+3 = 9", () => {
    const t = lcsTable("ABCB", "ABCD");
    expect(t[2][1] + t[2][2] + t[3][4] + t[4][3]).toBe(9);
  });
  const W = [
    [0, 8, 1, 5],
    [INF, 0, 3, INF],
    [INF, INF, 0, 3],
    [INF, -5, INF, 0],
  ];
  it("플로이드-워샬: D(b)는 문제의 표, D(c)의 (B)=6·(C)=4(F22 2·3번 해설), D(d)의 (D)=−1", () => {
    expect(floydUpTo(W, 2)).toEqual([
      [0, 8, 1, 5],
      [INF, 0, 3, INF],
      [INF, INF, 0, 3],
      [INF, -5, -2, 0],
    ]);
    const c = floydUpTo(W, 3);
    expect([c[1][3], c[0][3]]).toEqual([6, 4]);
    expect(floydUpTo(W, 4)[0][1]).toBe(-1);
  });
  it("간선 수 제한 L(2): (A) d→c = −2(F22 4번 해설), (B) b→d = 6(F22 5번 해설)", () => {
    const l = edgeLimited(W, 2);
    expect([l[3][2], l[1][3]]).toEqual([-2, 6]);
  });
  it("벨만-포드: F22 7번 해설 0 → f → b → c → d → e = 7", () => {
    const e: [string, string, number][] = [
      ["0", "a", 8], ["0", "f", 10], ["0", "g", 13], ["f", "a", -11], ["a", "b", 7], ["f", "b", -5], ["f", "g", -3],
      ["g", "e", 8], ["g", "d", 8], ["e", "f", 12], ["e", "c", 5], ["b", "c", 5], ["c", "d", 4], ["d", "e", -7],
    ];
    expect(bellmanFord(["0", "a", "b", "c", "d", "e", "f", "g"], e, "0").e).toBe(7);
  });
});

// 일반 문항(2026-10-15)용 시뮬레이터 — 강의 자료 예제 값
describe("최근접 점의 쌍 (Lec4 p.40-60)", () => {
  it("중간 영역: p.46 d = 10 → 26 − 10 = 16 ~ 28 + 10 = 38 (교수님 필기대로 (17,-) 포함)", () => {
    expect(middleRegion([1, 13, 17, 25, 26, 28, 30, 37, 45, 56], 5, 10)).toEqual([17, 25, 26, 28, 30, 37]);
  });
  it("ClosestPair = 모든 쌍 비교의 최솟값, 호출 수(|SL| = |SR| + 1, 3개 이하에서 멈춤)", () => {
    const pts: [number, number][] = [[0, 0], [4, 9], [7, 1], [11, 6], [13, 13], [18, 2], [21, 9], [25, 4], [29, 12]];
    let best = Infinity;
    for (const p of pts) for (const q of pts) if (p !== q) best = Math.min(best, Math.hypot(p[0] - q[0], p[1] - q[1]));
    const t = closestPair(pts);
    expect(t.result.dist).toBe(best);
    expect(t.calls).toBe(closestPairCalls(9));
    expect([2, 3, 4, 5, 8, 13].map(closestPairCalls)).toEqual([1, 1, 3, 3, 7, 9]);
  });
});

describe("편집 거리·배낭·동전 거스름돈 (Lec5 p.65-121)", () => {
  it("편집 거리: strong → stone 표(p.78) E[6, 5] = 2, E[4, 3] = 1", () => {
    const e = editDistanceTable("strong", "stone");
    expect(e.map((r) => r.join(""))).toEqual(["012345", "101234", "210123", "321123", "432123", "543212", "654322"]);
  });
  it("배낭: p.92-104 C = 10 — K[1, 5] = 10, K[2, 4] = 40, K[2, 9] = 50, K[4, 10] = 90(물건 2, 4)", () => {
    const items: [number, number][] = [[5, 10], [4, 40], [6, 30], [3, 50]];
    const k = knapsackTable(items, 10);
    expect([k[1][5], k[2][4], k[2][5], k[2][9], k[4][10]]).toEqual([10, 40, 40, 50, 90]);
    expect(knapsackItems(items, 10)).toEqual([2, 4]);
  });
  it("동전 거스름돈: p.113-120 16·10·5·1원 20원 — DP C[20] = 2, 그리디 5개", () => {
    const { c } = coinChange([16, 10, 5, 1], 20);
    expect([c[4], c[5], c[9], c[10], c[20]]).toEqual([4, 1, 5, 1, 2]);
    expect(greedyCoins([16, 10, 5, 1], 20)).toBe(5);
  });
});

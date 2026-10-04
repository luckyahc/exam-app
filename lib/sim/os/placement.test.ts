import { describe, expect, it } from "vitest";
import { chooseHole, FITS, formatRegions, type Hole, simulatePartitions } from "./placement";

// 네 알고리즘의 선택이 서로 다른 빈 블록 목록 (주소 순서)
const HOLES: Hole[] = [
  { start: 0, size: 20 },
  { start: 40, size: 12 },
  { start: 70, size: 50 },
  { start: 150, size: 15 },
];

describe("chooseHole — 요청 14", () => {
  it("First: 처음부터 훑어 첫 번째로 들어가는 블록(20)", () => {
    expect(chooseHole(HOLES, 14, "first")).toEqual({ index: 0, wrapped: false });
  });
  it("Best: 들어가는 것 중 가장 작은 블록(15)", () => {
    expect(chooseHole(HOLES, 14, "best").index).toBe(3);
  });
  it("Worst: 가장 큰 블록(50)", () => {
    expect(chooseHole(HOLES, 14, "worst").index).toBe(2);
  });
  it("Next: 마지막 배치 위치(주소 45) 다음부터 → 50 블록", () => {
    expect(chooseHole(HOLES, 14, "next", 45)).toEqual({ index: 2, wrapped: false });
  });
  it("Next wrap-around: 끝까지 가도 없으면 처음으로 돌아가 찾는다", () => {
    expect(chooseHole(HOLES, 18, "next", 130)).toEqual({ index: 0, wrapped: true });
  });
  it("같은 요청이라도 알고리즘마다 고르는 블록이 다르다", () => {
    const picks = FITS.map((f) => chooseHole(HOLES, 14, f, 25).index);
    expect(new Set(picks).size).toBe(3); // next(25 이후 첫 블록 12는 작아서 50) = worst와 같음
    expect(picks).toEqual([0, 3, 2, 2]);
  });
  it("동점이면 낮은 주소, 들어갈 곳이 없으면 null", () => {
    const tie = [
      { start: 0, size: 30 },
      { start: 50, size: 30 },
    ];
    expect(chooseHole(tie, 10, "best").index).toBe(0);
    expect(chooseHole(tie, 10, "worst").index).toBe(0);
    expect(chooseHole(tie, 31, "first").index).toBeNull();
  });
});

describe("simulatePartitions — Ch07 p.15 Figure 7.4 The Effect of Dynamic Partitioning (64M, OS 8M)", () => {
  const steps = simulatePartitions(
    64,
    8,
    [
      { type: "alloc", name: "P1", size: 20 },
      { type: "alloc", name: "P2", size: 14 },
      { type: "alloc", name: "P3", size: 18 },
      { type: "free", name: "P2" },
      { type: "alloc", name: "P4", size: 8 },
      { type: "free", name: "P1" },
      { type: "alloc", name: "P2", size: 14 },
    ],
    "first",
  );
  it.each([
    ["(b) P1 적재", 0, "OS 8 | P1 20 | 36"],
    ["(c) P2 적재", 1, "OS 8 | P1 20 | P2 14 | 22"],
    ["(d) P3 적재", 2, "OS 8 | P1 20 | P2 14 | P3 18 | 4"],
    ["(e) P2 나감", 3, "OS 8 | P1 20 | 14 | P3 18 | 4"],
    ["(f) P4 적재", 4, "OS 8 | P1 20 | P4 8 | 6 | P3 18 | 4"],
    ["(g) P1 나감", 5, "OS 8 | 20 | P4 8 | 6 | P3 18 | 4"],
    ["(h) P2 다시 적재", 6, "OS 8 | P2 14 | 6 | P4 8 | 6 | P3 18 | 4"],
  ])("%s", (_, i, layout) => {
    expect(formatRegions(steps[i].regions)).toBe(layout);
  });
});

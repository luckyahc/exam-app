import { describe, expect, it } from "vitest";
import {
  type BuddyOp,
  buddyBlocks,
  buddyRelease,
  buddyRequest,
  createBuddy,
  roundUpPow2,
  simulateBuddy,
} from "./buddy";

// Ch07 p.23 슬라이드 표를 그대로 전사 (단위 K, 1M = 1024K)
const OPS: BuddyOp[] = [
  { type: "request", name: "A", size: 100 },
  { type: "request", name: "B", size: 240 },
  { type: "request", name: "C", size: 64 },
  { type: "request", name: "D", size: 256 },
  { type: "release", name: "B" },
  { type: "release", name: "A" },
  { type: "request", name: "E", size: 75 },
  { type: "release", name: "C" },
  { type: "release", name: "E" },
  { type: "release", name: "D" },
];
const SLIDE = [
  "A=128K | 128K | 256K | 512K",
  "A=128K | 128K | B=256K | 512K",
  "A=128K | C=64K | 64K | B=256K | 512K",
  "A=128K | C=64K | 64K | B=256K | D=256K | 256K",
  "A=128K | C=64K | 64K | 256K | D=256K | 256K",
  "128K | C=64K | 64K | 256K | D=256K | 256K",
  "E=128K | C=64K | 64K | 256K | D=256K | 256K",
  "E=128K | 128K | 256K | D=256K | 256K",
  "512K | D=256K | 256K",
  "1M",
];

describe("buddy — Ch07 p.23 1MB 트레이스 (슬라이드 표 그대로)", () => {
  const steps = simulateBuddy(1024, OPS);
  it.each(SLIDE.map((line, i) => [i, line] as const))("%i단계: %s", (i, line) => {
    expect(steps[i].line).toBe(line);
  });

  it("원본 §6-3 중간 상태: A=[0,128K) C=[128K,192K) B=[256K,512K) D=[512K,768K)", () => {
    const at = Object.fromEntries(
      steps[3].blocks.filter((b) => b.name).map((b) => [b.name, [b.start, b.start + b.size]]),
    );
    expect(at).toEqual({ A: [0, 128], C: [128, 192], B: [256, 512], D: [512, 768] });
  });

  it("Release A: 둘 다 비어 있어도 buddy가 쪼개져 있으면 병합하지 않는다 (단순 인접 병합이면 틀림)", () => {
    expect(steps[5].blocks.slice(0, 3)).toEqual([
      { start: 0, size: 128, name: null },
      { start: 128, size: 64, name: "C" },
      { start: 192, size: 64, name: null },
    ]);
  });
});

describe("buddy 규칙", () => {
  it("요청을 2^k로 올림: 40→64, 100→128, 64→64, 내부 단편화 = 블록 − 요청", () => {
    expect([40, 100, 64, 75].map(roundUpPow2)).toEqual([64, 128, 64, 128]);
    const r = buddyRequest(createBuddy(1024), "A", 100);
    expect(r.ok && r.internalFragmentation).toBe(28);
  });
  it("같은 크기 빈 블록이 여럿이면 가장 작은 크기 → 낮은 주소 우선", () => {
    let s = createBuddy(1024);
    s = (buddyRequest(s, "A", 256) as { state: typeof s }).state; // A=[0,256)
    s = (buddyRequest(s, "B", 128) as { state: typeof s }).state; // 256K 블록 [256,512)을 쪼갬
    expect(buddyBlocks(s).map((b) => [b.name, b.start, b.size])).toEqual([
      ["A", 0, 256],
      ["B", 256, 128],
      [null, 384, 128],
      [null, 512, 512],
    ]);
  });
  it("들어갈 블록이 없으면 실패하고 상태는 그대로", () => {
    const s = createBuddy(256);
    const r = buddyRequest(s, "A", 300);
    expect(r.ok).toBe(false);
    expect(r.state).toBe(s);
  });
  it("병합은 연쇄된다", () => {
    let s = createBuddy(256);
    for (const [n, k] of [
      ["A", 32],
      ["B", 32],
      ["C", 64],
    ] as const)
      s = (buddyRequest(s, n, k) as { state: typeof s }).state;
    s = buddyRelease(s, "A");
    s = buddyRelease(s, "C");
    s = buddyRelease(s, "B");
    expect(buddyBlocks(s)).toEqual([{ start: 0, size: 256, name: null }]);
  });
  it("오답 보기용 옵션: merge=false면 병합 안 함, allocate=right면 오른쪽 할당", () => {
    const noMerge = simulateBuddy(1024, OPS, { merge: false });
    expect(noMerge[9].line).not.toBe("1M");
    const right = simulateBuddy(1024, OPS.slice(0, 1), { allocate: "right" });
    expect(right[0].line).toBe("512K | 256K | 128K | A=128K");
  });
  it("없는 블록 반납은 오류", () => {
    expect(() => buddyRelease(createBuddy(64), "Z")).toThrow();
  });
});

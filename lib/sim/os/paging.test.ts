import { describe, expect, it } from "vitest";
import { bitSplit, logicalToPhysical, physicalToLogical, solveFrame, splitAddress } from "./paging";
import { segLogicalToPhysical, segPhysicalToLogical, solveBase } from "./segmentation";

// Ch07 p.34-36: 페이지 크기 1024, 페이지 테이블 {0→1, 1→2, 2→x}, 메모리 프레임 0=P2, 1=P0, 2=P1 (x=0)
const TABLE = [1, 2, 0];

describe("paging — Ch07 p.34-36 기준값", () => {
  it("논리 3 → 물리 1027, 논리 1026 → 물리 2050", () => {
    expect(logicalToPhysical(TABLE, 1024, 3)).toEqual({
      page: 0,
      offset: 3,
      frame: 1,
      physical: 1027,
      fault: false,
    });
    expect(logicalToPhysical(TABLE, 1024, 1026)).toMatchObject({
      page: 1,
      offset: 2,
      frame: 2,
      physical: 2050,
    });
  });
  it("물리 2050 → 논리 1026 (선형 탐색으로 프레임 2를 가진 페이지 1을 찾음)", () => {
    expect(physicalToLogical(TABLE, 1024, 2050)).toEqual({
      frame: 2,
      offset: 2,
      page: 1,
      logical: 1026,
      comparisons: 2,
    });
  });
  it("논리 2049 → 물리 1이 되려면 x = 0", () => {
    expect(solveFrame(2049, 1, 1024)).toBe(0);
    expect(logicalToPhysical(TABLE, 1024, 2049).physical).toBe(1);
  });
  it("페이지 크기 1000 예시(p.32): 논리 1,179 → 페이지 1·offset 179 → 프레임 5 → 물리 5,179", () => {
    expect(splitAddress(1179, 1000)).toEqual({ page: 1, offset: 179 });
    expect(logicalToPhysical([0, 5], 1000, 1179).physical).toBe(5179);
  });
  it("p.33 비트 분해: 16비트 주소, 1KB 페이지 → 상위 6비트 page, 하위 10비트 offset (1502 → 페이지 1·offset 478 → 프레임 6 → 6622)", () => {
    const s = bitSplit(1502, 16, 1024);
    expect(s).toMatchObject({ pageBits: 6, offsetBits: 10, page: 1, offset: 478 });
    expect(s.binary).toBe("0000010111011110");
    expect(logicalToPhysical([5, 6, 25], 1024, 1502).physical).toBe(6622);
    expect((6622).toString(2).padStart(16, "0")).toBe("0001100111011110");
  });
  it("메모리에 없는 페이지(null)는 페이지 폴트", () => {
    expect(logicalToPhysical([1, null], 1024, 1500)).toMatchObject({
      page: 1,
      fault: true,
      physical: null,
    });
  });
  it("매핑 없는 프레임은 null, offset이 다르면 x를 구할 수 없음", () => {
    expect(physicalToLogical(TABLE, 1024, 5000)).toBeNull();
    expect(() => solveFrame(2049, 2, 1024)).toThrow();
  });
});

// Ch07 p.41: 세그먼트 최대 크기 1024, 테이블 {0:(1024,100), 1:(2048,200), 2:(x,150)}, x=0
const SEGS = [
  { base: 1024, length: 100 },
  { base: 2048, length: 200 },
  { base: 0, length: 150 },
];

describe("segmentation — Ch07 p.41 기준값", () => {
  it("논리 3 → 1027, 논리 1026 → 2050, 논리 2049 → 1", () => {
    expect(segLogicalToPhysical(SEGS, 1024, 3)).toEqual({
      segment: 0,
      offset: 3,
      trap: false,
      physical: 1027,
    });
    expect(segLogicalToPhysical(SEGS, 1024, 1026).physical).toBe(2050);
    expect(segLogicalToPhysical(SEGS, 1024, 2049).physical).toBe(1);
  });
  it("물리 2050 → 논리 1026, 빈칸 x = 0", () => {
    expect(segPhysicalToLogical(SEGS, 1024, 2050)).toEqual({
      segment: 1,
      offset: 2,
      logical: 1026,
    });
    expect(solveBase(2049, 1, 1024)).toBe(0);
  });
  it("offset ≥ 세그먼트 길이면 보호 위반(트랩)", () => {
    expect(segLogicalToPhysical(SEGS, 1024, 100)).toMatchObject({
      trap: true,
      segment: 0,
      offset: 100,
      length: 100,
    });
    expect(segLogicalToPhysical(SEGS, 1024, 99).trap).toBe(false);
    expect(segLogicalToPhysical(SEGS, 1024, 1024 + 250).trap).toBe(true);
  });
});

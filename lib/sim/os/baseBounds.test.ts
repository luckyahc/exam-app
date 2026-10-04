import { describe, expect, it } from "vitest";
import { baseBounds } from "./baseBounds";

describe("baseBounds — Ch07 p.7", () => {
  it("상대주소 < bounds이면 상대주소 + base", () => {
    expect(baseBounds(30000, 5000, 1200)).toEqual({ trap: false, physical: 31200 });
    expect(baseBounds(30000, 5000, 0)).toEqual({ trap: false, physical: 30000 });
    expect(baseBounds(30000, 5000, 4999)).toEqual({ trap: false, physical: 34999 });
  });
  it("상대주소 ≥ bounds이면 보호 위반(트랩) — 경계값 포함", () => {
    expect(baseBounds(30000, 5000, 5000)).toEqual({ trap: true, physical: null });
    expect(baseBounds(30000, 5000, 6200)).toEqual({ trap: true, physical: null });
  });
});

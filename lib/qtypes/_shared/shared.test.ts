import { describe, expect, it } from "vitest";
import { shuffledIndexes } from "@/lib/random";
import { isPermutation, orderScore } from "./orderScore";
import { matchesAny, normalizeText } from "./textMatch";

describe("textMatch", () => {
  it("공백·대소문자·전각을 무시한다", () => {
    expect(normalizeText("  Demand  Paging ")).toBe("demandpaging");
    expect(normalizeText("ＴＬＢ")).toBe("tlb");
    expect(matchesAny("지역성의원리", ["지역성의 원리"])).toBe(true);
    expect(matchesAny("locality", ["Locality"])).toBe(true);
  });
  it("빈 입력은 어떤 답과도 맞지 않는다", () => {
    expect(matchesAny("   ", [""])).toBe(false);
    expect(matchesAny("스레싱", ["스래싱"])).toBe(false);
  });
});

describe("orderScore", () => {
  it("완전 일치 1, 완전 역순 0", () => {
    expect(orderScore([0, 1, 2, 3])).toBe(1);
    expect(orderScore([3, 2, 1, 0])).toBe(0);
  });
  it("인접한 두 항목만 뒤바뀌면 (쌍 수 − 1)/쌍 수", () => {
    expect(orderScore([0, 2, 1, 3])).toBeCloseTo(5 / 6);
  });
  it("항목 1개 이하는 1", () => {
    expect(orderScore([0])).toBe(1);
  });
  it("isPermutation", () => {
    expect(isPermutation([2, 0, 1], 3)).toBe(true);
    expect(isPermutation([0, 0, 1], 3)).toBe(false);
    expect(isPermutation([0, 1], 3)).toBe(false);
  });
});

describe("shuffledIndexes", () => {
  it("같은 seed는 같은 순서, 순열이며 정답 순서로 시작하지 않는다", () => {
    for (const seed of ["a", "os-ch03-demo-order-001", "x-y-z"]) {
      for (const n of [2, 3, 4, 7]) {
        const s = shuffledIndexes(n, seed);
        expect(s).toEqual(shuffledIndexes(n, seed));
        expect(isPermutation(s, n)).toBe(true);
        expect(s.every((v, i) => v === i)).toBe(false);
      }
    }
  });
});

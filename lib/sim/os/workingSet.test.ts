import { describe, expect, it } from "vitest";
import { workingSet } from "./workingSet";

describe("workingSet — Ch08 p.60 W(t, Δ)", () => {
  const refs = [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2]; // Figure 8.15 참조열을 시각 1~12로 사용

  it("시각 t를 포함한 최근 Δ번의 참조에서 중복을 뺀 집합", () => {
    expect(workingSet(refs, 5, 3)).toEqual({ window: [2, 1, 5], pages: [2, 1, 5], size: 3 });
    expect(workingSet(refs, 12, 4)).toEqual({ window: [3, 2, 5, 2], pages: [3, 2, 5], size: 3 });
    expect(workingSet(refs, 8, 5)).toEqual({ window: [1, 5, 2, 4, 5], pages: [1, 5, 2, 4], size: 4 });
  });

  it("t가 Δ보다 작으면 처음부터 t까지", () => {
    expect(workingSet(refs, 2, 5)).toEqual({ window: [2, 3], pages: [2, 3], size: 2 });
  });

  it("Δ가 커질수록 워킹 셋 크기는 줄지 않는다(지역성을 더 담음)", () => {
    for (let d = 1; d < 12; d++) expect(workingSet(refs, 12, d + 1).size).toBeGreaterThanOrEqual(workingSet(refs, 12, d).size);
  });

  it("범위 밖 입력은 예외", () => {
    expect(() => workingSet(refs, 0, 3)).toThrow();
    expect(() => workingSet(refs, 13, 3)).toThrow();
    expect(() => workingSet(refs, 5, 0)).toThrow();
  });
});

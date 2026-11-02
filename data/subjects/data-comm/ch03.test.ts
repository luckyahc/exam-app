import { describe, expect, it } from "vitest";
import ch03 from "./ch03";

// Ch03 기말 문항 형식 점검(docs/final/data-comm-format.md): 선택형 보기 5개, '모두 고르시오' 정답 2~4개,
// 강의 예제 Example 3.1~3.12가 모두 sourceRef 문항으로 들어 있다. 계산·비트열 정답은 ch03.ts가 lib/sim/data-comm/dataLink.ts로 구하고,
// 그 함수의 슬라이드 기준값은 lib/sim/data-comm/dataLink.test.ts가 고정한다.

describe("데이터 통신 Ch03 형식", () => {
  it("id가 겹치지 않고 모두 ch03 접두사", () => {
    const ids = ch03.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^data-comm-ch03-[a-z]+-\d{3}$/);
  });

  it("mcq·multi 보기 5개, multi 정답 2~4개, 지문은 '모두 고르시오'", () => {
    for (const q of ch03) {
      if (q.type === "mcq") expect(q.choices, q.id).toHaveLength(5);
      if (q.type === "multi") {
        expect(q.choices, q.id).toHaveLength(5);
        expect(q.answerIndexes.length, q.id).toBeGreaterThanOrEqual(2);
        expect(q.answerIndexes.length, q.id).toBeLessThanOrEqual(4);
        expect(q.prompt, q.id).toMatch(/모두 고르시오\.$/);
      }
      if (q.type === "mcq" || q.type === "multi") expect(new Set(q.choices).size, q.id).toBe(5);
    }
  });

  it("선택형(mcq+multi)이 절반 이상 — 족보 88%가 선택형", () => {
    const choice = ch03.filter((q) => q.type === "mcq" || q.type === "multi").length;
    expect(choice / ch03.length).toBeGreaterThanOrEqual(0.5);
  });

  it("강의 예제 Example 3.1~3.12가 모두 sourceRef 문항으로 있다(쪽 = ⌈슬라이드 ÷ 2⌉)", () => {
    const labels = ch03.flatMap((q) => (q.sourceRef ? [q.sourceRef.label] : []));
    for (let n = 1; n <= 12; n++) expect(labels, `Example 3.${n}`).toContain(`Example 3.${n}`);
    for (const q of ch03.filter((x) => x.sourceRef)) {
      expect(q.sourceRef!.lecture).toBe("Ch03");
      const pages = [...q.slideRef.matchAll(/\d+/g)].slice(1).map((m) => Math.ceil(Number(m[0]) / 2)); // "Ch03 s.22-23" → 11, 12
      expect(pages, q.id).toContain(q.sourceRef!.page);
    }
  });

  it("해설은 's.번호 (p.쪽)'으로 시작하고 쪽 = ⌈슬라이드 ÷ 2⌉", () => {
    for (const q of ch03) {
      const m = /^s\.(\d+)(?:~\d+)? \(p\.(\d+)/.exec(q.explanation);
      expect(m, q.id).not.toBeNull();
      expect(Number(m![2]), q.id).toBe(Math.ceil(Number(m![1]) / 2));
    }
  });
});

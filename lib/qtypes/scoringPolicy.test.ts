import { describe, expect, it } from "vitest";
import { getSubject, starLabel, usesExamPoints } from "@/lib/subjects";
import { multiCore, type MultiQ } from "./multi";
import { gradeQuestion, isAllOrNothing } from "./registry";

// 결정 6(2026-10-06): 데이터과학 multi는 0/1. 다른 과목의 multi는 부분 점수 그대로.
const base: MultiQ = {
  id: "data-science-lec2-demo-multi-001",
  subject: "data-science",
  chapter: "lec2",
  topic: "튜플",
  type: "multi",
  exam: false,
  difficulty: 1,
  slideRef: "Lec2 s.25",
  prompt: "튜플에 대한 설명으로 옳은 것을 모두 고르시오.",
  choices: ["순서가 있는 데이터의 목록이다", "값을 변경할 수 없다", "중복을 허용하지 않는다", "키와 값이 쌍을 이룬다"],
  answerIndexes: [0, 1],
  explanation: "s.25~26: 튜플은 순서가 있고 한번 할당하면 값을 변경하거나 삭제할 수 없다. 중복 불허는 세트, 키-값은 딕셔너리.",
};

describe("과목별 0/1 채점 (allOrNothing)", () => {
  it("데이터과학 multi: 일부만 맞으면 0점(부분 점수 없음), 다 맞으면 1점", () => {
    expect(isAllOrNothing(base)).toBe(true);
    expect(gradeQuestion(base, [0])).toMatchObject({ correct: false, score: 0 });
    expect(gradeQuestion(base, [0, 1, 2])).toMatchObject({ correct: false, score: 0 });
    expect(gradeQuestion(base, [0, 1])).toMatchObject({ correct: true, score: 1 });
  });
  it("OS·데이터 통신 multi는 그대로 부분 점수", () => {
    const os = { ...base, subject: "os" as const, chapter: "ch03", id: "os-ch03-demo-multi-009" } as MultiQ;
    expect(isAllOrNothing(os)).toBe(false);
    expect(gradeQuestion(os, [0]).score).toBeCloseTo(0.5);
  });
  it("데이터과학이라도 0/1 목록에 없는 유형은 기존 채점", () => {
    expect(isAllOrNothing({ subject: "data-science", type: "order" })).toBe(false);
  });
});

describe("복수 선택 정답 2개 이상 (전 과목 데이터 검증)", () => {
  it("정답이 하나뿐인 multi는 검증 오류", () => {
    expect(multiCore.validate({ ...base, answerIndexes: [1] })).toContainEqual(expect.stringContaining("2개 이상"));
    expect(multiCore.validate(base)).toEqual([]);
  });
});

describe("⭐ 표시", () => {
  it("데이터과학은 ⭐을 쓰지 않는다 → '해당 없음', 기존 과목은 개수", () => {
    const ds = getSubject("data-science")!;
    const os = getSubject("os")!;
    expect(usesExamPoints(ds)).toBe(false);
    expect(starLabel(ds, 0, true)).toBe("해당 없음");
    expect(usesExamPoints(os)).toBe(true);
    expect(starLabel(os, 7, true)).toBe("시험 포인트 7개");
    expect(starLabel(os, 0)).toBe("0개");
  });
});

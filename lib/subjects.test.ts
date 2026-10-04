import { describe, expect, it } from "vitest";
import { getChapter, getSubject, subjectOfQuestionId } from "./subjects";

describe("subjectOfQuestionId", () => {
  it("과목 id에 하이픈이 있어도 접두사로 과목을 찾는다", () => {
    expect(subjectOfQuestionId("os-ch08-clock-001")).toBe("os");
    expect(subjectOfQuestionId("data-comm-ch02-shannon-001")).toBe("data-comm");
    expect(subjectOfQuestionId("os-ch08-gen-replacement-48213")).toBe("os");
  });

  it("등록된 과목 접두사가 아니면 undefined", () => {
    expect(subjectOfQuestionId("ch08-clock-trace-001")).toBeUndefined();
    expect(subjectOfQuestionId("data-commx-ch01-a-001")).toBeUndefined();
    expect(subjectOfQuestionId("os")).toBeUndefined();
  });

  it("겹치는 접두사가 있으면 가장 긴 과목 id를 고른다", () => {
    const subjects = [{ id: "data" }, { id: "data-comm" }];
    expect(subjectOfQuestionId("data-comm-ch01-x-001", subjects)).toBe("data-comm");
    expect(subjectOfQuestionId("data-ch01-x-001", subjects)).toBe("data");
  });
});

describe("getSubject / getChapter", () => {
  it("챕터 id는 과목 안에서 찾는다 (os ch02 ≠ data-comm ch02)", () => {
    expect(getChapter("os", "ch02")?.title).toBe("Ch02. 운영체제 개요");
    expect(getChapter("data-comm", "ch02")?.title).toBe("Ch02. 물리 계층");
    expect(getChapter("os", "ch01")).toBeUndefined();
    expect(getSubject("nope")).toBeUndefined();
  });
});

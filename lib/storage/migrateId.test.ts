import { describe, expect, it } from "vitest";
import { migrateLegacyQuestionId } from "./migrateId";

describe("migrateLegacyQuestionId", () => {
  it("v1 OS id에 os- 접두사를 붙인다", () => {
    expect(migrateLegacyQuestionId("ch08-clock-trace-001")).toBe("os-ch08-clock-trace-001");
    expect(migrateLegacyQuestionId("ch02-os-support-003")).toBe("os-ch02-os-support-003");
  });

  it("멱등: 이미 변환된 id는 그대로", () => {
    const once = migrateLegacyQuestionId("ch07-buddy-trace-003");
    expect(migrateLegacyQuestionId(once)).toBe(once);
  });

  it("다른 과목 id·규칙 밖 id는 그대로 (고아 id도 지우지 않음)", () => {
    expect(migrateLegacyQuestionId("data-comm-ch02-shannon-001")).toBe(
      "data-comm-ch02-shannon-001",
    );
    expect(migrateLegacyQuestionId("ch01-intro-001")).toBe("ch01-intro-001");
    expect(migrateLegacyQuestionId("ch99-x-001")).toBe("ch99-x-001");
  });
});

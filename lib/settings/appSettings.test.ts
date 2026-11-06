import { describe, expect, it } from "vitest";
import { continueLink } from "@/lib/quiz/startLinks";
import {
  applyQuizDefaults,
  daysUntil,
  ddayLabel,
  DEFAULT_SETTINGS,
  parseSettings,
} from "./appSettings";

describe("설정 값 읽기", () => {
  it("모르는 값·잘못된 값은 기본값, 날짜는 YYYY-MM-DD만 남긴다", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(
      parseSettings({
        quizCount: 25,
        quizOrder: "x",
        quizMode: "exam",
        other: 1,
        examDates: { os: "2026-12-10", dc: "12/10", ds: 3 },
      }),
    ).toEqual({
      progressScope: "final",
      quizCount: 20,
      quizOrder: "ordered",
      quizMode: "exam",
      examDates: { os: "2026-12-10" },
    });
  });
});

describe("D-day", () => {
  const today = new Date(2026, 10, 4); // 2026-11-04 (기기 시간대)
  it("남은 날짜와 표시", () => {
    expect(daysUntil("2026-11-16", today)).toBe(12);
    expect(ddayLabel("2026-11-16", today)).toBe("D-12");
    expect(ddayLabel("2026-11-04", today)).toBe("D-day");
    expect(ddayLabel("2026-11-03", today)).toBeNull();
    expect(ddayLabel(undefined, today)).toBeNull();
  });
});

describe("이어 풀기 주소(기존 퀴즈 쿼리만 사용)", () => {
  const s = {
    ...DEFAULT_SETTINGS,
    quizCount: 30 as const,
    quizOrder: "shuffle" as const,
    quizMode: "exam" as const,
  };
  it("안 풂 → 시작하기, 일부 → 이어 풀기 (n/N) + 안 푼 문제만, 다 풂 → 다시 풀기(전체)", () => {
    expect(continueLink("os", "2-2-final", 0, 40, s).label).toBe("시작하기");
    const mid = continueLink("os", "2-2-final", 12, 40, s);
    expect(mid.label).toBe("이어 풀기 (12/40)");
    expect(Object.fromEntries(new URL(mid.href, "http://x").searchParams)).toEqual({
      subject: "os",
      exam: "2-2-final",
      status: "unsolved",
      count: "30",
      shuffle: "1",
      // 설정이 시험 모드여도 이어 풀기는 항상 연습 모드
      mode: "instant",
    });
    const done = continueLink("os", "2-2-final", 40, 40, s);
    expect(done.label).toBe("다시 풀기");
    expect(new URL(done.href, "http://x").searchParams.has("status")).toBe(false);
  });
  it("기본 설정: 20문제 · 순서대로 · 연습(즉시 채점)", () => {
    expect(applyQuizDefaults(new URLSearchParams(), DEFAULT_SETTINGS).toString()).toBe(
      "count=20&shuffle=0&mode=instant",
    );
  });
});

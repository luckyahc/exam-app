import { describe, expect, it } from "vitest";
import { continueLink } from "@/lib/quiz/startLinks";
import { pickHero } from "@/components/home/HomeView";
import type { RecordsState } from "@/lib/storage/recordsStore";
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

describe("홈 맨 위 과목 고르기", () => {
  const subjects = [
    { id: "os", name: "운영체제", ready: true, ids: ["os-1"] },
    { id: "dc", name: "데이터 통신", ready: true, ids: ["dc-1"] },
    { id: "ps", name: "심리학개론", ready: false, ids: [] },
  ];
  const rec = (lastAt: string) => ({
    progress: { x: { attempts: 1, correctCount: 1, lastScore: 1, lastAt } },
    wrong: {},
    bookmarks: [],
  });
  const records: RecordsState = {
    loaded: true,
    subjects: { os: rec("2026-11-01T00:00:00Z"), dc: rec("2026-11-03T00:00:00Z") },
  };

  it("기록도 날짜도 없으면 문제가 있는 첫 과목", () => {
    expect(pickHero(subjects, { loaded: true, subjects: {} }, DEFAULT_SETTINGS)?.id).toBe("os");
  });
  it("날짜가 없으면 가장 최근에 푼 과목", () => {
    expect(pickHero(subjects, records, DEFAULT_SETTINGS)?.id).toBe("dc");
  });
  it("날짜가 있으면 가장 가까운 시험(지난 날짜 제외)", () => {
    const far = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    const near = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
    expect(
      pickHero(subjects, records, { ...DEFAULT_SETTINGS, examDates: { os: near, dc: far } })?.id,
    ).toBe("os");
    expect(
      pickHero(subjects, records, { ...DEFAULT_SETTINGS, examDates: { os: "2000-01-01" } })?.id,
    ).toBe("dc");
  });
});

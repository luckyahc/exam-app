import { describe, expect, it } from "vitest";
import os from "./index";

// OS 회귀 스냅샷: 다과목 전환 전 lib/chapters.ts(Sprint 1)의 챕터 목록과 원본 md의 최소 문항 수.
// 이 값이 바뀌면 기존 OS 화면·링크·학습 기록이 깨질 수 있으므로 의도한 변경일 때만 고친다.
const BEFORE = [
  { id: "ch02", title: "Ch02. 운영체제 개요", shortTitle: "운영체제 개요", minQuestions: 50 },
  { id: "ch03", title: "Ch03. 프로세스 기술과 제어", shortTitle: "프로세스", minQuestions: 80 },
  { id: "ch07", title: "Ch07. 메모리 관리", shortTitle: "메모리 관리", minQuestions: 80 },
  { id: "ch08", title: "Ch08. 가상 메모리", shortTitle: "가상 메모리", minQuestions: 120 },
  // 2026-10-12 시험 범위 추가(Sprint 18), minQuestions는 Sprint 19 소주제 목표 합계 — 기존 4개 챕터는 그대로
  { id: "ch09", title: "Ch09. 단일 프로세서 스케줄링", shortTitle: "스케줄링", minQuestions: 79 },
];

describe("OS 과목 레지스트리 (회귀)", () => {
  it("챕터 id·제목·순서·최소 문항 수가 전환 전과 같다", () => {
    expect(
      os.chapters.map(({ id, title, shortTitle, minQuestions }) => ({
        id,
        title,
        shortTitle,
        minQuestions,
      })),
    ).toEqual(BEFORE);
  });

  it("과목 id는 os, 근거 폴더는 source/os", () => {
    expect(os.id).toBe("os");
    expect(os.sourceDir).toBe("source/os");
  });
});

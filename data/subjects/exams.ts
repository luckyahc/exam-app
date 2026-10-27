/**
 * 시험(학기·중간/기말) 구분. 챕터마다 어느 시험 범위인지 `ChapterDef.exam`에 적는다.
 * 배열 순서 = 시간 순서. 과목 홈은 시험별로 챕터와 모의시험 상자를 나눠 보여 주고, 과목 전체 퀴즈는 `?exam=`으로 범위를 좁힌다.
 */
export const EXAMS = [
  { id: "2-2-mid", name: "2학년 2학기 중간고사", shortName: "중간고사" },
  { id: "2-2-final", name: "2학년 2학기 기말고사", shortName: "기말고사" },
] as const;

export type ExamId = (typeof EXAMS)[number]["id"];

/** 지금 준비하는 시험 — 과목 홈에서 맨 위에 보인다 */
export const CURRENT_EXAM: ExamId = "2-2-final";

export function getExam(id: string | null | undefined) {
  return EXAMS.find((e) => e.id === id);
}

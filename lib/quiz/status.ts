import type { SubjectRecords } from "@/lib/storage/schema";

/**
 * 풀이 상태(전 과목 "문제 목록"·챕터 시작의 풀이 상태 옵션) — 기존 판정 규칙(lib/storage/records.ts)을 그대로 따른다.
 * - 안 푼 문제(unsolved): 기록 없음. 시험 모드에서 답하지 않은 문제는 기록하지 않으므로 여기에 들어간다
 * - 맞힌 문제(correct): 마지막 풀이가 완전히 맞음(lastScore === 1 — 부분 점수는 오답)
 * - 틀린 문제(wrong): 마지막 풀이가 오답
 * 마지막 점수가 없는 옛 기록(v1 이관, lastScore null)은 오답노트가 미해결이면 틀림, 아니면 정답 횟수가 있으면 맞힘으로 본다.
 * "비슷한 문제"(생성기 seed가 다른 문제)의 기록은 원래 문제 id와 달라 섞이지 않는다 — 목록에는 챕터의 원래 문제만 나온다.
 */
export type QStatus = "unsolved" | "correct" | "wrong";

export const STATUS_LABEL: Record<QStatus, string> = { unsolved: "안 푼 문제", correct: "맞힌 문제", wrong: "틀린 문제" };

export function questionStatus(records: SubjectRecords | undefined, id: string): QStatus {
  const p = records?.progress[id];
  if (!p || p.attempts <= 0) return "unsolved";
  if (p.lastScore === 1) return "correct";
  if (p.lastScore !== null) return "wrong";
  const w = records?.wrong[id];
  if (w && !w.resolved) return "wrong";
  return p.correctCount > 0 ? "correct" : "wrong";
}

export const isStatus = (s: string): s is QStatus => s === "unsolved" || s === "correct" || s === "wrong";

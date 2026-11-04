import { type AppSettings, applyQuizDefaults } from "@/lib/settings/appSettings";

/**
 * 홈·과목 상세의 주 버튼. 기존 퀴즈 주소 쿼리만 쓴다(status=unsolved = 안 푼 문제, lib/quiz/status.ts).
 * 문제 수·순서는 설정 탭 기본값, 모드는 설정과 상관없이 항상 연습 모드(즉시 채점) — 기본 모드는 챕터의 "직접 고르기"에만 쓴다.
 * - 하나도 안 풂: "시작하기" / 일부 풂: "이어 풀기 (n/N)" — 안 푼 문제만 / 다 풂: "다시 풀기" — 시험 범위 전체
 */
export function continueLink(
  subjectId: string,
  exam: string,
  solved: number,
  total: number,
  settings: AppSettings,
): { href: string; label: string } {
  const p = new URLSearchParams({ subject: subjectId, exam });
  const done = total > 0 && solved >= total;
  if (!done) p.set("status", "unsolved");
  applyQuizDefaults(p, settings);
  p.set("mode", "instant");
  const label = solved === 0 ? "시작하기" : done ? "다시 풀기" : `이어 풀기 (${solved}/${total})`;
  return { href: `/quiz?${p.toString()}`, label };
}

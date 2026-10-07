/**
 * ⭐ 근거별 선택(챕터 시작·문제 목록·통계). OS는 ⭐ 근거가 둘이다 — 교수님 필기(examBasis "handwritten")와
 * 교수님 공식 시험 힌트(hintIds가 있는 문항, docs/os-exam-hint.md). 필기 ⭐에 힌트가 함께 붙은 문항은 두 근거 모두에 든다.
 * 근거가 하나뿐인 과목(데이터 통신 = 인쇄 강조만, 데이터과학 = ⭐ 없음)은 선택지를 보이지 않는다.
 */
export type StarBasis = "all" | "handwritten" | "hint";

export const STAR_LABEL: Record<StarBasis, string> = { all: "전체 ⭐", handwritten: "교수님 필기만", hint: "시험 힌트만" };

interface StarLike {
  exam: boolean;
  examBasis?: string;
  hintIds?: readonly string[];
}

export function matchesStar(q: StarLike, basis: StarBasis): boolean {
  if (!q.exam) return false;
  if (basis === "handwritten") return q.examBasis === "handwritten";
  if (basis === "hint") return !!q.hintIds?.length;
  return true;
}

/** 근거별 선택지를 보일지: 필기 ⭐와 시험 힌트 ⭐가 둘 다 있을 때만 */
export function hasStarChoice(qs: readonly StarLike[]): boolean {
  return qs.some((q) => matchesStar(q, "handwritten")) && qs.some((q) => matchesStar(q, "hint"));
}

/** 퀴즈 주소의 star 값: "1"(예전 링크 포함) = 전체 ⭐, "handwritten", "hint". 없으면 null */
export function parseStar(v: string | null): StarBasis | null {
  if (!v) return null;
  if (v === "handwritten" || v === "hint") return v;
  return "all";
}

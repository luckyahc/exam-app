/**
 * 문제 분류(족보 / 일반) — Sprint 18, docs/jokbo-plan.md. 족보 문항은 `origin: "jokbo"`와 `jokbo` 필드를 가진다
 * (lib/qtypes/base.ts). 과목 홈 "족보만 풀기", 챕터 시작·문제 목록의 분류 필터, 문항 뱃지, 해설 출처 표시가 쓴다.
 */
export type SourceFilter = "all" | "jokbo" | "general";

export const SOURCE_LABEL: Record<SourceFilter, string> = { all: "전체", jokbo: "족보", general: "일반" };

interface SourceLike {
  origin?: string;
  jokbo?: { occurrences: readonly unknown[]; explanationSource: "jokbo" | "generated" };
}

export function isJokbo(q: SourceLike): boolean {
  return q.origin === "jokbo";
}

/** 분류 조건: 없음·"all" = 전체 */
export function matchesSource(q: SourceLike, f: SourceFilter | null | undefined): boolean {
  if (!f || f === "all") return true;
  return f === "jokbo" ? isJokbo(q) : !isJokbo(q);
}

/** 퀴즈 주소의 source 값: "jokbo" | "general". 그 밖은 null(전체) */
export function parseSource(v: string | null): Exclude<SourceFilter, "all"> | null {
  return v === "jokbo" || v === "general" ? v : null;
}

/** 문항 뱃지 글자: 족보 문항이 아니면 null, 출현 2회 이상이면 "족보 N회" */
export function jokboBadge(q: SourceLike): string | null {
  if (!isJokbo(q)) return null;
  const n = q.jokbo?.occurrences.length ?? 0;
  return n >= 2 ? `족보 ${n}회` : "족보";
}

export const EXPLANATION_SOURCE_LABEL = { jokbo: "족보 해설", generated: "생성 해설" } as const;

/** 해설 머리의 출처 표시: 족보 문항만("족보 해설" / "생성 해설") */
export function explanationSourceLabel(q: SourceLike): string | null {
  return isJokbo(q) && q.jokbo ? EXPLANATION_SOURCE_LABEL[q.jokbo.explanationSource] : null;
}

/**
 * 문제 분류(족보 / 일반) — Sprint 18, docs/jokbo-plan.md. 족보 문항은 `origin: "jokbo"`와 `jokbo` 필드를 가진다
 * (lib/qtypes/base.ts). 과목 홈 "족보만 풀기", 챕터 시작·문제 목록의 분류 필터, 문항 뱃지, 해설 출처 표시가 쓴다.
 */
export type SourceFilter = "all" | "jokbo" | "general" | "example" | "related";

/**
 * "example" = 강의자료 예제 문항(sourceRef, docs/verification/data-comm-examples.md) — 족보·일반과 겹칠 수 있는 별도 묶음.
 * "related" = 족보관련: 족보 유형을 본뜬 생성 문항(basedOn, 2026-10-19) — 족보 원문(jokbo)과 다른 묶음이며 "일반"에도 들어간다
 */
export const SOURCE_LABEL: Record<SourceFilter, string> = { all: "전체", jokbo: "족보", general: "일반", example: "강의 예제", related: "족보관련" };

interface SourceLike {
  origin?: string;
  jokbo?: { occurrences: readonly unknown[]; explanationSource: "jokbo" | "generated" };
  sourceRef?: { lecture: string; page: number; label: string };
  basedOn?: readonly string[];
}

export function isJokbo(q: SourceLike): boolean {
  return q.origin === "jokbo";
}

/** 족보관련 = 족보 유형 생성 문항(basedOn = 바탕 족보 id) */
export function isJokboRelated(q: SourceLike): boolean {
  return (q.basedOn?.length ?? 0) > 0;
}

export function isExample(q: SourceLike): boolean {
  return q.sourceRef !== undefined;
}

/** 강의 예제 뱃지 글자: "예제 · Example 2.1 (Ch02 p.5)". 예제가 아니면 null */
export function exampleBadge(q: SourceLike): string | null {
  const r = q.sourceRef;
  return r ? `예제 · ${r.label} (${r.lecture} p.${r.page})` : null;
}

/** 분류 조건: 없음·"all" = 전체 */
export function matchesSource(q: SourceLike, f: SourceFilter | null | undefined): boolean {
  if (!f || f === "all") return true;
  if (f === "example") return isExample(q);
  if (f === "related") return isJokboRelated(q);
  return f === "jokbo" ? isJokbo(q) : !isJokbo(q);
}

/** 퀴즈 주소의 source 값: "jokbo" | "general" | "example" | "related". 그 밖은 null(전체) */
export function parseSource(v: string | null): Exclude<SourceFilter, "all"> | null {
  return v === "jokbo" || v === "general" || v === "example" || v === "related" ? v : null;
}

/** 문항 뱃지 글자: 족보 문항이 아니면 null, 출현 2회 이상이면 "족보 N회" */
export function jokboBadge(q: SourceLike): string | null {
  if (!isJokbo(q)) return null;
  const n = q.jokbo?.occurrences.length ?? 0;
  return n >= 2 ? `족보 ${n}회` : "족보";
}

/** 족보관련 뱃지 글자: 생성 문항이 아니면 null */
export function relatedBadge(q: SourceLike): string | null {
  return isJokboRelated(q) ? SOURCE_LABEL.related : null;
}

export const EXPLANATION_SOURCE_LABEL = { jokbo: "족보 해설", generated: "생성 해설" } as const;

/** 해설 머리의 출처 표시: 족보 문항만("족보 해설" / "생성 해설") */
export function explanationSourceLabel(q: SourceLike): string | null {
  return isJokbo(q) && q.jokbo ? EXPLANATION_SOURCE_LABEL[q.jokbo.explanationSource] : null;
}

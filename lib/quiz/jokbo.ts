/**
 * 문제 분류(족보 / 일반) — Sprint 18, docs/jokbo-plan.md. 족보 문항은 `origin: "jokbo"`와 `jokbo` 필드를 가진다
 * (lib/qtypes/base.ts). 과목 홈 "족보만 풀기", 챕터 시작·문제 목록의 분류 필터, 문항 뱃지, 해설 출처 표시가 쓴다.
 */
export type SourceFilter = "all" | "jokbo" | "general" | "example" | "related" | "related2" | "mock1" | "mock2" | "hint1" | "hint2" | "hint3" | "short";

/**
 * "example" = 강의자료 예제 문항(sourceRef, docs/verification/data-comm-examples.md) — 족보·일반과 겹칠 수 있는 별도 묶음.
 * "related" = 족보관련: 족보 유형을 본뜬 생성 문항(basedOn, 2026-10-19) — 족보 원문(jokbo)과 다른 묶음이며 "일반"에도 들어간다.
 * "related2" = 족보관련2: 시험 힌트의 출제 유형(객관식·순서·짝 짓기·단답형)으로 만든 생성 문항(id "-jr2-", data/subjects/os/jokboRelated2.ts, 2026-10-21) — "족보관련"과 따로, "일반"에도 들어간다.
 * "mock1"·"mock2" = 족보관련1·2: 족보 수준 모의시험 세트(id "-mock1-NNN"·"-mock2-NNN", NNN = 세트 안 순서 — data/subjects/algorithm/mockExams.ts, 2026-10-22).
 *   basedOn이 있어 "족보관련"·"일반"에도 들어가고, 이 분류로 풀면 세트 순서 그대로 낸다(filterQuestions).
 * "hint1"~"hint3" = 힌트관련1~3: 교수님 시험 힌트(문항 수·5지선다·'모두 고르시오' 2~4개·계산·표)대로 만든 모의시험 세트
 *   (id "-hint1-NNN"~"-hint3-NNN" — data/subjects/data-comm/hintExams.ts, 2026-10-22). 실제 시험처럼 문제 순서를 섞어 낸다. "일반"에도 들어간다.
 * "short" = 단답형 문항(id가 "-short-NNN"으로 끝남 — OS data/subjects/os/shortAnswer.ts, 심리학 short()) — "일반"에도 들어간다
 */
export const SOURCE_LABEL: Record<SourceFilter, string> = { all: "전체", jokbo: "족보", general: "일반", example: "강의 예제", related: "족보관련", related2: "족보관련2", mock1: "족보관련1", mock2: "족보관련2", hint1: "힌트관련1", hint2: "힌트관련2", hint3: "힌트관련3", short: "단답형" };

interface SourceLike {
  id?: string;
  origin?: string;
  jokbo?: { occurrences: readonly unknown[]; explanationSource: "jokbo" | "generated" };
  sourceRef?: { lecture: string; page: number; label: string };
  basedOn?: readonly string[];
}

export function isJokbo(q: SourceLike): boolean {
  return q.origin === "jokbo";
}

/** 족보관련2 = 시험 힌트 출제 유형으로 만든 생성 문항(id "-jr2-") — basedOn이 있지만 "족보관련"과 따로 센다 */
export function isJokboRelated2(q: SourceLike): boolean {
  return /-jr2-/.test(q.id ?? "");
}

/** 족보관련 = 족보 유형 생성 문항(basedOn = 바탕 족보 id), 족보관련2 제외 */
export function isJokboRelated(q: SourceLike): boolean {
  return (q.basedOn?.length ?? 0) > 0 && !isJokboRelated2(q);
}

/** 족보관련1·2 모의시험 세트 번호(id "-mock1-NNN"·"-mock2-NNN"), 세트 문항이 아니면 null */
export function mockSetOf(q: SourceLike): 1 | 2 | null {
  const m = /-mock([12])-\d{3}$/.exec(q.id ?? "");
  return m ? (Number(m[1]) as 1 | 2) : null;
}

/** 세트 안 순서(id 끝 번호) — 모의시험 세트를 고정 순서로 낼 때 쓴다 */
export function mockOrder(q: SourceLike): number {
  return Number(/-(\d{3})$/.exec(q.id ?? "")?.[1] ?? 0);
}

/** 분류가 모의시험 세트(족보관련1·2)인가 — 섞지 않고 세트 순서로 낸다 */
export function isMockSource(f: SourceFilter | null | undefined): f is "mock1" | "mock2" {
  return f === "mock1" || f === "mock2";
}

/** 힌트관련1~3 모의시험 세트 번호(id "-hint1-NNN"~"-hint3-NNN"), 세트 문항이 아니면 null */
export function hintSetOf(q: SourceLike): 1 | 2 | 3 | null {
  const m = /-hint([123])-\d{3}$/.exec(q.id ?? "");
  return m ? (Number(m[1]) as 1 | 2 | 3) : null;
}

/** 분류가 힌트관련 세트(힌트관련1~3)인가 */
export function isHintSource(f: SourceFilter | null | undefined): f is "hint1" | "hint2" | "hint3" {
  return f === "hint1" || f === "hint2" || f === "hint3";
}

/** 단답형 보강 문항: id 끝이 "-short-NNN" */
export function isShortAnswer(q: SourceLike): boolean {
  return /-short-\d{3}$/.test(q.id ?? "");
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
  if (f === "related2") return isJokboRelated2(q);
  if (isMockSource(f)) return mockSetOf(q) === (f === "mock1" ? 1 : 2);
  if (isHintSource(f)) return hintSetOf(q) === Number(f.slice(4));
  if (f === "short") return isShortAnswer(q);
  return f === "jokbo" ? isJokbo(q) : !isJokbo(q);
}

/** 퀴즈 주소의 source 값: "jokbo" | "general" | "example" | "related" | "related2" | "mock1" | "mock2" | "hint1"~"hint3" | "short". 그 밖은 null(전체) */
export function parseSource(v: string | null): Exclude<SourceFilter, "all"> | null {
  return v === "jokbo" || v === "general" || v === "example" || v === "related" || v === "related2" || v === "mock1" || v === "mock2" || v === "hint1" || v === "hint2" || v === "hint3" || v === "short" ? v : null;
}

/** 문항 뱃지 글자: 족보 문항이 아니면 null, 출현 2회 이상이면 "족보 N회" */
export function jokboBadge(q: SourceLike): string | null {
  if (!isJokbo(q)) return null;
  const n = q.jokbo?.occurrences.length ?? 0;
  return n >= 2 ? `족보 ${n}회` : "족보";
}

/** 족보관련·족보관련2(OS)·족보관련1·2(모의시험 세트)·힌트관련1~3 뱃지 글자: 생성 문항이 아니면 null */
export function relatedBadge(q: SourceLike): string | null {
  const set = mockSetOf(q);
  if (set) return SOURCE_LABEL[set === 1 ? "mock1" : "mock2"];
  const hint = hintSetOf(q);
  if (hint) return SOURCE_LABEL[`hint${hint}`];
  return isJokboRelated2(q) ? SOURCE_LABEL.related2 : isJokboRelated(q) ? SOURCE_LABEL.related : null;
}

export const EXPLANATION_SOURCE_LABEL = { jokbo: "족보 해설", generated: "생성 해설" } as const;

/** 해설 머리의 출처 표시: 족보 문항만("족보 해설" / "생성 해설") */
export function explanationSourceLabel(q: SourceLike): string | null {
  return isJokbo(q) && q.jokbo ? EXPLANATION_SOURCE_LABEL[q.jokbo.explanationSource] : null;
}

import { SUBJECTS } from "@/data/subjects/registry";
import type { GradeResult, QTypeCore } from "./base";
import { blankCore } from "./blank";
import { calcCore } from "./calc";
import { classifyCore } from "./classify";
import { codeBlankCore } from "./codeBlank";
import { codeWriteCore } from "./codeWrite";
import { graphCore } from "./graph";
import { matchCore } from "./match";
import { mcqCore } from "./mcq";
import { multiCore } from "./multi";
import { orderCore } from "./order";
import { oxCore } from "./ox";
import { traceCore } from "./trace";

/**
 * ★ 문제 유형 등록 지점 1 (순수 로직). 새 유형은 lib/qtypes/{type}.ts를 만들고 여기에 한 줄,
 * components/qtypes/registry.ts에 한 줄(빠뜨리면 빌드 실패). 서술형 유형은 등록하지 않는다.
 */
export const QTYPE_CORE = {
  mcq: mcqCore,
  multi: multiCore,
  ox: oxCore,
  blank: blankCore,
  order: orderCore,
  match: matchCore,
  classify: classifyCore,
  calc: calcCore,
  trace: traceCore,
  graph: graphCore,
  // 데이터과학 코드 문제(Sprint 12) — 0/1 채점
  "code-blank": codeBlankCore,
  // 전체 작성형(Sprint 13) — 실행 결과로 0/1
  "code-write": codeWriteCore,
} as const;

// 전체 문제 유니온·답안 타입은 레지스트리에서 유도한다(손으로 유니온을 관리하지 않음).
type Registry = typeof QTYPE_CORE;
export type QType = keyof Registry;
type CoreOf<K extends QType> = Registry[K];
export type QuestionOf<K extends QType> = Parameters<CoreOf<K>["grade"]>[0];
export type AnswerOf<K extends QType> = Parameters<CoreOf<K>["grade"]>[1];
export type DetailOf<K extends QType> = ReturnType<CoreOf<K>["grade"]>["detail"];
export type Question = { [K in QType]: QuestionOf<K> }[QType];
export type AnyAnswer = { [K in QType]: AnswerOf<K> }[QType];

export const QTYPES = Object.keys(QTYPE_CORE) as QType[];

export function isQType(type: string): type is QType {
  return Object.hasOwn(QTYPE_CORE, type);
}

/**
 * 유니온 문제에 맞는 core를 꺼낸다. TypeScript가 "문제 유형 ↔ core" 대응을 추론하지 못하는
 * 부분을 이 한 곳에서만 단언한다.
 */
export function coreFor<K extends QType>(
  q: QuestionOf<K>,
): QTypeCore<QuestionOf<K>, AnswerOf<K>, DetailOf<K>> {
  return QTYPE_CORE[q.type as K] as unknown as QTypeCore<QuestionOf<K>, AnswerOf<K>, DetailOf<K>>;
}

/**
 * 과목별 0/1 채점 유형(과목 정의의 `allOrNothing`, 예: 데이터과학 `multi` — 시험처럼 완전히 맞아야 1점).
 * 점수만 0/1로 바꾸고 칸·보기별 정오(detail)는 그대로 둔다. 부분 점수 표시(ResultBanner·결과 화면)는 score로만 그리므로 함께 사라진다.
 */
const ALL_OR_NOTHING = new Map<string, ReadonlySet<string>>(
  SUBJECTS.map((s) => [s.id, new Set<string>("allOrNothing" in s ? s.allOrNothing : [])]),
);

export function isAllOrNothing(q: Pick<Question, "subject" | "type">): boolean {
  return ALL_OR_NOTHING.get(q.subject)?.has(q.type) ?? false;
}

export function gradeQuestion(q: Question, answer: AnyAnswer): GradeResult {
  const r = coreFor(q).grade(q, answer as never);
  return isAllOrNothing(q) ? { ...r, score: r.correct ? 1 : 0 } : r;
}

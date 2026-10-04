import type { GradeResult, QTypeCore } from "./base";
import { blankCore } from "./blank";
import { calcCore } from "./calc";
import { classifyCore } from "./classify";
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

export function gradeQuestion(q: Question, answer: AnyAnswer): GradeResult {
  return coreFor(q).grade(q, answer as never);
}

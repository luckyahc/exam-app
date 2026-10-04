/**
 * 문제 데이터 모델의 공개 진입점. 공통 필드(BaseQ)는 lib/qtypes/base.ts, 유형별 payload는
 * lib/qtypes/{type}.ts, 전체 유니온(Question)은 문제 유형 레지스트리(lib/qtypes/registry.ts)에서 유도한다.
 * 설계: docs/multi-subject-design.md §2-2, §3.
 */
export type { BaseQ, ExamBasis, GeneratorRef, GradeResult } from "@/lib/qtypes/base";
export type { AnswerOf, AnyAnswer, Question, QuestionOf, QType } from "@/lib/qtypes/registry";

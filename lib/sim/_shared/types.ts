import type { Question } from "@/types/question";

/**
 * 문제 생성기: seed(와 선택 params)로 문제 하나를 결정적으로 만든다.
 * 정답은 시뮬레이터로 계산한다 — 사람이 쓰지 않는다.
 * 생성된 문제 id = `{subject}-{chapter}-gen-{name}-{seed}`, `generator = { name, params, seed }`.
 */
export interface Generator<P extends Record<string, unknown> = Record<string, unknown>> {
  /** 과목 안에서 유일: 'buddy', 'replacement' */
  name: string;
  chapter: string;
  topic: string;
  /** 사람이 읽는 설명 (문서·디버그용) */
  description: string;
  generate(seed: number, params?: Partial<P>): Question;
}

export type GeneratorMap = Record<string, Generator>;

/** 생성 문제 id */
export const genId = (subject: string, chapter: string, name: string, seed: number) =>
  `${subject}-${chapter}-gen-${name}-${seed}`;

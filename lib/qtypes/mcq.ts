import { type BaseQ, duplicates, type QTypeCore, result } from "./base";

/** 객관식(단일). 보기 4~5개 — "옳은 것/옳지 않은 것/아닌 것" 모두 이 유형. */
export interface McqQ extends BaseQ<"mcq"> {
  choices: string[];
  answerIndex: number;
}
export type McqA = number | null;

export const mcqCore: QTypeCore<McqQ, McqA, null> = {
  type: "mcq",
  label: "객관식",
  emptyAnswer: () => null,
  isComplete: (_q, a) => a !== null,
  grade: (q, a) => result(a === q.answerIndex ? 1 : 0, null),
  validate(q) {
    const e: string[] = [];
    if (q.choices.length < 4 || q.choices.length > 5) e.push("보기는 4~5개");
    if (q.choices.some((c) => !c.trim())) e.push("빈 보기가 있음");
    if (duplicates(q.choices).length) e.push(`중복 보기: ${duplicates(q.choices).join(", ")}`);
    if (
      !Number.isInteger(q.answerIndex) ||
      q.answerIndex < 0 ||
      q.answerIndex >= q.choices.length
    ) {
      e.push("answerIndex가 보기 범위 밖");
    }
    return e;
  },
  choiceCount: (q) => q.choices.length,
  applyChoice: (q, _a, i) => (i < q.choices.length ? i : _a),
};

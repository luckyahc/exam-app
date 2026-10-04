import { type BaseQ, type QTypeCore, result } from "./base";

/** OX: 짧은 진술(prompt)의 참/거짓. 거짓이면 틀린 이유(falseReason)를 반드시 적는다. */
export interface OxQ extends BaseQ<"ox"> {
  answer: boolean;
  /** 진술이 왜 틀렸는지 한두 문장 — answer가 false면 필수, 채점 후 비교 화면에 표시 */
  falseReason?: string;
}
export type OxA = boolean | null;

export const oxCore: QTypeCore<OxQ, OxA, null> = {
  type: "ox",
  label: "OX",
  emptyAnswer: () => null,
  isComplete: (_q, a) => a !== null,
  grade: (q, a) => result(a === q.answer ? 1 : 0, null),
  validate(q) {
    const e: string[] = [];
    if (typeof q.answer !== "boolean") e.push("answer는 true/false");
    if (q.answer === false && !q.falseReason?.trim())
      e.push("거짓 진술은 falseReason(틀린 이유) 필수");
    return e;
  },
  choiceCount: () => 2,
  /** 1 = O(참), 2 = X(거짓) */
  applyChoice: (_q, a, i) => (i === 0 ? true : i === 1 ? false : a),
};

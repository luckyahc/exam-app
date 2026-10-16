import { type BaseQ, duplicates, type QTypeCore, result } from "./base";
import { choiceOrder } from "./choiceOrder";

/** 객관식(단일). 보기 4~5개 — "옳은 것/옳지 않은 것/아닌 것" 모두 이 유형. */
export interface McqQ extends BaseQ<"mcq"> {
  choices: string[];
  answerIndex: number;
  /** false면 보기를 섞지 않고 데이터 순서대로 보인다(다른 보기의 위치·번호를 가리키거나 순서 자체가 의미인 보기) */
  shuffle?: false;
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
    // 족보 문항(원문 그대로, docs/jokbo-plan.md §4)은 원문의 보기 수를 따른다(예/아니오 2개 등) — 2개 이상만 확인
    if (q.origin === "jokbo" ? q.choices.length < 2 : q.choices.length < 4 || q.choices.length > 5) e.push(q.origin === "jokbo" ? "보기는 2개 이상" : "보기는 4~5개");
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
  /** i = 화면에서 i번째 보기(표시 순서는 choiceOrder) */
  applyChoice: (q, _a, i) => (i < q.choices.length ? choiceOrder(q)[i] : _a),
};

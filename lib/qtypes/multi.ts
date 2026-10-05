import { choiceOrder } from "./choiceOrder";
import { type BaseQ, duplicates, type QTypeCore, result } from "./base";

/** 복수 선택: "해당하는 것을 모두 고르시오" (부분 점수). */
export interface MultiQ extends BaseQ<"multi"> {
  choices: string[];
  answerIndexes: number[];
  /** false면 보기를 섞지 않고 데이터 순서대로 보인다(다른 보기의 위치·번호를 가리키거나 순서 자체가 의미인 보기) */
  shuffle?: false;
}
export type MultiA = number[];

/**
 * 부분 점수 = max(0, (맞게 고른 수 − 잘못 고른 수) / 정답 수).
 * 전부 고르기로 점수를 얻지 못하게 잘못 고른 보기만큼 깎는다. 선택 집합 = 정답 집합일 때만 정답.
 */
export function multiScore(answerIndexes: readonly number[], selected: readonly number[]): number {
  const correct = new Set(answerIndexes);
  const picked = new Set(selected);
  let hits = 0;
  let wrong = 0;
  for (const i of picked) {
    if (correct.has(i)) hits++;
    else wrong++;
  }
  return Math.max(0, (hits - wrong) / correct.size);
}

/** 원래 보기 번호 orig를 고르거나 빼기(정렬 유지) */
export function toggleChoice(a: number[], orig: number): number[] {
  return a.includes(orig) ? a.filter((x) => x !== orig) : [...a, orig].sort((x, y) => x - y);
}

export const multiCore: QTypeCore<MultiQ, MultiA, null> = {
  type: "multi",
  label: "복수 선택",
  emptyAnswer: () => [],
  isComplete: (_q, a) => a.length > 0,
  grade: (q, a) => result(multiScore(q.answerIndexes, a), null),
  validate(q) {
    const e: string[] = [];
    if (q.choices.length < 4 || q.choices.length > 6) e.push("보기는 4~6개");
    if (q.choices.some((c) => !c.trim())) e.push("빈 보기가 있음");
    if (duplicates(q.choices).length) e.push(`중복 보기: ${duplicates(q.choices).join(", ")}`);
    if (q.answerIndexes.length < 1) e.push("정답이 1개 이상 필요");
    if (new Set(q.answerIndexes).size !== q.answerIndexes.length) e.push("answerIndexes 중복");
    if (q.answerIndexes.some((i) => !Number.isInteger(i) || i < 0 || i >= q.choices.length)) {
      e.push("answerIndexes가 보기 범위 밖");
    }
    return e;
  },
  choiceCount: (q) => q.choices.length,
  /** i = 화면에서 i번째 보기(표시 순서는 choiceOrder) */
  applyChoice: (q, a, i) => (i >= q.choices.length ? a : toggleChoice(a, choiceOrder(q)[i])),
};

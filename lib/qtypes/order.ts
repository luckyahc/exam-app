import { shuffledIndexes } from "@/lib/random";
import { type BaseQ, duplicates, type QTypeCore, result } from "./base";
import { isPermutation, orderScore } from "./_shared/orderScore";

/**
 * 순서 배치. `items`는 **정답 순서**로 저장하고, 화면에는 문제 id로 고정 셔플한 순서로 보여 준다
 * (같은 문제는 항상 같은 처음 배치 → 서버/클라이언트 렌더 일치, 정답 순서로 시작하지 않음).
 */
export interface OrderQ extends BaseQ<"order"> {
  items: string[];
}
/** 사용자가 배치한 순서(원래 items 인덱스 목록) */
export type OrderA = number[];
/** 위치별 정오 */
export type OrderDetail = boolean[];

export const orderCore: QTypeCore<OrderQ, OrderA, OrderDetail> = {
  type: "order",
  label: "순서 배치",
  emptyAnswer: (q) => shuffledIndexes(q.items.length, q.id),
  isComplete: (q, a) => isPermutation(a, q.items.length),
  grade(q, a) {
    if (!isPermutation(a, q.items.length))
      return result(
        0,
        q.items.map(() => false),
      );
    return result(
      orderScore(a),
      a.map((v, i) => v === i),
    );
  },
  validate(q) {
    const e: string[] = [];
    if (q.items.length < 3) e.push("항목은 3개 이상");
    if (q.items.some((x) => !x.trim())) e.push("빈 항목이 있음");
    if (duplicates(q.items).length) e.push(`중복 항목: ${duplicates(q.items).join(", ")}`);
    return e;
  },
};

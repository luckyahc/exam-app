import { type BaseQ, duplicates, type QTypeCore, result } from "./base";

/** 분류: 항목들을 카테고리(bucket)에 배치. bucket은 이름으로 적는다. */
export interface ClassifyQ extends BaseQ<"classify"> {
  buckets: string[];
  items: { label: string; bucket: string }[];
}
/** 항목별로 고른 bucket 이름 */
export type ClassifyA = (string | null)[];
export type ClassifyDetail = boolean[];

export const classifyCore: QTypeCore<ClassifyQ, ClassifyA, ClassifyDetail> = {
  type: "classify",
  label: "분류",
  emptyAnswer: (q) => q.items.map(() => null),
  isComplete: (q, a) => q.items.every((_, i) => a[i] != null),
  grade(q, a) {
    const detail = q.items.map((it, i) => a[i] === it.bucket);
    return result(detail.filter(Boolean).length / q.items.length, detail);
  },
  validate(q) {
    const e: string[] = [];
    if (q.buckets.length < 2) e.push("분류(bucket)는 2개 이상");
    if (duplicates(q.buckets).length) e.push(`중복 bucket: ${duplicates(q.buckets).join(", ")}`);
    if (q.items.length < 2) e.push("항목은 2개 이상");
    const labels = q.items.map((it) => it.label);
    if (duplicates(labels).length) e.push(`중복 항목: ${duplicates(labels).join(", ")}`);
    for (const it of q.items) {
      if (!q.buckets.includes(it.bucket))
        e.push(`'${it.label}'의 bucket '${it.bucket}'이 buckets에 없음`);
    }
    return e;
  },
};

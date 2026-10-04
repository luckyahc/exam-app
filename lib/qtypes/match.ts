import { shuffledIndexes } from "@/lib/random";
import { type BaseQ, duplicates, type QTypeCore, result } from "./base";

/** 짝짓기: 왼쪽 항목마다 오른쪽 선택지 하나(드롭다운). distractors는 짝이 없는 오답 선택지. */
export interface MatchQ extends BaseQ<"match"> {
  pairs: { left: string; right: string }[];
  distractors?: string[];
}
/** 왼쪽 항목별로 고른 오른쪽 문자열 */
export type MatchA = (string | null)[];
export type MatchDetail = boolean[];

/** 드롭다운에 보일 선택지(정답 + 오답)를 문제 id로 고정 셔플 */
export function matchOptions(q: MatchQ): string[] {
  const all = [...q.pairs.map((p) => p.right), ...(q.distractors ?? [])];
  return shuffledIndexes(all.length, `${q.id}:options`).map((i) => all[i]);
}

export const matchCore: QTypeCore<MatchQ, MatchA, MatchDetail> = {
  type: "match",
  label: "짝짓기",
  emptyAnswer: (q) => q.pairs.map(() => null),
  isComplete: (q, a) => q.pairs.every((_, i) => a[i] != null),
  grade(q, a) {
    const detail = q.pairs.map((p, i) => a[i] === p.right);
    return result(detail.filter(Boolean).length / q.pairs.length, detail);
  },
  validate(q) {
    const e: string[] = [];
    if (q.pairs.length < 2) e.push("짝은 2개 이상");
    const lefts = q.pairs.map((p) => p.left);
    const rights = q.pairs.map((p) => p.right);
    if (duplicates(lefts).length) e.push(`중복 왼쪽 항목: ${duplicates(lefts).join(", ")}`);
    if (duplicates(rights).length)
      e.push(`중복 오른쪽 항목(정답이 모호): ${duplicates(rights).join(", ")}`);
    const clash = (q.distractors ?? []).filter((d) => rights.includes(d));
    if (clash.length) e.push(`distractors가 정답과 겹침: ${clash.join(", ")}`);
    if ([...lefts, ...rights].some((x) => !x.trim())) e.push("빈 항목이 있음");
    return e;
  },
};

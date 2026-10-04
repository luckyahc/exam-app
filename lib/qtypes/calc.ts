import { type BaseQ, type QTypeCore, result } from "./base";

/** 계산: 숫자 입력, 허용 오차·단위 지정. 풀이 과정(steps)은 해설에 단계별로 표시. */
export interface CalcQ extends BaseQ<"calc"> {
  answer: number;
  /** 절대 허용 오차 (0이면 정확히 일치) */
  tolerance: number;
  unit?: string;
  steps?: string[];
}
/** 입력칸 원문 */
export type CalcA = string;
export type CalcDetail = { value: number | null };

/**
 * 숫자 입력 해석: 앞뒤 공백·천 단위 쉼표 허용("34,881"), 그 외 형식은 null.
 * 지수 표기(3×10^8 등) 확장은 Sprint 9(데이터 통신)에서 하위 호환으로 추가한다.
 */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/,(?=\d{3}(\D|$))/g, "");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export const calcCore: QTypeCore<CalcQ, CalcA, CalcDetail> = {
  type: "calc",
  label: "계산",
  emptyAnswer: () => "",
  isComplete: (_q, a) => parseNumber(a) !== null,
  grade(q, a) {
    const value = parseNumber(a);
    const ok =
      value !== null &&
      Math.abs(value - q.answer) <= q.tolerance + 1e-9 * Math.max(1, Math.abs(q.answer));
    return result(ok ? 1 : 0, { value });
  },
  validate(q) {
    const e: string[] = [];
    if (!Number.isFinite(q.answer)) e.push("answer는 유한한 숫자");
    if (!Number.isFinite(q.tolerance) || q.tolerance < 0) e.push("tolerance는 0 이상");
    return e;
  },
};

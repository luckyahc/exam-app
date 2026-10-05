import { type BaseQ, type QTypeCore, result } from "./base";

/** 계산: 숫자 입력, 허용 오차·단위 지정. 풀이 과정(steps)은 해설에 단계별로 표시. */
export interface CalcQ extends BaseQ<"calc"> {
  answer: number;
  /** 절대 허용 오차 (0이면 정확히 일치) */
  tolerance: number;
  /**
   * 상대 허용 오차(0 이상 1 미만, 예: 0.001 = ±0.1%). 값의 범위가 넓은 계산(10⁸ m/s, 0.651 μs)용.
   * `tolerance`와 함께 주면 둘 중 넓은 쪽을 쓴다. 없으면 절대 오차만 — 기존 문제는 그대로 채점된다.
   */
  relTolerance?: number;
  unit?: string;
  steps?: string[];
}
/** 입력칸 원문 */
export type CalcA = string;
export type CalcDetail = { value: number | null };

/** 가수: 정수·소수 (천 단위 쉼표는 먼저 지운다 — 예전 규칙 그대로) */
const MANTISSA = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)`;
const EXP = String.raw`[+-]?\d+`;
/**
 * `3e8` · `0.75e-6` · `3×10^8` · `3*10^8` · `3x10^8` · `3X10^8` (곱셈 기호 앞뒤 공백 허용) — docs/dc-question-types.md §2
 * 곱셈 기호 뒤에는 반드시 `10^지수`가 와야 한다(`3x10`처럼 지수가 없으면 형식 오류).
 */
const NUMBER = new RegExp(String.raw`^(${MANTISSA})(?:[eE](${EXP})|\s*[×*xX]\s*10\^(${EXP}))?$`);
/**
 * 가수 없는 거듭제곱 `10^6` · `10^-3` = 10의 거듭제곱. 부호를 붙인 `-10^6`은 −(10⁶)과 (−10)⁶ 두 가지로 읽힐 수 있어 받지 않는다.
 */
const POWER = new RegExp(String.raw`^10\^(${EXP})$`);

/**
 * 숫자 입력 해석. 앞뒤 공백 허용. 해석할 수 없으면 null(제출 막음 — 오답이 아니라 형식 오류).
 * 지수 표기는 문자열 그대로 `Number("3e8")`로 바꿔 3×10^8도 3e8과 같은 값이 된다(부동소수 곱셈 오차 없음).
 */
export function parseNumber(raw: string): number | null {
  // 천 단위 쉼표: 뒤에 숫자 3개가 오는 쉼표만 지운다(`34,881`). Sprint 3의 규칙과 같아 기존 입력의 해석은 바뀌지 않는다
  const s = raw.trim().replace(/,(?=\d{3}(\D|$))/g, "");
  const p = POWER.exec(s);
  if (p) return finite(Number(`1e${p[1]}`));
  const m = NUMBER.exec(s);
  if (!m) return null;
  const exp = m[2] ?? m[3];
  return finite(Number(exp === undefined ? m[1] : `${m[1]}e${exp}`));
}

const finite = (n: number) => (Number.isFinite(n) ? n : null);

/** 정답으로 보는 최대 차이: 절대·상대 오차 중 넓은 쪽 + 부동소수 여유 */
export function allowedError(q: Pick<CalcQ, "answer" | "tolerance" | "relTolerance">): number {
  return Math.max(q.tolerance, (q.relTolerance ?? 0) * Math.abs(q.answer)) + 1e-9 * Math.max(1, Math.abs(q.answer));
}

export const calcCore: QTypeCore<CalcQ, CalcA, CalcDetail> = {
  type: "calc",
  label: "계산",
  emptyAnswer: () => "",
  isComplete: (_q, a) => parseNumber(a) !== null,
  grade(q, a) {
    const value = parseNumber(a);
    const ok = value !== null && Math.abs(value - q.answer) <= allowedError(q);
    return result(ok ? 1 : 0, { value });
  },
  validate(q) {
    const e: string[] = [];
    if (!Number.isFinite(q.answer)) e.push("answer는 유한한 숫자");
    if (!Number.isFinite(q.tolerance) || q.tolerance < 0) e.push("tolerance는 0 이상");
    if (q.relTolerance !== undefined && !(q.relTolerance >= 0 && q.relTolerance < 1)) e.push("relTolerance는 0 이상 1 미만");
    return e;
  },
};

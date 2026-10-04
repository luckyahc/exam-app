import { type BaseQ, type QTypeCore, result } from "./base";
import { matchesAny, normalizeText } from "./_shared/textMatch";

/**
 * 빈칸 채우기. `text` 안의 `{{0}}`, `{{1}}` … 자리가 빈칸(1~4개).
 * 직접 입력 모드(기본) 또는 단어 은행 모드(`bank`가 있으면 은행에서 고르기).
 */
export interface BlankQ extends BaseQ<"blank"> {
  text: string;
  /** 칸별 허용 답안 — 한/영 표기 변형·동의어를 모두 넣는다 */
  blanks: { accept: string[] }[];
  bank?: string[];
}
export type BlankA = string[];
/** 칸별 정오 */
export type BlankDetail = boolean[];

const SLOT = /\{\{(\d+)\}\}/g;

/** text를 글자 조각과 빈칸 번호로 나눈다: ["프로세스는 ", 0, "의 인스턴스"] */
export function splitBlankText(text: string): (string | number)[] {
  const out: (string | number)[] = [];
  let last = 0;
  for (const m of text.matchAll(SLOT)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(Number(m[1]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const blankCore: QTypeCore<BlankQ, BlankA, BlankDetail> = {
  type: "blank",
  label: "빈칸",
  emptyAnswer: (q) => q.blanks.map(() => ""),
  isComplete: (q, a) => q.blanks.every((_, i) => (a[i] ?? "").trim().length > 0),
  grade(q, a) {
    const detail = q.blanks.map((b, i) => matchesAny(a[i] ?? "", b.accept));
    return result(detail.filter(Boolean).length / q.blanks.length, detail);
  },
  validate(q) {
    const e: string[] = [];
    const slots = splitBlankText(q.text).filter((p): p is number => typeof p === "number");
    if (q.blanks.length < 1 || q.blanks.length > 4) e.push("빈칸은 1~4개");
    const expected = q.blanks.map((_, i) => i);
    if (slots.length !== q.blanks.length || !expected.every((i) => slots.includes(i))) {
      e.push(`text의 {{n}} 자리(${slots.join(",")})와 blanks 수(${q.blanks.length})가 맞지 않음`);
    }
    q.blanks.forEach((b, i) => {
      if (!b.accept.some((x) => x.trim())) e.push(`${i}번 빈칸의 accept가 비어 있음`);
    });
    if (q.bank) {
      const bank = new Set(q.bank.map(normalizeText));
      q.blanks.forEach((b, i) => {
        if (!b.accept.some((x) => bank.has(normalizeText(x))))
          e.push(`${i}번 빈칸의 정답이 단어 은행에 없음`);
      });
    }
    return e;
  },
};

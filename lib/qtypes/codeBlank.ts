import { type BaseQ, type QTypeCore, result } from "./base";
import { splitBlankText } from "./blank";
import { CODE_LANGS, CURLY_QUOTE, type CodeLang, sameTokens, straightenQuotes, tokenize } from "./_shared/codeTokens";

/**
 * 코드 빈칸(데이터과학, Sprint 12). 여러 줄 코드 `source` 안의 `{{0}}`, `{{1}}` … 자리가 빈칸이다.
 * 들여쓰기·나머지 코드는 고정이고 빈칸 안만 입력한다(docs/ds-question-types.md §2).
 * 채점: 빈칸마다 허용 답안과 **토큰 단위**로 비교, **모든 빈칸이 맞아야 1점**(0/1, 부분 점수 없음 — 결정 6).
 * 굽은 따옴표는 비교 전에 곧은 따옴표로 바꾸고 그 사실을 detail에 남긴다(결정 13).
 */
export interface CodeBlankQ extends BaseQ<"code-blank"> {
  language: CodeLang;
  /** 줄바꿈·들여쓰기를 그대로 담은 코드. 빈칸 자리는 `{{n}}` (지문 아래 보기용 `code` 필드와 구분해 `source`) */
  source: string;
  /**
   * 칸별 허용 답안 — 실행 결과가 같은 다른 표기만 넣는다(작성 시 실행 검증). 앞뒤 공백 금지(결정 12). **첫 번째 = 슬라이드 표기**.
   * `wrong`: 대표 오답(실행 결과가 달라야 한다), `candidates`: 작성자가 더한 허용 답안 후보 — 검증 테스트가 실행해
   * 같은 결과면 accept에, 다르면 wrong에 들어 있는지 확인한다(lib/verify/)
   */
  blanks: { accept: string[]; wrong?: string[]; candidates?: string[] }[];
}
export type CodeBlankA = string[];
export interface CodeBlankDetail {
  /** 칸별 정오 */
  blanks: boolean[];
  /** 굽은 따옴표를 곧은 따옴표로 바꿔 채점했는가 */
  quotesFixed: boolean;
}

const MAX_BLANKS = 8;

/** 입력 한 칸을 채점용으로 정리: 앞뒤 공백 제거 + 굽은 따옴표 변환 */
export function normalizeCodeInput(raw: string): { text: string; changed: boolean } {
  return straightenQuotes(raw.trim());
}

export function codeBlankMatches(input: string, accept: readonly string[], lang: CodeLang): boolean {
  const { text } = normalizeCodeInput(input);
  return text.length > 0 && accept.some((a) => sameTokens(text, a, lang));
}

/** 빈칸을 채운 전체 코드(검증·결과 화면용) */
export function fillCodeBlanks(source: string, values: readonly string[]): string {
  return source.replace(/\{\{(\d+)\}\}/g, (_, n: string) => values[Number(n)] ?? "");
}

export const codeBlankCore: QTypeCore<CodeBlankQ, CodeBlankA, CodeBlankDetail> = {
  type: "code-blank",
  label: "코드 빈칸",
  emptyAnswer: (q) => q.blanks.map(() => ""),
  isComplete: (q, a) => q.blanks.every((_, i) => (a[i] ?? "").trim().length > 0),
  grade(q, a) {
    const quotesFixed = q.blanks.some((_, i) => normalizeCodeInput(a[i] ?? "").changed);
    const blanks = q.blanks.map((b, i) => codeBlankMatches(a[i] ?? "", b.accept, q.language));
    return result(blanks.every(Boolean) ? 1 : 0, { blanks, quotesFixed });
  },
  validate(q) {
    const e: string[] = [];
    if (!CODE_LANGS.includes(q.language)) e.push(`language는 ${CODE_LANGS.join("|")}`);
    if (!q.source.trim()) e.push("source가 비어 있음");
    if (q.code) e.push("code-blank는 코드를 source에 둔다(code 필드 금지)");
    const slots = splitBlankText(q.source).filter((p): p is number => typeof p === "number");
    if (q.blanks.length < 1 || q.blanks.length > MAX_BLANKS) e.push(`빈칸은 1~${MAX_BLANKS}개`);
    const expected = q.blanks.map((_, i) => i);
    if (slots.length !== q.blanks.length || !expected.every((i) => slots.includes(i))) {
      e.push(`source의 {{n}} 자리(${slots.join(",")})와 blanks 수(${q.blanks.length})가 맞지 않음`);
    }
    if (CURLY_QUOTE.test(q.source)) e.push("source에 굽은 따옴표가 있음(곧은 따옴표로)");
    q.blanks.forEach((b, i) => {
      if (b.accept.length === 0) e.push(`${i}번 빈칸의 accept가 비어 있음`);
      for (const a of b.accept) {
        if (!a.trim()) e.push(`${i}번 빈칸에 빈 accept`);
        else if (a !== a.trim()) e.push(`${i}번 빈칸 accept '${a}'의 앞뒤 공백(결정 12)`);
        if (a.includes("\n")) e.push(`${i}번 빈칸 accept에 줄바꿈`);
        if (CURLY_QUOTE.test(a)) e.push(`${i}번 빈칸 accept '${a}'에 굽은 따옴표`);
        const t = tokenize(a, q.language);
        if (!t || t.length === 0) e.push(`${i}번 빈칸 accept '${a}'를 토큰으로 나눌 수 없음`);
      }
      const keys = b.accept.map((a) => JSON.stringify(tokenize(a, q.language)));
      if (new Set(keys).size !== keys.length) e.push(`${i}번 빈칸 accept에 토큰이 같은 중복 답`);
      for (const w of b.wrong ?? []) {
        if (!w.trim() || CURLY_QUOTE.test(w)) e.push(`${i}번 빈칸 wrong '${w}'가 비었거나 굽은 따옴표`);
        if (codeBlankMatches(w, b.accept, q.language)) e.push(`${i}번 빈칸 wrong '${w}'가 accept와 같은 답으로 채점됨`);
      }
      for (const c of b.candidates ?? []) if (!c.trim() || c !== c.trim()) e.push(`${i}번 빈칸 candidates '${c}'가 비었거나 앞뒤 공백`);
    });
    // 첫 번째 정답으로 채운 코드 전체가 토큰으로 나뉘어야 한다(닫히지 않은 따옴표 등 데이터 오류 방지)
    if (q.blanks.every((b) => b.accept.length) && !tokenize(fillCodeBlanks(q.source, q.blanks.map((b) => b.accept[0])), q.language)) {
      e.push("정답으로 채운 코드를 토큰으로 나눌 수 없음");
    }
    return e;
  },
};

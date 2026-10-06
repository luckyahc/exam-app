/**
 * 슬라이드 실행결과 ↔ 실제 실행이 다른 코드 목록(Sprint 14). 근거: docs/ds-source-analysis.md §4-3, 결정 11.
 * 이 코드를 쓰는 문항(지문·해설에 `[코드 N-M]`)은 해설에 "(보충)"과 다른 점의 핵심어 중 하나가 있어야 한다 — 정답은 실제 실행 결과.
 */
export type ErrataKind = "slide-code-error" | "nondeterministic" | "output-notation" | "slide-order" | "platform";

export interface Erratum {
  code: string;
  kind: ErrataKind;
  /** 무엇이 다른가(사람이 읽는 설명) */
  note: string;
  /** 해설에 이 중 하나는 있어야 한다(슬라이드와 다른 점을 적었는지) */
  keywords: string[];
  /**
   * 문항의 코드·보기에 이 패턴이 있을 때만 검사한다(그 코드 번호를 언급하지만 달라지는 부분을 쓰지 않는 문항은 제외).
   * 없으면 그 코드 번호를 언급한 문항 모두
   */
  when?: RegExp;
}

export const DS_ERRATA: readonly Erratum[] = [
  { code: "2-10", kind: "slide-code-error", note: "두 번째 else 뒤 콜론이 없어 SyntaxError: expected ':'", keywords: ["콜론", "SyntaxError"] },
  { code: "2-20", kind: "nondeterministic", note: "세트 출력 순서가 실행마다 다르다(문자열 해시 무작위화)", keywords: ["순서", "실행마다"], when: /print\(set_/ },
  { code: "2-21", kind: "nondeterministic", note: "세트 출력 순서가 실행마다 다르다(문자열 해시 무작위화)", keywords: ["순서", "실행마다"], when: /print\(set_/ },
  { code: "2-22", kind: "output-notation", note: "슬라이드 [ ]·set( ) 표기 — 실제 출력은 []·set()", keywords: ["[]", "set()", "표기"], when: /\[ \]|set\( \)/ },
  { code: "2-24", kind: "output-notation", note: "슬라이드 ' 아빠' 앞 공백 — 실제 출력은 '아빠'", keywords: ["공백", "표기"], when: /아빠/ },
  { code: "3-10", kind: "output-notation", note: "슬라이드 결과 첫 줄 '이름'은 [코드 3-4] 결과가 섞인 인쇄 오류 — 실제 출력은 ['Sheet1'] 한 줄", keywords: ["이름", "인쇄 오류"] },
  { code: "6-1", kind: "output-notation", note: "슬라이드 (2,3)·[1, 2, 3] — 실제 출력은 (2, 3)·[1 2 3]", keywords: ["(2, 3)", "[1 2 3]", "표기"] },
  { code: "6-4", kind: "platform", note: "Pyodide(wasm32)는 int32·itemsize 4·nbytes 24 — 슬라이드는 64비트 PC 기준 int64·8·48", keywords: ["int32", "int64", "플랫폼"] },
  { code: "6-40", kind: "slide-order", note: "슬라이드 결과는 6-33(이새봄 키 +5) 이전 값 — 순서대로 실행하면 여자 평균 163.8·표준편차 5.449771", keywords: ["6-33", "163.8", "순서"] },
];

/** 지문·해설의 `[코드 2-26]`, `[코드 2-26]~[코드 2-28]`(같은 강의 범위)을 코드 번호 목록으로 */
export function codeRefs(text: string): string[] {
  const out = new Set<string>();
  const re = /\[코드 (\d+)-(\d+)\](?:\s*~\s*\[코드 (\d+)-(\d+)\])?/g;
  for (const m of text.matchAll(re)) {
    const [lec, from] = [m[1], Number(m[2])];
    const to = m[3] === lec && m[4] ? Number(m[4]) : from;
    for (let n = from; n <= Math.max(from, to); n++) out.add(`${lec}-${n}`);
  }
  return [...out];
}

/**
 * 전체 작성형 채점용 비교(Sprint 13) — 실행 결과(사용자 vs 모범 답안)를 같은 엔진에서 얻은 뒤 비교한다.
 * 규칙: docs/sprints/sprint-13-ds-engine.md, docs/ds-question-types.md §3·§4.
 */

/** 표준 출력 정리: **줄 끝 공백**과 **마지막 줄바꿈**만 무시한다(그 밖의 공백·빈 줄·대소문자는 그대로 비교) */
export function normalizeStdout(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n$/, "");
}

export interface SqlTable {
  columns: string[];
  rows: unknown[][];
}

/** 값 비교용 문자열: 숫자 1과 1.0은 같게, 문자열은 그대로 */
const key = (v: unknown) => (typeof v === "number" ? `n:${Number(v)}` : v === null ? "null" : `s:${String(v)}`);
const rowKey = (r: unknown[]) => JSON.stringify(r.map(key));

/**
 * 결과 표 비교. 열 개수와 각 행 값이 같아야 한다. `orderMatters`가 아니면 **행 순서 무시**(다중집합 비교 — 같은 행이 몇 번 나오는지는 본다).
 * 열 이름은 `compareColumns`일 때만(별칭 AS를 묻는 문제).
 */
export function sameTable(a: SqlTable | null, b: SqlTable | null, opts: { orderMatters?: boolean; compareColumns?: boolean } = {}): boolean {
  if (!a || !b) return a === b;
  if (a.columns.length !== b.columns.length) return false;
  if (opts.compareColumns && a.columns.some((c, i) => c !== b.columns[i])) return false;
  if (a.rows.length !== b.rows.length) return false;
  const ka = a.rows.map(rowKey);
  const kb = b.rows.map(rowKey);
  if (!opts.orderMatters) {
    ka.sort();
    kb.sort();
  }
  return ka.every((k, i) => k === kb[i]);
}

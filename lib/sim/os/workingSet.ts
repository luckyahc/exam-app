/**
 * 워킹 셋 W(t, Δ) (Ch08 p.60): 시각 t 직전의 일정 시간 Δ 동안 참조된 페이지들의 집합.
 * 참조열의 i번째 참조(1부터)를 시각 i로 보고, 시각 t를 포함한 최근 Δ번의 참조(t−Δ+1 ~ t)를 창으로 쓴다.
 * 슬라이드는 창의 경계(t 포함 여부)를 정하지 않으므로, 문제 문장에 이 정의를 함께 적는다.
 */

export interface WorkingSet {
  /** 창에 든 참조(시각 순서) */
  window: number[];
  /** 워킹 셋: 처음 등장한 순서대로 중복 제거 */
  pages: number[];
  size: number;
}

export function workingSet(refs: readonly number[], t: number, delta: number): WorkingSet {
  if (!Number.isInteger(t) || t < 1 || t > refs.length) throw new RangeError("t는 1..참조 수");
  if (!Number.isInteger(delta) || delta < 1) throw new RangeError("Δ는 1 이상의 정수");
  const window = refs.slice(Math.max(0, t - delta), t);
  const pages = [...new Set(window)];
  return { window, pages, size: pages.length };
}

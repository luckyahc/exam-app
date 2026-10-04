import { type BaseQ, type QTypeCore, result } from "./base";
import { normalizeText } from "./_shared/textMatch";

/**
 * 표 채우기(시뮬레이션): 페이지 교체·버디·배치 알고리즘 진행 표의 일부 칸(blank)을 채운다.
 * options가 있는 칸은 드롭다운, 없으면 직접 입력. 칸별 채점.
 */
export interface TraceCell {
  value: string;
  blank?: boolean;
  options?: string[];
}
export interface TraceQ extends BaseQ<"trace"> {
  columns: string[];
  rows: { label: string; cells: TraceCell[] }[];
}
/** 빈칸 key(`행:열`) → 입력값 */
export type TraceA = Record<string, string>;
/** 빈칸 key → 정오 */
export type TraceDetail = Record<string, boolean>;

export const cellKey = (row: number, col: number) => `${row}:${col}`;

export function blankCells(
  q: TraceQ,
): { key: string; row: number; col: number; cell: TraceCell }[] {
  return q.rows.flatMap((r, row) =>
    r.cells.flatMap((cell, col) =>
      cell.blank ? [{ key: cellKey(row, col), row, col, cell }] : [],
    ),
  );
}

export const traceCore: QTypeCore<TraceQ, TraceA, TraceDetail> = {
  type: "trace",
  label: "표 채우기",
  emptyAnswer: () => ({}),
  isComplete: (q, a) => blankCells(q).every(({ key }) => (a[key] ?? "").trim().length > 0),
  grade(q, a) {
    const cells = blankCells(q);
    const detail: TraceDetail = {};
    for (const { key, cell } of cells) {
      const v = a[key] ?? "";
      detail[key] = v.trim().length > 0 && normalizeText(v) === normalizeText(cell.value);
    }
    return result(Object.values(detail).filter(Boolean).length / cells.length, detail);
  },
  validate(q) {
    const e: string[] = [];
    if (q.columns.length < 1) e.push("열이 1개 이상 필요");
    q.rows.forEach((r, i) => {
      if (r.cells.length !== q.columns.length)
        e.push(`${i}행 칸 수(${r.cells.length}) ≠ 열 수(${q.columns.length})`);
      r.cells.forEach((c, j) => {
        if (c.options && !c.options.includes(c.value))
          e.push(`${i}:${j} 칸 options에 정답 '${c.value}'이 없음`);
        if (c.blank && !c.value.trim()) e.push(`${i}:${j} 빈칸의 정답이 비어 있음`);
      });
    });
    if (blankCells(q).length === 0) e.push("빈칸(blank)이 1개 이상 필요");
    return e;
  },
};

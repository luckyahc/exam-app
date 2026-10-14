import type { BaseQ } from "./base";
import raw from "@/data/subjects/data-science/sqlTables.generated.json";

/**
 * 데이터과학 문항의 "사용 테이블"(SQL)·"사용 데이터"(Python) 스냅샷 — scripts/build-sql-tables.mjs가 준비 SQL·준비 코드를
 * 실행해 미리 만든 것(화면에서 엔진을 띄우지 않는다). 같은 준비 스크립트를 쓰는 문항은 setups 하나를 함께 쓴다.
 */
export type Cell = string | number | boolean | null;
export interface SnapColumn {
  name: string;
  /** SQL 선언 자료형(CHAR(2) 등) 또는 판다스 dtype */
  type?: string;
}
export interface SqlSnapTable {
  columns: SnapColumn[];
  rows: Cell[][];
}
export type PyFile =
  | { kind: "csv"; name: string; encoding: string; text: string }
  | { kind: "xlsx"; name: string; sheets: { name: string; rows: Cell[][] }[] };
export interface PyFrame {
  name: string;
  columns: SnapColumn[];
  index: Cell[];
  rows: Cell[][];
}
export interface DsSnapshots {
  sql: {
    setups: Record<string, { hash: string; tables: Record<string, SqlSnapTable> }>;
    /** before: INSERT·UPDATE·DELETE 문항 — "실행 전 테이블" */
    questions: Record<string, { setup: string; tables: string[]; before?: true }>;
  };
  python: {
    setups: Record<string, { files: PyFile[]; frames: PyFrame[] }>;
    /** 데이터(파일·DataFrame)를 만들지 않는 준비 코드 해시 */
    noData: string[];
    questions: Record<string, string>;
  };
}

export const DS_SNAPSHOTS = raw as unknown as DsSnapshots;

export type QuestionData =
  | { kind: "sql"; before: boolean; tables: { name: string; table: SqlSnapTable }[] }
  | { kind: "python"; files: PyFile[]; frames: PyFrame[] };

/** 문항에 보여 줄 표(없으면 null) */
export function questionData(q: Pick<BaseQ, "id">): QuestionData | null {
  const s = DS_SNAPSHOTS.sql.questions[q.id];
  if (s) {
    const setup = DS_SNAPSHOTS.sql.setups[s.setup];
    return { kind: "sql", before: !!s.before, tables: s.tables.map((name) => ({ name, table: setup.tables[name] })) };
  }
  const h = DS_SNAPSHOTS.python.questions[q.id];
  if (h) return { kind: "python", ...DS_SNAPSHOTS.python.setups[h] };
  return null;
}

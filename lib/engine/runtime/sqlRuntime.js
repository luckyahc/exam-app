// SQL 실행 런타임(Sprint 13, sql.js = SQLite). 브라우저 Web Worker와 Node(Vitest)가 함께 쓰는 순수 JS 모듈.

/**
 * MySQL의 `#` 주석을 SQLite가 아는 `--`로 바꾼다 — **문자열·따옴표 이름 밖의 `#`만**(결정 8).
 * '…'(작은따옴표, '' 이스케이프), "…", `…` 안과 이미 있는 -- 주석·블록 주석 안은 그대로 둔다.
 * @param {string} sql
 */
export function hashCommentsToDashes(sql) {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === c) {
          if (sql[j + 1] === c) {
            j += 2;
            continue;
          }
          break;
        }
        if (sql[j] === "\\" && c !== "`") j++;
        j++;
      }
      out += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (sql.startsWith("--", i)) {
      const end = sql.indexOf("\n", i);
      out += sql.slice(i, end < 0 ? sql.length : end);
      i = end < 0 ? sql.length : end;
      continue;
    }
    if (sql.startsWith("/*", i)) {
      const end = sql.indexOf("*/", i + 2);
      out += sql.slice(i, end < 0 ? sql.length : end + 2);
      i = end < 0 ? sql.length : end + 2;
      continue;
    }
    if (c === "#") {
      out += "--";
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** sql.js 결과(values의 Uint8Array 등)를 화면·비교용 값으로 */
const cell = (v) => (v instanceof Uint8Array ? `<blob ${v.length}B>` : v);

/**
 * 준비 스크립트(스키마·초기 데이터) 위에서 답안을 실행한다. 매번 새 데이터베이스.
 * @param {any} SQL initSqlJs 결과
 * @param {{ setup: string, code: string, tables?: string[] }} req tables: 실행 후 상태를 볼 테이블(INSERT·UPDATE·DELETE 문제)
 * @returns {{ error: string | null, result: { columns: string[], rows: unknown[][] } | null, tables: Record<string, { columns: string[], rows: unknown[][] } | null>, statements: number }}
 */
export function runSql(SQL, req) {
  const db = new SQL.Database();
  try {
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(req.setup);
    let error = null;
    let result = null;
    let statements = 0;
    try {
      const sets = db.exec(hashCommentsToDashes(req.code));
      statements = sets.length;
      const last = sets[sets.length - 1];
      if (last) result = { columns: last.columns, rows: last.values.map((r) => r.map(cell)) };
    } catch (e) {
      error = String(e && typeof e === "object" && "message" in e ? e.message : e);
    }
    const tables = {};
    for (const t of req.tables ?? []) {
      try {
        const [r] = db.exec(`SELECT * FROM "${t.replace(/"/g, '""')}"`);
        tables[t] = r ? { columns: r.columns, rows: r.values.map((x) => x.map(cell)) } : { columns: [], rows: [] };
      } catch {
        tables[t] = null; // 테이블이 없어짐(DROP 등)
      }
    }
    return { error, result, tables, statements };
  } finally {
    db.close();
  }
}

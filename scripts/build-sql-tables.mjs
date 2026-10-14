// 데이터과학 문항의 "사용 테이블"·"사용 데이터" 스냅샷을 만든다 → data/subjects/data-science/sqlTables.generated.json
//
// - SQL: 준비 SQL(lib/qtypes/dsSchemas.ts SQL_SETUPS)을 sql.js로 실행하고 관련 테이블 전체(SELECT *)와 열 자료형(PRAGMA table_info)을 뽑는다.
//   같은 준비 SQL을 쓰는 문항은 준비 SQL 하나의 결과를 함께 쓴다(setups에 한 번만 저장, questions에는 테이블 이름만).
//   관련 테이블 = 문항 코드(지문 코드·빈칸 코드·모범 답안)에 이름이 나오는 테이블. 없으면 준비 SQL의 모든 테이블.
//   준비 SQL이 없는 개념 문항은 문항의 showTables로 지정한다.
// - Python: 숨긴 준비 코드(python.setup)를 Pyodide로 실행한 뒤 작업 폴더의 CSV(파일 내용)·엑셀(시트별 셀)과
//   이름 공간의 DataFrame을 뽑는다(화면에서 판다스 엔진을 띄우지 않으려고 미리 만든다). 준비 코드는 SHA-256 앞 12자리로 묶는다.
//
// 문항 데이터·준비 SQL을 고치면 `node scripts/build-sql-tables.mjs`를 다시 실행한다 — data/subjects/data-science/sqlTables.test.ts가 어긋남을 잡는다.
// Pyodide 파일은 public/engine/(npm run prepare-engine)에서 읽는다.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_FILE = path.join(ROOT, "data", "subjects", "data-science", "sqlTables.generated.json");
const LECTURES = ["lec1", "lec2", "lec3", "lec4", "lec5", "lec6"];
const require = createRequire(import.meta.url);

/** 데이터과학 강의 문항 전체(Node가 .ts의 타입만 지우고 불러온다 — 문항 파일은 타입 import만 쓴다) */
export async function loadDsQuestions() {
  const out = [];
  for (const lec of LECTURES) {
    const m = await import(pathToFileURL(path.join(ROOT, "data", "subjects", "data-science", `${lec}.ts`)).href);
    out.push(...m.default);
  }
  return out;
}

export async function loadSqlSetups() {
  return (await import(pathToFileURL(path.join(ROOT, "lib", "qtypes", "dsSchemas.ts")).href)).SQL_SETUPS;
}

export const setupHash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);

/** 문항 코드: 지문 코드·빈칸 코드(빈칸은 첫 정답으로 채움 — `{{0}} 학생`의 UPDATE도 잡는다)·모범 답안 */
function questionCodes(q) {
  const filled = q.type === "code-blank" ? q.source.replace(/\{\{(\d+)\}\}/g, (_, i) => q.blanks[Number(i)]?.accept[0] ?? "") : undefined;
  return [q.code?.source, filled, q.type === "code-write" ? q.solution : undefined].filter(Boolean);
}
const codeLanguage = (q) => (q.type === "code-blank" || q.type === "code-write" ? q.language : q.code?.language);

/** 문항의 SQL 준비 스크립트 이름(없으면 null) */
export function sqlSetupOf(q) {
  if (q.type === "code-write" && q.sql) return q.sql.setup;
  if (q.verify?.mode === "run" && q.verify.sql) return q.verify.sql.setup;
  return q.showTables?.setup ?? null;
}

/** 문항의 Python 준비 코드(없거나 빈 문자열이면 null) */
export function pySetupOf(q) {
  const s = q.type === "code-write" ? q.python?.setup : q.verify?.mode === "run" ? q.verify.python?.setup : undefined;
  return s?.trim() ? s : null;
}

/** 이름 앞뒤가 글자·숫자·밑줄이 아닐 때만(학생_수강 안의 '학생'은 학생 테이블이 아니다) */
const mentions = (text, name) => new RegExp(`(?<![\\p{L}\\p{N}_])${name}(?![\\p{L}\\p{N}_])`, "u").test(text);
const MUTATES = /\b(INSERT|UPDATE|DELETE)\b/i;

// ───────────────────────────── SQL

async function initSql() {
  return require("sql.js")();
}

/** 준비 SQL 하나를 실행해 모든 테이블(만든 순서)의 열·자료형·행 */
function snapshotSql(SQL, setup) {
  const db = new SQL.Database();
  try {
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(setup);
    const names = (db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid")[0]?.values ?? []).map((r) => String(r[0]));
    const tables = {};
    for (const name of names) {
      const info = db.exec(`PRAGMA table_info("${name}")`)[0];
      const columns = info.values.map((r) => (r[2] ? { name: String(r[1]), type: String(r[2]) } : { name: String(r[1]) }));
      const rows = db.exec(`SELECT * FROM "${name}"`)[0]?.values ?? [];
      tables[name] = { columns, rows };
    }
    return tables;
  } finally {
    db.close();
  }
}

/** SQL 부분(Pyodide 없이 빠르게 — 테스트가 그대로 다시 만들어 비교한다) */
export async function buildSqlPart(questions, setups) {
  const SQL = await initSql();
  const used = {};
  const qs = {};
  for (const q of questions) {
    const name = sqlSetupOf(q);
    if (!name || !setups[name]?.trim()) continue;
    used[name] ??= { hash: setupHash(setups[name]), tables: snapshotSql(SQL, setups[name]) };
    const all = Object.keys(used[name].tables);
    const codes = questionCodes(q).join("\n");
    let tables;
    if (q.showTables) tables = q.showTables.tables.filter((t) => all.includes(t));
    else {
      tables = all.filter((t) => mentions(codes, t));
      if (!tables.length) tables = all;
    }
    if (!tables.length) continue;
    const entry = { setup: name, tables };
    if (MUTATES.test(q.showTables ? q.prompt : codes)) entry.before = true;
    qs[q.id] = entry;
  }
  const sortedSetups = Object.fromEntries(Object.keys(used).sort().map((k) => [k, used[k]]));
  return { setups: sortedSetups, questions: qs };
}

// ───────────────────────────── Python

const EXTRACT = `
import os as _os, json as _json
_out = {"files": [], "frames": []}
for _n in sorted(_os.listdir('.')):
    if _n.lower().endswith('.csv'):
        _b = open(_n, 'rb').read()
        for _enc in ('utf-8', 'cp949'):
            try:
                _t = _b.decode(_enc)
                break
            except UnicodeDecodeError:
                pass
        _out["files"].append({"kind": "csv", "name": _n, "encoding": _enc, "text": _t.replace('\\r\\n', '\\n')})
    elif _n.lower().endswith('.xlsx'):
        import openpyxl as _ox
        _wb = _ox.load_workbook(_n)
        _out["files"].append({"kind": "xlsx", "name": _n, "sheets": [{"name": _ws.title, "rows": [[_c.value for _c in _r] for _r in _ws.iter_rows()]} for _ws in _wb.worksheets]})
for _k, _v in list(globals().items()):
    if not _k.startswith('_') and type(_v).__name__ == 'DataFrame':
        _s = _json.loads(_v.to_json(orient='split', force_ascii=False))
        _out["frames"].append({"name": _k, "columns": [{"name": str(_c), "type": str(_d)} for _c, _d in zip(_v.columns, _v.dtypes)], "index": _s["index"], "rows": _s["data"]})
_json.dumps(_out, ensure_ascii=False)
`;

async function initPython() {
  const m = JSON.parse(readFileSync(path.join(ROOT, "public", "engine", "manifest.json"), "utf8"));
  const dir = path.join(ROOT, "public", m.pyodide.base.replace(/^\//, ""));
  const { loadPyodide } = await import("pyodide");
  const py = await loadPyodide({ indexURL: dir + path.sep });
  const site = py.runPython("import site; site.getsitepackages()[0]");
  for (const w of m.openpyxlWheels) py.unpackArchive(new Uint8Array(readFileSync(path.join(dir, w))), "wheel", { extractDir: site });
  await py.loadPackage(["numpy", "pandas"], { messageCallback: () => {}, errorCallback: () => {} });
  return py;
}

async function snapshotPython(py, setup) {
  const ns = py.globals.get("dict")();
  try {
    await py.runPythonAsync("import os as _o, tempfile as _t\n_o.chdir(_t.mkdtemp())", { globals: ns });
    await py.runPythonAsync(setup, { globals: ns });
    return JSON.parse(await py.runPythonAsync(EXTRACT, { globals: ns }));
  } finally {
    ns.destroy();
  }
}

/** Python 문항 → 준비 코드 해시(데이터를 만들지 않는 준비 코드도 포함) */
export function pythonQuestionHashes(questions) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const q of questions) {
    const s = pySetupOf(q);
    if (s && codeLanguage(q) === "python") out[q.id] = setupHash(s);
  }
  return out;
}

export async function buildPythonPart(questions) {
  const py = await initPython();
  const bySetup = new Map();
  for (const q of questions) {
    const s = pySetupOf(q);
    if (s && codeLanguage(q) === "python") bySetup.set(setupHash(s), s);
  }
  const setups = {};
  const noData = [];
  for (const [hash, s] of [...bySetup].sort(([a], [b]) => a.localeCompare(b))) {
    const snap = await snapshotPython(py, s);
    if (snap.files.length || snap.frames.length) setups[hash] = snap;
    else noData.push(hash);
  }
  const qs = Object.fromEntries(Object.entries(pythonQuestionHashes(questions)).filter(([, h]) => h in setups));
  return { setups, noData, questions: qs };
}

// ───────────────────────────── 실행

async function main() {
  const questions = await loadDsQuestions();
  const sql = await buildSqlPart(questions, await loadSqlSetups());
  const python = await buildPythonPart(questions);
  const json = JSON.stringify({ sql, python }, null, 1) + "\n";
  writeFileSync(OUT_FILE, json);
  console.log(
    `[build-sql-tables] ${path.relative(ROOT, OUT_FILE)} — SQL 문항 ${Object.keys(sql.questions).length}(준비 SQL ${Object.keys(sql.setups).length}) · ` +
      `Python 문항 ${Object.keys(python.questions).length}(준비 코드 ${Object.keys(python.setups).length}) · ${Buffer.byteLength(json)}B`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.removeAllListeners("warning");
  main().then(
    () => process.exit(0),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
}

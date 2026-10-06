/**
 * 데이터과학 작성 시 검증 — 실행 검증(Sprint 14). Node에서 Pyodide·sql.js(Sprint 13 엔진, worker_threads)로 문항 데이터를 실행한다.
 * 원칙: 코드 문제의 정답은 사람이 쓰지 않고 실행 결과로 검증한다.
 * - code-write: 모범 답안이 오류 없이 실행되고 checks 통과, 결과가 expect(슬라이드 실행결과)와 같다
 * - code-blank: 모든 accept를 끼운 코드가 같은 결과, wrong은 다른 결과, 후보(규칙·작성자)는 accept/wrong 중 맞는 쪽에 기록돼 있다
 * - 코드 출력 고르기(mcq·multi·blank): 실제 출력 = 정답 보기, ≠ 오답 보기 / 오류 문제는 실제 오류 종류·줄
 * - Python 출력은 해시 시드를 바꾼 엔진 2개 + 같은 엔진 두 번 실행으로 결정적인지 본다(세트 순서·난수·시간)
 * - 실행 제외(skip)인데 실제로 실행되는 코드는 실패
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { EngineClient } from "@/lib/engine/client";
import { normalizeStdout, sameTable, type SqlTable } from "@/lib/engine/compare";
import { createNodeEngineClient } from "@/lib/engine/nodeClient";
import type { PythonRunResult, SqlRunResult } from "@/lib/engine/protocol";
import type { VerifySpec } from "@/lib/qtypes/base";
import { fillCodeBlanks, type CodeBlankQ } from "@/lib/qtypes/codeBlank";
import type { CodeWriteQ } from "@/lib/qtypes/codeWrite";
import { SQL_SETUPS } from "@/lib/qtypes/dsSchemas";
import { sameTokens, type CodeLang } from "@/lib/qtypes/_shared/codeTokens";
import type { Question } from "@/lib/qtypes/registry";
import { blankCandidates } from "./candidates";
import { PLATFORM_OUTPUT, questionCode, verifyMethod, type VerifyMethod } from "./rules";

export interface CandidateOutcome {
  blank: number;
  text: string;
  /** 규칙 id 또는 "author" */
  source: string;
  outcome: "token-equal" | "same" | "different";
  /** 다른 결과일 때 무엇이 달랐는지 */
  detail?: string;
}
export interface VerifyReport {
  id: string;
  method: VerifyMethod;
  ok: boolean;
  problems: string[];
  candidates: CandidateOutcome[];
}

type RunRun = Extract<VerifySpec, { mode: "run" }>;
type PyCfg = NonNullable<RunRun["python"]>;
type SqlCfg = NonNullable<RunRun["sql"]>;

export interface VerifyEnv {
  /** 기본 엔진(해시 시드 무작위) */
  main: EngineClient;
  /** 해시 시드를 고정한 엔진들 — 출력이 실행마다 같은지 확인 */
  seeds: EngineClient[];
  py: { base: string; wheels: string[] };
  sqlBase: string;
  close(): void;
}

const MANIFEST = path.resolve(import.meta.dirname, "../../public/engine/manifest.json");
export const engineReady = () => existsSync(MANIFEST);

/**
 * `hashSeeds`: 해시 시드를 고정한 엔진을 더 띄워 출력이 시드마다 같은지 본다(세트 순서 등). 없으면 같은 엔진 두 번 실행만
 * (난수·시간은 잡지만 세트 순서는 못 잡는다) — `npm test`는 없이, `npm run verify:ds`는 ["1", "2"]
 */
export function createVerifyEnv(opts: { hashSeeds?: string[] } = {}): VerifyEnv {
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const main = createNodeEngineClient();
  const seeds = (opts.hashSeeds ?? []).map((s) => createNodeEngineClient({ hashSeed: s }));
  return {
    main,
    seeds,
    py: { base: m.pyodide.base, wheels: m.openpyxlWheels },
    sqlBase: m.sqljs.base,
    close: () => [main, ...seeds].forEach((c) => c.reset("검증 끝")),
  };
}

// ── 실행 한 번의 "결과 서명" ───────────────────────────────────────────

type PySig = { kind: "timeout" } | { kind: "done"; stdout: string; error: string | null; errorType: string | null; line: number | null; checks: boolean[]; truncated: boolean; setupError?: string };

async function runPy(env: VerifyEnv, client: EngineClient, code: string, cfg: PyCfg = {}): Promise<PySig> {
  const out = await client.runPython({ ...env.py, packages: cfg.packages ?? [], code, setup: cfg.setup, checks: cfg.checks });
  if (out.status === "timeout") return { kind: "timeout" };
  if (out.status === "unavailable") throw new Error(`엔진을 쓸 수 없음: ${out.message}`);
  const r: PythonRunResult = out.result;
  return {
    kind: "done",
    stdout: normalizeStdout(r.stdout),
    // message는 이미 "SyntaxError: expected ':'"처럼 종류를 담고 있다(pyRuntime formatPythonError)
    error: r.error ? r.error.message : null,
    errorType: r.error?.type ?? null,
    line: r.error?.line ?? null,
    checks: r.checks.map((c) => c.pass),
    truncated: r.truncated,
    setupError: r.setupError,
  };
}

const pySame = (a: PySig, b: PySig) => JSON.stringify(a) === JSON.stringify(b);
function pyShow(s: PySig): string {
  if (s.kind === "timeout") return "시간 초과";
  const parts = [s.error ? `오류 ${s.error}` : `출력 ${JSON.stringify(clip(s.stdout))}`];
  if (s.checks.length) parts.push(`값 검사 ${s.checks.map((c) => (c ? "○" : "✕")).join("")}`);
  return parts.join(", ");
}
const clip = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n)}…` : s);

type SqlSig = { kind: "timeout" } | { kind: "done"; error: string | null; result: SqlTable | null; tables: Record<string, SqlTable | null> };

async function runSqlSig(env: VerifyEnv, code: string, cfg: { setup: string; tables?: string[] }): Promise<SqlSig> {
  const out = await env.main.runSql({ base: env.sqlBase, setup: cfg.setup, code, tables: cfg.tables });
  if (out.status === "timeout") return { kind: "timeout" };
  if (out.status === "unavailable") throw new Error(`엔진을 쓸 수 없음: ${out.message}`);
  const r: SqlRunResult = out.result;
  return { kind: "done", error: r.error, result: r.result, tables: r.tables };
}

function sqlSame(a: SqlSig, b: SqlSig, cfg: SqlCfg): boolean {
  if (a.kind !== "done" || b.kind !== "done") return a.kind === b.kind;
  if (a.error || b.error) return a.error === b.error;
  if (cfg.mode === "select") return sameTable(a.result, b.result, { orderMatters: cfg.orderMatters });
  return (cfg.tables ?? []).every((t) => sameTable(a.tables[t] ?? null, b.tables[t] ?? null));
}
function sqlShow(s: SqlSig): string {
  if (s.kind === "timeout") return "시간 초과";
  if (s.error) return `오류 ${s.error}`;
  return s.result ? `결과 ${s.result.rows.length}행 ${JSON.stringify(clip(JSON.stringify(s.result.rows), 80))}` : "결과 표 없음";
}

// ── 결정성(실행마다 같은 출력) ─────────────────────────────────────────

/**
 * `withSeeds: false`: 같은 엔진 두 번 실행만(난수·시간) — 코드 빈칸은 출력 문제가 아니고 허용 답안 비교를 같은 엔진 안에서 하므로
 * 해시 시드에 따른 세트 순서 차이는 비교에 영향이 없다([코드 2-21] 세트 메서드 빈칸 등)
 */
async function determinism(env: VerifyEnv, code: string, cfg: PyCfg | undefined, first: PySig, withSeeds = true): Promise<string | null> {
  // 엔진마다 Worker가 따로라 함께 돌린다(판다스처럼 무거운 불러오기도 병렬)
  const others = await Promise.all([runPy(env, env.main, code, cfg), ...(withSeeds ? env.seeds : []).map((c) => runPy(env, c, code, cfg))]);
  const runs: [string, PySig][] = [["기본 엔진 1회", first], ["기본 엔진 2회", others[0]], ...others.slice(1).map((s, i): [string, PySig] => [`해시 시드 ${i + 1}`, s])];
  const diff = runs.find(([, s]) => !pySame(s, first));
  return diff ? `실행마다 출력이 달라짐(세트 순서·해시·시간·난수 등) — 출력 문제로 쓸 수 없음: ${runs[0][0]} ${pyShow(first)} / ${diff[0]} ${pyShow(diff[1])}` : null;
}

/** 출력에 Pyodide에서만 나오는 표기(int32·메모리 주소)가 있으면 출력 문제로 쓸 수 없다(기준은 슬라이드·Colab 환경) */
function platformOutput(stdout: string, p: (m: string) => void) {
  const m = stdout.match(PLATFORM_OUTPUT);
  if (m) p(`출력에 Pyodide·Colab이 다른 표기 '${m[0]}' — 기준 환경(Colab)과 결과가 달라 출력 문제로 쓸 수 없음`);
}

// ── 문항 하나 검증 ─────────────────────────────────────────────────────

export async function verifyQuestion(env: VerifyEnv, q: Question): Promise<VerifyReport> {
  const report: VerifyReport = { id: q.id, method: verifyMethod(q), ok: true, problems: [], candidates: [] };
  const p = (msg: string) => report.problems.push(msg);
  try {
    if (q.type === "code-write") await verifyCodeWrite(env, q, p);
    else if (q.type === "code-blank" && q.verify?.mode === "run") await verifyCodeBlank(env, q, q.verify, p, report.candidates);
    else if (q.verify?.mode === "run") await verifyCodeChoice(env, q, q.verify, p);
    else if (q.verify?.mode === "skip") await verifySkip(env, q, p);
  } catch (e) {
    p(`검증 실행 실패: ${(e as Error).message}`);
  }
  report.ok = report.problems.length === 0;
  return report;
}

async function verifyCodeWrite(env: VerifyEnv, q: CodeWriteQ, p: (m: string) => void) {
  if (q.language === "python") {
    const s = await runPy(env, env.main, q.solution, q.python);
    if (s.kind === "timeout") return p("모범 답안이 시간 초과");
    if (s.setupError) return p(`준비 코드(setup) 오류: ${s.setupError}`);
    if (s.error) return p(`모범 답안 실행 오류: ${s.error}${s.line ? ` (${s.line}번째 줄)` : ""}`);
    if (s.truncated) p("모범 답안 출력이 너무 길다(출력 제한)");
    const failed = (q.python?.checks ?? []).filter((_, i) => !s.checks[i]);
    if (failed.length) p(`모범 답안이 값 검사를 통과하지 못함: ${failed.join(", ")}`);
    if (q.expect?.stdout !== undefined && normalizeStdout(q.expect.stdout) !== s.stdout) {
      p(`모범 답안 출력이 기대 결과(expect.stdout)와 다름 — 기대 ${JSON.stringify(clip(normalizeStdout(q.expect.stdout)))} / 실제 ${JSON.stringify(clip(s.stdout))}`);
    }
    platformOutput(s.stdout, p);
    const d = await determinism(env, q.solution, q.python, s);
    if (d) p(d);
    return;
  }
  const sql = q.sql!;
  const s = await runSqlSig(env, q.solution, { setup: SQL_SETUPS[sql.setup], tables: sql.tables });
  if (s.kind === "timeout") return p("모범 답안이 시간 초과");
  if (s.error) return p(`모범 답안 실행 오류: ${s.error}`);
  if (sql.mode === "select") {
    if (!s.result) return p("모범 답안이 결과 표를 내지 않음(SELECT가 아님)");
    if (q.expect?.rows && !sameTable(s.result, { columns: s.result.columns, rows: q.expect.rows }, { orderMatters: sql.orderMatters })) {
      p(`모범 답안 결과 표가 기대 결과(expect.rows)와 다름 — 기대 ${JSON.stringify(q.expect.rows)} / 실제 ${JSON.stringify(s.result.rows)}`);
    }
  }
}

async function verifyCodeBlank(env: VerifyEnv, q: CodeBlankQ, v: RunRun, p: (m: string) => void, outcomes: CandidateOutcome[]) {
  const lang: CodeLang = q.language;
  const firsts = q.blanks.map((b) => b.accept[0]);
  const fill = (i: number, text: string) => fillCodeBlanks(q.source, firsts.map((f, k) => (k === i ? text : f)));
  const sqlCfg = v.sql ? { setup: SQL_SETUPS[v.sql.setup], tables: v.sql.tables } : null;

  // 첫 번째 정답(슬라이드 표기)으로 채운 코드 — 기준
  let same: (code: string) => Promise<{ same: boolean; show: string }>;
  if (lang === "python") {
    const base = await runPy(env, env.main, fill(-1, ""), v.python);
    if (base.kind === "timeout") return p("첫 번째 정답으로 채운 코드가 시간 초과");
    if (base.setupError) return p(`준비 코드(setup) 오류: ${base.setupError}`);
    if (base.error) return p(`첫 번째 정답으로 채운 코드가 실행되지 않음: ${base.error}${base.line ? ` (${base.line}번째 줄)` : ""}`);
    if (base.checks.some((c) => !c)) p("첫 번째 정답으로 채운 코드가 값 검사를 통과하지 못함");
    const d = await determinism(env, fill(-1, ""), v.python, base, false);
    if (d) p(d);
    same = async (code) => {
      const s = await runPy(env, env.main, code, v.python);
      return { same: pySame(s, base), show: pyShow(s) };
    };
  } else {
    const base = await runSqlSig(env, fill(-1, ""), sqlCfg!);
    if (base.kind === "timeout") return p("첫 번째 정답으로 채운 SQL이 시간 초과");
    if (base.error) return p(`첫 번째 정답으로 채운 SQL이 실행되지 않음: ${base.error}`);
    same = async (code) => {
      const s = await runSqlSig(env, code, sqlCfg!);
      return { same: sqlSame(s, base, v.sql!), show: sqlShow(s) };
    };
  }

  for (const [i, b] of q.blanks.entries()) {
    for (const a of b.accept.slice(1)) {
      const r = await same(fill(i, a));
      if (!r.same) p(`${i}번 빈칸 accept '${a}'가 첫 번째 정답 '${b.accept[0]}'과 다른 결과: ${r.show}`);
    }
    for (const w of b.wrong ?? []) {
      const r = await same(fill(i, w));
      if (r.same) p(`${i}번 빈칸 wrong '${w}'가 정답과 같은 결과 — 오답 예시가 아니다(accept로 옮기거나 빼세요)`);
    }
    for (const c of blankCandidates(b.accept[0], lang, b.candidates)) {
      // 글자 그대로 accept에 있는 후보는 실행해서 확인한다. 글자는 다르지만 토큰이 같은 후보만 "이미 같은 답"
      if (!b.accept.includes(c.text) && b.accept.some((a) => sameTokens(c.text, a, lang))) {
        outcomes.push({ blank: i, ...c, outcome: "token-equal" });
        continue;
      }
      const r = await same(fill(i, c.text));
      outcomes.push({ blank: i, ...c, outcome: r.same ? "same" : "different", detail: r.same ? undefined : r.show });
      const from = c.source === "author" ? "작성자 후보" : `규칙 ${c.source}`;
      if (r.same) {
        if (!b.accept.some((a) => sameTokens(c.text, a, lang))) p(`${i}번 빈칸 후보 '${c.text}'(${from})가 같은 결과 → accept에 추가하세요`);
      } else if (!(b.wrong ?? []).some((w) => sameTokens(c.text, w, lang))) p(`${i}번 빈칸 후보 '${c.text}'(${from})가 다른 결과(${r.show}) → wrong(오답 예시)에 기록하세요`);
    }
  }
}

/** Colab 코드 셀 표시 흉내: 마지막 줄(식)의 값을 repr로 출력한다 */
export function colabCell(source: string): string {
  const lines = source.replace(/\n+$/, "").split("\n");
  const last = lines.length - 1;
  lines[last] = `print(repr(${lines[last].trim()}))`;
  return lines.join("\n");
}

async function verifyCodeChoice(env: VerifyEnv, q: Question, v: RunRun, p: (m: string) => void) {
  const shown = questionCode(q)!;
  const code = v.check?.kind === "output" && v.check.cell ? { ...shown, source: colabCell(shown.source) } : shown;
  const s = await runPy(env, env.main, code.source, v.python);
  if (s.kind === "timeout") return p("코드가 시간 초과");
  const check = v.check!;
  if (check.kind === "error") {
    if (!s.error) return p(`오류 문제인데 코드가 오류 없이 실행됨(출력 ${JSON.stringify(clip(s.stdout))})`);
    if (s.errorType !== check.errorType) p(`실제 오류 종류 ${s.errorType} ≠ 문항의 ${check.errorType}`);
    if (check.line !== undefined && s.line !== check.line) p(`실제 오류 줄 ${s.line} ≠ 문항의 ${check.line}(화면 줄 번호, 빈 줄 포함)`);
    return;
  }
  if (s.error) return p(`코드 실행 오류: ${s.error}${s.line ? ` (${s.line}번째 줄)` : ""}`);
  platformOutput(s.stdout, p);
  const d = await determinism(env, code.source, v.python, s);
  if (d) p(d);
  const asOut = (choice: string) => normalizeStdout(check.lineSep ? choice.split(check.lineSep).join("\n") : choice);
  const lines = s.stdout.split("\n");
  if (q.type === "mcq") {
    q.choices.forEach((c, i) => {
      const eq = asOut(c) === s.stdout;
      if (i === q.answerIndex && !eq) p(`정답 보기 ${i + 1} '${c}'가 실제 출력과 다름 — 실제 ${JSON.stringify(clip(s.stdout))}`);
      if (i !== q.answerIndex && eq) p(`오답 보기 ${i + 1} '${c}'가 실제 출력과 같음`);
    });
  } else if (q.type === "multi") {
    q.choices.forEach((c, i) => {
      const inOut = asOut(c).split("\n").every((l) => lines.includes(l));
      if (q.answerIndexes.includes(i) && !inOut) p(`정답 보기 ${i + 1} '${c}'가 실제 출력에 없음`);
      if (!q.answerIndexes.includes(i) && inOut) p(`오답 보기 ${i + 1} '${c}'가 실제 출력에 있음`);
    });
  } else if (q.type === "blank") {
    const want = q.blanks.length === 1 ? [s.stdout] : lines;
    q.blanks.forEach((b, i) => {
      if (normalizeStdout(b.accept[0]) !== (want[i] ?? "")) p(`${i}번 빈칸 첫 정답 '${b.accept[0]}'이 실제 출력 ${JSON.stringify(want[i] ?? "")}와 다름`);
    });
  }
}

async function verifySkip(env: VerifyEnv, q: Question, p: (m: string) => void) {
  const code = questionCode(q);
  if (!code) return;
  if (code.language === "python") {
    const s = await runPy(env, env.main, code.source);
    if (s.kind === "done" && !s.error) p("실행 제외(skip)인데 실제로 오류 없이 실행된다 — verify: run으로 검증하세요");
  } else {
    const s = await runSqlSig(env, code.source, { setup: SQL_SETUPS.firstDB });
    if (s.kind === "done" && !s.error) p("실행 제외(skip)인데 sql.js에서 오류 없이 실행된다 — verify: run으로 검증하세요");
  }
}

/** 여러 문항을 차례로 검증 */
export async function verifyAll(env: VerifyEnv, qs: readonly Question[]): Promise<VerifyReport[]> {
  const out: VerifyReport[] = [];
  for (const q of qs) out.push(await verifyQuestion(env, q));
  return out;
}

export const needsPandas = (q: Question) =>
  (q.type === "code-write" ? q.python?.packages : q.verify?.mode === "run" ? q.verify.python?.packages : undefined)?.includes("pandas") ?? false;

/** `npm run verify:ds`(전체 검증)에서 쓰는 해시 시드 */
export const FULL_SEEDS = ["1", "2"];

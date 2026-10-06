/**
 * 전체 작성형 실행·판정(Sprint 13): 모범 답안과 사용자 코드를 같은 엔진에서 실행해 비교하고, 결과를 답(`run`)에 담을 형태로 돌려준다.
 * 브라우저(Web Worker 클라이언트)와 Node(worker_threads 클라이언트, 테스트·Sprint 14)가 같은 함수를 쓴다.
 */
import { straightenQuotes } from "@/lib/qtypes/_shared/codeTokens";
import type { CodeWriteQ, CodeWriteRun, RunSide } from "@/lib/qtypes/codeWrite";
import { SQL_SETUPS } from "@/lib/qtypes/dsSchemas";
import type { EngineClient, RunOutcome } from "./client";
import { normalizeStdout, sameTable } from "./compare";
import type { PythonRunResult, SqlRunResult } from "./protocol";

export interface EngineManifest {
  pyodide: { version: string; base: string };
  sqljs: { version: string; base: string };
  /** 브라우저 모듈 Worker 주소(/engine/app-{해시}/browserWorker.js) */
  worker: string;
  openpyxlWheels: string[];
  bytes: { python: number; numpy: number; pandas: number; sql: number };
}

/** 모범 답안 실행 결과는 문제마다 한 번만(같은 엔진에서 늘 같다) */
const solutionCache = new Map<string, RunOutcome<PythonRunResult> | RunOutcome<SqlRunResult>>();

export async function executeCodeWrite(client: EngineClient, manifest: EngineManifest, q: CodeWriteQ, input: string): Promise<CodeWriteRun> {
  const { text: code, changed: quotesFixed } = straightenQuotes(input);
  const base = { input, quotesFixed };
  if (q.language === "python") {
    const req = {
      base: manifest.pyodide.base,
      wheels: manifest.openpyxlWheels,
      packages: q.python?.packages ?? [],
      setup: q.python?.setup,
      checks: q.python?.checks,
    };
    let exp = solutionCache.get(q.id) as RunOutcome<PythonRunResult> | undefined;
    if (!exp || exp.status !== "done") {
      exp = await client.runPython({ ...req, code: q.solution });
      if (exp.status === "done") solutionCache.set(q.id, exp);
    }
    if (exp.status !== "done") return { ...base, status: "unavailable", passed: false, reason: exp.status === "unavailable" ? exp.message : "모범 답안을 실행하지 못했습니다" };
    if (exp.result.error || exp.result.setupError) return { ...base, status: "unavailable", passed: false, reason: `모범 답안 실행 오류(데이터 오류): ${exp.result.error?.message ?? exp.result.setupError}` };
    const expected: RunSide = { stdout: exp.result.stdout, error: null };
    const mine = await client.runPython({ ...req, code });
    if (mine.status === "timeout") return { ...base, status: "timeout", passed: false, expected, reason: `시간 초과(${mine.limitMs / 1000}초) — 무한 반복이 없는지 확인하세요` };
    if (mine.status === "unavailable") return { ...base, status: "unavailable", passed: false, reason: mine.message };
    const r = mine.result;
    const mineSide: RunSide = { stdout: r.stdout, error: r.error ? (r.error.line ? `${r.error.message} (${r.error.line}번째 줄)` : r.error.message) : null, truncated: r.truncated };
    let reason: string | undefined;
    if (r.error) reason = "실행 중 오류";
    else if (r.truncated) reason = "출력이 너무 깁니다";
    else if (normalizeStdout(r.stdout) !== normalizeStdout(exp.result.stdout)) reason = "출력이 기대 결과와 다릅니다";
    else {
      const failed = r.checks.filter((c) => !c.pass);
      if (failed.length) reason = `값 검사 실패: ${failed.map((c) => c.expr).join(", ")}`;
    }
    return { ...base, status: "done", passed: !reason, mine: mineSide, expected, reason, ms: mine.ms };
  }

  // SQL
  const sql = q.sql!;
  const req = { base: manifest.sqljs.base, setup: SQL_SETUPS[sql.setup], tables: sql.tables };
  let exp = solutionCache.get(q.id) as RunOutcome<SqlRunResult> | undefined;
  if (!exp || exp.status !== "done") {
    exp = await client.runSql({ ...req, code: q.solution });
    if (exp.status === "done") solutionCache.set(q.id, exp);
  }
  if (exp.status !== "done") return { ...base, status: "unavailable", passed: false, reason: exp.status === "unavailable" ? exp.message : "모범 답안을 실행하지 못했습니다" };
  if (exp.result.error) return { ...base, status: "unavailable", passed: false, reason: `모범 답안 실행 오류(데이터 오류): ${exp.result.error}` };
  const expected: RunSide = sql.mode === "select" ? { table: exp.result.result, error: null } : { tables: exp.result.tables, error: null };
  const mine = await client.runSql({ ...req, code });
  if (mine.status === "timeout") return { ...base, status: "timeout", passed: false, expected, reason: `시간 초과(${mine.limitMs / 1000}초)` };
  if (mine.status === "unavailable") return { ...base, status: "unavailable", passed: false, reason: mine.message };
  const r = mine.result;
  const mineSide: RunSide = sql.mode === "select" ? { table: r.result, error: r.error } : { tables: r.tables, error: r.error };
  let reason: string | undefined;
  if (r.error) reason = "실행 중 오류";
  else if (sql.mode === "select") {
    if (!sameTable(r.result, exp.result.result, { orderMatters: sql.orderMatters, compareColumns: sql.compareColumns }))
      reason = sql.orderMatters ? "결과 표(순서 포함)가 기대 결과와 다릅니다" : "결과 표가 기대 결과와 다릅니다(행 순서는 보지 않음)";
  } else {
    const bad = (sql.tables ?? []).filter((t) => !sameTable(r.tables[t] ?? null, exp.result.tables[t] ?? null));
    if (bad.length) reason = `실행 후 테이블 상태가 다릅니다: ${bad.join(", ")}`;
  }
  return { ...base, status: "done", passed: !reason, mine: mineSide, expected, reason, ms: mine.ms };
}

/** 테스트용: 모범 답안 캐시 비우기 */
export function clearSolutionCache() {
  solutionCache.clear();
}

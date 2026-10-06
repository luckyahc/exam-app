/**
 * 대조 기록 `docs/verification/data-science-lecN.md`(Sprint 14) 읽기·검사.
 * 형식: 요약 줄 `요약: 문항 N · 실행 N · 실행 제외 N · 개념 N · 수정 N` + 표 `| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |`.
 * 검사: 표의 id·slideRef·검증 방식이 문항 데이터와 같고, 결과 칸이 방식에 맞고, 요약 숫자가 표·데이터와 같다.
 */
import type { Question } from "@/lib/qtypes/registry";
import { verifyMethod, type VerifyMethod } from "./rules";

export interface RecordRow {
  id: string;
  slideRef: string;
  method: string;
  result: string;
  fix: string;
}
export interface RecordSummary {
  total: number;
  run: number;
  skip: number;
  concept: number;
  fixed: number;
}

const HEADER = ["문항 id", "slideRef", "검증 방식", "결과", "수정 내용"];
const SUMMARY = /^요약: 문항 (\d+) · 실행 (\d+) · 실행 제외 (\d+) · 개념 (\d+) · 수정 (\d+)$/m;
const METHODS: VerifyMethod[] = ["실행", "실행 제외", "개념"];
/** 결과 칸: 실행 → "통과", 실행 제외 → "제외(이유)", 개념 → "—" */
const RESULT_OK: Record<VerifyMethod, RegExp> = { 실행: /^통과$/, "실행 제외": /^제외\(.{3,}\)$/, 개념: /^—$/ };

const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim().replace(/^`|`$/g, ""));

export function parseRecord(md: string): { summary: RecordSummary | null; header: string[] | null; rows: RecordRow[] } {
  const m = md.match(SUMMARY);
  const summary = m ? { total: +m[1], run: +m[2], skip: +m[3], concept: +m[4], fixed: +m[5] } : null;
  const lines = md.split(/\r?\n/);
  const hi = lines.findIndex((l) => l.trim().startsWith("| 문항 id"));
  if (hi < 0) return { summary, header: null, rows: [] };
  const rows: RecordRow[] = [];
  for (const l of lines.slice(hi + 2)) {
    if (!l.trim().startsWith("|")) break;
    const [id, slideRef, method, result, fix] = cells(l);
    rows.push({ id, slideRef, method, result, fix });
  }
  return { summary, header: cells(lines[hi]), rows };
}

export function recordErrors(md: string, questions: readonly Question[]): string[] {
  const e: string[] = [];
  const { summary, header, rows } = parseRecord(md);
  if (!header || header.join("|") !== HEADER.join("|")) e.push(`표 머리글은 | ${HEADER.join(" | ")} |`);
  if (!summary) e.push("요약 줄이 없음(요약: 문항 N · 실행 N · 실행 제외 N · 개념 N · 수정 N)");
  const byId = new Map(questions.map((q) => [q.id, q]));
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.id)) e.push(`${r.id}: 표에 두 번`);
    seen.add(r.id);
    const q = byId.get(r.id);
    if (!q) {
      e.push(`${r.id}: 문항 데이터에 없음`);
      continue;
    }
    if (r.slideRef !== q.slideRef) e.push(`${r.id}: slideRef '${r.slideRef}' ≠ 데이터 '${q.slideRef}'`);
    const want = verifyMethod(q);
    if (r.method !== want) e.push(`${r.id}: 검증 방식 '${r.method}' ≠ 데이터 '${want}'`);
    if (METHODS.includes(r.method as VerifyMethod) && !RESULT_OK[r.method as VerifyMethod].test(r.result)) {
      e.push(`${r.id}: 결과 '${r.result}'가 방식(${r.method})에 맞지 않음 — 실행: 통과 / 실행 제외: 제외(이유) / 개념: —`);
    }
    if (!r.fix) e.push(`${r.id}: 수정 내용이 비어 있음(없으면 —)`);
  }
  for (const q of questions) if (!seen.has(q.id)) e.push(`${q.id}: 기록 표에 없음`);
  if (summary) {
    const count = (m: string) => rows.filter((r) => r.method === m).length;
    const want: RecordSummary = { total: questions.length, run: count("실행"), skip: count("실행 제외"), concept: count("개념"), fixed: rows.filter((r) => r.fix !== "—").length };
    for (const k of Object.keys(want) as (keyof RecordSummary)[]) {
      if (summary[k] !== want[k]) e.push(`요약 ${k} ${summary[k]} ≠ 실제 ${want[k]}`);
    }
  }
  return e;
}

/** 문항 데이터로 기록 표 줄을 만든다(새 문항을 기록에 옮길 때 쓰는 도우미) */
export function recordRow(q: Question, result: string, fix = "—"): string {
  return `| \`${q.id}\` | ${q.slideRef} | ${verifyMethod(q)} | ${result} | ${fix} |`;
}

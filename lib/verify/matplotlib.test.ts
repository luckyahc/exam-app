/**
 * 데이터과학 Lec7(맷플롯립) 로컬 검증(2026-10-17). 앱 실행 엔진(Pyodide)에 맷플롯립이 없어서 verify: { mode: "skip", local: "matplotlib" }
 * 문항은 이 테스트가 로컬 CPython(scripts/verify-matplotlib.py, Agg 백엔드)으로 실행해 확인한다.
 * - 코드 빈칸: 첫 정답을 끼운 코드가 오류 없이 돌고, 다른 허용 답안은 같은 그래프(축·선·막대·점·글자 속성), wrong은 오류이거나 다른 그래프
 * - 결과·성질을 묻는 문항: lib/verify/matplotlibChecks.ts의 식으로 정답 보기만 참, value = 정답, error = 그 오류 종류
 * - 함수 정리표(functions.json)의 localRun 예시: 다시 실행한 print 출력 = exampleOutput
 * 파이썬·맷플롯립이 없는 PC에서는 건너뛴다(PYTHON 환경 변수로 실행 파일 지정 가능).
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import lec7 from "@/data/subjects/data-science/lec7";
import { DS_FUNCTIONS } from "@/lib/dsFunctions";
import { fillCodeBlanks } from "@/lib/qtypes/codeBlank";
import type { Question } from "@/lib/qtypes/registry";
import { MPL_CHECKS } from "./matplotlibChecks";
import { questionCode } from "./rules";

const PY = process.env.PYTHON ?? "python";
const SCRIPT = path.resolve(import.meta.dirname, "../../scripts/verify-matplotlib.py");
const ready = spawnSync(PY, ["-c", "import matplotlib, numpy, pandas"]).status === 0;

interface Job {
  key: string;
  code: string;
  after?: string;
  truths?: string[];
  value?: string;
}
interface JobResult {
  key: string;
  error: { type: string; message: string } | null;
  stdout: string;
  signature: unknown;
  truths: boolean[] | null;
  value: unknown;
}

const isLocal = (q: Question) => q.verify?.mode === "skip" && q.verify.local === "matplotlib";

function jobsFor(q: Question): Job[] {
  const jobs: Job[] = [];
  if (q.type === "code-blank" && isLocal(q)) {
    const first = q.blanks.map((b) => b.accept[0]);
    const fill = (i: number, v: string) => fillCodeBlanks(q.source, first.map((x, k) => (k === i ? v : x)));
    jobs.push({ key: `${q.id}#base`, code: fillCodeBlanks(q.source, first) });
    q.blanks.forEach((b, i) => {
      b.accept.slice(1).forEach((a, j) => jobs.push({ key: `${q.id}#accept${i}.${j + 1}`, code: fill(i, a) }));
      (b.wrong ?? []).forEach((w, j) => jobs.push({ key: `${q.id}#wrong${i}.${j}`, code: fill(i, w) }));
    });
  }
  const c = MPL_CHECKS[q.id];
  if (c) {
    // truths의 null(확인할 수 없는 보기)은 "True"로 실행하고 비교에서 뺀다
    jobs.push({ key: `${q.id}#check`, code: c.code ?? questionCode(q)!.source, after: c.after, truths: c.truths?.map((t) => t ?? "True"), value: c.value });
  }
  return jobs;
}

function runAll(jobs: Job[]): { matplotlib: string; results: Map<string, JobResult> } {
  const dir = mkdtempSync(path.join(tmpdir(), "mpl-verify-"));
  try {
    const file = path.join(dir, "jobs.json");
    writeFileSync(file, JSON.stringify(jobs));
    const r = spawnSync(PY, [SCRIPT, file], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
    if (r.status !== 0) throw new Error(`verify-matplotlib.py 실패: ${r.stderr}`);
    const out = JSON.parse(r.stdout) as { matplotlib: string; results: JobResult[] };
    return { matplotlib: out.matplotlib, results: new Map(out.results.map((x) => [x.key, x])) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function expectedTruths(q: Question): boolean[] | null {
  if (q.type === "mcq") return q.choices.map((_, i) => i === q.answerIndex);
  if (q.type === "multi") return q.choices.map((_, i) => q.answerIndexes.includes(i));
  if (q.type === "ox") return [q.answer];
  return null;
}

/** 검사 결과 → 문제점 목록 */
function problemsOf(q: Question, results: Map<string, JobResult>): string[] {
  const p: string[] = [];
  const get = (key: string) => results.get(key)!;
  if (q.type === "code-blank" && isLocal(q)) {
    const base = get(`${q.id}#base`);
    if (base.error) p.push(`첫 정답 코드 오류: ${base.error.type} ${base.error.message}`);
    q.blanks.forEach((b, i) => {
      b.accept.slice(1).forEach((a, j) => {
        const r = get(`${q.id}#accept${i}.${j + 1}`);
        if (r.error) p.push(`${i}번 허용 답안 '${a}' 오류: ${r.error.type}`);
        else if (JSON.stringify(r.signature) !== JSON.stringify(base.signature)) p.push(`${i}번 허용 답안 '${a}'의 그래프가 첫 정답과 다름`);
      });
      (b.wrong ?? []).forEach((w, j) => {
        const r = get(`${q.id}#wrong${i}.${j}`);
        if (!r.error && JSON.stringify(r.signature) === JSON.stringify(base.signature)) p.push(`${i}번 wrong '${w}'가 첫 정답과 같은 그래프`);
      });
    });
  }
  const c = MPL_CHECKS[q.id];
  if (!c) return p;
  const r = get(`${q.id}#check`);
  if (c.error) {
    if (r.error?.type !== c.error) p.push(`오류 ${c.error}이어야 하는데 ${r.error ? r.error.type : "오류 없음"}`);
    return p;
  }
  if (r.error) return [...p, `검사 코드 오류: ${r.error.type} ${r.error.message}`];
  if (c.truths) {
    const want = expectedTruths(q);
    if (!want || want.length !== c.truths.length) p.push(`truths ${c.truths.length}개 ≠ 보기 ${want?.length ?? "(보기 없는 유형)"}`);
    else c.truths.forEach((t, i) => t !== null && r.truths![i] !== want[i] && p.push(`보기 ${i}: 실행 결과 ${r.truths![i]} ≠ 정답 표시 ${want[i]}`));
  }
  if (c.value) {
    const v = r.value;
    if (q.type === "mcq") {
      if (v !== q.choices[q.answerIndex]) p.push(`값 ${JSON.stringify(v)} ≠ 정답 보기 '${q.choices[q.answerIndex]}'`);
    } else if (q.type === "blank") {
      const want = q.blanks.map((b) => b.accept[0]);
      if (JSON.stringify(v) !== JSON.stringify(want)) p.push(`값 ${JSON.stringify(v)} ≠ 빈칸 첫 정답 ${JSON.stringify(want)}`);
    } else if (q.type === "calc") {
      if (typeof v !== "number" || Math.abs(v - q.answer) > Math.max(q.tolerance, 1e-9)) p.push(`값 ${JSON.stringify(v)} ≠ 정답 ${q.answer}`);
    } else p.push(`value를 비교할 수 없는 유형 ${q.type}`);
  }
  return p;
}

describe("Lec7 맷플롯립 로컬 검사 목록", () => {
  const byId = new Map(lec7.map((q) => [q.id, q]));
  it("검사 id는 Lec7 문항, 코드 블록이 있으면 문항 코드를 쓰고 없으면 검사 코드를 둔다, 결과 문항(local)은 검사가 있다", () => {
    const bad: string[] = [];
    for (const [id, c] of Object.entries(MPL_CHECKS)) {
      const q = byId.get(id);
      if (!q) bad.push(`${id}: Lec7 문항에 없음`);
      else if (!!questionCode(q) === (c.code !== undefined)) bad.push(`${id}: ${questionCode(q) ? "코드 블록이 있는데 code를 따로 둠" : "코드 블록이 없는데 code가 없음"}`);
      else if (questionCode(q) && !isLocal(q)) bad.push(`${id}: 코드 블록 문항은 verify local: matplotlib`);
      if (!c.truths && !c.value && !c.error) bad.push(`${id}: truths·value·error 중 하나는 있어야 함`);
    }
    for (const q of lec7) if (isLocal(q) && q.type !== "code-blank" && !MPL_CHECKS[q.id]) bad.push(`${q.id}: local 문항인데 검사가 없음`);
    expect(bad).toEqual([]);
  });
});

describe.skipIf(!ready)("Lec7 맷플롯립 로컬 실행(CPython + matplotlib Agg)", () => {
  it("코드 빈칸 허용 답안은 같은 그래프·wrong은 다름, 결과 문항의 정답이 실행 결과와 같다", () => {
    const qs = lec7.filter((q) => isLocal(q) || MPL_CHECKS[q.id]);
    const { results } = runAll(qs.flatMap(jobsFor));
    const bad = qs.flatMap((q) => problemsOf(q, results).map((m) => `${q.id}: ${m}`));
    expect(bad).toEqual([]);
    expect(qs.length).toBeGreaterThan(20);
  }, 180_000);

  it("함수 정리표의 맷플롯립 예시(localRun): 오류 없이 돌고 print 출력 = exampleOutput", () => {
    const fs = DS_FUNCTIONS.filter((f) => f.localRun === "matplotlib");
    const { results } = runAll(fs.map((f) => ({ key: f.id, code: `${f.setup ?? ""}\n${f.example}` })));
    const got = Object.fromEntries(
      fs.map((f) => {
        const r = results.get(f.id)!;
        return [f.id, r.error ? `오류 ${r.error.type}` : r.stdout.replace(/\n$/, "")];
      }),
    );
    expect(got).toEqual(Object.fromEntries(fs.map((f) => [f.id, f.exampleOutput])));
    expect(fs.length).toBeGreaterThan(10);
  }, 120_000);
});

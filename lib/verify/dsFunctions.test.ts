import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import dataScience from "@/data/subjects/data-science";
import { normalizeStdout } from "@/lib/engine/compare";
import { SQL_SETUPS, type SqlSetupName } from "@/lib/qtypes/dsSchemas";
import type { Question } from "@/lib/qtypes/registry";
import { DS_FUNCTIONS, DS_LECTURES, RELATED_MAX, questionPattern, type DsFunction } from "@/lib/dsFunctions";
import { createVerifyEnv, engineReady } from "./run";

// 데이터과학 함수 정리표(data/subjects/data-science/functions.json): 형식, 관련 문항(문항 본문에서 찾기), 예시 실행 결과 = 검증 엔진 재실행.
// 다시 만들기: node scripts/ds-functions.mjs (UPDATE_DS_FUNCTIONS=1로 이 테스트를 돌려 exampleOutput·relatedQuestionIds를 채운다)

const FILE = path.resolve(import.meta.dirname, "../../data/subjects/data-science/functions.json");
const UPDATE = !!process.env.UPDATE_DS_FUNCTIONS;
const fileEntries = () => JSON.parse(readFileSync(FILE, "utf8")) as DsFunction[];

/** 문자열 값 중 지문·코드·보기·빈칸만(해설·요약·틀린 이유·검증 설정·분류 필드는 뺀다) */
const SKIP = new Set(["id", "subject", "chapter", "topic", "type", "slideRef", "explanation", "summary", "falseReason", "verify", "examBasis", "hintIds", "language"]);
const body = (q: Question) => {
  const out: string[] = [];
  const walk = (v: unknown, key?: string) => {
    if (key && SKIP.has(key)) return;
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(q);
  return out.join("\n");
};

async function related(): Promise<Map<string, string[]>> {
  const byLec = new Map<string, readonly Question[]>();
  for (const c of dataScience.chapters) byLec.set(c.id, await c.load());
  return new Map(
    DS_FUNCTIONS.map((f) => {
      const re = questionPattern(f);
      const qs = [f.lecture, ...(f.alsoIn ?? [])].flatMap((l) => byLec.get(l) ?? []);
      return [f.id, qs.filter((q) => re.test(body(q))).map((q) => q.id).slice(0, RELATED_MAX)];
    }),
  );
}

const fmtSql = (r: { columns: string[]; rows: unknown[][] } | null) =>
  !r ? "(결과 없음)" : [r.columns.join(" | "), ...(r.rows.length ? r.rows.map((row) => row.map((v) => (v === null ? "NULL" : String(v))).join(" | ")) : ["(결과 없음)"])].join("\n");

describe("데이터과학 함수 정리표", () => {
  it.skipIf(UPDATE)("형식: 장·id 유일, 필수 필드, 실행 못 하는 항목만 exampleOutput 없음, alsoIn은 처음 장보다 뒤, (보충)은 문장 끝", () => {
    const ids = new Set<string>();
    for (const f of DS_FUNCTIONS) {
      expect(ids.has(f.id), f.id).toBe(false);
      ids.add(f.id);
      expect(DS_LECTURES, f.id).toContain(f.lecture);
      for (const k of ["category", "name", "signature", "description", "usage", "example"] as const) expect(f[k]?.trim(), `${f.id} ${k}`).toBeTruthy();
      if (f.noRun) expect(f.exampleOutput, f.id).toBeNull();
      else expect(f.exampleOutput?.trim(), `${f.id} exampleOutput`).toBeTruthy();
      for (const l of f.alsoIn ?? []) expect(DS_LECTURES.indexOf(l as never), f.id).toBeGreaterThan(DS_LECTURES.indexOf(f.lecture as never));
      for (const t of [f.description, f.usage, f.pitfall ?? ""]) expect(/\(보충\)(?!$)/.test(t), `${f.id}: (보충)은 끝에`).toBe(false);
      if (f.lang === "sql") expect(Object.keys(SQL_SETUPS), f.id).toContain(f.setup);
    }
    expect(new Set(DS_FUNCTIONS.map((f) => `${f.lecture} ${f.name}`)).size).toBe(DS_FUNCTIONS.length);
  });

  it("관련 문항 = 문항 본문(지문·코드·보기·빈칸)에서 찾은 결과(장 순서대로 앞 20개)", async () => {
    const want = await related();
    if (UPDATE) {
      const data = fileEntries().map((f) => ({ ...f, relatedQuestionIds: want.get(f.id) ?? [] }));
      writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
      return;
    }
    expect(Object.fromEntries(DS_FUNCTIONS.map((f) => [f.id, f.relatedQuestionIds]))).toEqual(Object.fromEntries(want));
  });

  describe.skipIf(!engineReady())("예시 실행 결과 = 검증 엔진(Pyodide·sql.js) 재실행", () => {
    const env = engineReady() ? createVerifyEnv() : (null as never);
    afterAll(() => env?.close());

    it("실행할 수 있는 모든 예시가 오류 없이 돌고, 출력이 exampleOutput과 같다", async () => {
      const got: Record<string, string> = {};
      const errors: string[] = [];
      for (const f of DS_FUNCTIONS.filter((x) => !x.noRun)) {
        if (f.lang === "sql") {
          const out = await env.main.runSql({ base: env.sqlBase, setup: SQL_SETUPS[f.setup as SqlSetupName], code: f.example }, 30_000);
          if (out.status !== "done" || out.result.error) errors.push(`${f.id}: ${out.status === "done" ? out.result.error : out.status}`);
          else got[f.id] = fmtSql(out.result.result);
        } else {
          const src = `${f.setup ?? ""}\n${f.example}`;
          const packages = [...(/\bnumpy\b|\bnp\./.test(src) ? ["numpy" as const] : []), ...(/\bpandas\b|\bpd\./.test(src) ? ["pandas" as const] : [])];
          const out = await env.main.runPython({ ...env.py, packages, code: f.example, setup: f.setup }, 60_000);
          if (out.status !== "done") errors.push(`${f.id}: ${out.status}`);
          else if (out.result.error || out.result.setupError) errors.push(`${f.id}: ${out.result.setupError ?? out.result.error?.message}`);
          else got[f.id] = normalizeStdout(out.result.stdout);
        }
      }
      expect(errors).toEqual([]);
      if (UPDATE) {
        const data = fileEntries().map((f) => ({ ...f, exampleOutput: f.noRun ? null : (got[f.id] ?? null) }));
        writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
        return;
      }
      expect(Object.fromEntries(DS_FUNCTIONS.filter((x) => !x.noRun).map((f) => [f.id, f.exampleOutput]))).toEqual(got);
    }, 300_000);
  });
});

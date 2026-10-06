/**
 * 전체 작성형 판정(executeCodeWrite) — Node worker_threads 엔진으로 실제 실행(Sprint 13).
 * /playground 예시(PDF 코드 기반) 모범 답안은 통과, 틀린 답·오류·시간 초과는 실패하는지 본다. 판다스 예시는 engine.pandas.test.ts.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { codeWriteCore, type CodeWriteQ } from "@/lib/qtypes/codeWrite";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import { DS_CODE_WRITE_PYTHON } from "@/lib/qtypes/fixtures";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { executeCodeWrite, type EngineManifest } from "./codeWriteRun";
import { createNodeEngineClient } from "./nodeClient";

const manifestPath = path.resolve(import.meta.dirname, "../../public/engine/manifest.json");
const ready = existsSync(manifestPath);
const manifest: EngineManifest = ready ? JSON.parse(readFileSync(manifestPath, "utf8")) : (null as never);
const byId = (id: string) => dsPlaygroundQuestions().find((q) => q.id === id) as CodeWriteQ;

describe("code-write 핵심 규칙(엔진 없이)", () => {
  const q = DS_CODE_WRITE_PYTHON as CodeWriteQ;
  it("지금 입력칸으로 실행한 결과가 있어야 제출 가능, 통과한 실행만 1점", () => {
    expect(codeWriteCore.isComplete(q, { source: "x", run: null })).toBe(false);
    const run = { input: "x", status: "done" as const, passed: true, quotesFixed: false };
    expect(codeWriteCore.isComplete(q, { source: "x", run })).toBe(true);
    expect(codeWriteCore.isComplete(q, { source: "x2", run })).toBe(false); // 실행 뒤 코드를 바꿈
    expect(gradeQuestion(q, { source: "x", run }).score).toBe(1);
    expect(gradeQuestion(q, { source: "x", run: { ...run, passed: false } }).score).toBe(0);
  });
  it("엔진을 쓸 수 없던 실행(unavailable)은 제출할 수 없다 → 기록에 남지 않음", () => {
    expect(codeWriteCore.isComplete(q, { source: "x", run: { input: "x", status: "unavailable", passed: false, quotesFixed: false } })).toBe(false);
  });
  it("데이터 검증: 예시는 통과, 설정 누락·굽은 따옴표·판다스 단독은 오류", () => {
    for (const s of dsPlaygroundQuestions().filter((x) => x.type === "code-write")) expect(codeWriteCore.validate(s as CodeWriteQ), s.id).toEqual([]);
    expect(codeWriteCore.validate({ ...q, python: undefined })).not.toEqual([]);
    expect(codeWriteCore.validate({ ...q, solution: "print(‘x’)" })).not.toEqual([]);
    expect(codeWriteCore.validate({ ...q, python: { packages: ["pandas"] } })).not.toEqual([]);
    const sql = byId("data-science-lec5-demo-code-write-001");
    expect(codeWriteCore.validate({ ...sql, sql: { setup: "nope" as never, mode: "select" } })).not.toEqual([]);
    expect(codeWriteCore.validate({ ...sql, sql: { setup: "firstDB", mode: "tables" } })).not.toEqual([]);
  });
});

describe.skipIf(!ready)("code-write 실행 판정(Node 엔진)", () => {
  const client = createNodeEngineClient();
  afterAll(() => client.reset());
  const exec = (q: CodeWriteQ, src: string) => executeCodeWrite(client, manifest, q, src);

  it("Python: 모범 답안 통과, 반환 대신 출력만 하면 값 검사 실패, 출력이 다르면 실패", async () => {
    const q = DS_CODE_WRITE_PYTHON as CodeWriteQ;
    expect((await exec(q, q.solution)).passed).toBe(true);
    const printOnly = "def sum_list_r(a):\n    j = 0\n    for i in a:\n        j = j + i\n    print(j)\n\nlist_a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nsum_list_r(list_a)";
    const r = await exec(q, printOnly);
    expect(r.passed).toBe(false);
    expect(r.reason).toMatch(/출력|값 검사/);
    const wrong = await exec(q, q.solution.replace("print(sum_list_r(list_a))", "print(sum_list_r(list_a) + 1)"));
    expect(wrong).toMatchObject({ passed: false, reason: "출력이 기대 결과와 다릅니다", mine: { stdout: "56\n" }, expected: { stdout: "55\n" } });
  }, 60_000);

  it("들여쓰기 칸 수는 일관되면 상관없음(1칸·2칸도 정답), 줄 끝 공백은 무시", async () => {
    const q = DS_CODE_WRITE_PYTHON as CodeWriteQ;
    const one = "def sum_list_r(a):\n j = 0\n for i in a:\n  j = j + i\n return j\nlist_a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nprint(sum_list_r(list_a))   ";
    expect((await exec(q, one)).passed).toBe(true);
  }, 60_000);

  it("오류는 메시지·줄 번호와 함께 실패, 굽은 따옴표는 바꿔 실행(quotesFixed)", async () => {
    const q = DS_CODE_WRITE_PYTHON as CodeWriteQ;
    const syntax = await exec(q, "def sum_list_r(a)\n    return sum(a)\nprint(sum_list_r([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))");
    expect(syntax).toMatchObject({ passed: false, reason: "실행 중 오류" });
    expect(syntax.mine?.error).toBe("SyntaxError: expected ':' (1번째 줄)");
    const curly = await exec(q, "def sum_list_r(a):\n    return sum(a)\nprint(sum_list_r([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))\n#‘끝’");
    expect(curly).toMatchObject({ passed: true, quotesFixed: true });
  }, 60_000);

  it("시간 초과는 오답(timeout), 다음 실행은 정상", async () => {
    const q = DS_CODE_WRITE_PYTHON as CodeWriteQ;
    const t = await exec(q, "while True:\n    pass");
    expect(t).toMatchObject({ status: "timeout", passed: false });
    expect((await exec(q, q.solution)).passed).toBe(true);
  }, 90_000);

  it("넘파이: [코드 6-10] 모범 답안 통과, 얕은 복사(c = a)는 원본이 바뀌어 실패", async () => {
    const q = byId("data-science-lec6-demo-code-write-001");
    expect((await exec(q, q.solution)).passed).toBe(true);
    const shallow = await exec(q, q.solution.replace("c = a.copy( )", "c = a"));
    expect(shallow.passed).toBe(false);
  }, 60_000);

  it("SQL: [코드 5-9] 통과, 행 순서 무시, # 주석 허용, 조건 하나 빠지면 실패, 문법 오류 메시지", async () => {
    const q = byId("data-science-lec5-demo-code-write-001");
    expect((await exec(q, q.solution)).passed).toBe(true);
    expect((await exec(q, "#c1이면서 A\nselect 학번 from 수강 where 학점='A' and 과목번호='c1';")).passed).toBe(true);
    const missing = await exec(q, "SELECT 학번 FROM 수강 WHERE 과목번호 = 'c1';");
    expect(missing).toMatchObject({ passed: false, reason: expect.stringContaining("결과 표") });
    const err = await exec(q, "SELECT 학번 FROM 수강 WHERE;");
    expect(err).toMatchObject({ passed: false, reason: "실행 중 오류" });
    expect(err.mine?.error).toMatch(/syntax error/);
  }, 60_000);

  it("SQL tables 모드: UPDATE 후 테이블 상태 비교", async () => {
    const q: CodeWriteQ = {
      ...byId("data-science-lec5-demo-code-write-001"),
      id: "data-science-lec5-demo-code-write-099",
      solution: "UPDATE 학생 SET 이름 = '홍길수' WHERE 학번 = 's1';",
      sql: { setup: "firstDB", mode: "tables", tables: ["학생"] },
    };
    expect((await exec(q, "update 학생 set 이름='홍길수' where 이름='홍길동';")).passed).toBe(true);
    expect((await exec(q, "UPDATE 학생 SET 이름 = '홍길수';")).passed).toBe(false);
  }, 60_000);
});

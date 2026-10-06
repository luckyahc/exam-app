/**
 * 실행 엔진 테스트(Sprint 13): Node에서 Pyodide·sql.js를 worker_threads로 띄워 브라우저와 같은 메시지 약속으로 실행한다.
 * 엔진 파일은 `npm test` 앞의 pretest(scripts/prepare-engine.mjs)가 public/engine/에 준비한다.
 * 판다스(불러오기+import 약 12초)는 engine.pandas.test.ts로 나눴다.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { normalizeStdout, sameTable } from "./compare";
import { makeGuardedFetch, NETWORK_BLOCKED_MESSAGE, removeNetworkGlobals } from "./runtime/networkGuard.js";
import { createNodeEngineClient } from "./nodeClient";
import type { PythonRunResult, SqlRunResult } from "./protocol";
import { hashCommentsToDashes } from "./runtime/sqlRuntime.js";
import { FIRST_DB_SETUP } from "@/lib/qtypes/dsSchemas";

const manifestPath = path.resolve(import.meta.dirname, "../../public/engine/manifest.json");
const ready = existsSync(manifestPath);
const manifest = ready ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;

describe("# 주석 변환(문자열 밖만)", () => {
  it("줄 주석·끝 주석은 --, 문자열·따옴표 이름 안의 #는 그대로", () => {
    expect(hashCommentsToDashes("#학생 테이블\nSELECT 1;")).toBe("--학생 테이블\nSELECT 1;");
    expect(hashCommentsToDashes("SELECT '#1', \"a#b\", `c#d` FROM t # 끝 주석")).toBe("SELECT '#1', \"a#b\", `c#d` FROM t -- 끝 주석");
    expect(hashCommentsToDashes("SELECT 'it''s #x' -- 이미 # 주석")).toBe("SELECT 'it''s #x' -- 이미 # 주석");
    expect(hashCommentsToDashes("/* # 블록 */ SELECT 1")).toBe("/* # 블록 */ SELECT 1");
  });
});

describe("출력·결과 표 비교", () => {
  it("줄 끝 공백과 마지막 줄바꿈만 무시", () => {
    expect(normalizeStdout("a  \nb\t\n")).toBe(normalizeStdout("a\nb"));
    expect(normalizeStdout("a\n\nb")).not.toBe(normalizeStdout("a\nb")); // 빈 줄은 다름
    expect(normalizeStdout(" a")).not.toBe(normalizeStdout("a")); // 줄 앞 공백은 다름
    expect(normalizeStdout("A")).not.toBe(normalizeStdout("a"));
  });
  it("행 순서는 무시(다중집합), orderMatters면 순서까지, 열 이름은 compareColumns일 때만", () => {
    const a = { columns: ["학번"], rows: [["s1"], ["s4"], ["s1"]] };
    const b = { columns: ["x"], rows: [["s1"], ["s1"], ["s4"]] };
    expect(sameTable(a, b)).toBe(true);
    expect(sameTable(a, b, { orderMatters: true })).toBe(false);
    expect(sameTable(a, b, { compareColumns: true })).toBe(false);
    expect(sameTable(a, { columns: ["학번"], rows: [["s1"], ["s4"]] })).toBe(false); // 중복 개수도 본다
    expect(sameTable({ columns: ["n"], rows: [[1]] }, { columns: ["n"], rows: [[1.0]] })).toBe(true);
  });
});

describe.skipIf(!ready)("엔진(Node worker_threads + Pyodide·sql.js)", () => {
  const client = createNodeEngineClient();
  const py = () => ({ base: manifest.pyodide.base, wheels: manifest.openpyxlWheels, packages: [] as ("numpy" | "pandas")[] });
  afterAll(() => client.reset());
  beforeAll(async () => {
    const r = await client.preparePython(py().base, py().wheels, []);
    expect(r.ok).toBe(true);
  }, 60_000);

  const runPy = async (code: string, extra: Partial<{ setup: string; checks: string[]; packages: ("numpy" | "pandas")[] }> = {}, timeoutMs?: number) =>
    client.runPython({ ...py(), code, ...extra }, timeoutMs);
  const done = <R>(o: Awaited<ReturnType<typeof client.runPython>> | Awaited<ReturnType<typeof client.runSql>>) => {
    if (o.status !== "done") throw new Error(`실행 실패: ${o.status}`);
    return o.result as R;
  };

  it("정상 실행: 표준 출력(슬라이드 [코드 2-13] 구구단)", async () => {
    const r = done<PythonRunResult>(await runPy("a = 5\nfor i in range(1,10):\n print(str(a) + ' X ' + str(i) + ' = ' + str(i*a))"));
    expect(r.error).toBeNull();
    expect(r.stdout.split("\n")[8]).toBe("5 X 9 = 45");
  });

  it("오류 메시지: 콜론 누락 → SyntaxError와 줄 번호, 0으로 나누기 → ZeroDivisionError(그 전 출력은 남김)", async () => {
    const s = done<PythonRunResult>(await runPy("a = 3\nif a == 5:\n    print(1)\nelse\n    print(2)"));
    expect(s.error).toMatchObject({ type: "SyntaxError", message: "SyntaxError: expected ':'", line: 4 });
    const z = done<PythonRunResult>(await runPy("print('x')\n1/0"));
    expect(z.stdout).toBe("x\n");
    expect(z.error?.type).toBe("ZeroDivisionError");
  });

  it("변수 값 검사(checks)와 준비 코드(setup), 실행마다 새 이름 공간", async () => {
    const r = done<PythonRunResult>(await runPy("def sum_list_r(a):\n    j = 0\n    for i in a:\n        j = j + i\n    return j", { checks: ["sum_list_r([1, 2, 3]) == 6", "sum_list_r([]) == 1"] }));
    expect(r.checks.map((c) => c.pass)).toEqual([true, false]);
    const again = done<PythonRunResult>(await runPy("print('sum_list_r' in dir())"));
    expect(again.stdout.trim()).toBe("False");
    const f = done<PythonRunResult>(await runPy("import csv\nf = open('a.csv', encoding='cp949')\nprint(list(csv.reader(f)))", { setup: "open('a.csv','w',encoding='cp949').write('이름,국어\\n철수,100\\n')" }));
    expect(f.stdout.trim()).toBe("[['이름', '국어'], ['철수', '100']]");
  });

  it("input()은 금지 — 안내 메시지와 함께 RuntimeError", async () => {
    const r = done<PythonRunResult>(await runPy("x = input('수: ')"));
    expect(r.error?.type).toBe("RuntimeError");
    expect(r.error?.message).toContain("input()은 쓸 수 없습니다");
  });

  it("openpyxl(기본에 포함)", async () => {
    const r = done<PythonRunResult>(await runPy("import openpyxl\nwb = openpyxl.Workbook()\nwb.create_sheet('Sheet2')\nprint(wb.sheetnames)"));
    expect(r.error, JSON.stringify(r)).toBeNull();
    expect(r.stdout.trim()).toBe("['Sheet', 'Sheet2']");
  });

  it("출력 길이 제한: 넘으면 잘라 내고 truncated", async () => {
    const r = done<PythonRunResult>(await runPy("for i in range(100000):\n    print('0123456789')"));
    expect(r.truncated).toBe(true);
    expect(r.stdout.length).toBeLessThanOrEqual(20000);
  });

  it("시간 초과: 무한 루프는 제한 시간 뒤 Worker를 종료하고 timeout, 그다음 실행은 엔진을 다시 띄워 정상", async () => {
    const t0 = Date.now();
    const o = await runPy("while True:\n    pass", {}, 1500);
    expect(o.status).toBe("timeout");
    expect(Date.now() - t0).toBeLessThan(15000);
    expect(client.loaded.python).toBe(false);
    const r = done<PythonRunResult>(await runPy("print(1+1)"));
    expect(r.stdout).toBe("2\n");
  }, 90_000);

  it("넘파이는 필요할 때만 불러온다(Pyodide는 기본 정수 int32 — ds-source-analysis §4-3)", async () => {
    expect(client.loaded.packages.has("numpy")).toBe(false);
    const r = done<PythonRunResult>(await runPy("import numpy as np\na = np.arange(6)\nc = a.copy()\nc[0] = 20\nprint('A: ', a)\nprint('C: ', c)\nprint(a.dtype)", { packages: ["numpy"] }));
    expect(r.stdout).toBe("A:  [0 1 2 3 4 5]\nC:  [20  1  2  3  4  5]\nint32\n");
    expect(client.loaded.packages.has("numpy")).toBe(true);
  }, 60_000);

  it("SQL: firstDB 위 SELECT, 행 순서 무시 비교(MySQL 순서와 달라도 같음), # 주석 변환", async () => {
    const run = async (code: string, tables?: string[]) => done<SqlRunResult>(await client.runSql({ base: manifest.sqljs.base, setup: FIRST_DB_SETUP, code, tables }));
    const mine = await run("#수강 테이블의 학번\nSELECT 학번 FROM 수강;");
    expect(mine.error).toBeNull();
    // MySQL 슬라이드 결과 순서(s.50): s1 s4 s5 s1 s2 s2 s4
    expect(sameTable(mine.result, { columns: ["학번"], rows: [["s1"], ["s4"], ["s5"], ["s1"], ["s2"], ["s2"], ["s4"]] })).toBe(true);
    const grouped = await run('SELECT 학번, COUNT(*) AS "수강 과목의 개수" FROM 수강 GROUP BY 학번;');
    expect(grouped.result?.rows).toEqual([["s1", 2], ["s2", 2], ["s4", 2], ["s5", 1]]);
  });

  it("SQL: UPDATE·DELETE는 실행 후 테이블 상태, 외래키 위반은 오류(문구는 SQLite)", async () => {
    const run = async (code: string, tables?: string[]) => done<SqlRunResult>(await client.runSql({ base: manifest.sqljs.base, setup: FIRST_DB_SETUP, code, tables }));
    const up = await run("UPDATE 학생 SET 이름 = '홍길수' WHERE 학번 = 's1';", ["학생"]);
    expect(up.tables["학생"]?.rows.find((r) => r[0] === "s1")?.[1]).toBe("홍길수");
    const fk = await run("DELETE FROM 학생 WHERE 학번 = 's1';", ["학생"]);
    expect(fk.error).toMatch(/FOREIGN KEY/);
    expect(fk.tables["학생"]?.rows.length).toBe(5);
    const syntax = await run("SELEC * FROM 학생;");
    expect(syntax.error).toMatch(/syntax error/);
  });

});

describe("네트워크 차단(Worker의 fetch 감싸기)", () => {
  const calls: string[] = [];
  const real = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response("ok");
  }) as typeof fetch;
  let running = false;
  const guarded = makeGuardedFetch(real, "https://app.example/quiz", () => running);
  it("엔진 파일(같은 출처 /engine/)만 허용, 다른 출처·다른 경로는 거부", async () => {
    await expect(guarded("/engine/pyodide-314.0.7/numpy.whl")).resolves.toBeInstanceOf(Response);
    await expect(guarded("https://evil.example/x")).rejects.toThrow(NETWORK_BLOCKED_MESSAGE);
    await expect(guarded("/api/secret")).rejects.toThrow(NETWORK_BLOCKED_MESSAGE);
    expect(calls).toEqual(["/engine/pyodide-314.0.7/numpy.whl"]);
  });
  it("사용자 코드 실행 중에는 엔진 파일도 거부", async () => {
    running = true;
    await expect(guarded("/engine/pyodide-314.0.7/numpy.whl")).rejects.toThrow(NETWORK_BLOCKED_MESSAGE);
    running = false;
  });
  it("XMLHttpRequest·WebSocket·EventSource를 없앤다", () => {
    const scope = { XMLHttpRequest: class {}, WebSocket: class {}, EventSource: class {} } as Record<string, unknown>;
    removeNetworkGlobals(scope);
    expect(scope.XMLHttpRequest).toBeUndefined();
    expect(scope.WebSocket).toBeUndefined();
    expect(scope.EventSource).toBeUndefined();
  });
});

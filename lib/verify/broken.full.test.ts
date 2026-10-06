/**
 * 일부러 틀린 데이터로 실행 검증이 실패하는지 확인(Sprint 14). playground 예시를 복사해 한 군데씩 망가뜨린다.
 * 각 경우의 실패 메시지(일부)를 고정한다 — 메시지는 작성자가 무엇을 고칠지 알 수 있어야 한다.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { CodeBlankQ } from "@/lib/qtypes/codeBlank";
import type { CodeWriteQ } from "@/lib/qtypes/codeWrite";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import type { McqQ } from "@/lib/qtypes/mcq";
import type { Question } from "@/lib/qtypes/registry";
import { FULL_SEEDS, createVerifyEnv, engineReady, verifyQuestion } from "./run";
import { screenLines } from "./rules";

const pg = <T,>(id: string) => structuredClone(dsPlaygroundQuestions().find((q) => q.id === id)) as T;
const WHILE = "data-science-lec2-demo-code-blank-002";
/** Lec2 s.17 [코드 2-10] 슬라이드 그대로(2번째 줄 빈 줄 보존, 1칸 들여쓰기, 12번째 줄 else 뒤 콜론 없음) */
const SLIDE_2_10 = ["a = 5", "", "if a == 5:", " print('Right!')", " print('a is 5')", "else :", " print('a is not 5')", "a = 3", "if a == 5:", " print('Right!')", " print('a is 5')", "else", " print('a is not 5')"].join("\n");

describe.skipIf(!engineReady())("일부러 틀린 데이터는 실패한다", () => {
  const env = engineReady() ? createVerifyEnv({ hashSeeds: FULL_SEEDS }) : (null as never);
  afterAll(() => env?.close());
  const problems = async (q: unknown) => (await verifyQuestion(env, q as Question)).problems.join("\n");

  it("코드 빈칸: 결과가 다른 허용 답안 / 정답과 같은 오답 예시 / 기록하지 않은 후보", async () => {
    const q = pg<CodeBlankQ>(WHILE);
    q.blanks[0].accept.push("i < 9");
    q.blanks[0].wrong = [];
    q.blanks[1].wrong = ["i = i + 1", "i += 2"];
    q.blanks[1].accept = ["i += 1", "i = 1 + i"];
    const p = await problems(q);
    expect(p).toMatch("0번 빈칸 accept 'i < 9'가 첫 번째 정답 'i <= 9'과 다른 결과: 출력");
    expect(p).toMatch("1번 빈칸 wrong 'i = i + 1'가 정답과 같은 결과 — 오답 예시가 아니다");
    expect(p).toMatch("1번 빈칸 후보 'i = i + 1'(규칙 aug-to-plain)가 같은 결과 → accept에 추가하세요");
  }, 60_000);

  it("코드 빈칸: 첫 번째 정답으로 채운 코드가 실행되지 않음(SQL)", async () => {
    const q = pg<CodeBlankQ>("data-science-lec5-demo-code-blank-001");
    q.blanks[1].accept = ["GROUP"];
    expect(await problems(q)).toMatch("첫 번째 정답으로 채운 SQL이 실행되지 않음");
  });

  it("전체 작성형: 기대 결과와 다른 모범 답안 / 값 검사 실패 / 실행 오류", async () => {
    const a = pg<CodeWriteQ>("data-science-lec2-demo-code-write-001");
    a.expect = { stdout: "56" };
    expect(await problems(a)).toMatch('모범 답안 출력이 기대 결과(expect.stdout)와 다름 — 기대 "56" / 실제 "55"');
    const b = pg<CodeWriteQ>("data-science-lec2-demo-code-write-001");
    b.solution = b.solution.replace("return j", "print(j)").replace("print(sum_list_r(list_a))", "sum_list_r(list_a)");
    expect(await problems(b)).toMatch("모범 답안이 값 검사를 통과하지 못함: sum_list_r([3, 4]) == 7");
    const c = pg<CodeWriteQ>("data-science-lec2-demo-code-write-001");
    c.solution = c.solution.replace("def sum_list_r(a):", "def sum_list_r(a)");
    expect(await problems(c)).toMatch("모범 답안 실행 오류: SyntaxError: expected ':' (1번째 줄)");
  }, 60_000);

  it("전체 작성형 SQL: 기대 결과 표와 다름", async () => {
    const q = pg<CodeWriteQ>("data-science-lec5-demo-code-write-001");
    q.expect = { rows: [["s1"], ["s4"]] };
    expect(await problems(q)).toMatch('모범 답안 결과 표가 기대 결과(expect.rows)와 다름 — 기대 [["s1"],["s4"]] / 실제 [["s1"]]');
  });

  it("코드 출력 고르기: 정답 보기가 실제 출력과 다름 · 오답 보기가 실제 출력과 같음", async () => {
    const q = pg<McqQ>("data-science-lec2-demo-mcq-001");
    q.answerIndex = 1;
    const p = await problems(q);
    expect(p).toMatch("정답 보기 2 'num :  10 → num :  10'가 실제 출력과 다름");
    expect(p).toMatch("오답 보기 1 'num :  10 → num :  20'가 실제 출력과 같음");
  }, 60_000);

  it("실행마다 달라지는 출력: 세트 순서(해시 시드), 난수", async () => {
    const q = pg<McqQ>("data-science-lec2-demo-mcq-001");
    q.code = { language: "python", source: "s = {'apple', 'banana', 'cherry', 'date', 'egg'}\nprint(s)" };
    q.choices = ["{'apple', 'banana', 'cherry', 'date', 'egg'}", "{'egg'}", "{}", "apple"];
    q.answerIndex = 0;
    expect(await problems(q)).toMatch("실행마다 출력이 달라짐(세트 순서·해시·시간·난수 등) — 출력 문제로 쓸 수 없음");
    q.code = { language: "python", source: "import random\nprint(random.randint(1, 1000000))" };
    expect(await problems(q)).toMatch("실행마다 출력이 달라짐");
  }, 90_000);

  it("오류 문제: [코드 2-10] 콜론 누락은 SyntaxError — 줄 번호는 화면 기준(빈 줄 포함) 12, 종류·줄이 다르면 실패", async () => {
    const q = pg<McqQ>("data-science-lec2-demo-mcq-001");
    q.code = { language: "python", lineNumbers: true, source: SLIDE_2_10 };
    expect(screenLines(SLIDE_2_10)[11]).toBe("else"); // 화면 12번째 줄
    q.verify = { mode: "run", check: { kind: "error", errorType: "SyntaxError", line: 12 } };
    expect(await problems(q)).toBe("");
    q.verify = { mode: "run", check: { kind: "error", errorType: "NameError", line: 11 } };
    const p = await problems(q);
    expect(p).toMatch("실제 오류 종류 SyntaxError ≠ 문항의 NameError");
    expect(p).toMatch("실제 오류 줄 12 ≠ 문항의 11(화면 줄 번호, 빈 줄 포함)");
  }, 60_000);

  it("Pyodide에서만 나오는 출력(int32)은 출력 문제로 쓸 수 없다", async () => {
    const q = pg<McqQ>("data-science-lec2-demo-mcq-001");
    q.code = { language: "python", source: ["import numpy as np", "print(np.arange(3).astype('int32').tolist(), np.int32)"].join("\n") };
    q.verify = { mode: "run", check: { kind: "output" }, python: { packages: ["numpy"] } };
    q.choices = ["[0, 1, 2] <class 'numpy.int32'>", "[0, 1, 2]", "[1, 2, 3]", "[]"];
    q.answerIndex = 0;
    expect(await problems(q)).toMatch("출력에 Pyodide·Colab이 다른 표기 'int32'");
  }, 60_000);

  it("SQL 결과 표 고르기: 정답 보기가 실제 결과와 다르면 실패(행 순서는 무시)", async () => {
    const q = pg<McqQ>("data-science-lec2-demo-mcq-001");
    q.code = { language: "sql", source: "SELECT DISTINCT 학번 FROM 수강;" };
    q.verify = { mode: "run", sql: { setup: "firstDB", mode: "select" }, check: { kind: "output" } };
    q.choices = ["s5 / s4 / s2 / s1", "s1 / s2 / s3 / s4 / s5", "s1 / s1 / s2", "s1"];
    q.answerIndex = 0;
    expect(await problems(q)).toBe(""); // 순서가 달라도 같은 결과
    q.answerIndex = 1;
    expect(await problems(q)).toMatch("정답 보기 2 's1 / s2 / s3 / s4 / s5'가 실제 결과 표와 다름");
  });

  it("실행 제외(skip)인데 실제로 실행되는 코드", async () => {
    const q = pg<McqQ>("data-science-lec2-demo-mcq-001");
    q.verify = { mode: "skip", reason: "셀레니움이라 실행 불가(라고 잘못 표시)" };
    expect(await problems(q)).toMatch("실행 제외(skip)인데 실제로 오류 없이 실행된다");
    // 진짜 실행할 수 없는 코드는 통과
    q.code = { language: "python", source: "from selenium import webdriver\ndriver = webdriver.Chrome()" };
    expect(await problems(q)).toBe("");
  }, 60_000);
});

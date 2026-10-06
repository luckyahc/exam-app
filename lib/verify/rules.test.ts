/**
 * 작성 시 검증 — 실행하지 않는 규칙(Sprint 14). 빠르므로 `npm test`의 최소 검증: 검증 방식 표시·실행 제외 이유·
 * 실행할 수 없는 코드 감지·슬라이드 오류 "(보충)"·후보 규칙.
 */
import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data/subjects/registry";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import type { Question } from "@/lib/qtypes/registry";
import { sameTokens } from "@/lib/qtypes/_shared/codeTokens";
import { CANDIDATE_RULES, blankCandidates } from "./candidates";
import { codeRefs } from "./errata";
import { staticVerifyErrors, verifyMethod } from "./rules";

async function allQuestions(): Promise<Question[]> {
  const out: Question[] = [...QTYPE_FIXTURES, ...dsPlaygroundQuestions()];
  for (const s of SUBJECTS) for (const c of s.chapters) out.push(...(await c.load()));
  return [...new Map(out.map((q) => [q.id, q])).values()];
}

const pg = (id: string) => dsPlaygroundQuestions().find((q) => q.id === id)!;
const MCQ = pg("data-science-lec2-demo-mcq-001");
const WRITE = pg("data-science-lec2-demo-code-write-001");

describe("모든 문항: 검증 방식 규칙", () => {
  it("데이터과학 문항은 규칙 위반 0, 다른 과목은 verify를 쓰지 않는다", async () => {
    const qs = await allQuestions();
    const bad = qs.map((q) => [q.id, staticVerifyErrors(q)] as const).filter(([, e]) => e.length);
    expect(bad).toEqual([]);
  });
  it("검증 방식: 코드 작성·실행 표시 = 실행, skip = 실행 제외, 코드 없음 = 개념", () => {
    expect(verifyMethod(WRITE)).toBe("실행");
    expect(verifyMethod(MCQ)).toBe("실행");
    expect(verifyMethod({ ...MCQ, verify: { mode: "skip", reason: "셀레니움 — 실제 사이트 접속 필요" } } as Question)).toBe("실행 제외");
    expect(verifyMethod({ ...MCQ, code: undefined, verify: undefined } as Question)).toBe("개념");
  });
});

describe("틀린 표시는 실패한다(실행 없이)", () => {
  const errs = (q: unknown) => staticVerifyErrors(q as Question).join("\n");
  it("코드가 있는데 verify 없음 / 출력 고르기에 check 없음 / 실행 제외 이유 없음", () => {
    expect(errs({ ...MCQ, verify: undefined })).toMatch("verify 필수");
    expect(errs({ ...MCQ, verify: { mode: "run" } })).toMatch("verify.check(output|error) 필요");
    expect(errs({ ...MCQ, verify: { mode: "skip", reason: "" } })).toMatch("이유");
  });
  it("셀레니움·Colab·MySQL 전용 코드를 실행(run)으로 표시하면 실행 제외를 요구", () => {
    const sel = { ...MCQ, code: { language: "python", source: "from selenium import webdriver\ndriver = webdriver.Chrome()" } };
    expect(errs(sel)).toMatch("셀레니움");
    const colab = { ...MCQ, code: { language: "python", source: "!pip install openpyxl" } };
    expect(errs(colab)).toMatch("Colab");
    const blankSql = pg("data-science-lec5-demo-code-blank-001");
    expect(errs({ ...blankSql, source: "CREATE DATABASE firstDB;\nUSE firstDB;\nSELECT {{0}}(*) FROM 수강 {{1}} 학번;" })).toMatch("MySQL 서버 전용 문법");
    // 실행 제외로 표시하면 통과(빈칸형)
    expect(errs({ ...blankSql, source: "CREATE DATABASE firstDB;\nUSE firstDB;\nSELECT {{0}}(*) FROM 수강 {{1}} 학번;", verify: { mode: "skip", reason: "MySQL 서버 전용(CREATE DATABASE·USE)" } })).toBe("");
  });
  it("실행 제외 코드로 실행 결과를 묻는 문제는 금지(빈칸형·개념형만)", () => {
    expect(errs({ ...MCQ, verify: { mode: "skip", reason: "MySQL 서버 전용 문법" } })).toMatch("빈칸형·개념형으로만");
  });
  it("code-write: 실행 제외 불가, 기대 결과(expect) 필수", () => {
    expect(errs({ ...WRITE, verify: { mode: "skip", reason: "아무 이유나 적음" } })).toMatch("실행 제외 불가");
    expect(errs({ ...WRITE, expect: undefined })).toMatch("expect.stdout");
  });
  it("슬라이드 오류 목록의 코드: 해설에 (보충)과 다른 점이 있어야 한다", () => {
    const base = { ...MCQ, explanation: "s.17 [코드 2-10]: else 블록." };
    expect(errs(base)).toMatch('"(보충)" 필요');
    expect(errs({ ...base, explanation: "s.17 [코드 2-10]: else 블록. (보충) 슬라이드와 결과가 다르다." })).toMatch("다른 점");
    expect(errs({ ...base, explanation: "s.17 [코드 2-10]: else 블록. (보충) 슬라이드 코드는 두 번째 else 뒤 콜론이 없어 실행되지 않는다." })).toBe("");
    expect(errs({ ...MCQ, explanation: "[코드 6-36]~[코드 6-40] 결과. (보충) 슬라이드 결과는 6-33 이전 값." })).toBe("");
  });
});

describe("허용 답안 후보 규칙", () => {
  const texts = (first: string, lang: "python" | "sql" = "python", authored: string[] = []) => blankCandidates(first, lang, authored).map((c) => `${c.source}:${c.text}`);
  it("파이썬 예: 복합 대입·비교 경계·양변·괄호·교환·range·따옴표·공백", () => {
    expect(texts("a += 1")).toEqual(["aug-to-plain:a = a + 1", "spacing:a+=1"]);
    expect(texts("a = a * 2")).toEqual(["plain-to-aug:a *= 2", "commute:a = 2 * a", "spacing:a=a*2"]);
    expect(texts("i <= 9")).toEqual(["int-bound:i < 10", "mirror:9 >= i", "paren:(i <= 9)", "spacing:i<=9"]);
    expect(texts("(x > 3)")).toEqual(["int-bound:(x >= 4)", "unparen:x > 3", "spacing:(x>3)"]);
    expect(texts("range(0, 5)")).toEqual(["range-zero:range(5)", "spacing:range(0,5)"]);
    expect(texts("'cp949'")).toEqual(["quote-kind:\"cp949\""]);
    expect(texts("x", "python", ["y", "x"])).toEqual(["author:y"]);
    // 연산자만 있는 빈칸·키워드 인자는 감싸거나 뒤집지 않는다(Sprint 15에서 찾은 버그)
    expect(texts("!=")).toEqual([]);
    expect(texts("**")).toEqual([]);
    expect(texts("reverse=True")).toEqual(["spacing:reverse = True"]);
  });
  it("SQL 예: <> ↔ !=, 키워드 대소문자, 경계", () => {
    expect(texts("학점 <> 'A'", "sql")).toEqual(["mirror:'A' <> 학점", "paren:(학점 <> 'A')", "neq-sql:학점 != 'A'", "spacing:학점<>'A'"]);
    expect(texts("GROUP BY", "sql")).toEqual(["sql-case:group by"]);
    expect(texts("시간수 >= 3", "sql")).toContain("int-bound:시간수 > 2");
  });
  it("토큰 비교로 이미 같은 변형(따옴표·공백·SQL 대소문자)은 채점이 이미 같은 답으로 본다", () => {
    expect(sameTokens("'cp949'", '"cp949"', "python")).toBe(true);
    expect(sameTokens("i<=9", "i <= 9", "python")).toBe(true);
    expect(sameTokens("group by", "GROUP BY", "sql")).toBe(true);
  });
  it("규칙 id는 겹치지 않는다", () => {
    expect(new Set(CANDIDATE_RULES.map((r) => r.id)).size).toBe(CANDIDATE_RULES.length);
  });
});

describe("코드 번호 찾기", () => {
  it("[코드 2-10], 범위 [코드 2-26]~[코드 2-28]", () => {
    expect(codeRefs("s.17 [코드 2-10]: …")).toEqual(["2-10"]);
    expect(codeRefs("[코드 2-26]~[코드 2-28]")).toEqual(["2-26", "2-27", "2-28"]);
    expect(codeRefs("[코드 6-27]·[코드 6-29]")).toEqual(["6-27", "6-29"]);
  });
});

describe("기준 실행 환경(Colab)과 화면 줄 번호", () => {
  const errs = (q: unknown) => staticVerifyErrors(q as Question).join("\n");
  it("Pyodide와 결과가 다를 수 있는 코드(dtype·itemsize·nbytes 등)는 출력 문제 금지", () => {
    const q = { ...MCQ, code: { language: "python", source: "import numpy as np\narr = np.array([1, 2])\nprint(arr.dtype)" }, verify: { mode: "run", python: { packages: ["numpy"] }, check: { kind: "output" } } };
    expect(errs(q)).toMatch("Pyodide와 슬라이드(Colab) 결과가 다를 수 있는 출력(.dtype)");
    expect(errs({ ...WRITE, solution: "import sys\nprint(sys.maxsize)" })).toMatch("sys.maxsize");
  });
  it("오류 줄을 묻는 문항: 줄 번호 표시 필수, 빈 줄·범위 밖 줄 금지(화면 줄 = 빈 줄 포함)", () => {
    const code = { language: "python", source: "a = 5\n\nif a == 5\n print(a)" };
    const base = { ...MCQ, code, verify: { mode: "run", check: { kind: "error", errorType: "SyntaxError", line: 3 } } };
    expect(errs(base)).toMatch("code.lineNumbers: true");
    expect(errs({ ...base, code: { ...code, lineNumbers: true } })).toBe("");
    expect(errs({ ...base, code: { ...code, lineNumbers: true }, verify: { ...base.verify, check: { kind: "error", errorType: "SyntaxError", line: 2 } } })).toMatch("빈 줄이거나 범위 밖");
  });
});

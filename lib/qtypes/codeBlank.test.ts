import { describe, expect, it } from "vitest";
import { sameTokens, straightenQuotes, tokenize } from "./_shared/codeTokens";
import { type CodeBlankQ, codeBlankCore, fillCodeBlanks } from "./codeBlank";
import { DS_CODE_BLANK_PYTHON } from "./fixtures";
import { dsPlaygroundQuestions } from "./dsSamples";
import { answerKey } from "./answerKey";
import { gradeQuestion } from "./registry";

const py = DS_CODE_BLANK_PYTHON as CodeBlankQ;
const sql = dsPlaygroundQuestions().find((q) => q.id === "data-science-lec5-demo-code-blank-001") as CodeBlankQ;

describe("토큰화 (codeTokens)", () => {
  it("토큰 사이 공백은 무시하고, 토큰을 붙이거나 나누면 다르다", () => {
    expect(sameTokens("range(1,10)", "range( 1 , 10 )", "python")).toBe(true);
    expect(sameTokens("a not in B", "a  not   in B", "python")).toBe(true);
    expect(sameTokens("not in", "notin", "python")).toBe(false);
    expect(sameTokens("i<=9", "i < = 9", "python")).toBe(false); // <= 는 한 토큰
  });
  it("파이썬: 대소문자 구별, 작은따옴표 = 큰따옴표, 접두사가 다르면 다름", () => {
    expect(sameTokens("print", "Print", "python")).toBe(false);
    expect(sameTokens("'cp949'", '"cp949"', "python")).toBe(true);
    expect(sameTokens("'a'", "r'a'", "python")).toBe(false);
    expect(sameTokens("'''x'''", "'x'", "python")).toBe(true);
  });
  it("SQL: 키워드·함수 이름만 대소문자 무시, 문자열 값은 구별", () => {
    expect(sameTokens("GROUP BY", "group by", "sql")).toBe(true);
    expect(sameTokens("COUNT", "count", "sql")).toBe(true);
    expect(sameTokens("학번 = 's1'", "학번='s1'", "sql")).toBe(true);
    expect(sameTokens("'A'", "'a'", "sql")).toBe(false);
    expect(sameTokens("'it''s'", "'it''s'", "sql")).toBe(true);
  });
  it("닫히지 않은 문자열은 토큰으로 나눌 수 없다(null)", () => {
    expect(tokenize("'abc", "python")).toBeNull();
    expect(tokenize("'abc", "sql")).toBeNull();
    expect(tokenize("print('a')", "python")).toEqual(["print", "(", "STR::a", ")"]);
  });
  it("한글 이름·숫자·주석", () => {
    expect(tokenize("학번 >= 2", "sql")).toEqual(["학번", ">=", "2"]);
    expect(tokenize("x = 1.5e3  # 주석", "python")).toEqual(["x", "=", "1.5e3", "COMMENT:주석"]);
    expect(sameTokens("x # a", "x", "python")).toBe(false); // 주석도 비교한다
  });
  it("굽은 따옴표 → 곧은 따옴표(바꾼 사실도 알려 줌)", () => {
    expect(straightenQuotes("‘cp949’")).toEqual({ text: "'cp949'", changed: true });
    expect(straightenQuotes("“a”")).toEqual({ text: '"a"', changed: true });
    expect(straightenQuotes("'a'")).toEqual({ text: "'a'", changed: false });
  });
});

describe("code-blank 채점 (0/1)", () => {
  it("예시 데이터는 검증을 통과하고 정답 키는 1점", () => {
    for (const q of [py, sql]) {
      expect(codeBlankCore.validate(q)).toEqual([]);
      expect(gradeQuestion(q, answerKey(q))).toMatchObject({ correct: true, score: 1 });
    }
  });
  it("빈칸이 하나라도 틀리면 0점(부분 점수 없음), 칸별 정오는 남긴다", () => {
    const r = codeBlankCore.grade(py, ["range", ""]);
    expect(r).toMatchObject({ correct: false, score: 0, detail: { blanks: [true, false], quotesFixed: false } });
    expect(codeBlankCore.grade(py, ["Range", ":"]).score).toBe(0); // 대소문자
    expect(codeBlankCore.grade(py, ["range", ";"]).score).toBe(0); // 콜론 대신 세미콜론
  });
  it("앞뒤 공백은 무시, SQL 키워드 소문자는 정답", () => {
    expect(codeBlankCore.grade(py, ["  range ", " : "]).score).toBe(1);
    expect(codeBlankCore.grade(sql, ["count", "group  by"]).score).toBe(1);
    expect(codeBlankCore.grade(sql, ["COUNT", "GROUPBY"]).score).toBe(0);
  });
  it("굽은 따옴표는 바꿔서 채점하고 detail.quotesFixed로 알린다", () => {
    const q: CodeBlankQ = { ...py, source: "f = open('characters.csv', 'r', encoding = {{0}})", blanks: [{ accept: ["'cp949'"] }] };
    expect(codeBlankCore.validate(q)).toEqual([]);
    expect(codeBlankCore.grade(q, ["‘cp949’"])).toMatchObject({ score: 1, detail: { quotesFixed: true } });
    expect(codeBlankCore.grade(q, ['"cp949"'])).toMatchObject({ score: 1, detail: { quotesFixed: false } });
  });
  it("모든 칸을 채워야 완성", () => {
    expect(codeBlankCore.isComplete(py, ["range", " "])).toBe(false);
    expect(codeBlankCore.isComplete(py, ["range", ":"])).toBe(true);
  });
  it("fillCodeBlanks: 빈칸 자리에 값을 끼운다", () => {
    expect(fillCodeBlanks(py.source, ["range", ":"]).split("\n")[1]).toBe("for i in range(1,10):");
  });
});

describe("code-blank 데이터 검증", () => {
  const bad = (patch: Partial<CodeBlankQ>) => codeBlankCore.validate({ ...py, ...patch });
  it("빈칸 자리 ↔ blanks 수가 맞아야 한다", () => {
    expect(bad({ blanks: [{ accept: ["range"] }] })).not.toEqual([]);
  });
  it("accept 앞뒤 공백·줄바꿈·굽은 따옴표·토큰화 실패·토큰이 같은 중복 금지", () => {
    expect(bad({ blanks: [{ accept: [" range"] }, { accept: [":"] }] })).toContainEqual(expect.stringContaining("앞뒤 공백"));
    expect(bad({ blanks: [{ accept: ["range"] }, { accept: [":\n"] }] })).not.toEqual([]);
    expect(bad({ blanks: [{ accept: ["‘a’"] }, { accept: [":"] }] })).toContainEqual(expect.stringContaining("굽은 따옴표"));
    expect(bad({ blanks: [{ accept: ["'a"] }, { accept: [":"] }] })).toContainEqual(expect.stringContaining("토큰"));
    expect(bad({ blanks: [{ accept: ["range", "range "] }, { accept: [":"] }] })).not.toEqual([]);
  });
  it("source의 굽은 따옴표·language 오류·code 필드 혼용 금지", () => {
    expect(bad({ source: "print(‘x’) {{0}} {{1}}" })).not.toEqual([]);
    expect(bad({ language: "js" as never })).not.toEqual([]);
    expect(bad({ code: { language: "python", source: "x" } })).not.toEqual([]);
  });
});

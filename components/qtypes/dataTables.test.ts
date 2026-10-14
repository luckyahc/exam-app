import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import dataScience from "@/data/subjects/data-science";
import { questionData, type QuestionData } from "@/lib/qtypes/dataSnapshots";
import { coreFor, gradeQuestion, type Question } from "@/lib/qtypes/registry";
import { DataTables, FOLD_ROWS } from "./DataTables";
import { QuestionRenderer } from "./QuestionRenderer";

const all: Question[] = [];
for (const c of dataScience.chapters) all.push(...(await c.load()));
const byId = (id: string) => all.find((q) => q.id === id)!;
const html = (q: Question, withResult = false) => {
  const answer = coreFor(q).emptyAnswer(q as never);
  return renderToStaticMarkup(createElement(QuestionRenderer, { question: q, answer, onAnswer: () => {}, result: withResult ? gradeQuestion(q, answer as never) : null }));
};

describe("사용 테이블·사용 데이터(지문 아래 표)", () => {
  it("SQL 결과 고르기: 관련 테이블 전체와 열 자료형 — 풀이·결과 화면 모두", () => {
    const q = byId("data-science-lec5-select-003");
    for (const h of [html(q), html(q, true)]) {
      expect(h).toContain('aria-label="사용 테이블"');
      expect(h).toContain("테이블 수강");
      expect(h).toContain("CHAR(2)");
      expect(h).toContain("7행");
      expect(h).not.toContain("테이블 학생");
    }
  });
  it("INSERT·UPDATE·DELETE 문항은 '실행 전 테이블'", () => {
    for (const id of ["data-science-lec5-insert-001", "data-science-lec5-update-002", "data-science-lec5-del-001"]) expect(html(byId(id))).toContain('aria-label="실행 전 테이블"');
  });
  it("준비 SQL을 표시용으로 지정한 개념 문항(del-003)에도 학생·수강 테이블", () => {
    const h = html(byId("data-science-lec5-del-003"));
    expect(h).toContain("테이블 학생");
    expect(h).toContain("테이블 수강");
  });
  it("표가 없는 문항은 그대로(개념 문항·빈 데이터베이스에서 테이블을 만드는 문항)", () => {
    for (const id of ["data-science-lec5-db-002", "data-science-lec5-createtable-001"]) {
      expect(questionData(byId(id))).toBeNull();
      expect(html(byId(id))).not.toContain("<section aria-label=\"사용");
    }
  });
  it("Python: CSV 파일 내용·엑셀 시트 셀·DataFrame(dtype 포함)", () => {
    const csv = html(byId("data-science-lec3-read-002"));
    expect(csv).toContain('aria-label="사용 데이터"');
    expect(csv).toContain("characters.csv");
    expect(csv).toContain("001,뽀로로,파랑색,낚시,펭귄");
    const xl = html(byId("data-science-lec3-xlread-002"));
    expect(xl).toMatch(/시트 (<!-- -->)?Sheet1/);
    expect(xl).toContain("사막여우");
    const df = html(byId("data-science-lec6-query-004"));
    expect(df).toContain("허준호");
    expect(df).toContain("int64");
  });
  it(`${FOLD_ROWS}행을 넘으면 접고 '모두 보기'`, () => {
    const rows = Array.from({ length: 20 }, (_, i) => [`r${i}`]);
    const data: QuestionData = { kind: "sql", before: false, tables: [{ name: "긴표", table: { columns: [{ name: "a" }], rows } }] };
    const h = renderToStaticMarkup(createElement(DataTables, { data }));
    expect(h).toContain("모두 보기 (20행)");
    expect(h).toContain(`r${FOLD_ROWS - 1}<`);
    expect(h).not.toContain(`r${FOLD_ROWS}<`);
  });
});

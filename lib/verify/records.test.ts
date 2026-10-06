/**
 * 대조 기록 `docs/verification/data-science-lecN.md` ↔ 문항 데이터 일치(Sprint 14).
 * 강의마다 표의 id·slideRef·검증 방식·결과 칸과 요약 숫자가 데이터와 같아야 한다. 지금은 문항 0개 — 형식과 검사만.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data/subjects/registry";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import { parseRecord, recordErrors, recordRow } from "./records";

const DS = SUBJECTS.find((s) => s.id === "data-science")!;
const file = (lec: string) => path.resolve(import.meta.dirname, `../../docs/verification/data-science-${lec}.md`);

describe("강의별 대조 기록이 문항 데이터와 같다", () => {
  for (const ch of DS.chapters) {
    it(ch.id, async () => {
      expect(recordErrors(readFileSync(file(ch.id), "utf8"), await ch.load())).toEqual([]);
    });
  }
});

describe("기록 검사가 어긋남을 잡는다(playground 예시로 만든 기록)", () => {
  const qs = dsPlaygroundQuestions();
  const make = (rows: string[], summary: string) =>
    ["# 대조 기록 — 예시", "", summary, "", "| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |", "|---|---|---|---|---|", ...rows, ""].join("\n");
  const rows = qs.map((q, i) => recordRow(q, "통과", i === 2 ? "허용 답안 5개·오답 예시 1개 추가(검증 결과)" : "—"));
  const good = make(rows, `요약: 문항 ${qs.length} · 실행 ${qs.length} · 실행 제외 0 · 개념 0 · 수정 1`);

  it("맞는 기록은 오류 0, 표를 다시 읽을 수 있다", () => {
    expect(recordErrors(good, qs)).toEqual([]);
    expect(parseRecord(good).rows.map((r) => r.id)).toEqual(qs.map((q) => q.id));
  });
  it("요약 숫자가 다르면", () => {
    expect(recordErrors(good.replace(`실행 ${qs.length} ·`, `실행 ${qs.length - 1} ·`), qs)).toContain(`요약 run ${qs.length - 1} ≠ 실제 ${qs.length}`);
    expect(recordErrors(good.replace("수정 1", "수정 0"), qs)).toContain("요약 fixed 0 ≠ 실제 1");
  });
  it("문항이 빠지거나, 데이터에 없는 id, slideRef·검증 방식·결과 칸이 다르면", () => {
    expect(recordErrors(make(rows.slice(1), `요약: 문항 ${qs.length} · 실행 ${qs.length - 1} · 실행 제외 0 · 개념 0 · 수정 1`), qs)).toContain(`${qs[0].id}: 기록 표에 없음`);
    expect(recordErrors(good, qs.slice(1)).join("\n")).toMatch(`${qs[0].id}: 문항 데이터에 없음`);
    expect(recordErrors(good.replace("| Lec2 p.48 |", "| Lec2 p.49 |"), qs).join("\n")).toMatch("slideRef 'Lec2 p.49'");
    expect(recordErrors(good.replace(`${qs[0].slideRef} | 실행 |`, `${qs[0].slideRef} | 개념 |`), qs).join("\n")).toMatch("검증 방식 '개념' ≠ 데이터 '실행'");
    expect(recordErrors(good.replace("| 실행 | 통과 |", "| 실행 | 확인 |"), qs).join("\n")).toMatch("결과 '확인'");
  });
  it("요약 줄·머리글 형식", () => {
    expect(recordErrors(good.replace(/^요약:.*$/m, ""), qs)).toContain("요약 줄이 없음(요약: 문항 N · 실행 N · 실행 제외 N · 개념 N · 수정 N)");
    expect(recordErrors(good.replace("| 수정 내용 |", "| 비고 |"), qs).join("\n")).toMatch("표 머리글");
  });
});

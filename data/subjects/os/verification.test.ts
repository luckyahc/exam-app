import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import os from "./index";

/**
 * OS 문항별 대조 기록(docs/verification/os-*.md)이 실제 문제 데이터와 맞는지 — 전 문항이 한 줄씩, 같은 순서,
 * 요약 '전체'·결과별 숫자 = 표에서 센 값. (데이터 통신 기록은 data-comm/ch01·ch02.test.ts가 검사)
 */

const ROOT = path.resolve(import.meta.dirname, "../../..");
const rowsOf = (file: string) =>
  readFileSync(path.join(ROOT, "docs/verification", file), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^\| \d+ \| `os-/.test(l))
    .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
const summary = (file: string, label: string) => {
  const line = readFileSync(path.join(ROOT, "docs/verification", file), "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`| ${label} | `));
  return Number(line?.split("|")[2]?.trim().split(" ")[0]);
};
const idsOf = async (...chapters: string[]) =>
  (await Promise.all(os.chapters.filter((c) => chapters.includes(c.id)).map((c) => c.load()))).flat().map((q) => q.id);

describe("OS 대조 기록 ↔ 문제 데이터", () => {
  it("os-ch02-ch03.md: id·순서 일치, 요약 숫자 = 표", async () => {
    const f = "os-ch02-ch03.md";
    const rows = rowsOf(f);
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(await idsOf("ch02", "ch03"));
    const result = (k: string) => rows.filter((r) => r[5] === k).length;
    expect(summary(f, "전체")).toBe(rows.length);
    expect(summary(f, "기존 문항 일치")).toBe(result("일치"));
    expect(summary(f, "기존 문항 수정")).toBe(result("수정"));
    expect(summary(f, "신규 문항 일치")).toBe(result("신규·일치"));
    expect(summary(f, "신규 문항 수정")).toBe(result("신규·수정"));
    expect(summary(f, "필기 근거(문항별 확인)")).toBe(rows.filter((r) => r[4].includes("필기")).length);
  });

  it.each(["ch07", "ch08"])("os-%s.md: id·순서 일치, 요약 숫자 = 표", async (ch) => {
    const f = `os-${ch}.md`;
    const rows = rowsOf(f);
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(await idsOf(ch));
    expect(summary(f, "전체")).toBe(rows.length);
    expect(summary(f, "일치")).toBe(rows.filter((r) => r[7] === "일치").length);
    expect(summary(f, "수정")).toBe(rows.filter((r) => r[7] === "수정").length);
    expect(summary(f, "필기 근거(문항별 확인)")).toBe(rows.filter((r) => r[5].includes("필기")).length);
  });
});

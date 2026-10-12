import { describe, expect, it } from "vitest";
import algorithm from "@/data/subjects/algorithm";
import os from "@/data/subjects/os";
import { SUBJECTS } from "@/data/subjects/registry";
import { chapterMeta } from "@/lib/chapterMeta";
import { validateBase } from "@/lib/qtypes/base";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import type { Question } from "@/types/question";
import { explanationSourceLabel, isJokbo, jokboBadge, matchesSource, parseSource } from "./jokbo";
import { listRows, tabCounts, visibleRows } from "./questionList";
import { filterQuestions } from "./session";

// Sprint 18: 문제 분류(족보 / 일반) — 데이터 검증·분류 필터·뱃지 조건·기존 과목 회귀

const base = QTYPE_FIXTURES.find((q) => q.type === "mcq")!;
const general: Question = { ...base, id: "os-ch08-demo-mcq-901", chapter: "ch08" } as Question;
const jokbo = (n: number, over: Partial<Question> = {}): Question =>
  ({
    ...base,
    id: `os-ch08-jokbo-${String(n).padStart(3, "0")}`,
    chapter: "ch08",
    origin: "jokbo",
    jokbo: {
      occurrences: Array.from({ length: n }, (_, i) => ({ file: "23운영체제 중간(심재홍).pdf", number: String(i + 1), term: "2023 중간" })),
      explanationSource: "generated",
      variantGroup: "os-vg-replace-frame",
    },
    ...over,
  }) as Question;

describe("족보 필드 데이터 검증 (validateBase)", () => {
  it("올바른 족보 문항·일반 문항은 오류가 없다", () => {
    expect(validateBase(jokbo(1))).toEqual([]);
    expect(validateBase(jokbo(3))).toEqual([]);
    expect(validateBase(general)).toEqual([]);
  });

  it("occurrences는 1개 이상", () => {
    const q = jokbo(1);
    expect(validateBase({ ...q, jokbo: { ...q.jokbo!, occurrences: [] } }).join()).toMatch(/occurrences는 1개 이상/);
  });

  it("explanationSource 필수(jokbo|generated)", () => {
    const q = jokbo(1);
    const bad = { ...q, jokbo: { occurrences: q.jokbo!.occurrences } } as unknown as Question;
    expect(validateBase(bad).join()).toMatch(/explanationSource/);
  });

  it("variantGroup 형식은 {subject}-vg-{slug}", () => {
    const q = jokbo(1);
    for (const vg of ["replace-frame", "algorithm-vg-partition", "os-vg-", "os-vg-Bad_Name"])
      expect(validateBase({ ...q, jokbo: { ...q.jokbo!, variantGroup: vg } }).join(), vg).toMatch(/variantGroup 형식/);
  });

  it("족보 문항 id는 {subject}-{chapter}-jokbo-NNN", () => {
    expect(validateBase(jokbo(1, { id: "os-ch08-clock-001" })).join()).toMatch(/족보 문항 id/);
    expect(validateBase(jokbo(1, { id: "os-ch08-jokbo-1" })).join()).toMatch(/족보 문항 id/);
  });

  it("origin과 jokbo 필드는 함께 있어야 하고, 일반 문항은 -jokbo- id를 쓰지 않는다", () => {
    expect(validateBase({ ...jokbo(1), origin: undefined }).join()).toMatch(/origin: "jokbo" 필수/);
    expect(validateBase({ ...jokbo(1), jokbo: undefined }).join()).toMatch(/jokbo 필드 필수/);
    expect(validateBase({ ...general, id: "os-ch08-jokbo-001" }).join()).toMatch(/족보 문항만/);
  });
});

describe("분류 필터", () => {
  const pool = [general, jokbo(1), jokbo(2)];

  it("matchesSource·parseSource", () => {
    expect(pool.filter((q) => matchesSource(q, "jokbo")).map((q) => q.id)).toEqual(["os-ch08-jokbo-001", "os-ch08-jokbo-002"]);
    expect(pool.filter((q) => matchesSource(q, "general"))).toEqual([general]);
    expect(pool.filter((q) => matchesSource(q, "all"))).toHaveLength(3);
    expect(pool.filter((q) => matchesSource(q, null))).toHaveLength(3);
    expect([parseSource("jokbo"), parseSource("general"), parseSource("all"), parseSource(null), parseSource("x")]).toEqual(["jokbo", "general", null, null, null]);
  });

  it("퀴즈 문제 고르기(filterQuestions)에 적용된다", () => {
    expect(filterQuestions(pool, { source: "jokbo", seed: "s" }).every(isJokbo)).toBe(true);
    expect(filterQuestions(pool, { source: "general", seed: "s" })).toEqual([general]);
    expect(filterQuestions(pool, { seed: "s" })).toHaveLength(3);
  });

  it("문제 목록 필터·탭 개수에 적용된다", () => {
    const rows = listRows(pool, undefined);
    expect(visibleRows(rows, "all", { source: "jokbo" })).toHaveLength(2);
    expect(visibleRows(rows, "all", { source: "general" })).toHaveLength(1);
    expect(tabCounts(rows, { source: "jokbo" }).unsolved).toBe(2);
    expect(tabCounts(rows, {}).all).toBe(3);
  });
});

describe("뱃지·해설 출처 표시 조건", () => {
  it("일반 문항은 뱃지 없음, 출현 1회 '족보', 2회 이상 '족보 N회'", () => {
    expect(jokboBadge(general)).toBeNull();
    expect(jokboBadge(jokbo(1))).toBe("족보");
    expect(jokboBadge(jokbo(2))).toBe("족보 2회");
    expect(jokboBadge(jokbo(5))).toBe("족보 5회");
  });

  it("해설 출처: 족보 문항만 '족보 해설' / '생성 해설'", () => {
    expect(explanationSourceLabel(general)).toBeNull();
    expect(explanationSourceLabel(jokbo(1))).toBe("생성 해설");
    const q = jokbo(1);
    expect(explanationSourceLabel({ ...q, jokbo: { ...q.jokbo!, explanationSource: "jokbo" } })).toBe("족보 해설");
  });
});

describe("기존 과목 회귀 · 새 과목 등록", () => {
  it("기존 과목(OS·데이터 통신·데이터과학)에는 족보 문항이 없어 분류 '일반' = 전체", async () => {
    for (const s of SUBJECTS.filter((x) => x.id !== "algorithm")) {
      const all = (await Promise.all(s.chapters.map((c) => c.load()))).flat();
      expect(all.filter(isJokbo), s.id).toEqual([]);
      expect(filterQuestions(all, { source: "general", seed: "s" })).toHaveLength(all.length);
    }
  });

  it("챕터 메타: 족보 id 목록과 행의 jokbo 표시(기존 챕터는 비어 있음)", async () => {
    const meta = await chapterMeta(os, os.chapters[0]);
    expect(meta.jokboIds).toEqual([]);
    expect(meta.rows.every((r) => r.jokbo === false)).toBe(true);
  });

  it("알고리즘: 준비 중, 족보 주제 챕터 5개, 문제 0개", async () => {
    expect(algorithm.status).toBe("preparing");
    expect(algorithm.chapters.map((c) => c.id)).toEqual(["analysis", "recurrence", "sorting", "dc", "dp"]);
    for (const c of algorithm.chapters) expect(await c.load(), c.id).toHaveLength(0);
  });

  it("OS Ch09: 기존 4개 챕터 뒤에 준비 중(문제 0개)으로 추가", async () => {
    const ch09 = os.chapters.find((c) => c.id === "ch09")!;
    expect(os.chapters.map((c) => c.id)).toEqual(["ch02", "ch03", "ch07", "ch08", "ch09"]);
    expect(ch09.status).toBe("preparing");
    expect(await ch09.load()).toHaveLength(0);
  });
});

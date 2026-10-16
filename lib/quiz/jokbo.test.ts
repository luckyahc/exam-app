import { describe, expect, it } from "vitest";
import algorithm from "@/data/subjects/algorithm";
import os from "@/data/subjects/os";
import { SUBJECTS } from "@/data/subjects/registry";
import { chapterMeta } from "@/lib/chapterMeta";
import { validateBase } from "@/lib/qtypes/base";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import type { Question } from "@/types/question";
import { exampleBadge, explanationSourceLabel, isExample, isJokbo, jokboBadge, matchesSource, parseSource } from "./jokbo";
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

  it("sourceRef(강의자료 예제 출처, 선택): lecture·label 필수, page는 1 이상 정수 — 없으면 기존 문항 그대로", () => {
    expect(validateBase({ ...general, sourceRef: { lecture: "Ch02", page: 14, label: "Another Example" } })).toEqual([]);
    expect(validateBase({ ...general, sourceRef: { lecture: "", page: 14, label: "x" } }).join()).toMatch(/lecture·label/);
    expect(validateBase({ ...general, sourceRef: { lecture: "Ch02", page: 0, label: "x" } }).join()).toMatch(/page/);
  });

  it("basedOn(족보 유형 생성 문항, 선택): 생성 문항만, 족보 id 1개 이상·중복 없음 — 없으면 기존 문항 그대로", () => {
    expect(validateBase({ ...general, basedOn: ["os-ch08-jokbo-001", "os-ch02-jokbo-010"] })).toEqual([]);
    expect(validateBase({ ...jokbo(1), basedOn: ["os-ch08-jokbo-002"] }).join()).toMatch(/생성 문항만/);
    expect(validateBase({ ...general, basedOn: [] }).join()).toMatch(/1개 이상/);
    expect(validateBase({ ...general, basedOn: ["os-ch08-jokbo-001", "os-ch08-jokbo-001"] }).join()).toMatch(/두 번/);
    for (const id of ["os-ch08-clock-001", "algorithm-dc-jokbo-001", "os-ch08-jokbo-1"]) expect(validateBase({ ...general, basedOn: [id] }).join(), id).toMatch(/basedOn은 'os-/);
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

  it("강의 예제(sourceRef) 분류: 족보·일반과 별도로 고르고 뱃지에 예제 이름·쪽을 적는다", () => {
    const ex = { ...general, id: "os-ch08-ex-001", sourceRef: { lecture: "Ch08", page: 3, label: "Example 8.1" } };
    const qs = [...pool, ex];
    expect(qs.filter((q) => matchesSource(q, "example"))).toEqual([ex]);
    expect(matchesSource(ex, "general")).toBe(true);
    expect(parseSource("example")).toBe("example");
    expect([isExample(ex), isExample(general)]).toEqual([true, false]);
    expect([exampleBadge(ex), exampleBadge(general)]).toEqual(["예제 · Example 8.1 (Ch08 p.3)", null]);
    expect(filterQuestions(qs, { source: "example", seed: "s" })).toEqual([ex]);
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
  it("족보 문항이 없는 과목(데이터 통신·데이터과학)은 분류 '일반' = 전체, OS는 족보 56(Sprint 20)", async () => {
    for (const s of SUBJECTS.filter((x) => x.id !== "algorithm")) {
      const all = (await Promise.all(s.chapters.map((c) => c.load()))).flat();
      const jokboN = all.filter(isJokbo).length;
      expect(jokboN, s.id).toBe(s.id === "os" ? 56 : 0);
      expect(filterQuestions(all, { source: "general", seed: "s" })).toHaveLength(all.length - jokboN);
      expect(filterQuestions(all, { source: "jokbo", seed: "s" })).toHaveLength(jokboN);
    }
  });

  it("챕터 메타: 족보 id 목록과 행의 jokbo 표시(OS Ch02 족보 10)", async () => {
    const meta = await chapterMeta(os, os.chapters[0]);
    expect(meta.jokboIds).toHaveLength(10);
    expect(meta.rows.filter((r) => r.jokbo)).toHaveLength(10);
  });

  it("알고리즘: 족보 주제 챕터 5개, 족보 53 + 일반 13(2026-10-15, 족보에 없던 주제 — dc 4·dp 9) + 족보 유형 생성 40(2026-10-16, analysis 10·recurrence 15·sorting 15)", async () => {
    expect("status" in algorithm).toBe(false);
    expect(algorithm.chapters.map((c) => c.id)).toEqual(["analysis", "recurrence", "sorting", "dc", "dp"]);
    const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
    expect(all.filter(isJokbo)).toHaveLength(53);
    expect(all.filter((q) => !isJokbo(q) && !q.basedOn).map((q) => q.chapter)).toEqual([...Array(4).fill("dc"), ...Array(9).fill("dp")]);
    expect(all.filter((q) => q.basedOn).map((q) => q.chapter)).toEqual([...Array(10).fill("analysis"), ...Array(15).fill("recurrence"), ...Array(15).fill("sorting")]);
  });

  it("OS Ch09: 기존 4개 챕터 뒤에 추가(Sprint 19에 문제를 채우고 준비 중 해제)", async () => {
    const ch09 = os.chapters.find((c) => c.id === "ch09")!;
    expect(os.chapters.map((c) => c.id)).toEqual(["ch02", "ch03", "ch07", "ch08", "ch09"]);
    expect("status" in ch09).toBe(false);
    expect((await ch09.load()).length).toBeGreaterThanOrEqual(ch09.minQuestions);
  });
});

describe("실제 데이터 족보 필터 점검(Sprint 22)", () => {
  // 과목 홈 "족보만 풀기 (N)"·챕터 시작 개수·퀴즈(/quiz?…&source=jokbo)·문제 목록 분류가 모두 같은 문항을 가리킨다
  const expected: Record<string, Record<string, number>> = {
    os: { ch02: 10, ch03: 13, ch07: 14, ch08: 13, ch09: 6 },
    algorithm: { analysis: 9, recurrence: 11, sorting: 12, dc: 6, dp: 15 },
  };
  it.each(SUBJECTS.map((s) => [s.id, s] as const))("%s: 챕터별 족보 수 = 챕터 메타 = 퀴즈 필터 = 문제 목록 필터", async (id, s) => {
    let total = 0;
    for (const c of s.chapters) {
      const qs = await c.load();
      const meta = await chapterMeta(s, c);
      const quiz = filterQuestions(qs, { source: parseSource("jokbo"), shuffle: true, seed: "s22" });
      expect(meta.jokboIds.length, `${id}/${c.id}`).toBe(expected[id]?.[c.id] ?? 0);
      expect(quiz.map((q) => q.id).sort(), `${id}/${c.id}`).toEqual([...meta.jokboIds].sort());
      expect(meta.rows.filter((r) => r.jokbo)).toHaveLength(meta.jokboIds.length);
      const rows = listRows(qs, undefined);
      expect(visibleRows(rows, "all", { source: "jokbo" })).toHaveLength(meta.jokboIds.length);
      expect(visibleRows(rows, "all", { source: "general" })).toHaveLength(qs.length - meta.jokboIds.length);
      // 다른 필터(유형)와 함께 써도 족보만 남는다
      const types = [...new Set(quiz.map((q) => q.type))].slice(0, 1);
      expect(filterQuestions(qs, { source: "jokbo", types, seed: "s22" }).every((q) => isJokbo(q) && types.includes(q.type))).toBe(true);
      total += meta.jokboIds.length;
    }
    expect(total).toBe(Object.values(expected[id] ?? {}).reduce((a, b) => a + b, 0));
  });
});

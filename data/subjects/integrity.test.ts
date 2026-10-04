import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color/contrast";
import { SUBJECTS } from "./registry";

// 전 과목 데이터 무결성. 과목이 레지스트리에 추가되면 자동으로 검사 대상이 된다.
// 문제 단위 검사(id 형식·유형·validate)는 Sprint 3에서 문제 유형 레지스트리와 함께 추가한다.

const ROOT = path.resolve(import.meta.dirname, "../..");
const SUBJECT_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CHAPTER_ID = /^[a-z0-9]+$/;

/** globals.css의 :root(라이트)·.dark(다크) 블록에서 색 토큰을 읽는다 — 테마 색이 바뀌어도 테스트가 따라간다. */
function themeTokens(selector: ":root" | ".dark") {
  const css = readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
  const block =
    new RegExp(`(?:^|\\n)${selector.replace(".", "\\.")} \\{([^}]*)\\}`).exec(css)?.[1] ?? "";
  const get = (name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block)?.[1];
  return { background: get("background"), surface: get("surface") };
}

describe("과목 레지스트리", () => {
  it("과목 id 형식이 맞고 서로 겹치지 않는다", () => {
    const ids = SUBJECTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(SUBJECT_ID);
  });

  it("어떤 과목 id + '-'도 다른 과목 id의 접두사가 아니다 (문제 id 판별 모호성 차단)", () => {
    for (const a of SUBJECTS) {
      for (const b of SUBJECTS) {
        if (a !== b) expect(b.id.startsWith(`${a.id}-`)).toBe(false);
      }
    }
  });

  it.each(SUBJECTS.map((s) => [s.id, s] as const))(
    "%s: 챕터 id 형식·과목 내 유일, 최소 문항 수 > 0",
    (_, s) => {
      expect(s.chapters.length).toBeGreaterThan(0);
      const ids = s.chapters.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const c of s.chapters) {
        expect(c.id).toMatch(CHAPTER_ID);
        expect(c.minQuestions).toBeGreaterThan(0);
        expect(c.title.length).toBeGreaterThan(0);
      }
    },
  );

  // 강의 PDF는 저작권 때문에 저장소에 커밋하지 않는다(.gitignore). 로컬에 source/가 있을 때만 검사하고,
  // 새로 클론한 환경·CI에서는 건너뛴다.
  const hasSources = existsSync(path.join(ROOT, "source"));
  it.skipIf(!hasSources).each(SUBJECTS.map((s) => [s.id, s] as const))(
    "%s: 근거 PDF 폴더가 있고 PDF가 들어 있다 (로컬 전용)",
    (_, s) => {
      const dir = path.join(ROOT, s.sourceDir);
      expect(existsSync(dir)).toBe(true);
      expect(readdirSync(dir).some((f) => f.toLowerCase().endsWith(".pdf"))).toBe(true);
    },
  );

  it.each(SUBJECTS.map((s) => [s.id, s] as const))(
    "%s: 챕터 문제 파일을 불러올 수 있다",
    async (_, s) => {
      for (const c of s.chapters) expect(Array.isArray(await c.load())).toBe(true);
    },
  );

  const light = themeTokens(":root");
  const dark = themeTokens(".dark");
  it("globals.css에서 라이트/다크 배경 토큰을 읽었다", () => {
    for (const v of [light.background, light.surface, dark.background, dark.surface])
      expect(v).toMatch(/^#/);
  });

  it.each(SUBJECTS.map((s) => [s.id, s] as const))(
    "%s: 과목 색 대비 ≥ 4.5:1 (라이트/다크, 배경·카드)",
    (_, s) => {
      for (const bg of [light.background!, light.surface!]) {
        expect(contrastRatio(s.color.light, bg)).toBeGreaterThanOrEqual(4.5);
      }
      for (const bg of [dark.background!, dark.surface!]) {
        expect(contrastRatio(s.color.dark, bg)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});

describe("챕터 최소 문항 수 (Sprint 11 전까지는 경고만)", () => {
  it("현재 문항 수를 보고한다", async () => {
    const short: string[] = [];
    for (const s of SUBJECTS) {
      for (const c of s.chapters) {
        const n = (await c.load()).length;
        if (n < c.minQuestions) short.push(`${s.id}/${c.id} ${n}/${c.minQuestions}`);
      }
    }
    if (short.length) console.warn(`[문항 수 미달 — 콘텐츠 스프린트 전 정상] ${short.join(", ")}`);
    expect(true).toBe(true);
  });
});

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color/contrast";
import { validateBase } from "@/lib/qtypes/base";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import { answerKey } from "@/lib/qtypes/answerKey";
import { coreFor, gradeQuestion, isQType } from "@/lib/qtypes/registry";
import type { Question } from "@/types/question";
import { SUBJECTS } from "./registry";

// 전 과목 데이터 무결성. 과목이 레지스트리에 추가되면 자동으로 검사 대상이 된다.
// 문제 단위 검사: id 형식·유형·validate(Sprint 3), 정답 키 채점 = 1점·문제 내 항목 중복 없음(Sprint 5).

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

/** 한 문제의 무결성 오류 목록 (빈 배열 = 정상) */
function questionErrors(q: Question, subjectId: string, chapterId: string): string[] {
  const e: string[] = [];
  if (q.subject !== subjectId) e.push(`subject '${q.subject}' ≠ 파일 위치 '${subjectId}'`);
  if (q.chapter !== chapterId) e.push(`chapter '${q.chapter}' ≠ 파일 위치 '${chapterId}'`);
  if (!isQType(q.type)) return [...e, `등록되지 않은 유형 '${q.type}' (서술형 금지)`];
  return [...e, ...validateBase(q), ...coreFor(q).validate(q as never)];
}

describe("문제 데이터 (전 과목·전 챕터)", () => {
  it("모든 문제가 공통·유형별 검증을 통과하고 id가 전역 유일하다", async () => {
    const errors: string[] = [];
    const ids = new Map<string, string>();
    for (const s of SUBJECTS) {
      for (const c of s.chapters) {
        for (const q of await c.load()) {
          const where = `${s.id}/${c.id}/${q.id}`;
          for (const msg of questionErrors(q, s.id, c.id)) errors.push(`${where}: ${msg}`);
          if (ids.has(q.id)) errors.push(`${where}: id 중복 (${ids.get(q.id)})`);
          ids.set(q.id, where);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it("모든 문제의 정답 키를 채점하면 정확히 1점(정답)이다", async () => {
    const wrong: string[] = [];
    for (const s of SUBJECTS) {
      for (const c of s.chapters) {
        for (const q of await c.load()) {
          const r = gradeQuestion(q, answerKey(q));
          if (r.score !== 1) wrong.push(`${q.id}: ${r.score}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it("같은 문제 안의 보기·순서 항목·짝 문자열이 서로 겹치지 않는다", async () => {
    const dup: string[] = [];
    const check = (id: string, what: string, xs: readonly string[] | undefined) => {
      if (xs && new Set(xs).size !== xs.length) dup.push(`${id}: ${what}`);
    };
    for (const s of SUBJECTS) {
      for (const c of s.chapters) {
        for (const q of await c.load()) {
          const any = q as {
            choices?: string[];
            items?: (string | { label: string })[];
            pairs?: { left: string; right: string }[];
          };
          check(q.id, "choices", any.choices);
          check(q.id, "items", any.items?.map((x) => (typeof x === "string" ? x : x.label)));
          check(q.id, "pairs.left", any.pairs?.map((p) => p.left));
          check(q.id, "pairs.right", any.pairs?.map((p) => p.right));
        }
      }
    }
    expect(dup).toEqual([]);
  });

  it("유형 미리보기용 더미 문제도 같은 검사를 통과한다 (과목·챕터가 레지스트리에 있음)", () => {
    for (const q of QTYPE_FIXTURES) {
      const subject = SUBJECTS.find((s) => s.id === q.subject);
      expect(subject, q.id).toBeDefined();
      expect(
        subject!.chapters.some((c) => c.id === q.chapter),
        q.id,
      ).toBe(true);
      expect(questionErrors(q, q.subject, q.chapter), q.id).toEqual([]);
    }
  });
});

describe("챕터 최소 문항 수 (Sprint 11부터 실패 조건)", () => {
  // 데이터 통신은 고정 seed 생성기 문항을 포함해 센다(docs/coverage-matrix.md 데이터 통신 절, 2026-10-05 사용자 승인).
  // OS도 같은 방식으로 세지만 정적 문항만으로도 최소를 넘는다.
  // 콘텐츠 작성 전 과목(status: "preparing")은 문제가 0개인 챕터만 건너뛴다 — 문제가 하나라도 들어가면 바로 검사한다.
  it.each(SUBJECTS.flatMap((s) => s.chapters.map((c) => [`${s.id}/${c.id}`, s, c] as const)))("%s: 최소 문항 수 이상", async (_, s, c) => {
    const n = (await c.load()).length;
    if ("status" in s && s.status === "preparing" && n === 0) return;
    expect(n).toBeGreaterThanOrEqual(c.minQuestions);
  });

  it("준비 중 표시(status: preparing)는 문제가 아직 없는 챕터가 있는 과목에만 남아 있다", async () => {
    for (const s of SUBJECTS) {
      if (!("status" in s) || s.status !== "preparing") continue;
      const counts = await Promise.all(s.chapters.map(async (c) => (await c.load()).length));
      expect(counts.some((n) => n === 0), `${s.id}: 모든 챕터에 문제가 있으면 status를 지운다`).toBe(true);
    }
  });
});

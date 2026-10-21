import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import { gradeQuestion } from "@/lib/qtypes/registry";
import type { Question } from "@/types/question";
import { OS_GLOSSARY } from "./glossary";
import { HINT_ITEMS } from "./hints";
import os from "./index";
import { HANDWRITTEN_PAGES, SHORT_ITEMS, SHORT_TERM_IDS } from "./shortAnswer";

// 단답형 핵심 용어 문항(shortAnswer.ts): 용어 사전 정의 → 용어, 인정 답안·대표 오답 채점, 형식, ⭐ 규칙, 용어 단답형과 중복 없음

type Blank = Question & { text: string; blanks: { accept: string[] }[] };
const items = Object.values(SHORT_ITEMS).flat();
const glossary = new Map(OS_GLOSSARY.map((e) => [e.id, e]));

describe("OS 단답형 핵심 용어", async () => {
  const pool = (await Promise.all(os.chapters.map((c) => c.load()))).flat();
  const loaded = new Map(pool.map((q) => [q.id, q]));

  it("장별 문항이 챕터에 실렸고 모두 용어 blank 1칸·생성 문항이다(족보·족보관련 아님)", () => {
    expect(Object.keys(SHORT_ITEMS)).toEqual(["ch02", "ch03", "ch07", "ch08", "ch09"]);
    for (const [chapter, list] of Object.entries(SHORT_ITEMS)) {
      list.forEach((it, i) => {
        const q = it.q as Blank;
        expect(q.id).toBe(`os-${chapter}-short-${String(i + 1).padStart(3, "0")}`);
        expect([q.chapter, q.type, q.topic]).toEqual([chapter, "blank", "용어"]);
        expect(q.blanks).toHaveLength(1);
        expect(q.origin).toBeUndefined();
        expect(q.basedOn).toBeUndefined();
        expect(loaded.has(q.id), q.id).toBe(true);
      });
    }
  });

  it("지문 = 같은 장 용어 사전의 정의, 정답 = 그 용어(정의 문장에 정답 용어가 없다)", () => {
    expect(SHORT_TERM_IDS.size).toBe(items.length);
    for (const { term, q } of items) {
      const e = glossary.get(term)!;
      const b = q as Blank;
      expect(e.chapter, term).toBe(q.chapter);
      expect(q.slideRef).toBe(e.slideRef);
      expect(b.text).toBe(`${e.def} → {{0}}`);
      expect(b.blanks[0].accept[0]).toBe(e.ko);
      expect(normalizeText(e.def!), term).not.toContain(normalizeText(e.ko));
    }
  });

  it("인정 답안은 모두 정답, 대표 오답은 모두 오답으로 채점된다", () => {
    for (const { q, wrong } of items) {
      const b = q as Blank;
      for (const a of b.blanks[0].accept) expect(gradeQuestion(q, [a]).correct, `${q.id}: ${a}`).toBe(true);
      expect(gradeQuestion(q, [` ${b.blanks[0].accept[0].toUpperCase()} `]).correct, q.id).toBe(true);
      expect(wrong.length, q.id).toBeGreaterThan(0);
      for (const w of wrong) {
        expect(b.blanks[0].accept.map(normalizeText), `${q.id}: 오답 ${w}가 인정 답안에 있음`).not.toContain(normalizeText(w));
        expect(gradeQuestion(q, [w]).correct, `${q.id}: ${w}`).toBe(false);
      }
    }
  });

  it("해설 = 정의 → 용어 + 헷갈리기 쉬운 답 1줄 + 근거 줄(장·페이지)", () => {
    for (const { q } of items) {
      const [body, basis, ...rest] = q.explanation.split("\n");
      expect(rest, q.id).toEqual([]);
      expect(body, q.id).toContain("헷갈리기 쉬운 답:");
      expect(basis, q.id).toMatch(new RegExp(`^근거: Ch${q.chapter.slice(2)} p\\.\\d`));
    }
  });

  it("⭐ 규칙: 필기 출제 표시 쪽은 handwritten(+summary), 그 밖에 힌트가 붙은 용어는 exam-hint(용어 사전의 힌트 id — 다른 장 힌트일 수 있음), Ch09는 ⭐ 없음", () => {
    const pages = (ref: string) =>
      [...ref.matchAll(/p\.(\d+)(?:-(\d+))?/g)].flatMap((m) => {
        const [a, b] = [Number(m[1]), Number(m[2] ?? m[1])];
        return Array.from({ length: b - a + 1 }, (_, i) => a + i);
      });
    const hintChapter = new Map(HINT_ITEMS.map((h) => [h.id, h.chapter]));
    for (const { q } of items) {
      const handwritten = pages(q.slideRef).some((p) => HANDWRITTEN_PAGES[q.chapter].includes(p));
      if (handwritten) {
        expect([q.exam, q.examBasis], q.id).toEqual([true, "handwritten"]);
        expect(q.summary?.length, q.id).toBeLessThanOrEqual(120);
      } else if (q.hintIds?.length) expect([q.exam, q.examBasis], q.id).toEqual([true, "exam-hint"]);
      else expect(q.exam, q.id).toBe(false);
      expect(q.hintIds ?? [], q.id).toEqual(glossary.get(items.find((i) => i.q === q)!.term)!.hintIds ?? []);
      for (const h of q.hintIds ?? []) expect(hintChapter.has(h), `${q.id}: ${h}`).toBe(true);
    }
    expect(SHORT_ITEMS.ch09.some((i) => i.q.exam)).toBe(false);
  });

  // 용어 사전에 연결된 기존 blank(linkedQuestionIds)는 지문이 달라 그대로 둔다(같은 지문은 Ch09 처리량 os-ch09-criteria-008 하나)
  it("같은 용어를 묻는 용어 단답형(os-chNN-term-NNN)이 따로 없고, 단답형끼리도 정답이 겹치지 않는다", () => {
    for (const { q } of items) {
      const text = (q as Blank).text;
      expect(pool.filter((x) => x.topic === "용어" && (x as Blank).text === text).map((x) => x.id), q.id).toEqual([q.id]);
    }
    expect(pool.filter((x) => !/-short-/.test(x.id) && items.some((i) => (i.q as Blank).text === (x as Blank).text)).map((x) => x.id)).toEqual(["os-ch09-criteria-008"]);
    const answers = items.map((i) => normalizeText((i.q as Blank).blanks[0].accept[0]));
    expect(new Set(answers).size).toBe(answers.length);
  });
});

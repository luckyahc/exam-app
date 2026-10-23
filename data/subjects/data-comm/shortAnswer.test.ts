import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { filterQuestions } from "@/lib/quiz/session";
import { isShortAnswer, matchesSource } from "@/lib/quiz/jokbo";
import type { Question } from "@/types/question";
import { T as T1 } from "./ch01";
import { T as T2 } from "./ch02";
import dataComm from "./index";
import { SHORT_ITEMS } from "./shortAnswer";

// 단답형 모음(shortAnswer.ts): 형식, 설명에 정답이 없음, 인정 답안·대표 오답 채점, 쓸모없는 내용(연도·사람·강의 속 예시) 없음, 분류 "short"로 풀기

type Blank = Question & { text: string; blanks: { accept: string[] }[] };
const items = Object.values(SHORT_ITEMS).flat();

describe("데이터 통신 단답형 모음", async () => {
  const pool = (await Promise.all(dataComm.chapters.map((c) => c.load()))).flat();
  const loaded = new Map(pool.map((q) => [q.id, q]));

  it("장별로 챕터에 실렸고, 모두 '다음 설명에 해당하는 용어를 쓰시오' + 설명 → 칸 하나", () => {
    for (const [chapter, list] of Object.entries(SHORT_ITEMS)) {
      const topics = Object.values(chapter === "ch01" ? T1 : T2) as string[];
      list.forEach((it, i) => {
        const q = it.q as Blank;
        expect(q.id).toBe(`data-comm-${chapter}-short-${String(i + 1).padStart(3, "0")}`);
        expect([q.chapter, q.type]).toEqual([chapter, "blank"]);
        expect(topics, q.id).toContain(q.topic);
        expect(q.prompt).toBe("다음 설명에 해당하는 용어를 쓰시오(한국어 또는 영어).");
        expect(q.text, q.id).toMatch(/^[^{}]+ → \{\{0\}\}$/);
        expect(q.blanks).toHaveLength(1);
        expect(loaded.get(q.id), q.id).toBe(q);
      });
    }
  });

  it("설명에 정답 용어(한국어·영어·약어)가 그대로 나오지 않고, 설명·정답이 서로 겹치지 않는다", () => {
    for (const { q } of items) {
      const b = q as Blank;
      const def = normalizeText(b.text);
      expect(b.blanks[0].accept.filter((a) => a.length >= 2 && def.includes(normalizeText(a))), q.id).toEqual([]);
    }
    const defs = items.map((i) => (i.q as Blank).text);
    expect(new Set(defs).size).toBe(defs.length);
  });

  it("인정 답안은 모두 정답(띄어쓰기·대소문자 무시), 대표 오답은 오답으로 채점된다", () => {
    for (const { q, wrong } of items) {
      const b = q as Blank;
      for (const a of b.blanks[0].accept) expect(gradeQuestion(q, [a]).correct, `${q.id}: ${a}`).toBe(true);
      expect(gradeQuestion(q, [` ${b.blanks[0].accept[0].toUpperCase()} `]).correct, q.id).toBe(true);
      expect(b.blanks[0].accept.map(normalizeText), `${q.id}: 오답 ${wrong}가 인정 답안에 있음`).not.toContain(normalizeText(wrong));
      expect(gradeQuestion(q, [wrong]).correct, `${q.id}: ${wrong}`).toBe(false);
    }
  });

  it("해설은 's.번호 (p.쪽):'으로 시작하고 slideRef와 같은 슬라이드다", () => {
    for (const { q } of items) {
      const m = /^Ch0[12] s\.(\d+)$/.exec(q.slideRef)!;
      const s = Number(m[1]);
      expect(s >= 2 && s <= (q.chapter === "ch01" ? 44 : 101), q.id).toBe(true);
      expect(q.explanation.startsWith(`s.${s} (p.${Math.ceil(s / 2)}): `), q.id).toBe(true);
    }
  });

  it("쓸모없는 내용은 없다: 연도·사람 이름·강의 속 예시를 묻지 않는다", () => {
    for (const { q } of items) {
      const b = q as Blank;
      expect(b.text + b.blanks[0].accept.join(" "), q.id).not.toMatch(/\d{4}년|년대|Claude|Maria|Ann|Sky Research|Scientific Books/);
    }
  });

  it("분류 '단답형 모음'(short)으로 두 장의 단답형만 골라진다", () => {
    const picked = filterQuestions(pool, { source: "short", shuffle: true, seed: "a" });
    expect(picked).toHaveLength(items.length);
    expect(picked.every(isShortAnswer)).toBe(true);
    expect(pool.filter((q) => matchesSource(q, "short"))).toHaveLength(items.length);
    expect(new Set(picked.map((q) => q.chapter))).toEqual(new Set(["ch01", "ch02"]));
  });
});

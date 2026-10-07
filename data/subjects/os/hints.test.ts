/**
 * OS 시험 힌트·용어 사전 데이터 검사(docs/os-exam-hint.md, docs/os-glossary.md).
 * - 힌트 세부 항목마다 6문항 이상·유형 3종 이상·객관식·순서·짝·단답 중 2종 이상, 순서·대응 항목은 order·match 2개 이상(용어 단답형 제외)
 * - OS mcq 보기 4~5개, 챕터별 영어 단어·약자 문항 8개 이상
 * - 정의가 있는 모든 용어에 연결된 단답형, 그 accept에 영어·약자, 용어 데이터의 slideRef 형식
 */
import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import type { Question } from "@/types/question";
import { defLeaksTerm } from "../glossary";
import { OS_GLOSSARY } from "./glossary";
import { HINT_ITEMS, HINT_LINKS } from "./hints";
import { englishCounts, hintRows, isTermQuestion } from "./hintStats";
import os from "./index";

const all = async () => (await Promise.all(os.chapters.map((c) => c.load()))).flat() as Question[];
const SLIDE = /^Ch0[2378] p\.\d+(-\d+)?$/;

describe("OS 시험 힌트 반영", () => {
  it("연결한 문항 id가 모두 있고, 힌트가 붙은 문항은 ⭐(exam)이다", async () => {
    const qs = await all();
    const ids = new Set(qs.map((q) => q.id));
    expect([...HINT_LINKS.keys()].filter((id) => !ids.has(id))).toEqual([]);
    const known = new Set(HINT_ITEMS.map((h) => h.id));
    expect(qs.filter((q) => q.hintIds?.some((h) => !known.has(h))).map((q) => q.id)).toEqual([]);
    expect(qs.filter((q) => q.hintIds?.length && !q.exam).map((q) => q.id)).toEqual([]);
  });

  it("힌트 세부 항목: 6문항 이상, 유형 3종 이상, mcq·order·match·blank 중 2종 이상, 순서·대응 항목은 order·match 2개 이상(용어 단답형 제외)", async () => {
    const rows = hintRows((await all()).filter((q) => !isTermQuestion(q)));
    expect(rows.filter((r) => r.problems.length).map((r) => `${r.item.id}: ${r.problems.join("; ")}`)).toEqual([]);
  });

  it("OS mcq는 모두 보기 4~5개", async () => {
    const bad = (await all()).filter((q) => q.type === "mcq" && ((q as { choices: string[] }).choices.length < 4 || (q as { choices: string[] }).choices.length > 5));
    expect(bad.map((q) => q.id)).toEqual([]);
  });

  it("챕터마다 영어 단어·약자 문항 8개 이상", async () => {
    const en = englishCounts(await all());
    for (const c of ["ch02", "ch03", "ch07", "ch08"]) expect(en[c] ?? 0, c).toBeGreaterThanOrEqual(8);
  });
});

describe("OS 용어 사전", () => {
  it("id·한국어 용어가 겹치지 않고, slideRef·참고 위치 형식이 맞다", () => {
    const ids = OS_GLOSSARY.map((e) => e.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
    const kos = OS_GLOSSARY.map((e) => normalizeText(e.ko));
    expect(OS_GLOSSARY.filter((e, i) => kos.indexOf(normalizeText(e.ko)) !== i).map((e) => e.ko)).toEqual([]);
    expect(OS_GLOSSARY.filter((e) => !SLIDE.test(e.slideRef) || !e.slideRef.startsWith(`Ch${e.chapter.slice(2)}`)).map((e) => e.id)).toEqual([]);
    expect(OS_GLOSSARY.filter((e) => e.seeAlso?.some((s) => !SLIDE.test(s))).map((e) => e.id)).toEqual([]);
    const known = new Set(HINT_ITEMS.map((h) => h.id));
    expect(OS_GLOSSARY.filter((e) => e.hintIds?.some((h) => !known.has(h))).map((e) => e.id)).toEqual([]);
  });

  it("정의 문장에 정답 용어가 그대로 들어 있지 않다(새로 만드는 용어 단답형)", () => {
    const leaks = OS_GLOSSARY.filter((e) => !e.linkedQuestionIds?.length).map((e) => [e.id, defLeaksTerm(e)] as const).filter(([, l]) => l.length);
    expect(leaks).toEqual([]);
  });

  it("정의가 있는 모든 용어에 단답형이 연결되고, 그 accept에 영어·약자(있으면)가 들어 있다. 정의가 없는 용어는 문제가 없다", async () => {
    const qs = await all();
    const byId = new Map(qs.map((q) => [q.id, q]));
    const terms = qs.filter(isTermQuestion);
    const problems: string[] = [];
    for (const e of OS_GLOSSARY) {
      const linked = e.linkedQuestionIds ?? [];
      const own = terms.filter((q) => (q as { text: string }).text.startsWith(`${e.def} → `));
      if (!e.def) {
        if (linked.length || own.length) problems.push(`${e.id}: 정의 없음인데 문제가 있음`);
        continue;
      }
      const targets = linked.length ? linked.map((id) => byId.get(id)) : own;
      if (!targets.length || targets.some((q) => !q || q.type !== "blank")) {
        problems.push(`${e.id}: 연결된 단답형 없음`);
        continue;
      }
      for (const q of targets as Question[]) {
        const accepts = (q as { blanks: { accept: string[] }[] }).blanks.flatMap((b) => b.accept).map(normalizeText);
        for (const need of [e.en, e.abbr].filter(Boolean) as string[]) if (!accepts.includes(normalizeText(need))) problems.push(`${e.id}: ${q.id} accept에 '${need}' 없음`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("용어 단답형은 topic '용어', 힌트 범위 용어는 ⭐(exam-hint)", async () => {
    const terms = (await all()).filter(isTermQuestion);
    expect(terms.length).toBeGreaterThan(0);
    expect(terms.filter((q) => q.topic !== "용어").map((q) => q.id)).toEqual([]);
    expect(terms.filter((q) => q.hintIds?.length && q.examBasis !== "exam-hint").map((q) => q.id)).toEqual([]);
  });
});

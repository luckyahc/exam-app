import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuestionRenderer } from "@/components/qtypes/QuestionRenderer";
import { uiFor } from "@/components/qtypes/registry";
import { SUBJECTS } from "@/data/subjects/registry";
import { placementGen } from "@/lib/sim/os/generators";
import { choiceOrder } from "./choiceOrder";
import type { McqQ } from "./mcq";
import { mcqCore } from "./mcq";
import type { MultiQ } from "./multi";
import { multiCore } from "./multi";
import { gradeQuestion, type Question } from "./registry";

/**
 * 보기 섞기(Sprint 11). 퀴즈·결과·오답노트·다시 풀기는 모두 같은 QuestionRenderer(Mcq/Multi의 Input·Review)로 그리고,
 * 순서는 문제 id만으로 정해진다. 세션·기록에는 원래 보기 번호가 저장되므로 섞기 전에 저장된 답의 채점은 바뀌지 않는다.
 */

const all: Question[] = [];
for (const s of SUBJECTS) for (const c of s.chapters) all.push(...(await c.load()));
const choiceQs = all.filter((q): q is McqQ | MultiQ => q.type === "mcq" || q.type === "multi");

/** 렌더 결과에서 태그·마크다운 기호를 뺀 글자 */
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const md = (s: string) => s.replace(/\*\*|`/g, "");
const render = (q: Question, answer: unknown, result: ReturnType<typeof gradeQuestion> | null) =>
  plain(renderToStaticMarkup(createElement(QuestionRenderer, { question: q, answer: answer as never, onAnswer: () => {}, result })));
/** 결과·오답노트의 비교 화면만(QuestionRenderer는 결과가 있으면 잠긴 Input도 함께 그리므로 Review를 따로 그린다) */
const renderReview = (q: Question, answer: unknown) =>
  plain(renderToStaticMarkup(createElement(uiFor(q.type).Review as never, { question: q, answer, result: gradeQuestion(q, answer as never) })));
/** 화면에 나온 보기 순서(원래 번호) — 보기 글자가 처음 나오는 위치 순. 지문 뒤부터 찾는다 */
function shownOrder(text: string, q: McqQ | MultiQ, only?: number[]) {
  const p = text.indexOf(md(q.prompt));
  let from = p < 0 ? 0 : p + md(q.prompt).length;
  // 지문 아래 코드 블록(데이터과학)에 보기와 같은 글자(숫자·문자열)가 있으면 그 뒤부터 찾는다
  // (코드 블록은 줄마다 span이라 태그를 뺀 글자에서는 줄이 이어 붙는다)
  if (q.code) {
    const joined = q.code.source.split("\n").join("");
    const c = text.indexOf(joined, from);
    if (c >= 0) from = c + joined.length;
  }
  return (only ?? q.choices.map((_, i) => i))
    .map((i) => [i, text.indexOf(md(q.choices[i]), from)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([i]) => i);
}
/** 다른 보기의 글자를 포함하는 보기가 있으면 위치 비교가 모호하므로 렌더 비교에서 뺀다 */
const distinct = (q: McqQ | MultiQ) =>
  q.choices.every((c, i) => q.choices.every((d, j) => i === j || !md(d).includes(md(c)))) &&
  // 보기 앞의 단축키 번호(1~5)와 같은 한 글자 보기(예: 출력 "3")는 위치로 구분할 수 없다
  !q.choices.some((c) => /^[1-5]$/.test(md(c)));

describe("choiceOrder", () => {
  it(`전 과목 mcq·multi ${choiceQs.length}문항: 원래 보기 번호의 순열이고, 같은 문제(JSON 저장 후 복원 포함)는 항상 같은 순서`, () => {
    expect(choiceQs.length).toBeGreaterThan(150);
    for (const q of choiceQs) {
      const o = choiceOrder(q);
      expect([...o].sort((a, b) => a - b)).toEqual(q.choices.map((_, i) => i));
      expect(choiceOrder(JSON.parse(JSON.stringify(q)))).toEqual(o);
    }
  });
  it("데이터의 정답 위치 편향을 화면에서 줄인다(정답이 화면 첫 보기인 mcq 비율 < 데이터에서 첫 보기인 비율)", () => {
    const mcqs = choiceQs.filter((q): q is McqQ => q.type === "mcq" && q.shuffle !== false);
    const firstInData = mcqs.filter((q) => q.answerIndex === 0).length;
    const firstOnScreen = mcqs.filter((q) => choiceOrder(q)[0] === q.answerIndex).length;
    expect(firstOnScreen).toBeLessThan(firstInData);
  });
  it("shuffle: false면 데이터 순서 그대로", () => {
    const q = { ...choiceQs[0], shuffle: false as const };
    expect(choiceOrder(q)).toEqual(q.choices.map((_, i) => i));
  });
  it("OS 배치 생성기(블록 1~N, 주소 순서)는 shuffle: false", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = placementGen.generate(seed) as McqQ;
      expect(q.shuffle).toBe(false);
      expect(choiceOrder(q)).toEqual(q.choices.map((_, i) => i));
    }
  });
});

describe("화면 순서: 풀이 화면(Input)과 결과·오답노트 화면(Review)이 같은 순서", () => {
  const cases = choiceQs.filter(distinct);
  it("비교 가능한 문항이 90% 이상", () => expect(cases.length).toBeGreaterThan(choiceQs.length * 0.9));
  // 문항마다 따로 — 한 테스트에 170문항 렌더를 몰면 전체 실행 부하에서 5초 제한에 걸린다
  it.each(cases.map((q) => [q.id, q] as const))("%s", (_, q) => {
    const o = choiceOrder(q);
    expect(shownOrder(render(q, q.type === "mcq" ? null : [], null), q), `${q.id} 풀이`).toEqual(o);
    // 결과 화면: 전부 고른 multi는 모든 보기가 보이고, mcq는 정답·내 답 두 줄만 보인다
    if (q.type === "multi") {
      const all = q.choices.map((_, i) => i);
      expect(shownOrder(renderReview(q, all), q), `${q.id} 결과`).toEqual(o);
    } else {
      const mine = o.find((i) => i !== q.answerIndex)!;
      const shown = o.filter((i) => i === mine || i === q.answerIndex);
      expect(shownOrder(renderReview(q, mine), q, shown), `${q.id} 결과`).toEqual(shown);
    }
  });
});

describe("저장된 답의 채점은 섞기와 무관(원래 보기 번호로 저장·채점)", () => {
  it("섞기 전에 저장된 답(원래 번호)도 같은 결과로 채점된다", () => {
    for (const q of choiceQs) {
      if (q.type === "mcq") {
        expect(mcqCore.grade(q, q.answerIndex).correct).toBe(true);
        for (let i = 0; i < q.choices.length; i++) if (i !== q.answerIndex) expect(mcqCore.grade(q, i).correct).toBe(false);
      } else {
        expect(multiCore.grade(q, [...q.answerIndexes]).correct).toBe(true);
      }
    }
  });
  it("숫자키 i(화면 i번째 보기)를 누르면 그 보기의 원래 번호가 답으로 저장된다", () => {
    for (const q of choiceQs) {
      const o = choiceOrder(q);
      for (let pos = 0; pos < o.length; pos++) {
        if (q.type === "mcq") expect(mcqCore.applyChoice!(q, null, pos)).toBe(o[pos]);
        else expect(multiCore.applyChoice!(q, [], pos)).toEqual([o[pos]]);
      }
      if (q.type === "mcq") expect(mcqCore.grade(q, mcqCore.applyChoice!(q, null, o.indexOf(q.answerIndex))).correct).toBe(true);
    }
  });
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ChoiceRow } from "@/components/ui/ChoiceRow";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import { newSession, type QuizMode } from "@/lib/quiz/session";
import { PracticeResult } from "./PracticeResult";
import { PracticeView, type PracticeViewProps } from "./PracticeView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push() {} }) }));

// 기본 화면은 연습 모드·시험 모드가 같은 화면이고, 어느 쪽이든 시험 화면으로 바꿀 수 있다
const qs = (Object.values(QTYPE_FIXTURES) as Question[]).slice(0, 3);

function html(mode: QuizMode, index = 0) {
  const session = { ...newSession(qs, { mode, label: "시험", backHref: "/" }), index };
  const q = qs[index];
  const noop = () => {};
  const props: PracticeViewProps = {
    session,
    q,
    answer: coreFor(q).emptyAnswer(q as never),
    result: null,
    complete: false,
    answeredCount: 0,
    gradedCount: 0,
    remaining: null,
    generating: false,
    setAnswer: noop,
    submit: noop,
    go: noop,
    goTo: noop,
    finish: noop,
    submitAll: noop,
    addSimilar: noop,
    onSwitchView: noop,
  };
  return renderToStaticMarkup(createElement(PracticeView, props));
}

describe("기본 풀이 화면", () => {
  it("두 채점 방식 모두 시험 화면 전환 버튼이 있다", () => {
    expect(html("instant")).toContain("시험 화면");
    expect(html("exam")).toContain("시험 화면");
  });

  it("연습 모드: 확인·건너뛰기", () => {
    const h = html("instant");
    expect(h).toMatch(/>확인</);
    expect(h).toContain("건너뛰기");
  });

  it("시험 모드: 문제별 확인 없이 다음·제출, 마지막 문제는 답안 제출", () => {
    const h = html("exam");
    expect(h).toContain("다음");
    expect(h).toContain("제출");
    expect(h).not.toMatch(/>확인</);
    expect(h).not.toContain("건너뛰기");
    expect(html("exam", qs.length - 1)).toContain("답안 제출");
  });
});

describe("채점된 보기", () => {
  const row = (result: "correct" | "missed") =>
    renderToStaticMarkup(createElement(ChoiceRow, { selected: false, result, children: "보기" }));

  it("놓친 정답은 빨간 점선·빨간 글씨, 맞힌 정답은 초록", () => {
    expect(row("missed")).toContain("border-dashed border-shu");
    expect(row("missed")).toContain("text-shu");
    expect(row("missed")).not.toContain("text-ok");
    expect(row("correct")).toContain("border-ok");
    expect(row("correct")).toContain("text-ok");
  });
});

describe("결과 화면", () => {
  const result = (mode: QuizMode) => {
    const session = newSession(qs, { mode, label: "시험", backHref: "/" });
    session.results = { [qs[0].id]: { correct: true, score: 1 } as never };
    return renderToStaticMarkup(createElement(PracticeResult, { session, questions: new Map(qs.map((q) => [q.id, q])) }));
  };

  it("시험 모드도 같은 화면: 점수·문제별 목록·미응답·오답노트", () => {
    const h = result("exam");
    expect(h).toContain("시험 모드");
    expect(h).toContain("문제별");
    expect(h).toContain("미응답");
    expect(h).toContain("오답노트");
  });

  it("연습 모드에는 시험 모드 표시가 없다", () => {
    expect(result("instant")).not.toContain("시험 모드");
  });
});

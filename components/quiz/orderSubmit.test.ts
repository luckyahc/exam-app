import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import dataComm from "@/data/subjects/data-comm";
import os from "@/data/subjects/os";
import { QuestionRenderer } from "@/components/qtypes/QuestionRenderer";
import { coreFor, type AnyAnswer, type Question } from "@/lib/qtypes/registry";
import type { GradeResult } from "@/lib/qtypes/base";
import { answerForReview, gradeInSession, newSession } from "@/lib/quiz/session";

/**
 * 회귀(Sprint 10에서 발견): 순서 배치를 처음 섞인 배치 그대로 제출하면 답이 세션에 저장되지 않아
 * 결과 화면이 답을 다시 그리다(answer.map) 깨졌다. OS·데이터 통신의 모든 order 문제로 고정한다.
 */

const render = (q: Question, answer: AnyAnswer | undefined, result: GradeResult) =>
  renderToStaticMarkup(createElement(QuestionRenderer, { question: q, answer: answer as never, onAnswer: () => {}, result }));

const orderQs = async () =>
  (await Promise.all([...os.chapters, ...dataComm.chapters].map((c) => c.load()))).flat().filter((q) => q.type === "order");

describe("순서 배치를 손대지 않고 제출 → 결과 화면", async () => {
  const qs = await orderQs();

  it("OS와 데이터 통신 양쪽에 order 문제가 있다", () => {
    expect(qs.some((q) => q.subject === "os")).toBe(true);
    expect(qs.some((q) => q.subject === "data-comm")).toBe(true);
  });

  it.each(qs.map((q) => [q.id, q] as const))("%s", (_, q) => {
    const s = newSession([q], { mode: "instant", label: "t", backHref: "/" });
    const untouched = coreFor(q).emptyAnswer(q as never) as AnyAnswer;
    // 처음 배치가 이미 완성된 답이라 바로 제출할 수 있고, 아직 세션에는 답이 없다
    expect(coreFor(q).isComplete(q as never, untouched as never)).toBe(true);
    expect(s.answers[q.id]).toBeUndefined();

    const { session, result } = gradeInSession(s, q, untouched);
    expect(session.answers[q.id]).toEqual(untouched); // 채점한 답이 저장된다
    expect(session.results[q.id]).toEqual(result);

    // 결과 화면이 쓰는 답으로 다시 그려도 깨지지 않는다
    expect(render(q, answerForReview(session, q), result)).toMatch(/정답|오답/);

    // 예전 세션(결과만 있고 답이 없음)도 빈 답으로 대신 그린다
    const legacy = { ...session, answers: {} };
    expect(answerForReview(legacy, q)).toEqual(untouched);
    expect(() => render(q, answerForReview(legacy, q), result)).not.toThrow();

    // 고치기 전 동작: 답 없이 그리면 깨진다(이 테스트가 막는 오류)
    expect(() => render(q, undefined, result)).toThrow();
  });
});

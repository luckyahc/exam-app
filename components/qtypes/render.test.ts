import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data/subjects/registry";
import { answerKey } from "@/lib/qtypes/answerKey";
import { coreFor, gradeQuestion, type Question } from "@/lib/qtypes/registry";
import { QuestionRenderer } from "./QuestionRenderer";

// 실제 챕터 문제를 Sprint 3 렌더러로 그려 본다(Sprint 5 DoD: 렌더링·채점 시 스키마 오류 없음).
// 풀기 전(빈 답) 화면과, 정답 키로 채점한 결과 화면 두 상태를 전 문항에 대해 확인한다.

const render = (q: Question, answer: unknown, result: ReturnType<typeof gradeQuestion> | null) =>
  renderToStaticMarkup(
    createElement(QuestionRenderer, { question: q, answer: answer as never, onAnswer: () => {}, result }),
  );

const all: Question[] = [];
for (const s of SUBJECTS) for (const c of s.chapters) all.push(...(await c.load()));

describe.skipIf(all.length === 0)("챕터 문제 렌더링 (전 과목·전 챕터)", () => {
  it.each(all.map((q) => [q.id, q] as const))("%s", (_, q) => {
    const blank = render(q, coreFor(q).emptyAnswer(q as never), null);
    expect(blank).toContain(`${q.id}-prompt`);

    const result = gradeQuestion(q, answerKey(q));
    const graded = render(q, answerKey(q), result);
    if (q.type === "essay") {
      // 서술형(자기 채점): 정답/오답 배너 없이 내 답·모범답안·채점 포인트
      expect(result.selfCheck).toBe(true);
      expect(graded).not.toContain(`role="status"`);
      for (const s of ["내 답", "모범답안", "채점 포인트"]) expect(graded).toContain(s);
      return;
    }
    expect(result.score).toBe(1);
    expect(graded).toContain("정답");
  });
});

"use client";

import type { ExamBasis, GradeResult } from "@/lib/qtypes/base";
import { coreFor, type AnyAnswer, type Question } from "@/lib/qtypes/registry";
import { uiFor } from "./registry";
import { ResultBanner, RichText } from "./ui";

const EXAM_LABEL: Record<ExamBasis, string> = {
  handwritten: "교수님 필기",
  "printed-emphasis": "슬라이드 강조",
};

/** ⭐ 시험 포인트 뱃지 — 근거(필기/인쇄 강조)를 텍스트로 구분한다(색 단독 금지). */
export function ExamBadge({ basis }: { basis: ExamBasis }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-primary/60 px-2 py-0.5 text-xs font-medium"
      title={
        basis === "handwritten"
          ? "교수님이 필기로 '시험'이라고 표시한 주제"
          : "슬라이드 본문에 '중요'로 인쇄된 주제"
      }
    >
      <span aria-hidden>⭐</span>
      {EXAM_LABEL[basis]}
    </span>
  );
}

interface Props {
  question: Question;
  answer: AnyAnswer;
  onAnswer(answer: AnyAnswer): void;
  /** 채점 결과. 있으면 입력을 잠그고 비교 화면·해설을 보여 준다 */
  result: GradeResult | null;
}

/** 문제 하나를 그린다. 유형별 분기는 레지스트리 조회로만 한다(switch 없음). */
export function QuestionRenderer({ question, answer, onAnswer, result }: Props) {
  const core = coreFor(question);
  const { Input, Review } = uiFor(question.type);

  return (
    <article className="flex flex-col gap-4" aria-labelledby={`${question.id}-prompt`}>
      <header className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-surface px-2 py-0.5 font-medium">{core.label}</span>
        {question.exam && question.examBasis && <ExamBadge basis={question.examBasis} />}
        <span className="text-muted">
          {question.topic} · 난이도 {"●".repeat(question.difficulty)}
          {"○".repeat(3 - question.difficulty)}
        </span>
      </header>

      <p id={`${question.id}-prompt`} className="text-base leading-relaxed sm:text-lg">
        <RichText text={question.prompt} />
      </p>

      <Input
        question={question as never}
        answer={answer as never}
        onChange={onAnswer as never}
        disabled={result !== null}
      />

      {result && (
        <section aria-label="채점 결과" className="flex flex-col gap-3 border-t border-border pt-4">
          <ResultBanner correct={result.correct} score={result.score} />
          <Review question={question as never} answer={answer as never} result={result as never} />
          <div className="flex flex-col gap-1 rounded-lg bg-surface p-3 text-sm leading-relaxed">
            {question.summary && (
              <p className="font-semibold">
                핵심: <RichText text={question.summary} />
              </p>
            )}
            <p>
              <RichText text={question.explanation} />
            </p>
            <p className="text-xs text-muted">출처: {question.slideRef}</p>
          </div>
        </section>
      )}
    </article>
  );
}

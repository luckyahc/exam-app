"use client";

import type { ExamBasis, GradeResult } from "@/lib/qtypes/base";
import { coreFor, type AnyAnswer, type Question } from "@/lib/qtypes/registry";
import { uiFor } from "./registry";
import { CodeBlock } from "./CodeBlock";
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

/**
 * 핵심 한 줄 요약: 문제에 summary가 있으면 그것, 없으면 해설의 첫 문장(앞의 "p.N:"·"교수님 필기 기준(p.N):" 출처 표기는 뗀다).
 * 너무 길면 120자에서 자른다. 출처(slideRef)는 아래 줄에 따로 보여 준다.
 */
export function keyLine(explanation: string): string {
  let body = explanation.replace(/^(교수님 필기 기준)?\(?p\.[\d\-·, p.]+\)?[:：]\s*/, "");
  // 데이터 통신 해설의 출처 표기 "s.20 (p.10):", "s.28 (p.14)·s.29 (p.15):", "s.5 (p.3) 그림 a. Simplex:" — 짧은 그림 라벨까지 뗀다
  const dc = /^(?:s\.\d+(?:~\d+)?\s*\(p\.\d+(?:~\d+)?\)[·,\s]*)+/.exec(body);
  if (dc) {
    body = body.slice(dc[0].length);
    const colon = body.slice(0, 25).search(/[:：]/);
    if (colon >= 0) body = body.slice(colon + 1).trimStart();
  }
  const first = body.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? body;
  return first.length > 120 ? first.slice(0, 119) + "…" : first;
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

      {/* 지문 아래 코드(code 필드)는 지문과 같은 자리(형제 순서)에 둔다 — 코드가 없는 기존 문항의 트리 위치가
          바뀌면 useId로 만든 SVG id(그래프 화살표 등)가 달라지므로 그대로 유지한다 */}
      {question.code ? (
        <div className="flex flex-col gap-2">
          <p id={`${question.id}-prompt`} className="text-base leading-relaxed sm:text-lg">
            <RichText text={question.prompt} />
          </p>
          <CodeBlock code={question.code.source} language={question.code.language} lineNumbers={question.code.lineNumbers} />
        </div>
      ) : (
        <p id={`${question.id}-prompt`} className="text-base leading-relaxed sm:text-lg">
          <RichText text={question.prompt} />
        </p>
      )}

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
            {/* 핵심 한 줄: summary가 없으면 해설 첫 문장. 해설이 한 문장뿐이면 같은 말을 두 번 보이지 않는다 */}
            {(question.summary ?? keyLine(question.explanation)) !== question.explanation.trim() && (
              <p className="font-semibold">
                핵심: <RichText text={question.summary ?? keyLine(question.explanation)} />
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

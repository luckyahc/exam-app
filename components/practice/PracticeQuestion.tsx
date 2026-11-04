"use client";

import { Check, X } from "lucide-react";
import { CodeBlock } from "@/components/qtypes/CodeBlock";
import { DataTables } from "@/components/qtypes/DataTables";
import {
  EXAM_LABEL,
  ExplanationSource,
  explanationBasis,
  explanationBody,
  keyLine,
  QuestionFigureView,
} from "@/components/qtypes/QuestionRenderer";
import { uiFor } from "@/components/qtypes/registry";
import { RichText } from "@/components/qtypes/ui";
import { Marker } from "@/components/ui/Marker";
import type { GradeResult } from "@/lib/qtypes/base";
import { questionData } from "@/lib/qtypes/dataSnapshots";
import { type AnyAnswer, coreFor, type Question } from "@/lib/qtypes/registry";
import { exampleBadge, jokboBadge, relatedBadge } from "@/lib/quiz/jokbo";
import { PRACTICE_TYPES, PracticeInput } from "./PracticeInputs";

/**
 * 연습 모드의 문제 하나. 지문·코드·표·그림은 기존 부품, 입력은 연습 모드 전용(객관식·복수 선택·OX·빈칸·짝짓기),
 * 그 밖의 유형은 기존 입력과 비교 화면을 그대로 쓴다. 채점 뒤: 정답/오답 한 줄, 오답이면 해설을 바로 펼치고 정답이면 접어 둔다.
 */
export function PracticeQuestion({
  question,
  answer,
  onAnswer,
  result,
  onEnter,
}: {
  question: Question;
  answer: AnyAnswer;
  onAnswer(a: AnyAnswer): void;
  result: GradeResult | null;
  onEnter(): void;
}) {
  const core = coreFor(question);
  const practice = PRACTICE_TYPES.includes(question.type);
  const { Input, Review } = uiFor(question.type);
  const data = questionData(question);
  const badges = [jokboBadge(question), relatedBadge(question), exampleBadge(question)].filter(
    Boolean,
  );

  return (
    <article
      // data-practice: globals.css가 안에 든 공용 부품(코드 블록·표·그림)의 모서리·코드 입력 글자 크기를 연습 모드 규칙으로 맞춘다
      data-practice
      className="flex flex-col gap-5"
      aria-labelledby={`${question.id}-prompt`}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {question.exam && (
          <Marker className="text-sm font-semibold">
            시험 포인트{question.examBasis ? ` · ${EXAM_LABEL[question.examBasis]}` : ""}
          </Marker>
        )}
        <span>{[core.label, question.topic, ...badges].join(" · ")}</span>
      </header>

      <div className="flex flex-col gap-3">
        <p id={`${question.id}-prompt`} className="text-lg leading-relaxed">
          <RichText text={question.prompt} />
        </p>
        {question.code && (
          <CodeBlock
            code={question.code.source}
            language={question.code.language}
            lineNumbers={question.code.lineNumbers}
          />
        )}
        {data && <DataTables data={data} />}
      </div>

      <QuestionFigureView question={question} />

      {practice ? (
        <PracticeInput
          question={question as never}
          answer={answer as never}
          onChange={onAnswer as never}
          result={result}
          onEnter={onEnter}
        />
      ) : (
        <Input
          question={question as never}
          answer={answer as never}
          onChange={onAnswer as never}
          disabled={result !== null}
        />
      )}

      {result && (
        <section aria-label="채점 결과" className="flex flex-col gap-4">
          {result.selfCheck ? (
            <p role="status" className="text-xl font-bold">
              제출함
            </p>
          ) : (
            <Verdict correct={result.correct} score={result.score} />
          )}
          {/* 연습 모드 입력이 없는 유형은 기존 비교 화면(내 답 vs 정답) */}
          {!practice && (
            <Review
              question={question as never}
              answer={answer as never}
              result={result as never}
            />
          )}
          {result.correct ? (
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold [&::-webkit-details-marker]:hidden">
                해설 보기
              </summary>
              <Explanation question={question} />
            </details>
          ) : (
            <Explanation question={question} />
          )}
        </section>
      )}
    </article>
  );
}

/** 정답/오답 한 줄(아이콘 + 글자, 색 단독 금지). 부분 점수는 오답일 때만 작게 */
function Verdict({ correct, score }: { correct: boolean; score: number }) {
  return (
    <div role="status" className="flex flex-col gap-0.5">
      <p
        className={`flex items-center gap-2 text-xl font-bold ${correct ? "text-ok" : "text-shu"}`}
      >
        {correct ? (
          <Check aria-hidden className="size-6" strokeWidth={2.5} />
        ) : (
          <X aria-hidden className="size-6" strokeWidth={2.5} />
        )}
        {correct ? "정답" : "오답"}
      </p>
      {!correct && score > 0 && (
        <p className="text-sm text-muted">
          부분 점수 {Math.round(score * 100)}% · 오답으로 기록됩니다
        </p>
      )}
    </div>
  );
}

/** 해설: 핵심 한 줄(summary 또는 첫 문장) + 본문 + 근거·출처. 내용 규칙은 기존 문제 화면과 같다 */
export function Explanation({ question }: { question: Question }) {
  // 문제 데이터 해설의 "⭐ 근거: …"는 데이터를 바꾸지 않고 화면에서만 글자로 보인다(이모지 금지)
  const explanation = noStar(question.explanation);
  const key = noStar(question.summary ?? keyLine(question.explanation));
  const basis = explanationBasis(explanation);
  return (
    <div className="flex flex-col gap-2 bg-paper-deep p-4 text-base leading-relaxed">
      <ExplanationSource question={question} />
      {key !== explanation.trim() && (
        <p className="font-semibold">
          <RichText text={key} />
        </p>
      )}
      <p>
        <RichText text={explanationBody(explanation)} />
      </p>
      {basis && <p className="text-sm text-muted">{basis}</p>}
      <p className="text-sm text-muted">출처 {question.slideRef}</p>
    </div>
  );
}

/** ⭐ → "시험 포인트"(해설·요약 표시용) */
const noStar = (s: string) => s.replace(/⭐\s*/g, "시험 포인트 ");

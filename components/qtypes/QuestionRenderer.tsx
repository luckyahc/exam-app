"use client";

import type { ExamBasis, GradeResult } from "@/lib/qtypes/base";
import { questionData } from "@/lib/qtypes/dataSnapshots";
import { coreFor, type AnyAnswer, type Question } from "@/lib/qtypes/registry";
import { exampleBadge, explanationSourceLabel, jokboBadge, relatedBadge } from "@/lib/quiz/jokbo";
import { uiFor } from "./registry";
import { CodeBlock } from "./CodeBlock";
import { DataTables } from "./DataTables";
import { ResultBanner, RichText } from "./ui";

const EXAM_LABEL: Record<ExamBasis, string> = {
  handwritten: "교수님 필기",
  "printed-emphasis": "슬라이드 강조",
  "exam-hint": "시험 힌트",
};

const EXAM_TITLE: Record<ExamBasis, string> = {
  handwritten: "교수님이 필기로 '시험'이라고 표시한 주제",
  "printed-emphasis": "슬라이드 본문에 '중요'로 인쇄된 주제",
  "exam-hint": "교수님 공식 시험 힌트의 범위",
};

/** ⭐ 시험 포인트 뱃지 — 근거(필기/인쇄 강조/시험 힌트)를 텍스트로 구분한다(색 단독 금지). 힌트 항목 번호는 툴팁에 */
export function ExamBadge({ basis, hintIds }: { basis: ExamBasis; hintIds?: readonly string[] }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-primary/60 px-2 py-0.5 text-xs font-medium"
      title={EXAM_TITLE[basis] + (hintIds?.length ? ` · 시험 힌트 ${hintIds.join(", ")}` : "")}
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

/** 해설 끝의 근거 한 줄("\n근거: 교재 표 3.1 + 보충", 심리학개론)은 본문과 떼어 출처처럼 작게 보인다 */
const BASIS = /\n(근거: [^\n]+)$/;
export const explanationBody = (e: string) => e.replace(BASIS, "");
export const explanationBasis = (e: string) => BASIS.exec(e)?.[1] ?? null;

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

/** 족보 문항 뱃지("족보" / 출현 2회 이상이면 "족보 N회") — 일반 문항은 그리지 않는다 */
export function JokboBadge({ question }: { question: Question }) {
  const text = jokboBadge(question);
  if (!text) return null;
  const terms = question.jokbo?.occurrences.map((o) => [o.term, o.file, `${o.number}번`].filter(Boolean).join(" ")).join(" / ");
  return (
    <span className="inline-flex items-center rounded-full border border-foreground/40 px-2 py-0.5 text-xs font-medium" title={terms ? `족보 출현: ${terms}` : undefined}>
      {text}
    </span>
  );
}

/** 해설 머리의 출처("족보 해설" / "생성 해설") — 족보 문항만 */
export function ExplanationSource({ question }: { question: Question }) {
  const label = explanationSourceLabel(question);
  return label ? <p className="text-xs font-semibold text-muted">{label}</p> : null;
}

/** 지문 그림(족보 원본에서 자른 그래프) — 다크 모드에서도 원본 그대로 보이도록 흰 카드 위에 둔다 */
export function QuestionFigureView({ question }: { question: Question }) {
  const f = question.figure;
  if (!f) return null;
  return (
    <figure className="self-start rounded-lg border border-border bg-white p-2">
      {/* 정적 원본 그림(작은 PNG) — 크기를 고정해 레이아웃이 밀리지 않게 한다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f.src} alt={f.alt} width={f.width} height={f.height} className="h-auto max-w-full" loading="lazy" />
    </figure>
  );
}

/** 문제 하나를 그린다. 유형별 분기는 레지스트리 조회로만 한다(switch 없음). */
export function QuestionRenderer({ question, answer, onAnswer, result }: Props) {
  const core = coreFor(question);
  const { Input, Review } = uiFor(question.type);
  const data = questionData(question);

  return (
    <article className="flex flex-col gap-4" aria-labelledby={`${question.id}-prompt`}>
      <header className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-surface px-2 py-0.5 font-medium">{core.label}</span>
        {question.exam && question.examBasis && <ExamBadge basis={question.examBasis} hintIds={question.hintIds} />}
        <JokboBadge question={question} />
        {relatedBadge(question) && (
          <span className="inline-flex items-center rounded-full border border-foreground/40 px-2 py-0.5 text-xs font-medium">{relatedBadge(question)}</span>
        )}
        {exampleBadge(question) && (
          <span className="inline-flex items-center rounded-full border border-foreground/40 px-2 py-0.5 text-xs font-medium">{exampleBadge(question)}</span>
        )}
        <span className="text-muted">
          {question.topic} · 난이도 {"●".repeat(question.difficulty)}
          {"○".repeat(3 - question.difficulty)}
        </span>
      </header>

      {/* 지문 아래 코드(code 필드)는 지문과 같은 자리(형제 순서)에 둔다 — 코드가 없는 기존 문항의 트리 위치가
          바뀌면 useId로 만든 SVG id(그래프 화살표 등)가 달라지므로 그대로 유지한다. 숨긴 준비 데이터의 표(사용 테이블·사용 데이터)도
          같은 자리 안에 둔다 */}
      {question.code || data ? (
        <div className="flex flex-col gap-2">
          <p id={`${question.id}-prompt`} className="text-base leading-relaxed sm:text-lg">
            <RichText text={question.prompt} />
          </p>
          {question.code && <CodeBlock code={question.code.source} language={question.code.language} lineNumbers={question.code.lineNumbers} />}
          {data && <DataTables data={data} />}
        </div>
      ) : (
        <p id={`${question.id}-prompt`} className="text-base leading-relaxed sm:text-lg">
          <RichText text={question.prompt} />
        </p>
      )}

      <QuestionFigureView question={question} />

      <Input
        question={question as never}
        answer={answer as never}
        onChange={onAnswer as never}
        disabled={result !== null}
      />

      {result && (
        <section aria-label="채점 결과" className="flex flex-col gap-3 border-t border-border pt-4">
          {!result.selfCheck && <ResultBanner correct={result.correct} score={result.score} />}
          <Review question={question as never} answer={answer as never} result={result as never} />
          <div className="flex flex-col gap-1 rounded-lg bg-surface p-3 text-sm leading-relaxed">
            <ExplanationSource question={question} />
            {/* 핵심 한 줄: summary가 없으면 해설 첫 문장. 해설이 한 문장뿐이면 같은 말을 두 번 보이지 않는다 */}
            {(question.summary ?? keyLine(question.explanation)) !== question.explanation.trim() && (
              <p className="font-semibold">
                핵심: <RichText text={question.summary ?? keyLine(question.explanation)} />
              </p>
            )}
            <p>
              <RichText text={explanationBody(question.explanation)} />
            </p>
            {explanationBasis(question.explanation) && <p className="text-xs text-muted">{explanationBasis(question.explanation)}</p>}
            <p className="text-xs text-muted">출처: {question.slideRef}</p>
          </div>
        </section>
      )}
    </article>
  );
}

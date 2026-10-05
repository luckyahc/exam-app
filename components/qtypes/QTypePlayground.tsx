"use client";

import { useState } from "react";
import type { GradeResult } from "@/lib/qtypes/base";
import { coreFor, gradeQuestion, type AnyAnswer, type Question } from "@/lib/qtypes/registry";
import { useQuizShortcuts } from "@/lib/hooks/useQuizShortcuts";
import { QuestionRenderer } from "./QuestionRenderer";

/**
 * 문제 유형 미리보기: 유형별 더미 문제를 즉시 채점 모드로 풀어 본다(Sprint 3 확인용).
 * 실제 퀴즈 화면(/quiz)은 Sprint 7에서 이 렌더러와 같은 부품으로 만든다.
 */
/** shortcuts=false: 한 페이지에 미리 보기가 여럿일 때 키보드 단축키는 하나만 쓰게 한다 */
export function QTypePlayground({ questions, shortcuts = true }: { questions: Question[]; shortcuts?: boolean }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnyAnswer>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, coreFor(q).emptyAnswer(q as never)])),
  );
  const [results, setResults] = useState<Record<string, GradeResult>>({});

  const q = questions[index];
  const answer = answers[q.id];
  const result = results[q.id] ?? null;
  const core = coreFor(q);
  const complete = core.isComplete(q as never, answer as never);

  const setAnswer = (a: AnyAnswer) => setAnswers((prev) => ({ ...prev, [q.id]: a }));
  const go = (delta: number) =>
    setIndex((i) => Math.min(questions.length - 1, Math.max(0, i + delta)));
  const submit = () => {
    if (result || !complete) return;
    setResults((prev) => ({ ...prev, [q.id]: gradeQuestion(q, answer) }));
  };
  const retry = () => {
    setResults((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
    setAnswer(core.emptyAnswer(q as never));
  };

  useQuizShortcuts(shortcuts ? {
    onChoice: (i) => {
      if (result || !core.applyChoice || i >= (core.choiceCount?.(q as never) ?? 0)) return;
      setAnswer(core.applyChoice(q as never, answer as never, i));
    },
    onEnter: () => (result ? go(1) : submit()),
    onPrev: () => go(-1),
    onNext: () => go(1),
  } : {});

  const solved = Object.keys(results).length;
  const correct = Object.values(results).filter((r) => r.correct).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {index + 1} / {questions.length}
          </span>
          <span>
            채점 {solved}개 · 정답 {correct}개
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-label="진행"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <nav aria-label="유형으로 이동" className="flex flex-wrap gap-1.5">
          {questions.map((x, i) => {
            const r = results[x.id];
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "step" : undefined}
                className={
                  "rounded-full border px-2.5 py-0.5 text-xs " +
                  (i === index
                    ? "border-primary font-semibold"
                    : "border-border text-muted hover:text-foreground")
                }
              >
                {coreFor(x).label}
                {r && (
                  <span aria-label={r.correct ? " 정답" : " 오답"}>{r.correct ? " ✓" : " ✗"}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <QuestionRenderer
        key={q.id}
        question={q}
        answer={answer}
        onAnswer={setAnswer}
        result={result}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          ← 이전
        </button>
        <div className="flex gap-2">
          {result ? (
            <>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                다시 풀기
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index === questions.length - 1}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-40"
              >
                다음 →
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!complete}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              제출 (Enter)
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">
        {shortcuts
          ? "단축키: 1~5 보기 선택 · Enter 제출/다음 · ←/→ 이전/다음 (입력칸에 커서가 있을 때는 꺼짐)"
          : "이 섹션은 단축키 없음 — 버튼으로 풀어 주세요(키보드 단축키는 위쪽 미리보기에서만 동작)."}
      </p>
    </div>
  );
}

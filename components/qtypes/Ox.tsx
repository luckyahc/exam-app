"use client";

import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { ChoiceButton, Mark, ReviewList, ReviewRow, Tag } from "./ui";

const LABEL = (v: boolean) => (v ? "O (참)" : "X (거짓)");

function Input({ answer, onChange, disabled }: InputProps<"ox">) {
  return (
    <div role="radiogroup" aria-label="참 또는 거짓" className="grid grid-cols-2 gap-2">
      {[true, false].map((v, i) => (
        <ChoiceButton
          key={String(v)}
          index={i}
          selected={answer === v}
          disabled={disabled}
          onClick={() => onChange(v)}
        >
          <span className="text-lg font-semibold">{LABEL(v)}</span>
        </ChoiceButton>
      ))}
    </div>
  );
}

function Review({ question, answer }: ReviewProps<"ox">) {
  const ok = answer === question.answer;
  return (
    <ReviewList>
      <ReviewRow
        tone={ok ? "correct" : "incorrect"}
        aside={
          <>
            <Tag tone="primary">내 답: {answer === null ? "없음" : LABEL(answer)}</Tag>
            <Tag tone="correct">정답: {LABEL(question.answer)}</Tag>
            <Mark ok={ok} />
          </>
        }
      >
        <span className="text-sm">이 진술은 {question.answer ? "옳다" : "틀리다"}.</span>
      </ReviewRow>
      {question.falseReason && (
        <ReviewRow tone="neutral">
          <span className="text-sm">
            <span className="font-semibold">틀린 이유: </span>
            {question.falseReason}
          </span>
        </ReviewRow>
      )}
    </ReviewList>
  );
}

export const OxUI: QTypeUI<"ox"> = { Input, Review };

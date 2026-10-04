"use client";

import { parseNumber } from "@/lib/qtypes/calc";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark, ReviewList, ReviewRow, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"calc">) {
  const invalid = answer.trim() !== "" && parseNumber(answer) === null;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2">
        <span className="text-sm text-muted">답</span>
        <input
          inputMode="decimal"
          autoComplete="off"
          value={answer}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${question.id}-err` : undefined}
          className="w-40 rounded border border-border bg-surface px-2 py-1.5"
        />
        {question.unit && <span className="text-sm">{question.unit}</span>}
      </label>
      {invalid && (
        <p id={`${question.id}-err`} className="text-xs text-incorrect">
          ⚠ 숫자로 입력하세요 (예: 1.1, 34,881)
        </p>
      )}
    </div>
  );
}

function Review({ question, answer, result }: ReviewProps<"calc">) {
  const unit = question.unit ? ` ${question.unit}` : "";
  return (
    <div className="flex flex-col gap-3">
      <ReviewList>
        <ReviewRow
          tone={result.correct ? "correct" : "incorrect"}
          aside={<Mark ok={result.correct} />}
        >
          <span className="flex flex-wrap gap-1.5 text-sm">
            <Tag tone="primary">
              내 답: {result.detail.value ?? (answer.trim() || "없음")}
              {result.detail.value !== null ? unit : ""}
            </Tag>
            <Tag tone="correct">
              정답: {question.answer}
              {unit}
              {question.tolerance > 0 ? ` (±${question.tolerance})` : ""}
            </Tag>
          </span>
        </ReviewRow>
      </ReviewList>
      {question.steps && (
        <ol className="list-decimal space-y-1 rounded-lg bg-surface py-2 pl-8 pr-3 font-mono text-sm">
          {question.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export const CalcUI: QTypeUI<"calc"> = { Input, Review };

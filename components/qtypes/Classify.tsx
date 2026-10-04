"use client";

import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark, ReviewList, ReviewRow, RichText, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"classify">) {
  return (
    <ul className="flex flex-col gap-3">
      {question.items.map((it, i) => (
        <li
          key={it.label}
          className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3"
        >
          <span className="font-medium">
            <RichText text={it.label} />
          </span>
          <div
            role="radiogroup"
            aria-label={`${it.label}의 분류`}
            className="flex flex-wrap gap-1.5"
          >
            {question.buckets.map((b) => {
              const on = answer[i] === b;
              return (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={disabled}
                  onClick={() => onChange(answer.map((x, j) => (j === i ? b : x)))}
                  className={
                    "rounded-full border px-3 py-1 text-sm transition-colors " +
                    (on
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-border hover:border-primary/60")
                  }
                >
                  {on && <span aria-hidden>✓ </span>}
                  {b}
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Review({ question, answer, result }: ReviewProps<"classify">) {
  return (
    <ReviewList>
      {question.items.map((it, i) => (
        <ReviewRow
          key={it.label}
          tone={result.detail[i] ? "correct" : "incorrect"}
          aside={<Mark ok={result.detail[i]} />}
        >
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">
              <RichText text={it.label} />
            </span>
            <span className="flex flex-wrap gap-1.5">
              {!result.detail[i] && <Tag tone="primary">내 분류: {answer[i] ?? "없음"}</Tag>}
              <Tag tone="correct">정답: {it.bucket}</Tag>
            </span>
          </div>
        </ReviewRow>
      ))}
    </ReviewList>
  );
}

export const ClassifyUI: QTypeUI<"classify"> = { Input, Review };

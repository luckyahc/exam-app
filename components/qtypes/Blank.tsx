"use client";

import { splitBlankText } from "@/lib/qtypes/blank";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark, ReviewList, ReviewRow, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"blank">) {
  const set = (i: number, v: string) => onChange(answer.map((x, j) => (j === i ? v : x)));
  return (
    <div className="flex flex-col gap-3">
      {question.bank && <p className="text-xs text-muted">단어 은행에서 고르세요.</p>}
      <p className="leading-9">
        {splitBlankText(question.text).map((part, k) =>
          typeof part === "string" ? (
            <span key={k}>{part}</span>
          ) : question.bank ? (
            <select
              key={k}
              aria-label={`빈칸 ${part + 1}`}
              value={answer[part] ?? ""}
              disabled={disabled}
              onChange={(e) => set(part, e.target.value)}
              className="mx-1 rounded border border-border bg-surface px-2 py-1 text-sm"
            >
              <option value="">({part + 1}) 선택</option>
              {question.bank.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={k}
              aria-label={`빈칸 ${part + 1}`}
              value={answer[part] ?? ""}
              disabled={disabled}
              onChange={(e) => set(part, e.target.value)}
              placeholder={`(${part + 1})`}
              autoComplete="off"
              className="mx-1 w-32 rounded border border-border bg-surface px-2 py-1 text-sm"
            />
          ),
        )}
      </p>
    </div>
  );
}

function Review({ question, answer, result }: ReviewProps<"blank">) {
  return (
    <ReviewList>
      {question.blanks.map((b, i) => (
        <ReviewRow
          key={i}
          tone={result.detail[i] ? "correct" : "incorrect"}
          aside={<Mark ok={result.detail[i]} />}
        >
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-semibold">빈칸 {i + 1}</span>
            <Tag tone="primary">내 답: {answer[i]?.trim() || "없음"}</Tag>
            <Tag tone="correct">정답: {b.accept.join(" / ")}</Tag>
          </div>
        </ReviewRow>
      ))}
    </ReviewList>
  );
}

export const BlankUI: QTypeUI<"blank"> = { Input, Review };

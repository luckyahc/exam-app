"use client";

import { matchOptions } from "@/lib/qtypes/match";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark, ReviewList, ReviewRow, RichText, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"match">) {
  const options = matchOptions(question);
  return (
    <ul className="flex flex-col gap-3">
      {question.pairs.map((p, i) => (
        <li
          key={p.left}
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center"
        >
          <span className="font-medium sm:w-40 sm:shrink-0">
            <RichText text={p.left} />
          </span>
          <select
            aria-label={`${p.left}의 짝`}
            value={answer[i] ?? ""}
            disabled={disabled}
            onChange={(e) => onChange(answer.map((x, j) => (j === i ? e.target.value || null : x)))}
            className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">선택하세요</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}

function Review({ question, answer, result }: ReviewProps<"match">) {
  return (
    <ReviewList>
      {question.pairs.map((p, i) => (
        <ReviewRow
          key={p.left}
          tone={result.detail[i] ? "correct" : "incorrect"}
          aside={<Mark ok={result.detail[i]} />}
        >
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">
              <RichText text={p.left} />
            </span>
            {!result.detail[i] && <Tag tone="primary">내 답: {answer[i] ?? "없음"}</Tag>}
            <Tag tone="correct">정답: {p.right}</Tag>
          </div>
        </ReviewRow>
      ))}
    </ReviewList>
  );
}

export const MatchUI: QTypeUI<"match"> = { Input, Review };

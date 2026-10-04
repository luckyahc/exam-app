"use client";

import { useState } from "react";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark, ReviewList, ReviewRow, RichText } from "./ui";

function move(list: number[], from: number, to: number): number[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** 드래그&드롭(데스크톱) + ↑↓ 버튼(모바일·키보드)을 함께 제공한다. */
function Input({ question, answer, onChange, disabled }: InputProps<"order">) {
  const [dragging, setDragging] = useState<number | null>(null);
  return (
    <ol className="flex flex-col gap-2" aria-label="순서 배치 (위가 먼저)">
      {answer.map((itemIndex, pos) => (
        <li
          key={itemIndex}
          draggable={!disabled}
          onDragStart={() => setDragging(pos)}
          onDragEnd={() => setDragging(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragging !== null && dragging !== pos) onChange(move(answer, dragging, pos));
            setDragging(null);
          }}
          className={
            "flex items-center gap-2 rounded-lg border bg-surface px-3 py-2 " +
            (dragging === pos ? "border-primary opacity-60" : "border-border")
          }
        >
          <span aria-hidden className={`select-none text-muted ${disabled ? "" : "cursor-grab"}`}>
            ⠿
          </span>
          <span className="w-5 shrink-0 text-sm font-semibold text-muted">{pos + 1}</span>
          <span className="min-w-0 flex-1">
            <RichText text={question.items[itemIndex]} />
          </span>
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={`${pos + 1}번째 항목을 위로`}
              disabled={disabled || pos === 0}
              onClick={() => onChange(move(answer, pos, pos - 1))}
              className="size-8 rounded border border-border text-sm disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`${pos + 1}번째 항목을 아래로`}
              disabled={disabled || pos === answer.length - 1}
              onClick={() => onChange(move(answer, pos, pos + 1))}
              className="size-8 rounded border border-border text-sm disabled:opacity-30"
            >
              ↓
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Review({ question, answer, result }: ReviewProps<"order">) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted">내 순서</p>
        <ReviewList>
          {answer.map((itemIndex, pos) => (
            <ReviewRow
              key={pos}
              tone={result.detail[pos] ? "correct" : "incorrect"}
              aside={<Mark ok={result.detail[pos]} okText="자리 맞음" noText="자리 틀림" />}
            >
              {pos + 1}. <RichText text={question.items[itemIndex]} />
            </ReviewRow>
          ))}
        </ReviewList>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted">정답 순서</p>
        <ReviewList>
          {question.items.map((item, pos) => (
            <ReviewRow key={pos} tone="neutral">
              {pos + 1}. <RichText text={item} />
            </ReviewRow>
          ))}
        </ReviewList>
      </div>
    </div>
  );
}

export const OrderUI: QTypeUI<"order"> = { Input, Review };

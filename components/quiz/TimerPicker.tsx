"use client";

import { useState } from "react";

const PRESETS = [0, 10, 20, 30, 60] as const; // 분, 0 = 없음
export const MAX_TIMER_MIN = 300;

const chip = (on: boolean) =>
  "rounded-full border px-3 py-1.5 text-sm transition-colors " +
  (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground");

/**
 * 제한 시간 고르기(분). 미리 정한 값 + "직접 입력"(1~300분). value 0 = 타이머 없음.
 * 직접 입력 칸이 비었거나 범위를 벗어나면 0(없음)으로 넘긴다 — 시작 버튼 쪽에서 따로 막지 않아도 된다.
 */
export function TimerPicker({ value, onChange }: { value: number; onChange(min: number): void }) {
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState("");

  const pickPreset = (m: number) => {
    setCustom(false);
    onChange(m);
  };
  const typeCustom = (t: string) => {
    const digits = t.replace(/\D/g, "").slice(0, 3);
    setText(digits);
    const n = Number(digits);
    onChange(n >= 1 && n <= MAX_TIMER_MIN ? n : 0);
  };
  const invalid = custom && text !== "" && value === 0;

  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="제한 시간" className="flex flex-wrap gap-2">
        {PRESETS.map((m) => {
          const on = !custom && value === m;
          return (
            <button key={m} type="button" role="radio" aria-checked={on} onClick={() => pickPreset(m)} className={chip(on)}>
              {on && <span aria-hidden>✓ </span>}
              {m ? `${m}분` : "제한 없음"}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => {
            setCustom(true);
            typeCustom(text);
          }}
          className={chip(custom)}
        >
          {custom && <span aria-hidden>✓ </span>}
          직접 입력
        </button>
      </div>
      {custom && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={text}
            onChange={(e) => typeCustom(e.target.value)}
            placeholder="예: 45"
            aria-invalid={invalid}
            className="w-20 rounded-md border border-border bg-background px-2 py-1 text-right"
          />
          분
          <span className={"text-xs " + (invalid ? "text-foreground font-semibold" : "text-muted")}>
            (1~{MAX_TIMER_MIN}분{invalid ? " 사이로 입력하세요" : ""})
          </span>
        </label>
      )}
    </div>
  );
}

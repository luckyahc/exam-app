"use client";

import { useState } from "react";
import type { InputProps, QTypeUI, ReviewProps } from "./types";

/** 서술형(자기 채점): 글로 답하고, 제출 후 내 답·모범답안을 나란히 보며 채점 포인트를 스스로 체크한다(체크는 기록하지 않는다) */
function Input({ question, answer, onChange, disabled }: InputProps<"essay">) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        aria-label="서술형 답안"
        aria-describedby={`${question.id}-prompt`}
        value={answer}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="답을 문장으로 써 보세요. 제출하면 모범답안과 채점 포인트가 나옵니다."
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-base leading-relaxed focus:border-primary disabled:opacity-80"
      />
      <p className="text-xs text-muted">자기 채점 문제 — 정답·오답으로 기록하지 않고 &ldquo;풀었음&rdquo;만 남습니다.</p>
    </div>
  );
}

function Review({ question, answer }: ReviewProps<"essay">) {
  const [checked, setChecked] = useState<boolean[]>(() => question.keyPoints.map(() => false));
  const n = checked.filter(Boolean).length;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <section aria-label="내 답" className="flex flex-col gap-1 rounded-lg border-l-4 border-primary bg-surface px-3 py-2">
          <h3 className="text-xs font-semibold text-muted">내 답</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer.trim() || "(답 없음)"}</p>
        </section>
        <section aria-label="모범답안" className="flex flex-col gap-1 rounded-lg border-l-4 border-correct bg-surface px-3 py-2">
          <h3 className="text-xs font-semibold text-muted">모범답안</h3>
          <p className="text-sm leading-relaxed">{question.modelAnswer}</p>
        </section>
      </div>
      <fieldset className="flex flex-col gap-1.5 rounded-lg bg-surface px-3 py-2">
        <legend className="px-1 text-xs font-semibold text-muted">
          채점 포인트 — 내 답에 들어간 것을 체크하세요 ({n}/{question.keyPoints.length})
        </legend>
        {question.keyPoints.map((k, i) => (
          <label key={k} className="flex items-start gap-2 text-sm leading-relaxed">
            <input
              type="checkbox"
              className="mt-1"
              checked={checked[i]}
              onChange={() => setChecked((c) => c.map((x, j) => (j === i ? !x : x)))}
            />
            <span>{k}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export const EssayUI: QTypeUI<"essay"> = { Input, Review };

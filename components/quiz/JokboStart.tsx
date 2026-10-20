"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QuizMode } from "@/lib/quiz/session";
import { TimerPicker } from "./TimerPicker";

const MODES: { value: QuizMode; label: string; help: string }[] = [
  { value: "instant", label: "즉시 채점", help: "문제마다 제출하면 바로 정답과 해설을 보여 줍니다." },
  { value: "exam", label: "시험 모드", help: "끝까지 푼 뒤 한 번에 채점합니다." },
];

/**
 * 과목 홈 "족보만 풀기": 모드(즉시 채점 / 시험 모드)와 제한 시간을 고르고 시작한다(섞기).
 * 제한 시간이 끝나면 시험 모드는 자동 채점, 즉시 채점은 제출한 문제까지로 결과에 넘어간다(components/quiz/QuizRunner.tsx).
 */
export function JokboStart({ subjectId, count }: { subjectId: string; count: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>("instant");
  const [timer, setTimer] = useState(0);

  const start = () => {
    const p = new URLSearchParams({ subject: subjectId, source: "jokbo", shuffle: "1", mode });
    if (timer) p.set("timer", String(timer * 60));
    router.push(`/quiz?${p.toString()}`);
  };

  const chip = (on: boolean) =>
    "rounded-full border px-3 py-1.5 text-sm transition-colors " +
    (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground");

  return (
    <section aria-labelledby="jokbo-start" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 id="jokbo-start" className="text-sm font-semibold">
        족보만 풀기 <span className="font-normal text-muted">— {count}문제</span>
      </h2>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">채점 방식</span>
        <div role="radiogroup" aria-label="채점 방식" className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button key={m.value} type="button" role="radio" aria-checked={mode === m.value} onClick={() => setMode(m.value)} className={chip(mode === m.value)}>
              {mode === m.value && <span aria-hidden>✓ </span>}
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">{MODES.find((m) => m.value === mode)?.help}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">제한 시간</span>
        <TimerPicker value={timer} onChange={setTimer} />
        {timer > 0 && (
          <p className="text-xs text-muted">
            {mode === "exam"
              ? "시간이 끝나면 답한 문제까지 자동으로 채점합니다(답하지 않은 문제는 미응답)."
              : "시간이 끝나면 제출한 문제까지로 결과를 보여 줍니다(나머지는 미응답)."}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={start}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background"
      >
        시작{timer > 0 ? ` (${timer}분)` : ""}
      </button>
    </section>
  );
}

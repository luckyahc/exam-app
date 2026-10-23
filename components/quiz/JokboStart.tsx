"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSetScores } from "@/lib/storage/setScoresStore";
import { type HintSet, isHintSource, isMockSource, SOURCE_LABEL } from "@/lib/quiz/jokbo";
import type { ExamView, QuizMode } from "@/lib/quiz/session";
import { ExamViewPicker } from "./ExamViewPicker";
import { TimerPicker } from "./TimerPicker";

const MODES: { value: QuizMode; label: string; help: string }[] = [
  { value: "instant", label: "즉시 채점", help: "문제마다 제출하면 바로 정답과 해설을 보여 줍니다." },
  { value: "exam", label: "시험 모드", help: "끝까지 푼 뒤 한 번에 채점합니다." },
];

/**
 * 과목 홈 "족보만 풀기"·"단답형 모음 풀기"(source): 모드(즉시 채점 / 시험 모드)와 제한 시간을 고르고 시작한다(섞기).
 * 모의시험 세트(source "mock1"·"mock2" — 족보관련1·2 풀기)는 섞지 않고 세트 순서 그대로, 기본 모드는 시험 모드다.
 * 힌트관련1~5(source "hint1"~"hint5", 데이터 통신)도 기본 모드는 시험 모드지만, 실제 시험처럼 문제 순서를 섞는다.
 * 제한 시간이 끝나면 시험 모드는 자동 채점, 즉시 채점은 제출한 문제까지로 결과에 넘어간다(components/quiz/QuizRunner.tsx).
 */
export function JokboStart({ subjectId, count, source = "jokbo" }: { subjectId: string; count: number; source?: "jokbo" | "related2" | "mock1" | "mock2" | `hint${HintSet}` | "short" }) {
  const router = useRouter();
  const mock = isMockSource(source);
  const hint = isHintSource(source);
  const set = mock || hint;
  // 힌트관련 세트: 끝까지 다 푼 회차마다 맞힌 수/전체(lib/quiz/setScores.ts)
  const scores = useSetScores(subjectId, source);
  const [mode, setMode] = useState<QuizMode>(set ? "exam" : "instant");
  const [timer, setTimer] = useState(0);
  const [view, setView] = useState<ExamView>("eclass");

  const start = () => {
    const p = new URLSearchParams({ subject: subjectId, source, shuffle: mock ? "0" : "1", mode });
    if (timer) p.set("timer", String(timer * 60));
    if (mode === "exam" && view === "eclass") p.set("view", "eclass");
    router.push(`/quiz?${p.toString()}`);
  };

  const chip = (on: boolean) =>
    "rounded-full border px-3 py-1.5 text-sm transition-colors " +
    (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground");

  return (
    <section aria-labelledby={`${source}-start`} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 id={`${source}-start`} className="text-sm font-semibold">
        {set || source === "short" ? `${SOURCE_LABEL[source]} 풀기` : `${SOURCE_LABEL[source]}만 풀기`}{" "}
        <span className="font-normal text-muted">— {count}문제{mock ? " · 모의시험(고정 순서)" : set ? " · 모의시험(문제 순서 무작위)" : ""}</span>
        {hint && (
          <span className="ml-2 font-normal">
            {scores.length === 0 ? (
              <span className="text-muted">· 아직 기록 없음</span>
            ) : (
              <>
                <span className="text-muted">· 기록 </span>
                {scores.map((x, i) => (
                  <span key={x.session} title={new Date(x.at).toLocaleString("ko-KR")} className="mr-1.5 inline-block rounded border border-border px-1.5 text-xs">
                    {i + 1}회 <b>{x.correct}</b>/{x.total}
                  </span>
                ))}
              </>
            )}
          </span>
        )}
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
      {mode === "exam" && <ExamViewPicker value={view} onChange={setView} />}
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TimerPicker } from "./TimerPicker";

/**
 * 과목 홈 "족보만 풀기": 제한 시간을 고르고 시작한다(즉시 채점·섞기).
 * 제한 시간이 끝나면 제출한 문제까지로 결과에 넘어간다(components/quiz/QuizRunner.tsx).
 */
export function JokboStart({ subjectId, count }: { subjectId: string; count: number }) {
  const router = useRouter();
  const [timer, setTimer] = useState(0);

  const start = () => {
    const p = new URLSearchParams({ subject: subjectId, source: "jokbo", shuffle: "1", mode: "instant" });
    if (timer) p.set("timer", String(timer * 60));
    router.push(`/quiz?${p.toString()}`);
  };

  return (
    <section aria-labelledby="jokbo-start" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 id="jokbo-start" className="text-sm font-semibold">
        족보만 풀기 <span className="font-normal text-muted">— {count}문제, 즉시 채점</span>
      </h2>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">제한 시간</span>
        <TimerPicker value={timer} onChange={setTimer} />
        {timer > 0 && <p className="text-xs text-muted">시간이 끝나면 제출한 문제까지로 결과를 보여 줍니다(나머지는 미응답).</p>}
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

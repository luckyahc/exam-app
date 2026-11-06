"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PracticeResult } from "@/components/practice/PracticeResult";
import type { Question } from "@/lib/qtypes/registry";
import { loadQuestions } from "@/lib/quiz/loadQuestions";
import { loadSession, type QuizSession } from "@/lib/quiz/session";
import { subjectRecords } from "@/lib/storage/recordsStore";

/** 결과 화면: 세션을 읽어 PracticeResult에 넘긴다(연습 모드·시험 모드 같은 화면) */
export function ResultView() {
  const params = useSearchParams();
  const [data, setData] = useState<{ session: QuizSession; questions: Map<string, Question> } | null | "none">(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = loadSession(params.get("session"));
      if (!s) return "none" as const;
      const gens = Object.fromEntries(s.items.map((it) => [it.id, subjectRecords(it.subject).wrong[it.id]?.gen]));
      return { session: s, questions: await loadQuestions(s.items, gens) };
    })().then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (data === null)
    return (
      <>
        <Title />
        <p className="text-sm text-muted">결과를 불러오는 중…</p>
      </>
    );
  if (data === "none")
    return (
      <>
      <Title />
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-line bg-paper-deep p-4 text-sm">표시할 결과가 없습니다. 퀴즈를 먼저 풀어 주세요.</p>
        <Link href="/" className="text-sm underline">
          홈으로
        </Link>
      </div>
      </>
    );

  return <PracticeResult session={data.session} questions={data.questions} />;
}

/** 결과 화면 제목(불러오는 중·결과 없음) — 결과가 있으면 점수가 제목 자리에 온다 */
function Title() {
  return <h1 className="text-xl font-bold sm:text-2xl">결과</h1>;
}

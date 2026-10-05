import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizEntry } from "@/components/quiz/QuizEntry";

export const metadata: Metadata = { title: "문제 풀이" };

export default function QuizPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      {/* 쿼리(?session=, ?subject=…)를 읽는 부분만 Suspense로 감싼다 */}
      <Suspense fallback={<p className="text-sm text-muted">문제를 불러오는 중…</p>}>
        <QuizEntry />
      </Suspense>
    </div>
  );
}

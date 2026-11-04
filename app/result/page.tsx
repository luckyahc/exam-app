import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultView } from "@/components/quiz/ResultView";

export const metadata: Metadata = { title: "결과" };

export default function ResultPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      {/* 제목은 ResultView가 그린다 — 연습 모드 결과는 점수가 제목 자리에 온다(시험 모드 결과는 이전과 같은 "결과" 제목) */}
      <Suspense
        fallback={
          <>
            <h1 className="text-xl font-bold sm:text-2xl">결과</h1>
            <p className="text-sm text-muted">결과를 불러오는 중…</p>
          </>
        }
      >
        <ResultView />
      </Suspense>
    </div>
  );
}

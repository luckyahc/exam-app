import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewView } from "@/components/review/ReviewView";
import { SubjectTabs } from "@/components/subject/SubjectTabs";

export const metadata: Metadata = { title: "오답노트 · 북마크" };

export default function ReviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold sm:text-2xl">오답노트 · 북마크</h1>
      {/* 쿼리(?subject=)를 읽는 부분만 Suspense로 감싸 나머지는 정적으로 프리렌더링한다. */}
      <Suspense fallback={<div className="h-8" />}>
        <SubjectTabs />
        <ReviewView />
      </Suspense>
    </div>
  );
}

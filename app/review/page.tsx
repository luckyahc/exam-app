import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewView } from "@/components/review/ReviewView";

export const metadata: Metadata = { title: "복습" };

export default function ReviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
      <PageHeader title="복습" />
      {/* 쿼리(?subject=)를 읽는 부분만 Suspense로 감싸 나머지는 정적으로 프리렌더링한다. */}
      <Suspense fallback={<div className="h-24" />}>
        <ReviewView />
      </Suspense>
    </div>
  );
}

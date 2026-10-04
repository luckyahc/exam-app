import { Suspense } from "react";
import { SelectedSubjectName, SubjectTabs } from "@/components/subject/SubjectTabs";

export default function StatsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold sm:text-2xl">통계</h1>
      <Suspense fallback={<div className="h-8" />}>
        <SubjectTabs />
        <p className="text-sm text-muted">
          <SelectedSubjectName />의 진행률·정답률·⭐ 달성도 대시보드는 이후 스프린트에서 추가됩니다.
        </p>
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { SelectedSubjectName, SubjectTabs } from "@/components/subject/SubjectTabs";

export default function ReviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold sm:text-2xl">오답노트</h1>
      {/* 쿼리(?subject=)를 읽는 부분만 Suspense로 감싸 나머지는 정적으로 프리렌더링한다. */}
      <Suspense fallback={<div className="h-8" />}>
        <SubjectTabs />
        <p className="text-sm text-muted">
          <SelectedSubjectName />의 오답노트와 북마크 목록은 이후 스프린트에서 추가됩니다.
        </p>
      </Suspense>
    </div>
  );
}

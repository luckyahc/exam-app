import type { Metadata } from "next";
import { Suspense } from "react";
import { DataManager } from "@/components/stats/DataManager";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { SubjectTabs } from "@/components/subject/SubjectTabs";
import { SUBJECTS } from "@/data/subjects/registry";
import { subjectMeta } from "@/lib/chapterMeta";

export const metadata: Metadata = { title: "통계" };

export default async function StatsPage() {
  // 문제 본문 없이 id·토픽·⭐ 여부만 넘긴다(빌드 때 정적으로 계산)
  const metas = Object.fromEntries(await Promise.all(SUBJECTS.map(async (s) => [s.id, await subjectMeta(s)] as const)));
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold sm:text-2xl">통계</h1>
      <Suspense fallback={<div className="h-8" />}>
        <SubjectTabs />
        <StatsDashboard metas={metas} />
      </Suspense>
      <DataManager />
    </div>
  );
}

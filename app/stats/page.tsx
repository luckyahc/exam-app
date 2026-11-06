import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminPanel } from "@/components/stats/AdminPanel";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { SubjectTabs } from "@/components/subject/SubjectTabs";
import { SUBJECTS } from "@/data/subjects/registry";
import { subjectMeta } from "@/lib/chapterMeta";

export const metadata: Metadata = { title: "통계" };

export default async function StatsPage() {
  // 문제 본문 없이 id·토픽·⭐ 여부만 넘긴다(빌드 때 정적으로 계산)
  const metas = Object.fromEntries(
    await Promise.all(SUBJECTS.map(async (s) => [s.id, await subjectMeta(s)] as const)),
  );
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
      <PageHeader title="통계" />
      <AdminPanel />
      <Suspense fallback={<div className="h-24" />}>
        <SubjectTabs />
        <StatsDashboard metas={metas} />
      </Suspense>
    </div>
  );
}

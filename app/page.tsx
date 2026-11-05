import { HomeView } from "@/components/home/HomeView";
import { CURRENT_EXAM } from "@/data/subjects/exams";
import { SUBJECTS } from "@/data/subjects/registry";
import { subjectMeta } from "@/lib/chapterMeta";
import { examIds } from "@/lib/quiz/progressScope";

export default async function HomePage() {
  const subjects = await Promise.all(
    SUBJECTS.map(async (subject) => {
      const chapters = await subjectMeta(subject);
      return {
        id: subject.id,
        name: subject.name,
        ready: chapters.some((c) => c.ids.length > 0),
        // 진행률 기본은 지금 준비하는 시험 범위(alsoExam 포함), [전체]를 고르면 allIds
        ids: examIds(chapters, CURRENT_EXAM),
        allIds: chapters.flatMap((c) => c.ids),
      };
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
      <HomeView subjects={subjects} />
    </div>
  );
}

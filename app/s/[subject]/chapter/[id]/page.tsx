import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { ChapterStart } from "@/components/quiz/ChapterStart";
import { chapterMeta } from "@/lib/chapterMeta";
import { getChapter, getSubject, starLabel } from "@/lib/subjects";

export const dynamicParams = false;

// 상위 레이아웃이 만든 과목마다 한 번씩 호출된다(top-down).
export function generateStaticParams({ params }: { params: { subject: string } }) {
  return (getSubject(params.subject)?.chapters ?? []).map((c) => ({ id: c.id }));
}

export default async function ChapterPage({ params }: PageProps<"/s/[subject]/chapter/[id]">) {
  const { subject: subjectId, id } = await params;
  const subject = getSubject(subjectId);
  const chapter = getChapter(subjectId, id);
  if (!subject || !chapter) notFound();
  const meta = await chapterMeta(subject, chapter);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/s/${subject.id}`} className="text-sm text-muted hover:text-foreground">
        ← {subject.name}
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold sm:text-2xl">{chapter.title}</h1>
        {meta.ids.length > 0 && (
          <>
            <p className="text-sm text-muted">
              문제 {meta.ids.length}개 · <span aria-hidden>⭐</span> {starLabel(subject, meta.starIds.length, true)}
            </p>
            <ProgressStats subjectId={subject.id} ids={meta.ids} />
          </>
        )}
      </div>
      {meta.ids.length > 0 ? (
        <ChapterStart meta={meta} />
      ) : (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          문제 준비 중입니다. 이 챕터의 문제가 추가되면 여기서 풀 수 있어요.
        </p>
      )}
    </div>
  );
}

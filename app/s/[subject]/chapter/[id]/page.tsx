import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChapterStart } from "@/components/quiz/ChapterStart";
import { chapterMeta } from "@/lib/chapterMeta";
import { getChapter, getSubject } from "@/lib/subjects";

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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <PageHeader
        back={{ href: `/s/${subject.id}`, label: subject.name }}
        title={`${chapter.id.toUpperCase()} ${chapter.shortTitle}`}
      />
      {meta.ids.length > 0 ? (
        <ChapterStart meta={meta} />
      ) : (
        <p className="text-sm text-muted">문제 준비 중</p>
      )}
    </div>
  );
}

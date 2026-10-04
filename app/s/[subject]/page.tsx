import Link from "next/link";
import { notFound } from "next/navigation";
import { countQuestions, getSubject } from "@/lib/subjects";

export default async function SubjectHomePage({ params }: PageProps<"/s/[subject]">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  const chapters = await Promise.all(
    subject.chapters.map(async (chapter) => ({
      chapter,
      questions: await countQuestions(chapter),
    })),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <span aria-hidden className="inline-block size-3 rounded-full bg-subject" />
          {subject.name}
        </h1>
        <p className="text-sm text-muted">챕터를 선택하세요.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/review?subject=${subject.id}`}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary"
        >
          {subject.name} 오답노트
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {chapters.map(({ chapter, questions }) => (
          <Link
            key={chapter.id}
            href={`/s/${subject.id}/chapter/${chapter.id}`}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-subject"
          >
            <span className="text-xs font-medium text-muted">{chapter.id.toUpperCase()}</span>
            <span className="text-lg font-semibold">{chapter.shortTitle}</span>
            <span className="text-sm text-muted">
              {questions > 0 ? `문제 ${questions}개` : "문제 준비 중"}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

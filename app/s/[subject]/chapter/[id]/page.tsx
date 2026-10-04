import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/s/${subject.id}`} className="text-sm text-muted hover:text-foreground">
        ← {subject.name}
      </Link>
      <h1 className="text-xl font-bold sm:text-2xl">{chapter.title}</h1>
      <p className="text-sm text-muted">
        문제 유형 필터, ⭐ 시험 포인트 필터, 문항 수, 섞기, 토픽 필터는 이후 스프린트에서
        추가됩니다.
      </p>
    </div>
  );
}

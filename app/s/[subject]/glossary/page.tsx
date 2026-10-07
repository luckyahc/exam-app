import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlossaryView } from "@/components/glossary/GlossaryView";
import { SUBJECTS } from "@/data/subjects/registry";
import { getSubject } from "@/lib/subjects";

export const dynamicParams = false;

/** 용어 사전이 있는 과목만(지금은 OS) — 다른 과목은 데이터를 넣으면 생긴다 */
export function generateStaticParams() {
  return SUBJECTS.filter((s) => "loadGlossary" in s && s.loadGlossary).map((s) => ({ subject: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/s/[subject]/glossary">): Promise<Metadata> {
  const { subject: id } = await params;
  return { title: `${getSubject(id)?.name ?? ""} 용어 정리` };
}

export default async function GlossaryPage({ params }: PageProps<"/s/[subject]/glossary">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject || !subject.loadGlossary) notFound();

  return (
    <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/s/${subject.id}`} className="text-sm text-muted hover:text-foreground">
        ← {subject.name}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">{subject.name} 용어 정리</h1>
        <p className="text-sm text-muted">
          강의 슬라이드(교수님 필기 포함)에 정의된 용어입니다. 영어 표기와 약자의 풀네임은 슬라이드에 있는 것만 적었습니다.
        </p>
      </div>
      <GlossaryView subjectId={subject.id} chapters={subject.chapters.map((c) => ({ id: c.id, shortTitle: c.shortTitle }))} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FunctionsView } from "@/components/functions/FunctionsView";
import { FUNCTION_SUBJECTS } from "@/lib/dsFunctions";
import { getSubject } from "@/lib/subjects";

export const dynamicParams = false;

/** 함수 정리표가 있는 과목만(지금은 데이터과학 — data/subjects/data-science/functions.json) */
export function generateStaticParams() {
  return FUNCTION_SUBJECTS.map((subject) => ({ subject }));
}

export async function generateMetadata({ params }: PageProps<"/s/[subject]/functions">): Promise<Metadata> {
  const { subject: id } = await params;
  return { title: `${getSubject(id)?.name ?? ""} 함수 정리` };
}

export default async function FunctionsPage({ params }: PageProps<"/s/[subject]/functions">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject || !(FUNCTION_SUBJECTS as readonly string[]).includes(subject.id)) notFound();

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/s/${subject.id}`} className="text-sm text-muted hover:text-foreground">
        ← {subject.name}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">{subject.name} 함수 정리</h1>
        <p className="text-sm text-muted">강의자료(Lec1~6)에 나오는 함수·메서드·SQL 구문을 처음 나온 장에 정리했습니다. 다른 장에 다시 나오면 그 장 탭에도 보입니다.</p>
      </div>
      <FunctionsView subjectId={subject.id} />
    </div>
  );
}

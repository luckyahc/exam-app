import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionList } from "@/components/questions/QuestionList";
import { SUBJECTS } from "@/data/subjects/registry";
import { getSubject } from "@/lib/subjects";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/s/[subject]/questions">): Promise<Metadata> {
  const { subject: id } = await params;
  return { title: `${getSubject(id)?.name ?? ""} 문제 목록` };
}

/** 과목별 문제 목록 — 풀이 상태(안 푼·맞힌·틀린)·북마크 탭, 챕터·유형·⭐·토픽 필터(lib/quiz/questionList.ts) */
export default async function QuestionListPage({ params }: PageProps<"/s/[subject]/questions">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/s/${subject.id}`} className="text-sm text-muted hover:text-foreground">
        ← {subject.name}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">{subject.name} 문제 목록</h1>
        <p className="text-sm text-muted">풀이 상태별로 문제를 모아 보고, 바로 풀거나 정답·해설만 확인할 수 있습니다.</p>
      </div>
      <QuestionList
        subject={{
          id: subject.id,
          name: subject.name,
          shortName: subject.shortName,
          ...(subject.examPoints === false ? { examPoints: false as const } : {}),
          chapters: subject.chapters.map((c) => ({ id: c.id, shortTitle: c.shortTitle })),
        }}
      />
    </div>
  );
}

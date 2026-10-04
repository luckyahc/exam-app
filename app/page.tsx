import Link from "next/link";
import { SUBJECTS } from "@/data/subjects/registry";
import { countQuestions, subjectStyle } from "@/lib/subjects";

export default async function HomePage() {
  const subjects = await Promise.all(
    SUBJECTS.map(async (subject) => {
      const counts = await Promise.all(subject.chapters.map(countQuestions));
      return { subject, questions: counts.reduce((a, b) => a + b, 0) };
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">과목 선택</h1>
        <p className="text-sm text-muted">과목을 고른 뒤 챕터를 선택하세요.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/review?subject=all"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary"
        >
          전체 오답노트
        </Link>
        <Link
          href="/stats?subject=all"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary"
        >
          전체 통계
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subjects.map(({ subject, questions }) => {
          const body = (
            <>
              <span className="flex items-center gap-2 text-xs font-medium text-muted">
                <span aria-hidden className="inline-block size-2.5 rounded-full bg-subject" />
                {subject.shortName}
              </span>
              <span className="text-lg font-semibold">{subject.name}</span>
              <span className="text-sm text-muted">
                챕터 {subject.chapters.length}개 ·{" "}
                {questions > 0 ? `문제 ${questions}개` : "문제 준비 중"}
              </span>
            </>
          );
          const className =
            "flex flex-col gap-2 rounded-xl border border-border border-l-4 border-l-subject bg-surface p-5";
          // 챕터가 하나도 없는 과목만 비활성. 챕터가 있으면 문제가 0개여도 들어갈 수 있다.
          return subject.chapters.length > 0 ? (
            <Link
              key={subject.id}
              href={`/s/${subject.id}`}
              data-subject={subject.id}
              style={subjectStyle(subject)}
              className={`${className} transition-colors hover:border-primary`}
            >
              {body}
            </Link>
          ) : (
            <div
              key={subject.id}
              aria-disabled="true"
              data-subject={subject.id}
              style={subjectStyle(subject)}
              className={`${className} opacity-60`}
            >
              {body}
              <span className="text-xs text-muted">준비 중</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

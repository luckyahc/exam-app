import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { subjectMeta } from "@/lib/chapterMeta";
import { getSubject, starLabel } from "@/lib/subjects";

export default async function SubjectHomePage({ params }: PageProps<"/s/[subject]">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  const chapters = await subjectMeta(subject);
  const allIds = chapters.flatMap((c) => c.ids);
  const stars = chapters.reduce((n, c) => n + c.starIds.length, 0);
  const link = "rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <span aria-hidden className="inline-block size-3 rounded-full bg-subject" />
          {subject.name}
        </h1>
        {allIds.length > 0 ? (
          <ProgressStats subjectId={subject.id} ids={allIds} />
        ) : (
          <p className="text-sm text-muted">문제 준비 중입니다. 문제가 추가되면 챕터를 풀 수 있어요.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {stars > 0 && (
          <Link href={`/quiz?subject=${subject.id}&star=1&shuffle=1&mode=instant`} className={link}>
            <span aria-hidden>⭐</span> 이 과목 시험 포인트만 풀기 ({stars})
          </Link>
        )}
        <Link href={`/review?subject=${subject.id}`} className={link}>
          {subject.name} 오답노트 · 북마크
        </Link>
        <Link href={`/s/${subject.id}/questions`} className={link}>
          문제 목록(풀이 상태별)
        </Link>
        {subject.loadGlossary && (
          <Link href={`/s/${subject.id}/glossary`} className={link}>
            용어 정리
          </Link>
        )}
      </div>

      {/* 용어 퀴즈: 용어 단답형(topic "용어")만 모아 풀기 — 용어 사전이 있는 과목만 */}
      {subject.loadGlossary && allIds.length > 0 && (
        <section aria-labelledby="term-quiz" className="flex flex-col gap-2">
          <h2 id="term-quiz" className="text-sm font-semibold">
            용어 퀴즈 <span className="font-normal text-muted">— 설명을 보고 용어(한국어 또는 영어)를 쓰는 단답형</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`/quiz?subject=${subject.id}&topics=용어&shuffle=1&count=20&mode=instant`} className={link}>
              전체 챕터
            </Link>
            {chapters.map((c) => (
              <Link
                key={c.chapterId}
                href={`/quiz?subject=${subject.id}&chapter=${c.chapterId}&topics=용어&shuffle=1&count=20&mode=instant`}
                className={link}
              >
                {c.chapterId.toUpperCase()} {c.shortTitle}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {chapters.map((c) => {
          const ready = c.ids.length > 0;
          const body = (
            <>
              <span className="text-xs font-medium text-muted">{c.chapterId.toUpperCase()}</span>
              <span className="text-lg font-semibold">{c.shortTitle}</span>
              <span className="text-sm text-muted">
                {ready ? (
                  <>
                    문제 {c.ids.length}개 · <span aria-hidden>⭐</span> {starLabel(subject, c.starIds.length)}
                  </>
                ) : (
                  "문제 준비 중"
                )}
              </span>
              {ready && <ProgressStats subjectId={subject.id} ids={c.ids} />}
            </>
          );
          return ready ? (
            <div key={c.chapterId} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
              <Link href={`/s/${subject.id}/chapter/${c.chapterId}`} className="flex flex-col gap-2 hover:text-primary">
                {body}
              </Link>
              {c.starIds.length > 0 && (
                <Link
                  href={`/quiz?subject=${subject.id}&chapter=${c.chapterId}&star=1&shuffle=1&mode=instant`}
                  className="self-start rounded-md border border-border px-3 py-1 text-xs font-medium hover:border-primary"
                >
                  이 챕터 ⭐만 풀기
                </Link>
              )}
            </div>
          ) : (
            <div key={c.chapterId} aria-disabled="true" className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 opacity-70">
              {body}
            </div>
          );
        })}
      </section>
    </div>
  );
}

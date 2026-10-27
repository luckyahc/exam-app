import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { JokboStart } from "@/components/quiz/JokboStart";
import { CURRENT_EXAM, EXAMS } from "@/data/subjects/exams";
import type { SubjectDef } from "@/data/subjects/types";
import { type ChapterMeta, subjectMeta } from "@/lib/chapterMeta";
import { FUNCTION_SUBJECTS } from "@/lib/dsFunctions";
import { hintSetOf, type HintSet, mockSetOf } from "@/lib/quiz/jokbo";
import { getSubject, starLabel } from "@/lib/subjects";

const link = "rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary";

export default async function SubjectHomePage({ params }: PageProps<"/s/[subject]">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  const chapters = await subjectMeta(subject);
  const allIds = chapters.flatMap((c) => c.ids);
  // 지금 준비하는 시험(CURRENT_EXAM)을 맨 위에, 나머지는 최근 시험부터. 지난 시험은 지금 시험에 문제가 생기면 접어 둔다
  const exams = [...EXAMS].sort((a, b) => (a.id === CURRENT_EXAM ? -1 : b.id === CURRENT_EXAM ? 1 : EXAMS.indexOf(b) - EXAMS.indexOf(a)));
  const currentReady = chapters.some((c) => c.exam === CURRENT_EXAM && c.ids.length > 0);

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

      {/* 시험 범위와 상관없는 과목 전체 화면 */}
      <div className="flex flex-wrap gap-3">
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
        {(FUNCTION_SUBJECTS as readonly string[]).includes(subject.id) && (
          <Link href={`/s/${subject.id}/functions`} className={link}>
            함수 정리
          </Link>
        )}
      </div>

      {exams.map((exam) => {
        const own = chapters.filter((c) => c.exam === exam.id);
        const current = exam.id === CURRENT_EXAM;
        return (
          <details key={exam.id} open={current || !currentReady} className="group rounded-2xl border border-border p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 text-lg font-bold">
              <span aria-hidden className="text-sm text-muted transition-transform group-open:rotate-90">
                ▶
              </span>
              {exam.name}
              {current && <span className="rounded-full border border-primary px-2 py-0.5 text-xs font-medium text-primary">준비 중인 시험</span>}
              <span className="text-sm font-normal text-muted">
                {own.length > 0 ? `챕터 ${own.length}개 · 문제 ${own.reduce((n, c) => n + c.ids.length, 0)}개` : "범위 준비 중"}
              </span>
            </summary>
            <div className="mt-6 flex flex-col gap-8">
              {own.length > 0 ? (
                <ExamBody subject={subject} exam={exam.id} chapters={own} />
              ) : (
                <p className="text-sm text-muted">이 시험 범위의 챕터가 아직 없습니다. 강의자료가 추가되면 여기에 챕터와 문제가 생깁니다.</p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

/** 한 시험 범위의 분류별 풀기·모의시험 상자와 챕터 카드. 과목 전체 퀴즈 링크는 모두 `exam=`으로 이 시험 챕터만 고른다 */
function ExamBody({ subject, exam, chapters }: { subject: SubjectDef; exam: string; chapters: ChapterMeta[] }) {
  const allIds = chapters.flatMap((c) => c.ids);
  const stars = chapters.reduce((n, c) => n + c.starIds.length, 0);
  const jokbo = chapters.reduce((n, c) => n + c.jokboIds.length, 0);
  const examples = chapters.reduce((n, c) => n + c.exampleIds.length, 0);
  const related = chapters.reduce((n, c) => n + c.relatedIds.length, 0);
  const related2 = chapters.reduce((n, c) => n + c.related2Ids.length, 0);
  const shorts = chapters.reduce((n, c) => n + c.shortIds.length, 0);
  // 족보관련1·2 모의시험 세트(id "-mock1-NNN"·"-mock2-NNN", data/subjects/algorithm/mockExams.ts)
  const mock1 = allIds.filter((id) => mockSetOf({ id }) === 1).length;
  const mock2 = allIds.filter((id) => mockSetOf({ id }) === 2).length;
  // 힌트관련1~5 모의시험 세트(id "-hint1-NNN"~"-hint5-NNN", data/subjects/data-comm/hintExams.ts)
  const hints = ([1, 2, 3, 4, 5] as const).map((n) => allIds.filter((id) => hintSetOf({ id }) === n).length);
  const quiz = `/quiz?subject=${subject.id}&exam=${exam}`;

  return (
    <>
      {allIds.length > 0 && <ProgressStats subjectId={subject.id} ids={allIds} />}
      {(stars > 0 || related > 0 || examples > 0) && (
        <div className="flex flex-wrap gap-3">
          {stars > 0 && (
            <Link href={`${quiz}&star=1&shuffle=1&mode=instant`} className={link}>
              <span aria-hidden>⭐</span> 이 시험 범위 시험 포인트만 풀기 ({stars})
            </Link>
          )}
          {/* 족보관련 = 족보 유형을 본뜬 생성 문항(basedOn) — 족보 원문과 따로 */}
          {related > 0 && (
            <Link href={`${quiz}&source=related&mode=instant`} className={link}>
              족보관련만 풀기 ({related})
            </Link>
          )}
          {/* 강의자료 예제 문항(sourceRef, docs/verification/data-comm-examples.md)이 있는 과목만 */}
          {examples > 0 && (
            <Link href={`${quiz}&source=example&mode=instant`} className={link}>
              강의 예제만 풀기 ({examples})
            </Link>
          )}
        </div>
      )}

      {/* 족보 문항(docs/jokbo-plan.md)이 있는 과목만 — 빈 퀴즈 방지. 제한 시간을 골라 시작한다 */}
      {jokbo > 0 && <JokboStart subjectId={subject.id} exam={exam} count={jokbo} />}
      {/* 족보관련1·2 = 족보 수준 모의시험 세트 — 고정 순서로 한 번에 풀고 결과(점수·틀린 문항)를 본다 */}
      {mock1 > 0 && <JokboStart subjectId={subject.id} exam={exam} count={mock1} source="mock1" />}
      {mock2 > 0 && <JokboStart subjectId={subject.id} exam={exam} count={mock2} source="mock2" />}
      {/* 힌트관련1~5 = 시험 힌트(문항 수·5지선다·모두 고르시오·계산·표)대로 만든 모의시험 세트 — 실제 시험처럼 문제 순서를 섞는다 */}
      {hints.map((n, i) => n > 0 && <JokboStart key={i} subjectId={subject.id} exam={exam} count={n} source={`hint${(i + 1) as HintSet}`} />)}
      {/* 족보관련2(시험 힌트 출제 유형 생성 문항)가 있는 과목만 */}
      {related2 > 0 && <JokboStart subjectId={subject.id} exam={exam} count={related2} source="related2" />}
      {/* 단답형 보강 문항(id "-short-NNN")이 있는 과목만 — 이 시험 범위 단답형을 한 번에 */}
      {shorts > 0 && <JokboStart subjectId={subject.id} exam={exam} count={shorts} source="short" />}

      {/* 용어 퀴즈: 용어 단답형(topic "용어")만 모아 풀기 — 용어 사전이 있는 과목만 */}
      {subject.loadGlossary && allIds.length > 0 && (
        <section aria-labelledby={`term-quiz-${exam}`} className="flex flex-col gap-2">
          <h2 id={`term-quiz-${exam}`} className="text-sm font-semibold">
            용어 퀴즈 <span className="font-normal text-muted">— 설명을 보고 용어(한국어 또는 영어)를 쓰는 단답형</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`${quiz}&topics=용어&shuffle=1&count=20&mode=instant`} className={link}>
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
    </>
  );
}

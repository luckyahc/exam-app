import { notFound } from "next/navigation";
import { type DetailExam, SubjectDetail } from "@/components/subject/SubjectDetail";
import type { SetSource } from "@/components/subject/SetStartRow";
import { EXAMS } from "@/data/subjects/exams";
import { subjectMeta } from "@/lib/chapterMeta";
import { FUNCTION_SUBJECTS } from "@/lib/dsFunctions";
import { hintSetOf, type HintSet, mockSetOf } from "@/lib/quiz/jokbo";
import { getSubject, usesExamPoints } from "@/lib/subjects";

export default async function SubjectHomePage({ params }: PageProps<"/s/[subject]">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  const chapters = await subjectMeta(subject);

  // 시험 범위별 요약. 개수 규칙은 이전 과목 홈과 같다: alsoExam 문항(다른 시험 챕터에 있지만 이 시험에도 속하는 문항)은
  // 과목 전체 퀴즈(loadSubject)에 들어가므로 분류별 개수에 더하고, 모의시험 세트 개수에는 넣지 않는다.
  const exams: DetailExam[] = EXAMS.map((exam) => {
    const own = chapters.filter((c) => c.exam === exam.id);
    const also = chapters
      .filter((c) => c.exam !== exam.id)
      .flatMap((c) => c.also.filter((a) => a.exams.includes(exam.id)));
    const allIds = own.flatMap((c) => c.ids);
    const sum = (f: (c: (typeof own)[number]) => readonly unknown[]) =>
      own.reduce((n, c) => n + f(c).length, 0);
    const related = sum((c) => c.relatedIds) + also.filter((a) => a.related).length;
    const examples = sum((c) => c.exampleIds);
    const sets: { source: SetSource; count: number }[] = [
      { source: "jokbo", count: sum((c) => c.jokboIds) + also.filter((a) => a.jokbo).length },
      // 족보관련1·2 모의시험 세트(id "-mock1-NNN"·"-mock2-NNN")
      { source: "mock1", count: allIds.filter((q) => mockSetOf({ id: q }) === 1).length },
      { source: "mock2", count: allIds.filter((q) => mockSetOf({ id: q }) === 2).length },
      // 힌트관련1~5 모의시험 세트(id "-hint1-NNN"~"-hint5-NNN")
      ...([1, 2, 3, 4, 5] as const).map((n) => ({
        source: `hint${n as HintSet}` as const,
        count: allIds.filter((q) => hintSetOf({ id: q }) === n).length,
      })),
      { source: "related2", count: sum((c) => c.related2Ids) },
      { source: "short", count: sum((c) => c.shortIds) },
    ];
    return {
      id: exam.id,
      shortName: exam.shortName,
      chapters: own.map((c) => ({ chapterId: c.chapterId, shortTitle: c.shortTitle, ids: c.ids })),
      // 진행률 분모는 과목 전체 퀴즈(loadSubject)와 같은 범위: 이 시험 챕터 + 다른 챕터의 alsoExam 문항
      ids: [...allIds, ...also.map((a) => a.id)],
      stars: sum((c) => c.starIds) + also.filter((a) => a.star).length,
      direct: [
        ...(related > 0
          ? [{ label: "족보관련만", count: related, source: "related" as const }]
          : []),
        ...(examples > 0
          ? [{ label: "강의 예제만", count: examples, source: "example" as const }]
          : []),
      ],
      sets: sets.filter((s) => s.count > 0),
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col px-4 py-6 sm:px-6">
      <SubjectDetail
        subject={{
          id: subject.id,
          name: subject.name,
          shortName: subject.shortName,
          examPoints: usesExamPoints(subject),
          glossary: !!subject.loadGlossary,
          functions: (FUNCTION_SUBJECTS as readonly string[]).includes(subject.id),
          chapters: subject.chapters.map((c) => ({ id: c.id, shortTitle: c.shortTitle })),
        }}
        exams={exams}
      />
    </div>
  );
}

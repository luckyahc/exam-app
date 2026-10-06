import type { CSSProperties } from "react";
import { SUBJECTS, type SubjectId } from "@/data/subjects/registry";
import type { ChapterDef, SubjectDef } from "@/data/subjects/types";

export type { SubjectId };

export function getSubject(id: string): SubjectDef | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getChapter(subjectId: string, chapterId: string): ChapterDef | undefined {
  return getSubject(subjectId)?.chapters.find((c) => c.id === chapterId);
}

/**
 * 문제 id(`{subject}-{chapter}-…`)에서 과목을 찾는다. 과목 id에 하이픈이 들어갈 수 있으므로
 * (`data-comm`) `split("-")`가 아니라 등록된 과목 id와의 가장 긴 접두사 일치로 판별한다.
 */
export function subjectOfQuestionId(
  questionId: string,
  subjects: readonly Pick<SubjectDef, "id">[] = SUBJECTS,
): string | undefined {
  let best: string | undefined;
  for (const { id } of subjects) {
    if (questionId.startsWith(`${id}-`) && (!best || id.length > best.length)) best = id;
  }
  return best;
}

/** 과목 영역 래퍼에 붙이는 CSS 변수. globals.css의 [data-subject] 규칙이 라이트/다크 값을 고른다. */
export function subjectStyle(subject: Pick<SubjectDef, "color">): CSSProperties {
  return {
    "--subject-l": subject.color.light,
    "--subject-d": subject.color.dark,
  } as CSSProperties;
}

/** 이 과목이 ⭐(시험 포인트)를 쓰는가. false면 화면에 "⭐ 해당 없음"(데이터과학 — 근거 0건) */
export function usesExamPoints(subject: SubjectDef): boolean {
  return subject.examPoints !== false;
}

/** 개수 옆 ⭐ 표시 문구: ⭐을 쓰지 않는 과목은 "해당 없음" */
export function starLabel(subject: SubjectDef, count: number, long = false): string {
  if (!usesExamPoints(subject)) return "해당 없음";
  return long ? `시험 포인트 ${count}개` : `${count}개`;
}

export async function countQuestions(chapter: ChapterDef): Promise<number> {
  return (await chapter.load()).length;
}

import { CURRENT_EXAM, type ExamId } from "@/data/subjects/exams";
import type { ChapterMeta } from "@/lib/chapterMeta";
import type { ProgressScope } from "@/lib/settings/appSettings";

/**
 * 진행상황 집계 범위(2026-11-05). 기본은 준비 중인 시험(기말)만 세고, [전체]를 고르면 과목 전체를 센다.
 * 기록은 범위와 상관없이 그대로 두고 어떤 문제를 셀지만 고른다. 고른 값은 설정(examapp:settings의 progressScope)에 저장한다.
 */

/** 시험 범위 문제 id: 그 시험 챕터의 문제 + 다른 챕터의 alsoExam 문항(과목 전체 퀴즈 loadSubject와 같은 범위) */
export function examIds(chapters: readonly ChapterMeta[], exam: ExamId): string[] {
  return chapters.flatMap((c) =>
    c.exam === exam ? c.ids : c.also.filter((a) => a.exams.includes(exam)).map((a) => a.id),
  );
}

/** 챕터 요약을 주어진 문제만 남긴 것으로 줄인다(통계 집계용: ids·rows·⭐·토픽을 함께 줄인다) */
function narrow(c: ChapterMeta, keep: ReadonlySet<string>): ChapterMeta {
  const rows = c.rows.filter((_, i) => keep.has(c.ids[i]));
  const only = (ids: readonly string[]) => ids.filter((id) => keep.has(id));
  return {
    ...c,
    ids: only(c.ids),
    rows,
    starIds: only(c.starIds),
    starHwIds: only(c.starHwIds),
    starHintIds: only(c.starHintIds),
    topics: c.topics.flatMap((t) => {
      const inTopic = rows.filter((r) => r.topic === t.topic);
      return inTopic.length
        ? [{ topic: t.topic, count: inTopic.length, star: inTopic.some((r) => r.exam) }]
        : [];
    }),
  };
}

/** 범위에 맞는 챕터 요약: 기말이면 기말 챕터 그대로 + 다른 챕터는 alsoExam 문항만, 전체면 그대로 */
export function scopeChapters(
  chapters: readonly ChapterMeta[],
  scope: ProgressScope,
  exam: ExamId = CURRENT_EXAM,
): ChapterMeta[] {
  if (scope === "all") return [...chapters];
  return chapters.flatMap((c) => {
    if (c.exam === exam) return [c];
    const keep = new Set(c.also.filter((a) => a.exams.includes(exam)).map((a) => a.id));
    return keep.size ? [narrow(c, keep)] : [];
  });
}

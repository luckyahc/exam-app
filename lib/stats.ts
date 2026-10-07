import type { ChapterMeta } from "@/lib/chapterMeta";
import { summarize } from "@/lib/storage/records";
import type { SubjectRecords } from "@/lib/storage/schema";

/**
 * 대시보드 집계(순수 함수). 모든 수치는 "완전히 맞음" 기준이다(부분 점수는 세지 않음).
 * - 진행률 = 한 번이라도 푼 문제 / 전체 문제
 * - 정답률 = 완전히 맞힌 횟수 / 푼 횟수 (`summarize`)
 * - ⭐ 달성도 = ⭐ 문제 중 **마지막 풀이가 완전히 맞음**(lastScore === 1)인 문제 / ⭐ 문제 수
 * 문제 데이터에 있는 id만 센다 — "비슷한 문제 새로 생성"으로 만든 문제(id가 다름)는 원래 문제 수치에 섞이지 않는다.
 */
export interface StatLine {
  total: number;
  solved: number;
  attempts: number;
  correct: number;
  /** correct / attempts, 풀이가 없으면 null */
  rate: number | null;
  star: number;
  starDone: number;
  openWrong: number;
  /** ⭐ 근거별(OS: 교수님 필기 / 시험 힌트) — 근거 목록을 넘긴 경우만 */
  starBy?: { hw: number; hwDone: number; hint: number; hintDone: number };
}

export function statLine(
  rec: SubjectRecords | undefined,
  ids: readonly string[],
  starIds: readonly string[],
  by?: { hw: readonly string[]; hint: readonly string[] },
): StatLine {
  const r = rec ?? { progress: {}, wrong: {}, bookmarks: [] };
  const s = summarize(r, ids);
  return {
    total: ids.length,
    solved: ids.filter((id) => r.progress[id]).length,
    attempts: s.attempts,
    correct: s.correct,
    rate: s.rate,
    star: starIds.length,
    starDone: starIds.filter((id) => r.progress[id]?.lastScore === 1).length,
    openWrong: s.openWrong,
    ...(by
      ? {
          starBy: {
            hw: by.hw.length,
            hwDone: by.hw.filter((id) => r.progress[id]?.lastScore === 1).length,
            hint: by.hint.length,
            hintDone: by.hint.filter((id) => r.progress[id]?.lastScore === 1).length,
          },
        }
      : {}),
  };
}

export function chapterStats(rec: SubjectRecords | undefined, meta: ChapterMeta) {
  const byTopic = new Map<string, { ids: string[]; star: string[] }>();
  meta.rows.forEach((row, i) => {
    const t = byTopic.get(row.topic) ?? { ids: [], star: [] };
    t.ids.push(meta.ids[i]);
    if (row.exam) t.star.push(meta.ids[i]);
    byTopic.set(row.topic, t);
  });
  return {
    line: statLine(rec, meta.ids, meta.starIds, { hw: meta.starHwIds, hint: meta.starHintIds }),
    topics: meta.topics.map((t) => ({ topic: t.topic, ...statLine(rec, byTopic.get(t.topic)!.ids, byTopic.get(t.topic)!.star) })),
  };
}

export function subjectStats(rec: SubjectRecords | undefined, chapters: readonly ChapterMeta[]): StatLine {
  return statLine(rec, chapters.flatMap((c) => c.ids), chapters.flatMap((c) => c.starIds), {
    hw: chapters.flatMap((c) => c.starHwIds),
    hint: chapters.flatMap((c) => c.starHintIds),
  });
}

/** 여러 줄을 더한다(전체 과목 요약). rate는 합친 횟수로 다시 계산 */
export function sumLines(lines: readonly StatLine[]): StatLine {
  const s = lines.reduce(
    (a, l) => ({
      total: a.total + l.total,
      solved: a.solved + l.solved,
      attempts: a.attempts + l.attempts,
      correct: a.correct + l.correct,
      rate: null,
      star: a.star + l.star,
      starDone: a.starDone + l.starDone,
      openWrong: a.openWrong + l.openWrong,
      starBy: {
        hw: (a.starBy?.hw ?? 0) + (l.starBy?.hw ?? 0),
        hwDone: (a.starBy?.hwDone ?? 0) + (l.starBy?.hwDone ?? 0),
        hint: (a.starBy?.hint ?? 0) + (l.starBy?.hint ?? 0),
        hintDone: (a.starBy?.hintDone ?? 0) + (l.starBy?.hintDone ?? 0),
      },
    }),
    { total: 0, solved: 0, attempts: 0, correct: 0, rate: null, star: 0, starDone: 0, openWrong: 0 } as StatLine,
  );
  return { ...s, rate: s.attempts ? s.correct / s.attempts : null };
}

/** 문제 데이터 밖의 기록(생성기로 새로 만든 문제) 풀이 횟수 — 대시보드에 따로 보여 준다 */
export function generatedAttempts(rec: SubjectRecords | undefined, knownIds: ReadonlySet<string>) {
  let attempts = 0;
  let correct = 0;
  for (const [id, p] of Object.entries(rec?.progress ?? {})) {
    if (knownIds.has(id)) continue;
    attempts += p.attempts;
    correct += p.correctCount;
  }
  return { attempts, correct };
}

import type { ChapterMeta } from "@/lib/chapterMeta";
import { summarize } from "@/lib/storage/records";
import type { SubjectRecords } from "@/lib/storage/schema";

/**
 * 대시보드 집계(순수 함수). 모든 수치는 "완전히 맞음" 기준이다(부분 점수는 세지 않음).
 * - 진행률 = 한 번이라도 푼 문제 / 전체 문제
 * - 정답률 = 완전히 맞힌 횟수 / 푼 횟수 (`summarize`)
 * - ⭐ 달성도 = ⭐ 문제 중 **마지막 풀이가 완전히 맞음**(lastScore === 1)인 문제 / ⭐ 문제 수
 * 자기 채점(서술형 essay)은 정답률(summarize)과 ⭐ 달성도(분모·분자 모두)에서 빠지고, 진행률(푼 문제)에만 들어간다.
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
  const done = (id: string) => r.progress[id]?.lastScore === 1;
  return {
    total: ids.length,
    solved: ids.filter((id) => r.progress[id]).length,
    attempts: s.attempts,
    correct: s.correct,
    rate: s.rate,
    star: starIds.length,
    starDone: starIds.filter(done).length,
    openWrong: s.openWrong,
    ...(by
      ? {
          starBy: {
            hw: by.hw.length,
            hwDone: by.hw.filter(done).length,
            hint: by.hint.length,
            hintDone: by.hint.filter(done).length,
          },
        }
      : {}),
  };
}

/** ⭐ 달성도 대상: 서술형(자기 채점)은 맞고 틀림이 없어 뺀다 */
const scoredStars = (meta: ChapterMeta, ids: readonly string[]) => {
  const essay = new Set(meta.ids.filter((_, i) => meta.rows[i].type === "essay"));
  return ids.filter((id) => !essay.has(id));
};

export function chapterStats(rec: SubjectRecords | undefined, meta: ChapterMeta) {
  const byTopic = new Map<string, { ids: string[]; star: string[] }>();
  meta.rows.forEach((row, i) => {
    const t = byTopic.get(row.topic) ?? { ids: [], star: [] };
    t.ids.push(meta.ids[i]);
    if (row.exam && row.type !== "essay") t.star.push(meta.ids[i]);
    byTopic.set(row.topic, t);
  });
  return {
    line: statLine(rec, meta.ids, scoredStars(meta, meta.starIds), { hw: scoredStars(meta, meta.starHwIds), hint: scoredStars(meta, meta.starHintIds) }),
    topics: meta.topics.map((t) => ({ topic: t.topic, ...statLine(rec, byTopic.get(t.topic)!.ids, byTopic.get(t.topic)!.star) })),
  };
}

export function subjectStats(rec: SubjectRecords | undefined, chapters: readonly ChapterMeta[]): StatLine {
  return statLine(rec, chapters.flatMap((c) => c.ids), chapters.flatMap((c) => scoredStars(c, c.starIds)), {
    hw: chapters.flatMap((c) => scoredStars(c, c.starHwIds)),
    hint: chapters.flatMap((c) => scoredStars(c, c.starHintIds)),
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

/**
 * 문제 데이터 밖의 기록(생성기로 새로 만든 문제, id에 '-gen-') 풀이 횟수 — 대시보드에 따로 보여 준다.
 * 삭제된 정적 문제의 옛 기록(예: 심리학개론 2026-10-23 재작성 전 psychology-ch01-…)은 생성 문제가 아니므로 세지 않는다.
 */
export function generatedAttempts(rec: SubjectRecords | undefined, knownIds: ReadonlySet<string>) {
  let attempts = 0;
  let correct = 0;
  for (const [id, p] of Object.entries(rec?.progress ?? {})) {
    if (knownIds.has(id) || p.selfCheck || !id.includes("-gen-")) continue;
    attempts += p.attempts;
    correct += p.correctCount;
  }
  return { attempts, correct };
}

import { isHintSource, type SourceFilter } from "./jokbo";
import type { QuizSession, SessionSummary } from "./session";

/**
 * 모의시험 세트(힌트관련1~5) 회차별 점수 — 순수 함수만. 저장: lib/storage/setScoresStore.ts, 화면: 과목 홈 시작 상자(components/quiz/JokboStart.tsx).
 * 끝까지 다 푼 회차(모든 문제에 답하고 결과까지 간 세션)만 기록한다 — 중간에 그만두거나 시간이 끝나 미응답이 남으면 기록하지 않는다.
 */

export interface SetScore {
  /** 결과를 낸 시각(ISO) */
  at: string;
  /** 완전히 맞힌 문제 수(부분 점수는 오답) */
  correct: number;
  total: number;
  /** 같은 세션을 두 번 기록하지 않기 위한 세션 id */
  session: string;
}

/** 분류(source)별 회차 기록, 오래된 것부터 */
export type SetScores = Partial<Record<SourceFilter, SetScore[]>>;

/** 저장소에서 읽은 값 → SetScores(형식이 틀린 항목은 버린다) */
export function parseSetScores(raw: unknown): SetScores {
  if (!raw || typeof raw !== "object") return {};
  const out: SetScores = {};
  for (const [k, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!isHintSource(k as SourceFilter) || !Array.isArray(list)) continue;
    const ok = list.filter(
      (x): x is SetScore =>
        !!x &&
        typeof x === "object" &&
        typeof x.at === "string" &&
        typeof x.session === "string" &&
        Number.isInteger(x.correct) &&
        Number.isInteger(x.total) &&
        x.total > 0 &&
        x.correct >= 0 &&
        x.correct <= x.total,
    );
    if (ok.length) out[k as SourceFilter] = ok;
  }
  return out;
}

/** 이 세션 결과를 회차로 기록할지: 힌트관련 세트이고, 모든 문제에 답했을 때 */
export function setScoreOf(session: QuizSession, summary: SessionSummary, now = new Date()): { source: SourceFilter; score: SetScore } | null {
  if (!isHintSource(session.source) || summary.total === 0 || summary.unanswered > 0 || summary.total !== session.items.length) return null;
  return { source: session.source, score: { at: now.toISOString(), correct: summary.correct, total: summary.total, session: session.id } };
}

/** 회차 추가(같은 세션이면 그대로) */
export function addSetScore(scores: SetScores, source: SourceFilter, score: SetScore): SetScores {
  const list = scores[source] ?? [];
  if (list.some((x) => x.session === score.session)) return scores;
  return { ...scores, [source]: [...list, score] };
}

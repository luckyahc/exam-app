import type { GeneratorRef, GradeResult } from "@/lib/qtypes/base";
import type { AnyAnswer, QType, Question } from "@/lib/qtypes/registry";
import { hashString, mulberry32 } from "@/lib/random";
import { SESSION_KEY } from "@/lib/storage/keys";
import { safeGetJSON, safeSetJSON } from "@/lib/storage/safeStorage";

/**
 * 퀴즈 세션: 어떤 문제를 어떤 순서·모드로 풀고 있는지와 답·채점 결과.
 * `examapp:session`(safeStorage)에 하나만 저장하고, 저장소가 막혀 있으면 메모리 사본으로 동작한다.
 * 문제 본문은 저장하지 않고 id로 다시 불러온다(lib/quiz/loadQuestions.ts).
 */

export type QuizMode = "instant" | "exam";

export interface SessionItem {
  id: string;
  subject: string;
  chapter: string;
  /** 생성기로 만든 문제(비슷한 문제 새로 생성 등): 다시 불러올 때 이 정보로 다시 만든다 */
  gen?: GeneratorRef;
}

export interface QuizSession {
  v: 1;
  id: string;
  createdAt: string;
  mode: QuizMode;
  /** 시험 모드 제한 시간(초). null = 타이머 없음 */
  timerSec: number | null;
  /** 시험 모드 마감 시각(ms). 시작할 때 정한다 */
  deadline: number | null;
  /** 화면 제목: "OS · Ch08", "틀린 문제 다시 풀기" 등 */
  label: string;
  /** 다시 풀기 등에 쓰는 진입 경로 */
  backHref: string;
  items: SessionItem[];
  answers: Record<string, AnyAnswer>;
  results: Record<string, GradeResult>;
  index: number;
  /** 시험 모드: 한 번에 채점을 마쳤는가 / 즉시 채점: 결과 화면으로 넘어갔는가 */
  finished: boolean;
}

// ------------------------------------------------------------------ 필터로 문제 고르기 (순수 함수)

export interface QuizFilter {
  types?: readonly QType[];
  starOnly?: boolean;
  topics?: readonly string[];
  /** 문제 수. null/undefined = 전체 */
  count?: number | null;
  shuffle?: boolean;
  /** 섞기 seed(같은 seed면 같은 순서 — 테스트용). 없으면 호출자가 넣는다 */
  seed: string;
}

export function filterQuestions(questions: readonly Question[], f: QuizFilter): Question[] {
  let out = questions.filter(
    (q) =>
      (!f.types?.length || f.types.includes(q.type)) &&
      (!f.starOnly || q.exam) &&
      (!f.topics?.length || f.topics.includes(q.topic)),
  );
  if (f.shuffle) {
    const rand = mulberry32(hashString(f.seed));
    out = [...out];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
  }
  return f.count ? out.slice(0, f.count) : out;
}

export function newSession(
  questions: readonly Question[],
  opts: { mode: QuizMode; timerSec?: number | null; label: string; backHref: string; now?: number },
): QuizSession {
  const now = opts.now ?? Date.now();
  const timerSec = opts.mode === "exam" ? (opts.timerSec ?? null) : null;
  return {
    v: 1,
    id: `${now.toString(36)}-${hashString(questions.map((q) => q.id).join(",") + now).toString(36)}`,
    createdAt: new Date(now).toISOString(),
    mode: opts.mode,
    timerSec,
    deadline: timerSec ? now + timerSec * 1000 : null,
    label: opts.label,
    backHref: opts.backHref,
    items: questions.map((q) => ({ id: q.id, subject: q.subject, chapter: q.chapter, ...(q.generator ? { gen: q.generator } : {}) })),
    answers: {},
    results: {},
    index: 0,
    finished: false,
  };
}

// ------------------------------------------------------------------ 결과 집계 (순수 함수)

export interface Tally {
  key: string;
  total: number;
  /** 완전히 맞힌 문제 수 — 부분 점수는 정답으로 세지 않는다 */
  correct: number;
}

export interface SessionSummary {
  total: number;
  correct: number;
  /** 채점되지 않은(답하지 않은) 문제 수 */
  unanswered: number;
  /** 틀린 문제(부분 점수만 받은 문제 포함) + 미응답 */
  wrongIds: string[];
  partialIds: string[];
  byType: Tally[];
  byTopic: Tally[];
  bySubject: Tally[];
}

function tally(keys: { key: string; ok: boolean }[]): Tally[] {
  const map = new Map<string, Tally>();
  for (const { key, ok } of keys) {
    const t = map.get(key) ?? { key, total: 0, correct: 0 };
    t.total++;
    if (ok) t.correct++;
    map.set(key, t);
  }
  return [...map.values()];
}

export function summarizeSession(session: QuizSession, questions: ReadonlyMap<string, Question>): SessionSummary {
  const rows = session.items.map((it) => {
    const r = session.results[it.id];
    const q = questions.get(it.id);
    return { it, q, r, ok: r?.correct === true };
  });
  return {
    total: rows.length,
    correct: rows.filter((x) => x.ok).length,
    unanswered: rows.filter((x) => !x.r).length,
    wrongIds: rows.filter((x) => !x.ok).map((x) => x.it.id),
    partialIds: rows.filter((x) => x.r && !x.r.correct && x.r.score > 0).map((x) => x.it.id),
    byType: tally(rows.map((x) => ({ key: x.q?.type ?? "?", ok: x.ok }))),
    byTopic: tally(rows.map((x) => ({ key: x.q?.topic ?? "?", ok: x.ok }))),
    bySubject: tally(rows.map((x) => ({ key: x.it.subject, ok: x.ok }))),
  };
}

// ------------------------------------------------------------------ 저장 (safeStorage + 메모리)

let memory: QuizSession | null = null;

export function saveSession(s: QuizSession): void {
  memory = s;
  safeSetJSON(SESSION_KEY, s);
}

/** 저장된 세션(id가 주어지면 그 id일 때만). 저장소가 막혀 있으면 메모리 사본 */
export function loadSession(id?: string | null): QuizSession | null {
  const stored = safeGetJSON<QuizSession>(SESSION_KEY);
  const s = stored?.v === 1 ? stored : memory;
  if (!s) return null;
  return id && s.id !== id ? (memory?.id === id ? memory : null) : s;
}

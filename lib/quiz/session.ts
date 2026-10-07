import type { GeneratorRef, GradeResult } from "@/lib/qtypes/base";
import { type AnyAnswer, coreFor, gradeQuestion, type QType, type Question } from "@/lib/qtypes/registry";
import { hashString, mulberry32 } from "@/lib/random";
import { SESSION_KEY } from "@/lib/storage/keys";
import { safeGetJSON, safeSetJSON } from "@/lib/storage/safeStorage";
import { matchesStar, type StarBasis } from "./starBasis";
import type { QStatus } from "./status";

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
  /** starOnly일 때 ⭐ 근거(lib/quiz/starBasis.ts). 없으면 전체 ⭐ */
  starBasis?: StarBasis;
  topics?: readonly string[];
  /** 난이도(1~3, 여러 개). 비우면 전체 */
  difficulties?: readonly number[];
  /** 문제 수. null/undefined = 전체 */
  count?: number | null;
  shuffle?: boolean;
  /** 풀이 상태(lib/quiz/status.ts). 비우면 전체. statusOf가 있어야 적용된다 */
  statuses?: readonly QStatus[];
  statusOf?: (id: string) => QStatus;
  /** 이 id들만(문제 목록 "이 목록으로 풀기"·용어 "관련 문제 풀기") — 순서는 questions 순서 */
  ids?: readonly string[];
  /** 섞기 seed(같은 seed면 같은 순서 — 테스트용). 없으면 호출자가 넣는다 */
  seed: string;
}

export function filterQuestions(questions: readonly Question[], f: QuizFilter): Question[] {
  const ids = f.ids ? new Set(f.ids) : null;
  let out = questions.filter(
    (q) =>
      (!ids || ids.has(q.id)) &&
      (!f.statuses?.length || !f.statusOf || f.statuses.includes(f.statusOf(q.id))) &&
      (!f.types?.length || f.types.includes(q.type)) &&
      (!f.starOnly || matchesStar(q, f.starBasis ?? "all")) &&
      (!f.topics?.length || f.topics.includes(q.topic)) &&
      (!f.difficulties?.length || f.difficulties.includes(q.difficulty)),
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

/**
 * 즉시 채점: 지금 문제를 채점해 결과와 **그 답**을 함께 세션에 넣는다(순수 함수).
 * 순서 배치는 처음 섞인 배치가 이미 완성된 답이라 손대지 않고 제출할 수 있다 — 이때도 답을 저장해야
 * 결과 화면이 답을 다시 그릴 수 있다(Sprint 10에서 찾은 결과 화면 오류의 원인).
 */
export function gradeInSession(session: QuizSession, q: Question, answer: AnyAnswer): { session: QuizSession; result: GradeResult } {
  const result = gradeQuestion(q, answer);
  return { session: { ...session, answers: { ...session.answers, [q.id]: answer }, results: { ...session.results, [q.id]: result } }, result };
}

/** 결과 화면에서 채점한 문제를 다시 그릴 때 쓰는 답: 저장된 답, 없으면(예전 세션) 그 유형의 빈 답 */
export function answerForReview(session: QuizSession, q: Question): AnyAnswer {
  return session.answers[q.id] ?? (coreFor(q).emptyAnswer(q as never) as AnyAnswer);
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

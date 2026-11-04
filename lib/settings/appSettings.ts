import { useSyncExternalStore } from "react";
import { SETTINGS_KEY } from "@/lib/storage/keys";
import { safeGetJSON, safeSetJSON } from "@/lib/storage/safeStorage";

/**
 * 설정 탭의 값(기본 문제 수·순서·모드, 과목별 시험 날짜).
 * 저장 위치는 기존 전역 설정 키(examapp:settings) — 백업 내보내기·가져오기·전체 초기화에 이미 들어 있다.
 * 이 키에 다른 값이 있어도 지우지 않고 아래 필드만 덮어쓴다.
 */

export const QUIZ_COUNTS = [10, 20, 30] as const;
export type QuizCount = (typeof QUIZ_COUNTS)[number];
export type QuizOrder = "ordered" | "shuffle";
export type QuizModeSetting = "instant" | "exam";

export interface AppSettings {
  quizCount: QuizCount;
  quizOrder: QuizOrder;
  quizMode: QuizModeSetting;
  /** 과목 id → 준비 중인 시험(CURRENT_EXAM) 날짜 "YYYY-MM-DD" */
  examDates: Record<string, string>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  quizCount: 20,
  quizOrder: "ordered",
  quizMode: "instant",
  examDates: {},
};

const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** 저장된 원시 값에서 아는 필드만 골라 검사한다(모르는 값·잘못된 값은 기본값) */
export function parseSettings(raw: unknown): AppSettings {
  const o = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const dates =
    typeof o.examDates === "object" && o.examDates !== null
      ? (o.examDates as Record<string, unknown>)
      : {};
  return {
    quizCount: QUIZ_COUNTS.includes(o.quizCount as QuizCount)
      ? (o.quizCount as QuizCount)
      : DEFAULT_SETTINGS.quizCount,
    quizOrder: o.quizOrder === "shuffle" ? "shuffle" : "ordered",
    quizMode: o.quizMode === "exam" ? "exam" : "instant",
    examDates: Object.fromEntries(Object.entries(dates).filter(([, v]) => isDate(v))) as Record<
      string,
      string
    >,
  };
}

type State = { loaded: boolean; settings: AppSettings };
const SERVER: State = { loaded: false, settings: DEFAULT_SETTINGS };
let state: State = SERVER;
const listeners = new Set<() => void>();

function load() {
  state = { loaded: true, settings: parseSettings(safeGetJSON(SETTINGS_KEY)) };
}
function emit() {
  for (const l of listeners) l();
}
function onStorage(e: StorageEvent) {
  if (e.key === null || e.key === SETTINGS_KEY) {
    load();
    emit();
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    load(); // 다른 화면(기록 초기화 등)에서 바뀌었을 수 있으니 구독을 시작할 때마다 다시 읽는다
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useAppSettings(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  );
}

export function updateSettings(patch: Partial<AppSettings>) {
  const raw = safeGetJSON<Record<string, unknown>>(SETTINGS_KEY) ?? {};
  const next = { ...parseSettings(raw), ...patch };
  safeSetJSON(SETTINGS_KEY, { ...raw, ...next });
  state = { loaded: true, settings: next };
  emit();
}

/** 기록 초기화 뒤 다시 읽기(전체 초기화는 설정 키도 지운다) */
export function reloadSettings() {
  load();
  emit();
}

/** 오늘(기기 시간대)부터 날짜까지 남은 날. 지난 날짜는 음수 */
export function daysUntil(date: string, today = new Date()): number {
  const [y, m, d] = date.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86_400_000);
}

/** "D-12" · "D-day". 지난 시험이면 null */
export function ddayLabel(date: string | undefined, today = new Date()): string | null {
  if (!date) return null;
  const n = daysUntil(date, today);
  return n < 0 ? null : n === 0 ? "D-day" : `D-${n}`;
}

/** 기본 설정(문제 수·순서·모드)을 퀴즈 주소 쿼리에 넣는다 */
export function applyQuizDefaults(p: URLSearchParams, s: AppSettings) {
  p.set("count", String(s.quizCount));
  p.set("shuffle", s.quizOrder === "shuffle" ? "1" : "0");
  p.set("mode", s.quizMode);
  return p;
}

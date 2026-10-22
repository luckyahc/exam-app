"use client";

import { useSyncExternalStore } from "react";
import { SUBJECTS } from "@/data/subjects/registry";
import type { SourceFilter } from "@/lib/quiz/jokbo";
import { addSetScore, parseSetScores, type SetScore, type SetScores } from "@/lib/quiz/setScores";
import { setScoresKey } from "./keys";
import { safeGetJSON, safeSetJSON } from "./safeStorage";

/**
 * 모의시험 세트 회차 점수 스토어(과목별 `examapp:<과목>:sets`). memoStore와 같은 방식 — 첫 구독 때(렌더 이후) 읽고,
 * 서버 스냅샷은 빈 기록이라 하이드레이션이 어긋나지 않는다. 저장소가 막혀 있으면 메모리에만 남는다.
 */
interface State {
  loaded: boolean;
  bySubject: Record<string, SetScores>;
}

const SERVER: State = { loaded: false, bySubject: {} };
let state: State = SERVER;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  state = { loaded: true, bySubject: Object.fromEntries(SUBJECTS.map((s) => [s.id, parseSetScores(safeGetJSON<unknown>(setScoresKey(s.id)))])) };
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key.endsWith(":sets")) {
    load();
    emit();
  }
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    // 다른 화면(설정의 데이터 초기화 등)에서 지웠을 수 있으니 구독을 새로 시작할 때마다 다시 읽는다
    load();
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const NONE: SetScore[] = [];
/** 이 과목·분류의 회차 기록(오래된 것부터). 서버·첫 렌더에서는 빈 목록 */
export function useSetScores(subjectId: string, source: SourceFilter): SetScore[] {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  );
  return s.bySubject[subjectId]?.[source] ?? NONE;
}

/** 회차 기록(같은 세션은 한 번만). 구독 전이라도 저장소 내용을 덮어쓰지 않게 먼저 읽는다 */
export function recordSetScore(subjectId: string, source: SourceFilter, score: SetScore) {
  if (!state.loaded) load();
  const prev = state.bySubject[subjectId] ?? {};
  const next = addSetScore(prev, source, score);
  if (next === prev) return;
  state = { ...state, bySubject: { ...state.bySubject, [subjectId]: next } };
  safeSetJSON(setScoresKey(subjectId), next);
  emit();
}

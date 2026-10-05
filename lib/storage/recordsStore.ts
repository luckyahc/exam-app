"use client";

import { useSyncExternalStore } from "react";
import { SUBJECTS } from "@/data/subjects/registry";
import type { GeneratorRef, GradeResult } from "@/lib/qtypes/base";
import { ensureStorageMigrated } from "./bootstrap";
import { bookmarksKey, progressKey, wrongKey } from "./keys";
import { recordAttempt } from "./records";
import { safeGetJSON, safeSetJSON } from "./safeStorage";
import { emptySubjectRecords, type SubjectRecords } from "./schema";

/**
 * 과목별 학습 기록(진행·오답·북마크) 스토어. React 밖에 살고 `useSyncExternalStore`로 구독한다.
 * - 첫 구독 때(=클라이언트, 렌더 이후) 마이그레이션을 거친 뒤 과목별 키를 읽는다 — 서버 스냅샷은 빈 기록이라 하이드레이션이 어긋나지 않는다.
 * - 쓰기는 safeStorage만 쓴다. 저장소가 막혀 있으면 메모리에만 남고 앱은 그대로 동작한다.
 * - 다른 탭에서 바뀌면(storage 이벤트) 다시 읽는다.
 */

export interface RecordsState {
  /** 저장소를 한 번이라도 읽었는가(읽기 전에는 진행률을 "—"로 보여 준다) */
  loaded: boolean;
  subjects: Record<string, SubjectRecords>;
}

const SERVER: RecordsState = { loaded: false, subjects: {} };
let state: RecordsState = SERVER;
const listeners = new Set<() => void>();

function readSubject(id: string): SubjectRecords {
  const empty = emptySubjectRecords();
  return {
    progress: safeGetJSON<SubjectRecords["progress"]>(progressKey(id)) ?? empty.progress,
    wrong: safeGetJSON<SubjectRecords["wrong"]>(wrongKey(id)) ?? empty.wrong,
    bookmarks: safeGetJSON<string[]>(bookmarksKey(id)) ?? empty.bookmarks,
  };
}

function load() {
  ensureStorageMigrated();
  state = { loaded: true, subjects: Object.fromEntries(SUBJECTS.map((s) => [s.id, readSubject(s.id)])) };
}

function emit() {
  for (const l of listeners) l();
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key.startsWith("examapp:")) {
    load();
    emit();
  }
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    if (!state.loaded) load();
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export const getSnapshot = () => state;
export const getServerSnapshot = () => SERVER;

export function useRecords(): RecordsState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 이벤트 핸들러에서 쓰기 전에 호출 — 구독 전이라도 저장소 내용을 덮어쓰지 않게 한다 */
function ensureLoaded() {
  if (!state.loaded) load();
}

export function subjectRecords(id: string): SubjectRecords {
  return state.subjects[id] ?? emptySubjectRecords();
}

function save(id: string, next: SubjectRecords) {
  state = { ...state, subjects: { ...state.subjects, [id]: next } };
  safeSetJSON(progressKey(id), next.progress);
  safeSetJSON(wrongKey(id), next.wrong);
  safeSetJSON(bookmarksKey(id), next.bookmarks);
  emit();
}

/** 채점 결과를 기록한다(판정 규칙은 records.ts의 recordAttempt — 완전히 맞아야 정답). */
export function recordResult(
  subjectId: string,
  questionId: string,
  result: Pick<GradeResult, "correct" | "score">,
  gen?: GeneratorRef,
) {
  ensureLoaded();
  save(subjectId, recordAttempt(subjectRecords(subjectId), questionId, result, new Date().toISOString(), gen));
}

export function isBookmarked(s: RecordsState, subjectId: string, questionId: string): boolean {
  return s.subjects[subjectId]?.bookmarks.includes(questionId) ?? false;
}

export function toggleBookmark(subjectId: string, questionId: string) {
  ensureLoaded();
  const cur = subjectRecords(subjectId);
  const bookmarks = cur.bookmarks.includes(questionId)
    ? cur.bookmarks.filter((id) => id !== questionId)
    : [...cur.bookmarks, questionId];
  save(subjectId, { ...cur, bookmarks });
}

/** 테스트용: 메모리 상태 초기화 */
export function __resetRecordsStore() {
  state = SERVER;
  listeners.clear();
}

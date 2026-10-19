"use client";

import { useSyncExternalStore } from "react";
import { FUNCTION_SUBJECTS } from "@/lib/dsFunctions";
import { emptyMemo, markMemo, type MemoDir, type MemoRecords, parseMemo } from "@/lib/dsMemorize";
import { memoKey } from "./keys";
import { safeGetJSON, safeSetJSON } from "./safeStorage";

/**
 * 함수 정리 암기 기록 스토어(과목별 `examapp:<과목>:memo`). recordsStore와 같은 방식 — 첫 구독 때(렌더 이후) 읽고,
 * 서버 스냅샷은 빈 기록이라 하이드레이션이 어긋나지 않는다. 저장소가 막혀 있으면 메모리에만 남는다.
 */
export interface MemoState {
  loaded: boolean;
  bySubject: Record<string, MemoRecords>;
}

const SERVER: MemoState = { loaded: false, bySubject: {} };
let state: MemoState = SERVER;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const read = (id: string) => parseMemo(safeGetJSON<unknown>(memoKey(id)));
function load() {
  state = {
    loaded: true,
    bySubject: Object.fromEntries(FUNCTION_SUBJECTS.map((id) => [id, read(id)])),
  };
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key.endsWith(":memo")) {
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

/** 이벤트 핸들러에서 쓰기 전 — 구독 전이라도 저장소 내용을 덮어쓰지 않게 읽어 둔다 */
export function memoOf(id: string): MemoRecords {
  if (!state.loaded) load();
  return state.bySubject[id] ?? emptyMemo();
}

const EMPTY = emptyMemo();
export function useMemoRecords(subjectId: string): { loaded: boolean; records: MemoRecords } {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  );
  return { loaded: s.loaded, records: s.bySubject[subjectId] ?? EMPTY };
}

export function setMemo(subjectId: string, next: MemoRecords) {
  if (!state.loaded) load();
  state = { ...state, bySubject: { ...state.bySubject, [subjectId]: next } };
  safeSetJSON(memoKey(subjectId), next);
  emit();
}

export function markFunction(subjectId: string, dir: MemoDir, id: string, known: boolean) {
  setMemo(subjectId, markMemo(memoOf(subjectId), dir, id, known, new Date()));
}

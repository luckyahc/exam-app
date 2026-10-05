import { CURRENT_SCHEMA, type LegacyV1, type StoreV2, type SubjectRecords } from "./schema";
import { mergeStores, normalizeSubjectRecords, upgradeV1toV2 } from "./upgrade";

/**
 * 학습 기록 JSON 내보내기·가져오기 (multi-subject-design.md §5-4). 모두 순수 함수 — 저장소 접근은 호출자가 한다.
 * 가져오기는 예외를 던지지 않고 { ok: false, error }로 돌려준다(앱이 죽지 않게).
 */

export const BACKUP_APP = "os-exam-app";
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  settings: Record<string, unknown>;
  subjects: Record<string, SubjectRecords>;
}

/** 내보내기: subjectIds를 주면 그 과목만, 없으면 전체 */
export function exportBackup(store: StoreV2, now: Date, subjectIds?: readonly string[]): BackupFile {
  const ids = subjectIds ?? Object.keys(store.subjects);
  return {
    app: BACKUP_APP,
    version: CURRENT_SCHEMA,
    exportedAt: now.toISOString(),
    settings: { ...store.settings },
    subjects: Object.fromEntries(ids.filter((id) => id in store.subjects).map((id) => [id, store.subjects[id]])),
  };
}

export type ParseResult =
  | {
      ok: true;
      /** 레지스트리에 있는 과목만 담긴 기록 */
      store: StoreV2;
      fromVersion: number;
      /** 파일에는 있지만 레지스트리에 없어 건너뛴 과목 */
      skippedSubjects: string[];
    }
  | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** 과목 기록 하나의 최소 구조 검사(값 세부는 normalizeSubjectRecords가 관대하게 정규화) */
function looksLikeSubject(v: unknown): v is { progress: unknown; wrong: unknown; bookmarks: unknown } {
  return (
    isObject(v) &&
    (v.progress === undefined || isObject(v.progress)) &&
    (v.wrong === undefined || isObject(v.wrong)) &&
    (v.bookmarks === undefined || Array.isArray(v.bookmarks))
  );
}

function looksLikeV1(v: Record<string, unknown>): boolean {
  return "wrongNotes" in v || "bookmarks" in v || Object.keys(v).some((k) => k.startsWith("progress:"));
}

/**
 * 가져오기 파일 해석: 크기 → JSON → 버전 판별(숫자 / 없음+v1 형태 / 그 외 거부 / 미래 버전 거부) → v1은 upgradeV1toV2 →
 * 구조 검사 → 정규화. 레지스트리에 없는 과목은 건너뛰고 알린다.
 */
export function parseBackup(text: string, knownSubjects: readonly string[]): ParseResult {
  if (new Blob([text]).size > MAX_BACKUP_BYTES) return { ok: false, error: "파일이 너무 큽니다(5MB 초과)." };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSON 형식이 아닙니다. 이 앱에서 내보낸 파일인지 확인하세요." };
  }
  if (!isObject(raw)) return { ok: false, error: "이 앱의 백업 파일이 아닙니다." };

  let store: StoreV2;
  let fromVersion: number;
  if (typeof raw.version === "number") {
    fromVersion = raw.version;
    if (!Number.isInteger(fromVersion) || fromVersion < 1) return { ok: false, error: "이 앱의 백업 파일이 아닙니다(버전 값이 잘못됨)." };
    if (fromVersion > CURRENT_SCHEMA)
      return { ok: false, error: `더 새로운 앱(버전 ${fromVersion})에서 만든 파일입니다. 앱을 업데이트한 뒤 가져오세요.` };
    if (raw.app !== undefined && raw.app !== BACKUP_APP) return { ok: false, error: "다른 앱의 백업 파일입니다." };
    if (fromVersion === 1) {
      store = upgradeV1toV2(toLegacy(raw));
    } else {
      if (!isObject(raw.subjects)) return { ok: false, error: "백업 파일에 과목 기록(subjects)이 없습니다." };
      const subjects: Record<string, SubjectRecords> = {};
      for (const [id, v] of Object.entries(raw.subjects)) {
        if (!looksLikeSubject(v)) return { ok: false, error: `'${id}' 과목 기록의 형식이 잘못되었습니다.` };
        subjects[id] = normalizeSubjectRecords({ progress: v.progress ?? {}, wrong: v.wrong ?? {}, bookmarks: v.bookmarks ?? [] });
      }
      store = { settings: isObject(raw.settings) ? { ...raw.settings } : {}, subjects };
    }
  } else if (raw.version === undefined && looksLikeV1(raw)) {
    fromVersion = 1;
    store = upgradeV1toV2(toLegacy(raw));
  } else {
    return { ok: false, error: "이 앱의 백업 파일이 아닙니다." };
  }

  const skippedSubjects = Object.keys(store.subjects).filter((id) => !knownSubjects.includes(id));
  const known = Object.fromEntries(Object.entries(store.subjects).filter(([id]) => knownSubjects.includes(id)));
  return { ok: true, store: { settings: store.settings, subjects: known }, fromVersion, skippedSubjects };
}

/** v1 백업: `progress:{chapter}` 키들 + wrongNotes + bookmarks + settings */
function toLegacy(raw: Record<string, unknown>): LegacyV1 {
  const progress: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) if (k.startsWith("progress:")) progress[k.slice("progress:".length)] = v;
  if (isObject(raw.progress)) Object.assign(progress, raw.progress);
  return { progress, wrongNotes: raw.wrongNotes, bookmarks: raw.bookmarks, settings: raw.settings };
}

export type ImportMode = "overwrite" | "merge";

/**
 * 가져온 기록 반영: 파일에 들어 있는 과목만 바꾼다. overwrite = 그 과목 기록을 파일 내용으로 교체,
 * merge = 기존 기록과 합침(횟수는 큰 값·날짜는 최신·북마크는 합집합 — mergeStores 규칙). 설정은 파일 값이 덮는다.
 */
export function applyBackup(current: StoreV2, imported: StoreV2, mode: ImportMode): StoreV2 {
  if (mode === "merge") return mergeStores(current, imported);
  return {
    settings: { ...current.settings, ...imported.settings },
    subjects: { ...current.subjects, ...imported.subjects },
  };
}

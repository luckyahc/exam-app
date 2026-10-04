import {
  bookmarksKey,
  LEGACY_BOOKMARKS_KEY,
  LEGACY_OS_CHAPTERS,
  LEGACY_PROGRESS_PREFIX,
  LEGACY_SETTINGS_KEY,
  LEGACY_WRONG_KEY,
  progressKey,
  SCHEMA_KEY,
  SETTINGS_KEY,
  wrongKey,
} from "./keys";
import { CURRENT_SCHEMA, type LegacyV1, type StoreV2 } from "./schema";
import { mergeStores, normalizeSubjectRecords, upgradeV1toV2 } from "./upgrade";

/** localStorage와 같은 모양의 최소 인터페이스(테스트에서 메모리 구현을 주입). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly length: number;
  key(index: number): string | null;
}

export type MigrationStatus =
  | "unavailable" // 저장소 자체를 쓸 수 없음(차단·SSR) — 아무것도 하지 않음
  | "fresh" // 신규 사용자: 스키마 버전만 기록
  | "current" // 이미 최신 스키마
  | "migrated" // v1 → v2 변환 완료, v1 키 삭제
  | "retry-later" // 쓰기 실패: v1 키 보존, 다음 실행 때 재시도. data는 이번 세션용 변환 결과
  | "future-readonly"; // 더 새로운 앱이 쓴 데이터: 건드리지 않음

export interface MigrationResult {
  status: MigrationStatus;
  fromVersion: number | null;
  data?: StoreV2;
}

// 모든 저장소 접근은 예외를 삼킨다(사생활 보호 모드·용량 초과·차단에서도 앱이 죽지 않게).
function read(s: StorageLike, key: string): string | null {
  try {
    return s.getItem(key);
  } catch {
    return null;
  }
}
function write(s: StorageLike, key: string, value: unknown): boolean {
  try {
    s.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function remove(s: StorageLike, key: string): void {
  try {
    s.removeItem(key);
  } catch {
    /* 지우지 못해도 schema=2가 기록됐으므로 다시 마이그레이션하지 않는다 */
  }
}
function parse(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function legacyProgressKeys(s: StorageLike): string[] {
  const keys = new Set<string>(LEGACY_OS_CHAPTERS.map((c) => LEGACY_PROGRESS_PREFIX + c));
  try {
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k?.startsWith(LEGACY_PROGRESS_PREFIX)) keys.add(k);
    }
  } catch {
    /* 키 열거가 막히면 알려진 OS 챕터 키만 본다 */
  }
  return [...keys];
}

/** v1 키를 읽는다. 하나도 없으면 null. 깨진 JSON 값은 "없음"으로 취급. */
function readLegacy(s: StorageLike): { data: LegacyV1; keys: string[] } | null {
  const keys: string[] = [];
  const progress: Record<string, unknown> = {};
  for (const k of legacyProgressKeys(s)) {
    const raw = read(s, k);
    if (raw === null) continue;
    keys.push(k);
    progress[k.slice(LEGACY_PROGRESS_PREFIX.length)] = parse(raw);
  }
  const single = (k: string) => {
    const raw = read(s, k);
    if (raw !== null) keys.push(k);
    return parse(raw);
  };
  const data: LegacyV1 = {
    progress,
    wrongNotes: single(LEGACY_WRONG_KEY),
    bookmarks: single(LEGACY_BOOKMARKS_KEY),
    settings: single(LEGACY_SETTINGS_KEY),
  };
  return keys.length > 0 ? { data, keys } : null;
}

function readV2(s: StorageLike, subjectIds: readonly string[]): StoreV2 {
  const subjects: StoreV2["subjects"] = {};
  for (const id of subjectIds) {
    const raw = {
      progress: parse(read(s, progressKey(id))),
      wrong: parse(read(s, wrongKey(id))),
      bookmarks: parse(read(s, bookmarksKey(id))),
    };
    if (raw.progress !== undefined || raw.wrong !== undefined || raw.bookmarks !== undefined) {
      subjects[id] = normalizeSubjectRecords(raw);
    }
  }
  const settings = parse(read(s, SETTINGS_KEY));
  return {
    settings:
      typeof settings === "object" && settings !== null && !Array.isArray(settings)
        ? (settings as Record<string, unknown>)
        : {},
    subjects,
  };
}

function writeV2(s: StorageLike, store: StoreV2): boolean {
  let ok = write(s, SETTINGS_KEY, store.settings);
  for (const [id, recs] of Object.entries(store.subjects)) {
    ok = write(s, progressKey(id), recs.progress) && ok;
    ok = write(s, wrongKey(id), recs.wrong) && ok;
    ok = write(s, bookmarksKey(id), recs.bookmarks) && ok;
  }
  return ok;
}

function readVersion(s: StorageLike): number | null {
  const v = parse(read(s, SCHEMA_KEY));
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
}

function usable(s: StorageLike | null): s is StorageLike {
  if (!s) return false;
  try {
    s.getItem(SCHEMA_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * 첫 실행 자동 마이그레이션. 순서가 핵심: 새 키 쓰기 → 성공 확인 → 스키마 버전 기록 → 옛 키 삭제.
 * 어느 단계에서 중단돼도 데이터가 사라지지 않고, 다시 실행해도 결과가 같다(멱등).
 */
export function runMigrations(
  storage: StorageLike | null,
  subjectIds: readonly string[],
): MigrationResult {
  if (!usable(storage)) return { status: "unavailable", fromVersion: null };
  const s = storage;

  let version = readVersion(s);
  const legacy = version === null || version === 1 ? readLegacy(s) : null;

  if (version === null) {
    if (!legacy) {
      write(s, SCHEMA_KEY, CURRENT_SCHEMA);
      return { status: "fresh", fromVersion: null };
    }
    version = 1;
  }

  if (version > CURRENT_SCHEMA) return { status: "future-readonly", fromVersion: version };
  if (version === CURRENT_SCHEMA) return { status: "current", fromVersion: version };

  // version === 1
  const upgraded = legacy ? upgradeV1toV2(legacy.data) : { settings: {}, subjects: {} };
  const ids = [...new Set([...subjectIds, ...Object.keys(upgraded.subjects)])];
  const merged = mergeStores(readV2(s, ids), upgraded);

  if (!writeV2(s, merged) || !write(s, SCHEMA_KEY, CURRENT_SCHEMA)) {
    return { status: "retry-later", fromVersion: 1, data: merged };
  }
  for (const k of legacy?.keys ?? []) remove(s, k);
  return { status: "migrated", fromVersion: 1, data: merged };
}

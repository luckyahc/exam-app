import { migrateLegacyQuestionId } from "./migrateId";
import {
  emptySubjectRecords,
  type LegacyV1,
  type ProgressRecord,
  type StoreV2,
  type SubjectRecords,
  type WrongRecord,
} from "./schema";

/**
 * 순수 함수 모음. localStorage 마이그레이션(migrate.ts)과 백업 JSON 가져오기(Sprint 8)가
 * 같은 변환을 쓰도록 여기에 둔다. v1 값 형식은 확정 문서가 없으므로 배열(id 목록)과
 * 객체(id → 기록)를 모두 받아들이고, 해석 못 하는 항목은 건너뛴다. 예외를 던지지 않는다.
 */

const LEGACY_SUBJECT = "os";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/** 기록 묶음(배열 또는 객체)을 [id, 원시 기록] 쌍으로 펼친다. */
function entries(raw: unknown): [string, unknown][] {
  if (Array.isArray(raw)) {
    const out: [string, unknown][] = [];
    for (const item of raw) {
      if (typeof item === "string") out.push([item, null]);
      else if (isObject(item) && typeof item.id === "string") out.push([item.id, item]);
    }
    return out;
  }
  if (isObject(raw)) return Object.entries(raw);
  return [];
}

function toProgress(raw: unknown): ProgressRecord {
  const r = isObject(raw) ? raw : {};
  const attempts = num(r.attempts, 1);
  const lastScore =
    typeof r.lastScore === "number" ? r.lastScore : typeof r.score === "number" ? r.score : null;
  return {
    attempts,
    correctCount: Math.min(num(r.correctCount ?? r.correct, 0), attempts),
    lastScore: lastScore !== null && lastScore >= 0 && lastScore <= 1 ? lastScore : null,
    lastAt: str(r.lastAt),
  };
}

function toWrong(raw: unknown): WrongRecord {
  const r = isObject(raw) ? raw : {};
  const wrongCount = num(r.wrongCount ?? r.count, 1);
  return {
    wrongCount,
    attempts: Math.max(num(r.attempts, wrongCount), wrongCount),
    lastWrongAt: str(r.lastWrongAt ?? r.lastAt),
    resolved: r.resolved === true,
  };
}

function toBookmarks(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (isObject(raw)) return Object.keys(raw).filter((k) => raw[k] !== false);
  return [];
}

export function upgradeV1toV2(v1: LegacyV1): StoreV2 {
  const records = emptySubjectRecords();
  for (const chapterRaw of Object.values(v1.progress)) {
    for (const [id, raw] of entries(chapterRaw)) {
      records.progress[migrateLegacyQuestionId(id)] = toProgress(raw);
    }
  }
  for (const [id, raw] of entries(v1.wrongNotes)) {
    records.wrong[migrateLegacyQuestionId(id)] = toWrong(raw);
  }
  records.bookmarks = [...new Set(toBookmarks(v1.bookmarks).map(migrateLegacyQuestionId))];
  return {
    settings: isObject(v1.settings) ? { ...v1.settings } : {},
    subjects: { [LEGACY_SUBJECT]: records },
  };
}

function later(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

function mergeProgress(a: ProgressRecord, b: ProgressRecord): ProgressRecord {
  const newer = later(a.lastAt, b.lastAt) === b.lastAt ? b : a;
  return {
    attempts: Math.max(a.attempts, b.attempts),
    correctCount: Math.max(a.correctCount, b.correctCount),
    lastScore: newer.lastScore ?? a.lastScore ?? b.lastScore,
    lastAt: later(a.lastAt, b.lastAt),
  };
}

function mergeWrong(a: WrongRecord, b: WrongRecord): WrongRecord {
  const newer = later(a.lastWrongAt, b.lastWrongAt) === b.lastWrongAt ? b : a;
  return {
    wrongCount: Math.max(a.wrongCount, b.wrongCount),
    attempts: Math.max(a.attempts, b.attempts),
    lastWrongAt: later(a.lastWrongAt, b.lastWrongAt),
    resolved: newer.resolved,
    ...(a.gen || b.gen ? { gen: newer.gen ?? a.gen ?? b.gen } : {}),
  };
}

function mergeMap<T>(a: Record<string, T>, b: Record<string, T>, merge: (x: T, y: T) => T) {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? merge(out[k], v) : v;
  return out;
}

function mergeSubject(a: SubjectRecords, b: SubjectRecords): SubjectRecords {
  return {
    progress: mergeMap(a.progress, b.progress, mergeProgress),
    wrong: mergeMap(a.wrong, b.wrong, mergeWrong),
    bookmarks: [...new Set([...a.bookmarks, ...b.bookmarks])],
  };
}

/**
 * 두 스토어를 합친다(부분 실패 후 재시도·탭 두 개 동시 실행 대비).
 * 같은 문제면 횟수는 큰 값, 날짜는 최신 값, 북마크는 합집합. 결합 법칙·멱등.
 */
export function mergeStores(a: StoreV2, b: StoreV2): StoreV2 {
  const subjects: Record<string, SubjectRecords> = { ...a.subjects };
  for (const [id, recs] of Object.entries(b.subjects)) {
    subjects[id] = id in subjects ? mergeSubject(subjects[id], recs) : recs;
  }
  return { settings: { ...a.settings, ...b.settings }, subjects };
}

/** 저장소에서 읽은 v2 값 하나를 안전하게 SubjectRecords로 정규화한다. */
export function normalizeSubjectRecords(raw: {
  progress: unknown;
  wrong: unknown;
  bookmarks: unknown;
}): SubjectRecords {
  const out = emptySubjectRecords();
  for (const [id, r] of entries(raw.progress)) out.progress[id] = toProgress(r);
  for (const [id, r] of entries(raw.wrong)) {
    const w = toWrong(r);
    const g = isObject(r) && isObject(r.gen) ? r.gen : null;
    if (g && typeof g.name === "string" && typeof g.seed === "number" && isObject(g.params)) {
      w.gen = { name: g.name, seed: g.seed, params: g.params };
    }
    out.wrong[id] = w;
  }
  out.bookmarks = [...new Set(toBookmarks(raw.bookmarks))];
  return out;
}

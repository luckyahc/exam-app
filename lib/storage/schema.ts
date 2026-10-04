/** 학습 기록 스키마. v1 = OS 단일 과목(계획 형식), v2 = 과목별 키. */
export const CURRENT_SCHEMA = 2;

export interface ProgressRecord {
  attempts: number;
  correctCount: number;
  /** 0..1, 기록이 없으면 null */
  lastScore: number | null;
  /** ISO 문자열 */
  lastAt: string | null;
}

export interface WrongRecord {
  wrongCount: number;
  attempts: number;
  lastWrongAt: string | null;
  resolved: boolean;
  /** 생성기 문제 재생성 정보 */
  gen?: { name: string; params: Record<string, unknown>; seed: number };
}

export interface SubjectRecords {
  progress: Record<string, ProgressRecord>;
  wrong: Record<string, WrongRecord>;
  bookmarks: string[];
}

export interface StoreV2 {
  settings: Record<string, unknown>;
  subjects: Record<string, SubjectRecords>;
}

/** v1 원시 값. 형식이 확정된 적 없으므로 전부 unknown으로 받고 변환기에서 관대하게 해석한다. */
export interface LegacyV1 {
  progress: Record<string, unknown>;
  wrongNotes: unknown;
  bookmarks: unknown;
  settings: unknown;
}

export function emptySubjectRecords(): SubjectRecords {
  return { progress: {}, wrong: {}, bookmarks: [] };
}

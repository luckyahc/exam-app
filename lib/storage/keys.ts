/**
 * localStorage 키는 이 파일의 상수/함수로만 만든다(문자열 직접 조립 금지).
 * 스키마 v2: 전역 키 + 과목별 키. 설계: docs/multi-subject-design.md §5.
 */

/** FOUC 방지 인라인 스크립트가 읽는 키라 이름을 바꾸지 않는다(lib/theme/constants.ts). */
export { THEME_STORAGE_KEY } from "@/lib/theme/constants";

export const SCHEMA_KEY = "examapp:schema";
export const SETTINGS_KEY = "examapp:settings";
export const SESSION_KEY = "examapp:session";

export const progressKey = (subjectId: string) => `examapp:${subjectId}:progress`;
export const wrongKey = (subjectId: string) => `examapp:${subjectId}:wrong`;
export const bookmarksKey = (subjectId: string) => `examapp:${subjectId}:bookmarks`;
/** 함수 정리 암기 기록(방향 A·B별 함수 id → 알았음/몰랐음, 마지막 확인 시각). lib/dsMemorize.ts */
export const memoKey = (subjectId: string) => `examapp:${subjectId}:memo`;
/** 모의시험 세트(힌트관련1~5) 회차별 점수. lib/storage/setScoresStore.ts */
export const setScoresKey = (subjectId: string) => `examapp:${subjectId}:sets`;
/** 챕터 화면 "직접 고르기"의 마지막 설정(챕터 id → 조건·문제 수·순서·모드). lib/quiz/startPrefs.ts */
export const startPrefsKey = (subjectId: string) => `examapp:${subjectId}:start`;
/** 고유 기기 수 집계용 무작위 번호와 마지막으로 알린 날짜. lib/analytics/deviceVisit.ts */
export const DEVICE_KEY = "examapp:device";
/** 저장소에 쓸 수 있는지 확인용(쓰고 바로 지운다). 문제 풀이 화면의 나가기 확인 */
export const PROBE_KEY = "examapp:probe";

/** v1(다과목 전환 전, OS 단일 과목) 키. 01-architecture.md에 계획돼 있던 형식. */
export const LEGACY_PROGRESS_PREFIX = "progress:";
export const LEGACY_WRONG_KEY = "wrongNotes";
export const LEGACY_BOOKMARKS_KEY = "bookmarks";
export const LEGACY_SETTINGS_KEY = "settings";
export const LEGACY_OS_CHAPTERS = ["ch02", "ch03", "ch07", "ch08"] as const;

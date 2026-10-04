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

/** v1(다과목 전환 전, OS 단일 과목) 키. 01-architecture.md에 계획돼 있던 형식. */
export const LEGACY_PROGRESS_PREFIX = "progress:";
export const LEGACY_WRONG_KEY = "wrongNotes";
export const LEGACY_BOOKMARKS_KEY = "bookmarks";
export const LEGACY_SETTINGS_KEY = "settings";
export const LEGACY_OS_CHAPTERS = ["ch02", "ch03", "ch07", "ch08"] as const;

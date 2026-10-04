import { SUBJECTS } from "@/data/subjects/registry";
import { runMigrations, type MigrationResult } from "./migrate";
import { getBrowserStorage } from "./safeStorage";

let result: MigrationResult | null = null;

/**
 * 클라이언트에서 한 번만 마이그레이션을 실행하고 결과를 기억한다.
 * 학습 기록 스토어(Sprint 7)는 이 함수를 거친 뒤 과목별 키를 읽는다.
 * 반드시 useEffect/이벤트 핸들러 안에서 호출할 것(렌더 중 호출 금지).
 */
export function ensureStorageMigrated(): MigrationResult {
  result ??= runMigrations(
    getBrowserStorage(),
    SUBJECTS.map((s) => s.id),
  );
  return result;
}

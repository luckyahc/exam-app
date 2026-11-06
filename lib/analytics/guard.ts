import { createHash, timingSafeEqual } from "node:crypto";

/** 관리자 비밀번호 확인(서버 전용). 비밀번호는 환경 변수 ADMIN_PASSWORD에만 둔다 — 저장소가 공개라 코드에 적지 않는다 */
export function passwordMatches(input: unknown, expected: string): boolean {
  if (typeof input !== "string") return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(input), hash(expected));
}

/**
 * 비밀번호를 연달아 틀리면 잠깐 막는다. 짧은 비밀번호를 무작위로 맞히는 시도를 늦추는 용도이고,
 * 서버 인스턴스마다 따로 세므로 완전한 차단은 아니다.
 */
export function createLimiter(
  { max, windowMs }: { max: number; windowMs: number },
  clock: () => number = Date.now,
) {
  const fails = new Map<string, { count: number; until: number }>();
  return {
    blocked(key: string) {
      const f = fails.get(key);
      if (!f) return false;
      if (clock() >= f.until) {
        fails.delete(key);
        return false;
      }
      return f.count >= max;
    },
    fail(key: string) {
      const f = fails.get(key);
      fails.set(key, { count: (f?.count ?? 0) + 1, until: clock() + windowMs });
    },
    reset(key: string) {
      fails.delete(key);
    },
  };
}

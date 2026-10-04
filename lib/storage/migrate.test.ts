import { describe, expect, it } from "vitest";
import { runMigrations, type StorageLike } from "./migrate";

const SUBJECTS = ["os", "data-comm"];

/** 메모리 Storage. failOn에 걸린 키는 setItem이 QuotaExceeded처럼 실패한다. */
class MemoryStorage implements StorageLike {
  map = new Map<string, string>();
  failOn: (key: string) => boolean = () => false;
  constructor(init: Record<string, unknown> = {}) {
    for (const [k, v] of Object.entries(init))
      this.map.set(k, typeof v === "string" ? v : JSON.stringify(v));
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.failOn(k)) throw new DOMException("quota", "QuotaExceededError");
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  get length() {
    return this.map.size;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  json(k: string) {
    const v = this.map.get(k);
    return v === undefined ? undefined : JSON.parse(v);
  }
}

class BlockedStorage implements StorageLike {
  getItem(): string | null {
    throw new DOMException("denied", "SecurityError");
  }
  setItem() {
    throw new DOMException("denied", "SecurityError");
  }
  removeItem() {
    throw new DOMException("denied", "SecurityError");
  }
  get length(): number {
    throw new DOMException("denied", "SecurityError");
  }
  key(): string | null {
    throw new DOMException("denied", "SecurityError");
  }
}

const V1 = {
  theme: "dark",
  "progress:ch08": {
    "ch08-clock-001": { attempts: 2, correctCount: 1, lastScore: 0, lastAt: "2026-10-01" },
  },
  "progress:ch02": ["ch02-os-001"],
  wrongNotes: { "ch08-clock-001": { wrongCount: 1, attempts: 2, lastWrongAt: "2026-10-01" } },
  bookmarks: ["ch07-buddy-002"],
  settings: { mode: "exam" },
};

describe("runMigrations", () => {
  it("신규 사용자: 스키마 버전만 기록", () => {
    const s = new MemoryStorage();
    expect(runMigrations(s, SUBJECTS).status).toBe("fresh");
    expect(s.json("examapp:schema")).toBe(2);
    expect([...s.map.keys()]).toEqual(["examapp:schema"]);
  });

  it("v1 전체: 과목별 키로 옮기고 v1 키 삭제, 테마는 유지", () => {
    const s = new MemoryStorage(V1);
    const r = runMigrations(s, SUBJECTS);
    expect(r.status).toBe("migrated");
    expect(s.json("examapp:schema")).toBe(2);
    expect(Object.keys(s.json("examapp:os:progress")).sort()).toEqual([
      "os-ch02-os-001",
      "os-ch08-clock-001",
    ]);
    expect(s.json("examapp:os:wrong")["os-ch08-clock-001"].wrongCount).toBe(1);
    expect(s.json("examapp:os:bookmarks")).toEqual(["os-ch07-buddy-002"]);
    expect(s.json("examapp:settings")).toEqual({ mode: "exam" });
    for (const k of ["progress:ch08", "progress:ch02", "wrongNotes", "bookmarks", "settings"]) {
      expect(s.map.has(k)).toBe(false);
    }
    expect(s.getItem("theme")).toBe("dark");
  });

  it("v1 일부(북마크만): 있는 것만 옮긴다", () => {
    const s = new MemoryStorage({ bookmarks: ["ch03-a-001"] });
    expect(runMigrations(s, SUBJECTS).status).toBe("migrated");
    expect(s.json("examapp:os:bookmarks")).toEqual(["os-ch03-a-001"]);
    expect(s.json("examapp:os:progress")).toEqual({});
  });

  it("v1 + v2 공존(지난번 중단 후 재시도): 합쳐서 데이터 손실 없음", () => {
    const s = new MemoryStorage({
      ...V1,
      "examapp:os:bookmarks": ["os-ch02-x-001"],
      "examapp:os:progress": {
        "os-ch08-clock-001": { attempts: 5, correctCount: 4, lastScore: 1, lastAt: "2026-10-03" },
      },
    });
    expect(runMigrations(s, SUBJECTS).status).toBe("migrated");
    expect(s.json("examapp:os:bookmarks")).toEqual(["os-ch02-x-001", "os-ch07-buddy-002"]);
    expect(s.json("examapp:os:progress")["os-ch08-clock-001"]).toEqual({
      attempts: 5,
      correctCount: 4,
      lastScore: 1,
      lastAt: "2026-10-03",
    });
  });

  it("쓰기 실패(용량 초과): v1 키 보존 + 스키마 미기록 → 다음 실행에서 재시도 성공", () => {
    const s = new MemoryStorage(V1);
    s.failOn = (k) => k === "examapp:os:wrong";
    const r = runMigrations(s, SUBJECTS);
    expect(r.status).toBe("retry-later");
    expect(r.data?.subjects.os.bookmarks).toEqual(["os-ch07-buddy-002"]); // 이번 세션은 메모리 데이터로 동작
    expect(s.map.has("examapp:schema")).toBe(false);
    expect(s.map.has("wrongNotes")).toBe(true);
    expect(s.map.has("bookmarks")).toBe(true);

    s.failOn = () => false;
    expect(runMigrations(s, SUBJECTS).status).toBe("migrated");
    expect(s.json("examapp:os:wrong")["os-ch08-clock-001"].wrongCount).toBe(1);
    expect(s.map.has("wrongNotes")).toBe(false);
  });

  it("스키마 버전 쓰기만 실패해도 v1 키는 지우지 않는다", () => {
    const s = new MemoryStorage(V1);
    s.failOn = (k) => k === "examapp:schema";
    expect(runMigrations(s, SUBJECTS).status).toBe("retry-later");
    expect(s.map.has("wrongNotes")).toBe(true);
  });

  it("저장소 완전 차단·없음: 예외 없이 unavailable", () => {
    expect(runMigrations(new BlockedStorage(), SUBJECTS).status).toBe("unavailable");
    expect(runMigrations(null, SUBJECTS).status).toBe("unavailable");
  });

  it("이미 v2: 아무것도 바꾸지 않는다", () => {
    const s = new MemoryStorage({
      "examapp:schema": 2,
      "examapp:os:bookmarks": ["os-a"],
      bookmarks: ["stray"],
    });
    const before = new Map(s.map);
    expect(runMigrations(s, SUBJECTS).status).toBe("current");
    expect(s.map).toEqual(before);
  });

  it("미래 버전: 읽기 전용, 아무것도 쓰지 않는다", () => {
    const s = new MemoryStorage({ "examapp:schema": 3, bookmarks: ["ch02-a-001"] });
    const before = new Map(s.map);
    expect(runMigrations(s, SUBJECTS)).toEqual({ status: "future-readonly", fromVersion: 3 });
    expect(s.map).toEqual(before);
  });

  it("깨진 JSON: 해석 가능한 것만 옮기고 죽지 않는다", () => {
    const s = new MemoryStorage({
      "examapp:schema": "{깨짐",
      wrongNotes: "{not json",
      bookmarks: ["ch02-a-001"],
    });
    expect(runMigrations(s, SUBJECTS).status).toBe("migrated");
    expect(s.json("examapp:os:bookmarks")).toEqual(["os-ch02-a-001"]);
    expect(s.json("examapp:os:wrong")).toEqual({});
  });

  it("멱등: 두 번 실행해도 결과가 같다", () => {
    const s = new MemoryStorage(V1);
    runMigrations(s, SUBJECTS);
    const after1 = new Map(s.map);
    expect(runMigrations(s, SUBJECTS).status).toBe("current");
    expect(s.map).toEqual(after1);
  });
});

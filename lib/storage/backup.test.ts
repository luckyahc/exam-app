import { describe, expect, it } from "vitest";
import { applyBackup, exportBackup, MAX_BACKUP_BYTES, parseBackup } from "./backup";
import { emptySubjectRecords, type StoreV2 } from "./schema";

const KNOWN = ["os", "data-comm"];
const now = new Date("2026-10-05T12:00:00.000Z");

const sample: StoreV2 = {
  settings: { mode: "exam" },
  subjects: {
    os: {
      progress: {
        "os-ch08-tlb-001": { attempts: 3, correctCount: 1, lastScore: 1, lastAt: "2026-10-05T10:00:00.000Z" },
        "os-ch07-buddy-001": { attempts: 2, correctCount: 0, lastScore: 0.5, lastAt: "2026-10-05T11:00:00.000Z" },
      },
      wrong: {
        "os-ch07-buddy-001": { wrongCount: 2, attempts: 2, lastWrongAt: "2026-10-05T11:00:00.000Z", resolved: false },
        "os-ch08-gen-replacement-123456": {
          wrongCount: 1,
          attempts: 1,
          lastWrongAt: "2026-10-05T11:30:00.000Z",
          resolved: false,
          gen: { name: "replacement", params: { variant: "count", algo: "lru" }, seed: 123456 },
        },
      },
      bookmarks: ["os-ch08-tlb-001"],
    },
    "data-comm": emptySubjectRecords(),
  },
};

describe("backup — 내보내기 → 초기화 → 가져오기 왕복", () => {
  it("전체: 덮어쓰기로 가져오면 초기화 전과 같다", () => {
    const text = JSON.stringify(exportBackup(sample, now));
    const reset: StoreV2 = { settings: {}, subjects: { os: emptySubjectRecords(), "data-comm": emptySubjectRecords() } };
    const parsed = parseBackup(text, KNOWN);
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.fromVersion).toBe(2);
    expect(applyBackup(reset, parsed.store, "overwrite")).toEqual(sample);
  });

  it("과목별: OS만 내보내 OS만 초기화했다가 가져오면 OS가 복원되고 다른 과목은 그대로", () => {
    const other: StoreV2 = {
      ...sample,
      subjects: { ...sample.subjects, "data-comm": { progress: {}, wrong: {}, bookmarks: ["data-comm-ch01-x-001"] } },
    };
    const text = JSON.stringify(exportBackup(other, now, ["os"]));
    const reset = { ...other, subjects: { ...other.subjects, os: emptySubjectRecords() } };
    const parsed = parseBackup(text, KNOWN);
    if (!parsed.ok) throw new Error(parsed.error);
    expect(Object.keys(parsed.store.subjects)).toEqual(["os"]);
    expect(applyBackup(reset, parsed.store, "overwrite")).toEqual(other);
  });

  it("합치기: 횟수는 큰 값, 북마크는 합집합(같은 파일을 두 번 합쳐도 그대로 — 멱등)", () => {
    const parsed = parseBackup(JSON.stringify(exportBackup(sample, now)), KNOWN);
    if (!parsed.ok) throw new Error(parsed.error);
    const once = applyBackup(sample, parsed.store, "merge");
    expect(once).toEqual(sample);
    const cur: StoreV2 = { settings: {}, subjects: { os: { progress: {}, wrong: {}, bookmarks: ["os-ch02-io-001"] } } };
    const merged = applyBackup(cur, parsed.store, "merge");
    expect(merged.subjects.os.bookmarks.sort()).toEqual(["os-ch02-io-001", "os-ch08-tlb-001"]);
    expect(merged.subjects.os.progress["os-ch08-tlb-001"].attempts).toBe(3);
  });
});

describe("backup — 버전·형식 판별", () => {
  it("v1 파일(version 없음 + wrongNotes/progress:*)은 upgradeV1toV2로 OS 기록이 된다", () => {
    const v1 = {
      "progress:ch08": { "ch08-q001": { attempts: 2, correctCount: 1, lastAt: "2026-01-01T00:00:00.000Z" } },
      wrongNotes: { "ch08-q002": { wrongCount: 3 } },
      bookmarks: ["ch08-q001"],
    };
    const parsed = parseBackup(JSON.stringify(v1), KNOWN);
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.fromVersion).toBe(1);
    expect(Object.keys(parsed.store.subjects)).toEqual(["os"]);
    const os = parsed.store.subjects.os;
    expect(Object.keys(os.progress)).toHaveLength(1);
    expect(Object.values(os.wrong)[0].wrongCount).toBe(3);
    expect(os.bookmarks).toHaveLength(1);
    expect(os.bookmarks[0].startsWith("os-")).toBe(true);
  });

  it.each([
    ["깨진 JSON", "{ not json", /JSON 형식이 아닙니다/],
    ["버전 없는 임의 JSON", JSON.stringify({ hello: "world" }), /백업 파일이 아닙니다/],
    ["배열", "[1,2,3]", /백업 파일이 아닙니다/],
    ["미래 버전", JSON.stringify({ app: "os-exam-app", version: 99, subjects: {} }), /더 새로운 앱/],
    ["다른 앱", JSON.stringify({ app: "other-app", version: 2, subjects: {} }), /다른 앱/],
    ["subjects 없음", JSON.stringify({ app: "os-exam-app", version: 2 }), /subjects/],
    ["과목 기록 형식 오류", JSON.stringify({ app: "os-exam-app", version: 2, subjects: { os: { bookmarks: "x" } } }), /형식이 잘못/],
    ["버전 값 이상", JSON.stringify({ version: 0 }), /버전 값/],
  ])("%s → 오류 메시지만, 예외 없음", (_, text, re) => {
    const r = parseBackup(text, KNOWN);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(re);
  });

  it("모르는 과목은 건너뛰고 알린다", () => {
    const text = JSON.stringify({ app: "os-exam-app", version: 2, subjects: { os: emptySubjectRecords(), chemistry: emptySubjectRecords() } });
    const r = parseBackup(text, KNOWN);
    if (!r.ok) throw new Error(r.error);
    expect(r.skippedSubjects).toEqual(["chemistry"]);
    expect(Object.keys(r.store.subjects)).toEqual(["os"]);
  });

  it("5MB를 넘으면 거부", () => {
    const big = JSON.stringify({ app: "os-exam-app", version: 2, subjects: {}, pad: "x".repeat(MAX_BACKUP_BYTES) });
    const r = parseBackup(big, KNOWN);
    expect(r.ok).toBe(false);
  });

  it("값이 이상한 기록은 관대하게 정규화(음수 횟수·잘못된 점수는 기본값)", () => {
    const text = JSON.stringify({
      app: "os-exam-app",
      version: 2,
      subjects: { os: { progress: { a: { attempts: -3, correctCount: 9, lastScore: 7 } }, wrong: {}, bookmarks: ["a", 3] } },
    });
    const r = parseBackup(text, KNOWN);
    if (!r.ok) throw new Error(r.error);
    expect(r.store.subjects.os.progress.a).toEqual({ attempts: 1, correctCount: 1, lastScore: null, lastAt: null });
    expect(r.store.subjects.os.bookmarks).toEqual(["a"]);
  });
});

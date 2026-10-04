import { describe, expect, it } from "vitest";
import type { StoreV2 } from "./schema";
import { mergeStores, upgradeV1toV2 } from "./upgrade";

describe("upgradeV1toV2", () => {
  it("v1 OS 기록을 os 과목으로 옮기고 문제 id를 변환한다", () => {
    const v2 = upgradeV1toV2({
      progress: {
        ch08: {
          "ch08-clock-001": { attempts: 3, correctCount: 2, lastScore: 1, lastAt: "2026-10-01" },
        },
        ch02: ["ch02-os-001"],
      },
      wrongNotes: { "ch08-clock-001": { count: 2, lastAt: "2026-10-02" } },
      bookmarks: ["ch07-buddy-002", "ch07-buddy-002"],
      settings: { mode: "exam" },
    });
    expect(Object.keys(v2.subjects)).toEqual(["os"]);
    expect(v2.subjects.os.progress).toEqual({
      "os-ch08-clock-001": { attempts: 3, correctCount: 2, lastScore: 1, lastAt: "2026-10-01" },
      "os-ch02-os-001": { attempts: 1, correctCount: 0, lastScore: null, lastAt: null },
    });
    expect(v2.subjects.os.wrong["os-ch08-clock-001"]).toEqual({
      wrongCount: 2,
      attempts: 2,
      lastWrongAt: "2026-10-02",
      resolved: false,
    });
    expect(v2.subjects.os.bookmarks).toEqual(["os-ch07-buddy-002"]);
    expect(v2.settings).toEqual({ mode: "exam" });
  });

  it("형식이 이상한 값은 건너뛰고 예외를 던지지 않는다", () => {
    const v2 = upgradeV1toV2({
      progress: { ch03: 42, ch07: [null, 7, { noId: true }, "ch07-ok-001"] },
      wrongNotes: "깨진 값",
      bookmarks: { "ch03-a-001": true, "ch03-b-001": false },
      settings: [1, 2],
    });
    expect(Object.keys(v2.subjects.os.progress)).toEqual(["os-ch07-ok-001"]);
    expect(v2.subjects.os.wrong).toEqual({});
    expect(v2.subjects.os.bookmarks).toEqual(["os-ch03-a-001"]);
    expect(v2.settings).toEqual({});
  });
});

describe("mergeStores", () => {
  const a: StoreV2 = {
    settings: { mode: "instant" },
    subjects: {
      os: {
        progress: { q1: { attempts: 2, correctCount: 1, lastScore: 0, lastAt: "2026-10-01" } },
        wrong: { q1: { wrongCount: 1, attempts: 2, lastWrongAt: "2026-10-01", resolved: false } },
        bookmarks: ["q1"],
      },
    },
  };
  const b: StoreV2 = {
    settings: {},
    subjects: {
      os: {
        progress: { q1: { attempts: 5, correctCount: 1, lastScore: 1, lastAt: "2026-10-03" } },
        wrong: { q1: { wrongCount: 3, attempts: 5, lastWrongAt: "2026-10-03", resolved: true } },
        bookmarks: ["q2"],
      },
      "data-comm": { progress: {}, wrong: {}, bookmarks: ["d1"] },
    },
  };

  it("횟수는 큰 값, 날짜·상태는 최신 값, 북마크는 합집합", () => {
    const m = mergeStores(a, b);
    expect(m.subjects.os.progress.q1).toEqual({
      attempts: 5,
      correctCount: 1,
      lastScore: 1,
      lastAt: "2026-10-03",
    });
    expect(m.subjects.os.wrong.q1).toEqual({
      wrongCount: 3,
      attempts: 5,
      lastWrongAt: "2026-10-03",
      resolved: true,
    });
    expect(m.subjects.os.bookmarks).toEqual(["q1", "q2"]);
    expect(m.subjects["data-comm"].bookmarks).toEqual(["d1"]);
    expect(m.settings).toEqual({ mode: "instant" });
  });

  it("멱등: 같은 것을 한 번 더 합쳐도 결과가 같다", () => {
    const m = mergeStores(a, b);
    expect(mergeStores(m, b)).toEqual(m);
    expect(mergeStores(m, a)).toEqual(m);
  });
});

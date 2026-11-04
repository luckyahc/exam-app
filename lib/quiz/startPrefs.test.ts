import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/settings/appSettings";
import { startPrefsKey } from "@/lib/storage/keys";
import { loadChapter } from "./loadQuestions";
import { filterFromParams } from "./params";
import { filterQuestions } from "./session";
import { defaultPrefs, readPrefs, toParams, writePrefs } from "./startPrefs";

// 테스트용 localStorage(safeStorage가 window.localStorage를 쓴다)
beforeEach(() => {
  const m = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    },
  };
});

describe("챕터 직접 고르기 설정", () => {
  it("저장한 값이 없으면 조건 없음 + 설정 탭 기본값(문제 수·순서·모드)", () => {
    const s = {
      ...DEFAULT_SETTINGS,
      quizCount: 30 as const,
      quizOrder: "shuffle" as const,
      quizMode: "exam" as const,
    };
    expect(readPrefs("os", "ch11", s)).toEqual({
      ...defaultPrefs(s),
      count: 30,
      shuffle: true,
      mode: "exam",
    });
  });

  it("과목별 키(examapp:{과목}:start)에 챕터별로 저장하고, 잘못된 값은 버린다", () => {
    const p = {
      ...defaultPrefs(DEFAULT_SETTINGS),
      types: ["mcq"],
      difficulties: [2],
      count: 10,
      shuffle: true,
    };
    writePrefs("os", "ch11", p);
    writePrefs("os", "ch08", { ...p, count: 30 });
    expect(startPrefsKey("os")).toBe("examapp:os:start");
    expect(readPrefs("os", "ch11", DEFAULT_SETTINGS)).toEqual(p);
    expect(readPrefs("os", "ch08", DEFAULT_SETTINGS).count).toBe(30);
    (window as unknown as { localStorage: Storage }).localStorage.setItem(
      "examapp:os:start",
      JSON.stringify({ ch11: { count: 25, difficulties: [5, 1], status: "x", mode: "?" } }),
    );
    const bad = readPrefs("os", "ch11", DEFAULT_SETTINGS);
    expect(bad.count).toBe(20);
    expect(bad.difficulties).toEqual([1]);
    expect(bad.status).toBe("all");
    expect(bad.mode).toBe("instant");
  });

  it("쿼리는 이전 챕터 시작 화면과 같은 이름·형식", () => {
    const q = toParams("os", "ch11", {
      ...defaultPrefs(DEFAULT_SETTINGS),
      types: ["mcq", "blank"],
      topics: ["RAID", "버퍼링"],
      star: "all",
      status: "wrong",
      difficulties: [3, 1],
      count: 0,
      shuffle: true,
      mode: "exam",
      timer: 20,
      view: "eclass",
    });
    expect(Object.fromEntries(q)).toEqual({
      subject: "os",
      chapter: "ch11",
      mode: "exam",
      types: "mcq,blank",
      topics: "RAID|버퍼링",
      star: "1",
      status: "wrong",
      diff: "1,3",
      shuffle: "1",
      timer: "1200",
      view: "eclass",
    });
  });

  it("챕터 화면이 센 개수 = /quiz가 같은 쿼리로 고르는 문제 수(문제 수 제한 전)", async () => {
    const pool = await loadChapter("os", "ch11");
    const statusOf = () => "unsolved" as const;
    for (const p of [
      { types: ["mcq"] },
      { difficulties: [1, 2] },
      { star: "all" as const },
      { status: "unsolved" as const },
      { status: "wrong" as const },
    ]) {
      const params = toParams("os", "ch11", { ...defaultPrefs(DEFAULT_SETTINGS), ...p, count: 0 });
      const counted = filterQuestions(pool, {
        ...filterFromParams(params, statusOf).filter,
        count: null,
        shuffle: false,
        seed: "",
      }).length;
      const picked = filterQuestions(pool, {
        ...filterFromParams(params, statusOf).filter,
        seed: "x",
      }).length;
      expect(counted).toBe(picked);
    }
  });
});

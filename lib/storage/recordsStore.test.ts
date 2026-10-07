import { beforeEach, describe, expect, it, vi } from "vitest";

/** 메모리 localStorage를 가진 가짜 window */
function installWindow(blocked = false) {
  const data = new Map<string, string>();
  const storage = {
    get length() {
      return data.size;
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  };
  const win = {
    addEventListener: () => {},
    removeEventListener: () => {},
    get localStorage(): typeof storage {
      if (blocked) throw new DOMException("blocked", "SecurityError");
      return storage;
    },
  };
  vi.stubGlobal("window", win);
  return data;
}

async function freshStore() {
  vi.resetModules();
  return import("./recordsStore");
}

describe("recordsStore — 내보내기 → 초기화 → 가져오기", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("기록·북마크를 내보낸 뒤 전체 초기화하고 가져오면 저장소 내용이 원래대로 돌아온다(테마 유지)", async () => {
    const data = installWindow();
    data.set("theme", "dark");
    const store = await freshStore();
    store.recordResult("os", "os-ch08-tlb-001", { correct: true, score: 1 });
    store.recordResult("os", "os-ch07-buddy-001", { correct: false, score: 0.5 });
    store.recordResult("os", "os-ch07-buddy-001", { correct: false, score: 0 });
    store.recordResult("os", "os-ch08-gen-replacement-777777", { correct: false, score: 0 }, { name: "replacement", params: { variant: "count", algo: "lru" }, seed: 777777 });
    store.toggleBookmark("os", "os-ch08-tlb-001");
    const before = store.currentStore();
    expect(before.subjects.os.wrong["os-ch07-buddy-001"]).toMatchObject({ wrongCount: 2, attempts: 2, resolved: false });

    const { exportBackup, parseBackup, applyBackup } = await import("./backup");
    const text = JSON.stringify(exportBackup(before, new Date()));

    store.resetData("all");
    expect([...data.keys()].filter((k) => k.startsWith("examapp:"))).toEqual([]);
    expect(data.get("theme")).toBe("dark");
    expect(store.currentStore().subjects.os.progress).toEqual({});

    const parsed = parseBackup(text, ["os", "data-comm"]);
    if (!parsed.ok) throw new Error(parsed.error);
    store.writeStore(applyBackup(store.currentStore(), parsed.store, "overwrite"), Object.keys(parsed.store.subjects));

    // 새로 불러온 스토어(=새로고침)가 저장소에서 읽은 값이 원래와 같다
    const reloaded = await freshStore();
    expect(reloaded.currentStore().subjects).toEqual(before.subjects);
  });

  it("세 과목(데이터과학 포함) 기록: 전체 내보내기 → 데이터과학만 초기화 → 가져오기(합치기)로 원래대로(Sprint 17)", async () => {
    const data = installWindow();
    const store = await freshStore();
    const { SUBJECTS } = await import("@/data/subjects/registry");
    store.recordResult("os", "os-ch08-tlb-001", { correct: true, score: 1 });
    store.recordResult("data-comm", "data-comm-ch01-x-001", { correct: false, score: 0 });
    store.recordResult("data-science", "data-science-lec6-copy-002", { correct: true, score: 1 });
    store.recordResult("data-science", "data-science-lec5-join-002", { correct: false, score: 0 });
    store.toggleBookmark("data-science", "data-science-lec6-struct-005");
    const before = store.currentStore();
    expect(Object.keys(before.subjects).sort()).toEqual(["data-comm", "data-science", "os"]);

    const { exportBackup, parseBackup, applyBackup } = await import("./backup");
    const text = JSON.stringify(exportBackup(before, new Date()));
    expect(JSON.parse(text).subjects["data-science"].wrong["data-science-lec5-join-002"]).toMatchObject({ wrongCount: 1 });

    store.resetData("data-science");
    expect([...data.keys()].filter((k) => k.startsWith("examapp:data-science:"))).toEqual([]);
    expect(data.has("examapp:os:progress")).toBe(true);

    const parsed = parseBackup(text, SUBJECTS.map((s) => s.id));
    if (!parsed.ok) throw new Error(parsed.error);
    store.writeStore(applyBackup(store.currentStore(), parsed.store, "merge"), Object.keys(parsed.store.subjects));
    const reloaded = await freshStore();
    expect(reloaded.currentStore().subjects).toEqual(before.subjects);
  });

  it("과목별 초기화는 그 과목 키만 지운다", async () => {
    const data = installWindow();
    const store = await freshStore();
    store.recordResult("os", "os-ch02-io-001", { correct: true, score: 1 });
    store.recordResult("data-comm", "data-comm-ch01-x-001", { correct: false, score: 0 });
    store.resetData("os");
    expect(data.has("examapp:os:progress")).toBe(false);
    expect(data.has("examapp:data-comm:wrong")).toBe(true);
  });

  it("전체 초기화에서 테마도 지우기를 고르면 theme 키도 지운다", async () => {
    const data = installWindow();
    data.set("theme", "light");
    const store = await freshStore();
    store.resetData("all", { theme: true });
    expect(data.has("theme")).toBe(false);
  });

  it("저장소가 막혀 있어도 예외 없이 메모리로 동작한다", async () => {
    installWindow(true);
    const store = await freshStore();
    expect(() => {
      store.recordResult("os", "os-ch02-io-001", { correct: true, score: 1 });
      store.toggleBookmark("os", "os-ch02-io-001");
      store.resetData("all", { theme: true });
    }).not.toThrow();
    expect(store.currentStore().subjects.os.bookmarks).toEqual([]);
  });
});

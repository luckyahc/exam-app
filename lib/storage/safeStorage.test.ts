import { afterEach, describe, expect, it, vi } from "vitest";
import { safeGet, safeGetJSON, safeRemove, safeSet, safeSetJSON } from "./safeStorage";

function stubWindow(localStorage: Storage) {
  vi.stubGlobal("window", { localStorage });
}

function fakeLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe("safeStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("SSR 환경(window 없음)에서 조용히 null/false를 반환한다", () => {
    expect(safeGet("theme")).toBeNull();
    expect(safeSet("theme", "dark")).toBe(false);
    expect(safeRemove("theme")).toBe(false);
    expect(safeGetJSON("progress")).toBeNull();
  });

  it("정상적인 localStorage에서는 값을 그대로 저장/조회한다", () => {
    stubWindow(fakeLocalStorage());

    expect(safeSet("theme", "dark")).toBe(true);
    expect(safeGet("theme")).toBe("dark");

    expect(safeSetJSON("progress", { ch02: 5 })).toBe(true);
    expect(safeGetJSON<{ ch02: number }>("progress")).toEqual({ ch02: 5 });

    safeRemove("theme");
    expect(safeGet("theme")).toBeNull();
  });

  it("localStorage 접근이 막혀 있어도(throw) 예외 없이 false/null을 반환한다", () => {
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
      clear: () => {},
      key: () => null,
      length: 0,
    } as Storage;
    stubWindow(throwing);

    expect(() => safeGet("theme")).not.toThrow();
    expect(safeGet("theme")).toBeNull();
    expect(safeSet("theme", "dark")).toBe(false);
    expect(safeRemove("theme")).toBe(false);
  });

  it("손상된 JSON은 safeGetJSON에서 null로 처리된다", () => {
    const ls = fakeLocalStorage();
    ls.setItem("progress", "{not-json");
    stubWindow(ls);

    expect(safeGetJSON("progress")).toBeNull();
  });
});

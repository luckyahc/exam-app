import { describe, expect, it } from "vitest";
import {
  clockReplace,
  enhancedClockVictim,
  simulateEnhancedClock,
  simulateReplacement,
} from "./replacement";

// Ch08 p.48 Figure 8.15 — 참조열과 각 알고리즘의 단계별 프레임(위→아래), F 위치를 슬라이드에서 그대로 전사
const REFS = [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2];
const _ = null;
const FIG815 = {
  opt: {
    frames: [
      [2, _, _],
      [2, 3, _],
      [2, 3, _],
      [2, 3, 1],
      [2, 3, 5],
      [2, 3, 5],
      [4, 3, 5],
      [4, 3, 5],
      [4, 3, 5],
      [2, 3, 5],
      [2, 3, 5],
      [2, 3, 5],
    ],
    F: [5, 7, 10],
  },
  lru: {
    frames: [
      [2, _, _],
      [2, 3, _],
      [2, 3, _],
      [2, 3, 1],
      [2, 5, 1],
      [2, 5, 1],
      [2, 5, 4],
      [2, 5, 4],
      [3, 5, 4],
      [3, 5, 2],
      [3, 5, 2],
      [3, 5, 2],
    ],
    F: [5, 7, 9, 10],
  },
  fifo: {
    frames: [
      [2, _, _],
      [2, 3, _],
      [2, 3, _],
      [2, 3, 1],
      [5, 3, 1],
      [5, 2, 1],
      [5, 2, 4],
      [5, 2, 4],
      [3, 2, 4],
      [3, 2, 4],
      [3, 5, 4],
      [3, 5, 2],
    ],
    F: [5, 6, 7, 9, 11, 12],
  },
  clock: {
    frames: [
      [2, _, _],
      [2, 3, _],
      [2, 3, _],
      [2, 3, 1],
      [5, 3, 1],
      [5, 2, 1],
      [5, 2, 4],
      [5, 2, 4],
      [3, 2, 4],
      [3, 2, 4],
      [3, 2, 5],
      [3, 2, 5],
    ],
    // 슬라이드의 * = use bit 1
    use: [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 0],
      [1, 0, 1],
      [1, 1, 1],
    ],
    F: [5, 6, 7, 9, 11],
  },
} as const;

describe("replacement — Ch08 p.48 Figure 8.15 (참조열 2 3 2 1 5 2 4 5 3 2 5 2, 프레임 3개)", () => {
  for (const algo of ["opt", "lru", "fifo", "clock"] as const) {
    describe(algo.toUpperCase(), () => {
      const r = simulateReplacement(REFS, 3, algo);
      it("단계별 프레임 내용이 슬라이드와 같다", () => {
        expect(r.steps.map((s) => s.frames)).toEqual(FIG815[algo].frames);
      });
      it(`F(프레임이 다 찬 뒤의 폴트) 위치·개수 = ${FIG815[algo].F.length}`, () => {
        expect(r.steps.flatMap((s, i) => (s.fault ? [i + 1] : []))).toEqual(FIG815[algo].F);
        expect(r.faults).toBe(FIG815[algo].F.length);
      });
    });
  }

  it("손글씨 주석: OPT 3번의 F, LRU 4번의 F / 처음 적재 3번은 F가 아님", () => {
    expect(simulateReplacement(REFS, 3, "opt").faults).toBe(3);
    expect(simulateReplacement(REFS, 3, "lru").faults).toBe(4);
    expect(simulateReplacement(REFS, 3, "fifo").misses).toBe(9);
  });

  it.each([
    ["opt", 6],
    ["lru", 7],
    ["fifo", 9],
    ["clock", 8],
  ] as const)("%s: misses(초기 적재 포함 전체 폴트) = %i = 초기 적재 3 + F 수", (algo, misses) => {
    const r = simulateReplacement(REFS, 3, algo);
    expect(r.misses).toBe(misses);
    expect(r.misses).toBe(3 + r.faults);
  });

  it("CLOCK use bit(*)가 슬라이드와 같다", () => {
    expect(simulateReplacement(REFS, 3, "clock").steps.map((s) => s.use)).toEqual(FIG815.clock.use);
  });

  it("CLOCK pointer는 교체(또는 적재) 때만 움직이고 히트 때는 그대로", () => {
    const steps = simulateReplacement(REFS, 3, "clock").steps;
    expect(steps.map((s) => s.pointer)).toEqual([1, 2, 2, 0, 1, 2, 0, 0, 1, 1, 0, 0]);
    for (let i = 1; i < steps.length; i++)
      if (steps[i].hit) expect(steps[i].pointer).toBe(steps[i - 1].pointer);
  });

  it("OPT 동점(둘 다 다시 안 쓰임)이면 맨 위 프레임을 뺀다 — 10번째 참조 2: 4·3 중 4(위) 교체", () => {
    const s = simulateReplacement(REFS, 3, "opt").steps[9];
    expect(s).toMatchObject({ evicted: 4, loadedFrame: 0 });
  });
});

describe("Clock — Ch08 p.49-50 Figure 8.16", () => {
  // (a) 교체 직전: 프레임 0..9 (9 = n−1), pointer = 2
  const before = {
    pages: [19, 1, 45, 191, 556, 13, 67, 33, 222, 9],
    use: [1, 1, 1, 1, 0, 0, 1, 1, 0, 1] as (0 | 1)[],
    pointer: 2,
  };
  it("(b) 새 페이지 727: 프레임 2·3의 use를 0으로 만들며 지나가 프레임 4(page 556) 교체, pointer는 5", () => {
    const { buffer, victim } = clockReplace(before, 727);
    expect(victim).toBe(4);
    expect(buffer.pages[4]).toBe(727);
    expect(buffer.use.slice(2, 6)).toEqual([0, 0, 1, 0]);
    expect(buffer.pointer).toBe(5);
  });
  it("이 상태에서 또 폴트가 나면 5번 프레임(이미 use=0)이 교체된다", () => {
    const { buffer } = clockReplace(before, 727);
    expect(clockReplace(buffer, 999).victim).toBe(5);
  });
  it("모든 use=1이면 한 바퀴 돌며 전부 0으로 만든 뒤 시작 위치를 교체", () => {
    const all = { pages: [1, 2, 3], use: [1, 1, 1] as (0 | 1)[], pointer: 1 };
    const { buffer, victim } = clockReplace(all, 9);
    expect(victim).toBe(1);
    expect(buffer.use).toEqual([0, 1, 0]);
    expect(buffer.pointer).toBe(2);
  });
});

describe("Enhanced Clock — Ch08 p.52-53 스캔 순서", () => {
  const f = (u: 0 | 1, m: 0 | 1, page = 0) => ({ page, u, m });
  it("1단계: pointer부터 (0,0)을 찾는다 — 비트는 바꾸지 않음", () => {
    const r = enhancedClockVictim([f(1, 0), f(0, 1), f(0, 0), f(1, 1)], 0);
    expect(r).toMatchObject({ victim: 2, pass: 1 });
    expect(r.frames.map((x) => x.u)).toEqual([1, 0, 0, 1]);
  });
  it("(0,0)이 pointer 앞에 있으면 한 바퀴 돌아 찾는다", () => {
    expect(enhancedClockVictim([f(0, 0), f(1, 0), f(0, 1)], 1)).toMatchObject({
      victim: 0,
      pass: 1,
    });
  });
  it("2단계: (0,0)이 없으면 (0,1)을 찾고, 지나친 u=1은 0으로 바뀐다", () => {
    const r = enhancedClockVictim([f(1, 1), f(1, 0), f(0, 1), f(1, 1)], 0);
    expect(r).toMatchObject({ victim: 2, pass: 2 });
    expect(r.frames.map((x) => x.u)).toEqual([0, 0, 0, 1]);
  });
  it("3단계: 모두 u=1이면 2단계에서 전부 0이 된 뒤 1단계 재시도에서 (0,0)을 찾는다", () => {
    const r = enhancedClockVictim([f(1, 1), f(1, 0), f(1, 1)], 0);
    expect(r).toMatchObject({ victim: 1, pass: 3 });
    expect(r.frames.every((x) => x.u === 0)).toBe(true);
  });
  it("4단계: 모두 (1,1)이면 2단계 재시도에서 pointer 위치의 (0,1)", () => {
    expect(enhancedClockVictim([f(1, 1), f(1, 1), f(1, 1)], 2)).toMatchObject({
      victim: 2,
      pass: 4,
    });
  });
  it("참조열 실행: 읽기는 u만, 쓰기는 u·m을 1로, 교체 후 pointer는 다음 프레임", () => {
    const steps = simulateEnhancedClock(
      [{ page: 1, write: true }, { page: 2 }, { page: 3 }, { page: 2, write: true }, { page: 4 }],
      3,
    );
    expect(steps[3].frames[1]).toEqual({ page: 2, u: 1, m: 1 });
    // 4 적재: 전부 u=1 → 2단계에서 u를 모두 0으로 → 3단계 재시도에서 (0,0)인 프레임 2(page 3) 교체
    expect(steps[4]).toMatchObject({ victim: 2, pass: 3, pointer: 0 });
  });
});

describe("유형 미리보기 더미 trace 문제(lib/qtypes/fixtures.ts)가 시뮬레이터와 일치", () => {
  it("FIFO 2 3 2 1 5: 프레임 내용과 F 행", async () => {
    const { QTYPE_FIXTURES } = await import("@/lib/qtypes/fixtures");
    const q = QTYPE_FIXTURES.find((x) => x.type === "trace");
    if (q?.type !== "trace") throw new Error("trace fixture 없음");
    const r = simulateReplacement(q.columns.map(Number), 3, "fifo");
    for (let fi = 0; fi < 3; fi++) {
      expect(q.rows[fi].cells.map((c) => c.value)).toEqual(
        r.steps.map((s) => (s.frames[fi] === null ? "" : String(s.frames[fi]))),
      );
    }
    expect(q.rows[3].cells.map((c) => c.value)).toEqual(r.steps.map((s) => (s.fault ? "F" : "-")));
  });
});

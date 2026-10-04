import { describe, expect, it } from "vitest";
import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { OS_GENERATORS } from "@/lib/sim/os/generators";
import type { Question } from "@/types/question";
import ch08 from "./ch08";

// Ch08 계산·시뮬레이션 문항의 정답이 슬라이드 기준값(손으로 전사한 값)과 같은지 확인한다.
// 문항 정답은 ch08.ts에서 lib/sim/os 함수로 계산하므로, 여기서 슬라이드 값과 맞으면 시뮬레이터 결과 = 슬라이드다.

const byId = (id: string) => {
  const q = ch08.find((x) => x.id === id);
  if (!q) throw new Error(`없는 문항: ${id}`);
  return q;
};
const calc = (id: string) => {
  const q = byId(id);
  if (q.type !== "calc") throw new Error(`${id}는 calc가 아님`);
  return q.answer;
};
const trace = (id: string) => {
  const q = byId(id);
  if (q.type !== "trace") throw new Error(`${id}는 trace가 아님`);
  return q;
};
const mcqAnswer = (id: string) => {
  const q = byId(id);
  if (q.type !== "mcq") throw new Error(`${id}는 mcq가 아님`);
  return q.choices[q.answerIndex];
};
const row = (id: string, label: string) => trace(id).rows.find((r) => r.label === label)!.cells.map((c) => c.value);

// Ch08 p.48 Figure 8.15 — 슬라이드에서 전사한 프레임 내용(위→아래)과 F 위치(lib/sim/os/replacement.test.ts와 같은 값)
const FIG815 = {
  opt: { f1: "2 2 2 2 2 2 4 4 4 2 2 2", f2: "_ 3 3 3 3 3 3 3 3 3 3 3", f3: "_ _ _ 1 5 5 5 5 5 5 5 5", F: [5, 7, 10] },
  lru: { f1: "2 2 2 2 2 2 2 2 3 3 3 3", f2: "_ 3 3 3 5 5 5 5 5 5 5 5", f3: "_ _ _ 1 1 1 4 4 4 2 2 2", F: [5, 7, 9, 10] },
  fifo: { f1: "2 2 2 2 5 5 5 5 3 3 3 3", f2: "_ 3 3 3 3 2 2 2 2 2 5 5", f3: "_ _ _ 1 1 1 4 4 4 4 4 2", F: [5, 6, 7, 9, 11, 12] },
} as const;
const cells = (s: string) => s.split(" ").map((v) => (v === "_" ? "" : v));

describe("Ch08 Figure 8.15 진행 표 (p.48)", () => {
  it.each([
    ["os-ch08-replacement-001", "opt"],
    ["os-ch08-replacement-002", "lru"],
    ["os-ch08-replacement-003", "fifo"],
  ] as const)("%s(%s): 프레임 3행과 F 위치가 슬라이드와 같다", (id, algo) => {
    expect(row(id, "프레임 1")).toEqual(cells(FIG815[algo].f1));
    expect(row(id, "프레임 2")).toEqual(cells(FIG815[algo].f2));
    expect(row(id, "프레임 3")).toEqual(cells(FIG815[algo].f3));
    expect(row(id, "F").flatMap((v, i) => (v === "F" ? [i + 1] : []))).toEqual(FIG815[algo].F);
  });

  it("CLOCK: 프레임(* = use bit 1)·F·pointer가 슬라이드와 같다", () => {
    const id = "os-ch08-replacement-004";
    expect(row(id, "프레임 1")).toEqual(cells("2* 2* 2* 2* 5* 5* 5* 5* 3* 3* 3* 3*"));
    expect(row(id, "프레임 2")).toEqual(cells("_ 3* 3* 3* 3 2* 2* 2* 2 2* 2 2*"));
    expect(row(id, "프레임 3")).toEqual(cells("_ _ _ 1* 1 1 4* 4* 4 4 5* 5*"));
    expect(row(id, "F").flatMap((v, i) => (v === "F" ? [i + 1] : []))).toEqual([5, 6, 7, 9, 11]);
    // pointer는 교체(또는 적재) 때만 움직이고 히트(3·8·10·12번째 참조) 때는 그대로
    expect(row(id, "pointer(다음 교체 시작 프레임)")).toEqual(
      [2, 3, 3, 1, 2, 3, 1, 1, 2, 2, 1, 1].map((n) => `프레임 ${n}`),
    );
  });

  it("손글씨 'OPT 3번의 F, LRU 4번의 F', FIFO F 6회(슬라이드 기준) — 초기 적재 포함 9회는 해설에", () => {
    expect(row("os-ch08-replacement-001", "F").filter((v) => v === "F")).toHaveLength(3);
    expect(row("os-ch08-replacement-002", "F").filter((v) => v === "F")).toHaveLength(4);
    expect(calc("os-ch08-replacement-005")).toBe(6);
    expect(byId("os-ch08-replacement-005").explanation).toContain("초기 적재까지 포함하면 9회");
  });
});

describe("Ch08 Figure 8.16 Clock (p.49-50)", () => {
  it("727 적재: 프레임 2·3의 use가 0이 되고 프레임 4(page 556)가 727로 교체", () => {
    const id = "os-ch08-clock-001";
    expect(row(id, "교체 후 page")).toEqual(["45", "191", "727", "13"]);
    expect(row(id, "교체 후 use")).toEqual(["0", "0", "1", "0"]);
  });
  it("필기: 이 상태에서 또 page fault → 5번 프레임", () => {
    expect(mcqAnswer("os-ch08-clock-002")).toBe("프레임 5(page 13)");
  });
  it("모든 use bit = 1이면 두 바퀴째 시작 위치(프레임 1) 교체", () => {
    expect(calc("os-ch08-clock-005")).toBe(1);
  });
});

describe("Ch08 계산 기준값", () => {
  it.each([
    ["os-ch08-two-level-001", 2 ** 20], // p.14 필기: 4GB / 4KB = 백만 개(2^20)
    ["os-ch08-inverted-005", 2 ** 20], // p.17 필기: RAM 4GB, 프레임 4KB → 엔트리 100만 개
    ["os-ch08-working-set-001", 4], // W(8,5): 시각 4~8 = 1 5 2 4 5 → {1,5,2,4}
    ["os-ch08-working-set-002", 3], // W(12,4): 시각 9~12 = 3 2 5 2 → {3,2,5}
  ] as const)("%s = %d", (id, expected) => {
    expect(calc(id)).toBe(expected);
  });

  it("Enhanced Clock(p.53): (1,1)(1,0)(0,1)(1,1), pointer 0 → 2단계에서 프레임 2", () => {
    expect(mcqAnswer("os-ch08-enhanced-clock-003")).toBe("프레임 2");
  });

  it("Enhanced Clock 진행: 4 적재 시 page 3(0,0)이 교체되고 다른 프레임은 u=0", () => {
    const id = "os-ch08-enhanced-clock-002";
    expect([1, 2, 3].map((n) => row(id, `프레임 ${n}`).at(-1))).toEqual(["1 (u=0, m=1)", "2 (u=0, m=1)", "4 (u=1, m=0)"]);
  });
});

describe("Ch08 ⭐ 범위·요구 문항", () => {
  it("Clock 정책 동작(Figure 8.16) 소주제는 전부 ⭐(handwritten), LFU/MFU는 ⭐ 아님", () => {
    const clock = ch08.filter((q) => q.topic === "Clock 정책 동작");
    expect(clock.length).toBeGreaterThanOrEqual(6);
    for (const q of clock) expect(q).toMatchObject({ exam: true, examBasis: "handwritten" });
    for (const q of ch08.filter((x) => x.topic.startsWith("LFU/MFU"))) expect(q.exam).toBe(false);
  });
  it("TLB ⭐에 히트 / 미스·페이지 테이블 히트 / 페이지 폴트 비교 문항이 있다", () => {
    const q = byId("os-ch08-tlb-009");
    if (q.type !== "match") throw new Error();
    expect(q.pairs.map((x) => x.left)).toEqual(["TLB 히트", "TLB 미스 + 페이지 테이블 히트", "페이지 폴트"]);
  });
});

describe("Ch08 생성기 문항", () => {
  const generated = ch08.filter((q): q is Question & { generator: NonNullable<Question["generator"]> } => !!q.generator);

  it("생성기 문항이 있고 모두 {name, params, seed}를 가진다", () => {
    expect(generated.length).toBeGreaterThan(0);
    for (const q of generated) {
      expect(Object.keys(q.generator).sort()).toEqual(["name", "params", "seed"]);
      expect(q.id).toBe(`os-ch08-gen-${q.generator.name}-${q.generator.seed}`);
    }
  });

  it.each(generated.map((q) => [q.id, q] as const))("%s: {generator, params, seed}로 다시 만들면 같은 문항, 정답 키 = 1점", (_, q) => {
    expect(OS_GENERATORS[q.generator.name].generate(q.generator.seed, q.generator.params)).toEqual(q);
    expect(gradeQuestion(q, answerKey(q)).score).toBe(1);
  });

  it("폴트 횟수 생성기 문항은 문장에 기준을, 해설에 다른 기준 값을 적는다", () => {
    for (const q of generated.filter((x) => x.generator.name === "replacement")) {
      expect(q.prompt).toContain("처음 다 채워진 **뒤**의 페이지 폴트만");
      expect(q.explanation).toContain("초기 적재까지 포함하면");
    }
  });
});

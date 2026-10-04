import { describe, expect, it } from "vitest";
import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { OS_GENERATORS } from "@/lib/sim/os/generators";
import type { Question } from "@/types/question";
import ch07 from "./ch07";

// Ch07 계산·시뮬레이션 문항의 정답이 슬라이드 기준값(손으로 전사한 값)과 같은지 확인한다.
// 문항 정답은 ch07.ts에서 lib/sim/os 함수로 계산하므로, 여기서 슬라이드 값과 맞으면 시뮬레이터 결과 = 슬라이드다.

const byId = (id: string) => {
  const q = ch07.find((x) => x.id === id);
  if (!q) throw new Error(`없는 문항: ${id}`);
  return q;
};
const calcAnswer = (id: string) => {
  const q = byId(id);
  if (q.type !== "calc") throw new Error(`${id}는 calc가 아님`);
  return q.answer;
};
const trace = (id: string) => {
  const q = byId(id);
  if (q.type !== "trace") throw new Error(`${id}는 trace가 아님`);
  return q;
};

describe("Ch07 슬라이드 기준값", () => {
  it.each([
    ["os-ch07-translation-001", 1027], // p.34 논리 3 → 실제 1027
    ["os-ch07-translation-002", 1026], // p.35 실제 2050 → 논리 1026
    ["os-ch07-translation-003", 0], // p.36 x = 0
    ["os-ch07-translation-004", 5179], // p.32 페이지 크기 1000: 1,179 → 5,179
    ["os-ch07-bit-slice-001", 6622], // p.33 Figure 7.11(a): 000110|0111011110
    ["os-ch07-bit-slice-003", 5], // 16비트, 2KB 페이지 → 페이지 번호 5비트 (p.37 방식)
    ["os-ch07-segmentation-001", 1027], // p.41 논리 3 → 실제 1027
    ["os-ch07-segmentation-003", 8976], // p.40 Figure 7.12(b): 0010001100010000
    ["os-ch07-buddy-002", 28], // p.23 필기: 100K 요청 → 128K 할당
    ["os-ch07-paging-basic-004", 1024], // p.28 필기: 4MB → 페이지 1024개
    ["os-ch07-protection-005", 31200], // p.7 상대주소 + base
  ] as const)("%s = %d", (id, expected) => {
    expect(calcAnswer(id)).toBe(expected);
  });

  it("p.40 Figure 7.12(b) 실제주소 비트열 0010001100010000", () => {
    expect(calcAnswer("os-ch07-segmentation-003").toString(2).padStart(16, "0")).toBe("0010001100010000");
  });

  it("p.33 Figure 7.11(a) 실제주소 비트열 0001100111011110", () => {
    expect(calcAnswer("os-ch07-bit-slice-001").toString(2).padStart(16, "0")).toBe("0001100111011110");
  });

  it("p.23 버디 표: 10개 행이 슬라이드 전사와 같다", () => {
    const q = trace("os-ch07-buddy-001");
    expect(q.rows.map((r) => r.label)).toEqual([
      "Request 100K (A)",
      "Request 240K (B)",
      "Request 64K (C)",
      "Request 256K (D)",
      "Release B",
      "Release A",
      "Request 75K (E)",
      "Release C",
      "Release E",
      "Release D",
    ]);
    expect(q.rows.map((r) => r.cells[0].value)).toEqual([
      "A=128K | 128K | 256K | 512K",
      "A=128K | 128K | B=256K | 512K",
      "A=128K | C=64K | 64K | B=256K | 512K",
      "A=128K | C=64K | 64K | B=256K | D=256K | 256K",
      "A=128K | C=64K | 64K | 256K | D=256K | 256K",
      "128K | C=64K | 64K | 256K | D=256K | 256K",
      "E=128K | C=64K | 64K | 256K | D=256K | 256K",
      "E=128K | 128K | 256K | D=256K | 256K",
      "512K | D=256K | 256K",
      "1M",
    ]);
  });

  it("p.21: 1024 빈 블록에서 40 bytes 요청 → 64(할당) | 64 | 128 | 256 | 512", () => {
    const q = byId("os-ch07-buddy-004");
    if (q.type !== "mcq") throw new Error();
    expect(q.choices[q.answerIndex]).toBe("X=64B | 64B | 128B | 256B | 512B");
  });

  it("p.20 Figure 7.5: 16M 요청 → First 22M(6M) · Best 18M(2M) · Next 36M(20M) · Worst 36M(20M)", () => {
    const q = trace("os-ch07-placement-004");
    expect(q.columns).toEqual(["First-fit", "Best-fit", "Next-fit", "Worst-fit"]);
    expect(q.rows[0].cells.map((c) => c.value)).toEqual(["22M", "18M", "36M", "36M"]);
    expect(q.rows[1].cells.map((c) => c.value)).toEqual(["6M", "2M", "20M", "20M"]);
  });

  it("p.37 예: 논리주소 3 = 000000 | 0000000011 → 페이지 0, 오프셋 3", () => {
    const q = trace("os-ch07-bit-slice-005");
    expect(q.rows[0].cells.map((c) => c.value)).toEqual(["000000 | 0000000011", "0", "3"]);
  });

  it("보호 위반(트랩) 문항의 정답 보기가 트랩이다 (base·bounds 6200 ≥ 5000, 세그먼트 offset 120 ≥ 100)", () => {
    for (const id of ["os-ch07-protection-006", "os-ch07-segmentation-002"]) {
      const q = byId(id);
      if (q.type !== "mcq") throw new Error();
      expect(q.choices[q.answerIndex]).toContain("보호 위반(트랩)");
    }
  });
});

describe("Ch07 생성기 문항", () => {
  const generated = ch07.filter((q): q is Question & { generator: NonNullable<Question["generator"]> } => !!q.generator);

  it("생성기 문항이 있고 모두 {name, params, seed}를 가진다", () => {
    expect(generated.length).toBeGreaterThan(0);
    for (const q of generated) {
      expect(Object.keys(q.generator).sort()).toEqual(["name", "params", "seed"]);
      expect(q.id).toBe(`os-ch07-gen-${q.generator.name}-${q.generator.seed}`);
    }
  });

  it.each(generated.map((q) => [q.id, q] as const))("%s: {generator, params, seed}로 다시 만들면 같은 문항, 정답 키 = 1점", (_, q) => {
    const regen = OS_GENERATORS[q.generator.name].generate(q.generator.seed, q.generator.params);
    expect(regen).toEqual(q);
    expect(gradeQuestion(q, answerKey(q)).score).toBe(1);
  });
});

import { describe, expect, it } from "vitest";
import os from "@/data/subjects/os";
import { OS_GENERATORS } from "@/lib/sim/os/generators";
import { calcCore, type CalcQ, parseNumber } from "./calc";
import { answerKey } from "./answerKey";

describe("calc 입력 파서 (Sprint 9 보강) — docs/dc-question-types.md §2", () => {
  it.each([
    ["34881", 34881],
    ["34,881", 34881],
    [" 1,536,000 ", 1536000],
    ["3e8", 3e8],
    ["3E8", 3e8],
    ["0.75e-6", 0.75e-6],
    ["3×10^8", 3e8],
    ["3*10^8", 3e8],
    ["3 × 10^8", 3e8],
    ["2.4×10^-8", 2.4e-8],
    ["-1.5e+3", -1500],
    ["6.625", 6.625],
    [".5e1", 5],
    ["3x10^8", 3e8],
    ["3X10^8", 3e8],
    ["3 x 10^8", 3e8],
    ["2.4x10^-8", 2.4e-8],
    ["10^6", 1e6],
    ["10^-3", 1e-3],
    ["10^+2", 100],
    [" 10^0 ", 1],
  ])("%s → %d", (raw, n) => expect(parseNumber(raw)).toBe(n));

  it("영문 x/X·가수 없는 10^n도 같은 값 — 의미가 하나로만 읽히는 형태만", () => {
    expect(parseNumber("0.651x10^-6")).toBe(parseNumber("0.651e-6"));
    expect(parseNumber("10^8")).toBe(parseNumber("1e8"));
    // -10^6은 −(10⁶)인지 (−10)⁶인지 갈리므로 받지 않는다
    expect(parseNumber("-10^6")).toBeNull();
  });

  it("3×10^8과 3e8은 같은 값(곱셈 부동소수 오차 없음)", () => {
    expect(parseNumber("0.651×10^-6")).toBe(0.651e-6);
    expect(parseNumber("0.651×10^-6")).toBe(parseNumber("0.651e-6"));
  });

  it.each(["", "  ", "abc", "1.2.3", "12a", "3e", "e8", "3×10", "3×10^", "3^8", "3×e8", "10^", "3 e8", "1,5", "3x10", "x10^8", "3xx10^8", "3x10^", "-10^6", "+10^6", "2^10", "10^6.5", "100^2", "10 ^6", "3x 10 ^8", "∞", "Infinity", "NaN", "1e999"])(
    "형식 오류 → null: %j",
    (raw) => expect(parseNumber(raw)).toBeNull(),
  );

  it("형식 오류면 제출할 수 없다(isComplete false) — 오답 처리가 아님", () => {
    const q = { answer: 3e8, tolerance: 0 } as CalcQ;
    expect(calcCore.isComplete(q, "3×10")).toBe(false);
    expect(calcCore.isComplete(q, "3×10^8")).toBe(true);
  });
});

describe("relTolerance(상대 오차)", () => {
  const q = { answer: 34881.4, tolerance: 0, relTolerance: 0.001 } as CalcQ; // ±34.88
  it("상대 오차 안이면 정답, 밖이면 오답", () => {
    expect(calcCore.grade(q, "34,881").correct).toBe(true);
    expect(calcCore.grade(q, "34.85e3").correct).toBe(true);
    expect(calcCore.grade(q, "34,900").correct).toBe(true);
    expect(calcCore.grade(q, "34,800").correct).toBe(false);
  });
  it("작은 값도 같은 비율: 0.651 μs를 초 단위로", () => {
    const s = { answer: 1 / 1_536_000, tolerance: 0, relTolerance: 0.001 } as CalcQ;
    expect(calcCore.grade(s, "6.51e-7").correct).toBe(true);
    expect(calcCore.grade(s, "6.6e-7").correct).toBe(false);
  });
  it("절대·상대 오차를 함께 주면 넓은 쪽", () => {
    const both = { answer: 100, tolerance: 2, relTolerance: 0.001 } as CalcQ;
    expect(calcCore.grade(both, "101.9").correct).toBe(true);
    expect(calcCore.grade(both, "102.1").correct).toBe(false);
  });
  it("검증: 0 이상 1 미만", () => {
    expect(calcCore.validate({ ...q, relTolerance: -0.1 })).not.toEqual([]);
    expect(calcCore.validate({ ...q, relTolerance: 1 })).not.toEqual([]);
    expect(calcCore.validate(q)).toEqual([]);
  });
});

// ------------------------------------------------------------------ OS 회귀: 보강 전 구현과 채점 결과가 같다

/** Sprint 3~8의 calc 구현(보강 전) 그대로 */
function legacyParse(raw: string): number | null {
  const s = raw.trim().replace(/,(?=\d{3}(\D|$))/g, "");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function legacyGrade(q: CalcQ, a: string) {
  const value = legacyParse(a);
  const ok = value !== null && Math.abs(value - q.answer) <= q.tolerance + 1e-9 * Math.max(1, Math.abs(q.answer));
  return { score: ok ? 1 : 0, value };
}

describe("OS calc 회귀 — 보강 전과 같은 입력이면 채점 결과가 같다", async () => {
  const statics = (await Promise.all(os.chapters.map((c) => c.load()))).flat().filter((q): q is CalcQ => q.type === "calc");
  const generated: CalcQ[] = [];
  for (const g of Object.values(OS_GENERATORS))
    for (let seed = 1; seed <= 60; seed++) {
      const q = g.generate(seed);
      if (q.type === "calc") generated.push(q);
    }
  const all = [...statics, ...generated];

  it("OS calc 문제가 충분히 있다(정적 + 생성기)", () => {
    expect(statics.length).toBeGreaterThan(10);
    expect(generated.length).toBeGreaterThan(50);
  });

  it("OS calc 문제는 relTolerance를 쓰지 않는다(절대 오차만 — 판정식이 예전과 같음)", () => {
    expect(all.filter((q) => q.relTolerance !== undefined).map((q) => q.id)).toEqual([]);
  });

  it("예전 파서가 받던 모든 입력에서 값·점수가 같다", () => {
    const diffs: string[] = [];
    for (const q of all) {
      const t = q.tolerance;
      const a = q.answer;
      const inputs = [
        answerKey(q) as string,
        String(a),
        a.toLocaleString("en-US", { maximumFractionDigits: 10 }),
        ` ${a} `,
        String(a + t),
        String(a - t),
        String(a + t * 1.5 + 0.01),
        String(a - t * 1.5 - 0.01),
        String(a + 1),
        String(-a),
        String(a * 10),
        "0",
        "1,5",
        "1234,567",
        "abc",
        "",
      ];
      for (const raw of inputs) {
        const before = legacyGrade(q, raw);
        const after = calcCore.grade(q, raw);
        if (before.value !== null && (after.detail.value !== before.value || after.score !== before.score))
          diffs.push(`${q.id} ${JSON.stringify(raw)}: ${JSON.stringify(before)} → ${after.score}/${after.detail.value}`);
        // 예전에 형식 오류였던 입력이 새로 숫자가 되는 경우는 지수 표기뿐이다
        if (before.value === null && after.detail.value !== null && !/[eE×*xX^]/.test(raw))
          diffs.push(`${q.id} ${JSON.stringify(raw)}: 예전 형식 오류 → ${after.detail.value}`);
      }
      if (calcCore.grade(q, answerKey(q) as string).score !== 1) diffs.push(`${q.id}: 정답 키가 오답`);
    }
    expect(diffs).toEqual([]);
  });
});

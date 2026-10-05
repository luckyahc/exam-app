import { describe, expect, it } from "vitest";
import { validateBase } from "@/lib/qtypes/base";
import { answerKey } from "@/lib/qtypes/answerKey";
import { coreFor, gradeQuestion } from "@/lib/qtypes/registry";
import { bothLimits, nyquistBitRate, shannonCapacity } from "./capacity";
import { textBitRate } from "./digital";
import { fdmBandwidth } from "./multiplexing";
import { BIT_LENGTH_NOTE, DC_GENERATORS, DC_VARIANTS } from "./generators";

const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1);
/** docs/coverage-matrix.md 데이터 통신 Ch02 소주제 중 생성기가 쓰는 것 */
const STAR_TOPICS = ["데이터 전송률 한계 3요소, Nyquist 비트율", "Shannon 용량, 두 한계 함께 쓰기", "대역폭-지연 곱, 지터"];

const cases = Object.entries(DC_VARIANTS).flatMap(([name, variants]) => variants.map((v) => [name, v] as const));

describe("데이터 통신 생성기 — 변형마다 seed 300개", () => {
  it("생성기 10개가 문서(dc-question-types.md §3) 목록과 같다", () => {
    expect(Object.keys(DC_GENERATORS)).toEqual([
      "signal",
      "digital",
      "decibel",
      "capacity",
      "performance",
      "pcm",
      "modulation",
      "multiplexing",
      "link-fill",
      "tdm-frame",
    ]);
  });

  it.each(cases)("%s/%s: 예외 없음(비현실적 입력 없음)·유효·정답 키 = 정답·결정적·params 유지", (name, variant) => {
    const g = DC_GENERATORS[name as keyof typeof DC_GENERATORS];
    const errors: string[] = [];
    const prompts = new Set<string>();
    for (const seed of SEEDS) {
      const q = g.generate(seed, { variant } as never);
      const where = `${name}/${variant}#${seed}`;
      expect(q.generator).toEqual({ name, params: { variant }, seed });
      expect(g.generate(seed, { variant } as never)).toEqual(q);
      for (const e of [...validateBase(q), ...coreFor(q).validate(q as never)]) errors.push(`${where}: ${e}`);
      if (!gradeQuestion(q, answerKey(q)).correct) errors.push(`${where}: 정답 키가 오답`);
      if (/NaN|Infinity|undefined|null/.test(q.prompt + q.explanation)) errors.push(`${where}: 이상한 값이 문장에 있음`);
      if (q.type === "calc") {
        if (!Number.isFinite(q.answer)) errors.push(`${where}: 정답이 유한하지 않음`);
        if (!q.steps?.length) errors.push(`${where}: 단계별 풀이 없음`);
        // 입력칸 옆에 정답 단위가 반드시 보인다(무차원 비율은 "(단위 없음)")
        if (!q.unit?.trim()) errors.push(`${where}: 답 단위 없음`);
      }
      expect(q.slideRef).toMatch(/^Ch02 s\.\d+(-\d+)?$/);
      expect(q.exam).toBe(STAR_TOPICS.includes(q.topic));
      if (q.exam) expect(q.examBasis).toBe("printed-emphasis");
      prompts.add(q.prompt + JSON.stringify(q.type === "trace" ? q.rows : null));
    }
    expect(errors).toEqual([]);
    // seed를 바꾸면 다른 문제(선택지가 적은 변형도 3개 이상)
    expect(prompts.size).toBeGreaterThanOrEqual(3);
  });

  it("음수·0 대역폭, SNR ≤ 0 같은 입력은 계산 단계에서 바로 거부된다(가드 동작 확인)", async () => {
    const { assertPositive } = await import("./format");
    expect(() => assertPositive({ B: -1 })).toThrow(/비현실적/);
    expect(() => assertPositive({ snr: 0 })).toThrow(/비현실적/);
    expect(() => assertPositive({ f: Number.NaN })).toThrow(/비현실적/);
    expect(() => assertPositive({ B: 3000, snr: 3162 })).not.toThrow();
  });
});

describe("정답은 시뮬레이터 계산값과 같다 — 문장에서 입력을 다시 읽어 재계산", () => {
  const num = (s: string) => Number(s.replaceAll(",", ""));

  it("capacity/nyquistRate: 2B log₂ L", () => {
    for (const seed of SEEDS) {
      const q = DC_GENERATORS.capacity.generate(seed, { variant: "nyquistRate" });
      if (q.type !== "calc") throw new Error();
      const [, kHz, L] = /대역폭 (\d+) kHz.*레벨 (\d+)개/.exec(q.prompt)!;
      expect(q.answer).toBe(nyquistBitRate(num(kHz) * 1000, num(L)) / 1000);
    }
  });

  it("capacity/shannon: B log₂(1 + SNR)", () => {
    for (const seed of SEEDS) {
      const q = DC_GENERATORS.capacity.generate(seed, { variant: "shannon" });
      if (q.type !== "calc") throw new Error();
      const m = /대역폭 ([\d,]+) (Hz|MHz), SNR ([\d,]+)/.exec(q.prompt)!;
      const hz = num(m[1]) * (m[2] === "MHz" ? 1e6 : 1);
      const c = shannonCapacity(hz, num(m[3]));
      expect(q.answer).toBeCloseTo(c / (q.unit === "Mbps" ? 1e6 : 1000), 9);
      expect(num(m[3])).toBeGreaterThan(0);
    }
  });

  it("capacity/bothLevels: 고른 비트율은 항상 Shannon 상한보다 낮고, L은 Nyquist로 계산", () => {
    for (const seed of SEEDS) {
      const q = DC_GENERATORS.capacity.generate(seed, { variant: "bothLevels" });
      if (q.type !== "calc") throw new Error();
      const m = /대역폭 (\d+) MHz, SNR ([\d,]+).*낮은 (\d+) Mbps/.exec(q.prompt)!;
      const r = bothLimits(num(m[1]) * 1e6, num(m[2]), num(m[3]) * 1e6);
      expect(num(m[3]) * 1e6).toBeLessThan(r.capacity);
      expect(q.answer).toBe(r.levels);
      expect(Number.isInteger(Math.log2(q.answer))).toBe(true);
    }
  });

  it("digital/bitRate: 쪽 × 줄 × 글자 × 비트", () => {
    for (const seed of SEEDS) {
      const q = DC_GENERATORS.digital.generate(seed, { variant: "bitRate" });
      if (q.type !== "calc") throw new Error();
      const [, p, l, c, b] = /초당 (\d+)쪽.*평균 (\d+)줄.*한 줄은 (\d+)글자.*한 글자는 (\d+)비트/.exec(q.prompt)!;
      expect(q.answer).toBe(textBitRate(num(p), num(l), num(c), num(b)));
    }
  });

  it("multiplexing/fdm: 보호 대역은 n − 1개", () => {
    for (const seed of SEEDS) {
      const q = DC_GENERATORS.multiplexing.generate(seed, { variant: "fdm" });
      if (q.type !== "calc") throw new Error();
      const [, ch, n, guard] = /대역폭 (\d+) kHz인 채널 (\d+)개.*?(\d+) kHz의 보호 대역/.exec(q.prompt)!;
      expect(q.answer).toBe(fdmBandwidth(num(n), num(ch), num(guard)));
      expect(num(guard)).toBeLessThan(num(ch));
    }
  });
});

describe("비트 길이 규칙 (docs/dc-source-analysis.md 확인 필요 4)", () => {
  it("답의 단위(μs)를 문제에 명시하고, 해설에 정의(거리)와 예제(시간)의 차이 한 줄", () => {
    for (const seed of SEEDS) {
      const q = DC_GENERATORS.digital.generate(seed, { variant: "bitLength" });
      if (q.type !== "calc") throw new Error();
      expect(q.prompt).toContain("**마이크로초(μs)** 단위");
      expect(q.unit).toBe("μs");
      expect(q.explanation).toContain(BIT_LENGTH_NOTE);
      expect(q.prompt).not.toMatch(/거리 단위|미터|m 단위/);
    }
  });
});

describe("슬라이드 예제와 같은 입력이면 같은 답 — 생성기 경로", () => {
  it("s.38 (p.19) Example 2.8: 3000 Hz, SNR 3162 → 34.881 kbps 입력이 정답(±0.1%)", () => {
    const q = Array.from({ length: 2000 }, (_, i) => DC_GENERATORS.capacity.generate(i + 1, { variant: "shannon" })).find(
      (x) => x.prompt.includes("대역폭 3,000 Hz, SNR 3,162"),
    );
    expect(q).toBeDefined();
    expect(gradeQuestion(q!, "34.881").correct).toBe(true);
    expect(gradeQuestion(q!, "34,881e-3").correct).toBe(true);
  });

  it("s.11 (p.6): 1/6 주기 라디안 문제에서 슬라이드 값 1.046도 정답(±0.002)", () => {
    const q = Array.from({ length: 2000 }, (_, i) => DC_GENERATORS.signal.generate(i + 1, { variant: "phaseRad" })).find((x) =>
      x.prompt.includes("1/6 주기"),
    );
    expect(q).toBeDefined();
    expect(gradeQuestion(q!, "1.046").correct).toBe(true);
    expect(gradeQuestion(q!, "1.047").correct).toBe(true);
    expect(gradeQuestion(q!, "1.05").correct).toBe(false);
  });

  it("s.8 (p.4): 실효 220 V 피크 문제에서 슬라이드 값 310 V도 정답(±1.5)", () => {
    const q = Array.from({ length: 2000 }, (_, i) => DC_GENERATORS.signal.generate(i + 1, { variant: "peak" })).find((x) =>
      x.prompt.includes("220 V"),
    );
    expect(q).toBeDefined();
    expect(gradeQuestion(q!, "310").correct).toBe(true);
    expect(gradeQuestion(q!, "311").correct).toBe(true);
    expect(gradeQuestion(q!, "308").correct).toBe(false);
  });

  it("s.26 (p.13): 절반 감쇠 문제에서 슬라이드 값 −3 dB도 정답(±0.05)", () => {
    const q = Array.from({ length: 2000 }, (_, i) => DC_GENERATORS.decibel.generate(i + 1, { variant: "attenuation" })).find(
      (x) => x.prompt.includes("0.5배"),
    );
    expect(q).toBeDefined();
    expect(gradeQuestion(q!, "-3").correct).toBe(true);
    expect(gradeQuestion(q!, "3").correct).toBe(false);
  });

  it("s.49~50 (p.25): link-fill 표에 대역폭 5 bps·지연 5 s가 나오면 5초 뒤 25비트", () => {
    const q = Array.from({ length: 2000 }, (_, i) => DC_GENERATORS["link-fill"].generate(i + 1)).find((x) =>
      x.prompt.startsWith("대역폭 5 bps, 지연 5 s"),
    );
    if (!q || q.type !== "trace") throw new Error("없음");
    const last = q.rows.at(-1)!;
    expect(last.cells.at(-1)!.value).toBe("25");
    expect(last.cells.slice(0, 5).map((c) => c.value)).toEqual(["21~25", "16~20", "11~15", "6~10", "1~5"]);
  });

  it("s.90 (p.45): tdm-frame에 입력 3줄이 나오면 프레임 1 = C1 | B1 | A1", () => {
    const q = Array.from({ length: 500 }, (_, i) => DC_GENERATORS["tdm-frame"].generate(i + 1)).find((x) => x.prompt.startsWith("입력 3줄"));
    if (!q || q.type !== "trace") throw new Error("없음");
    expect(q.rows[0].cells.map((c) => c.value)).toEqual(["C1", "B1", "A1"]);
  });
});

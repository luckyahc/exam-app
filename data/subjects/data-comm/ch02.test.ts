import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { DC_GENERATORS, BIT_LENGTH_NOTE, SHANNON_STAR_BASIS } from "@/lib/sim/data-comm/generators";
import type { Question } from "@/types/question";
import ch02 from "./ch02";

// 데이터 통신 Ch02 콘텐츠 기준(docs/sprints/sprint-10-dc-content.md, docs/coverage-matrix.md 데이터 통신 Ch02).
// DC-2-PhyLayer.pdf는 한 쪽에 슬라이드 2장 → PDF 쪽 = ⌈슬라이드 ÷ 2⌉.

const TARGETS: Record<string, number> = {
  "물리 계층 역할": 2,
  "아날로그·디지털 데이터와 신호": 3,
  "주기 신호(단순/복합), 사인파 3요소, 주파수·주기": 4,
  "위상(도·라디안)": 3,
  "파장(λ = c/f)": 3,
  "시간/주파수 영역, 복합 신호, 대역폭": 4,
  "디지털 신호: 레벨·r, 비트율, 비트 길이": 4,
  "기저대역 vs 광대역(변조)": 2,
  "전송 장애 3원인, 감쇠·증폭(dB)": 4,
  "왜곡, 잡음 4종": 3,
  "SNR / SNR_dB": 3,
  "데이터 전송률 한계 3요소, Nyquist 비트율": 8,
  "Shannon 용량, 두 한계 함께 쓰기": 8,
  "성능 지표 5종, 대역폭 두 의미, 처리량": 4,
  "지연(4요소, 전파·전송 시간)": 4,
  "대역폭-지연 곱, 지터": 8,
  "디지털→디지털 변환, 블록 코딩 mB/nB": 3,
  "PCM 3과정, Nyquist 표본화율": 4,
  "델타 변조(PCM과 비교, 구성요소)": 2,
  "디지털→아날로그 분류, 비트율 vs 보오율": 3,
  "BASK·BFSK·BPSK 대역폭·구현, 성상도, QAM": 4,
  "아날로그→아날로그: AM·FM·PM 대역폭, 대역 할당": 4,
  "다중화 개념·분류, FDM과 보호 대역": 4,
  "WDM, TDM·동기식 TDM": 3,
  "전송 매체 분류(유도/비유도), 꼬임쌍선(UTP/STP)": 4,
  "동축 케이블, 광섬유(임계각·클래딩)": 4,
  "무선: 전파·마이크로파·적외선": 4,
};
const STAR = ["데이터 전송률 한계 3요소, Nyquist 비트율", "Shannon 용량, 두 한계 함께 쓰기", "대역폭-지연 곱, 지터"];
const page = (slide: number) => Math.ceil(slide / 2);
const byId = (id: string) => {
  const q = ch02.find((x) => x.id === id);
  if (!q) throw new Error(`없는 문항: ${id}`);
  return q;
};
const calcAnswer = (id: string) => {
  const q = byId(id);
  if (q.type !== "calc") throw new Error(`${id}는 calc가 아님`);
  return q.answer;
};

describe("데이터 통신 Ch02 — 문항 수·소주제·⭐", () => {
  it("106문항 이상, 소주제 27개가 모두 목표 이상", () => {
    expect(ch02.length).toBeGreaterThanOrEqual(106);
    expect(Object.keys(TARGETS)).toHaveLength(27);
    expect(Object.values(TARGETS).reduce((a, b) => a + b, 0)).toBe(106);
    for (const [topic, target] of Object.entries(TARGETS)) expect(ch02.filter((q) => q.topic === topic).length, topic).toBeGreaterThanOrEqual(target);
    expect(ch02.filter((q) => !(q.topic in TARGETS)).map((q) => q.id)).toEqual([]);
  });

  it("⭐는 3개 소주제에만, 모두 printed-emphasis, 주제마다 6~10문항·유형 3종 이상", () => {
    for (const q of ch02) {
      expect(q.exam, q.id).toBe(STAR.includes(q.topic));
      if (q.exam) expect(q.examBasis, q.id).toBe("printed-emphasis");
    }
    for (const topic of STAR) {
      const qs = ch02.filter((q) => q.topic === topic);
      expect(qs.length).toBeGreaterThanOrEqual(6);
      expect(qs.length).toBeLessThanOrEqual(10);
      expect(new Set(qs.map((q) => q.type)).size, topic).toBeGreaterThanOrEqual(3);
    }
  });

  it("⭐ 13번(Shannon·두 한계) 해설은 모두 근거를 's.33 인쇄 강조의 범위 확장'으로 적는다", () => {
    for (const q of ch02.filter((x) => x.topic === STAR[1])) expect(q.explanation, q.id).toContain("s.33 인쇄 강조의 범위 확장");
    expect(SHANNON_STAR_BASIS).toContain("s.33 인쇄 강조의 범위 확장");
  });
});

describe("데이터 통신 Ch02 — 유형 비율", () => {
  const n = ch02.length;
  const count = (t: Question["type"]) => ch02.filter((q) => q.type === t).length;
  it("blank 15% 이상, mcq 30% 이하, ox 18% 이하, trace 3 이상(link-fill·tdm-frame), graph 6 이상", () => {
    expect(count("blank") / n).toBeGreaterThanOrEqual(0.15);
    expect(count("mcq") / n).toBeLessThanOrEqual(0.3);
    expect(count("ox") / n).toBeLessThanOrEqual(0.18);
    expect(count("trace")).toBeGreaterThanOrEqual(3);
    const traceGens = new Set(ch02.filter((q) => q.type === "trace").map((q) => q.generator?.name));
    expect(traceGens.has("link-fill") && traceGens.has("tdm-frame")).toBe(true);
    expect(count("graph")).toBeGreaterThanOrEqual(6);
  });
  it("graph는 Sprint 9 Ch02 그림만 쓰고, FM과 PM을 같은 문제의 보기로 함께 내지 않는다", () => {
    const ch02Figures = new Set(["signal", "sine", "spectrum", "levels", "snr", "keying", "constellation", "analog-mod", "attenuation", "critical-angle"]);
    for (const q of ch02) {
      if (q.type !== "graph") continue;
      const figs = q.options.map((o) => (o.figure.kind === "dc" ? o.figure.figure : null));
      for (const f of figs) expect(f && ch02Figures.has(f.name), q.id).toBe(true);
      const mods = figs.flatMap((f) => (f?.name === "analog-mod" ? [f.scheme] : []));
      expect(mods.includes("fm") && mods.includes("pm"), q.id).toBe(false);
    }
  });
});

describe("데이터 통신 Ch02 — 슬라이드 예제 기준값(lib/sim/data-comm 계산값 = 슬라이드 값)", () => {
  it.each([
    ["data-comm-ch02-sine-003", 311.127, 0.001, "s.8 (p.4) 220 V → 피크(슬라이드 310 V, ±1.5)"],
    ["data-comm-ch02-phase-001", Math.PI / 3, 1e-12, "s.11 (p.6) 1/6 주기 → π/3 rad(슬라이드 1.046)"],
    ["data-comm-ch02-wavelength-003", 0.75e-6, 1e-18, "s.13 (p.7) 빨간빛 4×10¹⁴ Hz → 0.75×10⁻⁶ m"],
    ["data-comm-ch02-bandwidth-003", 4000, 0, "s.17 (p.9) 1000~5000 Hz → 4000 Hz"],
    ["data-comm-ch02-digital-003", 1_536_000, 0, "s.20 (p.10) Example 2.3 → 1,536,000 bps"],
    ["data-comm-ch02-digital-004", 0.651, 0.0005, "s.21 (p.11) Example 2.4 → 0.651 μs"],
    ["data-comm-ch02-impairment-003", -3.0103, 0.0001, "s.26 (p.13) Example 2.5 → −3 dB(정확값 −3.01)"],
    ["data-comm-ch02-snr-001", 40, 1e-9, "s.30 (p.15) 10 mW / 1 μW → 40 dB"],
    ["data-comm-ch02-nyquist-005", 98.7, 0.05, "s.35 (p.18) Example 2.6 → L ≈ 98.7"],
    ["data-comm-ch02-nyquist-006", 280, 0, "s.35 (p.18) Example 2.6 → 128레벨 280 kbps"],
    ["data-comm-ch02-shannon-002", 0, 0, "s.37 (p.19) Example 2.7 → C = 0"],
    ["data-comm-ch02-shannon-003", 34_881, 0.5, "s.38 (p.19) Example 2.8 → 34,881 bps"],
    ["data-comm-ch02-shannon-006", 6, 0, "s.40 (p.20) Example 2.9 → 6 Mbps"],
    ["data-comm-ch02-perf-004", 2, 0, "s.45 (p.23) → 처리량 2 Mbps"],
    ["data-comm-ch02-delay-003", 50, 1e-9, "s.47 (p.24) → 전파 시간 50 ms"],
    ["data-comm-ch02-delay-004", 0.02, 1e-12, "s.47 (p.24) → 전송 시간 0.020 ms"],
    ["data-comm-ch02-bdp-003", 25, 0, "s.50 (p.25) Case 2 → 25비트"],
    ["data-comm-ch02-pcm-003", 64, 0, "s.61 (p.31) Example 2.13 → 64 kbps"],
    ["data-comm-ch02-fdm-004", 540, 0, "s.87 (p.44) → 540 kHz"],
    ["data-comm-ch02-wireless-004", 1e-3, 1e-15, "s.101 (p.51) 적외선 3×10¹¹ Hz → 10⁻³ m"],
  ] as const)("%s = %s (±%s) — %s", (id, expected, tol, label) => {
    expect(label).toMatch(/^s\.\d+ \(p\.\d+\)/);
    expect(Math.abs(calcAnswer(id) - expected)).toBeLessThanOrEqual(tol);
    // 슬라이드에 적힌 근사값도 정답으로 채점된다
    const q = byId(id);
    expect(gradeQuestion(q, String(expected)).correct, `${id} 슬라이드 값 정답 처리`).toBe(true);
  });

  it("슬라이드 근사값 정답 처리: 310 V, 1.046 rad, −3 dB, 34.881 kbps", () => {
    expect(gradeQuestion(byId("data-comm-ch02-sine-003"), "310").correct).toBe(true);
    expect(gradeQuestion(byId("data-comm-ch02-phase-001"), "1.046").correct).toBe(true);
    expect(gradeQuestion(byId("data-comm-ch02-impairment-003"), "-3").correct).toBe(true);
    expect(gradeQuestion(byId("data-comm-ch02-shannon-003"), "34,881").correct).toBe(true);
  });

  it("지수 입력으로 답해도 정답: 0.75e-6 · 7.5x10^-7 · 10^-3", () => {
    expect(gradeQuestion(byId("data-comm-ch02-wavelength-003"), "0.75e-6").correct).toBe(true);
    expect(gradeQuestion(byId("data-comm-ch02-wavelength-003"), "7.5x10^-7").correct).toBe(true);
    expect(gradeQuestion(byId("data-comm-ch02-wireless-004"), "10^-3").correct).toBe(true);
  });
});

describe("데이터 통신 Ch02 — 생성기 문항", () => {
  const gens = ch02.filter((q) => q.generator);

  it("생성기 문항은 {generator, params, seed}로 저장되고, 같은 seed·params로 다시 만들면 같은 문제다", () => {
    expect(gens.length).toBeGreaterThanOrEqual(20);
    for (const q of gens) {
      const g = DC_GENERATORS[q.generator!.name as keyof typeof DC_GENERATORS];
      expect(g, q.id).toBeDefined();
      expect(g.generate(q.generator!.seed, q.generator!.params as never)).toEqual(q);
      expect(gradeQuestion(q, answerKey(q)).correct).toBe(true);
    }
  });

  it("생성기 문항이 정적 문항(슬라이드 예제)이나 서로와 문장이 겹치지 않는다", () => {
    const prompts = ch02.map((q) => q.prompt + (q.type === "blank" ? q.text : ""));
    expect(new Set(prompts).size).toBe(prompts.length);
  });
});

describe("데이터 통신 Ch02 — 표기·보충", () => {
  it("slideRef 'Ch02 s.N' 또는 'Ch02 s.N-M'(1~101)", () => {
    for (const q of ch02) {
      const m = /^Ch02 s\.(\d+)(?:-(\d+))?$/.exec(q.slideRef);
      expect(m, q.id).not.toBeNull();
      for (const s of [m![1], m![2]].filter(Boolean).map(Number)) expect(s >= 2 && s <= 101, q.id).toBe(true);
    }
  });

  it("정적 문항 해설은 's.번호 (p.쪽)'으로 시작하고, 모든 's.N (p.P)' 표기가 PDF 쪽과 맞는다", () => {
    const bad: string[] = [];
    for (const q of ch02) {
      if (!q.generator && !/^s\.\d+(~\d+)? \(p\.\d+(~\d+)?\)/.test(q.explanation)) bad.push(`${q.id}: 시작 표기`);
      for (const m of q.explanation.matchAll(/s\.(\d+)(?:~(\d+))? \(p\.(\d+)(?:~(\d+))?\)/g)) {
        const [s1, s2, p1, p2] = [m[1], m[2], m[3], m[4]].map((x) => (x ? Number(x) : undefined));
        if (page(s1!) !== p1) bad.push(`${q.id}: s.${s1} → p.${page(s1!)}인데 p.${p1}`);
        if (s2 !== undefined && page(s2) !== (p2 ?? p1)) bad.push(`${q.id}: s.${s2} → p.${page(s2)}인데 p.${p2 ?? p1}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("허용 오차·반올림 규칙(슬라이드에 없음)이 적용된 calc는 해설에 '(보충)'", () => {
    for (const q of ch02) if (q.type === "calc" && (q.tolerance > 0 || q.relTolerance)) expect(q.explanation, q.id).toContain("(보충)");
  });

  it("비트 길이 문항: 답 단위(μs)를 문제에 적고, 해설에 정의(거리)와 예제(시간)의 차이 한 줄", () => {
    const bl = ch02.filter((q) => q.type === "calc" && /비트 길이/.test(q.prompt));
    expect(bl.length).toBeGreaterThanOrEqual(2);
    for (const q of bl) {
      expect(q.prompt, q.id).toContain("마이크로초(μs)");
      expect(q.explanation, q.id).toContain(BIT_LENGTH_NOTE);
    }
  });

  it("거짓 OX에는 틀린 이유, blank는 영어·한국어(또는 약어) 표기를 함께 받는다", () => {
    for (const q of ch02) {
      if (q.type === "ox" && !q.answer) expect(q.falseReason, q.id).toBeTruthy();
      if (q.type === "blank")
        for (const b of q.blanks) {
          expect(b.accept.some((a) => /[A-Za-z]/.test(a)), q.id).toBe(true);
          expect(b.accept.length, q.id).toBeGreaterThanOrEqual(3);
        }
    }
  });
});

describe("대조 기록 docs/verification/data-comm-ch01-ch02.md (Ch02 절)", () => {
  const md = readFileSync(path.resolve(import.meta.dirname, "../../../docs/verification/data-comm-ch01-ch02.md"), "utf8");
  const rows = md.split(/\r?\n/).filter((l) => /^\| \d+ \| `data-comm-ch02-/.test(l));
  /** 라벨의 괄호는 이스케이프해 정규식에 넣는다 */
  const num = (label: string) => {
    const row = md.split(/\r?\n/).find((l) => l.startsWith(`| Ch02 ${label} | `));
    return Number(row?.split("|")[2]?.trim());
  };

  it("전 문항이 한 줄씩 빠짐없이 있고, 문제 파일과 id·순서가 같다", () => {
    expect(rows.map((r) => /`([^`]+)`/.exec(r)![1])).toEqual(ch02.map((q) => q.id));
  });

  it("Ch02 요약 숫자 = 표에서 센 값", () => {
    expect(num("전체")).toBe(rows.length);
    expect(num("신규 문항 일치")).toBe(rows.filter((r) => r.includes("| 신규·일치 |")).length);
    expect(num("신규 문항 수정")).toBe(rows.filter((r) => r.includes("| 신규·수정 |")).length);
    expect(num("그림 근거(정적)")).toBe(rows.filter((r) => r.includes("| 그림:")).length);
    expect(num("생성기 문항")).toBe(rows.filter((r) => r.includes("| 생성기 ")).length);
    expect(num("⭐ (printed-emphasis)")).toBe(rows.filter((r) => r.includes("| ⭐ P |")).length);
  });
});

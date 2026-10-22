import { describe, expect, it } from "vitest";
import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion, isAllOrNothing } from "@/lib/qtypes/registry";
import { filterQuestions } from "@/lib/quiz/session";
import { hintSetOf, matchesSource, relatedBadge } from "@/lib/quiz/jokbo";
import { nextPow2, nyquistBitRate, nyquistLevels, shannonCapacity } from "@/lib/sim/data-comm/capacity";
import { decibel, snr, snrDb } from "@/lib/sim/data-comm/decibel";
import { baudRate, bitsPerSignalElement } from "@/lib/sim/data-comm/digital";
import { amBandwidth, askPskBandwidth, fmBandwidth, fskBandwidth, pmBandwidth } from "@/lib/sim/data-comm/modulation";
import { fdmBandwidth, tdmLinkRate, tdmSlotDuration } from "@/lib/sim/data-comm/multiplexing";
import { pcmBitRate, samplingRate } from "@/lib/sim/data-comm/pcm";
import { bandwidthDelayProduct, latency, propagationTime, throughput, transmissionTime } from "@/lib/sim/data-comm/performance";
import { peakFromRms, phaseFromCycles, wavelength } from "@/lib/sim/data-comm/signal";
import type { Question } from "@/types/question";
import { T as T1 } from "./ch01";
import { T as T2 } from "./ch02";
import dataComm from "./index";
import { HINT1, HINT_SETS } from "./hintExams";

// 힌트관련1~5 모의시험(docs/dc-exam-hint.md): 세트 구성이 시험 힌트대로인지, 계산 정답이 lib/sim/data-comm 값과 같은지 확인한다.

const page = (slide: number) => Math.ceil(slide / 2);
const all = HINT_SETS.flat();
const byId = new Map(all.map((q) => [q.id, q]));
const q = (id: string) => byId.get(`data-comm-${id}`)!;
/** 객관식 정답 보기 글자 */
const picked = (id: string) => {
  const x = q(id);
  if (x.type !== "mcq") throw new Error(`${id}는 mcq가 아님`);
  return x.choices[x.answerIndex];
};
const calcAnswer = (id: string) => {
  const x = q(id);
  if (x.type !== "calc") throw new Error(`${id}는 calc가 아님`);
  return x.answer;
};

describe("힌트관련 세트 구성 — 시험 힌트(23~26문제, 30점, 선택형 5지선다·모두 고르시오 2~4개, 주관식)", () => {
  it.each(HINT_SETS.map((s, i) => [i + 1, s] as const))("힌트관련%i: 25문항, id 번호 001~025 순서", (n, set) => {
    expect(set).toHaveLength(25);
    set.forEach((x, i) => {
      expect(x.id).toMatch(new RegExp(`^data-comm-${x.chapter}-hint${n}-${String(i + 1).padStart(3, "0")}$`));
      expect(hintSetOf(x)).toBe(n);
    });
  });

  it.each(HINT_SETS.map((s, i) => [i + 1, s] as const))("힌트관련%i: 선택형 21(mcq 16 · multi 5) + 주관식 4 = 30점, Ch01 8 · Ch02 17", (_, set) => {
    const count = (t: Question["type"]) => set.filter((x) => x.type === t).length;
    expect(count("mcq")).toBe(16);
    expect(count("multi")).toBe(5);
    const subjective = set.filter((x) => x.type === "calc" || x.type === "blank");
    expect(subjective).toHaveLength(4);
    // 배점: 선택형 1점 × 21 + 주관식(2~3점) 4문항 = 30점이 되는 배점이 있다(2·2·2·3)
    expect(21 + 2 * 3 + 3).toBe(30);
    expect(set.filter((x) => x.chapter === "ch01")).toHaveLength(8);
    expect(set.filter((x) => x.chapter === "ch02")).toHaveLength(17);
  });

  it("선택형은 5지선다, '모두 고르시오'는 정답 2~4개", () => {
    for (const x of all) {
      if (x.type === "mcq") expect(x.choices, x.id).toHaveLength(5);
      if (x.type === "multi") {
        expect(x.choices, x.id).toHaveLength(5);
        expect(x.answerIndexes.length >= 2 && x.answerIndexes.length <= 4, x.id).toBe(true);
        expect(x.prompt, x.id).toMatch(/모두 고르시오\.$/);
      }
    }
    // 정답 수 2·3·4개가 모두 나온다
    expect(new Set(all.flatMap((x) => (x.type === "multi" ? [x.answerIndexes.length] : [])))).toEqual(new Set([2, 3, 4]));
  });

  it("'모두 고르시오'는 부분 점수 없음(데이터 통신 allOrNothing)", () => {
    const m = all.find((x) => x.type === "multi")!;
    expect(isAllOrNothing(m)).toBe(true);
    if (m.type !== "multi") return;
    expect(gradeQuestion(m, m.answerIndexes.slice(1)).score).toBe(0);
    expect(gradeQuestion(m, answerKey(m)).score).toBe(1);
  });

  it("난이도는 중간(2)·어려움(3)만, 세트마다 어려움이 10문항 이상", () => {
    for (const x of all) expect([2, 3], x.id).toContain(x.difficulty);
    for (const set of HINT_SETS) expect(set.filter((x) => x.difficulty === 3).length).toBeGreaterThanOrEqual(10);
  });

  it("세트마다 표 문항과 계산 문항이 있다(문제에 표·그림 포함 가능, 계산은 공학용 계산기 없이)", () => {
    for (const set of HINT_SETS) {
      expect(set.some((x) => x.prompt.includes("```text"))).toBe(true);
      expect(set.some((x) => x.type === "calc")).toBe(true);
    }
  });

  it("힌트관련4·5(더 헷갈리게)는 어려움이 20문항 이상", () => {
    for (const set of HINT_SETS.slice(3)) expect(set.filter((x) => x.difficulty === 3).length).toBeGreaterThanOrEqual(20);
  });

  it("세 세트를 합치면 Ch01 18개·Ch02 27개 소주제가 모두 나온다(범위 전체에서 골고루)", () => {
    const used = new Set(all.map((x) => x.topic));
    expect([...Object.values(T1), ...Object.values(T2)].filter((t) => !used.has(t))).toEqual([]);
  });

  it("지문(prompt + 빈칸 본문)이 세트 사이에도 겹치지 않는다", () => {
    const keys = all.map((x) => x.prompt + (x.type === "blank" ? x.text : ""));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("해설은 's.번호 (p.쪽)'으로 시작하고, 해설 안의 모든 's.N (p.P)' 표기가 PDF 쪽과 맞는다", () => {
    const bad: string[] = [];
    for (const x of all) {
      if (!/^s\.\d+(~\d+)? \(p\.\d+(~\d+)?\)/.test(x.explanation)) bad.push(`${x.id}: 시작 표기`);
      for (const m of x.explanation.matchAll(/s\.(\d+)(?:~(\d+))? \(p\.(\d+)(?:~(\d+))?\)/g)) {
        const [s1, s2, p1, p2] = [m[1], m[2], m[3], m[4]].map((v) => (v ? Number(v) : undefined));
        if (page(s1!) !== p1) bad.push(`${x.id}: s.${s1} → p.${page(s1!)}인데 p.${p1}`);
        if (s2 !== undefined && page(s2) !== (p2 ?? p1)) bad.push(`${x.id}: s.${s2} → p.${page(s2)}인데 p.${p2 ?? p1}`);
      }
      const max = x.chapter === "ch01" ? 44 : 101;
      const r = /^Ch0[12] s\.(\d+)(?:-(\d+))?$/.exec(x.slideRef);
      if (!r || [r[1], r[2]].filter(Boolean).some((v) => Number(v) < 2 || Number(v) > max)) bad.push(`${x.id}: slideRef ${x.slideRef}`);
    }
    expect(bad).toEqual([]);
  });

  it("빈칸은 칸마다 한국어와 영어(또는 숫자) 표기를 함께 받는다", () => {
    for (const x of all) {
      if (x.type !== "blank") continue;
      for (const b of x.blanks) {
        expect(b.accept.some((a) => /[A-Za-z0-9]/.test(a)), x.id).toBe(true);
        expect(b.accept.length, x.id).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("힌트관련 분류 — 과목 데이터·퀴즈 필터", () => {
  it("챕터 로더 맨 뒤에 붙고(Ch01 40 · Ch02 85), 분류 hint1~5로 세트마다 25문항이 골라진다", async () => {
    const [ch01, ch02] = await Promise.all(dataComm.chapters.map((c) => c.load()));
    expect(ch01.filter((x) => hintSetOf(x))).toHaveLength(40);
    expect(ch02.filter((x) => hintSetOf(x))).toHaveLength(85);
    expect(ch01.slice(-40).every((x) => hintSetOf(x))).toBe(true);
    const qs = [...ch01, ...ch02];
    for (const n of [1, 2, 3, 4, 5] as const) {
      expect(qs.filter((x) => matchesSource(x, `hint${n}`))).toHaveLength(25);
      expect(relatedBadge(qs.find((x) => hintSetOf(x) === n)!)).toBe(`힌트관련${n}`);
    }
    // 실제 시험처럼 문제 순서를 섞는다(같은 seed면 같은 순서)
    const a = filterQuestions(qs, { source: "hint1", shuffle: true, seed: "a" }).map((x) => x.id);
    expect(a).toHaveLength(25);
    expect(a).not.toEqual(HINT1.map((x) => x.id));
    expect(filterQuestions(qs, { source: "hint1", shuffle: true, seed: "a" }).map((x) => x.id)).toEqual(a);
  });

  it("연도를 묻는 문항이 없다(2026-10-22 삭제 요청)", async () => {
    const qs = (await Promise.all(dataComm.chapters.map((c) => c.load()))).flat();
    expect(qs.filter((x) => /19\d\d년|\d{4}년|년대/.test(x.prompt + JSON.stringify((x as { choices?: string[] }).choices ?? []))).map((x) => x.id)).toEqual([]);
  });
});

describe("계산 정답 재계산(lib/sim/data-comm)", () => {
  it("힌트관련1", () => {
    expect(phaseFromCycles(3 / 8).deg).toBe(135);
    expect(phaseFromCycles(3 / 8).rad).toBeCloseTo((3 * Math.PI) / 4);
    expect(picked("ch02-hint1-010")).toBe("135°, 3π/4 rad");
    expect(wavelength(4e6, 2e8)).toBe(50);
    expect(picked("ch02-hint1-011")).toBe("50 m");
    expect(calcAnswer("ch02-hint1-013")).toBeCloseTo(1.3889, 3);
    expect(decibel(0.5 * 10 * 0.5, 1)).toBeCloseTo(3.98, 2);
    expect(picked("ch02-hint1-015")).toBe("약 +4 dB");
    expect(calcAnswer("ch02-hint1-017")).toBeCloseTo(10, 9);
    const { levels } = nyquistLevels(150e3, 10e3);
    expect(levels).toBeCloseTo(181.02, 1);
    expect(picked("ch02-hint1-018")).toBe(String(nextPow2(levels)));
    expect(nyquistBitRate(10e3, 128)).toBe(140e3);
    expect(shannonCapacity(2e6, 255)).toBe(16e6);
    expect(nyquistLevels(12e6, 2e6).levels).toBe(8);
    expect(picked("ch02-hint1-019")).toBe("16 Mbps, 8레벨");
    expect(calcAnswer("ch02-hint1-020")).toBe(5);
    expect(pcmBitRate(samplingRate(5000), 8)).toBe(80e3);
    expect(picked("ch02-hint1-021")).toBe("80 kbps");
    expect(baudRate(12e3, 4)).toBe(3000);
    expect(picked("ch02-hint1-022")).toBe("3,000 baud");
    expect(fdmBandwidth(6, 50, 5)).toBe(325);
    expect(picked("ch02-hint1-023")).toBe("325 kHz");
  });

  it("힌트관련2", () => {
    expect(peakFromRms(110)).toBeCloseTo(155.56, 2);
    expect(picked("ch02-hint2-010")).toBe("약 156 V");
    expect(1 / 0.25e-3).toBe(4000);
    expect(calcAnswer("ch02-hint2-012")).toBe(800);
    expect(bitsPerSignalElement(16)).toBe(4);
    expect(picked("ch02-hint2-013")).toBe("4비트");
    expect(calcAnswer("ch02-hint2-015")).toBeCloseTo(39.869, 2);
    expect(bandwidthDelayProduct(10e6, 2e-3)).toBeCloseTo(20_000, 6);
    expect(picked("ch02-hint2-016")).toBe("20,000비트");
    const latency = propagationTime(4.8e6, 2.4e8) + transmissionTime(8e6, 100e6);
    expect(latency).toBeCloseTo(0.1, 12);
    expect(picked("ch02-hint2-017")).toBe("100 ms");
    expect(askPskBandwidth(baudRate(6000, 1), 0.5)).toBe(9000);
    expect(picked("ch02-hint2-021")).toBe("9 kHz");
    expect(fmBandwidth(15)).toBe(150);
    expect(picked("ch02-hint2-022")).toBe("150 kHz");
    expect(calcAnswer("ch02-hint2-023")).toBeCloseTo(200, 9);
  });

  it("힌트관련3", () => {
    expect(calcAnswer("ch02-hint3-010")).toBeCloseTo(0.5, 12);
    expect((56 * 12) / 4).toBe(168);
    expect(picked("ch02-hint3-012")).toBe("168 kbps");
    expect(decibel(1, 100)).toBe(-20);
    expect(picked("ch02-hint3-013")).toBe("−20 dB");
    expect(nyquistBitRate(3000, 4)).toBe(12_000);
    expect(picked("ch02-hint3-014")).toMatch(/^12,000 bps, /);
    expect(shannonCapacity(3000, 3162)).toBeCloseTo(34_881, 0);
    expect(shannonCapacity(500e3, 1023)).toBe(5e6);
    expect(calcAnswer("ch02-hint3-016")).toBe(16);
    expect(transmissionTime(5e6 * 8, 1e6)).toBe(40);
    expect(propagationTime(12_000e3, 2.4e8)).toBeCloseTo(0.05, 12);
    expect(picked("ch02-hint3-017")).toMatch(/^전송 시간 40 s, 전파 시간 50 ms/);
    expect(calcAnswer("ch02-hint3-018")).toBeCloseTo(2.5e6, 3);
    expect((100 * 5) / 4).toBe(125);
    expect(picked("ch02-hint3-019")).toBe("125 Mbps");
    expect(pcmBitRate(samplingRate(11_000), 8)).toBe(176e3);
    expect(picked("ch02-hint3-020")).toBe("176 kbps");
    expect([amBandwidth(4), fmBandwidth(4)]).toEqual([8, 40]);
    expect(picked("ch02-hint3-023")).toBe("AM 8 kHz, FM 40 kHz");
    expect(tdmLinkRate(3, 1)).toBe(3);
    expect(tdmSlotDuration(1, 3)).toBeCloseTo(0.333, 3);
    expect(picked("ch02-hint3-024")).toBe("3 kbps, 약 0.33 ms");
  });

  it("힌트관련4", () => {
    expect(peakFromRms(220)).toBeCloseTo(311.1, 1);
    expect(311 / Math.SQRT2).toBeCloseTo(219.9, 1);
    expect(picked("ch02-hint4-010")).toBe("약 220 V");
    expect(calcAnswer("ch02-hint4-011")).toBeCloseTo(150, 9);
    expect(2e8 * 2e-6).toBe(400);
    expect(wavelength(1 / 2e-6, 2e8)).toBeCloseTo(400, 9);
    expect(picked("ch02-hint4-012")).toBe("400 m");
    expect(decibel(1, 1000)).toBeCloseTo(-30, 9);
    expect(picked("ch02-hint4-015")).toBe("−30 dB");
    expect(snrDb(snr(5e-3, 50e-9))).toBeCloseTo(50, 9);
    expect(calcAnswer("ch02-hint4-017")).toBeCloseTo(50, 9);
    expect(nyquistBitRate(20e3, 64)).toBe(240e3);
    expect(nyquistBitRate(20e3, 128)).toBe(280e3);
    expect(picked("ch02-hint4-019")).toBe("240 kbps");
    expect(shannonCapacity(3000, 63)).toBe(18e3);
    expect(3000 * Math.log2(63)).toBeCloseTo(17_932, 0);
    expect(picked("ch02-hint4-020")).toBe("18 kbps");
    expect(calcAnswer("ch02-hint4-022")).toBeCloseTo(32, 9);
    expect(propagationTime(12_000e3, 2.4e8)).toBeCloseTo(0.05, 12);
    expect(bandwidthDelayProduct(1e6, 8e-3) / 8).toBeCloseTo(1000, 9);
    expect(picked("ch02-hint4-023")).toBe("1,000바이트");
    expect(1000 * 3).toBe(3000);
    expect(picked("ch02-hint4-025")).toBe("3,000 bps");
  });

  it("힌트관련5", () => {
    expect(wavelength(30e9) * 1e3).toBeCloseTo(10, 9);
    expect(picked("ch02-hint5-011")).toBe("10 mm");
    expect([nyquistBitRate(4000, 4), nyquistBitRate(4000, 8)]).toEqual([16e3, 24e3]);
    expect(picked("ch02-hint5-012")).toBe("16 kbps → 24 kbps");
    expect(decibel(4, 1)).toBeCloseTo(6.02, 2);
    expect(picked("ch02-hint5-013")).toBe("약 +6 dB");
    expect(shannonCapacity(1e6, calcAnswer("ch02-hint5-015"))).toBe(10e6);
    expect(calcAnswer("ch02-hint5-015")).toBe(1023);
    expect(nyquistBitRate(5000, 256)).toBe(80e3);
    expect(picked("ch02-hint5-016")).toBe("256");
    expect(throughput(12_000, 10_000, 60)).toBe(2e6);
    expect(picked("ch02-hint5-017")).toBe("처리량 2 Mbps, 대역폭의 약 1/5");
    expect(latency({ propagation: 0.01, transmission: 0.4, queuing: 5e-3, processing: 1e-3 })).toBeCloseTo(0.416, 12);
    expect(calcAnswer("ch02-hint5-018")).toBeCloseTo(416, 6);
    expect(calcAnswer("ch02-hint5-021")).toBe(12);
    expect(pcmBitRate(samplingRate(4000), 12)).toBe(96e3);
    expect(fskBandwidth(baudRate(4000, 1), 0, 2000)).toBe(8000);
    expect(picked("ch02-hint5-022")).toBe("8 kHz");
    expect(pmBandwidth(10, 1)).toBe(40);
    expect(fmBandwidth(10)).toBe(100);
    expect(picked("ch02-hint5-023")).toBe("40 kHz");
    expect(fdmBandwidth(8, 107.5, 20)).toBe(1000);
    expect(picked("ch02-hint5-024")).toBe("107.5 kHz");
  });
});

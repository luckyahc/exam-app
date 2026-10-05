import type { CalcQ } from "@/lib/qtypes/calc";
import type { TraceCell, TraceQ } from "@/lib/qtypes/trace";
import type { Question } from "@/types/question";
import { createRng, type Rng } from "../_shared/rng";
import { type Generator, type GeneratorMap, genId } from "../_shared/types";
import { bothLimits, nextPow2, nyquistBitRate, nyquistLevels, prevPow2, shannonCapacity } from "./capacity";
import { decibel, snr, snrDb } from "./decibel";
import { baudRate, bitLength, bitsPerSignalElement, textBitRate } from "./digital";
import { assertPositive, fmt, round, sci } from "./format";
import { bitGroup, linkFill } from "./linkFill";
import { amBandwidth, askPskBandwidth, FM_COMMON_BETA, fmBandwidth, fskBandwidth, pmBandwidth } from "./modulation";
import { fdmBandwidth, tdmLinkRate, tdmSlotDuration } from "./multiplexing";
import { pcmBitRate, samplingRate } from "./pcm";
import { bandwidthDelayProduct, latency, propagationTime, throughput, transmissionTime } from "./performance";
import { bandwidth, frequency, LIGHT_SPEED, peakFromRms, period, phaseFromCycles, wavelength } from "./signal";
import { lineName, tdmFrames } from "./tdmFrame";

/**
 * 데이터 통신 문제 생성기 (Sprint 9). 모든 정답은 lib/sim/data-comm의 계산 함수로 구한다.
 * 같은 seed·params면 항상 같은 문제. params.variant를 주면 그 변형으로 고정, 없으면 seed로 고른다.
 * 근거: DC-2-PhyLayer.pdf — 각 변형의 slideRef. 공식·단위 규칙은 docs/dc-source-analysis.md §5,
 * 답의 반올림·허용 오차는 docs/dc-question-types.md §2(슬라이드에 없는 규칙은 "(보충)" — docs/sprints/sprint-09 결과 참고).
 */

// ------------------------------------------------------------------ 공용

interface Meta {
  topic: string;
  slideRef: string;
  /** ⭐ 소주제 12·13·16 (printed-emphasis) */
  exam?: boolean;
}

/** 소주제 이름 — docs/coverage-matrix.md 데이터 통신 Ch02 */
const T = {
  sine: "주기 신호(단순/복합), 사인파 3요소, 주파수·주기",
  phase: "위상(도·라디안)",
  wavelength: "파장(λ = c/f)",
  bandwidth: "시간/주파수 영역, 복합 신호, 대역폭",
  digital: "디지털 신호: 레벨·r, 비트율, 비트 길이",
  db: "전송 장애 3원인, 감쇠·증폭(dB)",
  snr: "SNR / SNR_dB",
  nyquist: "데이터 전송률 한계 3요소, Nyquist 비트율",
  shannon: "Shannon 용량, 두 한계 함께 쓰기",
  perf: "성능 지표 5종, 대역폭 두 의미, 처리량",
  delay: "지연(4요소, 전파·전송 시간)",
  bdp: "대역폭-지연 곱, 지터",
  pcm: "PCM 3과정, Nyquist 표본화율",
  d2a: "디지털→아날로그 분류, 비트율 vs 보오율",
  keying: "BASK·BFSK·BPSK 대역폭·구현, 성상도, QAM",
  a2a: "아날로그→아날로그: AM·FM·PM 대역폭, 대역 할당",
  fdm: "다중화 개념·분류, FDM과 보호 대역",
  tdm: "WDM, TDM·동기식 TDM",
} as const;

function baseOf(name: string, meta: Meta, seed: number, params: Record<string, unknown>, difficulty: 1 | 2 | 3) {
  return {
    id: genId("data-comm", "ch02", name, seed),
    subject: "data-comm" as const,
    chapter: "ch02",
    topic: meta.topic,
    exam: !!meta.exam,
    ...(meta.exam ? { examBasis: "printed-emphasis" as const } : {}),
    difficulty,
    slideRef: meta.slideRef,
    generator: { name, params, seed },
  };
}

/**
 * 답의 정밀도 규칙 (docs/dc-question-types.md §2: 허용 오차 = 요구 반올림 자릿수의 절반).
 * 문제 문장에 요구 자릿수를 적고, 그 절반을 허용 오차로 쓴다.
 */
const EXACT = { tolerance: 0, note: "" };
const DP1 = { tolerance: 0.05, note: " (소수 첫째 자리까지)", supplement: "(보충) 채점 규칙: 소수 첫째 자리까지 답하면 정답(허용 오차 ±0.05) — 반올림 자릿수는 슬라이드에 없는 앱 규칙이다." };
const DP3 = { tolerance: 0.0005, note: " (소수 셋째 자리까지)", supplement: "(보충) 채점 규칙: 소수 셋째 자리까지 답하면 정답(허용 오차 ±0.0005) — 반올림 자릿수는 슬라이드에 없는 앱 규칙이다." };
/** 지수 표기로 답하는 큰/작은 값: 유효숫자 3자리 → 상대 오차 0.5% (보충) */
const SIG3 = {
  tolerance: 0,
  relTolerance: 0.005,
  note: " (유효숫자 3자리, 지수 표기 가능: 예 `3e8`, `3×10^8`)",
  supplement: "(보충) 채점 규칙: 유효숫자 3자리면 정답(상대 오차 ±0.5%) — 슬라이드에 없는 앱 규칙이다.",
};

/** supplement: 슬라이드에 없는 채점 규칙(보충) — 해설 끝에 붙는다 */
type Precision = { tolerance: number; relTolerance?: number; note: string; supplement?: string };

function calc(
  base: ReturnType<typeof baseOf>,
  ask: string,
  answer: number,
  unit: string,
  precision: Precision,
  steps: string[],
  explanation: string,
): CalcQ {
  if (!Number.isFinite(answer)) throw new RangeError(`${base.id}: 정답이 유한하지 않음`);
  return {
    ...base,
    type: "calc",
    prompt: `${ask}${precision.note}`,
    answer,
    tolerance: precision.tolerance,
    ...(precision.relTolerance ? { relTolerance: precision.relTolerance } : {}),
    unit,
    steps,
    explanation: precision.supplement ? `${explanation} ${precision.supplement}` : explanation,
  };
}

function pickVariant<V extends string>(rng: Rng, variants: readonly V[], given?: V): V {
  const v = given ?? rng.pick(variants);
  if (!variants.includes(v)) throw new RangeError(`알 수 없는 변형: ${v}`);
  return v;
}

// ------------------------------------------------------------------ signal (s.8, s.11, s.13, s.17, s.101)

const SIGNAL_VARIANTS = ["frequency", "period", "phaseDeg", "phaseRad", "wavelength", "bandwidth", "peak"] as const;
type SignalParams = { variant: (typeof SIGNAL_VARIANTS)[number] };

const FRACTIONS: [number, number][] = [
  [1, 12],
  [1, 8],
  [1, 6],
  [1, 4],
  [1, 3],
  [3, 8],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 6],
];

export const signalGen: Generator<SignalParams> = {
  name: "signal",
  chapter: "ch02",
  topic: T.sine,
  description: "주파수·주기 역수, 위상(도·라디안), 파장 λ = c/f, 대역폭 = 최고 − 최저, 피크 = √2 × 실효",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, SIGNAL_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("signal", m, seed, { variant }, d);

    if (variant === "frequency") {
      const ms = rng.pick([0.1, 0.2, 0.25, 0.5, 1, 2, 4, 5, 8, 10, 20, 25, 50, 100]);
      assertPositive({ ms });
      const f = frequency(ms / 1000);
      return calc(
        b({ topic: T.sine, slideRef: "Ch02 s.8" }, 1),
        `주기 T = ${fmt(ms)} ms인 사인파의 **주파수**는 몇 Hz인가?`,
        round(f, 9),
        "Hz",
        EXACT,
        [`f = 1 / T`, `= 1 / (${fmt(ms)} × 10⁻³ s)`, `= ${fmt(f)} Hz`],
        `주파수와 주기는 역수(f = 1/T)다. ms를 초로 바꾸지 않고 1/${fmt(ms)}로 계산하면 1000배 작은 값이 나온다.`,
      );
    }
    if (variant === "period") {
      const hz = rng.pick([50, 60, 100, 125, 200, 250, 400, 500, 1000, 2000, 4000, 5000, 8000]);
      assertPositive({ hz });
      const ms = period(hz) * 1000;
      return calc(
        b({ topic: T.sine, slideRef: "Ch02 s.8" }, 1),
        `주파수 ${fmt(hz)} Hz인 사인파의 **주기**는 몇 ms인가?`,
        ms,
        "ms",
        DP3,
        [`T = 1 / f`, `= 1 / ${fmt(hz)} s`, `= ${fmt(ms, 4)} ms`],
        `주기는 주파수의 역수(T = 1/f)다. 초 단위 값(${sci(period(hz))} s)에 1000을 곱해 ms로 바꾼다.`,
      );
    }
    if (variant === "phaseDeg" || variant === "phaseRad") {
      const [n, d] = rng.pick(FRACTIONS);
      const p = phaseFromCycles(n / d);
      const deg = round(p.deg, 9);
      if (variant === "phaseDeg")
        return calc(
          b({ topic: T.phase, slideRef: "Ch02 s.11" }, 1),
          `사인파가 시간 0을 기준으로 **${n}/${d} 주기** 밀려 있다. 위상은 몇 **도(°)**인가?`,
          deg,
          "°",
          EXACT,
          [`위상 = ${n}/${d} × 360°`, `= ${fmt(deg)}°`],
          `한 주기가 360°이므로 주기 비율에 360°를 곱한다(슬라이드 예: 1/6 주기 = 60°). 2π를 곱하면 라디안 값이 된다.`,
        );
      return calc(
        b({ topic: T.phase, slideRef: "Ch02 s.11" }, 2),
        `사인파가 시간 0을 기준으로 **${n}/${d} 주기** 밀려 있다. 위상은 몇 **라디안(rad)**인가?`,
        p.rad,
        "rad",
        { tolerance: 0.002, note: " (소수 셋째 자리까지, ±0.002)", supplement: "(보충) 허용 오차 ±0.002 rad는 슬라이드 근사값(π/3 = 1.046)도 받기 위한 앱 규칙이다." },
        [`위상(도) = ${n}/${d} × 360° = ${fmt(deg)}°`, `라디안 = ${fmt(deg)}° × 2π / 360° = ${fmt(p.rad, 4)} rad`],
        `360° = 2π rad이므로 도에 2π/360을 곱한다. 정확값은 ${fmt(p.rad, 4)} rad이다(슬라이드는 π/3을 1.046으로 적었다 — 반올림하면 1.047이라 ±0.002를 허용).`,
      );
    }
    if (variant === "wavelength") {
      const f = rng.pick([1, 1.5, 2, 3, 4, 5, 6]) * 10 ** rng.int(6, 14);
      assertPositive({ f });
      const lambda = wavelength(f);
      return calc(
        b({ topic: T.wavelength, slideRef: "Ch02 s.13" }, 2),
        `주파수 ${sci(f)} Hz인 신호가 빛의 속도 c = 3×10⁸ m/s로 전파될 때 **파장 λ**는 몇 m인가?`,
        lambda,
        "m",
        SIG3,
        [`λ = c / f`, `= ${sci(LIGHT_SPEED)} / ${sci(f)}`, `= ${sci(lambda)} m`],
        `파장은 한 주기 동안 신호가 가는 거리(λ = c/f = c × T)다. 주파수가 높을수록 파장은 짧다. c와 f를 곱하면 틀린다.${f < 3e11 ? " (보충) 슬라이드는 이 공식을 빛(s.13)·적외선(s.101)에 썼다 — 더 낮은 주파수의 전자기파도 같은 속도 c로 계산했다." : ""}`,
      );
    }
    if (variant === "bandwidth") {
      const low = rng.pick([300, 1000, 2000, 5000, 10_000, 20_000]);
      const width = rng.pick([1000, 2000, 3000, 4000, 10_000, 20_000]);
      const high = low + width;
      assertPositive({ low, width });
      return calc(
        b({ topic: T.bandwidth, slideRef: "Ch02 s.17" }, 1),
        `복합 신호가 ${fmt(low)} Hz부터 ${fmt(high)} Hz까지의 주파수를 담고 있다. 이 신호의 **대역폭**은 몇 Hz인가?`,
        bandwidth(high, low),
        "Hz",
        EXACT,
        [`대역폭 = 최고 주파수 − 최저 주파수`, `= ${fmt(high)} − ${fmt(low)}`, `= ${fmt(width)} Hz`],
        `대역폭은 신호에 들어 있는 주파수의 범위(최고 − 최저)다. 최고 주파수 자체(${fmt(high)} Hz)를 대역폭으로 답하면 틀린다.`,
      );
    }
    // peak
    const rms = rng.pick([100, 110, 120, 220, 230, 240]);
    assertPositive({ rms });
    const peak = peakFromRms(rms);
    return calc(
      b({ topic: T.sine, slideRef: "Ch02 s.8" }, 1),
      `실효(평균) 전압이 ${rms} V인 교류의 **피크 진폭**은 몇 V인가? (피크 = 2½ × 실효값, 정수로 답하면 ±1.5 V까지 정답)`,
      peak,
      "V",
      { tolerance: 1.5, note: "", supplement: "(보충) 허용 오차 ±1.5 V는 슬라이드 근사값(220 V → 310 V)도 받기 위한 앱 규칙이다." },
      [`피크 = 2½ × 실효 = √2 × ${rms}`, `= ${fmt(peak, 2)} V`],
      `피크 진폭은 실효값의 √2(= 2½)배다. 슬라이드는 220 V → 310 V로 적었는데 √2 × 220 = 311.1 V라 근사값이다(그래서 ±1.5 V 허용).`,
    );
  },
};

// ------------------------------------------------------------------ digital (s.19~21, s.68)

const DIGITAL_VARIANTS = ["bitRate", "bitLength", "r", "baud"] as const;
type DigitalParams = { variant: (typeof DIGITAL_VARIANTS)[number] };

const RATES = [
  { bps: 1_536_000, label: "1.536 Mbps" },
  { bps: 1e6, label: "1 Mbps" },
  { bps: 2e6, label: "2 Mbps" },
  { bps: 10e6, label: "10 Mbps" },
  { bps: 100e6, label: "100 Mbps" },
  { bps: 64_000, label: "64 kbps" },
  { bps: 56_000, label: "56 kbps" },
  { bps: 10_000, label: "10 kbps" },
  { bps: 500_000, label: "500 kbps" },
] as const;

/** 비트 길이 문제 해설에 넣는 한 줄 (docs/dc-source-analysis.md 확인 필요 4 답변) */
export const BIT_LENGTH_NOTE = "교재 정의는 거리(1비트가 매체에서 차지하는 길이)지만 슬라이드 예제는 시간으로 계산한다.";

export const digitalGen: Generator<DigitalParams> = {
  name: "digital",
  chapter: "ch02",
  topic: T.digital,
  description: "비트율 = 쪽×줄×글자×비트, 비트 길이 = 1/비트율(μs), r = log₂ L, S = N/r",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, DIGITAL_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("digital", m, seed, { variant }, d);

    if (variant === "bitRate") {
      const pages = rng.pick([10, 20, 50, 100, 200]);
      const lines = rng.pick([20, 24, 30, 40, 50]);
      const chars = rng.pick([40, 60, 64, 80, 100]);
      const bits = rng.pick([7, 8]);
      assertPositive({ pages, lines, chars, bits });
      const n = textBitRate(pages, lines, chars, bits);
      return calc(
        b({ topic: T.digital, slideRef: "Ch02 s.20" }, 1),
        `초당 ${pages}쪽의 문서를 내려받는다. 한 쪽은 평균 ${lines}줄, 한 줄은 ${chars}글자이고 한 글자는 ${bits}비트다. **비트율**은 몇 bps인가?`,
        n,
        "bps",
        EXACT,
        [`비트율 = 쪽/초 × 줄 × 글자 × 비트`, `= ${pages} × ${lines} × ${chars} × ${bits}`, `= ${fmt(n)} bps`],
        `1초에 보내는 비트 수를 모두 곱한다(슬라이드 예: 100 × 24 × 80 × 8 = 1,536,000 bps). 글자당 비트(${bits})를 빼먹으면 ${fmt(n / bits)}이 된다.`,
      );
    }
    if (variant === "bitLength") {
      const rate = rng.pick(RATES);
      assertPositive({ bps: rate.bps });
      const us = bitLength(rate.bps) * 1e6;
      return calc(
        b({ topic: T.digital, slideRef: "Ch02 s.21" }, 2),
        `비트율이 ${rate.label}일 때 **비트 길이(= 1 / 비트율)**를 **마이크로초(μs)** 단위로 구하시오.`,
        us,
        "μs",
        DP3,
        [`비트 길이 = 1 / 비트율`, `= 1 / ${fmt(rate.bps)} s`, `= ${sci(bitLength(rate.bps))} s = ${fmt(us, 4)} μs`],
        `비트 하나를 보내는 데 걸리는 시간 = 1 / 비트율이다(슬라이드 예: 1/1,536,000 = 0.651 μs). 초 값에 10⁶을 곱해 μs로 바꾼다. ${BIT_LENGTH_NOTE}`,
      );
    }
    if (variant === "r") {
      const levels = rng.pick([2, 4, 8, 16, 32, 64, 128, 256]);
      const r = bitsPerSignalElement(levels);
      return calc(
        b({ topic: T.digital, slideRef: "Ch02 s.19" }, 1),
        `디지털 신호의 레벨 수가 ${levels}개일 때, 신호 요소 하나가 나르는 비트 수 **r**은?`,
        r,
        "비트",
        EXACT,
        [`r = log₂ L = log₂ ${levels}`, `= ${r}`],
        `레벨이 L개면 신호 요소 하나로 log₂ L비트를 나른다(슬라이드: 2레벨 r=1, 4레벨 r=2). 레벨 수(${levels})를 그대로 답하면 틀린다.`,
      );
    }
    // baud
    const levels = rng.pick([2, 4, 8, 16]);
    const r = bitsPerSignalElement(levels);
    const s = rng.pick([1000, 2400, 4000, 8000, 9600]);
    const n = s * r;
    assertPositive({ s, n });
    return calc(
      b({ topic: T.d2a, slideRef: "Ch02 s.68" }, 2),
      `신호 요소 하나가 ${levels}개 레벨 중 하나를 나타내는 방식으로 ${fmt(n)} bps를 보낸다. **보오율(신호율) S**는 몇 baud인가?`,
      baudRate(n, r),
      "baud",
      EXACT,
      [`r = log₂ ${levels} = ${r}`, `S = N × 1/r = ${fmt(n)} / ${r}`, `= ${fmt(s)} baud`],
      `보오율은 초당 신호 요소 수, 비트율은 초당 비트 수다. 신호 요소 하나가 r비트를 나르므로 S = N/r이다. N × r로 곱하면 틀린다.`,
    );
  },
};

// ------------------------------------------------------------------ decibel (s.26~27, s.30)

const DECIBEL_VARIANTS = ["attenuation", "gain", "snr", "snrDb"] as const;
type DecibelParams = { variant: (typeof DECIBEL_VARIANTS)[number] };

/** dB 허용 오차 ±0.05 (docs/dc-source-analysis.md 확인 필요 7: 슬라이드 −3 dB는 −3.01의 근사) */
const DB = { tolerance: 0.05, note: " (소수 첫째 자리까지)", supplement: "(보충) dB 반올림 규칙은 슬라이드에 없다 — 소수 첫째 자리, ±0.05 dB 허용(슬라이드의 −3 dB는 정확값 −3.01의 근사)." };

export const decibelGen: Generator<DecibelParams> = {
  name: "decibel",
  chapter: "ch02",
  topic: T.db,
  description: "감쇠·증폭 dB = 10 log₁₀(P₂/P₁), SNR = 신호/잡음, SNR_dB = 10 log₁₀ SNR",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, DECIBEL_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("decibel", m, seed, { variant }, d);

    if (variant === "attenuation" || variant === "gain") {
      const ratio =
        variant === "attenuation" ? rng.pick([0.5, 0.25, 0.2, 0.1, 0.05, 0.01, 0.001]) : rng.pick([2, 4, 5, 8, 10, 20, 50, 100, 1000]);
      assertPositive({ ratio });
      const db = decibel(ratio, 1);
      const what =
        variant === "attenuation"
          ? `전송 매체를 지나며 신호 전력이 처음의 ${fmt(ratio)}배로 줄었다(P₂ = ${fmt(ratio)}P₁). **감쇠**는 몇 dB인가? (손실은 음수로)`
          : `증폭기를 지나며 신호 전력이 ${fmt(ratio)}배가 되었다(P₂ = ${fmt(ratio)}P₁). **증폭**은 몇 dB인가?`;
      return calc(
        b({ topic: T.db, slideRef: variant === "attenuation" ? "Ch02 s.26" : "Ch02 s.27" }, 1),
        what,
        db,
        "dB",
        DB,
        [`dB = 10 log₁₀(P₂ / P₁)`, `= 10 log₁₀ ${fmt(ratio)}`, `= ${fmt(db, 3)} dB`],
        `전력비의 상용로그에 10을 곱한다. 감쇠(P₂ < P₁)는 음수, 증폭은 양수다(슬라이드: 절반 → −3 dB, 10배 → 10 dB, 100배 → 20 dB). 20을 곱하면(전압비 공식) 두 배로 틀린다.`,
      );
    }
    const mW = rng.pick([1, 2, 5, 10, 20, 50, 100]);
    const uW = rng.pick([1, 2, 4, 5, 10, 20]);
    assertPositive({ mW, uW });
    const ratio = snr(mW * 1000, uW);
    const setup = `신호 전력이 ${mW} mW, 잡음 전력이 ${uW} μW이다.`;
    if (variant === "snr")
      return calc(
        b({ topic: T.snr, slideRef: "Ch02 s.30" }, 1),
        `${setup} **SNR**(신호 대 잡음비)은?`,
        ratio,
        "(단위 없음)",
        EXACT,
        [`SNR = 평균 신호 전력 / 평균 잡음 전력`, `= ${fmt(mW * 1000)} μW / ${uW} μW`, `= ${fmt(ratio)}`],
        `두 전력의 단위를 맞춘 뒤 나눈다(1 mW = 1000 μW, 슬라이드 예: 10 mW / 1 μW = 10,000). 단위를 맞추지 않고 ${mW}/${uW}로 나누면 1000배 작아진다.`,
      );
    const db = snrDb(ratio);
    return calc(
      b({ topic: T.snr, slideRef: "Ch02 s.30" }, 2),
      `${setup} **SNR_dB**는 몇 dB인가?`,
      db,
      "dB",
      DB,
      [`SNR = ${fmt(mW * 1000)} μW / ${uW} μW = ${fmt(ratio)}`, `SNR_dB = 10 log₁₀ ${fmt(ratio)}`, `= ${fmt(db, 3)} dB`],
      `먼저 단위를 맞춰 SNR을 구하고(1 mW = 1000 μW), 10 log₁₀을 취한다(슬라이드 예: SNR 10,000 → 40 dB). SNR 값 자체를 dB로 답하면 틀린다.`,
    );
  },
};

// ------------------------------------------------------------------ ⭐ capacity (s.34~40)

const CAPACITY_VARIANTS = ["nyquistRate", "nyquistLevels", "nyquistPow2", "shannon", "bothCapacity", "bothLevels", "bothTrace"] as const;
type CapacityParams = { variant: (typeof CAPACITY_VARIANTS)[number] };

const FRACTION_LOG = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];

/** ⭐ 13번(Shannon·두 한계) 근거 — s.36~40에는 강조 문구가 없어 s.33 인쇄 강조의 범위 확장으로 ⭐ */
export const SHANNON_STAR_BASIS = "⭐ 근거: s.33 인쇄 강조의 범위 확장(s.36~40에는 강조 문구 없음).";

/** ⭐ 문항 핵심 한 줄(슬라이드 공식 그대로) */
const CAPACITY_SUMMARY: Record<(typeof CAPACITY_VARIANTS)[number], string> = {
  nyquistRate: "Nyquist BitRate = 2 × B × log₂ L(s.34)",
  nyquistLevels: "log₂ L = 비트율 / 2B, L = 2^(log₂ L)(s.34-35)",
  nyquistPow2: "L이 2의 거듭제곱이 아니면 레벨을 늘리거나(비트율↑) 줄인다(비트율↓)(s.35)",
  shannon: "Shannon C = B × log₂(1 + SNR) — SNR은 dB가 아닌 비율(s.36)",
  bothCapacity: "두 한계 함께: Shannon 용량이 비트율의 상한(s.39)",
  bothLevels: "Shannon으로 상한 → 그보다 낮은 비트율 → Nyquist로 레벨 수(s.39-40)",
  bothTrace: "Shannon으로 상한 → 그보다 낮은 비트율 → Nyquist로 레벨 수(s.39-40)",
};

function capacityQuestion(seed: number, params: Partial<CapacityParams>): Question {
    const rng = createRng(seed);
    const variant = pickVariant(rng, CAPACITY_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("capacity", { ...m, exam: true }, seed, { variant }, d);
    const NY = { topic: T.nyquist, slideRef: "Ch02 s.34-35" };

    if (variant === "nyquistRate") {
      const kHz = rng.pick([3, 4, 8, 10, 20, 50, 100]);
      const levels = rng.pick([2, 4, 8, 16, 32, 64, 128]);
      assertPositive({ kHz, levels: levels - 1 });
      const kbps = nyquistBitRate(kHz * 1000, levels) / 1000;
      return calc(
        b(NY, 1),
        `대역폭 ${kHz} kHz인 잡음 없는 채널에서 신호 레벨 ${levels}개를 쓴다. Nyquist 공식으로 구한 **최대 비트율**은 몇 kbps인가?`,
        kbps,
        "kbps",
        EXACT,
        [`BitRate = 2 × B × log₂ L`, `= 2 × ${fmt(kHz * 1000)} × log₂ ${levels} = 2 × ${fmt(kHz * 1000)} × ${Math.log2(levels)}`, `= ${fmt(kbps * 1000)} bps = ${fmt(kbps)} kbps`],
        `잡음 없는 채널의 이론 최대 비트율은 Nyquist 공식 2B log₂ L이다. 2를 빼먹거나 log₂ L 대신 L을 곱하면 틀린다.`,
      );
    }
    if (variant === "nyquistLevels" || variant === "nyquistPow2") {
      const kHz = rng.pick([10, 20, 25, 50]);
      const log2L = rng.int(3, 6) + rng.pick(FRACTION_LOG);
      const kbps = 2 * kHz * log2L;
      assertPositive({ kHz, kbps });
      const r = nyquistLevels(kbps * 1000, kHz * 1000);
      const setup = `대역폭 ${kHz} kHz인 잡음 없는 채널로 ${fmt(kbps)} kbps를 보내려 한다.`;
      const s1 = `${fmt(kbps * 1000)} = 2 × ${fmt(kHz * 1000)} × log₂ L → log₂ L = ${fmt(r.log2L)}`;
      if (variant === "nyquistLevels")
        return calc(
          b(NY, 2),
          `${setup} Nyquist 공식으로 필요한 **신호 레벨 수 L**은?`,
          r.levels,
          "레벨",
          DP1,
          [s1, `L = 2^${fmt(r.log2L)} = ${fmt(r.levels, 2)}`],
          `BitRate = 2B log₂ L을 log₂ L에 대해 풀고 2의 거듭제곱으로 L을 구한다(슬라이드 예: 265 kbps, 20 kHz → log₂ L = 6.625, L ≈ 98.7). log₂ L 값(${fmt(r.log2L)})을 L로 답하면 틀린다.`,
        );
      const up = rng.chance(0.5);
      const L2 = up ? nextPow2(r.levels) : prevPow2(r.levels);
      const kbps2 = nyquistBitRate(kHz * 1000, L2) / 1000;
      return calc(
        b(NY, 3),
        `${setup} 필요한 레벨 수가 2의 거듭제곱이 아니어서 레벨 수를 **바로 ${up ? "위" : "아래"}의 2의 거듭제곱**으로 정했다. 그때의 **비트율**은 몇 kbps인가?`,
        kbps2,
        "kbps",
        EXACT,
        [s1, `L = 2^${fmt(r.log2L)} ≈ ${fmt(r.levels, 1)} → ${up ? "올림" : "내림"}: L = ${L2}`, `BitRate = 2 × ${fmt(kHz * 1000)} × log₂ ${L2} = ${fmt(kbps2)} kbps`],
        `레벨 수는 2의 거듭제곱이어야 하므로 레벨을 늘리거나(비트율 ↑) 비트율을 줄인다(레벨 ↓). 슬라이드 예: 98.7 → 128레벨이면 280 kbps, 64레벨이면 240 kbps.`,
      );
    }
    const SH = { topic: T.shannon, slideRef: "Ch02 s.36-38" };
    if (variant === "shannon") {
      if (rng.chance(0.5)) {
        const hz = rng.pick([3000, 3100, 4000]);
        const ratio = rng.pick([100, 500, 1000, 2000, 3162]);
        assertPositive({ hz, snr: ratio });
        const c = shannonCapacity(hz, ratio);
        return calc(
          b(SH, 2),
          `대역폭 ${fmt(hz)} Hz, SNR ${fmt(ratio)}인 전화선의 **Shannon 용량**은 몇 kbps인가? (±0.1% 이내면 정답)`,
          c / 1000,
          "kbps",
          { tolerance: 0, relTolerance: 0.001, note: "", supplement: "(보충) 허용 오차 ±0.1%는 계산기마다 다른 로그 정밀도를 받기 위한 앱 규칙이다." },
          [`C = B × log₂(1 + SNR)`, `= ${fmt(hz)} × log₂ ${fmt(1 + ratio)} = ${fmt(hz)} × ${fmt(Math.log2(1 + ratio), 4)}`, `= ${fmt(round(c, 0))} bps ≈ ${fmt(c / 1000, 3)} kbps`],
          `잡음 있는 채널의 이론 최대 비트율은 Shannon 공식 B log₂(1 + SNR)이다(슬라이드 예: 3000 Hz, SNR 3162 → 34,881 bps). SNR_dB 값을 그대로 넣거나 1을 더하지 않으면 틀린다.`,
        );
      }
      const mhz = rng.pick([1, 2, 5, 10, 20]);
      const k = rng.int(3, 12);
      const ratio = 2 ** k - 1;
      assertPositive({ mhz, snr: ratio });
      const c = shannonCapacity(mhz * 1e6, ratio) / 1e6;
      return calc(
        b(SH, 2),
        `대역폭 ${mhz} MHz, SNR ${fmt(ratio)}인 채널의 **Shannon 용량**은 몇 Mbps인가?`,
        c,
        "Mbps",
        EXACT,
        [`C = B × log₂(1 + SNR)`, `= ${mhz} MHz × log₂ ${fmt(ratio + 1)} = ${mhz} × ${k}`, `= ${fmt(c)} Mbps`],
        `Shannon 용량 C = B log₂(1 + SNR). 1 + SNR = 2^${k}라 log₂가 ${k}로 떨어진다(슬라이드 예: 1 MHz, SNR 63 → 6 Mbps). 1을 더하지 않으면 log₂ ${fmt(ratio)}이 되어 틀린다.`,
      );
    }
    // 두 한계 함께 (s.39~40)
    const BOTH = { topic: T.shannon, slideRef: "Ch02 s.39-40" };
    const mhz = rng.pick([1, 2, 4, 5, 10, 20]);
    const k = rng.int(3, 10);
    const ratio = 2 ** k - 1;
    const j = rng.int(1, Math.ceil(k / 2) - 1); // 2j < k → 고른 비트율이 상한보다 낮다
    const chosen = 2 * mhz * j; // Mbps
    assertPositive({ mhz, snr: ratio, chosen });
    const r = bothLimits(mhz * 1e6, ratio, chosen * 1e6);
    if (!r.withinLimit || chosen * 1e6 >= r.capacity) throw new RangeError("고른 비트율이 상한보다 낮아야 함");
    const setup = `대역폭 ${mhz} MHz, SNR ${fmt(ratio)}인 채널이 있다.`;
    const capStep = `C = ${mhz} MHz × log₂(1 + ${fmt(ratio)}) = ${mhz} × ${k} = ${fmt(r.capacity / 1e6)} Mbps (상한)`;
    const lvlStep = `${chosen} Mbps = 2 × ${mhz} MHz × log₂ L → log₂ L = ${j} → L = ${r.levels}`;
    const explanation = `Shannon 공식이 상한(${fmt(r.capacity / 1e6)} Mbps)을 주고, 그보다 낮은 비트율을 골라 Nyquist 공식으로 레벨 수를 정한다(슬라이드 예: 1 MHz, SNR 63 → 상한 6 Mbps, 4 Mbps를 고르면 L = 4). 상한 그대로 Nyquist에 넣거나 Shannon 공식으로 레벨을 구하면 틀린다.`;
    /** 고르는 비트율 규칙은 슬라이드에 없다(슬라이드는 "예를 들어 4 Mbps") */
    const chosenNote = "(보충) 고르는 비트율은 log₂ L이 정수가 되도록(2의 거듭제곱 레벨) 앱이 정한 값이다 — 슬라이드는 '예를 들어 4 Mbps'라고만 한다.";
    if (variant === "bothCapacity")
      return calc(b(BOTH, 2), `${setup} 이 채널로 보낼 수 있는 **비트율의 상한**은 몇 Mbps인가?`, r.capacity / 1e6, "Mbps", EXACT, [capStep], explanation);
    if (variant === "bothLevels")
      return calc(
        b(BOTH, 3),
        `${setup} 성능을 위해 상한보다 낮은 ${chosen} Mbps로 보내기로 했다. 필요한 **신호 레벨 수 L**은?`,
        r.levels,
        "레벨",
        EXACT,
        [capStep, lvlStep],
        `${explanation} ${chosenNote}`,
      );
    // bothTrace
    const cell = (value: string, blank = false): TraceCell => (blank ? { value, blank } : { value });
    const q: TraceQ = {
      ...b(BOTH, 3),
      type: "trace",
      prompt: `${setup} 두 한계를 함께 써서 비트율과 신호 레벨 수를 정한다. 빈칸을 채우시오. (고른 비트율은 ${chosen} Mbps)`,
      columns: ["값"],
      rows: [
        { label: "① Shannon 상한 C (Mbps)", cells: [cell(fmt(r.capacity / 1e6), true)] },
        { label: "② 고른 비트율 (Mbps)", cells: [cell(String(chosen))] },
        { label: "③ Nyquist로 구한 log₂ L", cells: [cell(String(j), true)] },
        { label: "④ 신호 레벨 수 L", cells: [cell(String(r.levels), true)] },
      ],
      explanation: `${capStep}. ${lvlStep}. ${explanation} ${chosenNote}`,
    };
    return q;
}

export const capacityGen: Generator<CapacityParams> = {
  name: "capacity",
  chapter: "ch02",
  topic: T.nyquist,
  description: "Nyquist 2B log₂ L(비트율·L 역산·2의 거듭제곱), Shannon B log₂(1+SNR), 두 한계 함께(상한 → 고른 비트율 → L)",
  generate(seed, params = {}) {
    const q = capacityQuestion(seed, params);
    const summary = CAPACITY_SUMMARY[q.generator!.params.variant as (typeof CAPACITY_VARIANTS)[number]];
    return q.topic === T.shannon ? { ...q, summary, explanation: `${q.explanation} ${SHANNON_STAR_BASIS}` } : { ...q, summary };
  },
};

// ------------------------------------------------------------------ performance (s.45~51)

const PERFORMANCE_VARIANTS = ["throughput", "propagation", "transmission", "latency", "bdp", "bdpSmall"] as const;
type PerformanceParams = { variant: (typeof PERFORMANCE_VARIANTS)[number] };

const LINKS = [
  { bps: 1e6, label: "1 Mbps" },
  { bps: 10e6, label: "10 Mbps" },
  { bps: 100e6, label: "100 Mbps" },
  { bps: 1e9, label: "1 Gbps" },
] as const;

export const performanceGen: Generator<PerformanceParams> = {
  name: "performance",
  chapter: "ch02",
  topic: T.perf,
  description: "처리량 = 프레임×비트/시간, 전파 = 거리/속도, 전송 = 크기/대역폭, 지연 4요소 합, 대역폭-지연 곱",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, PERFORMANCE_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("performance", m, seed, { variant }, d);

    if (variant === "throughput") {
      const perSec = rng.pick([50, 100, 200, 250, 500, 1000]);
      const perMin = perSec * 60;
      const bits = rng.pick([1000, 2000, 5000, 8000, 10_000, 12_000]);
      const mbps = throughput(perMin, bits, 60) / 1e6;
      const bw = mbps < 10 ? 10 : 100;
      assertPositive({ perMin, bits, bw });
      return calc(
        b({ topic: T.perf, slideRef: "Ch02 s.45" }, 2),
        `대역폭 ${bw} Mbps인 네트워크가 평균 **분당** ${fmt(perMin)}개의 프레임을 전달하고, 프레임마다 평균 ${fmt(bits)}비트를 나른다. **처리량**은 몇 Mbps인가?`,
        mbps,
        "Mbps",
        DP3,
        [`처리량 = 프레임 수 × 프레임당 비트 / 시간`, `= ${fmt(perMin)} × ${fmt(bits)} / 60 s`, `= ${fmt(mbps * 1e6)} bps = ${fmt(mbps)} Mbps`],
        `처리량은 실제로 보낸 비트 수 / 시간이다. 분당 값이므로 60초로 나눈다(슬라이드 예: 12,000 × 10,000 / 60 = 2 Mbps). 처리량은 대역폭(${bw} Mbps)보다 작다 — 대역폭을 답하면 틀린다.`,
      );
    }
    const km = rng.pick([100, 500, 1000, 3000, 5000, 12_000, 20_000]);
    const speed = rng.pick([2e8, 2.4e8, 3e8]);
    const kbyte = rng.pick([1, 1.5, 2.5, 5, 10, 64, 100]);
    const link = rng.pick(LINKS);
    assertPositive({ km, speed, kbyte, bps: link.bps });
    const propMs = propagationTime(km * 1000, speed) * 1000;
    const transMs = transmissionTime(kbyte * 1000 * 8, link.bps) * 1000;
    const propSteps = [`전파 시간 = 거리 / 전파 속도 = ${fmt(km)} × 1000 m / ${sci(speed)} m/s`, `= ${fmt(propMs, 4)} ms`];
    const transSteps = [`전송 시간 = 메시지 크기 / 대역폭 = ${fmt(kbyte * 1000)} × 8 비트 / ${sci(link.bps)} bps`, `= ${fmt(transMs, 4)} ms`];
    if (variant === "propagation")
      return calc(
        b({ topic: T.delay, slideRef: "Ch02 s.46-47" }, 1),
        `송신자와 수신자 사이 거리가 ${fmt(km)} km이고 신호가 ${sci(speed)} m/s로 전파된다. **전파 시간**은 몇 ms인가?`,
        propMs,
        "ms",
        DP3,
        propSteps,
        `전파 시간 = 거리 / 전파 속도. km를 m로 바꿔야 한다(슬라이드 예: 12,000 km, 2.4×10⁸ m/s → 50 ms). 메시지 크기나 대역폭은 전파 시간과 무관하다.`,
      );
    if (variant === "transmission")
      return calc(
        b({ topic: T.delay, slideRef: "Ch02 s.46-47" }, 1),
        `${fmt(kbyte)} kbyte(= ${fmt(kbyte * 1000)} 바이트) 메시지를 대역폭 ${link.label}인 링크로 보낸다. **전송 시간**은 몇 ms인가?`,
        transMs,
        "ms",
        DP3,
        transSteps,
        `전송 시간 = 메시지 크기(비트) / 대역폭. 바이트에 8을 곱해 비트로 바꾼다(슬라이드 예: 2500 × 8 / 10⁹ = 0.020 ms). 8을 빼먹으면 8배 작게 나온다.`,
      );
    if (variant === "latency") {
      const queuing = rng.pick([0, 1, 2, 5]);
      const processing = rng.pick([0.5, 1, 2]);
      const total = latency({ propagation: propMs, transmission: transMs, queuing, processing });
      return calc(
        b({ topic: T.delay, slideRef: "Ch02 s.46-47" }, 2),
        `${fmt(kbyte)} kbyte(= ${fmt(kbyte * 1000)} 바이트) 메시지를 대역폭 ${link.label}, 거리 ${fmt(km)} km, 전파 속도 ${sci(speed)} m/s인 경로로 보낸다. 큐잉 시간은 ${queuing} ms, 처리 시간은 ${processing} ms이다. **전체 지연(latency)**은 몇 ms인가?`,
        total,
        "ms",
        DP3,
        [...propSteps, ...transSteps, `지연 = 전파 + 전송 + 큐잉 + 처리 = ${fmt(propMs, 4)} + ${fmt(transMs, 4)} + ${queuing} + ${processing}`, `= ${fmt(total, 4)} ms`],
        `지연은 전파·전송·큐잉·처리 시간 네 가지의 합이다. 전파 시간만 답하거나 전송 시간을 바이트 단위로 계산하면 틀린다.`,
      );
    }
    const BDP = { topic: T.bdp, slideRef: "Ch02 s.48-51", exam: true };
    if (variant === "bdpSmall") {
      const bps = rng.int(1, 10);
      const sec = rng.int(2, 10);
      assertPositive({ bps, sec });
      const bits = bandwidthDelayProduct(bps, sec);
      return calc(
        b(BDP, 1),
        `대역폭 ${bps} bps, 지연 ${sec} s인 링크를 비트로 가득 채우려면 **몇 비트**가 필요한가? (대역폭-지연 곱)`,
        bits,
        "비트",
        EXACT,
        [`대역폭-지연 곱 = 대역폭 × 지연`, `= ${bps} bps × ${sec} s`, `= ${bits} 비트`],
        `대역폭-지연 곱은 링크를 채우는 비트 수다(슬라이드: 1 bps × 5 s = 5비트, 5 bps × 5 s = 25비트). 대역폭과 지연을 더하면 틀린다.`,
      );
    }
    const ms = rng.pick([1, 2, 5, 10, 20, 25, 50]);
    assertPositive({ ms });
    const bits = round(bandwidthDelayProduct(link.bps, ms / 1000), 6);
    return calc(
      b(BDP, 2),
      `대역폭 ${link.label}, 지연 ${ms} ms인 링크의 **대역폭-지연 곱**은 몇 비트인가? (지수 표기 가능: 예 \`5e6\`, \`5×10^6\`)`,
      bits,
      "비트",
      EXACT,
      [`대역폭-지연 곱 = 대역폭 × 지연`, `= ${sci(link.bps)} bps × ${ms} × 10⁻³ s`, `= ${fmt(bits)} 비트 (${sci(bits)})`],
      `대역폭-지연 곱은 링크(파이프)를 가득 채우는 비트 수다 — 단면적(대역폭) × 길이(지연). ms를 초로 바꾸지 않으면 1000배 커진다.`,
    );
  },
};

/** ⭐ 대역폭-지연 곱 문항 핵심 한 줄 */
const BDP_SUMMARY = "대역폭-지연 곱 = 대역폭 × 지연 = 링크를 채우는 비트 수(s.48)";
const performanceRaw = performanceGen.generate.bind(performanceGen);
performanceGen.generate = (seed, params) => {
  const q = performanceRaw(seed, params);
  return q.topic === T.bdp ? { ...q, summary: BDP_SUMMARY } : q;
};

// ------------------------------------------------------------------ pcm (s.61)

const PCM_VARIANTS = ["sampling", "bitRate"] as const;
type PcmParams = { variant: (typeof PCM_VARIANTS)[number] };

export const pcmGen: Generator<PcmParams> = {
  name: "pcm",
  chapter: "ch02",
  topic: T.pcm,
  description: "Nyquist 표본화율 = 2 × 최고 주파수, PCM 비트율 = 표본화율 × 표본당 비트",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, PCM_VARIANTS, params.variant);
    const b = (d: 1 | 2 | 3) => baseOf("pcm", { topic: T.pcm, slideRef: "Ch02 s.61" }, seed, { variant }, d);
    const fmax = rng.pick([3000, 3400, 4000, 5000, 8000, 10_000, 12_000, 15_000, 20_000]);
    const fs = samplingRate(fmax);
    assertPositive({ fmax });
    if (variant === "sampling")
      return calc(
        b(1),
        `0~${fmt(fmax)} Hz 성분을 가진 아날로그 신호를 PCM으로 디지털화한다. Nyquist 정리에 따른 **최소 표본화율**은 초당 몇 표본인가?`,
        fs,
        "표본/s",
        EXACT,
        [`표본화율 ≥ 2 × 최고 주파수`, `= 2 × ${fmt(fmax)}`, `= ${fmt(fs)} 표본/s`],
        `표본화율은 신호의 최고 주파수의 2배 이상이어야 한다(슬라이드 예: 0~4000 Hz → 8000 표본/s). 대역폭이 아니라 최고 주파수 기준이다.`,
      );
    const bits = rng.pick([4, 7, 8, 12, 16]);
    assertPositive({ bits });
    const kbps = pcmBitRate(fs, bits) / 1000;
    return calc(
      b(2),
      `0~${fmt(fmax)} Hz 성분을 가진 신호를 Nyquist 최소 표본화율로 표본화하고 표본마다 ${bits}비트로 부호화한다. **비트율**은 몇 kbps인가?`,
      kbps,
      "kbps",
      EXACT,
      [`표본화율 = 2 × ${fmt(fmax)} = ${fmt(fs)} 표본/s`, `비트율 = ${fmt(fs)} × ${bits}`, `= ${fmt(kbps * 1000)} bps = ${fmt(kbps)} kbps`],
      `비트율 = 표본화율 × 표본당 비트(슬라이드 예: 8000 × 8 = 64 kbps). 최고 주파수에 비트 수를 바로 곱하면(2배를 빼먹으면) 절반이 된다.`,
    );
  },
};

// ------------------------------------------------------------------ modulation (s.69~80)

const MODULATION_VARIANTS = ["ask", "psk", "fsk", "baud", "am", "fm", "pm"] as const;
type ModulationParams = { variant: (typeof MODULATION_VARIANTS)[number] };

export const modulationGen: Generator<ModulationParams> = {
  name: "modulation",
  chapter: "ch02",
  topic: T.keying,
  description: "BASK·BPSK B = (1+d)S, BFSK B = (1+d)S + 2Δf, S = N(r=1), AM 2B, FM 2(1+β)B(β 기본 4), PM 2(1+β)B(β 제시)",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, MODULATION_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("modulation", m, seed, { variant }, d);

    if (variant === "ask" || variant === "psk" || variant === "fsk" || variant === "baud") {
      const n = rng.pick([1000, 2000, 4000, 5000, 8000, 10_000]);
      const d = rng.pick([0, 0.25, 0.5, 0.75, 1]);
      const s = baudRate(n, 1);
      assertPositive({ n });
      const name = { ask: "BASK", psk: "BPSK", fsk: "BFSK", baud: rng.pick(["BASK", "BFSK", "BPSK"]) }[variant];
      const ref = { BASK: "Ch02 s.69", BFSK: "Ch02 s.71", BPSK: "Ch02 s.73" }[name]!;
      if (variant === "baud")
        return calc(
          b({ topic: T.keying, slideRef: ref }, 1),
          `${name}로 ${fmt(n)} bps를 보낸다. **보오율 S**는 몇 baud인가?`,
          s,
          "baud",
          EXACT,
          [`${name}는 r = 1 (신호 요소 하나에 1비트)`, `S = N × 1/r = ${fmt(n)} baud`],
          `이진 변조(BASK·BFSK·BPSK)는 신호 요소 하나가 1비트를 나르므로 S = N이다(슬라이드 그림: 비트율 5, 보오율 5).`,
        );
      if (variant === "fsk") {
        const df = rng.pick([500, 1000, 2000]);
        assertPositive({ df });
        const bw = fskBandwidth(s, d, df);
        return calc(
          b({ topic: T.keying, slideRef: ref }, 2),
          `BFSK로 ${fmt(n)} bps를 보낸다. d = ${d}, 두 반송파 주파수의 간격이 2Δf = ${fmt(2 * df)} Hz(Δf = ${fmt(df)} Hz)일 때 **필요한 대역폭**은 몇 Hz인가?`,
          bw,
          "Hz",
          EXACT,
          [`r = 1 → S = N = ${fmt(s)} baud`, `B = (1 + d)S + 2Δf = (1 + ${d}) × ${fmt(s)} + 2 × ${fmt(df)}`, `= ${fmt(bw)} Hz`],
          `BFSK는 두 주파수(f₁, f₂)를 쓰므로 BASK 대역폭 (1 + d)S에 두 반송파 간격 2Δf를 더한다. 2Δf를 빼먹으면 ${fmt((1 + d) * s)} Hz가 된다.`,
        );
      }
      const bw = askPskBandwidth(s, d);
      return calc(
        b({ topic: T.keying, slideRef: ref }, 1),
        `${name}로 ${fmt(n)} bps를 보낸다. d = ${d}일 때 **필요한 대역폭**은 몇 Hz인가?`,
        bw,
        "Hz",
        EXACT,
        [`r = 1 → S = N = ${fmt(s)} baud`, `B = (1 + d)S = (1 + ${d}) × ${fmt(s)}`, `= ${fmt(bw)} Hz`],
        `${name}는 r = 1이라 S = N이고 B = (1 + d)S다(d는 0~1, 변조·필터 과정에 따라 정해짐). d를 S에 곱하기만 하면(1 + 를 빼먹으면) 틀린다.`,
      );
    }
    const A2A = (ref: string): Meta => ({ topic: T.a2a, slideRef: ref });
    if (variant === "am") {
      const kHz = rng.pick([4, 5, 10, 15]);
      assertPositive({ kHz });
      return calc(
        b(A2A("Ch02 s.78"), 1),
        `대역폭 ${kHz} kHz인 음성 신호를 AM으로 변조한다. **변조된 신호의 대역폭**은 몇 kHz인가?`,
        amBandwidth(kHz),
        "kHz",
        EXACT,
        [`B_AM = 2B = 2 × ${kHz}`, `= ${amBandwidth(kHz)} kHz`],
        `AM 신호의 대역폭은 변조 신호 대역폭의 2배다(B_AM = 2B). FM 공식 2(1 + β)B를 쓰면 틀린다.`,
      );
    }
    if (variant === "fm") {
      const kHz = rng.pick([5, 10, 12, 15, 20]);
      assertPositive({ kHz });
      const bw = fmBandwidth(kHz);
      return calc(
        b(A2A("Ch02 s.79"), 1),
        `대역폭 ${kHz} kHz인 오디오 신호를 FM으로 변조한다. β는 흔히 쓰는 값 ${FM_COMMON_BETA}를 쓴다. **FM 신호의 대역폭**은 몇 kHz인가?`,
        bw,
        "kHz",
        EXACT,
        [`B_FM = 2(1 + β)B = 2 × (1 + ${FM_COMMON_BETA}) × ${kHz}`, `= ${fmt(bw)} kHz`],
        `FM 대역폭은 2(1 + β)B이고 β의 흔한 값은 4다(슬라이드 s.79). AM처럼 2B로 계산하면 틀린다.`,
      );
    }
    const kHz = rng.pick([5, 10, 15]);
    const beta = rng.pick([1, 2, 3, 5]);
    assertPositive({ kHz, beta });
    const bw = pmBandwidth(kHz, beta);
    return calc(
      b(A2A("Ch02 s.80"), 2),
      `대역폭 ${kHz} kHz인 오디오 신호를 PM으로 변조한다. β = ${beta}일 때 **PM 신호의 대역폭**은 몇 kHz인가?`,
      bw,
      "kHz",
      EXACT,
      [`B_PM = 2(1 + β)B = 2 × (1 + ${beta}) × ${kHz}`, `= ${fmt(bw)} kHz`],
      `PM 대역폭도 2(1 + β)B다. β는 문제에서 준 값(${beta})을 쓴다 — FM의 흔한 값 4를 넣으면 틀린다.`,
    );
  },
};

// ------------------------------------------------------------------ multiplexing (s.87, s.90)

const MULTIPLEXING_VARIANTS = ["fdm", "tdmRate", "tdmSlot"] as const;
type MultiplexingParams = { variant: (typeof MULTIPLEXING_VARIANTS)[number] };

export const multiplexingGen: Generator<MultiplexingParams> = {
  name: "multiplexing",
  chapter: "ch02",
  topic: T.fdm,
  description: "FDM 대역폭 = n × 채널 + (n − 1) × 보호 대역, 동기식 TDM 링크율 = n × 입력율, 슬롯 = T/n",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = pickVariant(rng, MULTIPLEXING_VARIANTS, params.variant);
    const b = (m: Meta, d: 1 | 2 | 3) => baseOf("multiplexing", m, seed, { variant }, d);

    if (variant === "fdm") {
      const n = rng.int(3, 8);
      const ch = rng.pick([4, 10, 20, 50, 100, 200]);
      const guard = rng.pick([1, 2, 5, 10, 20].filter((g) => g < ch));
      assertPositive({ n, ch, guard });
      const bw = fdmBandwidth(n, ch, guard);
      return calc(
        b({ topic: T.fdm, slideRef: "Ch02 s.87" }, 2),
        `대역폭 ${ch} kHz인 채널 ${n}개를 FDM으로 다중화한다. 채널 사이에는 간섭을 막기 위해 ${guard} kHz의 보호 대역이 필요하다. **필요한 최소 대역폭**은 몇 kHz인가?`,
        bw,
        "kHz",
        EXACT,
        [`보호 대역 수 = 채널 수 − 1 = ${n - 1}`, `대역폭 = ${n} × ${ch} + ${n - 1} × ${guard}`, `= ${fmt(bw)} kHz`],
        `보호 대역은 채널과 채널 사이에만 있으므로 n − 1개다(슬라이드 예: 5 × 100 + 4 × 10 = 540 kHz). 보호 대역을 n개로 세면 ${fmt(bw + guard)} kHz가 된다.`,
      );
    }
    const TDM: Meta = { topic: T.tdm, slideRef: "Ch02 s.90" };
    if (variant === "tdmRate") {
      const n = rng.int(2, 8);
      const rate = rng.pick([8, 16, 32, 64, 100]);
      assertPositive({ n, rate });
      return calc(
        b(TDM, 1),
        `각각 ${rate} kbps인 입력 ${n}개를 동기식 TDM으로 합친다(입력마다 프레임당 슬롯 1개). **링크의 데이터율**은 몇 kbps인가?`,
        tdmLinkRate(n, rate),
        "kbps",
        EXACT,
        [`링크 데이터율 = n × 입력 데이터율`, `= ${n} × ${rate}`, `= ${tdmLinkRate(n, rate)} kbps`],
        `동기식 TDM에서 링크의 데이터율은 입력의 n배다(같은 시간에 n개 입력의 단위를 모두 보내야 하므로).`,
      );
    }
    const n = rng.int(2, 5);
    const ms = rng.pick([1, 2, 3, 5, 6, 10]);
    assertPositive({ n, ms });
    const slot = tdmSlotDuration(ms, n);
    return calc(
      b(TDM, 1),
      `입력 ${n}개를 동기식 TDM으로 합친다. 각 입력에서는 ${ms} ms마다 데이터 단위 하나를 가져온다. 링크에서 **슬롯 하나의 길이**는 몇 ms인가?`,
      slot,
      "ms",
      DP3,
      [`프레임 = 슬롯 ${n}개, 프레임 길이 = ${ms} ms`, `슬롯 = T / n = ${ms} / ${n}`, `= ${fmt(slot, 4)} ms`],
      `한 프레임(입력 하나의 단위 시간 T) 안에 n개 슬롯이 들어가므로 슬롯 길이는 T/n — 단위 시간이 n배 짧아진다(슬라이드: 입력 3개 → T/3).`,
    );
  },
};

// ------------------------------------------------------------------ ⭐ linkFill (trace, s.49~50)

type LinkFillParams = { variant: "table" };

export const linkFillGen: Generator<LinkFillParams> = {
  name: "link-fill",
  chapter: "ch02",
  topic: T.bdp,
  description: "대역폭 b bps·지연 d s 링크의 1초 구간별 비트 묶음과 링크 안 비트 수(t ≤ d)",
  generate(seed) {
    const rng = createRng(seed);
    const bps = rng.int(1, 6);
    const sec = rng.int(3, 6);
    assertPositive({ bps, sec });
    const rows = linkFill(bps, sec);
    const EMPTY = "—";
    const options = [EMPTY, ...Array.from({ length: sec }, (_, k) => bitGroup(bps, k + 1))];
    // 빈칸: 비트 묶음 칸 3개(서로 다른 행) + 마지막 행 비트 수(= 대역폭-지연 곱) + 다른 행 비트 수 1개
    const segBlanks = new Set<string>();
    for (const t of rng.sample(Array.from({ length: sec }, (_, i) => i), Math.min(3, sec))) {
      const filled = rows[t].segments.map((s, j) => (s ? j : -1)).filter((j) => j >= 0);
      segBlanks.add(`${t}:${rng.chance(0.8) ? rng.pick(filled) : rng.int(0, sec - 1)}`);
    }
    const countBlank = rng.int(0, sec - 2);
    const q: TraceQ = {
      ...baseOf("link-fill", { topic: T.bdp, slideRef: "Ch02 s.49-50", exam: true }, seed, { variant: "table" }, 3),
      type: "trace",
      prompt: `대역폭 ${bps} bps, 지연 ${sec} s인 링크를 1초 구간 ${sec}개로 나눴다(구간 1이 송신 쪽). 송신자가 0초부터 쉬지 않고 보낼 때 각 시점에 구간마다 들어 있는 비트(몇 번째 비트인지)와 링크 안 비트 수를 채우시오. 비트가 없는 구간은 "${EMPTY}".`,
      columns: [...Array.from({ length: sec }, (_, j) => (j === 0 ? "구간 1 (송신 쪽)" : j === sec - 1 ? `구간 ${sec} (수신 쪽)` : `구간 ${j + 1}`)), "링크 안 비트 수"],
      rows: rows.map((r, t) => ({
        label: `${r.t}초 뒤`,
        cells: [
          ...r.segments.map((s, j): TraceCell => {
            const value = s ?? EMPTY;
            return segBlanks.has(`${t}:${j}`) ? { value, blank: true, options } : { value };
          }),
          t === sec - 1 || t === countBlank ? { value: String(r.bitsInLink), blank: true } : { value: String(r.bitsInLink) },
        ],
      })),
      explanation: `1초마다 ${bps}비트씩 새로 들어가고 이미 들어간 비트는 한 구간씩 수신 쪽으로 이동한다. ${sec}초 뒤 링크는 대역폭 × 지연 = ${bps} × ${sec} = ${bps * sec}비트로 가득 찬다 — 이것이 대역폭-지연 곱이다(슬라이드: 1 bps·5 s → 5비트, 5 bps·5 s → 25비트). t초 뒤 1번째 비트(묶음)는 구간 t에 있고, 링크가 가득 찬 ${sec}초 뒤에 수신 쪽 끝(구간 ${sec})에 닿는다. (보충) 표는 슬라이드 그림처럼 링크가 가득 찰 때(t ≤ 지연)까지만 다룬다.`,
      summary: "링크 안 비트 = 대역폭 × 경과 시간, 지연만큼 지나면 대역폭-지연 곱으로 가득 찬다(s.49-50)",
    };
    return q;
  },
};

// ------------------------------------------------------------------ tdmFrame (trace, s.89~90)

type TdmFrameParams = { variant: "table" };

export const tdmFrameGen: Generator<TdmFrameParams> = {
  name: "tdm-frame",
  chapter: "ch02",
  topic: T.tdm,
  description: "동기식 TDM: 입력 n줄의 단위 → 프레임 k의 슬롯(그림 표기: 오른쪽이 먼저)",
  generate(seed) {
    const rng = createRng(seed);
    const n = rng.int(2, 4);
    const frames = rng.int(2, 4);
    const table = tdmFrames(n, frames);
    const options = table.flat().sort();
    const blanks = new Set(
      rng.sample(
        table.flatMap((row, i) => row.map((_, j) => `${i}:${j}`)),
        Math.min(4, n * frames - 1),
      ),
    );
    const lines = Array.from({ length: n }, (_, i) => {
      const name = lineName(i);
      return `${name}: ${Array.from({ length: frames }, (_, k) => `${name}${k + 1}`).join(", ")}`;
    });
    const q: TraceQ = {
      ...baseOf("tdm-frame", { topic: T.tdm, slideRef: "Ch02 s.89-90" }, seed, { variant: "table" }, 2),
      type: "trace",
      prompt: `입력 ${n}줄(${lines.join(" / ")})을 동기식 TDM으로 합친다. 각 줄에서 단위 시간마다 하나씩 가져와 프레임을 만든다. 각 프레임을 **오른쪽 칸이 먼저 나가는 쪽**(칸 1이 왼쪽 끝)으로 적을 때 각 프레임의 칸을 채우시오.`,
      columns: Array.from({ length: n }, (_, j) => (j === 0 ? "칸 1 (왼쪽)" : j === n - 1 ? `칸 ${n} (오른쪽, 먼저 전송)` : `칸 ${j + 1}`)),
      rows: table.map((row, i) => ({
        label: `프레임 ${i + 1}`,
        cells: row.map((value, j): TraceCell => (blanks.has(`${i}:${j}`) ? { value, blank: true, options } : { value })),
      })),
      explanation: `프레임 k에는 각 줄의 k번째 단위가 하나씩 들어간다(프레임 = 슬롯 ${n}개). 그림 표기는 오른쪽이 먼저 나가므로 프레임 1은 왼쪽부터 ${table[0].join(" | ")}이다(슬라이드: C1 | B1 | A1). 한 줄의 단위를 한 프레임에 몰아 넣으면(A1, A2 …) 틀린다.`,
    };
    return q;
  },
};

export const DC_GENERATORS = {
  signal: signalGen,
  digital: digitalGen,
  decibel: decibelGen,
  capacity: capacityGen,
  performance: performanceGen,
  pcm: pcmGen,
  modulation: modulationGen,
  multiplexing: multiplexingGen,
  "link-fill": linkFillGen,
  "tdm-frame": tdmFrameGen,
} satisfies GeneratorMap;

/** 생성기 이름별 변형 목록(테스트·미리 보기용) */
export const DC_VARIANTS: Record<keyof typeof DC_GENERATORS, readonly string[]> = {
  signal: SIGNAL_VARIANTS,
  digital: DIGITAL_VARIANTS,
  decibel: DECIBEL_VARIANTS,
  capacity: CAPACITY_VARIANTS,
  performance: PERFORMANCE_VARIANTS,
  pcm: PCM_VARIANTS,
  modulation: MODULATION_VARIANTS,
  multiplexing: MULTIPLEXING_VARIANTS,
  "link-fill": ["table"],
  "tdm-frame": ["table"],
};

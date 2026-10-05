import { describe, expect, it } from "vitest";
import { bothLimits, nextPow2, nyquistBitRate, nyquistLevels, prevPow2, shannonCapacity } from "./capacity";
import { decibel, snr, snrDb } from "./decibel";
import { baudRate, bitLength, bitsPerSignalElement, textBitRate } from "./digital";
import { bitGroup, linkFill } from "./linkFill";
import { amBandwidth, askPskBandwidth, FM_COMMON_BETA, fmBandwidth, fskBandwidth, pmBandwidth } from "./modulation";
import { fdmBandwidth, tdmLinkRate, tdmSlotDuration } from "./multiplexing";
import { pcmBitRate, samplingRate } from "./pcm";
import { bandwidthDelayProduct, latency, propagationTime, throughput, transmissionTime } from "./performance";
import { bandwidth, frequency, LIGHT_SPEED, peakFromRms, period, phaseFromCycles, wavelength } from "./signal";
import { tdmFrame, tdmFrames } from "./tdmFrame";

/**
 * 슬라이드 기준값 — source/data-communication/DC-2-PhyLayer.pdf (한 쪽에 슬라이드 2장, PDF 쪽 = ⌈슬라이드 ÷ 2⌉).
 * 슬라이드에 나온 예제(Example) 값을 빠짐없이 고정한다. 테스트 이름 = "s.{슬라이드} (p.{PDF 쪽})".
 * ⭐ 주제(Nyquist s.33~35, Shannon·두 한계 s.36~40, 대역폭-지연 곱 s.48~51)의 예제는 전부 들어 있다.
 */

describe("signal — 주파수·주기·위상·파장·대역폭·실효값", () => {
  it("s.8 (p.4): 가정용 전원 실효 220 V → 피크 2½ × 220 = 311.1 V (슬라이드 310 V는 근사, ±1.5 V)", () => {
    expect(peakFromRms(220)).toBeCloseTo(311.127, 3);
    expect(Math.abs(peakFromRms(220) - 310)).toBeLessThanOrEqual(1.5);
  });
  it("s.8 (p.4): f = 1/T, T = 1/f (서로 역수)", () => {
    expect(frequency(0.001)).toBeCloseTo(1000, 9);
    expect(period(1000)).toBeCloseTo(0.001, 12);
    expect(frequency(period(60))).toBeCloseTo(60, 9);
  });
  it("s.10 (p.5) Example 2.1: 일정한 전압(배터리) = 주파수 0 → 주기 ∞", () => {
    expect(period(0)).toBe(Infinity);
  });
  it("s.11 (p.6): 1/6 주기 → 60° = π/3 rad (슬라이드 1.046 rad, 정확값 1.0472 — ±0.002)", () => {
    const p = phaseFromCycles(1 / 6);
    expect(p.deg).toBeCloseTo(60, 9);
    expect(p.rad).toBeCloseTo(Math.PI / 3, 12);
    expect(Math.abs(p.rad - 1.046)).toBeLessThanOrEqual(0.002);
  });
  it("s.13 (p.7): 빨간빛 f = 4×10¹⁴ Hz → λ = 3×10⁸ / 4×10¹⁴ = 0.75×10⁻⁶ m", () => {
    expect(LIGHT_SPEED).toBe(3e8);
    expect(wavelength(4e14)).toBeCloseTo(0.75e-6, 18);
  });
  it("s.101 (p.51): 적외선 3×10¹¹ Hz → λ = 10⁻³ m (s.13 공식)", () => {
    expect(wavelength(3e11)).toBeCloseTo(1e-3, 15);
  });
  it("s.17 (p.9): 1000~5000 Hz → 대역폭 4000 Hz", () => {
    expect(bandwidth(5000, 1000)).toBe(4000);
  });
});

describe("digital — 레벨·r·비트율·비트 길이·보오율", () => {
  it("s.19 (p.10): 2레벨 r=1(1초에 8비트 = 8 bps), 4레벨 r=2(1초에 16비트 = 16 bps) — 신호 요소는 둘 다 초당 8개", () => {
    expect(bitsPerSignalElement(2)).toBe(1);
    expect(bitsPerSignalElement(4)).toBe(2);
    expect(baudRate(8, 1)).toBe(8);
    expect(baudRate(16, 2)).toBe(8);
  });
  it("s.20 (p.10) Example 2.3: 100쪽/초 × 24줄 × 80자 × 8비트 = 1,536,000 bps = 1.536 Mbps", () => {
    expect(textBitRate(100, 24, 80, 8)).toBe(1_536_000);
    expect(textBitRate(100, 24, 80, 8) / 1e6).toBe(1.536);
  });
  it("s.21 (p.11) Example 2.4: 비트 길이 = 1 / 1,536,000 = 0.651 마이크로초", () => {
    expect(bitLength(1_536_000) * 1e6).toBeCloseTo(0.651, 3);
  });
  it("s.68 (p.34): S = N × 1/r", () => {
    expect(baudRate(1_536_000, 2)).toBe(768_000);
  });
});

describe("decibel — 감쇠·증폭·SNR", () => {
  it("s.26 (p.13) Example 2.5: P₂ = 0.5P₁ → 10 log₁₀ 0.5 = −3 dB (정확값 −3.01, ±0.05)", () => {
    expect(decibel(0.5, 1)).toBeCloseTo(-3.0103, 4);
    expect(Math.abs(decibel(0.5, 1) - -3)).toBeLessThanOrEqual(0.05);
  });
  it("s.27 (p.14): 10배 증폭 → 10 dB, 100배 → 20 dB", () => {
    expect(decibel(10, 1)).toBeCloseTo(10, 12);
    expect(decibel(100, 1)).toBeCloseTo(20, 12);
  });
  it("s.30 (p.15): 신호 10 mW, 잡음 1 μW → SNR = 10,000 μW / 1 μW = 10,000, SNR_dB = 40", () => {
    const ratio = snr(10e-3, 1e-6);
    expect(ratio).toBeCloseTo(10_000, 6);
    expect(snrDb(ratio)).toBeCloseTo(40, 9);
  });
  it("s.31 (p.16): 잡음 없는 채널 → SNR = ∞, SNR_dB = ∞", () => {
    expect(snr(1, 0)).toBe(Infinity);
    expect(snrDb(Infinity)).toBe(Infinity);
  });
});

describe("⭐ capacity — Nyquist (s.33~35)", () => {
  it("s.34 (p.17): BitRate = 2 × B × log₂ L — 2레벨이면 2B", () => {
    expect(nyquistBitRate(3000, 2)).toBe(6000);
  });
  it("s.35 (p.18) Example 2.6: 265 kbps, 20 kHz → log₂ L = 6.625, L = 2^6.625 ≈ 98.7", () => {
    const r = nyquistLevels(265_000, 20_000);
    expect(r.log2L).toBe(6.625);
    expect(r.levels).toBeCloseTo(98.7, 1);
  });
  it("s.35 (p.18) Example 2.6: 2의 거듭제곱으로 — 128레벨이면 280 kbps, 64레벨이면 240 kbps", () => {
    expect(nextPow2(98.7)).toBe(128);
    expect(prevPow2(98.7)).toBe(64);
    expect(nyquistBitRate(20_000, 128)).toBe(280_000);
    expect(nyquistBitRate(20_000, 64)).toBe(240_000);
  });
});

describe("⭐ capacity — Shannon·두 한계 (s.36~40)", () => {
  it("s.37 (p.19) Example 2.7: SNR ≈ 0 → C = B log₂ 1 = 0 (대역폭과 무관)", () => {
    expect(shannonCapacity(3000, 0)).toBe(0);
    expect(shannonCapacity(1e6, 0)).toBe(0);
  });
  it("s.38 (p.19) Example 2.8: 전화선 3000 Hz, SNR 3162 → C = 3000 log₂ 3163 = 34,881 bps = 34.881 kbps", () => {
    expect(Math.round(shannonCapacity(3000, 3162))).toBe(34_881);
  });
  it("s.40 (p.20) Example 2.9: 1 MHz, SNR 63 → C = 10⁶ log₂ 64 = 6 Mbps", () => {
    expect(shannonCapacity(1e6, 63)).toBe(6e6);
  });
  it("s.40 (p.20) Example 2.9: 더 낮은 4 Mbps를 고르면 4 Mbps = 2 × 1 MHz × log₂ L → log₂ L = 2, L = 4", () => {
    const r = bothLimits(1e6, 63, 4e6);
    expect(r.capacity).toBe(6e6);
    expect(r.log2L).toBe(2);
    expect(r.levels).toBe(4);
    expect(r.withinLimit).toBe(true);
  });
});

describe("performance — 처리량·지연", () => {
  it("s.45 (p.23): 10 Mbps 망에서 분당 12,000 프레임 × 10,000 비트 / 60 = 2 Mbps (대역폭의 약 1/5)", () => {
    expect(throughput(12_000, 10_000, 60)).toBe(2e6);
    expect(throughput(12_000, 10_000, 60) / 10e6).toBe(0.2);
  });
  it("s.47 (p.24): 12,000 km, 2.4×10⁸ m/s → 전파 시간 = 12,000 × 1000 / 2.4×10⁸ = 50 ms", () => {
    expect(propagationTime(12_000 * 1000, 2.4e8) * 1000).toBeCloseTo(50, 9);
  });
  it("s.47 (p.24): 2.5 kbyte(= 2500 바이트), 1 Gbps → 전송 시간 = 2500 × 8 / 10⁹ = 0.020 ms", () => {
    expect(transmissionTime(2500 * 8, 1e9) * 1000).toBeCloseTo(0.02, 12);
  });
  it("s.46 (p.23): 지연 = 전파 + 전송 + 큐잉 + 처리", () => {
    expect(latency({ propagation: 0.05, transmission: 0.00002, queuing: 0.001, processing: 0.0005 })).toBeCloseTo(0.05152, 12);
  });
});

describe("⭐ performance — 대역폭-지연 곱 (s.48~51)", () => {
  it("s.49 (p.25) Case 1: 대역폭 1 bps × 지연 5 s = 5 비트", () => {
    expect(bandwidthDelayProduct(1, 5)).toBe(5);
  });
  it("s.50 (p.25) Case 2: 대역폭 5 bps × 지연 5 s = 25 비트", () => {
    expect(bandwidthDelayProduct(5, 5)).toBe(25);
  });
});

describe("⭐ linkFill — 링크 채우기 표 (s.49~50)", () => {
  it("s.49 (p.25) Case 1 그림: After 1 s ~ After 5 s, 구간(송신 쪽 → 수신 쪽)마다 1st bit … 5th bit", () => {
    const rows = linkFill(1, 5);
    expect(rows.map((r) => r.segments)).toEqual([
      ["1", null, null, null, null],
      ["2", "1", null, null, null],
      ["3", "2", "1", null, null],
      ["4", "3", "2", "1", null],
      ["5", "4", "3", "2", "1"],
    ]);
    expect(rows.map((r) => r.bitsInLink)).toEqual([1, 2, 3, 4, 5]);
  });
  it("s.50 (p.25) Case 2 그림: First 5 bits가 1초마다 한 구간씩 이동, 5초 뒤 25비트로 가득 참", () => {
    const rows = linkFill(5, 5);
    expect(rows[0].segments).toEqual(["1~5", null, null, null, null]);
    expect(rows[4].segments).toEqual(["21~25", "16~20", "11~15", "6~10", "1~5"]);
    expect(rows[4].bitsInLink).toBe(25);
    expect(bitGroup(5, 1)).toBe("1~5");
  });
});

describe("pcm — 표본화율·비트율", () => {
  it("s.61 (p.31) Example 2.13: 사람 목소리 0~4000 Hz → 표본화율 8000 표본/s, 8비트 → 64,000 bps = 64 kbps", () => {
    expect(samplingRate(4000)).toBe(8000);
    expect(pcmBitRate(8000, 8)).toBe(64_000);
  });
});

describe("modulation — 대역폭 공식 (슬라이드에 대역폭 수치 예제 없음: 공식 자체와 경계값으로 고정)", () => {
  it("s.69 (p.35) BASK 그림: 비트율 5 → 보오율 5 (r = 1, S = N)", () => {
    expect(baudRate(5, 1)).toBe(5);
  });
  it("s.69 (p.35)·s.73 (p.37): B = (1 + d)S, d = 0이면 S, d = 1이면 2S — 손으로 검산한 정수 예 S = 1000", () => {
    expect(askPskBandwidth(1000, 0)).toBe(1000);
    expect(askPskBandwidth(1000, 1)).toBe(2000);
    expect(askPskBandwidth(1000, 0.5)).toBe(1500);
    expect(() => askPskBandwidth(1000, 1.5)).toThrow();
  });
  it("s.71 (p.36) BFSK: B = (1 + d)S + 2Δf — S = 1000, d = 0, Δf = 500 → 2000", () => {
    expect(fskBandwidth(1000, 0, 500)).toBe(2000);
    expect(fskBandwidth(1000, 1, 500)).toBe(3000);
  });
  it("s.78 (p.39) AM: B_AM = 2B", () => {
    expect(amBandwidth(5000)).toBe(10_000);
  });
  it("s.79 (p.40) FM: β의 흔한 값 4 → B_FM = 2(1 + 4)B = 10B", () => {
    expect(FM_COMMON_BETA).toBe(4);
    expect(fmBandwidth(15_000)).toBe(150_000);
  });
  it("s.80 (p.40) PM: B_PM = 2(1 + β)B (β는 문제에서 준다)", () => {
    expect(pmBandwidth(10_000, 2)).toBe(60_000);
  });
});

describe("multiplexing — FDM 보호 대역·동기식 TDM", () => {
  it("s.87 (p.44): 5채널 × 100 kHz + 보호 대역 4개 × 10 kHz = 540 kHz", () => {
    expect(fdmBandwidth(5, 100, 10)).toBe(540);
  });
  it("s.90 (p.45): 입력 3개, 각 단위 T → 프레임 = 슬롯 3개, 슬롯 = T/3, 링크 데이터율 3배", () => {
    expect(tdmSlotDuration(1, 3)).toBeCloseTo(1 / 3, 12);
    expect(tdmLinkRate(3, 1)).toBe(3);
  });
});

describe("tdmFrame — 동기식 TDM 프레임 (s.89~90)", () => {
  it("s.90 (p.45) 그림: 프레임 1 = C1 | B1 | A1, 프레임 2 = C2 | B2 | A2, 프레임 3 = C3 | B3 | A3 (그림의 왼쪽→오른쪽 표기)", () => {
    expect(tdmFrames(3, 3)).toEqual([
      ["C1", "B1", "A1"],
      ["C2", "B2", "A2"],
      ["C3", "B3", "A3"],
    ]);
  });
  it("s.89 (p.45) 그림: 입력 4개 → 프레임마다 슬롯 4개", () => {
    expect(tdmFrame(4, 1)).toEqual(["D1", "C1", "B1", "A1"]);
  });
});

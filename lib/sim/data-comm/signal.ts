/**
 * 아날로그 신호 기본량 — DC-2-PhyLayer.pdf
 * - s.8 (p.4): f = 1/T, T = 1/f, peak = 2½ × 실효값(√2 × 실효)
 * - s.10 (p.5) Example 2.1: 전압이 일정한 배터리 = 주파수 0, 주기 ∞
 * - s.11 (p.6): 360° = 2π rad, 주기 비율 → 위상
 * - s.13 (p.7), s.101 (p.51): λ = c / f = c × T, c = 3 × 10⁸ m/s
 * - s.17 (p.9): 대역폭 = 최고 주파수 − 최저 주파수
 */

/** 빛의 속도(슬라이드 s.13 값) */
export const LIGHT_SPEED = 3e8;

export const frequency = (periodSec: number) => 1 / periodSec;
export const period = (freqHz: number) => 1 / freqHz;

/** 주기의 몇 분의 몇만큼 밀렸는가 → 도·라디안 */
export function phaseFromCycles(fraction: number): { deg: number; rad: number } {
  const deg = fraction * 360;
  return { deg, rad: (deg * 2 * Math.PI) / 360 };
}

export const wavelength = (freqHz: number, speed = LIGHT_SPEED) => speed / freqHz;
export const bandwidth = (highHz: number, lowHz: number) => highHz - lowHz;
export const peakFromRms = (rms: number) => Math.SQRT2 * rms;

/**
 * 데이터 전송률 한계 — DC-2-PhyLayer.pdf
 * - s.34 (p.17): Nyquist BitRate = 2 × B × log₂ L (잡음 없는 채널)
 * - s.35 (p.18) Example 2.6: 레벨 수 역산, 2의 거듭제곱이 아니면 레벨을 늘리거나 비트율을 줄인다
 * - s.36 (p.18): Shannon C = B × log₂(1 + SNR)
 * - s.37~38 (p.19) Example 2.7·2.8
 * - s.39~40 (p.20) Example 2.9: Shannon으로 상한 → 그보다 낮은 비트율 선택 → Nyquist로 레벨 수
 */

export const nyquistBitRate = (bandwidthHz: number, levels: number) => 2 * bandwidthHz * Math.log2(levels);

/** 비트율·대역폭 → log₂ L, L */
export function nyquistLevels(bitRate: number, bandwidthHz: number): { log2L: number; levels: number } {
  const log2L = bitRate / (2 * bandwidthHz);
  return { log2L, levels: 2 ** log2L };
}

/** x 이상인 가장 작은 2의 거듭제곱 / x 이하인 가장 큰 2의 거듭제곱 */
export const nextPow2 = (x: number) => 2 ** Math.ceil(Math.log2(x));
export const prevPow2 = (x: number) => 2 ** Math.floor(Math.log2(x));

export const shannonCapacity = (bandwidthHz: number, snr: number) => bandwidthHz * Math.log2(1 + snr);

/** 두 한계 함께: 상한 C, 고른 비트율에 필요한 log₂ L·L */
export function bothLimits(bandwidthHz: number, snr: number, chosenBitRate: number) {
  const capacity = shannonCapacity(bandwidthHz, snr);
  return { capacity, ...nyquistLevels(chosenBitRate, bandwidthHz), withinLimit: chosenBitRate <= capacity };
}

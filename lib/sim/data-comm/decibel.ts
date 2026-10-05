/**
 * 데시벨·SNR — DC-2-PhyLayer.pdf
 * - s.26 (p.13) Example 2.5, s.27 (p.14): 감쇠·증폭 dB = 10 log₁₀(P₂ / P₁)
 * - s.30 (p.15): SNR = 평균 신호 전력 / 평균 잡음 전력, SNR_dB = 10 log₁₀ SNR
 * - s.31 (p.16): 잡음이 0이면 SNR = ∞, SNR_dB = ∞
 */

export const decibel = (p2: number, p1: number) => 10 * Math.log10(p2 / p1);

export const snr = (signalPower: number, noisePower: number) => signalPower / noisePower;

export const snrDb = (ratio: number) => 10 * Math.log10(ratio);

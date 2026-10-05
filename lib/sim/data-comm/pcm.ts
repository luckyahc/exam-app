/**
 * PCM — DC-2-PhyLayer.pdf s.61 (p.31) Example 2.13
 * - Nyquist 표본화율 ≥ 2 × 최고 주파수 (계산 문제는 최소값 = 2 × 최고 주파수)
 * - 비트율 = 표본화율 × 표본당 비트
 */

export const samplingRate = (highestHz: number) => 2 * highestHz;

export const pcmBitRate = (samplesPerSec: number, bitsPerSample: number) => samplesPerSec * bitsPerSample;

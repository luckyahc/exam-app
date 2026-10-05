/**
 * 디지털 신호 — DC-2-PhyLayer.pdf
 * - s.19 (p.10): r = 신호 요소 하나가 나르는 비트 수 (2레벨 r=1, 4레벨 r=2) → r = log₂ L
 * - s.20 (p.10) Example 2.3: 비트율 = 쪽/초 × 줄 × 글자 × 비트
 * - s.21 (p.11) Example 2.4: bit length = 1 / bit rate (예제 답은 시간 단위 — docs/dc-source-analysis.md 확인 필요 4)
 * - s.68 (p.34): S [baud] = N [bps] × 1/r
 */

export const textBitRate = (pagesPerSec: number, lines: number, chars: number, bitsPerChar: number) =>
  pagesPerSec * lines * chars * bitsPerChar;

/** 초 단위 */
export const bitLength = (bitRate: number) => 1 / bitRate;

export const bitsPerSignalElement = (levels: number) => Math.log2(levels);

export const baudRate = (bitRate: number, r: number) => bitRate / r;

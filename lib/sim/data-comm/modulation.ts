/**
 * 변조 대역폭 — DC-2-PhyLayer.pdf
 * - s.69 (p.35) BASK, s.73 (p.37) BPSK: r = 1, S = N, B = (1 + d)S, 0 ≤ d ≤ 1
 * - s.71 (p.36) BFSK: r = 1, S = N, B = (1 + d)S + 2Δf
 * - s.78 (p.39) AM: B_AM = 2B
 * - s.79 (p.40) FM: B_FM = 2(1 + β)B, β의 흔한 값 4
 * - s.80 (p.40) PM: B_PM = 2(1 + β)B (β 값은 PM 슬라이드에 없음 → 문제에서 준다)
 */

export const FM_COMMON_BETA = 4;

function checkD(d: number) {
  if (!(d >= 0 && d <= 1)) throw new RangeError(`d는 0~1 (받은 값 ${d})`);
}

/** BASK·BPSK 대역폭 (S = 보오율) */
export function askPskBandwidth(baud: number, d: number) {
  checkD(d);
  return (1 + d) * baud;
}

export function fskBandwidth(baud: number, d: number, deltaF: number) {
  checkD(d);
  return (1 + d) * baud + 2 * deltaF;
}

export const amBandwidth = (audioBandwidth: number) => 2 * audioBandwidth;
export const fmBandwidth = (audioBandwidth: number, beta = FM_COMMON_BETA) => 2 * (1 + beta) * audioBandwidth;
export const pmBandwidth = (audioBandwidth: number, beta: number) => 2 * (1 + beta) * audioBandwidth;

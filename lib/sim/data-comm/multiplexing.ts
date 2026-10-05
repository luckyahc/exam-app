/**
 * 다중화 — DC-2-PhyLayer.pdf
 * - s.87 (p.44): FDM 필요 대역폭 = n × 채널 대역폭 + (n − 1) × 보호 대역
 * - s.90 (p.45): 동기식 TDM — 링크 데이터율은 n배, 단위 시간은 n배 짧다(프레임 = n슬롯, 슬롯 = T/n)
 */

export const fdmBandwidth = (channels: number, channelBw: number, guardBand: number) =>
  channels * channelBw + (channels - 1) * guardBand;

export const tdmLinkRate = (inputs: number, inputRate: number) => inputs * inputRate;

export const tdmSlotDuration = (unitDuration: number, inputs: number) => unitDuration / inputs;

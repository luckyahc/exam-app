/**
 * 네트워크 성능 — DC-2-PhyLayer.pdf
 * - s.45 (p.23): 처리량 = 프레임 수 × 프레임당 비트 / 시간(초)
 * - s.46 (p.23): 지연 = 전파 + 전송 + 큐잉 + 처리, 전파 시간 = 거리 / 전파 속도, 전송 시간 = 메시지 크기 / 대역폭
 * - s.47 (p.24): 2.5 kbyte = 2500 바이트, 1 Gbps = 10⁹ bps (10진 접두어)
 * - s.48~51 (p.24~26): 대역폭-지연 곱 = 대역폭 × 지연 = 링크를 채우는 비트 수
 */

export const throughput = (frames: number, bitsPerFrame: number, seconds: number) => (frames * bitsPerFrame) / seconds;

/** 초 */
export const propagationTime = (distanceM: number, speedMps: number) => distanceM / speedMps;
/** 초 */
export const transmissionTime = (messageBits: number, bandwidthBps: number) => messageBits / bandwidthBps;

export const latency = (parts: { propagation: number; transmission: number; queuing: number; processing: number }) =>
  parts.propagation + parts.transmission + parts.queuing + parts.processing;

export const bandwidthDelayProduct = (bandwidthBps: number, delaySec: number) => bandwidthBps * delaySec;

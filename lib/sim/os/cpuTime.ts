/**
 * 다중프로그램 일괄처리 vs 시분할: 첫 응답시간과 유효 CPU 이용률 (Ch02 p.21-24, 원본 §6-5).
 * 조건: 프로그램 N개, 각 실행시간 T초(I/O 없이 계산만), 내 프로그램은 마지막, 첫 출력은 실행 시작 후 output초,
 * 스위칭 시간 s, 시분할의 타임슬라이스 q.
 */

export interface CpuParams {
  /** 프로그램 수 */
  n: number;
  /** 프로그램 하나의 실행시간(초) */
  t: number;
  /** 스위칭 시간(초) */
  s: number;
  /** 타임슬라이스(초) — 시분할 */
  q: number;
  /** 실행 시작 후 첫 출력까지(초). 슬라이드 0.1 */
  output: number;
}

/** 다중프로그램 일괄처리 첫 응답 = (N−1)×(T+s) + s + output */
export function batchFirstResponse({ n, t, s, output }: Omit<CpuParams, "q">): number {
  return (n - 1) * (t + s) + s + output;
}

/** 시분할 첫 응답 = (N−1)×(q+s) + s + output */
export function timeSharingFirstResponse({ n, q, s, output }: Omit<CpuParams, "t">): number {
  return (n - 1) * (q + s) + s + output;
}

/** 유효 CPU 이용률 = 유효 실행시간 / 총 경과시간 */
export function utilization(useful: number, overhead: number): number {
  return useful / (useful + overhead);
}

/** 일괄처리: 프로그램마다 스위칭 1번 → N×T / (N×T + N×s) */
export function batchUtilization({ n, t, s }: Pick<CpuParams, "n" | "t" | "s">): number {
  return utilization(n * t, n * s);
}

/** 시분할: 스위칭 횟수 = 전체 실행시간 / q → N×T / (N×T + (N×T/q)×s) */
export function timeSharingUtilization({
  n,
  t,
  s,
  q,
}: Pick<CpuParams, "n" | "t" | "s" | "q">): number {
  const switches = (n * t) / q;
  return utilization(n * t, switches * s);
}

export function switchCount(
  { n, t, q }: Pick<CpuParams, "n" | "t" | "q">,
  mode: "batch" | "timesharing",
): number {
  return mode === "batch" ? n : (n * t) / q;
}

/**
 * 동기식 TDM 프레임 — DC-2-PhyLayer.pdf s.90 (p.45)
 * 입력 줄 n개(A, B, C …)에서 T초마다 한 단위씩 가져와 프레임 k = A_k, B_k, C_k …를 만든다.
 * 그림은 오른쪽이 먼저 나가는 쪽이라 프레임 1을 "C1 | B1 | A1"(왼쪽→오른쪽)로 적는다 — 이 표기 순서를 그대로 쓴다.
 */

export const lineName = (i: number) => String.fromCharCode(65 + i);

/** 프레임 k(1부터)의 칸을 그림 순서(왼쪽→오른쪽)로: n=3, k=1 → ["C1", "B1", "A1"] */
export function tdmFrame(inputs: number, k: number): string[] {
  return Array.from({ length: inputs }, (_, i) => `${lineName(inputs - 1 - i)}${k}`);
}

export function tdmFrames(inputs: number, frames: number): string[][] {
  return Array.from({ length: frames }, (_, i) => tdmFrame(inputs, i + 1));
}

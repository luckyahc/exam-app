/**
 * 링크 채우기 — DC-2-PhyLayer.pdf s.49~50 (p.25)
 * 대역폭 b bps, 지연 d초인 링크를 1초 구간 d개로 나누면, t초 뒤(1 ≤ t ≤ d) 구간 j(송신 쪽부터 1)에는
 * (t − j + 1)번째 1초 동안 보낸 비트 묶음이 있다(t − j + 1 ≥ 1일 때). 링크 안 비트 수 = b × t, t = d면 대역폭-지연 곱.
 * 슬라이드는 링크가 가득 찰 때(t = d)까지만 보여 주므로 t > d는 다루지 않는다.
 */

/** k번째 1초 동안 보낸 비트 묶음의 이름: b=1 → "3", b=5 → "11~15" */
export function bitGroup(b: number, k: number): string {
  return b === 1 ? String(k) : `${(k - 1) * b + 1}~${k * b}`;
}

export interface LinkFillRow {
  t: number;
  /** 구간 1..d(송신 쪽 → 수신 쪽), 비어 있으면 null */
  segments: (string | null)[];
  bitsInLink: number;
}

export function linkFill(b: number, d: number): LinkFillRow[] {
  if (!(Number.isInteger(b) && b >= 1 && Number.isInteger(d) && d >= 1)) throw new RangeError("b·d는 1 이상의 정수");
  return Array.from({ length: d }, (_, i) => {
    const t = i + 1;
    return {
      t,
      segments: Array.from({ length: d }, (_, j) => (t - j >= 1 ? bitGroup(b, t - j) : null)),
      bitsInLink: b * t,
    };
  });
}

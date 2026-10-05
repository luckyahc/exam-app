/** 데이터 통신 문제 문장용 숫자 표기 */

const SUP: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/** 천 단위 쉼표, 소수는 최대 d자리 */
export const fmt = (n: number, d = 6) => n.toLocaleString("en-US", { maximumFractionDigits: d });

/** 지수 표기: 2.4e8 → "2.4×10⁸", 1e-3 → "10⁻³" */
export function sci(n: number): string {
  if (n === 0) return "0";
  let e = Math.floor(Math.log10(Math.abs(n)));
  let m = +(n / 10 ** e).toPrecision(6);
  if (Math.abs(m) >= 10) {
    m = +(m / 10).toPrecision(6);
    e += 1;
  }
  const exp = [...String(e)].map((c) => SUP[c]).join("");
  return m === 1 ? `10${exp}` : `${m}×10${exp}`;
}

/** 소수 d자리 반올림 */
export const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/**
 * 입력값 점검: 생성기가 비현실적인 값(0·음수·무한대·NaN — 음수 대역폭, SNR ≤ 0 등)을 만들면 바로 예외.
 * seed를 많이 돌리는 테스트가 이 예외로 범위 오류를 잡는다.
 */
export function assertPositive(values: Record<string, number>): void {
  for (const [k, v] of Object.entries(values))
    if (!(Number.isFinite(v) && v > 0)) throw new RangeError(`비현실적인 입력: ${k} = ${v}`);
}

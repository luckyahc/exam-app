/**
 * Ch03 데이터 링크 계층 계산(2026-11-03, 기말 범위) — 근거: source/data-communication/DC-3-DataLinkLayer.pdf
 * (슬라이드 100장, PDF 쪽 = ⌈슬라이드 ÷ 2⌉). 비트열은 '0'/'1' 문자열로 다룬다. 슬라이드 기준값은 dataLink.test.ts.
 */

const assertBits = (...ws: string[]) => {
  for (const w of ws) if (!/^[01]+$/.test(w)) throw new Error(`비트열이 아님: ${w}`);
};

/** 비트 단위 XOR(같은 길이) — s.20, s.24 */
export function xorBits(a: string, b: string): string {
  assertBits(a, b);
  if (a.length !== b.length) throw new Error("길이가 다른 두 단어");
  return [...a].map((c, i) => (c === b[i] ? "0" : "1")).join("");
}

/** 1의 개수(무게) */
export const weight = (w: string) => [...w].filter((c) => c === "1").length;

/** 해밍 거리 d(a, b) = XOR 결과의 1의 개수 — s.20 */
export const hammingDistance = (a: string, b: string) => weight(xorBits(a, b));

/** 최소 해밍 거리 = 모든 쌍 중 가장 작은 해밍 거리 — s.21 */
export function minHammingDistance(codewords: readonly string[]): number {
  let m = Infinity;
  for (let i = 0; i < codewords.length; i++) for (let j = i + 1; j < codewords.length; j++) m = Math.min(m, hammingDistance(codewords[i], codewords[j]));
  return m;
}

/** 선형 블록 부호의 dmin = 0이 아닌 부호어 중 가장 작은 1의 개수 — s.26 */
export const linearMinDistance = (codewords: readonly string[]) => Math.min(...codewords.map(weight).filter((x) => x > 0));

/** 유효 부호어 둘의 XOR가 언제나 유효 부호어인가(선형 블록 부호) — s.24 */
export function isLinear(codewords: readonly string[]): boolean {
  const set = new Set(codewords);
  return codewords.every((a) => codewords.every((b) => set.has(xorBits(a, b))));
}

/** dmin = s + 1 → 반드시 검출할 수 있는 오류 수 s — s.22~23 */
export const detectableErrors = (dmin: number) => dmin - 1;
/** 오류 t개를 고치려면 dmin = 2t + 1 — s.42 */
export const dminToCorrect = (t: number) => 2 * t + 1;

/** 단순 패리티 검사 부호(짝수 패리티): 데이터워드 + 패리티 비트 1개 — s.27~29 */
export function parityCodeword(dataword: string): string {
  assertBits(dataword);
  return dataword + String(weight(dataword) % 2);
}
/** 수신 부호어의 신드롬(모든 비트 XOR): 0이면 데이터워드를 만든다 — s.29~31 */
export function paritySyndrome(codeword: string): 0 | 1 {
  assertBits(codeword);
  return (weight(codeword) % 2) as 0 | 1;
}

/** 순환 왼쪽 이동(b1 = a0 … b0 = a6, 맨 왼쪽 비트가 맨 오른쪽으로) — s.32 */
export function cyclicLeftShift(w: string): string {
  assertBits(w);
  return w.slice(1) + w[0];
}

/** 제수(generator)가 될 조건: 2비트 이상, 맨 왼쪽·맨 오른쪽 비트가 모두 1 — s.38 */
export const isValidGenerator = (p: string) => /^[01]+$/.test(p) && p.length >= 2 && p[0] === "1" && p[p.length - 1] === "1";

/** 모듈로-2 나눗셈의 나머지(길이 = 제수 길이 − 1) — s.35~36 */
export function mod2Remainder(dividend: string, divisor: string): string {
  assertBits(dividend, divisor);
  const r = divisor.length - 1;
  const bits = [...dividend];
  for (let i = 0; i + r < bits.length; i++) {
    if (bits[i] === "0") continue; // 맨 왼쪽 비트가 0이면 0000 제수를 쓴다(s.35)
    for (let j = 0; j < divisor.length; j++) bits[i + j] = bits[i + j] === divisor[j] ? "0" : "1";
  }
  return bits.slice(bits.length - r).join("");
}
/** CRC 부호기: 데이터워드 뒤에 0을 (제수 길이 − 1)개 붙여 나눈 나머지를 붙인다 — s.34~35 */
export function crcEncode(dataword: string, divisor: string): { remainder: string; codeword: string } {
  const remainder = mod2Remainder(dataword + "0".repeat(divisor.length - 1), divisor);
  return { remainder, codeword: dataword + remainder };
}
/** CRC 복호기의 신드롬: 수신 부호어를 제수로 나눈 나머지(모두 0이면 수용) — s.36 */
export const crcSyndrome = (codeword: string, divisor: string) => mod2Remainder(codeword, divisor);

/** 비트열 → 다항식(왼쪽 비트가 최고차) — s.37 */
export function polynomialOf(w: string): string {
  assertBits(w);
  const n = w.length - 1;
  const terms = [...w].flatMap((c, i) => (c === "1" ? [n - i] : [])).map((p) => (p === 0 ? "1" : p === 1 ? "x" : `x^${p}`));
  return terms.join(" + ") || "0";
}
/** 표준 다항식의 비트 수 = 차수 + 1 — s.39 */
export const generatorBits = (degree: number) => degree + 1;

/**
 * 4비트 검사합(s.41): 합을 4비트로 감싸기(넘친 왼쪽 비트를 다시 더함) → 1의 보수.
 * 송신: 데이터만 더해 검사합을 만든다. 수신: 데이터 + 검사합을 더해 결과가 0이면 수용.
 */
export function checksum4(words: readonly number[]): { total: number; wrapped: number; checksum: number } {
  const total = words.reduce((a, b) => a + b, 0);
  let wrapped = total;
  while (wrapped > 0xf) wrapped = (wrapped & 0xf) + (wrapped >> 4);
  return { total, wrapped, checksum: 0xf - wrapped };
}

/** 비트 채우기: 0 다음 1이 다섯 개 연속하면 0을 하나 끼운다(플래그 01111110과 헷갈리지 않게) — s.12 */
export function bitStuff(data: string): string {
  assertBits(data);
  let out = "";
  let ones = 0;
  for (const c of data) {
    out += c;
    ones = c === "1" ? ones + 1 : 0;
    if (ones === 5) {
      out += "0";
      ones = 0;
    }
  }
  return out;
}
/** 비트 빼기(수신 측): 1 다섯 개 뒤의 0을 지운다 */
export function bitUnstuff(stuffed: string): string {
  assertBits(stuffed);
  let out = "";
  let ones = 0;
  for (let i = 0; i < stuffed.length; i++) {
    const c = stuffed[i];
    out += c;
    ones = c === "1" ? ones + 1 : 0;
    if (ones === 5) {
      i++; // 끼워 넣은 0을 건너뛴다
      ones = 0;
    }
  }
  return out;
}

/** 해밍 거리가 가장 가까운 유효 부호어(오류 1비트 가정, FEC 예 s.43~44) — 같은 거리 후보가 둘 이상이면 null */
export function nearestCodeword(received: string, codewords: readonly string[]): string | null {
  const ds = codewords.map((c) => hammingDistance(received, c));
  const best = Math.min(...ds);
  return ds.filter((d) => d === best).length === 1 ? codewords[ds.indexOf(best)] : null;
}

// ───────────── 임의 접근(ALOHA·CSMA)

/** 프레임 전송 시간 Tfr = 프레임 비트 / 대역폭 */
export const frameTime = (frameBits: number, bandwidthBps: number) => frameBits / bandwidthBps;
/** 부하 G = Tfr 동안 시스템이 만드는 평균 프레임 수 — s.70 */
export const load = (framesPerSec: number, tfrSec: number) => framesPerSec * tfrSec;
/** 순수 ALOHA 처리율 S = G·e^(−2G) — s.70 */
export const pureAlohaS = (G: number) => G * Math.exp(-2 * G);
/** 슬롯 ALOHA 처리율 S = G·e^(−G) — s.74 */
export const slottedAlohaS = (G: number) => G * Math.exp(-G);
/** 취약 시간: 순수 ALOHA 2·Tfr(s.68~69), 슬롯 ALOHA Tfr(s.74) */
export const pureVulnerable = (tfr: number) => 2 * tfr;
export const slottedVulnerable = (tfr: number) => tfr;
/** 이진 지수 백오프: K번째 시도에서 R ∈ {0 … 2^K − 1}, TB = R × Tp(또는 Tfr) — s.66~67 */
export function backoffTimes(K: number, unit: number): number[] {
  return Array.from({ length: 2 ** K }, (_, R) => R * unit);
}
/** CSMA/CD 최소 프레임 크기: Tfr = 2·Tp 동안 보내는 비트 = 대역폭 × 2·Tp — s.87 */
export const csmaCdMinFrameBits = (bandwidthBps: number, tpSec: number) => bandwidthBps * 2 * tpSec;

// ───────────── CDMA(s.97)

/** 내적 */
export const dot = (a: readonly number[], b: readonly number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

// ───────────── 링크 계층 주소(s.99)

/** 이더넷 주소 종류(슬라이드 규칙): 모두 F → 브로드캐스트, 두 번째 16진 숫자가 짝수 → 유니캐스트, 홀수 → 멀티캐스트 */
export function macAddressType(addr: string): "unicast" | "multicast" | "broadcast" {
  const hex = addr.split(":");
  if (hex.length !== 6 || !hex.every((h) => /^[0-9A-Fa-f]{2}$/.test(h))) throw new Error(`이더넷 주소 형식이 아님: ${addr}`);
  if (hex.every((h) => h.toUpperCase() === "FF")) return "broadcast";
  return parseInt(hex[0][1], 16) % 2 === 0 ? "unicast" : "multicast";
}

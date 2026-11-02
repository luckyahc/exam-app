import { describe, expect, it } from "vitest";
import {
  backoffTimes,
  bitStuff,
  bitUnstuff,
  checksum4,
  crcEncode,
  crcSyndrome,
  csmaCdMinFrameBits,
  cyclicLeftShift,
  detectableErrors,
  dminToCorrect,
  dot,
  frameTime,
  generatorBits,
  hammingDistance,
  isLinear,
  isValidGenerator,
  linearMinDistance,
  load,
  macAddressType,
  minHammingDistance,
  nearestCodeword,
  parityCodeword,
  paritySyndrome,
  polynomialOf,
  pureAlohaS,
  pureVulnerable,
  slottedAlohaS,
  slottedVulnerable,
  xorBits,
} from "./dataLink";
import { propagationTime } from "./performance";

/**
 * 슬라이드 기준값 — source/data-communication/DC-3-DataLinkLayer.pdf (한 쪽에 슬라이드 2장, PDF 쪽 = ⌈슬라이드 ÷ 2⌉).
 * Example 3.1~3.12와 그림 속 수치 예(검사합 s.41, CRC 나눗셈 s.35~36, FEC 표 s.43)를 고정한다.
 */

const TABLE_3_1 = ["000", "011", "101", "110"]; // s.18: 00→000, 01→011, 10→101, 11→110
const FEC_TABLE = ["00000", "01011", "10101", "11110"]; // s.43

describe("블록 부호·해밍 거리", () => {
  it("s.18 (p.9) Table 3.1 = 단순 패리티 검사 부호 C(3, 2)", () => {
    expect(["00", "01", "10", "11"].map(parityCodeword)).toEqual(TABLE_3_1);
  });
  it("s.19 (p.10) Example 3.1: 111은 무효(버림), 000은 유효 → 두 비트 오류가 검출되지 않음", () => {
    expect(TABLE_3_1.includes("111")).toBe(false);
    expect(TABLE_3_1.includes("000")).toBe(true);
    expect(hammingDistance("011", "000")).toBe(2);
  });
  it("s.20 (p.10) Example 3.2: d(000, 011) = 2, d(10101, 11110) = 3", () => {
    expect(hammingDistance("000", "011")).toBe(2);
    expect(hammingDistance("10101", "11110")).toBe(3);
    expect(xorBits("10101", "11110")).toBe("01011");
  });
  it("s.21 (p.11): Table 3.1의 dmin = 2", () => expect(minHammingDistance(TABLE_3_1)).toBe(2));
  it("s.22 (p.11) Example 3.3: dmin 2 → 1개 오류만 보장(2 = 1 + 1)", () => expect(detectableErrors(2)).toBe(1));
  it("s.23 (p.12) Example 3.4: dmin 4 → 3개 오류까지 검출", () => expect(detectableErrors(4)).toBe(3));
  it("s.25 (p.13) Example 3.5: Table 3.1은 선형, 둘째 XOR 셋째 = 넷째", () => {
    expect(isLinear(TABLE_3_1)).toBe(true);
    expect(xorBits("011", "101")).toBe("110");
  });
  it("s.26 (p.13) Example 3.6: 0이 아닌 부호어의 1의 개수 2, 2, 2 → dmin 2", () => expect(linearMinDistance(TABLE_3_1)).toBe(2));
  it("s.30~31 (p.15~16) Example 3.7: 1011 → 10111, 다섯 경우의 신드롬 0·1·1·0·1", () => {
    expect(parityCodeword("1011")).toBe("10111");
    expect(["10111", "10011", "10110", "00110", "01011"].map(paritySyndrome)).toEqual([0, 1, 1, 0, 1]);
  });
  it("s.42 (p.21): 10비트를 고치려면 dmin 21", () => expect(dminToCorrect(10)).toBe(21));
  it("s.43~45 (p.22~23): 01001 수신 → 01011로 고침, 표의 dmin = 3(= 2·1 + 1)", () => {
    expect(nearestCodeword("01001", FEC_TABLE)).toBe("01011");
    expect(minHammingDistance(FEC_TABLE)).toBe(3);
    expect(dminToCorrect(1)).toBe(3);
  });
});

describe("순환 부호·CRC·검사합", () => {
  it("s.32 (p.16): 1011000을 순환 왼쪽 이동 → 0110001", () => expect(cyclicLeftShift("1011000")).toBe("0110001"));
  it("s.35 (p.18): 데이터워드 1001, 제수 1011 → 나머지 110, 부호어 1001110", () => {
    expect(crcEncode("1001", "1011")).toEqual({ remainder: "110", codeword: "1001110" });
  });
  it("s.36 (p.18): 1001110 → 신드롬 000(수용), 1000110 → 신드롬 011(버림)", () => {
    expect(crcSyndrome("1001110", "1011")).toBe("000");
    expect(crcSyndrome("1000110", "1011")).toBe("011");
  });
  it("s.37 (p.19): 비트 위치 = 차수(1000011 → x^6 + x + 1, 차수 6)", () => expect(polynomialOf("1000011")).toBe("x^6 + x + 1"));
  it("s.38 (p.19): 제수 조건 — 2비트 이상, 양 끝이 1", () => {
    expect(["1011", "11", "1001"].every(isValidGenerator)).toBe(true);
    expect(["1", "0110", "1010"].some(isValidGenerator)).toBe(false);
  });
  it("s.39 (p.20): 비트 수 = 차수 + 1 → CRC-8은 9비트, CRC-32는 33비트", () => {
    expect(generatorBits(8)).toBe(9);
    expect(generatorBits(32)).toBe(33);
  });
  it("s.41 (p.21): 7, 11, 12, 0, 6 → 합 36 → 4비트 6 → 검사합 9, 수신 측 45 → 15 → 0", () => {
    expect(checksum4([7, 11, 12, 0, 6])).toEqual({ total: 36, wrapped: 6, checksum: 9 });
    expect(checksum4([7, 11, 12, 0, 6, 9])).toEqual({ total: 45, wrapped: 15, checksum: 0 });
  });
});

describe("프레이밍(비트 채우기)", () => {
  it("s.12 (p.6): 0 다음 1이 다섯 개면 0 하나 끼움, 빼면 원래 데이터", () => {
    const data = "0001111111001111101000";
    expect(bitStuff(data)).toBe("000111110110011111001000");
    expect(bitUnstuff(bitStuff(data))).toBe(data);
    expect(bitStuff("01111110")).toBe("011111010");
  });
});

describe("ALOHA·CSMA/CD", () => {
  it("s.67 (p.34) Example 3.8: 600 km / 3×10^8 → Tp 2 ms, K=1: {0, 2}, K=2: {0..6}, K=3: 0..14 ms", () => {
    const tp = propagationTime(600e3, 3e8);
    expect(tp).toBeCloseTo(0.002, 12);
    expect(backoffTimes(1, 2)).toEqual([0, 2]);
    expect(backoffTimes(2, 2)).toEqual([0, 2, 4, 6]);
    expect(backoffTimes(3, 2).at(-1)).toBe(14);
  });
  it("s.69 (p.35) Example 3.9: 200비트 / 200 kbps → Tfr 1 ms, 취약 시간 2 ms", () => {
    const tfr = frameTime(200, 200e3);
    expect(tfr).toBeCloseTo(0.001, 12);
    expect(pureVulnerable(tfr)).toBeCloseTo(0.002, 12);
    expect(slottedVulnerable(tfr)).toBeCloseTo(0.001, 12);
  });
  it("s.70 (p.35): 순수 ALOHA 최대 처리율 0.184 (G = 1/2)", () => expect(pureAlohaS(0.5)).toBeCloseTo(0.184, 3));
  it("s.71~72 (p.36) Example 3.10: G = 1, 1/2, 1/4 → S 0.135·0.184·0.152, 프레임 135·92·38", () => {
    const tfr = frameTime(200, 200e3);
    const rows = [1000, 500, 250].map((f) => ({ G: load(f, tfr), S: pureAlohaS(load(f, tfr)), n: f * pureAlohaS(load(f, tfr)) }));
    expect(rows.map((r) => r.G)).toEqual([1, 0.5, 0.25].map((x) => expect.closeTo(x, 12)));
    expect(rows.map((r) => Number(r.S.toFixed(3)))).toEqual([0.135, 0.184, 0.152]);
    expect(rows.map((r) => Math.round(r.n))).toEqual([135, 92, 38]);
  });
  it("s.74 (p.37): 슬롯 ALOHA 최대 처리율 0.368 (G = 1)", () => expect(slottedAlohaS(1)).toBeCloseTo(0.368, 3));
  it("s.75~76 (p.38) Example 3.11: S 0.368·0.303·0.195, 프레임 368·151·49(슬라이드는 151을 버림, 49를 반올림 — ±1)", () => {
    const S = [1, 0.5, 0.25].map(slottedAlohaS);
    expect(S.map((s) => Number(s.toFixed(3)))).toEqual([0.368, 0.303, 0.195]);
    const n = [1000, 500, 250].map((f, i) => f * S[i]);
    for (const [got, slide] of [[n[0], 368], [n[1], 151], [n[2], 49]]) expect(Math.abs(got - slide)).toBeLessThanOrEqual(1);
  });
  it("s.87 (p.44) Example 3.12: 10 Mbps, Tp 25.6 μs → Tfr 51.2 μs, 최소 512비트 = 64바이트", () => {
    expect(csmaCdMinFrameBits(10e6, 25.6e-6)).toBeCloseTo(512, 6);
  });
});

describe("CDMA·주소", () => {
  it("s.97 (p.49): 직교 부호 ci·cj = 0, ci·ci = N(스테이션 수 4)", () => {
    const c = [[1, 1, 1, 1], [1, -1, 1, -1], [1, 1, -1, -1], [1, -1, -1, 1]];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) expect(dot(c[i], c[j])).toBe(i === j ? 4 : 0);
  });
  it("s.99 (p.50): A2:… 유니캐스트, A3:… 멀티캐스트, FF:… 브로드캐스트", () => {
    expect(macAddressType("A2:34:45:11:92:F1")).toBe("unicast");
    expect(macAddressType("A3:34:45:11:92:F1")).toBe("multicast");
    expect(macAddressType("FF:FF:FF:FF:FF:FF")).toBe("broadcast");
  });
});

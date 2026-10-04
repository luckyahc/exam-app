import { describe, expect, it } from "vitest";
import {
  batchFirstResponse,
  batchUtilization,
  switchCount,
  timeSharingFirstResponse,
  timeSharingUtilization,
  utilization,
} from "./cpuTime";
import { GB, invertedEntries, KB, MB, pageTableInfo } from "./memoryCapacity";
import { SCENARIOS, SWITCH_CAUSES, scenariosByCause, TRANSITIONS } from "./processScenario";

describe("cpuTime — Ch02 p.21-24 기준값 (N=10, T=1, s=0.01, q=0.1, 첫 출력 0.1초)", () => {
  const p = { n: 10, t: 1, s: 0.01, q: 0.1, output: 0.1 };
  it("다중프로그램 일괄처리 첫 응답 9.2초, 시분할 1.1초", () => {
    expect(batchFirstResponse(p)).toBeCloseTo(9.2, 10);
    expect(timeSharingFirstResponse(p)).toBeCloseTo(1.1, 10);
  });
  it("유효 CPU 이용률: 시분할 10/11 ≈ 0.91, 일괄처리 10/10.1 ≈ 0.99", () => {
    expect(timeSharingUtilization(p)).toBeCloseTo(10 / 11, 10);
    expect(batchUtilization(p)).toBeCloseTo(10 / 10.1, 10);
    expect(Math.round(timeSharingUtilization(p) * 100) / 100).toBe(0.91);
    expect(Math.round(batchUtilization(p) * 100) / 100).toBe(0.99);
  });
  it("스위칭 횟수: 일괄 10번, 시분할 100번", () => {
    expect(switchCount(p, "batch")).toBe(10);
    expect(switchCount(p, "timesharing")).toBe(100);
  });
  it("별도 예(p.21): 실행 7 + CPU 스위칭 0.6 + IO 스위칭 0.4 + CPU 휴식 2 → 0.7", () => {
    expect(utilization(7, 0.6 + 0.4 + 2)).toBeCloseTo(0.7, 10);
  });
});

describe("memoryCapacity — Ch08 p.13-17 기준값", () => {
  it("4GB 주소공간·4KB 페이지·4B 엔트리 → 약 100만(2^20) 엔트리, 4MB 테이블, 4KB 페이지 1024개 → 2단계 필요", () => {
    const r = pageTableInfo(32, 4 * KB, 4);
    expect(r).toEqual({
      pages: 2 ** 20,
      tableBytes: 4 * MB,
      pagesForTable: 1024,
      multiLevel: true,
      offsetBits: 12,
      pageBits: 20,
    });
  });
  it("테이블이 한 페이지 안에 들어가면 2단계가 필요 없다", () => {
    expect(pageTableInfo(16, 1 * KB, 4).multiLevel).toBe(false); // 64 엔트리 × 4B = 256B
  });
  it("역 페이지 테이블: RAM 4GB, 프레임 4KB → 엔트리 100만(2^20)개", () => {
    expect(invertedEntries(4 * GB, 4 * KB)).toBe(2 ** 20);
  });
});

describe("processScenario — Ch03 p.13, p.41-42", () => {
  it("5가지 원인마다 사례가 2개 이상", () => {
    for (const c of SWITCH_CAUSES) expect(scenariosByCause(c).length).toBeGreaterThanOrEqual(2);
  });
  it("원인 ↔ 상태 전이 대응이 슬라이드 규칙과 맞다", () => {
    const expected = {
      "Clock interrupt": "Running→Ready",
      "I/O interrupt": "Blocked→Ready",
      "I/O 함수 호출": "Running→Blocked",
      "Trap interrupt": "Running→Exit",
      "Memory fault interrupt": "Running→Blocked",
    };
    for (const s of SCENARIOS) expect(s.transition).toBe(expected[s.cause]);
    for (const s of SCENARIOS) expect(TRANSITIONS).toContain(s.transition);
  });
  it("사례 문장이 중복되지 않는다", () => {
    expect(new Set(SCENARIOS.map((s) => s.text)).size).toBe(SCENARIOS.length);
  });
});

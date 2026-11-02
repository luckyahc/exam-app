import { describe, expect, it } from "vitest";
import {
  accessTime,
  fscan,
  nStepScan,
  parityOf,
  parityUpdate,
  RAID_LEVELS,
  randomRead,
  recover,
  rotationalDelay,
  rotationMs,
  scheduleDisk,
  seekTime,
  sequentialRead,
  transferTime,
} from "./disk";

/** 슬라이드 기준값 — source/os/Ch11 Disk Scheduling.pdf. 테스트 이름 = "p.{쪽}" */

const REQ = [55, 58, 39, 18, 90, 160, 150, 38, 184]; // p.22
const LATER = [85, 100, 155, 165, 80]; // p.28

describe("디스크 스케줄링 (시작 100, 증가 방향)", () => {
  it("p.34 표: FIFO 498/55.3, SSTF 248/27.5, SCAN(LOOK) 250/27.8, C-SCAN(C-LOOK) 322/35.8", () => {
    const row = (p: Parameters<typeof scheduleDisk>[0]) => {
      const r = scheduleDisk(p, 100, "up", REQ);
      return [r.total, Number(r.average.toFixed(1))];
    };
    expect(row("fifo")).toEqual([498, 55.3]);
    expect(row("sstf")).toEqual([248, 27.6]); // 248/9 = 27.56 — 슬라이드 27.5는 버림
    expect(row("scan")).toEqual([250, 27.8]);
    expect(row("cscan")).toEqual([322, 35.8]);
  });
  it("p.25~27: 순서 — SSTF 90,58,55,39,38,18,150,160,184 / SCAN 150,160,184,90,… / C-SCAN 150,160,184,18,…", () => {
    expect(scheduleDisk("sstf", 100, "up", REQ).order).toEqual([90, 58, 55, 39, 38, 18, 150, 160, 184]);
    expect(scheduleDisk("scan", 100, "up", REQ).order).toEqual([150, 160, 184, 90, 58, 55, 39, 38, 18]);
    expect(scheduleDisk("cscan", 100, "up", REQ).order).toEqual([150, 160, 184, 18, 38, 39, 55, 58, 90]);
  });
  it("p.33: 첫 선택 트랙을 서비스하는 도중 둘째 요청 도착 — 네 정책의 순서", () => {
    expect(scheduleDisk("fifo", 100, "up", REQ, LATER).order).toEqual([...REQ, ...LATER]);
    expect(scheduleDisk("sstf", 100, "up", REQ, LATER).order).toEqual([90, 85, 80, 100, 58, 55, 39, 38, 18, 150, 155, 160, 165, 184]);
    expect(scheduleDisk("scan", 100, "up", REQ, LATER).order).toEqual([150, 155, 160, 165, 184, 100, 90, 85, 80, 58, 55, 39, 38, 18]);
    expect(scheduleDisk("cscan", 100, "up", REQ, LATER).order).toEqual([150, 155, 160, 165, 184, 18, 38, 39, 55, 58, 80, 85, 90, 100]);
  });
  it("p.30: FSCAN — 첫 큐 150,160,184,90,58,55,39,38,18 → 18에서 나오는 중 → 둘째 큐 80,85,100,155,165", () => {
    const r = fscan(100, "up", REQ, LATER);
    expect(r.first.order).toEqual([150, 160, 184, 90, 58, 55, 39, 38, 18]);
    expect(r.first.dir).toBe("down");
    expect(r.second.order).toEqual([80, 85, 100, 155, 165]);
  });
  it("p.32: 4-step-SCAN — 서브 큐 [55,58,39,18] [90,160,150,38] [184,85,100,155] [165,80], 순서 [58,55,39,18] [38,90,150,160] [184,155,100,85] [80,165]", () => {
    const r = nStepScan(4, 100, "up", REQ, LATER);
    expect(r.subQueues).toEqual([[55, 58, 39, 18], [90, 160, 150, 38], [184, 85, 100, 155], [165, 80]]);
    expect(r.served).toEqual([[58, 55, 39, 18], [38, 90, 150, 160], [184, 155, 100, 85], [80, 165]]);
  });
});

describe("디스크 성능 파라미터", () => {
  it("p.12: Ts = m × n + s (저가 m=0.3, s=20 / 고가 m=0.1, s=3)", () => {
    expect(seekTime(0.3, 100, 20)).toBeCloseTo(50, 9);
    expect(seekTime(0.1, 100, 3)).toBeCloseTo(13, 9);
  });
  it("p.13: 3600 rpm → 16.7 ms/rot, Tr = 8.3 ms", () => {
    expect(rotationMs(3600)).toBeCloseTo(16.67, 2);
    expect(rotationalDelay(rotationMs(3600))).toBeCloseTo(8.33, 2);
  });
  it("p.14: 32섹터 트랙에서 16섹터 = 반 바퀴(20 ms → 10 ms), 1 MB 트랙에서 1 KB = 1/1024 바퀴", () => {
    expect(transferTime(20, 16, 32)).toBe(10);
    expect(transferTime(1, 1024, 1024 * 1024)).toBeCloseTo(1 / 1024, 12);
  });
  it("p.17: 960 KB/s = 16 KB × r → r = 60, 한 바퀴 16.7 ms, Tr 8.3 ms, 1 MB = 2048 섹터 = 64 트랙", () => {
    const r = 960 / ((512 * 32) / 1024);
    expect(r).toBe(60);
    expect(rotationMs(r * 60)).toBeCloseTo(16.67, 2);
    expect((1024 * 1024) / 512).toBe(2048);
    expect(2048 / 32).toBe(64);
  });
  it("p.18: 순차 구성 45 + 63 × 25 = 1620 ms", () => {
    expect(sequentialRead({ seek: 20, rotDelay: 8.3, unitRead: 16.7, units: 64 })).toEqual({ first: 45, rest: 63 * 25, total: 1620 });
  });
  it("p.19: 임의 접근 2048 × 28.8 = 58982 ms", () => {
    expect(Math.round(randomRead({ seek: 20, rotDelay: 8.3, sectorRead: 0.5, sectors: 2048 }))).toBe(58982);
    expect(accessTime(20, 8.3, 0.5)).toBeCloseTo(28.8, 9);
  });
  it("p.20: 순차 병렬(8 실린더) 45 + 7 × 25 = 220 ms", () => {
    expect(sequentialRead({ seek: 20, rotDelay: 8.3, unitRead: 16.7, units: 8 }).total).toBeCloseTo(220, 9);
  });
  it("p.21: 6초에 1000번 회전, 4096 B × 32, 8 surfaces, 10 MB → 첫 실린더 19 ms, 나머지 9개 81 ms, 합 100 ms", () => {
    const rot = 6000 / 1000;
    const cylBytes = 4096 * 32 * 8;
    expect(cylBytes).toBe(2 ** 20);
    const units = (10 * 2 ** 20) / cylBytes;
    expect(units).toBe(10);
    expect(sequentialRead({ seek: 10, rotDelay: rotationalDelay(rot), unitRead: rot, units })).toEqual({ first: 19, rest: 81, total: 100 });
  });
});

describe("RAID", () => {
  it("p.41~42: 패리티 = XOR, 한 디스크 복구, 작은 쓰기 갱신 X4' = X4 ⊕ X1 ⊕ X1'", () => {
    const [x0, x1, x2, x3] = ["1010", "0110", "1100", "0001"];
    const x4 = parityOf(x3, x2, x1, x0);
    expect(recover(x0, x2, x3, x4)).toBe(x1);
    const x1n = "1111";
    expect(parityUpdate(x4, x1, x1n)).toBe(parityOf(x3, x2, x1n, x0));
  });
  it("p.45: 고장 허용 0·1·1·1·1·1·2", () => {
    expect(Object.values(RAID_LEVELS).map((r) => r.tolerates)).toEqual([0, 1, 1, 1, 1, 1, 2]);
  });
});

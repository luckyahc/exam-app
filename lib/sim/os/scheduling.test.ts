import { describe, expect, it } from "vitest";
import { CH09_EXAMPLE, exponentialAverage, responseRatio, round2, runningAt, simpleAverage, simulate, startsAt, timeline } from "./scheduling";

// 기준값: source/os/Ch09 Uniprocessor Scheduling.pdf — p.27 비교 표, p.11·13·14·19·21·22·25 그림(실행 구간·RQ·응답 비율)

const tr = (r: ReturnType<typeof simulate>) => ["A", "B", "C", "D", "E"].map((n) => r.turnaround[n]);

describe("p.27 알고리즘 비교 표 (반환시간 Tr · 평균 Tr · 평균 Tw · 평균 Tr/Ts)", () => {
  it.each([
    ["fcfs", {}, [3, 7, 9, 12, 12], 8.6, 4.6, 2.56],
    ["rr", { quantum: 1 }, [4, 16, 13, 14, 7], 10.8, 6.8, 2.71],
    ["spn", {}, [3, 7, 11, 14, 3], 7.6, 3.6, 1.84],
    ["srt", {}, [3, 13, 4, 14, 2], 7.2, 3.2, 1.59],
    ["hrrn", {}, [3, 7, 9, 14, 7], 8.0, 4.0, 2.14],
  ] as const)("%s", (algo, opts, trs, avgTr, avgTw, avgN) => {
    const r = simulate(algo, CH09_EXAMPLE, opts);
    expect(tr(r)).toEqual(trs);
    expect(round2(r.avgTurnaround)).toBe(avgTr);
    expect(round2(r.avgWaiting)).toBe(avgTw);
    expect(round2(r.avgNormalized)).toBe(avgN);
  });
});

describe("그림의 실행 순서", () => {
  it("FCFS(p.11): A 0-3, B 3-9, C 9-13, D 13-18, E 18-20 — 필기 '시간 4일때' 실행 중인 것은 B", () => {
    const r = simulate("fcfs", CH09_EXAMPLE);
    expect(timeline(r)).toBe("AAABBBBBBCCCCDDDDDEE");
    expect(runningAt(r, 4)).toBe("B");
  });
  it("RR q=1(p.13)", () => {
    expect(timeline(simulate("rr", CH09_EXAMPLE, { quantum: 1 }))).toBe("AABABCBDCBEDCBEDCBDD");
  });
  it("RR q=4(p.14): 새 작업이 도착해도 quantum 소진 전에는 스케줄링하지 않음", () => {
    expect(timeline(simulate("rr", CH09_EXAMPLE, { quantum: 4 }))).toBe("AAABBBBCCCCDDDDBBEED");
  });
  it("SPN(p.19): A, B, E, C, D", () => {
    expect(timeline(simulate("spn", CH09_EXAMPLE))).toBe("AAABBBBBBEECCCCDDDDD");
  });
  it("SRT(p.21): t=3 B, t=4 C(4) < B(5), t=8 E, t=10 B·D 남은 5로 같으면 먼저 온 B", () => {
    const r = simulate("srt", CH09_EXAMPLE);
    expect(timeline(r)).toBe("AAABCCCCEEBBBBBDDDDD");
    expect(r.decisions.find((d) => d.time === 4)?.candidates.map((c) => `${c.name}:${c.remaining}`)).toEqual(["B:5", "C:4"]);
  });
  it("HRRN(p.22): 응답 비율 — t=3 B 1.17, t=9 C 2.25·D 1.6·E 1.5, t=13 E 3.5·D 2.4, 필기 '10일때' 실행 중인 것은 C", () => {
    const r = simulate("hrrn", CH09_EXAMPLE);
    expect(timeline(r)).toBe("AAABBBBBBCCCCEEDDDDD");
    const at = (t: number) => Object.fromEntries(r.decisions.find((d) => d.time === t)!.candidates.map((c) => [c.name, round2(c.ratio)]));
    expect(at(3)).toEqual({ B: 1.17 });
    expect(at(9)).toEqual({ C: 2.25, D: 1.6, E: 1.5 });
    expect(at(13)).toEqual({ D: 2.4, E: 3.5 });
    expect(at(15)).toEqual({ D: 2.8 });
    expect(runningAt(r, 10)).toBe("C");
    expect(startsAt(r, 9)).toBe("C");
  });
  it("Feedback q=1(p.25 위 그림): 혼자면 RQ0에 남음", () => {
    expect(timeline(simulate("feedback", CH09_EXAMPLE, { quantum: 1, feedback: "fixed" }))).toBe("AABACBDCEDEBCDBCDBDB");
  });
  it("Feedback q=2^i(p.25 아래 그림): B는 D가 도착해도 RQ1 quantum 2만큼 계속 실행", () => {
    const r = simulate("feedback", CH09_EXAMPLE, { feedback: "pow2" });
    expect(timeline(r)).toBe("AABACBBDECCDDEBBBCDD");
    expect(r.finish).toEqual({ A: 4, B: 17, C: 18, D: 20, E: 14 });
  });
});

describe("p.22 필기 예 · p.18 서비스 시간 추정 · p.26 지표", () => {
  it("시간 4에 10분 작업 A, 시간 6에 1분 작업 B → 시간 6: A 1.2, B 1 → A 선택", () => {
    expect(responseRatio(2, 10)).toBe(1.2);
    expect(responseRatio(0, 1)).toBe(1);
    expect(responseRatio(1, 1)).toBe(2);
    expect(responseRatio(1, 4)).toBe(1.25);
  });
  it("지수 평균 S(n+1) = αT(n) + (1−α)S(n), 단순 평균", () => {
    expect(exponentialAverage([6, 4], 0.5, 10)).toEqual([10, 8, 6]);
    expect(simpleAverage([6, 4, 8])).toBe(6);
  });
  it("Tr = Tw + Ts, 정규화 = 1 + Tw/Ts (FCFS 예)", () => {
    const r = simulate("fcfs", CH09_EXAMPLE);
    for (const p of CH09_EXAMPLE) {
      expect(r.turnaround[p.name]).toBe(r.waiting[p.name] + p.service);
      expect(r.normalized[p.name]).toBeCloseTo(1 + r.waiting[p.name] / p.service);
    }
  });
});

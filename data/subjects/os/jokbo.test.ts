import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buddyBlocks, simulateBuddy } from "@/lib/sim/os/buddy";
import { utilization } from "@/lib/sim/os/cpuTime";
import { logicalToPhysical, physicalToLogical } from "@/lib/sim/os/paging";
import { chooseHole, type Hole } from "@/lib/sim/os/placement";
import { clockReplace, enhancedClockVictim, simulateReplacement } from "@/lib/sim/os/replacement";
import { runningAt, simulate } from "@/lib/sim/os/scheduling";
import { segLogicalToPhysical } from "@/lib/sim/os/segmentation";
import type { Question } from "@/types/question";
import os from "./index";

// Sprint 20 OS 족보: inventory ↔ 데이터 일치, 원문 그대로(보기 순서 고정), 계산·추적 정답 = lib/sim/os

const ROOT = path.resolve(import.meta.dirname, "../../..");
const inventory = readFileSync(path.join(ROOT, "docs/jokbo/os/inventory.md"), "utf8");

type Mcq = Question & { choices: string[]; answerIndex: number };
type Multi = Question & { choices: string[]; answerIndexes: number[] };

describe("OS 족보 문항", async () => {
  const all = (await Promise.all(os.chapters.map((c) => c.load()))).flat();
  const jokbo = all.filter((q) => q.origin === "jokbo");
  const byId = new Map(jokbo.map((q) => [q.id, q]));
  const mcq = (id: string) => byId.get(id) as Mcq;
  const multi = (id: string) => byId.get(id) as Multi;
  const picked = (id: string) => mcq(id).choices[mcq(id).answerIndex];
  const pickedMany = (id: string) => multi(id).answerIndexes.map((i) => multi(id).choices[i]);

  it("inventory의 대표 문항 56개가 모두 있고 그 밖의 족보 문항은 없다", () => {
    const reps = [...inventory.matchAll(/대표 `(os-ch\d\d-jokbo-\d{3})`/g)].map((m) => m[1]);
    expect(new Set(reps).size).toBe(56);
    expect(jokbo.map((q) => q.id).sort()).toEqual([...new Set(reps)].sort());
  });

  it("출현 기록 = 범위 안 원문 91개(대표 56 + 같은 문제 35), 원문이 두 번 쓰이지 않는다", () => {
    const occ = jokbo.flatMap((q) => q.jokbo!.occurrences.map((o) => `${o.term} ${o.number}`));
    expect(occ).toHaveLength(91);
    expect(new Set(occ).size).toBe(91);
    // inventory의 "같은 문제 → 대표 id" 행이 그 대표의 occurrences에 들어 있다
    for (const m of inventory.matchAll(/\| \d+ \| (2[23])-(\d+) \| [^|]+ \| 같은 문제 → `(os-ch\d\d-jokbo-\d{3})`/g)) {
      const term = m[1] === "23" ? "2023 중간" : "2022 중간";
      expect(byId.get(m[3])!.jokbo!.occurrences.some((o) => o.term === term && o.number === m[2]), `${m[1]}-${m[2]} → ${m[3]}`).toBe(true);
    }
  });

  it("variantGroup = inventory", () => {
    for (const m of inventory.matchAll(/대표 `(os-ch\d\d-jokbo-\d{3})`, vg `([a-z-]+)`/g)) expect(byId.get(m[1])!.jokbo!.variantGroup, m[1]).toBe(`os-vg-${m[2]}`);
  });

  it("원문 그대로: 보기 순서 고정(shuffle: false), 해설은 생성 해설", () => {
    for (const q of jokbo) {
      if (q.type === "mcq" || q.type === "multi") expect(q.shuffle, q.id).toBe(false);
      expect(q.jokbo!.explanationSource, q.id).toBe("generated");
    }
  });

  it("Ch02 응답시간: 0.1초 단위 — 시분할 = RR(q=0.1) 0.4초, 다중프로그래밍 = FCFS 1.2초", () => {
    const procs = [
      { name: "A", arrival: 0, service: 10 },
      { name: "B", arrival: 0, service: 10 },
    ];
    // B가 0.2초(2칸) 실행한 시각 = 첫 출력
    const firstOutput = (r: ReturnType<typeof simulate>) => {
      let ran = 0;
      for (let t = 0; ; t++) if (runningAt(r, t) === "B" && ++ran === 2) return (t + 1) / 10;
    };
    expect(picked("os-ch02-jokbo-006")).toBe(String(firstOutput(simulate("rr", procs, { quantum: 1 }))));
    expect(picked("os-ch02-jokbo-007")).toBe(String(firstOutput(simulate("fcfs", procs))));
  });

  it("Ch02 CPU 이용률(충돌 → 교수님 기준 채택): 유효 실행 시간 기준 0.6 = Ch02 ⭐ 시간 계산 예제와 같은 계산", () => {
    expect(picked("os-ch02-jokbo-010")).toBe(String(utilization(6, 0.3 + 0.7 + 3)));
    expect(byId.get("os-ch02-jokbo-010")!.explanation).toMatch(/^교수님 채점 기준\(2022 시험\)/);
    // 같은 방식: os-ch02-time-calc-007(⭐) = utilization(6, 0.5 + 0.5 + 3)
    const star = all.find((q) => q.id === "os-ch02-time-calc-007") as Question & { answer: number };
    expect(star.answer).toBe(Math.round(utilization(6, 0.5 + 0.5 + 3) * 100) / 100);
  });

  it("Ch07 버디: 반납 후 128 할당·128 free·256 free, 129K 요청은 256K 블록", () => {
    const base = [
      { type: "request", name: "A", size: 128 },
      { type: "request", name: "B", size: 128 },
      { type: "request", name: "C", size: 128 },
      { type: "request", name: "D", size: 128 },
      { type: "release", name: "C" },
    ] as const;
    const after = simulateBuddy(512, [...base, { type: "release", name: "B" }, { type: "release", name: "D" }]).at(-1)!;
    expect(buddyBlocks(after.state).map((b) => `${b.size}${b.name ? "#" : ""}`)).toEqual(["128#", "128", "256"]);
    expect(picked("os-ch07-jokbo-001")).toContain(" 128K   128K        256K");
    const req = simulateBuddy(512, [{ type: "request", name: "A", size: 128 }, { type: "request", name: "X", size: 129 }]).at(-1)!;
    expect(buddyBlocks(req.state).map((b) => `${b.size}${b.name ? "#" : ""}`)).toEqual(["128#", "128", "256#"]);
    expect(picked("os-ch07-jokbo-002")).toContain("|#############|");
  });

  it("Ch07 배치: 15K 요청이 B에 들어가면 next-fit, D에 들어가면 worst-fit", () => {
    // A 18K, ###(10K), B 17K, ###(10K), C 16K, ##(10K), D 20K — 마지막 할당은 A와 B 사이 block(끝 주소 28)
    const holes: Hole[] = [
      { start: 0, size: 18 },
      { start: 28, size: 17 },
      { start: 55, size: 16 },
      { start: 81, size: 20 },
    ];
    expect(chooseHole(holes, 15, "next", 28).index).toBe(1);
    expect(chooseHole(holes, 15, "worst").index).toBe(3);
    expect(new Set(["first", "best", "next", "worst"].map((f) => chooseHole(holes, 15, f as never, 28).index)).size).toBe(4);
    expect(picked("os-ch07-jokbo-005")).toBe("next-fit");
    expect(picked("os-ch07-jokbo-006")).toBe("worst-fit");
  });

  it("Ch07 주소 변환: 2049 → 3073, 실주소 2 → 1026, 세그먼트 2051 → 2051", () => {
    expect(picked("os-ch07-jokbo-011")).toBe(String(logicalToPhysical([1, 0, 3, 2], 1024, 2049).physical));
    expect(picked("os-ch07-jokbo-012")).toBe(String(physicalToLogical([2, 0, 3, 1], 1024, 2)!.logical));
    const seg = [
      { base: 1024, length: 768 },
      { base: 0, length: 512 },
      { base: 2048, length: 1000 },
      { base: 512, length: 256 },
    ];
    expect(picked("os-ch07-jokbo-013")).toBe(String(segLogicalToPhysical(seg, 1024, 2051).physical));
  });

  it("Ch08 교체: Enhanced Clock [0], Clock [1]·pointer [2]·[3]=1, Optimal [3], LRU [2]", () => {
    const ec = enhancedClockVictim(
      [
        { page: 5, u: 0, m: 0 },
        { page: 2, u: 0, m: 1 },
        { page: 3, u: 1, m: 0 },
        { page: 1, u: 1, m: 1 },
      ],
      1,
    );
    expect(picked("os-ch08-jokbo-002")).toBe(`[${ec.victim}]`);
    const c = clockReplace({ pages: [5, 2, 3, 1], use: [1, 1, 1, 1], pointer: 1 }, 4);
    expect(picked("os-ch08-jokbo-003")).toBe(`[${c.victim}], [${c.buffer.pointer}], ${c.buffer.pages[3]}${c.buffer.use[3] ? "*" : ""}`);
    // 프레임 [0]2 [1]3 [2]5 [3]1, 지금까지 …, 5, 1, 2, 3 → 다음 4
    const past = [2, 3, 5, 1, 5, 1, 2, 3];
    const loadedAt4 = (algo: "opt" | "lru", future: number[]) => simulateReplacement([...past, 4, ...future], 4, algo).steps[past.length].loadedFrame;
    expect(picked("os-ch08-jokbo-004")).toBe(`[${loadedAt4("opt", [2, 3, 5, 1, 2, 5])}]`);
    expect(picked("os-ch08-jokbo-005")).toBe(`[${loadedAt4("lru", [2, 3, 5, 1])}]`);
  });

  it("Ch09 SRT·HRRN 0~4 구간의 틀린 보기 = 시뮬레이터 실행 순서와 다른 것", () => {
    const wrong = (algo: "srt" | "hrrn", service: number[]) => {
      const r = simulate(
        algo,
        ["A", "B", "C"].map((name, i) => ({ name, arrival: i, service: service[i] })),
      );
      return (choice: string) => {
        const [t, p] = choice.split(": ");
        return runningAt(r, Number(t)) !== p;
      };
    };
    const srt = wrong("srt", [5, 3, 1]);
    expect(multi("os-ch09-jokbo-001").choices.filter(srt)).toEqual(pickedMany("os-ch09-jokbo-001"));
    const hrrn = wrong("hrrn", [2, 2, 1]);
    expect(multi("os-ch09-jokbo-002").choices.filter(hrrn)).toEqual(pickedMany("os-ch09-jokbo-002"));
  });
});

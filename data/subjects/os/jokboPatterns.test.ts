import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buddyBlocks, simulateBuddy, type BuddyOp } from "@/lib/sim/os/buddy";
import { batchUtilization, timeSharingUtilization, utilization } from "@/lib/sim/os/cpuTime";
import { logicalToPhysical, physicalToLogical } from "@/lib/sim/os/paging";
import { chooseHole, FITS, FIT_LABEL, type Hole } from "@/lib/sim/os/placement";
import { clockReplace, enhancedClockVictim, simulateReplacement, type EnhancedFrame } from "@/lib/sim/os/replacement";
import { runningAt, simulate, type SchedAlgo } from "@/lib/sim/os/scheduling";
import { segLogicalToPhysical } from "@/lib/sim/os/segmentation";
import { isJokbo } from "@/lib/quiz/jokbo";
import type { Question } from "@/types/question";
import os from "./index";
import { buddyArt } from "./jokboPatterns";

// OS 족보관련 생성 문항(2026-10-19): 바탕 족보·패턴·난이도, 해설 형식, 계산·추적 정답 = lib/sim/os(오답 보기가 정답이 되지 않는지 포함),
// 순서 문항 = 슬라이드 순서와 같은 보기가 정확히 하나, docs/jokbo/os/pattern-analysis.md = 데이터

const ROOT = path.resolve(import.meta.dirname, "../../..");
type Q = Question & { choices: string[]; answerIndex: number; answerIndexes: number[] };
/** 시뮬레이터로 정답을 다시 계산하는 문항(문서의 검증 열 "시뮬레이터") */
const SIM = [
  "ch02-pattern-response-001", "ch02-pattern-response-002", "ch02-pattern-response-003", "ch02-pattern-utilization-001", "ch02-pattern-utilization-002",
  "ch07-pattern-buddy-001", "ch07-pattern-buddy-002", "ch07-pattern-buddy-003", "ch07-pattern-fit-001", "ch07-pattern-fit-002", "ch07-pattern-fit-003",
  "ch07-pattern-address-001", "ch07-pattern-address-002", "ch07-pattern-address-003", "ch07-pattern-segment-001", "ch07-pattern-segment-002",
  "ch08-pattern-replace-001", "ch08-pattern-replace-002", "ch08-pattern-replace-003", "ch08-pattern-clock-001", "ch08-pattern-clock-002",
  "ch08-pattern-eclock-001", "ch08-pattern-eclock-002",
  "ch09-pattern-srt-001", "ch09-pattern-srt-002", "ch09-pattern-hrrn-001", "ch09-pattern-hrrn-002", "ch09-pattern-hrrn-003",
].map((id) => `os-${id}`);
/** 순서·상태 변화 문항(문서의 검증 열 "순서") — 슬라이드 순서와 같은 보기가 정확히 하나 */
const ORDER = ["ch03-pattern-interrupt-001", "ch03-pattern-state-002", "ch08-pattern-order-001", "ch08-pattern-order-002", "ch08-pattern-order-003"].map((id) => `os-${id}`);

describe("OS 족보관련 생성 문항", async () => {
  const all = (await Promise.all(os.chapters.map((c) => c.load()))).flat();
  const pats = all.filter((x) => x.basedOn) as Q[];
  const byId = new Map(all.map((x) => [x.id, x as Q]));
  const q = (id: string) => byId.get(`os-${id}`)!;
  const picked = (id: string) => q(id).choices[q(id).answerIndex];
  const pickedMany = (id: string) => q(id).answerIndexes.map((i) => q(id).choices[i]);
  /** 정답 값 하나가 보기 중 정답 보기에만 있다 */
  const only = (id: string, value: string) => expect(q(id).choices.filter((c) => c === value), id).toEqual([picked(id)]);

  it("55문항(최대 60) — 바탕 족보는 시험 범위 챕터의 족보, 첫 바탕은 같은 챕터, 족보와 같은 보기 고르기 타입(mcq/multi), 족보 표시 없음, 난이도 2·3, 보기 순서 고정", () => {
    expect(pats).toHaveLength(55);
    for (const x of pats) {
      expect(x.origin, x.id).toBeUndefined();
      expect(x.jokbo, x.id).toBeUndefined();
      expect(x.exam, x.id).toBe(false);
      expect(["ch02", "ch03", "ch07", "ch08", "ch09"]).toContain(x.chapter);
      const bases = x.basedOn!.map((id) => byId.get(id)!);
      for (const [i, b] of bases.entries()) expect(b && isJokbo(b), x.basedOn![i]).toBe(true);
      expect(bases[0].chapter, x.id).toBe(x.chapter);
      expect(bases.every((b) => b.type === "mcq" || b.type === "multi") && (x.type === "mcq" || x.type === "multi"), x.id).toBe(true);
      expect([2, 3], x.id).toContain(x.difficulty);
      expect((x as { shuffle?: boolean }).shuffle, x.id).toBe(false);
      expect(x.id, x.id).toMatch(/^os-ch\d\d-pattern-[a-z]+-\d{3}$/);
    }
  });

  it("해설 = 풀이 + 원문과 달라진 점 1줄 + 함정 1줄 (+ 끝에 근거 줄) — 개념형 문항은 보기별 슬라이드 페이지, 유효 CPU 이용률 문항은 정의 페이지", () => {
    const bad = pats.filter((x) => !/^풀이: [^\n]+ 원문과 달라진 점: [^\n]+ 함정: [^\n]+(\n근거: [^\n]+)?$/.test(x.explanation) || x.explanation.split("원문과 달라진 점:").length !== 2 || x.explanation.split("함정:").length !== 2);
    expect(bad.map((x) => x.id)).toEqual([]);
    const needs = pats.filter((x) => (!SIM.includes(x.id) && !ORDER.includes(x.id)) || x.id.includes("utilization"));
    expect(needs).toHaveLength(24);
    for (const x of needs) {
      const basis = /\n근거: (.+)$/.exec(x.explanation)?.[1] ?? "";
      expect(basis, x.id).toMatch(new RegExp(`^(보기 1(~\\d)? )?Ch${x.chapter.slice(2)} p\\.`));
      const n = (x as Q).choices.length;
      if (!x.id.includes("utilization") && !basis.includes(`보기 1~${n}`))
        for (let k = 1; k <= n; k++) expect(basis, `${x.id} 보기 ${k}`).toMatch(new RegExp(`보기 ${k} `));
    }
  });

  it("Ch02 응답시간·유효 CPU 이용률 = scheduling(0.1초 단위 RR·FCFS)·cpuTime", () => {
    /** who가 out칸(0.1초 단위) 실행을 채운 시각 = 첫 출력 */
    const firstOutput = (algo: SchedAlgo, names: string[], who: string, out: number) => {
      const r = simulate(algo, names.map((name) => ({ name, arrival: 0, service: 10 })), { quantum: 1 });
      let ran = 0;
      for (let t = 0; ; t++) if (runningAt(r, t) === who && ++ran === out) return (t + 1) / 10;
    };
    only("ch02-pattern-response-001", String(firstOutput("rr", ["A", "B"], "B", 3)));
    expect(q("ch02-pattern-response-001").choices).toContain(String(firstOutput("fcfs", ["A", "B"], "B", 3))); // 함정: Multiprogramming 1.3
    const abc = ["A", "B", "C"];
    only("ch02-pattern-response-002", `${firstOutput("rr", abc, "C", 2)}, ${firstOutput("fcfs", abc, "C", 2)}`);
    const back = q("ch02-pattern-response-003").choices.filter((c) => firstOutput("rr", ["A", "B"], "B", Math.round(Number(c) * 10)) === 0.8);
    expect(back).toEqual([picked("ch02-pattern-response-003")]);

    only("ch02-pattern-utilization-001", String(utilization(8, 0.5 + 0.5 + 1)));
    expect(q("ch02-pattern-utilization-001").choices).toContain(String((8 + 0.5 + 0.5) / 10)); // 함정: 바쁜 시간 기준(족보 채점과 이론이 갈린 지점)
    const ts = timeSharingUtilization({ n: 2, t: 1, s: 0.02, q: 0.1 });
    only("ch02-pattern-utilization-002", ts.toFixed(2));
    expect(q("ch02-pattern-utilization-002").choices).toContain(batchUtilization({ n: 2, t: 1, s: 0.02 }).toFixed(2)); // 함정: 프로그램마다 1회 스위칭
  });

  it("Ch07 버디 = simulateBuddy(짝끼리만 합치기·연쇄 합치기·가장 작은 블록 쪼개기)", () => {
    const art = (total: number, ops: BuddyOp[], unit: number, cell?: number) =>
      buddyArt(buddyBlocks(simulateBuddy(total, ops).at(-1)!.state).map((b) => [b.size, b.name !== null] as const), unit, cell);
    const req = (name: string, size: number): BuddyOp => ({ type: "request", name, size });
    const rel = (name: string): BuddyOp => ({ type: "release", name });
    /** 지문 그림의 반납 표시(*)와 그에 따른 칸 맞춤은 빼고 비교 */
    const flat = (s: string) => s.replace(/[\s*]/g, "");

    const four = [req("A", 128), req("B", 128), req("C", 128), req("D", 128), rel("B")];
    expect(flat(q("ch07-pattern-buddy-001").prompt)).toContain(flat(art(512, four, 128)));
    only("ch07-pattern-buddy-001", art(512, [...four, rel("A"), rel("D")], 128));

    const big = [req("A", 128), req("B", 128), req("C", 256), req("D", 512), rel("B"), rel("C")];
    expect(flat(q("ch07-pattern-buddy-002").prompt)).toContain(flat(art(1024, big, 128)));
    only("ch07-pattern-buddy-002", art(1024, [...big, rel("A")], 128));

    const small = [req("A", 64), req("B", 64), req("C", 128), rel("B"), rel("C")];
    expect(q("ch07-pattern-buddy-003").prompt).toContain(art(512, small, 32, 4));
    only("ch07-pattern-buddy-003", art(512, [...small, req("E", 30), req("F", 65)], 32, 4));
  });

  it("Ch07 배치 = chooseHole(결과 → 알고리즘, next-fit 되돌아가기, 연속 요청)", () => {
    const fitsTo = (holes: Hole[], size: number, lastEnd: number, index: number) => FITS.filter((f) => chooseHole(holes, size, f, lastEnd).index === index).map((f) => FIT_LABEL[f].toLowerCase());
    // A 0~22, ### 22~32, B 32~46, ### 46~56, C 56~75, ### 75~85, D 85~110 — 마지막 할당 = B와 C 사이(끝 56)
    const h1: Hole[] = [{ start: 0, size: 22 }, { start: 32, size: 14 }, { start: 56, size: 19 }, { start: 85, size: 25 }];
    expect(new Set(FITS.map((f) => chooseHole(h1, 12, f, 56).index)).size).toBe(4);
    expect(fitsTo(h1, 12, 56, 1)).toEqual([picked("ch07-pattern-fit-001")]);
    // A 0~10, B 20~42, C 52~67, D 77~107, 마지막 할당 = D 뒤(끝 117) → next-fit은 처음으로 되돌아감
    const h2: Hole[] = [{ start: 0, size: 10 }, { start: 20, size: 22 }, { start: 52, size: 15 }, { start: 77, size: 30 }];
    expect(chooseHole(h2, 14, "next", 117).wrapped).toBe(true);
    expect(fitsTo(h2, 14, 117, 1)).toEqual(pickedMany("ch07-pattern-fit-002"));
    // A 0~10, ### 10~20, B 20~42, ### 42~52, C 52~67, ## 67~77, D 77~89 — 마지막 할당 = A와 B 사이(끝 20)
    const h3: Hole[] = [{ start: 0, size: 10 }, { start: 20, size: 22 }, { start: 52, size: 15 }, { start: 77, size: 12 }];
    const first = chooseHole(h3, 8, "next", 20);
    expect(first.index).toBe(1);
    const after: Hole[] = [h3[0], { start: 28, size: 14 }, h3[2], h3[3]];
    const second = chooseHole(after, 13, "next", 28).index!;
    only("ch07-pattern-fit-003", ["A", "B의 남은 14K 영역", "C", "D"][second]);
  });

  it("Ch07 주소 변환 = paging·segmentation(페이지 폴트·보호 위반 포함)", () => {
    only("ch07-pattern-address-001", String(logicalToPhysical([3, 2, 0, 1], 1024, 3100).physical));
    only("ch07-pattern-address-002", String(physicalToLogical([1, 3, 0, 2], 1024, 3075)!.logical));
    const t3 = [4, null, 1, 0];
    const show = (r: ReturnType<typeof logicalToPhysical>) => (r.fault ? "page fault 발생" : String(r.physical));
    only("ch07-pattern-address-003", `${show(logicalToPhysical(t3, 512, 700))}, ${show(logicalToPhysical(t3, 512, 1300))}`);
    const seg = [{ base: 2048, length: 600 }, { base: 0, length: 900 }, { base: 1024, length: 512 }, { base: 3072, length: 300 }];
    const segShow = (l: number) => {
      const r = segLogicalToPhysical(seg, 1024, l);
      return r.trap ? "보호 위반(trap) 발생" : String(r.physical);
    };
    only("ch07-pattern-segment-001", segShow(2100));
    only("ch07-pattern-segment-002", `${segShow(1100)}, ${segShow(3400)}`);
  });

  it("Ch08 교체 = replacement(LRU·FIFO·OPT·Clock·Enhanced Clock)", () => {
    const past = [4, 1, 3, 2, 3, 4, 1, 2];
    expect(simulateReplacement(past, 4, "lru").steps.at(-1)!.frames).toEqual([4, 1, 3, 2]);
    const at = (algo: "lru" | "fifo" | "opt", rest: number[], k = 0) => simulateReplacement([...past, ...rest], 4, algo).steps[past.length + k].loadedFrame;
    only("ch08-pattern-replace-001", `[${at("lru", [5, 3, 4, 1, 2])}]`);
    expect(q("ch08-pattern-replace-001").choices).toContain(`[${at("opt", [5, 3, 4, 1, 2])}]`); // 함정: Optimal의 답
    only("ch08-pattern-replace-002", `FIFO [${at("fifo", [5])}], LRU [${at("lru", [5])}]`);
    const future = [6, 7, 1, 2, 3, 6, 4, 7];
    only("ch08-pattern-replace-003", `[${at("opt", future)}], [${at("opt", future, 1)}]`);

    const c1 = clockReplace({ pages: [5, 2, 3, 1], use: [1, 1, 0, 1], pointer: 1 }, 4);
    only("ch08-pattern-clock-001", `[${c1.victim}], [${c1.buffer.pointer}], ${c1.buffer.pages[1]}${c1.buffer.use[1] ? "*" : ""}`);
    const s1 = clockReplace({ pages: [5, 2, 3, 1], use: [1, 0, 1, 0], pointer: 1 }, 4).buffer;
    const hit = { ...s1, use: s1.use.map((u, i) => (s1.pages[i] === 1 ? 1 : u)) as (0 | 1)[] }; // 1 참조 = hit: use bit만 1, pointer 그대로
    const c2 = clockReplace(hit, 6);
    only("ch08-pattern-clock-002", `[${c2.victim}], [${c2.buffer.pointer}], ${c2.buffer.pages[3]}${c2.buffer.use[3] ? "*" : ""}`);

    const f = (page: number, u: 0 | 1, m: 0 | 1): EnhancedFrame => ({ page, u, m });
    const state = (x: EnhancedFrame) => `${x.page}${x.u || x.m ? " " : ""}${x.u ? "*" : ""}${x.m ? "+" : ""}`;
    only("ch08-pattern-eclock-001", `[${enhancedClockVictim([f(5, 0, 1), f(2, 1, 0), f(3, 0, 0), f(1, 1, 1)], 1).victim}]`);
    const e2 = enhancedClockVictim([f(5, 1, 1), f(2, 1, 1), f(3, 1, 0), f(1, 1, 1)], 1);
    expect(e2.pass).toBe(3);
    only("ch08-pattern-eclock-002", `[${e2.victim}], ${state(e2.frames[1])}`);
  });

  it("Ch09 추적 = scheduling(SRT·HRRN 타이는 먼저 도착한 것, 반환·대기시간)", () => {
    const run = (algo: SchedAlgo, spec: [string, number, number][]) => simulate(algo, spec.map(([name, arrival, service]) => ({ name, arrival, service })));
    const wrong = (id: string, algo: SchedAlgo, spec: [string, number, number][]) => {
      const r = run(algo, spec);
      expect(q(id).choices.filter((c) => runningAt(r, Number(c.split(": ")[0])) !== c.split(": ")[1]), id).toEqual(pickedMany(id));
    };
    wrong("ch09-pattern-srt-001", "srt", [["A", 0, 4], ["B", 1, 2], ["C", 2, 4]]);
    wrong("ch09-pattern-srt-002", "srt", [["A", 0, 6], ["B", 1, 3], ["C", 2, 1], ["D", 3, 2]]);
    wrong("ch09-pattern-hrrn-001", "hrrn", [["A", 0, 3], ["B", 1, 2], ["C", 2, 4]]);
    const h2: [string, number, number][] = [["A", 0, 3], ["B", 1, 4], ["C", 2, 2], ["D", 3, 1]];
    wrong("ch09-pattern-hrrn-002", "hrrn", h2);
    // 시간 3의 타이: B와 C의 응답 비율이 같다(1.5) — 먼저 도착한 B
    const tie = run("hrrn", h2).decisions.find((d) => d.time === 3)!;
    expect(tie.candidates.filter((c) => c.ratio === 1.5).map((c) => c.name)).toEqual(["B", "C"]);
    const spec: [string, number, number][] = [["A", 0, 3], ["B", 1, 5], ["C", 2, 2], ["D", 4, 1]];
    const r = run("hrrn", spec);
    only("ch09-pattern-hrrn-003", `${r.turnaround.B}, ${r.avgWaiting}`);
    const fcfs = run("fcfs", spec);
    expect(q("ch09-pattern-hrrn-003").choices).toContain(`${fcfs.turnaround.B}, ${fcfs.avgWaiting}`); // 함정: FCFS로 푼 값
  });

  it("순서·상태 변화 문항: 슬라이드 순서와 같은 보기가 정확히 하나, 보기끼리 겹치지 않는다", () => {
    /** 지문의 단계(라벨 → 문장)에서 슬라이드 순서대로 키워드를 찾아 라벨을 잇는다 */
    const steps = (id: string, re: RegExp) => new Map([...q(id).prompt.matchAll(re)].map((m) => [m[1], m[2]]));
    const orderOf = (labels: Map<string, string>, keys: string[], fmt: (ls: string[]) => string) =>
      fmt(keys.map((k) => [...labels].find(([, text]) => text.includes(k))![0]));
    const iv = steps("ch03-pattern-interrupt-001", /\[(\d)\] ([^[]+)/g);
    only("ch03-pattern-interrupt-001", orderOf(iv, ["벡터링", "문맥저장", "대기 큐에서 찾음", "전달", "ready 상태로", "scheduler()", "문맥 복구"], (ls) => ls.map((l) => `[${l}]`).join(" ")));
    const letters = (id: string) => steps(id, /^([A-F])\) (.+)$/gm);
    only("ch08-pattern-order-001", orderOf(letters("ch08-pattern-order-001"), ["TLB를 체크", "Page table을 참조", "TLB에 해당", "실주소를 만들어"], (ls) => ls.join("-")));
    only("ch08-pattern-order-002", orderOf(letters("ch08-pattern-order-002"), ["TLB를 체크", "Page table을 참조", "fault interrupt", "디스크에 페이지", "Disk interrupt", "다시 실행"], (ls) => ls.join("-")));
    // 상태 변화(Ch03 p.14·p.17, Ch08 p.5-6): 입력 대기 → 인터럽트로 ready → 실행 → time slice 소진 ready → 실행 → page fault blocked
    only("ch03-pattern-state-002", ["blocked", "ready", "running", "ready", "running", "blocked"].join(" -> "));
    only("ch08-pattern-order-003", ["running", "blocked", "ready", "running"].join(" -> "));
    for (const id of ORDER) expect(new Set(byId.get(id)!.choices).size, id).toBe(byId.get(id)!.choices.length);
  });

  it("docs/jokbo/os/pattern-analysis.md: 패턴표가 대표 족보 56개를 빠짐없이 한 번씩 묶고, 패턴마다 보통 1개 + 어려움 1~2개, 문항표 = 데이터(id·패턴·난이도·정답·검증)", () => {
    const doc = readFileSync(path.join(ROOT, "docs/jokbo/os/pattern-analysis.md"), "utf8").split(/\r?\n/);
    const cells = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const patternRows = doc.filter((l) => /^\| P\d+ \|/.test(l)).map(cells);
    const jokboOfPattern = new Map(patternRows.map((r) => [r[0], [...r[3].matchAll(/ch\d\d-jokbo-\d{3}/g)].map((m) => `os-${m[0]}`)]));
    const listed = [...jokboOfPattern.values()].flat();
    expect([...listed].sort()).toEqual(all.filter(isJokbo).map((x) => x.id).sort());
    expect(new Set(listed).size).toBe(listed.length);

    const rows = doc.filter((l) => /^\| \d+ \| `os-/.test(l)).map(cells);
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(pats.map((x) => x.id));
    const levels = new Map<string, number[]>();
    for (const [i, x] of pats.entries()) {
      const [, , pattern, level, , answer, check] = rows[i];
      expect(jokboOfPattern.get(pattern), `${x.id} ${pattern}`).toBeDefined();
      expect(x.basedOn!.some((b) => jokboOfPattern.get(pattern)!.includes(b)), x.id).toBe(true);
      expect(level, x.id).toBe(x.difficulty === 2 ? "보통" : "어려움");
      const id = x.id.slice(3);
      expect(answer, x.id).toBe(x.type === "multi" ? pickedMany(id).join(" / ") : picked(id).includes("```") ? "(그림)" : picked(id));
      expect(check, x.id).toBe(SIM.includes(x.id) ? "시뮬레이터" : ORDER.includes(x.id) ? "순서" : "개념");
      levels.set(pattern, [...(levels.get(pattern) ?? []), x.difficulty]);
    }
    expect([...levels.keys()].sort()).toEqual([...jokboOfPattern.keys()].sort());
    for (const [p, ds] of levels) {
      expect(ds.filter((d) => d === 2), p).toHaveLength(1);
      expect(ds.filter((d) => d === 3).length, p).toBeGreaterThanOrEqual(1);
      expect(ds.filter((d) => d === 3).length, p).toBeLessThanOrEqual(2);
    }
  });
});

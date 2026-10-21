import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { isJokbo, isJokboRelated, isJokboRelated2, matchesSource } from "@/lib/quiz/jokbo";
import { buddyBlocks, simulateBuddy } from "@/lib/sim/os/buddy";
import { batchUtilization, timeSharingUtilization } from "@/lib/sim/os/cpuTime";
import { logicalToPhysical, physicalToLogical } from "@/lib/sim/os/paging";
import { chooseHole, type Hole } from "@/lib/sim/os/placement";
import { clockReplace, simulateReplacement } from "@/lib/sim/os/replacement";
import { round2, runningAt, simulate, type Proc } from "@/lib/sim/os/scheduling";
import type { Question } from "@/types/question";
import os from "./index";
import { RELATED2, RELATED2_PROCS } from "./jokboRelated2";

// 족보관련2(jokboRelated2.ts): 개수·유형 구성, 바탕 족보, 분류(족보관련과 따로), 해설 형식, 계산·추적 정답 = lib/sim/os, 인정 답안 채점, 문서 = 데이터

const ROOT = path.resolve(import.meta.dirname, "../../..");
type Blank = Question & { text: string; blanks: { accept: string[] }[] };
const items = Object.values(RELATED2).flat();
const byId = new Map(items.map((q) => [q.id.replace(/^os-/, ""), q]));
/** 빈칸 i의 첫 번째 인정 답안 */
const ans = (id: string, i = 0) => (byId.get(id) as Blank).blanks[i].accept[0];
const procs = (rows: readonly (readonly [string, number, number])[]): Proc[] => rows.map(([name, arrival, service]) => ({ name, arrival, service }));

describe("OS 족보관련2", async () => {
  const all = (await Promise.all(os.chapters.map((c) => c.load()))).flat();
  const loaded = new Map(all.map((q) => [q.id, q]));

  it("40~50문항, 장마다 7~10문항, 객관식·단답형·순서·짝 짓기를 모두 5개 이상 섞는다", () => {
    expect(items.length).toBeGreaterThanOrEqual(40);
    expect(items.length).toBeLessThanOrEqual(50);
    for (const list of Object.values(RELATED2)) expect(list.length).toBeGreaterThanOrEqual(7);
    const n = (...types: string[]) => items.filter((q) => types.includes(q.type)).length;
    expect(n("mcq", "multi")).toBeGreaterThanOrEqual(5);
    expect(n("blank")).toBeGreaterThanOrEqual(5);
    expect(n("order")).toBeGreaterThanOrEqual(5);
    expect(n("match")).toBeGreaterThanOrEqual(5);
  });

  it("id·챕터·바탕 족보(첫 바탕은 같은 장)·생성 문항(origin 없음, ⭐ 없음)·난이도 2~3, 챕터 데이터에 실림", () => {
    for (const [chapter, list] of Object.entries(RELATED2)) {
      for (const q of list) {
        expect(q.id, q.id).toMatch(new RegExp(`^os-${chapter}-jr2-[a-z]+-\\d{3}$`));
        expect(q.chapter).toBe(chapter);
        expect(q.origin, q.id).toBeUndefined();
        expect(q.exam, q.id).toBe(false);
        expect([2, 3], q.id).toContain(q.difficulty);
        const bases = q.basedOn!.map((id) => loaded.get(id));
        expect(bases.every((b) => b && isJokbo(b)), q.id).toBe(true);
        expect(bases[0]!.chapter, q.id).toBe(chapter);
        expect(loaded.has(q.id), q.id).toBe(true);
      }
    }
    expect(new Set(items.map((q) => q.id)).size).toBe(items.length);
  });

  it("분류: 족보관련2만 고르면 이 문항들만, 기존 족보관련(55)과 겹치지 않는다", () => {
    expect(all.filter((q) => matchesSource(q, "related2")).map((q) => q.id)).toEqual(items.map((q) => q.id));
    expect(items.some(isJokboRelated)).toBe(false);
    expect(all.filter(isJokboRelated)).toHaveLength(55);
    expect(items.every(isJokboRelated2)).toBe(true);
  });

  it("해설 = 풀이 + 원문과 달라진 점 + 함정 + 근거 줄", () => {
    for (const q of items) expect(q.explanation, q.id).toMatch(/^풀이: [^\n]+ 원문과 달라진 점: [^\n]+ 함정: [^\n]+\n근거: Ch\d\d p\.\d[^\n]*$/);
  });

  it("단답형: 인정 답안은 모두 정답, 빈칸 수 = 표시 수", () => {
    for (const q of items.filter((x) => x.type === "blank") as Blank[]) {
      expect(q.text.match(/\{\{\d\}\}/g)?.length, q.id).toBe(q.blanks.length);
      const accepts = q.blanks.map((b) => b.accept);
      for (const [i, list] of accepts.entries())
        for (const a of list) expect(gradeQuestion(q, accepts.map((l, j) => (j === i ? a : l[0]))).correct, `${q.id}: ${a}`).toBe(true);
    }
  });

  it("Ch02 응답시간·유효 CPU 이용률 = scheduling(0.1초 단위)·cpuTime", () => {
    /** who가 out칸(0.1초 단위) 실행을 채운 시각 */
    const firstOutput = (algo: "rr" | "fcfs", names: string[], who: string, out: number, service: number) => {
      const r = simulate(algo, names.map((name) => ({ name, arrival: 0, service })), { quantum: 1 });
      let ran = 0;
      for (let t = 0; ; t++) if (runningAt(r, t) === who && ++ran === out) return round2((t + 1) / 10);
    };
    const abcd = ["A", "B", "C", "D"];
    expect(ans("ch02-jr2-response-001", 0)).toBe(String(firstOutput("rr", abcd, "D", 2, 100)));
    expect(ans("ch02-jr2-response-001", 1)).toBe(String(firstOutput("fcfs", abcd, "D", 2, 100)));
    expect(ans("ch02-jr2-utilization-001", 0)).toBe(batchUtilization({ n: 4, t: 1, s: 0.01 }).toFixed(2));
    expect(ans("ch02-jr2-utilization-001", 1)).toBe(timeSharingUtilization({ n: 4, t: 1, s: 0.01, q: 0.1 }).toFixed(2));
  });

  it("Ch07 배치·버디·주소 변환 = placement·buddy·paging", () => {
    const holes: Hole[] = [
      { start: 0, size: 30 },
      { start: 50, size: 12 },
      { start: 80, size: 45 },
      { start: 150, size: 16 },
      { start: 200, size: 60 },
    ];
    (["first", "best", "next", "worst"] as const).forEach((fit, i) => expect(ans("ch07-jr2-fit-001", i), fit).toBe("ABCDE"[chooseHole(holes, 14, fit, 60).index!]));

    const steps = simulateBuddy(1024, [
      { type: "request", name: "A", size: 100 },
      { type: "request", name: "B", size: 240 },
      { type: "request", name: "C", size: 64 },
      { type: "request", name: "D", size: 256 },
      { type: "release", name: "B" },
      { type: "release", name: "A" },
    ]);
    const a = steps[3].blocks.find((b) => b.name === "A")!;
    expect([ans("ch07-jr2-buddy-001", 0), ans("ch07-jr2-buddy-001", 1), ans("ch07-jr2-buddy-001", 2)]).toEqual([String(a.size), String(a.size - 100), String(steps[3].blocks.find((b) => b.name === "D")!.start)]);
    // 지문의 현재 상태 = D까지 할당한 결과
    expect(byId.get("ch07-jr2-buddy-002")!.prompt).toContain(steps[3].line);
    const freeAt = (k: number, start: number) => buddyBlocks(steps[k].state).find((b) => b.start === start && !b.name)!.size;
    expect([ans("ch07-jr2-buddy-002", 0), ans("ch07-jr2-buddy-002", 1)]).toEqual([String(freeAt(4, 256)), String(freeAt(5, 0))]);

    const table = [5, 2, 7, 0];
    const l2p = logicalToPhysical(table, 1024, 2100);
    expect(ans("ch07-jr2-address-001", 0)).toBe(String(l2p.physical));
    expect(ans("ch07-jr2-address-001", 1)).toBe(String(physicalToLogical(table, 1024, 2100)!.logical));
  });

  it("Ch08 교체·Clock = replacement", () => {
    const refs = [4, 1, 2, 4, 3, 1, 5, 4, 2, 1, 3, 5];
    expect(byId.get("ch08-jr2-replace-001")!.prompt).toContain(refs.join("  "));
    (["opt", "lru", "fifo"] as const).forEach((algo, i) => expect(ans("ch08-jr2-replace-001", i), algo).toBe(String(simulateReplacement(refs, 3, algo).faults)));
    const r = clockReplace({ pages: [6, 2, 9, 4], use: [1, 0, 1, 0], pointer: 2 }, 7);
    expect(ans("ch08-jr2-clock-001", 0)).toBe(String([6, 2, 9, 4][r.victim]));
    expect(ans("ch08-jr2-clock-001", 1)).toBe(String(r.buffer.pointer));
  });

  it("Ch09 SPN 순서·SRT·HRRN 응답 비율·RR = scheduling", () => {
    const p1 = procs(RELATED2_PROCS.P1);
    const p2 = procs(RELATED2_PROCS.P2);
    const spn = simulate("spn", p1);
    expect(ans("ch09-jr2-spn-001").replaceAll(" ", "")).toBe(spn.segments.map((s) => s.name).join(""));
    const srt = simulate("srt", p2);
    expect([ans("ch09-jr2-srt-001", 0), ans("ch09-jr2-srt-001", 1), ans("ch09-jr2-srt-001", 2)]).toEqual([String(srt.finish.A), String(srt.turnaround.C), String(srt.avgTurnaround)]);
    const at7 = simulate("hrrn", p1).decisions.find((d) => d.time === 7)!;
    const ratio = (n: string) => at7.candidates.find((c) => c.name === n)!.ratio.toFixed(2);
    expect([ans("ch09-jr2-hrrn-001", 0), ans("ch09-jr2-hrrn-001", 1), ans("ch09-jr2-hrrn-001", 2)]).toEqual([String(Number(ratio("C"))), String(Number(ratio("D"))), at7.chosen]);
    const rr = simulate("rr", p1, { quantum: 1 });
    expect([ans("ch09-jr2-rr-001", 0), ans("ch09-jr2-rr-001", 1)]).toEqual([String(rr.finish.B), String(rr.finish.C)]);
  });

  it("docs/jokbo/os/related2.md: 문항표 = 데이터(id·유형·바탕 족보), 장별 수 = 표", () => {
    const doc = readFileSync(path.join(ROOT, "docs/jokbo/os/related2.md"), "utf8").split(/\r?\n/);
    const cells = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const rows = doc.filter((l) => /^\| ch\d\d \| `os-ch\d\d-jr2-/.test(l)).map(cells);
    expect(rows.map((r) => r[1].replaceAll("`", ""))).toEqual(items.map((q) => q.id));
    expect(rows.map((r) => r[2])).toEqual(items.map((q) => q.type));
    expect(rows.map((r) => r[5])).toEqual(items.map((q) => q.basedOn!.map((b) => b.replace(/^os-/, "")).join(", ")));
    for (const [ch, list] of Object.entries(RELATED2)) expect(doc, ch).toContain(`| ${ch} | ${list.length} |`);
  });
});

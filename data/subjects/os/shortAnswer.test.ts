import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { batchFirstResponse, switchCount, timeSharingFirstResponse } from "@/lib/sim/os/cpuTime";
import { baseBounds } from "@/lib/sim/os/baseBounds";
import { buddyRequest, createBuddy, simulateBuddy } from "@/lib/sim/os/buddy";
import { invertedEntries, pageTableInfo } from "@/lib/sim/os/memoryCapacity";
import { bitSplit, logicalToPhysical, physicalToLogical, solveFrame } from "@/lib/sim/os/paging";
import { chooseHole } from "@/lib/sim/os/placement";
import { clockReplace, enhancedClockVictim, simulateReplacement } from "@/lib/sim/os/replacement";
import { exponentialAverage, responseRatio, simulate } from "@/lib/sim/os/scheduling";
import { segLogicalToPhysical, solveBase } from "@/lib/sim/os/segmentation";
import { workingSet } from "@/lib/sim/os/workingSet";
import type { Question } from "@/types/question";
import { HINT_ITEMS } from "./hints";
import os from "./index";
import { SHORT_ITEMS } from "./shortAnswer";

// 단답형 보강 문항(shortAnswer.ts): 인정 답안 채점·대표 오답, 계산형 정답 = lib/sim/os로 다시 계산, 형식(blank 1칸·해설 근거 줄), ⭐ 규칙

type Blank = Question & { text: string; blanks: { accept: string[] }[] };
const items = Object.values(SHORT_ITEMS).flat();
const byId = new Map(items.map((i) => [i.q.id.replace(/^os-/, ""), i]));
const answer = (id: string) => (byId.get(id)!.q as Blank).blanks[0].accept[0];

/** 계산형 정답을 문항 파일과 따로 시뮬레이터로 다시 계산한 값 */
const PROCS = [
  { name: "A", arrival: 0, service: 5 },
  { name: "B", arrival: 1, service: 2 },
  { name: "C", arrival: 3, service: 4 },
  { name: "D", arrival: 4, service: 1 },
  { name: "E", arrival: 6, service: 3 },
];
const REFS = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2];
const r2 = (x: number) => String(Math.round(x * 100) / 100);
const hrrn = simulate("hrrn", PROCS);
const hrrnAt5 = hrrn.decisions.find((d) => d.time === 5)!;
const buddy = simulateBuddy(1024, [
  { type: "request", name: "A", size: 70 },
  { type: "request", name: "B", size: 200 },
  { type: "request", name: "C", size: 60 },
  { type: "request", name: "D", size: 130 },
]);
const frag = buddyRequest(createBuddy(1024), "P", 300);
const holes = [
  { start: 10, size: 22 },
  { start: 40, size: 12 },
  { start: 60, size: 30 },
  { start: 100, size: 15 },
];
const SIM: Record<string, string> = {
  "ch02-short-001": r2(batchFirstResponse({ n: 8, t: 2, s: 0.02, output: 0.1 })),
  "ch02-short-002": r2(timeSharingFirstResponse({ n: 8, q: 0.1, s: 0.02, output: 0.1 })),
  "ch02-short-003": r2(batchFirstResponse({ n: 5, t: 3, s: 0.05, output: 0.2 })),
  "ch02-short-004": r2(timeSharingFirstResponse({ n: 5, q: 0.2, s: 0.05, output: 0.2 })),
  "ch02-short-005": String(switchCount({ n: 8, t: 2, q: 0.1 }, "timesharing")),
  "ch07-short-001": String(logicalToPhysical([3, 0, 4, 1], 2048, 4100).physical),
  "ch07-short-002": String(physicalToLogical([2, 5, 0, 3], 1024, 5130)!.logical),
  "ch07-short-003": String(solveFrame(3080, 6152, 1024)),
  "ch07-short-004": String(bitSplit(13000, 16, 2048).page),
  "ch07-short-005": String(bitSplit(13000, 16, 2048).pageBits),
  "ch07-short-006": String(segLogicalToPhysical([{ base: 3000, length: 600 }, { base: 1200, length: 900 }, { base: 5000, length: 300 }], 1024, 1100).physical),
  "ch07-short-007": String(solveBase(1300, 4372, 1024)),
  "ch07-short-008": String(baseBounds(24000, 5000, 4096).physical),
  "ch07-short-009": String(buddy.at(-1)!.blocks.find((b) => b.name === "D")!.start),
  "ch07-short-010": String(frag.ok ? frag.internalFragmentation : NaN),
  "ch07-short-011": "ABCD"[chooseHole(holes, 14, "best").index!],
  "ch07-short-012": "ABCD"[chooseHole(holes, 14, "next", 52).index!],
  "ch08-short-001": String(simulateReplacement(REFS, 3, "lru").faults),
  "ch08-short-002": String(simulateReplacement(REFS, 3, "fifo").faults),
  "ch08-short-003": String(simulateReplacement(REFS, 3, "opt").faults),
  "ch08-short-004": String(simulateReplacement(REFS, 3, "clock").faults),
  "ch08-short-005": String(clockReplace({ pages: [3, 7, 2, 9], use: [1, 0, 1, 1], pointer: 2 }, 5).victim),
  "ch08-short-006": String(workingSet([2, 6, 1, 5, 7, 7, 7, 7, 5, 1, 6, 2, 3, 4], 10, 5).size),
  "ch08-short-007": String(pageTableInfo(32, 8192, 4).tableBytes / 2 ** 20),
  "ch08-short-008": String(pageTableInfo(32, 4096, 8).pagesForTable),
  "ch08-short-009": String(invertedEntries(8 * 2 ** 30, 4096)),
  "ch08-short-010": String(
    enhancedClockVictim(
      [
        { page: 4, u: 1, m: 0 },
        { page: 6, u: 1, m: 1 },
        { page: 1, u: 0, m: 1 },
        { page: 8, u: 1, m: 0 },
      ],
      3,
    ).victim,
  ),
  "ch08-short-011": String(pageTableInfo(32, 8192, 4).offsetBits),
  "ch09-short-001": r2(simulate("fcfs", PROCS).avgTurnaround),
  "ch09-short-002": String(simulate("rr", PROCS, { quantum: 1 }).finish.C),
  "ch09-short-003": String(simulate("spn", PROCS).waiting.C),
  "ch09-short-004": String(simulate("srt", PROCS).turnaround.A),
  "ch09-short-005": hrrnAt5.chosen,
  "ch09-short-006": r2(responseRatio(6, 4)),
  "ch09-short-007": String(Math.round(exponentialAverage([6, 4, 8], 0.8, 10)[3] * 1000) / 1000),
  "ch09-short-008": r2(simulate("fcfs", PROCS).normalized.E),
  "ch09-short-009": String(simulate("feedback", PROCS, { feedback: "pow2" }).finish.B),
};

describe("OS 단답형 보강 문항", async () => {
  const loaded = new Map((await Promise.all(os.chapters.map((c) => c.load()))).flat().map((q) => [q.id, q]));

  it("장별 문항이 챕터에 실렸고 모두 blank 1칸·생성 문항이다(족보·족보관련 아님)", () => {
    expect(items.length).toBeGreaterThanOrEqual(70);
    expect(items.length).toBeLessThanOrEqual(80);
    for (const [chapter, list] of Object.entries(SHORT_ITEMS)) {
      list.forEach((it, i) => {
        const q = it.q as Blank;
        expect(q.id).toBe(`os-${chapter}-short-${String(i + 1).padStart(3, "0")}`);
        expect(q.chapter).toBe(chapter);
        expect(q.type).toBe("blank");
        expect(q.blanks).toHaveLength(1);
        expect(q.origin).toBeUndefined();
        expect(q.basedOn).toBeUndefined();
        expect([2, 3]).toContain(q.difficulty);
        expect(loaded.has(q.id), q.id).toBe(true);
      });
    }
  });

  it("인정 답안은 모두 정답, 대표 오답은 모두 오답으로 채점된다", () => {
    for (const { q, wrong } of items) {
      const b = q as Blank;
      for (const a of b.blanks[0].accept) expect(gradeQuestion(q, [a]).correct, `${q.id}: ${a}`).toBe(true);
      // 공백·대소문자 무시
      const first = b.blanks[0].accept[0];
      expect(gradeQuestion(q, [` ${first.toUpperCase()} `]).correct, q.id).toBe(true);
      expect(wrong.length, q.id).toBeGreaterThan(0);
      for (const w of wrong) {
        expect(b.blanks[0].accept.map(normalizeText), `${q.id}: 오답 ${w}가 인정 답안에 있음`).not.toContain(normalizeText(w));
        expect(gradeQuestion(q, [w]).correct, `${q.id}: ${w}`).toBe(false);
      }
    }
  });

  it("계산형 정답 = lib/sim/os로 다시 계산한 값(계산형 문항 전부)", () => {
    const calc = items.filter((i) => i.kind === "계산").map((i) => i.q.id.replace(/^os-/, ""));
    expect(Object.keys(SIM).sort()).toEqual(calc.sort());
    for (const [id, expected] of Object.entries(SIM)) expect(answer(id), id).toBe(expected);
  });

  it("해설 = 정답 이유 + 헷갈리기 쉬운 답 1줄 + 근거 줄(장·페이지)", () => {
    for (const { q } of items) {
      const [body, basis] = q.explanation.split("\n");
      expect(body, q.id).toContain("헷갈리기 쉬운 답:");
      expect(basis, q.id).toMatch(new RegExp(`^근거: Ch${q.chapter.slice(2)} p\\.\\d`));
    }
  });

  it("⭐ 규칙: 필기 출제 표시 쪽은 handwritten, 그 밖의 힌트 범위는 exam-hint(같은 장의 힌트 id), Ch09는 필기 ⭐ 소주제만", () => {
    // 각 chNN.ts 머리의 ⭐(handwritten) 쪽 목록. Ch09는 소주제 단위(ch09.test.ts)
    const HW: Record<string, number[]> = { ch02: [6, 22], ch03: [2, 4, 13, 21, 25, 39, 41], ch07: [16, 21, 23, 34], ch08: [5, 8, 23, 28, 29, 39, 47, 48, 49, 50, 61, 62] };
    const CH09_STAR = ["HRRN 응답 비율", "스케줄러 호출 시점", "스케줄링 기준(용어)", "시각별 스케줄링 추적"];
    const pages = (ref: string) =>
      [...ref.matchAll(/p\.(\d+)(?:-(\d+))?/g)].flatMap((m) => {
        const [a, b] = [Number(m[1]), Number(m[2] ?? m[1])];
        return Array.from({ length: b - a + 1 }, (_, i) => a + i);
      });
    const hintChapter = new Map(HINT_ITEMS.map((h) => [h.id, h.chapter]));
    for (const { q } of items) {
      const handwritten = q.chapter === "ch09" ? CH09_STAR.includes(q.topic) : pages(q.slideRef).some((p) => HW[q.chapter].includes(p));
      if (handwritten) expect([q.exam, q.examBasis], q.id).toEqual([true, "handwritten"]);
      else if (q.hintIds?.length) expect([q.exam, q.examBasis], q.id).toEqual([true, "exam-hint"]);
      else expect(q.exam, q.id).toBe(false);
      for (const h of q.hintIds ?? []) expect(hintChapter.get(h), `${q.id}: ${h}`).toBe(q.chapter);
    }
  });

  it("같은 장 안에서 정답이 같은 용어형 문항이 없다", () => {
    for (const list of Object.values(SHORT_ITEMS)) {
      const terms = list.filter((i) => i.kind !== "계산").map((i) => normalizeText((i.q as Blank).blanks[0].accept[0]));
      expect(new Set(terms).size).toBe(terms.length);
    }
  });
});

import { describe, expect, it } from "vitest";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { scheduleDisk } from "@/lib/sim/os/disk";
import type { Question } from "@/types/question";
import ch11 from "./ch11";

// Ch11 기말 문항 점검(docs/final/os-format.md): 족보 형식(보기 5개, 복수 선택은 "[두 개]"·정답 2개), ⭐ handwritten = 필기 "시험" 쪽,
// p.7(X 표시)·p.35(참고) 미출제, 순서 단답은 시뮬레이터 결과로 채점된다.

const HANDWRITTEN_PAGES = [4, 12, 16, 21, 22, 25, 36, 38, 42];
const pages = (ref: string) => {
  const out: number[] = [];
  for (const m of ref.replace(/^Ch11 p\./, "").matchAll(/(\d+)(?:-(\d+))?/g)) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let p = a; p <= b; p++) out.push(p);
  }
  return out;
};
const byId = (id: string) => ch11.find((q) => q.id === id) as Question;

describe("운영체제 Ch11 형식", () => {
  it("40문항, id 중복 없음, slideRef는 Ch11 p.N", () => {
    expect(ch11).toHaveLength(40);
    expect(new Set(ch11.map((q) => q.id)).size).toBe(40);
    for (const q of ch11) expect(q.slideRef, q.id).toMatch(/^Ch11 p\.\d/);
  });

  it("mcq·multi 보기 5개(서로 다름), multi는 '[두 개] 고르시오' + 정답 2개", () => {
    for (const q of ch11) {
      if (q.type !== "mcq" && q.type !== "multi") continue;
      expect(q.choices, q.id).toHaveLength(5);
      expect(new Set(q.choices).size, q.id).toBe(5);
      if (q.type === "multi") {
        expect(q.answerIndexes, q.id).toHaveLength(2);
        expect(q.prompt, q.id).toMatch(/\[두 개\] 고르시오\.$/);
      }
    }
  });

  it("p.7(X 표시)·p.35(참고)는 출제하지 않는다", () => {
    for (const q of ch11) expect(pages(q.slideRef).some((p) => p === 7 || p === 35), q.id).toBe(false);
  });

  it("⭐ handwritten ⇔ 근거 쪽에 필기 '시험' 표시가 있다(+summary, 해설에 '교수님 필기 기준')", () => {
    for (const q of ch11) {
      if (q.exam) {
        expect(q.examBasis, q.id).toBe("handwritten");
        expect(q.summary, q.id).toBeTruthy();
        expect(q.explanation, q.id).toContain("교수님 필기 기준");
        expect(pages(q.slideRef).some((p) => HANDWRITTEN_PAGES.includes(p)) || /p\.(4|12|16|21|22|25|36|38|42) \\?"/.test(q.explanation), q.id).toBe(true);
      } else expect(pages(q.slideRef).some((p) => [4, 16, 21, 25, 36, 38, 42].includes(p)), q.id).toBe(false);
    }
  });

  it("스케줄링 순서 단답: 시뮬레이터 순서(쉼표·공백 구분)는 정답, 다른 정책의 순서는 오답", () => {
    const sstf = scheduleDisk("sstf", 100, "up", [55, 58, 39, 18, 90, 160, 150, 38, 184]).order;
    const fifo = [55, 58, 39, 18, 90, 160, 150, 38, 184];
    const q = byId("os-ch11-sched-002");
    expect(gradeQuestion(q, [sstf.join(", ")]).score).toBe(1);
    expect(gradeQuestion(q, [sstf.join(" ")]).score).toBe(1);
    expect(gradeQuestion(q, [fifo.join(", ")]).score).toBe(0);
  });
});

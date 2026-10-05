import { describe, expect, it } from "vitest";
import type { ChapterMeta } from "@/lib/chapterMeta";
import { recordAttempt } from "@/lib/storage/records";
import { emptySubjectRecords, type SubjectRecords } from "@/lib/storage/schema";
import { chapterStats, generatedAttempts, statLine, subjectStats, sumLines } from "./stats";

const meta: ChapterMeta = {
  subjectId: "os",
  chapterId: "ch08",
  title: "Ch08",
  shortTitle: "가상 메모리",
  ids: ["a", "b", "c", "d"],
  starIds: ["a", "c"],
  types: [],
  rows: [
    { type: "mcq", topic: "TLB", exam: true },
    { type: "mcq", topic: "TLB", exam: false },
    { type: "ox", topic: "Clock", exam: true },
    { type: "ox", topic: "Clock", exam: false },
  ],
  topics: [
    { topic: "TLB", count: 2, star: true },
    { topic: "Clock", count: 2, star: true },
  ],
};

function play(steps: [string, number][]): SubjectRecords {
  let r = emptySubjectRecords();
  steps.forEach(([id, score], i) => {
    r = recordAttempt(r, id, { correct: score === 1, score }, `2026-10-05T00:00:0${i}.000Z`);
  });
  return r;
}

describe("대시보드 집계 — 수동 시나리오와 일치", () => {
  it("시나리오 1: 아무것도 안 풀었으면 진행 0, 정답률 없음", () => {
    expect(statLine(undefined, meta.ids, meta.starIds)).toEqual({
      total: 4, solved: 0, attempts: 0, correct: 0, rate: null, star: 2, starDone: 0, openWrong: 0,
    });
  });

  it("시나리오 2: 부분 점수는 정답이 아니고, ⭐ 달성은 마지막 풀이 기준", () => {
    // a: 틀림 → 맞음(⭐ 달성), b: 부분 0.5, c: 맞음 → 부분 0.5(⭐ 미달성), 생성 문제 1회 맞음
    const r = play([["a", 0], ["a", 1], ["b", 0.5], ["c", 1], ["c", 0.5], ["os-ch08-gen-replacement-1234567", 1]]);
    const { line, topics } = chapterStats(r, meta);
    expect(line).toMatchObject({ total: 4, solved: 3, attempts: 5, correct: 2, star: 2, starDone: 1, openWrong: 2 });
    expect(line.rate).toBeCloseTo(2 / 5);
    expect(topics[0]).toMatchObject({ topic: "TLB", solved: 2, attempts: 3, correct: 1, star: 1, starDone: 1, openWrong: 1 });
    expect(topics[1]).toMatchObject({ topic: "Clock", solved: 1, attempts: 2, correct: 1, star: 1, starDone: 0, openWrong: 1 });
    // 생성 문제는 챕터 수치에 섞이지 않고 따로 센다
    expect(generatedAttempts(r, new Set(meta.ids))).toEqual({ attempts: 1, correct: 1 });
  });

  it("시나리오 3: 과목·전체 합계는 챕터 합과 같고 정답률은 합친 횟수로 다시 계산", () => {
    const r = play([["a", 1], ["b", 0], ["d", 1]]);
    const subj = subjectStats(r, [meta]);
    expect(subj).toEqual(chapterStats(r, meta).line);
    const total = sumLines([subj, statLine(undefined, ["x"], [])]);
    expect(total).toMatchObject({ total: 5, solved: 3, attempts: 3, correct: 2, star: 2, starDone: 1 });
    expect(total.rate).toBeCloseTo(2 / 3);
  });
});

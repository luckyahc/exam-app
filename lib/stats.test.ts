import { describe, expect, it } from "vitest";
import type { ChapterMeta } from "@/lib/chapterMeta";
import { questionStatus } from "@/lib/quiz/status";
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
  starHwIds: ["a"],
  starHintIds: ["c"],
  jokboIds: [],
  exampleIds: [],
  types: [],
  rows: [
    { type: "mcq", topic: "TLB", exam: true, hw: true, hint: false, jokbo: false, example: false, difficulty: 1 },
    { type: "mcq", topic: "TLB", exam: false, hw: false, hint: false, jokbo: false, example: false, difficulty: 2 },
    { type: "ox", topic: "Clock", exam: true, hw: false, hint: true, jokbo: false, example: false, difficulty: 2 },
    { type: "ox", topic: "Clock", exam: false, hw: false, hint: false, jokbo: false, example: false, difficulty: 3 },
  ],
  difficulties: [
    { difficulty: 1, count: 1 },
    { difficulty: 2, count: 2 },
    { difficulty: 3, count: 1 },
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

describe("서술형(essay, 자기 채점) — 제출함 / 정답 수 미포함 / ⭐ 미포함 (심리학개론 2026-10-16)", () => {
  // e = ⭐ 서술형, m = ⭐ 객관식, n = 일반 객관식
  const pm: ChapterMeta = {
    ...meta,
    subjectId: "psychology",
    chapterId: "ch01",
    ids: ["e", "m", "n"],
    starIds: ["e", "m"],
    starHwIds: [],
    starHintIds: [],
    rows: [
      { type: "essay", topic: "표", exam: true, hw: false, hint: false, jokbo: false, example: false, difficulty: 2 },
      { type: "mcq", topic: "표", exam: true, hw: false, hint: false, jokbo: false, example: false, difficulty: 1 },
      { type: "mcq", topic: "연구", exam: false, hw: false, hint: false, jokbo: false, example: false, difficulty: 1 },
    ],
    topics: [
      { topic: "표", count: 2, star: true },
      { topic: "연구", count: 1, star: false },
    ],
  };
  const rec = () => {
    let r = recordAttempt(emptySubjectRecords(), "e", { correct: false, score: 0, selfCheck: true }, "2026-10-16T00:00:00.000Z");
    r = recordAttempt(r, "m", { correct: true, score: 1 }, "2026-10-16T00:00:01.000Z");
    return r;
  };

  it("풀이 상태는 '제출함'(맞힌 문제·틀린 문제가 아님)", () => {
    expect(questionStatus(rec(), "e")).toBe("submitted");
    expect(questionStatus(rec(), "m")).toBe("correct");
  });

  it("진도(푼 문제)에는 들어가고, 정답 수·풀이 횟수·오답에는 들어가지 않는다", () => {
    const { line } = chapterStats(rec(), pm);
    expect([line.total, line.solved, line.attempts, line.correct, line.rate, line.openWrong]).toEqual([3, 2, 1, 1, 1, 0]);
    expect(subjectStats(rec(), [pm]).solved).toBe(2);
  });

  it("⭐ 달성도는 서술형을 분모·분자 모두에서 뺀다(토픽별도 같음)", () => {
    const { line, topics } = chapterStats(rec(), pm);
    expect([line.star, line.starDone]).toEqual([1, 1]);
    expect(subjectStats(rec(), [pm])).toMatchObject({ star: 1, starDone: 1 });
    expect(topics.find((t) => t.topic === "표")).toMatchObject({ total: 2, solved: 2, star: 1, starDone: 1 });
  });
});

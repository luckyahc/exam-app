import { describe, expect, it } from "vitest";
import { questionStatus } from "@/lib/quiz/status";
import { newSession, summarizeSession } from "@/lib/quiz/session";
import { statLine } from "@/lib/stats";
import { recordAttempt, summarize } from "@/lib/storage/records";
import type { SubjectRecords } from "@/lib/storage/schema";
import { mergeStores, normalizeSubjectRecords } from "@/lib/storage/upgrade";
import { answerKey } from "./answerKey";
import type { BlankQ } from "./blank";
import type { EssayQ } from "./essay";
import { essayCore, sentenceCount } from "./essay";
import { QTYPE_FIXTURES } from "./fixtures";
import { gradeQuestion, type Question } from "./registry";

// 심리학개론(2026-10-16): 단답형 = blank 재사용(인정 답안 여러 개·공백·대소문자 무시), 서술형 = essay(자기 채점, 기록은 "풀었음"만)

const essay = QTYPE_FIXTURES.find((q) => q.type === "essay") as EssayQ;
const short: BlankQ = {
  id: "psychology-c01-demo-short-001",
  subject: "psychology",
  chapter: "c01",
  topic: "실험",
  type: "blank",
  exam: false,
  difficulty: 2,
  slideRef: "Ch01 p.24",
  prompt: "효과 없는 처치를 받았는데도 기대 때문에 나타나는 결과를 무엇이라 하는가?",
  text: "답: {{0}}",
  blanks: [{ accept: ["가짜약 효과", "위약 효과", "플라시보 효과", "placebo effect"] }],
  explanation: "가짜약 효과.",
};
const empty = (): SubjectRecords => ({ progress: {}, wrong: {}, bookmarks: [] });

describe("단답형(blank 재사용) 동의어 채점", () => {
  it.each(["가짜약 효과", "가짜약효과", " 위약  효과 ", "플라시보 효과", "Placebo Effect", "PLACEBO EFFECT"])("%s → 정답", (a) => {
    expect(gradeQuestion(short, [a]).correct).toBe(true);
  });
  it.each(["가짜약", "위약", "placebo", ""])("%s → 오답", (a) => {
    expect(gradeQuestion(short, [a]).correct).toBe(false);
  });
});

describe("서술형 essay (자기 채점)", () => {
  it("채점 결과는 selfCheck — 정답도 오답도 아니다(점수 0, correct false), 정답 키 = 모범답안", () => {
    const r = gradeQuestion(essay, "아무 답");
    expect(r).toEqual({ correct: false, score: 0, detail: null, selfCheck: true });
    expect(answerKey(essay)).toBe(essay.modelAnswer);
    expect(essayCore.isComplete(essay, "  ")).toBe(false);
    expect(essayCore.isComplete(essay, "답")).toBe(true);
  });

  it("검증: 모범답안 3~6문장, 채점 포인트 3~5개", () => {
    expect(essayCore.validate(essay)).toEqual([]);
    expect(sentenceCount("하나다. 둘이다. 셋이다.")).toBe(3);
    expect(essayCore.validate({ ...essay, modelAnswer: "짧다. 두 문장." })).toHaveLength(1);
    expect(essayCore.validate({ ...essay, keyPoints: ["a", "b"] })).toHaveLength(1);
  });

  it("기록: '풀었음'만 남고 오답노트에 들어가지 않으며, 정답률(summarize)에서 빠진다", () => {
    const r = gradeQuestion(essay, "답");
    let rec = recordAttempt(empty(), essay.id, r, "2026-10-16T00:00:00Z");
    rec = recordAttempt(rec, essay.id, r, "2026-10-16T00:01:00Z");
    rec = recordAttempt(rec, "psychology-c01-x-001", { correct: true, score: 1 }, "2026-10-16T00:02:00Z");
    rec = recordAttempt(rec, "psychology-c01-y-001", { correct: false, score: 0 }, "2026-10-16T00:03:00Z");
    expect(rec.progress[essay.id]).toEqual({ attempts: 2, correctCount: 0, lastScore: null, lastAt: "2026-10-16T00:01:00Z", selfCheck: true });
    expect(rec.wrong[essay.id]).toBeUndefined();
    expect(summarize(rec)).toEqual({ attempts: 2, correct: 1, rate: 0.5, openWrong: 1 });
  });

  it("통계: 진행률(푼 문제)에는 들어가고 정답률·오답 수에서는 빠지며, 풀이 상태는 '제출함'(⭐ 제외는 lib/stats.test.ts)", () => {
    const rec = recordAttempt(empty(), essay.id, gradeQuestion(essay, "답"), "2026-10-16T00:00:00Z");
    const line = statLine(rec, [essay.id, "psychology-c01-z-001"], []);
    expect([line.solved, line.attempts, line.correct, line.rate, line.openWrong]).toEqual([1, 0, 0, null, 0]);
    expect(questionStatus(rec, essay.id)).toBe("submitted");
  });

  it("세션 결과: 서술형은 정답/오답 집계(total·wrongIds·토픽별)에서 빠지고 selfCheckIds에 따로", () => {
    const qs = new Map<string, Question>([[essay.id, essay], [short.id, short]]);
    const s = newSession([essay, short], { mode: "instant", label: "t", backHref: "/", now: 0 });
    const done = { ...s, results: { [essay.id]: gradeQuestion(essay, "답"), [short.id]: gradeQuestion(short, ["위약 효과"]) } };
    const sum = summarizeSession(done, qs);
    expect([sum.total, sum.correct, sum.wrongIds, sum.selfCheckIds]).toEqual([1, 1, [], [essay.id]]);
    expect(sum.byTopic.map((t) => t.key)).toEqual(["실험"]);
  });

  it("백업 가져오기·병합에서도 selfCheck 표시가 유지된다", () => {
    const rec = recordAttempt(empty(), essay.id, gradeQuestion(essay, "답"), "2026-10-16T00:00:00Z");
    expect(normalizeSubjectRecords(JSON.parse(JSON.stringify(rec))).progress[essay.id].selfCheck).toBe(true);
    const merged = mergeStores({ settings: {}, subjects: { psychology: rec } }, { settings: {}, subjects: { psychology: rec } });
    expect(merged.subjects.psychology.progress[essay.id].selfCheck).toBe(true);
  });
});

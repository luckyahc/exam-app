import { describe, expect, it } from "vitest";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import type { Question } from "@/lib/qtypes/registry";
import { filterQuestions, newSession, summarizeSession } from "./session";

const qs = QTYPE_FIXTURES as readonly Question[];

describe("filterQuestions", () => {
  it("유형·⭐·토픽 필터를 모두 만족하는 문제만", () => {
    const types = ["mcq", "ox"] as const;
    const out = filterQuestions(qs, { types, seed: "x" });
    expect(out.every((q) => (types as readonly string[]).includes(q.type))).toBe(true);
    expect(filterQuestions(qs, { starOnly: true, seed: "x" }).every((q) => q.exam)).toBe(true);
    const topic = qs[0].topic;
    expect(filterQuestions(qs, { topics: [topic], seed: "x" }).every((q) => q.topic === topic)).toBe(true);
  });
  it("난이도 필터: 고른 난이도만, 비우면 전체", () => {
    for (const ds of [[1], [3], [1, 2]]) {
      const out = filterQuestions(qs, { difficulties: ds, seed: "x" });
      expect(out.every((q) => ds.includes(q.difficulty))).toBe(true);
      expect(out).toHaveLength(qs.filter((q) => ds.includes(q.difficulty)).length);
    }
    expect(filterQuestions(qs, { difficulties: [], seed: "x" })).toHaveLength(qs.length);
  });
  it("문제 수 제한과 섞기(같은 seed면 같은 순서, 원본은 바꾸지 않음)", () => {
    expect(filterQuestions(qs, { count: 3, seed: "x" })).toHaveLength(3);
    const a = filterQuestions(qs, { shuffle: true, seed: "s1" }).map((q) => q.id);
    const b = filterQuestions(qs, { shuffle: true, seed: "s1" }).map((q) => q.id);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(qs.map((q) => q.id).sort());
    expect(filterQuestions(qs, { seed: "x" }).map((q) => q.id)).toEqual(qs.map((q) => q.id));
  });
});

describe("newSession / summarizeSession", () => {
  it("즉시 채점 모드는 타이머가 없고, 시험 모드는 마감 시각을 정한다", () => {
    expect(newSession(qs, { mode: "instant", timerSec: 600, label: "", backHref: "/", now: 1000 })).toMatchObject({ timerSec: null, deadline: null });
    expect(newSession(qs, { mode: "exam", timerSec: 600, label: "", backHref: "/", now: 1000 })).toMatchObject({ timerSec: 600, deadline: 601000 });
  });

  it("완전히 맞은 문제만 정답, 부분 점수는 틀린 문제에 포함, 미응답 집계", () => {
    const s = newSession(qs.slice(0, 4), { mode: "instant", label: "", backHref: "/", now: 1 });
    const [a, b, c] = s.items;
    s.results[a.id] = { correct: true, score: 1, detail: null };
    s.results[b.id] = { correct: false, score: 0.5, detail: null };
    s.results[c.id] = { correct: false, score: 0, detail: null };
    const map = new Map(qs.map((q) => [q.id, q]));
    const sum = summarizeSession(s, map);
    expect(sum).toMatchObject({ total: 4, correct: 1, unanswered: 1 });
    expect(sum.wrongIds).toEqual([b.id, c.id, s.items[3].id]);
    expect(sum.partialIds).toEqual([b.id]);
    expect(sum.byType.reduce((n, t) => n + t.total, 0)).toBe(4);
    expect(sum.bySubject.reduce((n, t) => n + t.correct, 0)).toBe(1);
  });
});

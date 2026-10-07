import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import type { Question } from "@/lib/qtypes/registry";
import { emptySubjectRecords, type SubjectRecords } from "@/lib/storage/schema";
import { listRows, revealAnswer, sessionFromList, tabCounts, visibleRows } from "./questionList";
import { filterQuestions } from "./session";
import { questionStatus } from "./status";

const at = "2026-10-07T00:00:00.000Z";
const rec = (over: Partial<SubjectRecords> = {}): SubjectRecords => ({ ...emptySubjectRecords(), ...over });
const prog = (lastScore: number | null, attempts = 1, correctCount = lastScore === 1 ? 1 : 0) => ({ attempts, correctCount, lastScore, lastAt: at });

describe("풀이 상태 분류(lib/quiz/status.ts)", () => {
  it("기록 없음 = 안 푼 문제, 마지막이 완전히 맞음 = 맞힌 문제, 마지막이 오답(부분 점수 포함) = 틀린 문제", () => {
    const r = rec({ progress: { a: prog(1, 2, 1), b: prog(0), c: prog(0.5, 3, 2) } });
    expect(questionStatus(r, "none")).toBe("unsolved");
    expect(questionStatus(undefined, "a")).toBe("unsolved");
    expect(questionStatus(r, "a")).toBe("correct");
    expect(questionStatus(r, "b")).toBe("wrong");
    expect(questionStatus(r, "c")).toBe("wrong"); // 예전에 맞혔어도 마지막이 부분 점수면 틀림
  });

  it("시험 모드에서 답하지 않은 문제는 기록되지 않으므로 안 푼 문제", () => {
    // 시험 모드 채점은 답한 문제만 recordResult — 미응답은 progress에 없다
    expect(questionStatus(rec({ progress: { answered: prog(1) } }), "skipped")).toBe("unsolved");
  });

  it("마지막 점수가 없는 옛 기록: 오답노트 미해결이면 틀림, 아니면 정답 횟수로", () => {
    const r = rec({
      progress: { x: prog(null, 2, 1), y: prog(null, 1, 1), z: prog(null, 1, 0) },
      wrong: { x: { wrongCount: 1, attempts: 2, lastWrongAt: at, resolved: false } },
    });
    expect(questionStatus(r, "x")).toBe("wrong");
    expect(questionStatus(r, "y")).toBe("correct");
    expect(questionStatus(r, "z")).toBe("wrong");
  });
});

describe("문제 목록 필터·탭", () => {
  const qs = QTYPE_FIXTURES as readonly Question[];
  const [q0, q1, q2, q3] = qs;
  const r = rec({ progress: { [q0.id]: prog(1), [q1.id]: prog(0) }, bookmarks: [q2.id, q0.id] });
  const rows = listRows(qs, r);

  it("탭 개수: 전체 = 안 푼 + 맞힌 + 틀린, 북마크는 따로", () => {
    const c = tabCounts(rows, {});
    expect(c.all).toBe(qs.length);
    expect(c.unsolved + c.correct + c.wrong).toBe(c.all);
    expect([c.correct, c.wrong, c.bookmark]).toEqual([1, 1, 2]);
  });

  it("탭 × 챕터·유형·⭐·토픽 조합", () => {
    expect(visibleRows(rows, "correct", {}).map((x) => x.q.id)).toEqual([q0.id]);
    expect(visibleRows(rows, "bookmark", {}).map((x) => x.q.id)).toEqual([q0.id, q2.id]);
    expect(visibleRows(rows, "all", { type: q3.type }).every((x) => x.q.type === q3.type)).toBe(true);
    expect(visibleRows(rows, "unsolved", { type: q0.type }).some((x) => x.q.id === q0.id)).toBe(false);
    expect(visibleRows(rows, "all", { star: "all" }).every((x) => x.q.exam)).toBe(true);
    expect(visibleRows(rows, "all", { topic: q1.topic, chapter: q1.chapter }).every((x) => x.q.topic === q1.topic && x.q.chapter === q1.chapter)).toBe(true);
    expect(visibleRows(rows, "wrong", { chapter: "없는 챕터" })).toEqual([]);
  });

  it("퀴즈 필터(filterQuestions)의 풀이 상태·id 조건", () => {
    const statusOf = (id: string) => questionStatus(r, id);
    expect(filterQuestions(qs, { seed: "s", statuses: ["wrong"], statusOf }).map((q) => q.id)).toEqual([q1.id]);
    expect(filterQuestions(qs, { seed: "s", statuses: ["unsolved"], statusOf }).length).toBe(qs.length - 2);
    expect(filterQuestions(qs, { seed: "s", ids: [q3.id, q1.id] }).map((q) => q.id)).toEqual([q1.id, q3.id]);
  });

  it("이 목록으로 풀기: 목록과 같은 문제로 시작(섞지 않으면 같은 순서, 문제 수 옵션, 섞으면 같은 문제 집합)", () => {
    const list = visibleRows(rows, "unsolved", {});
    const ids = list.map((x) => x.q.id);
    const s = sessionFromList(list, { shuffle: false, count: null, label: "t", backHref: "/", seed: "x", now: 1 });
    expect(s.items.map((i) => i.id)).toEqual(ids);
    expect(sessionFromList(list, { shuffle: false, count: 3, label: "t", backHref: "/", seed: "x", now: 1 }).items.map((i) => i.id)).toEqual(ids.slice(0, 3));
    const sh = sessionFromList(list, { shuffle: true, count: null, label: "t", backHref: "/", seed: "x", now: 1 });
    expect([...sh.items.map((i) => i.id)].sort()).toEqual([...ids].sort());
    expect(s.mode).toBe("instant");
  });
});

describe("정답·해설 보기는 기록을 바꾸지 않는다", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("정답 키로 채점한 결과를 보여 주지만 저장소·기록 상태는 그대로", async () => {
    const data = new Map<string, string>();
    const storage = {
      get length() {
        return data.size;
      },
      key: (i: number) => [...data.keys()][i] ?? null,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, String(v)),
      removeItem: (k: string) => void data.delete(k),
      clear: () => data.clear(),
    };
    vi.stubGlobal("window", { addEventListener() {}, removeEventListener() {}, localStorage: storage });
    vi.resetModules();
    const store = await import("@/lib/storage/recordsStore");
    const q = QTYPE_FIXTURES[0] as Question;
    store.recordResult(q.subject, "other-id", { correct: false, score: 0 });
    const before = JSON.stringify([...data.entries()]);
    const snapshot = JSON.stringify(store.currentStore());

    const { result } = revealAnswer(q);
    expect(result.correct).toBe(true);
    const { RevealPanel } = await import("@/components/questions/QuestionList");
    const html = renderToStaticMarkup(createElement(RevealPanel, { q }));
    expect(html.length).toBeGreaterThan(0);

    expect(JSON.stringify([...data.entries()])).toBe(before);
    expect(JSON.stringify(store.currentStore())).toBe(snapshot);
    expect(store.currentStore().subjects[q.subject]?.progress[q.id]).toBeUndefined();
  });
});

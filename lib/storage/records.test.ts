import { describe, expect, it } from "vitest";
import { recordAttempt, summarize } from "./records";
import { emptySubjectRecords } from "./schema";

const Q = "os-ch03-demo-multi-001";

describe("recordAttempt — 완전히 맞았을 때만 정답으로 기록", () => {
  it("부분 점수(67%)는 오답으로 세고, 점수는 lastScore에만 저장", () => {
    const r = recordAttempt(
      emptySubjectRecords(),
      Q,
      { correct: false, score: 2 / 3 },
      "2026-10-04T10:00",
    );
    expect(r.progress[Q]).toEqual({
      attempts: 1,
      correctCount: 0,
      lastScore: 2 / 3,
      lastAt: "2026-10-04T10:00",
    });
    expect(r.wrong[Q]).toEqual({
      wrongCount: 1,
      attempts: 1,
      lastWrongAt: "2026-10-04T10:00",
      resolved: false,
    });
  });

  it("완전히 맞으면 정답 수가 늘고 오답노트에 쌓이지 않는다", () => {
    const r = recordAttempt(emptySubjectRecords(), Q, { correct: true, score: 1 }, "t1");
    expect(r.progress[Q]).toMatchObject({ attempts: 1, correctCount: 1, lastScore: 1 });
    expect(r.wrong[Q]).toBeUndefined();
  });

  it("틀렸다가 나중에 완전히 맞히면 오답노트는 해결 처리(기록은 남김)", () => {
    let r = emptySubjectRecords();
    r = recordAttempt(r, Q, { correct: false, score: 0.5 }, "t1");
    r = recordAttempt(r, Q, { correct: false, score: 0.8 }, "t2");
    r = recordAttempt(r, Q, { correct: true, score: 1 }, "t3");
    expect(r.wrong[Q]).toEqual({ wrongCount: 2, attempts: 3, lastWrongAt: "t2", resolved: true });
    expect(r.progress[Q]).toEqual({ attempts: 3, correctCount: 1, lastScore: 1, lastAt: "t3" });
  });

  it("해결 후 다시 틀리면 오답노트가 다시 열린다", () => {
    let r = recordAttempt(emptySubjectRecords(), Q, { correct: false, score: 0 }, "t1");
    r = recordAttempt(r, Q, { correct: true, score: 1 }, "t2");
    r = recordAttempt(r, Q, { correct: false, score: 0.9 }, "t3");
    expect(r.wrong[Q]).toMatchObject({ wrongCount: 2, resolved: false, lastWrongAt: "t3" });
  });

  it("생성기 문제는 재생성 정보를 오답노트에 남긴다", () => {
    const gen = { name: "replacement", params: { frames: 3 }, seed: 7 };
    const r = recordAttempt(
      emptySubjectRecords(),
      "os-ch08-gen-replacement-7",
      { correct: false, score: 0.5 },
      "t",
      gen,
    );
    expect(r.wrong["os-ch08-gen-replacement-7"].gen).toEqual(gen);
  });

  it("입력 기록을 바꾸지 않는다(불변)", () => {
    const before = emptySubjectRecords();
    recordAttempt(before, Q, { correct: false, score: 0.5 }, "t");
    expect(before).toEqual(emptySubjectRecords());
  });
});

describe("summarize — 정답률은 완전히 맞음 기준", () => {
  it("부분 점수는 정답률에 반영하지 않는다", () => {
    let r = emptySubjectRecords();
    r = recordAttempt(r, "a", { correct: false, score: 0.9 }, "t"); // 90%여도 오답
    r = recordAttempt(r, "b", { correct: true, score: 1 }, "t");
    r = recordAttempt(r, "c", { correct: false, score: 0.5 }, "t");
    r = recordAttempt(r, "d", { correct: true, score: 1 }, "t");
    expect(summarize(r)).toEqual({ attempts: 4, correct: 2, rate: 0.5, openWrong: 2 });
  });

  it("문제 목록으로 범위를 좁힐 수 있고, 풀이가 없으면 정답률 null", () => {
    let r = recordAttempt(emptySubjectRecords(), "a", { correct: true, score: 1 }, "t");
    r = recordAttempt(r, "b", { correct: false, score: 0.5 }, "t");
    expect(summarize(r, ["a"])).toEqual({ attempts: 1, correct: 1, rate: 1, openWrong: 0 });
    expect(summarize(emptySubjectRecords())).toEqual({
      attempts: 0,
      correct: 0,
      rate: null,
      openWrong: 0,
    });
  });
});

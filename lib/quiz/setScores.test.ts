import { describe, expect, it } from "vitest";
import { HINT1 } from "@/data/subjects/data-comm/hintExams";
import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion } from "@/lib/qtypes/registry";
import { addSetScore, parseSetScores, setScoreOf } from "./setScores";
import { newSession, summarizeSession } from "./session";

const qs = new Map(HINT1.map((q) => [q.id, q]));
const start = (source: "hint1" | "jokbo" | null = "hint1") =>
  newSession(HINT1, { mode: "exam", source, label: "DC 전체 · 힌트관련1", backHref: "/s/data-comm", now: 0 });
/** 앞의 n문제는 정답, 나머지는 오답(보기·값을 비워 둔 답)으로 채점한 세션 */
function graded(correct: number, answered = HINT1.length, source: "hint1" | "jokbo" | null = "hint1") {
  const s = start(source);
  const results = Object.fromEntries(
    HINT1.slice(0, answered).map((q, i) => {
      const r = gradeQuestion(q, answerKey(q));
      return [q.id, i < correct ? r : { ...r, correct: false, score: 0 }];
    }),
  );
  return { ...s, results, finished: true };
}

describe("힌트관련 회차 점수", () => {
  it("세션에 분류(source)가 남는다", () => {
    expect(start().source).toBe("hint1");
    expect("source" in start(null)).toBe(false);
  });

  it("끝까지 다 푼 힌트관련 세션만 기록한다: 맞힌 수/전체", () => {
    const s = graded(18);
    const rec = setScoreOf(s, summarizeSession(s, qs), new Date(1000));
    expect(rec).toEqual({ source: "hint1", score: { at: new Date(1000).toISOString(), correct: 18, total: 25, session: s.id } });
  });

  it("미응답이 남았거나(중간에 그만둠·시간 종료) 힌트관련이 아니면 기록하지 않는다", () => {
    const partial = graded(10, 24);
    expect(setScoreOf(partial, summarizeSession(partial, qs))).toBeNull();
    const other = graded(25, 25, "jokbo");
    expect(setScoreOf(other, summarizeSession(other, qs))).toBeNull();
  });

  it("회차는 쌓이고(3번 풀면 3개), 같은 세션은 한 번만 들어간다", () => {
    const sc = (session: string, correct: number) => ({ at: "2026-10-22T00:00:00.000Z", correct, total: 25, session });
    let scores = addSetScore({}, "hint1", sc("a", 15));
    scores = addSetScore(scores, "hint1", sc("b", 19));
    scores = addSetScore(scores, "hint1", sc("c", 22));
    expect(addSetScore(scores, "hint1", sc("c", 22))).toBe(scores);
    expect(scores.hint1?.map((x) => `${x.correct}/${x.total}`)).toEqual(["15/25", "19/25", "22/25"]);
  });

  it("저장소 값 읽기: 형식이 틀린 항목·힌트관련이 아닌 분류는 버린다", () => {
    const ok = { at: "2026-10-22T00:00:00.000Z", correct: 20, total: 25, session: "x" };
    expect(parseSetScores({ hint2: [ok, { ...ok, correct: 30 }, null], jokbo: [ok], hint3: "x" })).toEqual({ hint2: [ok] });
    expect(parseSetScores(null)).toEqual({});
  });
});

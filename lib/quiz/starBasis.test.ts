import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data/subjects/registry";
import { statLine } from "@/lib/stats";
import { emptySubjectRecords } from "@/lib/storage/schema";
import type { Question } from "@/lib/qtypes/registry";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";
import { listRows, visibleRows } from "./questionList";
import { filterQuestions } from "./session";
import { hasStarChoice, matchesStar, parseStar } from "./starBasis";

const base = QTYPE_FIXTURES[0] as Question;
const mk = (id: string, over: Partial<Question>) => ({ ...base, id, ...over }) as Question;
const plain = mk("p", { exam: false, examBasis: undefined, hintIds: undefined });
const hw = mk("hw", { exam: true, examBasis: "handwritten", hintIds: undefined });
const both = mk("both", { exam: true, examBasis: "handwritten", hintIds: ["3-4"] });
const hint = mk("hint", { exam: true, examBasis: "exam-hint", hintIds: ["8-5"] });
const printed = mk("pr", { exam: true, examBasis: "printed-emphasis", hintIds: undefined });
const qs = [plain, hw, both, hint, printed];

describe("⭐ 근거별 선택(lib/quiz/starBasis.ts)", () => {
  it("전체 ⭐ / 교수님 필기만(examBasis handwritten) / 시험 힌트만(hintIds 있음) — 필기+힌트 문항은 양쪽에", () => {
    const ids = (b: "all" | "handwritten" | "hint") => qs.filter((q) => matchesStar(q, b)).map((q) => q.id);
    expect(ids("all")).toEqual(["hw", "both", "hint", "pr"]);
    expect(ids("handwritten")).toEqual(["hw", "both"]);
    expect(ids("hint")).toEqual(["both", "hint"]);
  });

  it("퀴즈 주소 star: 1(예전 링크) = 전체, handwritten·hint, 없으면 null", () => {
    expect(parseStar("1")).toBe("all");
    expect(parseStar("handwritten")).toBe("handwritten");
    expect(parseStar("hint")).toBe("hint");
    expect(parseStar(null)).toBeNull();
  });

  it("퀴즈 필터와 문제 목록 필터가 같은 기준", () => {
    expect(filterQuestions(qs, { seed: "s", starOnly: true }).map((q) => q.id)).toEqual(["hw", "both", "hint", "pr"]);
    expect(filterQuestions(qs, { seed: "s", starOnly: true, starBasis: "hint" }).map((q) => q.id)).toEqual(["both", "hint"]);
    const rows = listRows(qs, emptySubjectRecords());
    expect(visibleRows(rows, "all", { star: "handwritten" }).map((r) => r.q.id)).toEqual(["hw", "both"]);
    expect(visibleRows(rows, "all", { star: null }).length).toBe(qs.length);
  });

  it("선택지는 근거가 둘인 과목만: OS는 보이고, 데이터 통신(인쇄 강조만)·데이터과학(⭐ 없음)은 숨긴다", async () => {
    const load = async (id: string) => (await Promise.all(SUBJECTS.find((s) => s.id === id)!.chapters.map((c) => c.load()))).flat();
    expect(hasStarChoice(await load("os"))).toBe(true);
    expect(hasStarChoice(await load("data-comm"))).toBe(false);
    expect(hasStarChoice(await load("data-science"))).toBe(false);
    expect(hasStarChoice([hw, printed])).toBe(false);
  }, 60_000);

  it("통계: 근거별 ⭐ 달성도(마지막 풀이가 완전히 맞은 문제)", () => {
    const rec = {
      ...emptySubjectRecords(),
      progress: {
        hw: { attempts: 1, correctCount: 1, lastScore: 1, lastAt: null },
        both: { attempts: 2, correctCount: 1, lastScore: 0, lastAt: null },
        hint: { attempts: 1, correctCount: 1, lastScore: 1, lastAt: null },
      },
    };
    const line = statLine(rec, qs.map((q) => q.id), ["hw", "both", "hint"], { hw: ["hw", "both"], hint: ["both", "hint"] });
    expect([line.star, line.starDone]).toEqual([3, 2]);
    expect(line.starBy).toEqual({ hw: 2, hwDone: 1, hint: 2, hintDone: 1 });
    expect(statLine(rec, ["hw"], ["hw"]).starBy).toBeUndefined();
  });
});

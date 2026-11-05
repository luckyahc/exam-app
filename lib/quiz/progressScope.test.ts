import { describe, expect, it } from "vitest";
import type { ChapterMeta } from "@/lib/chapterMeta";
import { parseSettings } from "@/lib/settings/appSettings";
import { subjectStats } from "@/lib/stats";
import type { SubjectRecords } from "@/lib/storage/schema";
import { examIds, scopeChapters } from "./progressScope";

const row = (topic: string, exam = false) => ({ type: "mcq", topic, exam, difficulty: 1 }) as unknown as ChapterMeta["rows"][number];

const chapter = (id: string, exam: ChapterMeta["exam"], ids: string[], also: string[] = []) =>
  ({
    subjectId: "s",
    chapterId: id,
    exam,
    title: id,
    shortTitle: id,
    ids,
    rows: ids.map((q) => row(also.includes(q) ? "겹침" : "보통")),
    starIds: [],
    starHwIds: [],
    starHintIds: [],
    topics: [
      ...(ids.some((q) => also.includes(q)) ? [{ topic: "겹침", count: also.length, star: false }] : []),
      ...(ids.some((q) => !also.includes(q)) ? [{ topic: "보통", count: ids.length - also.length, star: false }] : []),
    ],
    also: also.map((q) => ({ id: q, exams: ["2-2-final"], star: false, jokbo: false, related: false })),
  }) as unknown as ChapterMeta;

const mid = chapter("mid", "2-2-mid", ["m1", "m2", "m3"], ["m3"]);
const fin = chapter("fin", "2-2-final", ["f1", "f2"]);
const rec = (solved: string[]): SubjectRecords => ({
  progress: Object.fromEntries(solved.map((id) => [id, { attempts: 1, correctCount: 1, lastScore: 1 }])),
  wrong: {},
  bookmarks: [],
}) as unknown as SubjectRecords;

describe("진행상황 범위", () => {
  it("기말 범위 = 기말 챕터 + 중간 챕터의 alsoExam 문항", () => {
    expect(examIds([mid, fin], "2-2-final")).toEqual(["m3", "f1", "f2"]);
    expect(examIds([mid, fin], "2-2-mid")).toEqual(["m1", "m2", "m3"]);
  });

  it("기말은 중간 기록을 세지 않고, 전체는 모두 센다(기록은 그대로)", () => {
    const r = rec(["m1", "m2", "m3", "f1"]);
    const final = subjectStats(r, scopeChapters([mid, fin], "final"));
    expect([final.solved, final.total]).toEqual([2, 3]); // m3(alsoExam)·f1
    const all = subjectStats(r, scopeChapters([mid, fin], "all"));
    expect([all.solved, all.total]).toEqual([4, 5]);
    expect(Object.keys(r.progress)).toHaveLength(4);
  });

  it("줄인 챕터는 ids·rows·토픽이 함께 줄어 통계 토픽 계산이 어긋나지 않는다", () => {
    const [m] = scopeChapters([mid], "final");
    expect(m.ids).toEqual(["m3"]);
    expect(m.rows).toHaveLength(1);
    expect(m.topics).toEqual([{ topic: "겹침", count: 1, star: false }]);
    expect(scopeChapters([chapter("old", "2-2-mid", ["a"])], "final")).toEqual([]);
  });

  it("설정 기본값은 기말, 저장한 값만 전체", () => {
    expect(parseSettings({}).progressScope).toBe("final");
    expect(parseSettings({ progressScope: "x" }).progressScope).toBe("final");
    expect(parseSettings({ progressScope: "all" }).progressScope).toBe("all");
  });
});

import { describe, expect, it } from "vitest";
import { chapterMeta } from "@/lib/chapterMeta";
import { isJokbo, isJokboRelated } from "@/lib/quiz/jokbo";
import { filterQuestions } from "@/lib/quiz/session";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import algorithm from "./index";

// alsoExam(2026-11-03): 중간 dp 챕터의 플로이드·벨만-포드 족보(강의 자료 9 p.63-99에도 있는 주제)와 그 족보관련 모의 문항은
// 원래 챕터에 그대로 두고 기말(2-2-final) 과목 퀴즈·족보만 풀기·족보관련만 풀기에도 나온다.
const JOKBO = [10, 11, 12, 13, 14, 15].map((n) => `algorithm-dp-jokbo-0${n}`);
const RELATED = ["algorithm-dp-mock1-025", "algorithm-dp-mock1-026", "algorithm-dp-mock2-025", "algorithm-dp-mock2-026", "algorithm-dp-mock2-028"];

describe("alsoExam — 기말에도 보이는 중간 범위 문항", () => {
  it("alsoExam이 붙은 문항 = 플로이드·벨만-포드 족보 6 + 족보관련 5, 토픽은 최단 경로만", async () => {
    const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
    const tagged = all.filter((q) => q.alsoExam?.includes("2-2-final"));
    expect(tagged.map((q) => q.id).sort()).toEqual([...JOKBO, ...RELATED].sort());
    for (const q of tagged) {
      expect(q.chapter, q.id).toBe("dp");
      expect(["모든 쌍 최단 경로", "간선 수 제한 거리 DP", "단일 시작점 최단 경로"], q.id).toContain(q.topic);
    }
  });

  it("기말 과목 퀴즈 풀(loadSubject)과 족보·족보관련 필터에 들어가고, 중간 풀에도 그대로 있다", async () => {
    const fin = await loadSubject("algorithm", "2-2-final");
    const mid = await loadSubject("algorithm", "2-2-mid");
    for (const id of [...JOKBO, ...RELATED]) {
      expect(fin.some((q) => q.id === id), id).toBe(true);
      expect(mid.some((q) => q.id === id), id).toBe(true);
    }
    const jokbo = filterQuestions(fin, { source: "jokbo", seed: "a" }).map((q) => q.id);
    expect(jokbo.filter((id) => id.includes("-dp-")).sort()).toEqual(JOKBO);
    expect(jokbo.filter((id) => !id.includes("-dp-"))).toHaveLength(10); // greedy 2 + graph 8
    const related = filterQuestions(fin, { source: "related", seed: "a" }).map((q) => q.id);
    expect(related.sort()).toEqual(RELATED.sort());
  });

  it("챕터 메타 also = 화면 개수 근거(기말 족보 10 + 6, 족보관련 0 + 5)", async () => {
    const metas = await Promise.all(algorithm.chapters.map((c) => chapterMeta(algorithm, c)));
    const also = metas.filter((m) => m.exam !== "2-2-final").flatMap((m) => m.also.filter((a) => a.exams.includes("2-2-final")));
    const own = metas.filter((m) => m.exam === "2-2-final");
    expect(own.reduce((n, m) => n + m.jokboIds.length, 0) + also.filter((a) => a.jokbo).length).toBe(16);
    expect(own.reduce((n, m) => n + m.relatedIds.length, 0) + also.filter((a) => a.related).length).toBe(5);
    const all = (await Promise.all(algorithm.chapters.map((c) => c.load()))).flat();
    for (const a of also) expect(isJokbo(all.find((q) => q.id === a.id)!) || isJokboRelated(all.find((q) => q.id === a.id)!), a.id).toBe(true);
  });
});

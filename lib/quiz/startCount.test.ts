import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/qtypes/registry";
import { filterFromParams, startCount, startLabel } from "./params";
import { filterQuestions } from "./session";
import { defaultPrefs, toParams } from "./startPrefs";
import { DEFAULT_SETTINGS } from "@/lib/settings/appSettings";

// 문제 고르기(직접 고르기) 버튼 숫자 = 실제로 시작되는 문제 수
const qs = (n: number, topic = "t") =>
  Array.from({ length: n }, (_, i) => ({ id: `q-${topic}-${i}`, type: "ox", topic, difficulty: 1, exam: false })) as unknown as Question[];
const statusOf = () => "unsolved" as const;
const params = (count: number, topics: string[] = []) =>
  toParams("s", "c", { ...defaultPrefs(DEFAULT_SETTINGS), count, topics, shuffle: false });
/** /quiz(QuizEntry)가 고르는 수 */
const started = (pool: Question[], p: URLSearchParams) =>
  filterQuestions(pool, { ...filterFromParams(p, statusOf).filter, seed: "x" }).length;

describe("문제 고르기 시작 버튼", () => {
  it("지정 수가 조건에 맞는 문제보다 적으면 지정 수, 많으면 실제 개수", () => {
    const pool = [...qs(13, "a"), ...qs(40, "b")];
    expect(startCount(pool, params(20, ["a"]), statusOf)).toBe(13);
    expect(startLabel(startCount(pool, params(20, ["a"]), statusOf))).toBe("조건에 맞는 문제 13개 풀기");
    expect(startCount(pool, params(10, ["a"]), statusOf)).toBe(10);
    expect(startCount(pool, params(20), statusOf)).toBe(20);
    expect(startCount(pool, params(0), statusOf)).toBe(53); // 전체
  });

  it("버튼 숫자와 실제로 시작되는 문제 수가 같다", () => {
    const pool = [...qs(13, "a"), ...qs(40, "b")];
    for (const p of [params(10), params(20), params(30), params(0), params(20, ["a"]), params(10, ["a"])]) {
      expect(startCount(pool, p, statusOf)).toBe(started(pool, p));
    }
  });

  it("조건에 맞는 문제가 없으면 시작할 수 없다는 문구", () => {
    expect(startCount(qs(3), params(20, ["없는 토픽"]), statusOf)).toBe(0);
    expect(startLabel(0)).toBe("조건에 맞는 문제 없음");
  });
});

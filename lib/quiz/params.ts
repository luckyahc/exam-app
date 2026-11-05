import { isQType } from "@/lib/qtypes/registry";
import type { Question } from "@/lib/qtypes/registry";
import { parseSource } from "./jokbo";
import { filterQuestions, type QuizFilter } from "./session";
import { parseStar } from "./starBasis";
import { isStatus, type QStatus } from "./status";

/**
 * 퀴즈 주소 쿼리(/quiz?types=…&status=…&star=…) → 문제 고르기 조건.
 * /quiz(QuizEntry)가 실제로 문제를 고를 때와 챕터 화면이 "조건에 맞는 문제 N개"를 셀 때 같은 함수를 쓴다 —
 * 두 곳의 개수가 어긋나지 않게(따로 흉내 내지 않는다). seed는 호출하는 쪽이 넣는다.
 */
export function filterFromParams(params: URLSearchParams, statusOf: (id: string) => QStatus) {
  const starBasis = parseStar(params.get("star"));
  const source = parseSource(params.get("source"));
  const statuses = (params.get("status") ?? "").split(",").filter(isStatus);
  const filter: Omit<QuizFilter, "seed"> = {
    types: (params.get("types") ?? "").split(",").filter(isQType),
    starOnly: !!starBasis,
    starBasis: starBasis ?? undefined,
    source,
    topics: (params.get("topics") ?? "").split("|").filter(Boolean),
    difficulties: (params.get("diff") ?? "")
      .split(",")
      .map(Number)
      .filter((d) => d === 1 || d === 2 || d === 3),
    count: Number(params.get("count")) || null,
    statuses,
    statusOf,
    shuffle: params.get("shuffle") === "1",
  };
  return { filter, starBasis, source, statuses };
}

/**
 * 이 쿼리로 /quiz를 시작하면 실제로 풀게 될 문제 수 — /quiz가 고를 때와 같은 함수로 센다(문제 수 제한 포함).
 * 조건에 맞는 문제가 지정 수보다 적으면 실제 개수가 된다(지정 20, 해당 13 → 13).
 */
export function startCount(pool: readonly Question[], params: URLSearchParams, statusOf: (id: string) => QStatus): number {
  return filterQuestions(pool, { ...filterFromParams(params, statusOf).filter, shuffle: false, seed: "" }).length;
}

/** 직접 고르기 바텀시트의 시작 버튼 문구 */
export const startLabel = (n: number) => (n === 0 ? "조건에 맞는 문제 없음" : `조건에 맞는 문제 ${n}개 풀기`);

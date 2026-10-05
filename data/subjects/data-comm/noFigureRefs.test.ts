import { describe, expect, it } from "vitest";
import dataComm from "@/data/subjects/data-comm";
import type { Question } from "@/types/question";

/**
 * 앱 화면에는 graph 유형의 보기 그림 말고는 슬라이드 그림이 나오지 않는다.
 * 그래서 문제 문장·보기·항목은 "그림에서", "s.N의 그림"처럼 화면에 없는 그림·슬라이드를 가리키면 안 된다
 * (해설은 근거라 슬라이드 번호·그림을 적어도 된다). graph 문제는 보기 그림이 화면에 있으므로 "그림"은 허용, 슬라이드 번호는 금지.
 */

function shownTexts(q: Question): string[] {
  const t: string[] = [q.prompt];
  const any = q as {
    text?: string;
    choices?: string[];
    items?: (string | { label: string })[];
    pairs?: { left: string; right: string }[];
    distractors?: string[];
    buckets?: string[];
    columns?: string[];
    rows?: { label: string }[];
  };
  if (any.text) t.push(any.text);
  t.push(...(any.choices ?? []), ...(any.distractors ?? []), ...(any.buckets ?? []), ...(any.columns ?? []));
  t.push(...(any.items ?? []).map((x) => (typeof x === "string" ? x : x.label)));
  t.push(...(any.pairs ?? []).flatMap((p) => [p.left, p.right]));
  t.push(...(any.rows ?? []).map((r) => r.label));
  return t;
}

describe("데이터 통신 — 문제 화면이 없는 그림·슬라이드를 가리키지 않는다", async () => {
  const all = (await Promise.all(dataComm.chapters.map((c) => c.load()))).flat();
  it.each(all.map((q) => [q.id, q] as const))("%s", (_, q) => {
    for (const text of shownTexts(q)) {
      expect(text, "슬라이드 번호").not.toMatch(/\bs\.\s?\d/);
      expect(text, "슬라이드").not.toMatch(/슬라이드\s*(그림|\d)/);
      if (q.type !== "graph") expect(text, "그림").not.toMatch(/그림/);
    }
  });
});

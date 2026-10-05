import { describe, expect, it } from "vitest";
import type { Question } from "@/types/question";
import { SUBJECTS } from "./registry";

/**
 * 콘텐츠 형식 점검(Sprint 11) — 전 과목·전 챕터. 내용 판단이 필요한 것(중복 후보·짧은 해설)은 docs/progress/sprint-11.md에 보고만 하고,
 * 여기서는 기계적으로 확정되는 형식만 검사한다.
 */

function shownTexts(q: Question): [string, string][] {
  const a = q as {
    text?: string;
    choices?: string[];
    distractors?: string[];
    buckets?: string[];
    columns?: string[];
    items?: (string | { label: string })[];
    pairs?: { left: string; right: string }[];
    falseReason?: string;
  };
  const t: [string, string][] = [
    ["prompt", q.prompt],
    ["explanation", q.explanation],
  ];
  if (q.summary) t.push(["summary", q.summary]);
  if (a.text) t.push(["text", a.text]);
  if (a.falseReason) t.push(["falseReason", a.falseReason]);
  for (const x of [...(a.choices ?? []), ...(a.distractors ?? []), ...(a.buckets ?? []), ...(a.columns ?? [])]) t.push(["보기", x]);
  for (const x of a.items ?? []) t.push(["items", typeof x === "string" ? x : x.label]);
  for (const p of a.pairs ?? []) t.push(["pairs", p.left], ["pairs", p.right]);
  return t;
}

describe("콘텐츠 형식 점검 (전 과목)", async () => {
  const all: Question[] = [];
  for (const s of SUBJECTS) for (const c of s.chapters) all.push(...(await c.load()));

  it("모든 문항에 해설(10자 이상)과 slideRef('Ch0N p.N' 또는 'Ch0N s.N' 형식)가 있다", () => {
    const bad = all.filter((q) => !(q.explanation?.trim().length >= 10) || !/^Ch0\d (p|s)\.\d+([-,·]\s?(p\.)?\d+)*$/.test(q.slideRef ?? ""));
    expect(bad.map((q) => `${q.id}: ${q.slideRef}`)).toEqual([]);
  });

  it("⭐ 문항은 모두 핵심 한 줄 요약(summary)이 있다(120자 이하)", () => {
    const bad = all.filter((q) => q.exam && !(q.summary && q.summary.trim().length > 0 && q.summary.length <= 120));
    expect(bad.map((q) => q.id)).toEqual([]);
  });

  it("마크다운 짝(** · `)이 맞고, 앞뒤 공백·이중 공백이 없다", () => {
    const bad: string[] = [];
    for (const q of all)
      for (const [k, t] of shownTexts(q)) {
        if ((t.match(/\*\*/g) ?? []).length % 2) bad.push(`${q.id} ${k}: ** 짝`);
        if ((t.match(/`/g) ?? []).length % 2) bad.push(`${q.id} ${k}: \` 짝`);
        if (/^\s|\s$/.test(t)) bad.push(`${q.id} ${k}: 앞뒤 공백`);
        if (/\S {2,}\S/.test(t)) bad.push(`${q.id} ${k}: 이중 공백`);
      }
    expect(bad).toEqual([]);
  });

  it("섞이는 mcq·multi(shuffle: false 아님)는 보기·해설이 다른 보기의 위치·번호를 가리키지 않는다", () => {
    const choiceRef = /위의 보기|위 보기|앞의 (두|세) (가지|보기)|보기 모두|모두 옳|모두 맞|모두 틀|정답 없|해당 없|^없음$|[①-⑤]\s*[,·과와]|[1-5]번 보기|이상 모두|나머지 보기/;
    const explRef = /(첫|두|세|네|다섯|마지막|맨 앞|맨 뒤)\s*(번째\s*)?(보기|선지)|나머지 (두|세) 보기|보기\s*[1-5①-⑤]|[1-5]번\s*보기/;
    const bad: string[] = [];
    for (const q of all) {
      if ((q.type !== "mcq" && q.type !== "multi") || q.shuffle === false) continue;
      for (const c of q.choices) if (choiceRef.test(c)) bad.push(`${q.id} 보기: ${c}`);
      if (explRef.test(q.explanation)) bad.push(`${q.id} 해설`);
    }
    expect(bad).toEqual([]);
  });
});

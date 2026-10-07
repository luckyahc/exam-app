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
  // 실행 결과를 고르는 보기(verify output — 데이터과학, Sprint 15)는 프로그램 출력 그대로라(print 구분 공백 두 칸 등) "출력" 칸으로 따로 둔다
  const outputChoices = q.verify?.mode === "run" && q.verify.check?.kind === "output";
  for (const x of a.choices ?? []) t.push([outputChoices ? "출력" : "보기", x]);
  for (const x of [...(a.distractors ?? []), ...(a.buckets ?? []), ...(a.columns ?? [])]) t.push(["보기", x]);
  for (const x of a.items ?? []) t.push(["items", typeof x === "string" ? x : x.label]);
  for (const p of a.pairs ?? []) t.push(["pairs", p.left], ["pairs", p.right]);
  return t;
}

/**
 * 과목별 slideRef 형식. OS·데이터 통신: 'Ch08 p.48', 'Ch02 s.38'(범위·나열 'p.43-50', 's.28·s.29').
 * 데이터과학(결정 2, 2026-10-06): 인쇄된 슬라이드 번호 'Lec2 s.25', 번호 없는 쪽은 PDF 쪽 'Lec2 p.46'.
 */
export function slideRefOk(subject: string, ref: string): boolean {
  if (subject === "data-science") return /^Lec[1-6] (s|p)\.\d+([-,·~]\s?((s|p)\.)?\d+)*$/.test(ref);
  return /^Ch0\d (p|s)\.\d+([-,·]\s?(p\.)?\d+)*$/.test(ref);
}

describe("slideRef 형식 규칙", () => {
  it("데이터과학은 'Lec2 s.25' / 'Lec2 p.46', 기존 과목은 'Ch08 p.48' / 'Ch02 s.38'", () => {
    for (const ok of ["Lec2 s.25", "Lec2 p.46", "Lec5 s.43-45", "Lec2 p.41-43", "Lec6 s.24·s.25"]) expect(slideRefOk("data-science", ok), ok).toBe(true);
    for (const bad of ["Ch02 s.25", "Lec7 s.1", "lec2 s.25", "Lec2 25", "Lec2 s.25 "]) expect(slideRefOk("data-science", bad), bad).toBe(false);
    for (const ok of ["Ch08 p.48", "Ch02 s.38", "Ch08 p.43-50"]) expect(slideRefOk("os", ok), ok).toBe(true);
    expect(slideRefOk("os", "Lec2 s.25")).toBe(false);
  });
});

describe("콘텐츠 형식 점검 (전 과목)", async () => {
  const all: Question[] = [];
  for (const s of SUBJECTS) for (const c of s.chapters) all.push(...(await c.load()));

  it("모든 문항에 해설(10자 이상)과 과목별 형식의 slideRef가 있다", () => {
    const bad = all.filter((q) => !(q.explanation?.trim().length >= 10) || !slideRefOk(q.subject, q.slideRef ?? ""));
    expect(bad.map((q) => `${q.id}: ${q.slideRef}`)).toEqual([]);
  });

  // 시험 힌트 범위로 ⭐가 된 문항(examBasis exam-hint)은 요약을 강제하지 않는다 — 힌트 항목 이름이 그 역할을 한다(docs/os-exam-hint.md)
  it("⭐ 문항(필기·인쇄 강조 근거)은 모두 핵심 한 줄 요약(summary)이 있다(120자 이하)", () => {
    const bad = all.filter((q) => q.exam && q.examBasis !== "exam-hint" && !(q.summary && q.summary.trim().length > 0 && q.summary.length <= 120));
    const long = all.filter((q) => q.summary && q.summary.length > 120);
    expect(long.map((q) => q.id)).toEqual([]);
    expect(bad.map((q) => q.id)).toEqual([]);
  });

  it("마크다운 짝(** · `)이 맞고, 앞뒤 공백·이중 공백이 없다", () => {
    const bad: string[] = [];
    for (const q of all)
      for (const [k, raw] of shownTexts(q)) {
        // ```python / ```sql 펜스 코드 블록 안은 코드 그대로(들여쓰기·두 칸 공백 허용)라 형식 검사에서 뺀다(Sprint 12)
        const t = raw.replace(/```(python|sql)\n[\s\S]*?\n```/g, "```code```");
        // 인라인 코드(`**` 거듭제곱 연산자 등) 안의 **는 굵게 표시가 아니다(RichText도 코드로 그린다)
        if ((t.replace(/`[^`]+`/g, "``").match(/\*\*/g) ?? []).length % 2) bad.push(`${q.id} ${k}: ** 짝`);
        if ((t.match(/`/g) ?? []).length % 2) bad.push(`${q.id} ${k}: \` 짝`);
        if (/^\s|\s$/.test(t)) bad.push(`${q.id} ${k}: 앞뒤 공백`);
        // 검증된 실행 결과 보기는 출력 그대로(두 칸 공백 허용)
        if (k !== "출력" && /\S {2,}\S/.test(t)) bad.push(`${q.id} ${k}: 이중 공백`);
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

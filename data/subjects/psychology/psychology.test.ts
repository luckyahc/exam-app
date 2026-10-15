import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import type { Question } from "@/types/question";
import psychology from "./index";
import { TABLE_TOPICS, TERMS } from "./terms";

// 심리학개론 1~3장(docs/psychology/plan.md): 문항 수·유형 비율, 선택형 안의 성격 순서, 표 6개 각 3문항, 용어 커버리지(docs/psychology/coverage.md),
// 해설 세 부분, ⭐ 근거. 커버리지 문서를 다시 만들려면 UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology

const ROOT = path.resolve(import.meta.dirname, "../../..");
const SELECT = new Set(["mcq", "multi", "ox", "match", "order"]);
const kind = (q: Question) => q.id.split("-")[2];
type Any = Question & {
  choices?: string[];
  items?: string[];
  pairs?: { left: string; right: string }[];
  distractors?: string[];
  blanks?: { accept: string[] }[];
  modelAnswer?: string;
  keyPoints?: string[];
};
/** 용어를 찾는 글: 문제·보기·순서 항목·짝·단답 인정 답안·모범답안·채점 포인트(해설은 빼고) */
const shown = (q: Any) =>
  normalizeText(
    [q.prompt, ...(q.choices ?? []), ...(q.items ?? []), ...(q.pairs ?? []).flatMap((p) => [p.left, p.right]), ...(q.distractors ?? []), ...(q.blanks ?? []).flatMap((b) => b.accept), q.modelAnswer ?? "", ...(q.keyPoints ?? [])].join("\n"),
  );

describe("심리학개론 1~3장", async () => {
  const byCh = Object.fromEntries(await Promise.all(psychology.chapters.map(async (c) => [c.id, (await c.load()) as Question[]] as const)));
  const all = Object.values(byCh).flat();

  it("장별 문항 수 35 · 45 · 40, 유형 비율 선택형 55% · 단답형 25% · 서술형 20%", () => {
    expect(Object.fromEntries(Object.entries(byCh).map(([k, v]) => [k, v.length]))).toEqual({ ch01: 35, ch02: 45, ch03: 40 });
    for (const qs of Object.values(byCh)) {
      const n = qs.length;
      const sel = qs.filter((q) => SELECT.has(q.type)).length;
      const shortN = qs.filter((q) => q.type === "blank").length;
      const essay = qs.filter((q) => q.type === "essay").length;
      expect(sel + shortN + essay).toBe(n);
      expect(Math.abs(sel / n - 0.55)).toBeLessThan(0.03);
      expect(Math.abs(shortN / n - 0.25)).toBeLessThan(0.03);
      expect(Math.abs(essay / n - 0.2)).toBeLessThan(0.03);
    }
  });

  it("id의 성격 표시 = 유형(case·compare·define·order는 선택형, short는 blank, essay는 essay), 선택형은 사례 > 비교 > 정의 > 순서", () => {
    for (const q of all) {
      const k = kind(q);
      if (k === "short") expect(q.type, q.id).toBe("blank");
      else if (k === "essay") expect(q.type, q.id).toBe("essay");
      else expect(SELECT.has(q.type) && ["case", "compare", "define", "order"].includes(k), q.id).toBe(true);
      if (k === "order") expect(["order", "mcq"]).toContain(q.type);
    }
    for (const qs of Object.values(byCh)) {
      const c = (k: string) => qs.filter((q) => kind(q) === k).length;
      expect(c("case")).toBeGreaterThan(c("compare"));
      expect(c("compare")).toBeGreaterThan(c("define"));
      expect(c("define")).toBeGreaterThan(c("order"));
      expect(c("order")).toBeGreaterThan(0);
    }
  });

  it("표·그림 6개는 각각 3문항 이상, 유형 2가지 이상(선택형·단답형·서술형 섞어서)", () => {
    for (const t of TABLE_TOPICS) {
      const qs = all.filter((q) => q.topic === t);
      expect(qs.length, t).toBeGreaterThanOrEqual(3);
      const groups = new Set(qs.map((q) => (SELECT.has(q.type) ? "select" : q.type)));
      expect(groups.size, t).toBeGreaterThanOrEqual(2);
    }
  });

  it("단답형은 한 칸('답: {{0}}') + 인정 답안, 서술형은 채점 포인트 3~5개", () => {
    for (const q of all as Any[]) {
      if (q.type === "blank") {
        expect((q as { text: string }).text, q.id).toBe("답: {{0}}");
        expect(q.blanks!.length).toBe(1);
      }
      if (q.type === "essay") expect(q.keyPoints!.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("해설 = 정답 이유 + 오답이 틀린 이유 + 같은 장의 관련 개념(맥락 연결) + 끝에 근거 한 줄('(보충)'은 문장마다 붙이지 않는다)", () => {
    const bad = all.filter((q) => !/^정답: [^\n]+ 오답: [^\n]+ 연결: [^\n]+\n근거: 교재 [^\n]+$/.test(q.explanation) || q.explanation.includes("(보충)"));
    expect(bad.map((q) => q.id)).toEqual([]);
  });

  it("⭐(printed-emphasis) = 표·그림 문항은 모두 ⭐, ⭐ 근거는 printed-emphasis만", () => {
    for (const q of all) {
      if (q.exam) expect(q.examBasis, q.id).toBe("printed-emphasis");
      if ((TABLE_TOPICS as readonly string[]).includes(q.topic)) expect(q.exam, q.id).toBe(true);
    }
  });

  it("기억해야 할 용어는 장별로 빠짐없이 문제·보기에 1회 이상 — docs/psychology/coverage.md와 같다", () => {
    const rows: string[] = [];
    const missing: string[] = [];
    for (const [ch, groups] of Object.entries(TERMS)) {
      const qs = byCh[ch] as Any[];
      const texts = qs.map((q) => [q.id, shown(q)] as const);
      for (const [group, terms] of Object.entries(groups))
        for (const term of terms) {
          const hits = texts.filter(([, t]) => t.includes(normalizeText(term))).map(([id]) => id.replace(/^psychology-/, ""));
          if (!hits.length) missing.push(`${ch} ${term}`);
          rows.push(`| ${ch} | ${group} | ${term} | ${hits.length} | ${hits.slice(0, 4).join(", ")}${hits.length > 4 ? " …" : ""} |`);
        }
    }
    expect(missing).toEqual([]);
    const supplement = all.filter((q) => /\n근거: .*보충/.test(q.explanation)).length;
    const doc = [
      "# 용어 커버리지 — 심리학개론 1~3장",
      "",
      "원천자료의 \"기억해야 할 용어\"(교재 표기)가 문제·보기·순서 항목·짝·단답 인정 답안·모범답안·채점 포인트에 나온 문항. 해설만 언급한 것은 세지 않는다.",
      "이 문서는 `data/subjects/psychology/psychology.test.ts`가 문항 데이터와 같은지 검사한다(다시 만들기: `UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology`).",
      "",
      "## 요약",
      "",
      "| 항목 | 수 |",
      "|---|---|",
      `| 용어 | ${rows.length} |`,
      `| 누락 | ${missing.length} |`,
      `| 전체 문항 | ${all.length} |`,
      `| 근거에 보충(표준 정의)이 들어간 문항 | ${supplement} |`,
      "",
      "## 용어별",
      "",
      "| 장 | 용어 박스 | 용어 | 문항 수 | 문항(앞 4개, id 앞의 psychology- 생략) |",
      "|---|---|---|---|---|",
      ...rows,
      "",
    ].join("\n");
    const file = path.join(ROOT, "docs/psychology/coverage.md");
    if (process.env.UPDATE_PSY_COVERAGE) writeFileSync(file, doc);
    expect(readFileSync(file, "utf8").replace(/\r\n/g, "\n")).toBe(doc);
  });
});

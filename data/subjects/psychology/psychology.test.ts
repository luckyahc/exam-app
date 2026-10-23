import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { chapterMeta } from "@/lib/chapterMeta";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import { loadQuestions } from "@/lib/quiz/loadQuestions";
import { chapterStats, generatedAttempts, subjectStats } from "@/lib/stats";
import { recordAttempt, summarize } from "@/lib/storage/records";
import { emptySubjectRecords } from "@/lib/storage/schema";
import type { Question } from "@/types/question";
import psychology from "./index";
import { type ChapterKey, SOURCE } from "./terms";

// 심리학개론 CHAPTER 01~08(docs/psychology/plan.md, 2026-10-23 재작성 — 원천자료 요약 노트 PDF, 용어는 교재 판 docs/psychology/term-map.md):
// 문항 수·유형 비율, 객관식 안의 성격 순서, 표마다 2문항, 소제목·굵은 용어·학자 커버리지(docs/psychology/coverage.md), 해설 형식, ⭐ 근거, 옛 문항 id 기록 무시.
// 커버리지 문서를 다시 만들려면 UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology

const ROOT = path.resolve(import.meta.dirname, "../../..");
const SELECT = new Set(["mcq", "multi", "ox", "match", "order"]);
const COUNTS: Record<ChapterKey, number> = { c01: 26, c02: 28, c03: 22, c04: 22, c05: 24, c06: 28, c07: 26, c08: 24 };
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
const short = (id: string) => id.replace(/^psychology-/, "");
const list = (ids: string[], n = 4) => `${ids.slice(0, n).join(", ")}${ids.length > n ? " …" : ""}`;

describe("심리학개론 CHAPTER 01~08 (요약 노트 PDF)", async () => {
  const byCh = Object.fromEntries(await Promise.all(psychology.chapters.map(async (c) => [c.id, (await c.load()) as Question[]] as const))) as Record<ChapterKey, Question[]>;
  const all = Object.values(byCh).flat();
  const chs = Object.keys(SOURCE) as ChapterKey[];

  it("단원 8개 = PDF 목차 순서(c01~c08), 장별 문항 수 26·28·22·22·24·28·26·24 = 약 200", () => {
    expect(psychology.chapters.map((c) => c.id)).toEqual(chs);
    expect(Object.fromEntries(chs.map((ch) => [ch, byCh[ch].length]))).toEqual(COUNTS);
    expect(all.length).toBe(200);
    for (const c of psychology.chapters) expect(c.minQuestions).toBe(COUNTS[c.id as ChapterKey]);
  });

  it("유형 비율 객관식 50% · 단답형 30% · 서술형 20%(장마다 ±3%p, 전체 100·60·40)", () => {
    for (const ch of chs) {
      const qs = byCh[ch];
      const n = qs.length;
      const sel = qs.filter((q) => SELECT.has(q.type)).length;
      const shortN = qs.filter((q) => q.type === "blank").length;
      const essay = qs.filter((q) => q.type === "essay").length;
      expect(sel + shortN + essay, ch).toBe(n);
      expect(sel / n, ch).toBe(0.5);
      expect(Math.abs(shortN / n - 0.3), ch).toBeLessThan(0.03);
      expect(Math.abs(essay / n - 0.2), ch).toBeLessThan(0.03);
    }
    expect([all.filter((q) => SELECT.has(q.type)).length, all.filter((q) => q.type === "blank").length, all.filter((q) => q.type === "essay").length]).toEqual([100, 60, 40]);
  });

  it("id = psychology-c0N-{case|compare|link|order|short|essay}-NNN, 객관식은 사례 > 비교 > 학자·이론·실험 연결 > 순서", () => {
    for (const q of all) {
      expect(q.id, q.id).toMatch(/^psychology-c0[1-8]-(case|compare|link|order|short|essay)-\d{3}$/);
      const k = kind(q);
      if (k === "short") expect(q.type, q.id).toBe("blank");
      else if (k === "essay") expect(q.type, q.id).toBe("essay");
      else expect(SELECT.has(q.type), q.id).toBe(true);
    }
    for (const ch of chs) {
      const c = (k: string) => byCh[ch].filter((q) => kind(q) === k).length;
      expect(c("case"), ch).toBeGreaterThan(c("compare"));
      expect(c("compare"), ch).toBeGreaterThan(c("link"));
      expect(c("link"), ch).toBeGreaterThan(c("order"));
      expect(c("order"), ch).toBeGreaterThan(0);
    }
  });

  it("topic = PDF ■ 소제목(교재 판 표기), 소제목마다 1문항 이상", () => {
    for (const ch of chs) {
      const heads = SOURCE[ch].headings;
      for (const q of byCh[ch]) expect(heads, q.id).toContain(q.topic);
      for (const h of heads) expect(byCh[ch].some((q) => q.topic === h), `${ch} ${h}`).toBe(true);
    }
  });

  it("PDF 비교표마다 2문항 이상, 표 문항은 모두 ⭐ / ⭐ 근거는 printed-emphasis / 단답형은 모두 ⭐(굵은 용어·표)", () => {
    for (const ch of chs)
      for (const t of SOURCE[ch].tables) expect(byCh[ch].filter((q) => q.topic === t).length, `${ch} ${t}`).toBeGreaterThanOrEqual(2);
    for (const q of all) {
      if (q.exam) expect(q.examBasis, q.id).toBe("printed-emphasis");
      if (SOURCE[q.chapter as ChapterKey].tables.includes(q.topic)) expect(q.exam, q.id).toBe(true);
      if (q.type === "blank") expect(q.exam, q.id).toBe(true);
    }
  });

  it("단답형: 한 칸('답: {{0}}'), 정답 1~3단어, 인정 답안에 영문 표기 포함 / 서술형: 채점 포인트 3~5개", () => {
    for (const q of all as Any[]) {
      if (q.type === "blank") {
        expect((q as { text: string }).text, q.id).toBe("답: {{0}}");
        expect(q.blanks!.length, q.id).toBe(1);
        const [first, ...rest] = q.blanks![0].accept;
        expect(first.split(/\s+/).length, q.id).toBeLessThanOrEqual(3);
        expect(rest.some((a) => /[A-Za-z]/.test(a)) || /^[A-Za-z]/.test(first), q.id).toBe(true);
        // 정답 표기가 문제 글에 그대로 들어가 있으면 안 된다
        expect(normalizeText(q.prompt).includes(normalizeText(first)), q.id).toBe(false);
      }
      if (q.type === "essay") expect(q.keyPoints!.length, q.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("해설 = 정답 이유 + 오답이 틀린 이유 + 같은 장의 관련 개념 + 끝에 '근거: PDF p.X'(PDF 밖 내용은 '+ 보충'), 쪽은 그 장의 범위 안", () => {
    const bad = all.filter((q) => !/^정답: [^\n]+ 오답: [^\n]+ 연결: [^\n]+\n근거: PDF p\.\d+(-\d+)?( \+ 보충)?$/.test(q.explanation));
    expect(bad.map((q) => q.id)).toEqual([]);
    for (const q of all) {
      const [, a, b] = q.explanation.match(/근거: PDF p\.(\d+)(?:-(\d+))?/)!;
      const [lo, hi] = SOURCE[q.chapter as ChapterKey].pages;
      for (const p of [a, b ?? a].map(Number)) expect(p >= lo && p <= hi, `${q.id} p.${p}`).toBe(true);
      expect(q.slideRef, q.id).toMatch(new RegExp(`^Ch${q.chapter.slice(1)} p\\.`));
    }
  });

  it("굵은 용어·학자 이름은 장별로 빠짐없이 문제·보기에 1회 이상, 소제목·표와 함께 docs/psychology/coverage.md와 같다", () => {
    const missing: string[] = [];
    const summary: string[] = [];
    const sections: string[] = [];
    let supplement = 0;
    for (const ch of chs) {
      const qs = byCh[ch] as Any[];
      const texts = qs.map((q) => [short(q.id), shown(q)] as const);
      const hitsOf = (term: string) => texts.filter(([, t]) => t.includes(normalizeText(term))).map(([id]) => id);
      const src = SOURCE[ch];
      const headRows = src.headings.map((h) => {
        const ids = qs.filter((q) => q.topic === h).map((q) => short(q.id));
        return `| ${h}${src.tables.includes(h) ? " (표)" : ""} | ${ids.length} | ${list(ids, 6)} |`;
      });
      const termRows = [...src.terms.map((t) => ["용어", t] as const), ...src.scholars.map((t) => ["학자", t] as const)].map(([g, t]) => {
        const ids = hitsOf(t);
        if (!ids.length) missing.push(`${ch} ${t}`);
        return `| ${g} | ${t} | ${ids.length} | ${list(ids)} |`;
      });
      const sup = qs.filter((q) => / \+ 보충$/.test(q.explanation)).length;
      supplement += sup;
      const tableShort = src.tables.filter((t) => qs.filter((q) => q.topic === t).length < 2).length;
      const n = (f: (q: Question) => boolean) => qs.filter(f).length;
      summary.push(
        `| ${ch} | ${psychology.chapters.find((c) => c.id === ch)!.title} | ${n((q) => SELECT.has(q.type))} | ${n((q) => q.type === "blank")} | ${n((q) => q.type === "essay")} | ${qs.length} | ${src.tables.length} / ${tableShort} | ${src.headings.length} | ${src.terms.length + src.scholars.length} | ${termRows.filter((r) => / \| 0 \| /.test(r)).length} | ${sup} |`,
      );
      sections.push(
        `## ${ch} — 소제목 (PDF p.${src.pages[0]}~${src.pages[1]})`,
        "",
        "| 소제목 | 문항 수 | 문항(id 앞의 psychology- 생략) |",
        "|---|---|---|",
        ...headRows,
        "",
        `## ${ch} — 굵은 용어·학자`,
        "",
        "| 구분 | 용어 | 문항 수 | 문항(앞 4개) |",
        "|---|---|---|---|",
        ...termRows,
        "",
      );
    }
    expect(missing).toEqual([]);
    const doc = [
      "# 커버리지 — 심리학개론 CHAPTER 01~08 (요약 노트 PDF)",
      "",
      "원천자료 `docs/psychology/summary-notes.pdf`(로컬 전용) 하단 쪽 번호 2~28. 용어 표기는 교재 판(`term-map.md`). 소제목은 문항 topic으로, 굵은 용어·학자 이름은 문제·보기·순서 항목·짝·단답 인정 답안·모범답안·채점 포인트에 나온 문항으로 센다(해설만 언급한 것은 세지 않는다).",
      "이 문서는 `data/subjects/psychology/psychology.test.ts`가 문항 데이터와 같은지 검사한다(다시 만들기: `UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology`).",
      "",
      "## 요약",
      "",
      "| 장 | 제목 | 객관식 | 단답형 | 서술형 | 계 | 표 / 2문항 미만 | 소제목 | 용어·학자 | 누락 | 근거에 보충 |",
      "|---|---|---|---|---|---|---|---|---|---|---|",
      ...summary,
      `| 계 | | 100 | 60 | 40 | ${all.length} | | | | ${missing.length} | ${supplement} |`,
      "",
      ...sections,
    ].join("\n");
    const file = path.join(ROOT, "docs/psychology/coverage.md");
    if (process.env.UPDATE_PSY_COVERAGE) writeFileSync(file, doc);
    expect(readFileSync(file, "utf8").replace(/\r\n/g, "\n")).toBe(doc);
  });

  it("브라우저에 남은 옛 문항 id(psychology-ch01-… 등) 기록은 오류 없이 무시된다", async () => {
    const OLD = ["psychology-ch01-case-001", "psychology-ch04-short-003", "psychology-ch07-essay-002"];
    let rec = emptySubjectRecords();
    rec = recordAttempt(rec, OLD[0], { correct: false, score: 0 }, "2026-10-20T00:00:00.000Z");
    rec = recordAttempt(rec, OLD[1], { correct: true, score: 1 }, "2026-10-20T00:01:00.000Z");
    rec = recordAttempt(rec, OLD[2], { correct: false, score: 0, selfCheck: true }, "2026-10-20T00:02:00.000Z");
    rec = { ...rec, bookmarks: [...rec.bookmarks, OLD[1]] };
    const metas = await Promise.all(psychology.chapters.map((c) => chapterMeta(psychology, c)));
    const ids = metas.flatMap((m) => m.ids);
    expect(ids.some((id) => OLD.includes(id))).toBe(false);
    // 단원·과목 통계, 정답률 요약, 생성 문제 집계 어디에도 들어가지 않는다
    const line = subjectStats(rec, metas);
    expect([line.total, line.solved, line.attempts, line.correct, line.openWrong]).toEqual([200, 0, 0, 0, 0]);
    expect(chapterStats(rec, metas[0]).line.solved).toBe(0);
    expect(summarize(rec, ids)).toMatchObject({ attempts: 0, correct: 0, openWrong: 0 });
    expect(generatedAttempts(rec, new Set(ids))).toEqual({ attempts: 0, correct: 0 });
    // 옛 단원 id로 저장된 세션 항목은 "찾을 수 없음"(빈 결과)으로 끝난다
    const found = await loadQuestions(OLD.map((id) => ({ id, subject: "psychology", chapter: id.split("-")[1] })));
    expect(found.size).toBe(0);
  });
});

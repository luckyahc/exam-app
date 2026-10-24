import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { chapterMeta } from "@/lib/chapterMeta";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import { validateBase } from "@/lib/qtypes/base";
import { coreFor } from "@/lib/qtypes/registry";
import { loadQuestions } from "@/lib/quiz/loadQuestions";
import { chapterStats, generatedAttempts, subjectStats } from "@/lib/stats";
import { recordAttempt, summarize } from "@/lib/storage/records";
import { emptySubjectRecords } from "@/lib/storage/schema";
import type { Question } from "@/types/question";
import psychology, { ALL_CHAPTERS } from "./index";
import { type ChapterKey, EXCLUDED, SOURCE } from "./terms";

// 심리학개론 CHAPTER 01~08(docs/psychology/plan.md, 2026-10-23 재작성 — 원천자료 요약 노트 PDF, 용어는 교재 판 docs/psychology/term-map.md):
// 문항 수·유형 비율, 객관식 안의 성격 순서, 표마다 2문항, 소제목·굵은 용어·학자 커버리지(docs/psychology/coverage.md), 해설 형식, ⭐ 근거, 옛 문항 id 기록 무시.
// 출제 범위 밖(EXCLUDED: c04 전체, c02 행동유전학과 진화심리학, c03 향정신성 약물)은 숨김만 하고 데이터 검사는 그대로, 커버리지는 빼고 검사한다.
// 커버리지 문서를 다시 만들려면 UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology

const ROOT = path.resolve(import.meta.dirname, "../../..");
const SELECT = new Set(["mcq", "multi", "ox", "match", "order"]);
const COUNTS: Record<ChapterKey, number> = { c01: 26, c02: 28, c03: 37, c04: 22, c05: 30, c06: 30, c07: 27, c08: 26 };
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
  // byCh = 숨긴 것까지 전체 데이터, live = 앱이 실제로 보는 출제 범위(psychology.chapters의 load)
  const byCh = Object.fromEntries(await Promise.all(ALL_CHAPTERS.map(async (c) => [c.id, (await c.loadAll()) as Question[]] as const))) as Record<ChapterKey, Question[]>;
  const live = Object.fromEntries(await Promise.all(psychology.chapters.map(async (c) => [c.id, (await c.load()) as Question[]] as const))) as Partial<Record<ChapterKey, Question[]>>;
  const all = Object.values(byCh).flat();
  const chs = Object.keys(SOURCE) as ChapterKey[];
  const ex = (ch: ChapterKey) => EXCLUDED[ch];
  const exHeads = (ch: ChapterKey): readonly string[] => {
    const e = ex(ch);
    return e === "all" ? SOURCE[ch].headings : (e?.headings ?? []);
  };
  const exTerms = (ch: ChapterKey): readonly string[] => {
    const e = ex(ch);
    return e === "all" ? [...SOURCE[ch].terms, ...SOURCE[ch].scholars] : (e?.terms ?? []);
  };
  const HIDDEN: Partial<Record<ChapterKey, number>> = { c02: 3, c03: 4, c04: 22, c06: 6, c07: 3 };

  it("출제 범위 밖은 숨김: c04 단원은 과목 화면에서 빠지고(번호 유지), c02·c03 제외 절 문항은 outOfScope로 로더가 걸러 낸다", () => {
    expect(psychology.chapters.map((c) => c.id)).toEqual(chs.filter((ch) => ex(ch) !== "all"));
    for (const ch of chs) {
      const hidden = byCh[ch].filter((q) => ex(ch) === "all" || q.outOfScope);
      expect(hidden.length, ch).toBe(HIDDEN[ch] ?? 0);
      if (ex(ch) === "all") {
        expect(live[ch]).toBeUndefined();
        continue;
      }
      // 제외 소제목의 문항 ⇔ outOfScope
      for (const q of byCh[ch]) expect(!!q.outOfScope, q.id).toBe(exHeads(ch).includes(q.topic));
      expect(live[ch]!.map((q) => q.id)).toEqual(byCh[ch].filter((q) => !q.outOfScope).map((q) => q.id));
      expect(psychology.chapters.find((c) => c.id === ch)!.minQuestions, ch).toBe(live[ch]!.length);
    }
    expect(Object.values(live).flat().length).toBe(226 - 38);
  });

  it("숨긴 문항도 공통·유형별 검증을 통과한다(다시 켤 수 있게 — 전역 무결성 테스트는 범위 안만 본다)", () => {
    const hidden = chs.flatMap((ch) => byCh[ch].filter((q) => ex(ch) === "all" || q.outOfScope));
    const errors = hidden.flatMap((q) => [...validateBase(q), ...coreFor(q).validate(q as never)].map((e) => `${q.id}: ${e}`));
    expect(errors).toEqual([]);
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  });

  it("단원 8개(숨긴 c04 포함) = PDF 목차 순서(c01~c08), 장별 문항 수 26·28·37·22·24·28·26·24 = 215(c03에 교재 보충 15)", () => {
    expect(ALL_CHAPTERS.map((c) => c.id)).toEqual(chs);
    expect(Object.fromEntries(chs.map((ch) => [ch, byCh[ch].length]))).toEqual(COUNTS);
    expect(all.length).toBe(226);
  });

  it("유형 비율 객관식 50% · 단답형 30% · 서술형 20%(장마다 ±3%p, 전체 108·64·43)", () => {
    for (const ch of chs) {
      // 주석 메모 보충 문항(근거 'PDF p.X 메모')은 사용자 지시로 객관식 위주라 비율 검사에서 뺀다
      const qs = byCh[ch].filter((q) => !/ 메모( \+ 보충)?$/.test(q.explanation));
      const n = qs.length;
      const sel = qs.filter((q) => SELECT.has(q.type)).length;
      const shortN = qs.filter((q) => q.type === "blank").length;
      const essay = qs.filter((q) => q.type === "essay").length;
      expect(sel + shortN + essay, ch).toBe(n);
      expect(Math.abs(sel / n - 0.5), ch).toBeLessThan(0.03);
      expect(Math.abs(shortN / n - 0.3), ch).toBeLessThan(0.03);
      expect(Math.abs(essay / n - 0.2), ch).toBeLessThan(0.03);
    }
    expect([all.filter((q) => SELECT.has(q.type)).length - 5, all.filter((q) => q.type === "blank").length, all.filter((q) => q.type === "essay").length]).toEqual([112, 66, 43]);
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

  it("topic = PDF ■ 소제목(교재 판 표기), 출제 범위 안 소제목마다 범위 안 문항 1개 이상", () => {
    for (const ch of chs) {
      const heads = SOURCE[ch].headings;
      for (const q of byCh[ch]) expect(heads, q.id).toContain(q.topic);
      for (const h of heads.filter((h) => !exHeads(ch).includes(h))) expect(live[ch]!.some((q) => q.topic === h), `${ch} ${h}`).toBe(true);
    }
  });

  it("PDF 비교표마다(범위 안) 2문항 이상, 표 문항은 모두 ⭐ / ⭐ 근거는 printed-emphasis / 단답형은 모두 ⭐(굵은 용어·표)", () => {
    for (const ch of chs)
      for (const t of SOURCE[ch].tables.filter((t) => !exHeads(ch).includes(t))) expect(live[ch]!.filter((q) => q.topic === t).length, `${ch} ${t}`).toBeGreaterThanOrEqual(2);
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

  it("해설 = 정답 이유 + 오답이 틀린 이유 + 같은 장의 관련 개념 + 끝에 '근거: PDF p.X'(교재 보충 절은 '근거: 교재 p.X', PDF 밖 내용은 '+ 보충'), 쪽은 그 장의 범위 안", () => {
    const bad = all.filter((q) => !/^정답: [^\n]+ 오답: [^\n]+ 연결: [^\n]+\n근거: (PDF|교재) p\.\d+(-\d+)?( 메모)?( \+ 보충)?$/.test(q.explanation));
    expect(bad.map((q) => q.id)).toEqual([]);
    for (const q of all) {
      const [, src, a, b] = q.explanation.match(/근거: (PDF|교재) p\.(\d+)(?:-(\d+))?/)!;
      const s = SOURCE[q.chapter as ChapterKey];
      const range = src === "PDF" ? s.pages : s.textbook;
      expect(range, `${q.id} 교재 보충 절이 없는 장`).toBeDefined();
      const [lo, hi] = range!;
      for (const p of [a, b ?? a].map(Number)) expect(p >= lo && p <= hi, `${q.id} p.${p}`).toBe(true);
      expect(q.slideRef, q.id).toMatch(new RegExp(`^Ch${q.chapter.slice(1)} p\\.`));
    }
  });

  it("굵은 용어·학자 이름은 장별로(제외 절 빼고) 범위 안 문항의 문제·보기에 1회 이상, 소제목·표와 함께 docs/psychology/coverage.md와 같다", () => {
    const missing: string[] = [];
    const summary: string[] = [];
    const sections: string[] = [];
    let supplement = 0;
    const excluded: string[] = [];
    for (const ch of chs) {
      const e = ex(ch);
      if (e === "all") {
        excluded.push(`| ${ch} | 단원 전체(${ALL_CHAPTERS.find((c) => c.id === ch)!.title}) | ${byCh[ch].length} |`);
        continue;
      }
      if (e) excluded.push(`| ${ch} | ${e.section} — ${e.headings.join(", ")} | ${byCh[ch].filter((q) => q.outOfScope).length} |`);
      const qs = live[ch]! as Any[];
      const texts = qs.map((q) => [short(q.id), shown(q)] as const);
      const hitsOf = (term: string) => texts.filter(([, t]) => t.includes(normalizeText(term))).map(([id]) => id);
      const src = SOURCE[ch];
      const headRows = src.headings.filter((h) => !exHeads(ch).includes(h)).map((h) => {
        const ids = qs.filter((q) => q.topic === h).map((q) => short(q.id));
        return `| ${h}${src.tables.includes(h) ? " (표)" : ""} | ${ids.length} | ${list(ids, 6)} |`;
      });
      const termRows = [...src.terms.map((t) => ["용어", t] as const), ...src.scholars.map((t) => ["학자", t] as const)].filter(([, t]) => !exTerms(ch).includes(t)).map(([g, t]) => {
        const ids = hitsOf(t);
        if (!ids.length) missing.push(`${ch} ${t}`);
        return `| ${g} | ${t} | ${ids.length} | ${list(ids)} |`;
      });
      const sup = qs.filter((q) => / \+ 보충$/.test(q.explanation)).length;
      supplement += sup;
      const tables = src.tables.filter((t) => !exHeads(ch).includes(t));
      const tableShort = tables.filter((t) => qs.filter((q) => q.topic === t).length < 2).length;
      const n = (f: (q: Question) => boolean) => qs.filter(f).length;
      summary.push(
        `| ${ch} | ${ALL_CHAPTERS.find((c) => c.id === ch)!.title} | ${n((q) => SELECT.has(q.type))} | ${n((q) => q.type === "blank")} | ${n((q) => q.type === "essay")} | ${qs.length} | ${tables.length} / ${tableShort} | ${headRows.length} | ${termRows.length} | ${termRows.filter((r) => / \| 0 \| /.test(r)).length} | ${sup} |`,
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
      "출제 범위 안 문항만 센다(아래 '출제 범위 밖'은 숨김 — 데이터는 남아 있다).",
      "",
      "| 장 | 제목 | 객관식 | 단답형 | 서술형 | 계 | 표 / 2문항 미만 | 소제목 | 용어·학자 | 누락 | 근거에 보충 |",
      "|---|---|---|---|---|---|---|---|---|---|---|",
      ...summary,
      `| 계 | | | | | ${Object.values(live).flat().length} | | | | ${missing.length} | ${supplement} |`,
      "",
      "## 출제 범위 밖 (2026-10-24, 교재 축약판에 없는 부분 — 숨김, 커버리지 검사에서 제외)",
      "",
      "| 장 | 제외 절 | 숨긴 문항 |",
      "|---|---|---|",
      ...excluded,
      "",
      ...sections,
    ].join("\n");
    const file = path.join(ROOT, "docs/psychology/coverage.md");
    if (process.env.UPDATE_PSY_COVERAGE) writeFileSync(file, doc);
    expect(readFileSync(file, "utf8").replace(/\r\n/g, "\n")).toBe(doc);
  });

  it("브라우저에 남은 옛 문항 id(psychology-ch01-…)·숨긴 문항 id 기록은 오류 없이 무시된다", async () => {
    // 옛 단원 id + 숨긴 문항 id(c04, c03 약물) — 둘 다 범위 밖이라 같은 방식으로 무시된다
    const OLD = ["psychology-ch01-case-001", "psychology-ch04-short-003", "psychology-ch07-essay-002", "psychology-c04-case-001", "psychology-c03-essay-003"];
    let rec = emptySubjectRecords();
    rec = recordAttempt(rec, OLD[0], { correct: false, score: 0 }, "2026-10-20T00:00:00.000Z");
    rec = recordAttempt(rec, OLD[1], { correct: true, score: 1 }, "2026-10-20T00:01:00.000Z");
    rec = recordAttempt(rec, OLD[2], { correct: false, score: 0, selfCheck: true }, "2026-10-20T00:02:00.000Z");
    rec = recordAttempt(rec, OLD[3], { correct: false, score: 0 }, "2026-10-20T00:03:00.000Z");
    rec = recordAttempt(rec, OLD[4], { correct: false, score: 0, selfCheck: true }, "2026-10-20T00:04:00.000Z");
    rec = { ...rec, bookmarks: [...rec.bookmarks, OLD[1]] };
    const metas = await Promise.all(psychology.chapters.map((c) => chapterMeta(psychology, c)));
    const ids = metas.flatMap((m) => m.ids);
    expect(ids.some((id) => OLD.includes(id))).toBe(false);
    // 단원·과목 통계, 정답률 요약, 생성 문제 집계 어디에도 들어가지 않는다
    const line = subjectStats(rec, metas);
    expect([line.total, line.solved, line.attempts, line.correct, line.openWrong]).toEqual([188, 0, 0, 0, 0]);
    expect(chapterStats(rec, metas[0]).line.solved).toBe(0);
    expect(summarize(rec, ids)).toMatchObject({ attempts: 0, correct: 0, openWrong: 0 });
    expect(generatedAttempts(rec, new Set(ids))).toEqual({ attempts: 0, correct: 0 });
    // 옛 단원·숨긴 문항 id로 저장된 세션 항목은 "찾을 수 없음"으로 끝난다
    const found = await loadQuestions(OLD.map((id) => ({ id, subject: "psychology", chapter: id.split("-")[1] })));
    expect(OLD.filter((id) => found.has(id))).toEqual([]);
  });
});

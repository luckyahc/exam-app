import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import type { Question } from "@/types/question";
import c09 from "./c09";
import c10 from "./c10";
import psychology from "./index";

// 심리학개론 기말 CHAPTER 09·10(종이시험 형식): 5지선다(보기 5개) 또는 단답형만, 비율 70:30, 해설 형식,
// PDF 소제목·표의 행·빨간 굵은 용어·학자 이름 커버리지 = docs/psychology/coverage-final.md(다시 만들기: UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology/final.test.ts)

const ROOT = path.resolve(import.meta.dirname, "../../..");
type Any = Question & { choices?: string[]; answerIndex?: number; blanks?: { accept: string[] }[] };

const SPEC = {
  c09: {
    pages: [1, 3],
    textbookPages: [203, 219],
    headings: ["개념", "문제 해결 전략", "문제 해결의 장애물", "발견법과 편향", "직관의 힘", "창의성", "동물의 사고", "언어의 구조", "언어 발달", "언어 습득 이론", "언어와 사고", "동물과 언어"],
    tables: {
      "문제 해결 전략": ["알고리듬", "발견법", "통찰"],
      "발견법과 편향": ["대표성 발견법", "가용성 발견법", "과신", "신념 집착", "틀만들기 효과", "넛지"],
      "언어의 구조": ["음소", "형태소", "문법", "의미론", "통사론"],
      "언어 발달": ["옹알이 단계", "옹알이의 모국어화", "한 단어 단계", "두 단어 단계", "전보식 말", "다단어 단계"],
    },
    terms: ["개념", "원형", "확증 편향", "고착", "마음갖춤새", "기능적 고착", "창의성", "수렴적 사고", "확산적 사고", "전문 지식", "상상력 있는 사고 기술", "모험적 성격", "내재적 동기", "창의적 환경", "자기 인식", "보편 문법", "통계적 학습", "결정적 시기", "언어결정론", "언어상대성", "심상"],
    scholars: ["카너먼", "트버스키", "스턴버그", "스키너", "촘스키", "워프"],
    // 교재 제7장 "기억해야 할 용어"(사고 · 언어와 사고) + 표 7.1·7.2 — docs/psychology/_old/source-ch04-07.md
    textbook: {
      "용어: 사고": ["가용성 발견법", "개념", "고착", "과신", "넛지", "대표성 발견법", "마음갖춤새", "메타인지", "발견법", "수렴적 사고", "신념 집착", "알고리듬", "원형", "인지", "직관", "창의성", "통찰", "틀만들기", "확산적 사고", "확증 편향"],
      "용어: 언어와 사고": ["두 단어 단계", "문법", "베르니케 영역", "브로카 영역", "실어증", "언어", "언어결정론", "언어상대성", "옹알이 단계", "음소", "전보식 말", "한 단어 단계", "형태소"],
      "표 7.1": ["알고리듬", "발견법", "통찰", "확증 편향", "고착", "직관", "과신", "신념 집착", "틀만들기", "창의성"],
      "표 7.2(단계만)": ["옹알이", "한 단어 단계", "두 단어 단계", "전보식 말"],
    },
  },
  c10: {
    pages: [3, 5],
    textbookPages: [220, 230],
    headings: ["지능의 정의와 이론", "정서지능", "지능검사의 역사", "성취검사와 적성검사", "좋은 검사의 조건", "생애에 걸친 지능", "지능의 양극단", "지능에 대한 유전과 환경의 영향", "집단 간 차이와 검사 편향"],
    tables: {
      "지능 이론 비교": ["일반지능(g)", "일차 심적 능력", "유동 지능", "결정 지능", "CHC", "다중지능 이론", "삼원 이론", "분석지능", "창의성 지능", "현실지능"],
      "좋은 검사의 조건": ["표준화", "신뢰도", "반분신뢰도", "동형검사 신뢰도", "검사-재검사", "타당도", "내용 타당도", "예측타당도"],
    },
    terms: ["지능", "현자 증후군", "그릿(투지)", "정서지능", "정신연령", "스탠퍼드-비네 지능검사", "편차 IQ", "웩슬러 성인용 지능검사", "성취검사", "적성검사", "정상곡선", "플린 효과", "횡단 연구", "종단 연구", "지적 장애", "다운증후군", "성장 마인드셋", "고정관념 위협", "검사 편향"],
    scholars: ["스피어먼", "서스톤", "캐텔과 혼", "카텔-혼-캐럴", "가드너", "스턴버그", "메이어", "샐러베이", "카루소", "골턴", "비네", "터먼", "슈테른", "웩슬러", "드웩"],
    // 교재 제7장 "기억해야 할 용어"(지능이란 무엇인가? · 지능의 평가와 역동성) + 표 7.3
    textbook: {
      "용어: 지능이란 무엇인가?": ["일반지능(g)", "정서지능", "지능", "현자 증후군"],
      "용어: 지능의 평가와 역동성": ["성취검사", "스탠퍼드-비네 지능검사", "신뢰도", "예측타당도", "웩슬러 성인용 지능검사", "적성검사", "정상곡선", "정신연령", "지능검사", "지능지수", "타당도", "표준화"],
      "표 7.3": ["스피어먼", "일반지능(g)", "서스톤", "일차 심적 능력", "가드너", "다중지능", "스턴버그", "삼원 이론", "정서지능"],
    },
  },
} as const;

const BY = { c09: c09 as Any[], c10: c10 as Any[] };
const kind = (q: Question) => q.id.split("-")[2];
const shown = (q: Any) => normalizeText([q.prompt, ...(q.choices ?? []), ...(q.blanks?.flatMap((b) => b.accept) ?? [])].join(" "));
const answerOf = (q: Any) => (q.type === "mcq" ? q.choices![q.answerIndex!] : q.blanks![0].accept[0]);

describe("심리학개론 기말 c09·c10 — 종이시험 형식", () => {
  it("단원 c09·c10 = 기말(2-2-final), 과목 화면에 보이고 minQuestions = 문항 수", () => {
    for (const ch of ["c09", "c10"] as const) {
      const c = psychology.chapters.find((x) => x.id === ch)!;
      expect(c.exam).toBe("2-2-final");
      expect(c.minQuestions).toBe(BY[ch].length);
    }
  });

  it("모든 문항이 mcq(보기 정확히 5개, 중복 없음) 또는 blank(한 칸, 1~3단어, 영문 인정 답안)", () => {
    for (const q of [...c09, ...c10] as Any[]) {
      expect(["mcq", "blank"], q.id).toContain(q.type);
      if (q.type === "mcq") {
        expect(new Set(q.choices).size, q.id).toBe(5);
        expect(q.choices!.length, q.id).toBe(5);
      } else {
        expect(q.blanks!.length, q.id).toBe(1);
        const [first, ...rest] = q.blanks![0].accept;
        expect(first.split(/\s+/).length, q.id).toBeLessThanOrEqual(3);
        expect(rest.some((a) => /[A-Za-z]/.test(a)), q.id).toBe(true);
        expect(normalizeText(q.prompt).includes(normalizeText(first)), q.id).toBe(false);
      }
    }
  });

  it("id = psychology-c0N-{identify|judge|link|short}-NNN, 5지선다 70% · 단답 30%(±3%p), 5지선다 안 개념 식별 > 설명 판단 ≥ 학자 연결", () => {
    for (const ch of ["c09", "c10"] as const) {
      const qs = BY[ch];
      for (const q of qs) {
        expect(q.id).toMatch(new RegExp(`^psychology-${ch}-(identify|judge|link|short)-\\d{3}$`));
        expect(q.type, q.id).toBe(kind(q) === "short" ? "blank" : "mcq");
      }
      const n = (k: string) => qs.filter((q) => kind(q) === k).length;
      expect(Math.abs(qs.filter((q) => q.type === "mcq").length / qs.length - 0.7), ch).toBeLessThan(0.03);
      expect(n("identify"), ch).toBeGreaterThan(n("judge"));
      expect(n("judge") + 1, ch).toBeGreaterThanOrEqual(n("link"));
    }
  });

  it("해설 = '정답:' + (5지선다는 오답 보기 4개 각각 1줄) + 끝에 '근거: PDF p.X( + 보충)' 또는 '근거: 교재 p.X(source-ch04-07.md)', 쪽은 그 장 범위, slideRef = Ch0N p.", () => {
    for (const ch of ["c09", "c10"] as const)
      for (const q of BY[ch]) {
        const m = /^정답: [^\n]+\n(?:오답: ([^\n]+)\n)?근거: (PDF|교재) p\.(\d+)(?:-(\d+))?(\(source-ch04-07\.md\))?( \+ 보충)?$/.exec(q.explanation);
        expect(m, q.id).not.toBeNull();
        if (q.type === "mcq") expect(m![1]?.split(" / ").length, q.id).toBe(4);
        const [lo, hi] = m![2] === "PDF" ? SPEC[ch].pages : SPEC[ch].textbookPages;
        if (m![2] === "교재") expect(m![5], `${q.id} 교재 근거는 (source-ch04-07.md)`).toBeDefined();
        for (const p of [m![3], m![4] ?? m![3]].map(Number)) expect(p >= lo && p <= hi, `${q.id} p.${p}`).toBe(true);
        expect(q.slideRef, q.id).toMatch(new RegExp(`^Ch${ch.slice(1)} p\\.`));
        expect(SPEC[ch].headings as readonly string[], q.id).toContain(q.topic);
      }
  });

  it("소제목·표의 행·빨간 굵은 용어·학자 이름 누락 0, docs/psychology/coverage-final.md = 데이터", () => {
    const missing: string[] = [];
    const lines: string[] = [];
    const summary: string[] = [];
    for (const ch of ["c09", "c10"] as const) {
      const qs = BY[ch];
      const sp = SPEC[ch];
      const ids = (f: (q: Any) => boolean) => qs.filter(f).map((q) => q.id.replace(/^psychology-/, ""));
      const row = (group: string, t: string, hit: string[], asAnswer: string[]) => {
        if (!hit.length) missing.push(`${ch} ${t}`);
        return `| ${group} | ${t} | ${hit.length} | ${asAnswer.length ? asAnswer.join(", ") : "—"} | ${hit.slice(0, 4).join(", ")}${hit.length > 4 ? " …" : ""} |`;
      };
      const termRow = (group: string, t: string) => row(group, t, ids((q) => shown(q).includes(normalizeText(t))), ids((q) => normalizeText(answerOf(q)).includes(normalizeText(t))));
      const headRows = sp.headings.map((h) => {
        const hit = ids((q) => q.topic === h);
        if (!hit.length) missing.push(`${ch} ■${h}`);
        return `| ${h} | ${hit.length} | ${hit.join(", ")} |`;
      });
      const k = (x: string) => qs.filter((q) => kind(q) === x).length;
      summary.push(`| ${ch} | ${k("identify")} | ${k("judge")} | ${k("link")} | ${k("short")} | ${qs.length} | ${qs.filter((q) => / \+ 보충$/.test(q.explanation)).length} |`);
      lines.push(
        `## ${ch} — ■ 소제목 (PDF p.${sp.pages[0]}~${sp.pages[1]})`,
        "",
        "| 소제목 | 문항 수 | 문항 |",
        "|---|---|---|",
        ...headRows,
        "",
        `## ${ch} — 표의 행 · 빨간 굵은 용어 · 학자`,
        "",
        "| 구분 | 용어 | 나온 문항 수 | 정답으로 나온 문항 | 나온 문항(앞 4개) |",
        "|---|---|---|---|---|",
        ...Object.entries(sp.tables as Record<string, readonly string[]>).flatMap(([t, rows]) => rows.map((r) => termRow(`표: ${t}`, r))),
        ...sp.terms.map((t) => termRow("용어", t)),
        ...sp.scholars.map((t) => termRow("학자", t)),
        "",
        `## ${ch} — 교재 용어 (제7장 "기억해야 할 용어"·표, source-ch04-07.md)`,
        "",
        "| 교재 절·표 | 용어 | 나온 문항 수 | 정답으로 나온 문항 | 나온 문항(앞 4개) |",
        "|---|---|---|---|---|",
        ...Object.entries(sp.textbook as Record<string, readonly string[]>).flatMap(([t, rows]) => rows.map((r) => termRow(t, r))),
        "",
      );
    }
    expect(missing).toEqual([]);
    const doc = [
      "# 커버리지 — 심리학개론 기말 CHAPTER 09·10 (요약 노트 PDF `summary-notes-final.pdf` p.1~5)",
      "",
      "종이시험 형식(5지선다 + 단답형). 용어는 교재 제7장 표기. 문제·보기·단답 인정 답안에 나온 문항으로 센다(해설만 언급한 것은 세지 않는다). '정답으로 나온 문항' = 정답 보기·단답 첫 인정 답안에 그 용어가 들어 있는 문항.",
      "이 문서는 `data/subjects/psychology/final.test.ts`가 데이터와 같은지 검사한다(다시 만들기: `UPDATE_PSY_COVERAGE=1 npx vitest run data/subjects/psychology/final.test.ts`).",
      "",
      "## 요약",
      "",
      "| 장 | 5지선다 개념 식별 | 설명 판단 | 학자·연구 연결 | 단답형 | 계 | 근거에 보충 |",
      "|---|---|---|---|---|---|---|",
      ...summary,
      "",
      `누락: ${missing.length}`,
      "",
      ...lines,
    ].join("\n");
    const file = path.join(ROOT, "docs/psychology/coverage-final.md");
    if (process.env.UPDATE_PSY_COVERAGE) writeFileSync(file, doc);
    expect(readFileSync(file, "utf8").replace(/\r\n/g, "\n")).toBe(doc);
  });
});

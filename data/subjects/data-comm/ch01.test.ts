import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Question } from "@/types/question";
import ch01 from "./ch01";

// 데이터 통신 Ch01 콘텐츠 기준(docs/sprints/sprint-10-dc-content.md, docs/coverage-matrix.md 데이터 통신 Ch01).
// DC-1-Introduction.pdf는 한 쪽에 슬라이드 2장 → PDF 쪽 = ⌈슬라이드 ÷ 2⌉.

/** coverage-matrix의 Ch01 소주제와 목표 문항 수 */
const TARGETS: Record<string, number> = {
  "데이터·데이터 통신 정의, 4가지 특성(전달·정확성·적시성·지터)": 3,
  "5가지 구성 요소, 프로토콜 정의": 3,
  "데이터 표현(유니코드 32비트, ASCII 7비트·128자, 확장 ASCII 8비트, 픽셀)": 3,
  "데이터 흐름: 단방향·반이중·전이중": 3,
  "네트워크 정의·장치, 네트워크 기준(성능·신뢰성·보안)": 2,
  "연결 유형: 점대점·다중점": 2,
  "물리 토폴로지 4종(메시·스타·버스·링)과 구성품": 4,
  "LAN(범위, 주소·IP, 과거 공용 케이블 vs 현재 스위치)": 3,
  "WAN, LAN과의 차이, 점대점·교환 WAN": 4,
  "인터네트워크, internet vs Internet, 오늘날 인터넷 구조": 3,
  "인터넷 접속 4가지(다이얼업·DSL·케이블·무선·직접 연결)": 4,
  "프로토콜 계층화 필요성, 1계층·3계층 프로토콜 예": 3,
  "계층화 2원칙, 논리적 연결": 3,
  "TCP/IP 5계층 순서, 계층적 구조, 장비별 관여 계층": 4,
  "계층별 동일 객체(메시지·세그먼트·데이터그램·프레임·비트)": 3,
  "계층별 역할과 헤더(H2/T2, H3, H4)": 4,
  "OSI 모델(ISO vs OSI, 1970년대 후반), 7계층": 3,
  "TCP/IP vs OSI 대응(응용 = 응용+표현+세션)": 3,
};
const SLIDES = 44;
const page = (slide: number) => Math.ceil(slide / 2);
const count = (pred: (q: Question) => boolean) => ch01.filter(pred).length;

describe("데이터 통신 Ch01 — 문항 수·소주제", () => {
  it("57문항 이상, 소주제 18개가 모두 목표 이상", () => {
    expect(ch01.length).toBeGreaterThanOrEqual(57);
    expect(Object.keys(TARGETS)).toHaveLength(18);
    expect(Object.values(TARGETS).reduce((a, b) => a + b, 0)).toBe(57);
    for (const [topic, target] of Object.entries(TARGETS)) expect(count((q) => q.topic === topic), topic).toBeGreaterThanOrEqual(target);
    // 목록 밖의 소주제 이름이 없다
    expect(ch01.filter((q) => !(q.topic in TARGETS)).map((q) => q.id)).toEqual([]);
  });

  it("⭐ 없음 — Ch01은 인쇄 강조 0건(dc-source-analysis.md §2)", () => {
    expect(ch01.filter((q) => q.exam || q.examBasis).map((q) => q.id)).toEqual([]);
  });

  it("계산·표 채우기 없음(Ch01에는 공식이 없다)", () => {
    expect(count((q) => q.type === "calc" || q.type === "trace")).toBe(0);
  });
});

describe("데이터 통신 Ch01 — 유형 비율", () => {
  const n = ch01.length;
  const ratio = (t: Question["type"]) => count((q) => q.type === t) / n;
  it("blank 18~22%, mcq 30% 이하, ox 18% 이하", () => {
    expect(ratio("blank")).toBeGreaterThanOrEqual(0.18);
    expect(ratio("blank")).toBeLessThanOrEqual(0.22);
    expect(ratio("mcq")).toBeLessThanOrEqual(0.3);
    expect(ratio("ox")).toBeLessThanOrEqual(0.18);
  });
  it("graph 2문항 이상, Sprint 9 Ch01 그림(데이터 흐름·토폴로지)을 쓴다", () => {
    const graphs = ch01.filter((q) => q.type === "graph");
    expect(graphs.length).toBeGreaterThanOrEqual(2);
    const names = new Set(graphs.flatMap((q) => (q.type === "graph" ? q.options.map((o) => (o.figure.kind === "dc" ? o.figure.figure.name : "curve")) : [])));
    expect(names).toEqual(new Set(["flow", "topology"]));
  });
});

describe("데이터 통신 Ch01 — 표기·출처", () => {
  it("id 형식 data-comm-ch01-{topicSlug}-{nnn}, slideRef 형식 'Ch01 s.N' 또는 'Ch01 s.N-M'(1~44)", () => {
    for (const q of ch01) {
      expect(q.id).toMatch(/^data-comm-ch01-[a-z]+(-[a-z]+)*-\d{3}$/);
      const m = /^Ch01 s\.(\d+)(?:-(\d+))?$/.exec(q.slideRef);
      expect(m, q.id).not.toBeNull();
      for (const s of [m![1], m![2]].filter(Boolean).map(Number)) expect(s >= 2 && s <= SLIDES, q.id).toBe(true);
    }
  });

  it("해설은 's.번호 (p.쪽)'으로 시작하고, 해설 안의 모든 's.N (p.P)' 표기가 PDF 쪽과 맞는다", () => {
    const bad: string[] = [];
    for (const q of ch01) {
      if (!/^s\.\d+(~\d+)? \(p\.\d+(~\d+)?\)/.test(q.explanation)) bad.push(`${q.id}: 시작 표기`);
      for (const m of q.explanation.matchAll(/s\.(\d+)(?:~(\d+))? \(p\.(\d+)(?:~(\d+))?\)/g)) {
        const [s1, s2, p1, p2] = [m[1], m[2], m[3], m[4]].map((x) => (x ? Number(x) : undefined));
        if (page(s1!) !== p1) bad.push(`${q.id}: s.${s1} → p.${page(s1!)}인데 p.${p1}`);
        if (s2 !== undefined && page(s2) !== (p2 ?? p1)) bad.push(`${q.id}: s.${s2} → p.${page(s2)}인데 p.${p2 ?? p1}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("거짓 OX에는 틀린 이유가 있고, 문제 문장(prompt+본문)이 서로 겹치지 않는다", () => {
    for (const q of ch01) if (q.type === "ox" && !q.answer) expect(q.falseReason, q.id).toBeTruthy();
    const keys = ch01.map((q) => q.prompt + (q.type === "blank" ? q.text : ""));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("blank: 빈칸마다 영어 원어와 한국어(또는 약어·숫자) 표기를 함께 받는다", () => {
    for (const q of ch01) {
      if (q.type !== "blank") continue;
      for (const b of q.blanks) {
        const hasLatin = b.accept.some((a) => /[A-Za-z0-9]/.test(a));
        expect(hasLatin, `${q.id}: 영어·약어·숫자 표기`).toBe(true);
        expect(b.accept.length, `${q.id}: 표기 변형`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("대조 기록 docs/verification/data-comm-ch01-ch02.md (Ch01 절)", () => {
  const md = readFileSync(path.resolve(import.meta.dirname, "../../../docs/verification/data-comm-ch01-ch02.md"), "utf8");
  const rows = md.split(/\r?\n/).filter((l) => /^\| \d+ \| `data-comm-ch01-/.test(l));
  const num = (label: string) => Number(new RegExp(`\\| ${label} \\| (\\d+)`).exec(md)?.[1]);

  it("전 문항이 한 줄씩 빠짐없이 있고, 문제 파일과 id·순서가 같다", () => {
    expect(rows.map((r) => /`([^`]+)`/.exec(r)![1])).toEqual(ch01.map((q) => q.id));
  });

  it("요약 숫자 = 표에서 센 값", () => {
    const match = rows.filter((r) => r.includes("| 신규·일치 |")).length;
    const fixed = rows.filter((r) => r.includes("| 신규·수정 |")).length;
    expect(num("전체")).toBe(rows.length);
    expect(num("신규 문항 일치")).toBe(match);
    expect(num("신규 문항 수정")).toBe(fixed);
    expect(num("그림 근거")).toBe(rows.filter((r) => r.includes("| 그림:")).length);
    expect(match + fixed).toBe(rows.length);
  });
});

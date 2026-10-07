/**
 * 시험 힌트 세부 항목별 집계와 형식 규칙(docs/os-exam-hint.md). 무결성 테스트(hints.test.ts)와 문서 표 생성이 같이 쓴다.
 */
import type { Question } from "@/types/question";
import { HINT_ITEMS, type HintItem } from "./hints";

/** 힌트의 출제 유형(객관식·순서 나열·짝 짓기·단답형) */
export const HINT_FORMS = ["mcq", "order", "match", "blank"] as const;

export interface HintRow {
  item: HintItem;
  ids: string[];
  total: number;
  byType: Record<string, number>;
  /** 이 중 handwritten ⭐ 수 */
  handwritten: number;
  problems: string[];
}

const WORD = /[A-Za-z]{2,}/;
const hasEn = (s: string | undefined) => !!s && WORD.test(s.replace(/`[^`]*`/g, ""));

/**
 * 영어 단어·약자를 묻거나 보기로 쓰는 문항: blank는 첫 정답이 영어이거나 지문이 영어로 쓰라고 할 때,
 * 선택형은 보기 2개 이상에 영어 단어가 있을 때, match는 한쪽 항목 2개 이상에 영어 단어가 있을 때, order·classify는 항목 2개 이상
 */
export function isEnglishQuestion(q: Question): boolean {
  const x = q as unknown as Record<string, unknown>;
  const count = (arr: string[]) => arr.filter(hasEn).length;
  switch (q.type) {
    case "blank": {
      const blanks = (x.blanks as { accept: string[] }[]) ?? [];
      return /영어|약자/.test(q.prompt) || blanks.some((b) => hasEn(b.accept[0]));
    }
    case "mcq":
    case "multi":
      return count((x.choices as string[]) ?? []) >= 2;
    case "match": {
      const pairs = (x.pairs as { left: string; right: string }[]) ?? [];
      return count(pairs.map((p) => p.left)) >= 2 || count(pairs.map((p) => p.right)) >= 2;
    }
    case "order":
      return count((x.items as string[]) ?? []) >= 2;
    case "classify":
      return count(((x.items as { label: string }[]) ?? []).map((i) => i.label)) >= 2;
    default:
      return false;
  }
}

/** 용어 단답형(os-chXX-term-NNN)은 비율 규칙과 따로 센다 */
export const isTermQuestion = (q: Question) => /^os-ch\d\d-term-\d{3}$/.test(q.id);

export function hintRows(qs: readonly Question[]): HintRow[] {
  return HINT_ITEMS.map((item) => {
    const mine = qs.filter((q) => q.hintIds?.includes(item.id));
    const byType: Record<string, number> = {};
    for (const q of mine) byType[q.type] = (byType[q.type] ?? 0) + 1;
    const problems: string[] = [];
    if (mine.length < 6) problems.push(`문항 ${mine.length}개(6개 이상 필요)`);
    if (Object.keys(byType).length < 3) problems.push(`유형 ${Object.keys(byType).length}종(3종 이상 필요)`);
    const forms = HINT_FORMS.filter((t) => byType[t]);
    if (forms.length < 2) problems.push(`객관식·순서·짝·단답 중 ${forms.length}종(2종 이상 필요)`);
    if (item.needsOrder && (byType.order ?? 0) < 2) problems.push(`order ${byType.order ?? 0}개(2개 이상 필요)`);
    if (item.needsMatch && (byType.match ?? 0) < 2) problems.push(`match ${byType.match ?? 0}개(2개 이상 필요)`);
    return {
      item,
      ids: mine.map((q) => q.id),
      total: mine.length,
      byType,
      handwritten: mine.filter((q) => q.examBasis === "handwritten").length,
      problems,
    };
  });
}

/** 챕터별 영어 문항 수(용어 단답형 포함) */
export function englishCounts(qs: readonly Question[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of qs) if (isEnglishQuestion(q)) out[q.chapter] = (out[q.chapter] ?? 0) + 1;
  return out;
}

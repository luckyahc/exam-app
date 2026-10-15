import { type BaseQ, type QTypeCore, result } from "./base";

/**
 * 서술형(자기 채점, 심리학개론 2026-10-16 — docs/psychology/plan.md): 글로 답하고 [제출]하면 "내 답"과 모범답안을 나란히 보고
 * 채점 포인트 체크리스트로 스스로 점검한다. 자동 채점이 없으므로 정답/오답을 기록하지 않는다 —
 * 채점 결과에 `selfCheck: true`를 붙이고, 기록(lib/storage/records.ts)은 "풀었음"만 남겨 정답률·오답노트·약점 통계에서 뺀다.
 */
export interface EssayQ extends BaseQ<"essay"> {
  /** 모범답안 3~6문장 */
  modelAnswer: string;
  /** 채점 포인트 3~5개 */
  keyPoints: string[];
}
export type EssayA = string;

/** 문장 수: 마침표·물음표·느낌표로 끝나는 덩어리 */
export const sentenceCount = (s: string) => s.split(/(?<=[.?!])\s+/).filter((x) => x.trim()).length;

export const essayCore: QTypeCore<EssayQ, EssayA, null> = {
  type: "essay",
  label: "서술형",
  emptyAnswer: () => "",
  isComplete: (_q, a) => a.trim().length > 0,
  grade: () => ({ ...result(0, null), selfCheck: true }),
  validate(q) {
    const e: string[] = [];
    const n = sentenceCount(q.modelAnswer ?? "");
    if (n < 3 || n > 6) e.push(`modelAnswer는 3~6문장(지금 ${n})`);
    if (!Array.isArray(q.keyPoints) || q.keyPoints.length < 3 || q.keyPoints.length > 5) e.push("keyPoints는 3~5개");
    if (q.keyPoints?.some((k) => !k.trim())) e.push("keyPoints에 빈 항목");
    return e;
  },
};

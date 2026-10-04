import { blankCells } from "./trace";
import type { AnyAnswer, Question } from "./registry";

/**
 * 문제 데이터에서 "정답 답안"을 만든다. 채점기에 넣으면 반드시 정답이 나와야 한다
 * (생성기·데이터 무결성 테스트에서 정답 키가 스스로 모순되지 않는지 확인하는 데 쓴다).
 */
export function answerKey(q: Question): AnyAnswer {
  switch (q.type) {
    case "mcq":
      return q.answerIndex;
    case "multi":
      return [...q.answerIndexes].sort((a, b) => a - b);
    case "ox":
      return q.answer;
    case "blank":
      return q.blanks.map((b) => b.accept[0]);
    case "order":
      return q.items.map((_, i) => i);
    case "match":
      return q.pairs.map((p) => p.right);
    case "classify":
      return q.items.map((it) => it.bucket);
    case "calc":
      return String(q.answer);
    case "trace":
      return Object.fromEntries(blankCells(q).map((b) => [b.key, b.cell.value]));
    case "graph":
      return q.answerKey;
  }
}

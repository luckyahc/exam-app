import { type BaseQ, duplicates, type QTypeCore, result } from "./base";

/**
 * 그래프 고르기: 개념 그래프 여러 개 중 올바른 것을 고른다. 그림은 이미지 파일이 아니라
 * 데이터(정규화 좌표 0..1)로 적고 인라인 SVG로 그린다 → 다크모드 색 토큰을 그대로 쓴다.
 */
export type GraphFigure = {
  kind: "curve";
  /** (x, y) 모두 0..1. 왼쪽 아래가 (0, 0) */
  points: [number, number][];
};
export interface GraphQ extends BaseQ<"graph"> {
  xLabel: string;
  yLabel: string;
  options: { key: string; label: string; figure: GraphFigure }[];
  answerKey: string;
}
export type GraphA = string | null;

export const graphCore: QTypeCore<GraphQ, GraphA, null> = {
  type: "graph",
  label: "그래프",
  emptyAnswer: () => null,
  isComplete: (_q, a) => a !== null,
  grade: (q, a) => result(a === q.answerKey ? 1 : 0, null),
  validate(q) {
    const e: string[] = [];
    if (q.options.length < 2 || q.options.length > 5) e.push("그래프 보기는 2~5개");
    const keys = q.options.map((o) => o.key);
    if (duplicates(keys).length) e.push(`중복 key: ${duplicates(keys).join(", ")}`);
    if (!keys.includes(q.answerKey)) e.push(`answerKey '${q.answerKey}'가 보기에 없음`);
    for (const o of q.options) {
      if (o.figure.points.length < 2) e.push(`${o.key}: 점은 2개 이상`);
      if (o.figure.points.some(([x, y]) => !(x >= 0 && x <= 1 && y >= 0 && y <= 1))) {
        e.push(`${o.key}: 좌표는 0..1`);
      }
    }
    return e;
  },
  choiceCount: (q) => q.options.length,
  applyChoice: (q, a, i) => q.options[i]?.key ?? a,
};

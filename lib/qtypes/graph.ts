import { type BaseQ, duplicates, type QTypeCore, result } from "./base";
import { type DcFigure, validateDcFigure } from "./dcFigure";

/**
 * 그래프 고르기: 개념 그래프 여러 개 중 올바른 것을 고른다. 그림은 이미지 파일이 아니라
 * 데이터(정규화 좌표 0..1)로 적고 인라인 SVG로 그린다 → 다크모드 색 토큰을 그대로 쓴다.
 */
export type GraphFigure =
  | {
      kind: "curve";
      /** (x, y) 모두 0..1. 왼쪽 아래가 (0, 0) */
      points: [number, number][];
    }
  /** 데이터 통신 그림 12종(Sprint 9) — 축·라벨을 그림이 직접 그리므로 xLabel·yLabel은 쓰지 않는다 */
  | { kind: "dc"; figure: DcFigure };
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
      if (o.figure.kind === "dc") {
        for (const m of validateDcFigure(o.figure.figure)) e.push(`${o.key}: ${m}`);
        continue;
      }
      if (o.figure.points.length < 2) e.push(`${o.key}: 점은 2개 이상`);
      if (o.figure.points.some(([x, y]) => !(x >= 0 && x <= 1 && y >= 0 && y <= 1))) {
        e.push(`${o.key}: 좌표는 0..1`);
      }
    }
    // 같은 그림 두 개는 구별할 수 없다
    const figs = q.options.map((o) => JSON.stringify(o.figure));
    if (duplicates(figs).length) e.push("같은 그림이 두 번 나옴");
    return e;
  },
  choiceCount: (q) => q.options.length,
  applyChoice: (q, a, i) => q.options[i]?.key ?? a,
};

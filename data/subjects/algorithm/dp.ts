import type { Question } from "@/types/question";
import { block, figureOf, jokboOf } from "./jokboSource";

// 동적 계획법(최단 경로 포함) — 족보 문항만(원문 그대로). 대조: docs/verification/algorithm-dp.md
// 그래프 그림은 원본 스캔(2022 기말 대비 테스트 2~5·7번)에서 자른 것 — public/jokbo/algorithm/
const base = { subject: "algorithm", chapter: "dp", shuffle: false } as const;

const grid = (rows: (string | number)[][]) => rows.map((r) => r.map((x) => String(x).padStart(4)).join(" ")).join("\n");
const MATRIX_RULE = "[행렬 이동 규칙]\n- 오른쪽이나 아래쪽으로만 이동할 수 있다.\n- 왼쪽, 위쪽, 대각선 이동은 허용하지 않는다.";
const matrixPath = (first: number) =>
  `행렬 경로 문제에서 아래의 행렬이 주어졌을 때, 행렬의 좌 상단에서 우 하단 까지 이동할 때, 방문한 칸에 있는 수들을 더한 값의 최대 값은?\n${block(
    ...MATRIX_RULE.split("\n"),
    "",
    ...grid([
      [first, 7, 2, 5],
      [5, 3, 11, 18],
      [7, 9, 3, 3],
      [8, 10, 14, 9],
    ]).split("\n"),
  )}`;
const pebble = (rows: number[][]) =>
  `다음의 제약 조건을 만족하여 아래의 표 위에 조약돌 놓기를 한다. 조약돌을 돌이 놓은 자리에 있는 수의 합이 최대가 되도록 조약돌 놓기를 목표로 한다. 아래의 표가 주어 졌을 때, 조약돌 놓기의 최대 값은?\n${block(
    "제약조건 (조약돌을 놓는 방법)",
    "- 가로나 세로로 인접한 두칸에 동시에 조약돌을 놓을 수 없다.",
    "- 각 열에는 적어도 하나의 조약돌을 놓는다.",
    "",
    ...grid(rows).split("\n"),
  )}`;
const head = (col: string[]) => ["     " + col.map((c) => c.padStart(4)).join(" ")];
const table = (rows: [string, ...(string | number)[]][]) => [...head(["a", "b", "c", "d"]), ...rows.map(([r, ...xs]) => `  ${r}  ` + xs.map((x) => String(x).padStart(4)).join(" "))];
const D0 = table([
  ["a", 0, 8, 1, 5],
  ["b", "∞", 0, 3, "∞"],
  ["c", "∞", "∞", 0, 3],
  ["d", "∞", -5, "∞", 0],
]);
const DB = table([
  ["a", 0, 8, 1, 5],
  ["b", "∞", 0, 3, "∞"],
  ["c", "∞", "∞", 0, 3],
  ["d", "∞", -5, -2, 0],
]);
const DC_BLANK = table([
  ["a", 0, 8, 1, "(C)"],
  ["b", "∞", 0, 3, "(B)"],
  ["c", "∞", "∞", 0, 3],
  ["d", "∞", -5, -2, 0],
]);
const L2_BLANK = table([
  ["a", 0, 0, 1, "(D)"],
  ["b", "∞", 0, 3, "(B)"],
  ["c", "∞", "(C)", 0, 3],
  ["d", "∞", -5, "(A)", 0],
]);
const GRAPH_ALT = "방향 그래프: a→b 가중치 8, a→c 1, a→d 5, b→c 3, c→d 3, d→b −5";
const graph = (id: string) => figureOf(id, GRAPH_ALT, 270, 180);
const VERTEX = "다음 그래프에서 **정점을 중심으로 동작하는 플로이드 워샬 알고리즘**을 이용하여 모든 정점들의 최단거리를 구하려 한다.";
const EDGE = "다음 그래프에서 **간선을 중심으로 동작하는 플로이드 워샬 알고리즘**을 이용하여 모든 정점들의 최단거리를 구하려 한다.";
const floydPrompt = (ask: string) =>
  `${VERTEX} 이 그래프의 D(b)(노드 a 와 노드 b까지만 고려했을 때, 각 쌍의 최단 거리 행렬)가 아래와 같을 때,\n${block("D(b)", ...DB)}\nD(c)(노드 a, 노드 b, 노드 c까지만 고려한 각 쌍의 최단 거리 행렬)를 아래와 같이 계산할 수 있다. 이 때, ${ask}의 값은?\n${block("D(c)", ...DC_BLANK)}`;
const edgePrompt = (ask: string) => `${EDGE} 그래프가 다음의 행렬로 표현될 때,\n${block(...D0)}\n다음의 L⁽²⁾ 의 ${ask}에 들어 갈 값은 무엇인가?\n${block("L⁽²⁾", ...L2_BLANK)}`;
const CHAIN = (ask: string) =>
  `행렬 곱 A₁A₂A₃A₄에 대한 최소의 곱셈 수를 계산하려고 한다. 각 행렬의 크기는 A₁이 1x2, A₂가 2x5, A₃이 5x3, A₄가 3x3이다. 이 행렬 곱을 위한 최소 비용을 계산하는 표는 아래와 같다. 이 때, ${ask}의 값을 계산하시오. (m(i, j)는 행렬 Aᵢ에서 Aⱼ까지의 최소 곱셈 수이다.)\n${block(
    "m(i, j)    1     2     3     4",
    "   1       0    10    25   (B)",
    "   2             0    30   (A)",
    "   3                   0    45",
    "   4                         0",
  )}`;

const questions: Question[] = [
  {
    ...base,
    ...jokboOf(["M23-3", "F23-9"], "generated"),
    id: "algorithm-dp-jokbo-001",
    topic: "상태를 나누는 DP",
    type: "blank",
    difficulty: 3,
    slideRef: "Lec5 p.22-34",
    prompt: `컴공이는 평행세계에 존재하는 다른 조선대학교에 다니고 있다. 그곳의 IT융합대학은 4년제이며, 알고리즘 공부를 장려하기 위한 PS장학금이 있다. PS장학금의 금액은 매 학기 달라질 수 있고 신청에는 몇 가지 제한이 있다. PS장학금은 같은 해의 1학기와 2학기 중 한 번만 신청할 수 있으며, 두 학기 모두 신청하지 않을 수도 있다. 또한 연속된 해의 동일한 학기에는 신청할 수 없다. 예를 들어, 2학년 1학기에 장학금을 받았다면, 2학년 2학기와 3학년 1학기에는 받을 수 없다. 컴공이는 알고리즘 성적이 우수하기 때문에 신청만 하면 지급받을 수 있다. 다음 4년 동안의 장학금 액수가 정해졌을 때 컴공이가 받을 수 있는 최대 장학금은 얼마일까?\n${block(
      "        1학기   2학기",
      "2023     400     500",
      "2024     800     600",
      "2025     100     300",
      "2026     300     700",
    )}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["2000"] }],
    explanation:
      "Lec5 p.22-34(조약돌 놓기의 패턴 DP와 같은 방식): 해마다 상태를 '1학기 받음 / 2학기 받음 / 안 받음' 세 가지로 두고, 연속된 해의 같은 학기만 금지해 누적 최댓값을 구한다. 최적: 2023 2학기 500 + 2024 1학기 800 + 2025 안 받음 + 2026 2학기 700 = 2000(2025 2학기 300을 받으면 2026 2학기를 못 받아 1900). 전수 탐색으로 확인 — lib/sim/algorithm/dp.ts.",
  },
  {
    ...base,
    ...jokboOf(["M23-5"], "generated", "matrix-chain"),
    id: "algorithm-dp-jokbo-002",
    topic: "연쇄 행렬 곱",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec5 p.35-53",
    prompt: CHAIN("(A)"),
    text: "답: {{0}}",
    blanks: [{ accept: ["48"] }],
    explanation: "Lec5 p.35-53: m(i, j) = min over k { m(i, k) + m(k+1, j) + pᵢ₋₁pₖpⱼ }. (A) = m(2, 4) = min( m(2,2) + m(3,4) + 2·5·3 = 0 + 45 + 30 = 75, m(2,3) + m(4,4) + 2·3·3 = 30 + 0 + 18 = 48 ) = 48(lib/sim/algorithm/dp.ts matrixChain).",
  },
  {
    ...base,
    ...jokboOf(["F23-6"], "generated", "matrix-chain"),
    id: "algorithm-dp-jokbo-003",
    topic: "연쇄 행렬 곱",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec5 p.35-53",
    prompt: CHAIN("(B)"),
    text: "답: {{0}}",
    blanks: [{ accept: ["34"] }],
    explanation: "Lec5 p.35-53: (B) = m(1, 4) = min( k=1: 0 + m(2,4) 48 + 1·2·3 = 54, k=2: 10 + 45 + 1·5·3 = 70, k=3: 25 + 0 + 1·3·3 = 34 ) = 34. (A) = m(2,4) = 48을 먼저 구해야 한다(lib/sim/algorithm/dp.ts).",
  },
  {
    ...base,
    ...jokboOf(["F22-13", "M23-8"], "jokbo", "matrix-path"),
    id: "algorithm-dp-jokbo-004",
    topic: "행렬 경로",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec5 p.15-21",
    prompt: matrixPath(6),
    choices: ["55", "57", "60", "62", "65"],
    answerIndex: 2,
    explanation:
      "LMS 해설(2022 기말 대비 테스트): 행렬 경로 알고리즘에 의해 계산하면, 60이 도출됨. 각 칸까지의 최대 합 = 그 칸의 값 + max(위 칸, 왼쪽 칸)으로 채운다(Lec5 p.15-21) — 경로 6 → 7 → 3 → 11 → 18 → 3 → 9 = 57보다 6 → 5 → 7 → 9 → 10 → 14 → 9 = 60이 크다. 2023 중간 캡처는 4열이 잘려 있어 같은 문제인 2022 기말 대비 원문을 썼다.",
  },
  {
    ...base,
    ...jokboOf(["T23-14", "F22-14"], "jokbo", "matrix-path"),
    id: "algorithm-dp-jokbo-005",
    topic: "행렬 경로",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec5 p.15-21",
    prompt: matrixPath(4),
    choices: ["56", "58", "60", "62", "64"],
    answerIndex: 1,
    explanation: "LMS 해설(2022 기말 대비 테스트): 행렬 경로 알고리즘에 의해 계산하면, 58이 도출됨(Lec5 p.15-21). 시작 칸만 6 → 4로 바뀐 문제라 앞 문항(60)보다 2 작다(lib/sim/algorithm/dp.ts).",
  },
  {
    ...base,
    ...jokboOf(["M23-10", "F23-7"], "generated"),
    id: "algorithm-dp-jokbo-006",
    topic: "격자 경로 DP",
    type: "blank",
    difficulty: 3,
    slideRef: "Lec5 p.15-21",
    prompt: `조컴공은 평행세계에 존재하는 다른 조선대학교에 다니고 있다. 그곳의 조선대학교에도 IT융합대학이 있는데, 대학 건물은 5층으로 이루어져 있고 북측 계단, 중앙 계단, 남측 계단을 통해 1층 단위로 오르내릴 수 있다. 현재 엘리베이터가 고장나 있어서 엘리베이터를 이용할 수 없다. 컴공이는 1층 북쪽 끝에 있는 문으로 들어와서 5층 남쪽 끝에 있는 강의실로 가려고 한다. 지각하면 안 되기 때문에 남쪽 또는 윗층으로만 이동할 수 있고, 북쪽이나 아랫층으로는 갈 수 없다. 컴공이는 학생들과 교수들도 인정하는 인싸이며, 강의실까지 가는 도중에 최대한 많은 친구들을 만나려고 한다. 친구들은 항상 경로의 정점(꼭짓점)에 서 있고 각 정점에 있는 친구의 수는 아래의 그림과 같을 때, 컴공이가 만날 수 있는 가장 많은 친구의 수는 얼마인가?\n${block(
      "                         ↙ 강의실",
      "  5층    1    2    1",
      "  4층    2    1    2",
      "  3층    0    2    2",
      "  2층    1    2    1",
      "  1층    2    0    2",
      "출발 ↗  북쪽 중앙 남쪽",
    )}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["12"] }],
    explanation:
      "Lec5 p.15-21(행렬 경로와 같은 DP): 1층 북쪽에서 시작해 남쪽(오른쪽) 또는 위층으로만 가므로, 각 정점까지 만난 친구 수의 최댓값 = 그 정점의 친구 수 + max(아래층 같은 칸, 같은 층 북쪽 칸). 층마다 (북, 중앙, 남) 최댓값은 1층 (2, 2, 4) → 2층 (3, 5, 6) → 3층 (3, 7, 9) → 4층 (5, 8, 11) → 5층 (6, 10, 12). 최적 경로: 1층 북 2 → 2층 북 1 → 2층 중앙 2 → 3층 중앙 2 → 3층 남 2 → 4층 남 2 → 5층 남 1 = 12(lib/sim/algorithm/dp.ts maxPathSum).",
  },
  {
    ...base,
    ...jokboOf(["M23-16"], "generated"),
    id: "algorithm-dp-jokbo-007",
    topic: "LCS",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec5 p.54-64",
    prompt: `"ABCD"와 "ABCDB", 두 문자열의 최장 공통 부분 순서를 구하려고 한다. LCS의 길이를 계산하는 알고리즘에 따라, 아래의 표를 채워 나간다고 할 때, (5) + (6) + (12) + (15)의 값은 무엇인가?\n${block(
      "         A     B     C     D",
      "    0    0     0     0     0",
      "A   0   (1)   (2)   (3)   (4)",
      "B   0   (5)   (6)   (7)   (8)",
      "C   0   (9)  (10)  (11)  (12)",
      "B   0  (13)  (14)  (15)  (16)",
    )}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["9"] }],
    explanation:
      "Lec5 p.54-64: 같은 문자면 왼쪽 위 + 1, 다르면 max(위, 왼쪽). 표(행 A·B·C·B, 열 A·B·C·D)를 채우면 (5) = 1, (6) = 2, (12) = 3, (15) = 3 → 합 9(lib/sim/algorithm/dp.ts lcsTable). 주의: 지문의 두 번째 문자열은 \"ABCDB\"지만 표의 행 문자는 A, B, C, B다 — 원문 그대로 두고 표 기준으로 계산했다.",
  },
  {
    ...base,
    ...jokboOf(["F22-12", "M23-19"], "jokbo", "pebble"),
    id: "algorithm-dp-jokbo-008",
    topic: "조약돌 놓기",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec5 p.22-34",
    prompt: pebble([
      [6, 7, 9, -5],
      [-8, 10, 11, 9],
      [11, 12, 7, 4],
    ]),
    choices: ["50", "51", "52", "53", "54"],
    answerIndex: 2,
    explanation:
      "LMS 해설(2022 기말 대비 테스트): 교재 228페이지 알고리즘에 따라 수행하면, 52가 계산됨. Lec5 p.22-34: 한 열에 놓을 수 있는 패턴은 위·가운데·아래·위+아래 네 가지이고, 인접한 열끼리 같은 행에 놓을 수 없는 패턴만 이어 붙여 열마다 최댓값을 구한다(lib/sim/algorithm/dp.ts pebbleMax). 2023 중간 캡처는 4열이 잘려 있어 같은 문제인 2022 기말 대비 원문을 썼다.",
  },
  {
    ...base,
    ...jokboOf(["T23-13", "F22-11"], "jokbo", "pebble"),
    id: "algorithm-dp-jokbo-009",
    topic: "조약돌 놓기",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec5 p.22-34",
    prompt: pebble([
      [4, 7, 12, -5],
      [-6, 10, 14, 9],
      [9, 12, 7, 4],
    ]),
    choices: ["50", "51", "52", "53", "54"],
    answerIndex: 1,
    explanation: "LMS 해설(2022 기말 대비 테스트): 교재 228페이지 알고리즘에 따라 수행하면, 51이 계산됨. 열마다 패턴(위·가운데·아래·위+아래)별 최댓값을 이어 구한다(Lec5 p.22-34, lib/sim/algorithm/dp.ts).",
  },
  {
    ...base,
    ...jokboOf(["F22-2"], "jokbo", "floyd"),
    ...graph("algorithm-dp-jokbo-010"),
    id: "algorithm-dp-jokbo-010",
    topic: "모든 쌍 최단 경로",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec5 p.123",
    prompt: floydPrompt("(B)"),
    choices: ["3", "∞", "5", "6", "4"],
    answerIndex: 3,
    explanation: "LMS 해설: ∞, 3 + 3 중 작은 값이므로, 6. D(c)는 중간 정점 c까지 허용하므로 (B) = b→d = min(D(b)의 b→d = ∞, b→c + c→d = 3 + 3) = 6(Lec5 p.123, lib/sim/algorithm/dp.ts floydUpTo).",
  },
  {
    ...base,
    ...jokboOf(["F22-3"], "jokbo", "floyd"),
    ...graph("algorithm-dp-jokbo-011"),
    id: "algorithm-dp-jokbo-011",
    topic: "모든 쌍 최단 경로",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec5 p.123",
    prompt: floydPrompt("(C)"),
    choices: ["3", "∞", "5", "6", "4"],
    answerIndex: 4,
    explanation: "LMS 해설: 5와 1 + 3 중 작은 값이므로, 4. (C) = a→d = min(D(b)의 a→d = 5, a→c + c→d = 1 + 3) = 4(Lec5 p.123).",
  },
  {
    ...base,
    ...jokboOf(["F23-8"], "generated", "floyd"),
    ...graph("algorithm-dp-jokbo-012"),
    id: "algorithm-dp-jokbo-012",
    topic: "모든 쌍 최단 경로",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec5 p.123",
    prompt: `${VERTEX} 이 그래프의 D(c)(노드 a, 노드 b, 노드 c까지만 고려했을 때, 각 쌍의 최단 거리 행렬)가 아래와 같을 때,\n${block(
      "D(c)",
      ...table([
        ["a", 0, 8, 1, 4],
        ["b", "∞", 0, 3, 6],
        ["c", "∞", "∞", 0, 3],
        ["d", "∞", -5, -2, 0],
      ]),
    )}\nD(d)(노드 a, 노드 b, 노드 c, 노드 d까지 고려한 각 쌍의 최단 거리 행렬)를 아래와 같이 계산할 수 있다. 이 때, (D)의 값은? (숫자만 입력함.)\n${block(
      "D(d)",
      ...table([
        ["a", 0, "(D)", 1, 4],
        ["b", "∞", 0, 3, 6],
        ["c", "∞", "(A)", 0, 3],
        ["d", "∞", -5, -2, 0],
      ]),
    )}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["-1", "−1"] }],
    explanation: "Lec5 p.123: D(d)는 중간 정점 d까지 허용하므로 (D) = a→b = min(D(c)의 a→b = 8, a→d + d→b = 4 + (−5)) = −1(lib/sim/algorithm/dp.ts floydUpTo).",
  },
  {
    ...base,
    ...jokboOf(["F22-4"], "jokbo", "edge-dp"),
    ...graph("algorithm-dp-jokbo-013"),
    id: "algorithm-dp-jokbo-013",
    topic: "간선 수 제한 거리 DP",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec5 p.133-138",
    prompt: edgePrompt("(A)"),
    choices: ["1", "-2", "3", "-5", "0"],
    answerIndex: 1,
    explanation: "LMS 해설: ∞, −2, ∞, ∞ 중 가장 작은 값. L⁽²⁾는 간선 2개 이하로 가는 최단 거리 — (A) = d→c = min_k(L⁽¹⁾[d][k] + w[k][c]) = d→b→c = −5 + 3 = −2(Lec5 p.133-138, lib/sim/algorithm/dp.ts edgeLimited). 원문 명칭 \"간선을 중심으로 동작하는 플로이드 워샬\"을 그대로 두었다.",
  },
  {
    ...base,
    ...jokboOf(["F23-4", "F22-5"], "jokbo", "edge-dp"),
    ...graph("algorithm-dp-jokbo-014"),
    id: "algorithm-dp-jokbo-014",
    topic: "간선 수 제한 거리 DP",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec5 p.133-138",
    prompt: `${EDGE} 그래프가 다음의 행렬로 표현될 때,\n${block(...D0)}\n다음의 L⁽²⁾ 의 (B)에 들어 갈 값은 무엇인가? (숫자로 입력함.)\n${block("L⁽²⁾", ...L2_BLANK)}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["6"] }],
    explanation: "LMS 해설(2022 기말 대비 테스트): ∞, ∞, 6, ∞ 중 가장 작은 값, 6. (B) = b→d를 간선 2개 이하로: b→c→d = 3 + 3 = 6(Lec5 p.133-138).",
  },
  {
    ...base,
    ...jokboOf(["F22-7"], "jokbo"),
    ...figureOf("algorithm-dp-jokbo-015", "방향 그래프: 0→a 8, 0→f 10, 0→g 13, f→a −11, a→b 7, f→b −5, f→g −3, g→e 8, g→d 8, e→f 12, e→c 5, b→c 5, c→d 4, d→e −7", 305, 213),
    id: "algorithm-dp-jokbo-015",
    topic: "단일 시작점 최단 경로",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec5 p.133-138",
    prompt: "다음의 그래프에서 정점 0에서 시작하여 다른 정점들에 이르는 최단 거리를 벨만-포드 알고리즘으로 구할 때, 정점 e까지의 최단 거리는 얼마인가?",
    choices: ["6", "7", "8", "9", "10"],
    answerIndex: 1,
    explanation: "LMS 해설: 벨만-포드 알고리즘을 수행하면, 노드 0에서 노드 e까지 경로는 0 -> f -> b -> c -> d -> e이므로 7이 됨(10 − 5 + 5 + 4 − 7). 간선 수 제한 DP(Lec5 p.133-138, optional)를 정점 수 − 1번 반복한 것과 같다(lib/sim/algorithm/dp.ts bellmanFord).",
  },
];

export default questions;

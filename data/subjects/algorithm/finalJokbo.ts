import type { Question } from "@/types/question";
import { block, figureOf, jokboOf } from "./jokboSource";

// 기말 범위(강의 자료 6 그리디 · 9 그래프) 족보 원문 문항(2026-11-03). 처음 족보를 넣을 때 "강의 1~5 범위 밖"으로 뺐던 문항 —
// docs/jokbo/algorithm/inventory.md §4 #112~122. 지문·보기는 원문 그대로(문제은행 태그 "[9-7]"·제목 "[겨울나기]"·배점만 뺌).
// F22는 LMS 정답·해설, F23(2023 기말)은 정답표가 없어 시뮬레이터로 정답을 구했다(finalJokbo.test.ts). 그림 = 원본 스캔에서 자름.
const G6 = { subject: "algorithm", chapter: "greedy", shuffle: false } as const;
const G9 = { subject: "algorithm", chapter: "graph", shuffle: false } as const;

export const greedyJokbo: Question[] = [
  {
    ...G6,
    ...jokboOf(["F23-2"], "generated"),
    id: "algorithm-greedy-jokbo-001",
    topic: "회의실 배정(활동 선택)",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec6 p.50-51",
    prompt: `뱀 한 마리가 겨울나기를 준비하고 있다. 뱀은 겨울잠을 자기 전 주위에 나타나는 사냥감들을 잡아먹고 많은 양분을 얻어두려고 한다.\n\n단, 사냥감들은 각각 어떤 시각에만 나타나고, 뱀이 그 시각에 공격하면 사냥에 성공하지만 그때 공격하지 않으면 사냥감은 바로 달아나 버린다.\n\n사냥에 성공한 뱀은 바로 먹이를 삼키게 되고, 먹이를 소화시키기 위해서 어느 정도의 휴식을 취해야 하는데 이때는 사냥을 할 수가 없다.\n\n소화시간은 사냥감에 따라 다를 수 있어서 잘못 먹었다가는 많은 사냥감들을 놓칠 수도 있다.\n\n아래와 같이 사냥감들의 등장 시각과 소화 시간이 주어질 때, 어떤 사냥감들을 사냥해야 가장 많은 수의 사냥감을 잡아먹을 수 있을까? 뱀이 잡아 먹을 수 있는 가장 많은 사냥감의 수를 계산하라.\n${block(
      "A(1, 4)",
      "B(5, 4)",
      "C(4, 2)",
      "D(5, 1)",
      "E(6, 1)",
      "F(1, 9)",
      "G(1, 3)",
      "H(2, 3)",
      "I(3, 3)",
      "J(3, 1)",
      "K(4, 1)",
      "L(5, 1)",
    )}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["4"] }],
    explanation:
      "(원본에 정답표 없음 — 직접 계산) 사냥감 X(등장 시각 t, 소화 시간 d)를 구간 [t, t+d]로 보면 회의실 배정 문제다. 종료 시각(t+d)이 이른 순으로 겹치지 않게 고른다: J(3~4) → K(4~5) → D(5~6) → E(6~7) = 4마리(G(1~4)로 시작해도 4). 소화가 끝나는 시각에 나타난 사냥감은 잡을 수 있다고 본다. 12개 중 겹치지 않는 조합 전수 탐색으로도 최대 4. 근거: Lec6 p.50-51(종료 시간이 가장 이른 회의순 배정만 최적해 보장).",
  },
  {
    ...G6,
    ...jokboOf(["F23-18"], "generated"),
    id: "algorithm-greedy-jokbo-002",
    topic: "그리디 스케줄링",
    type: "blank",
    difficulty: 3,
    slideRef: "Lec6 p.42-43",
    prompt: `알고리즘 겨울 캠프에 참여한 5명의 점심을 위해 유명한 업체인 두솥도시락에 5개의 다양한 도시락을 주문했다.\n\n도착한 도시락들은 냉장고에 잘 정리해 두었지만, 점심 시간이 되어서야 도시락을 데우는 데 쓸 전자레인지가 하나밖에 없다는 사실을 깨달았다.\n\n이 전자레인지는 출력이 작기 때문에 한 번에 하나의 도시락만 데울 수 있다.\n\n도시락을 다 데운 즉시 다음 도시락을 데울 수 있고, 데워진 도시락은 바로 먹을 수 있다.\n각 도시락마다 데우는 시간과 먹는 시간이 다를 수 있다.\n\n예를 들어 2개의 도시락에 대해 첫 번째 도시락의 데우는 시간이 1, 먹는 시간이 10이고 두 번째 도시락의 데우는 시간이 2, 먹는 시간이 2이면, 차례대로 도시락을 데웠을 때 첫 번째 도시락은 1+1=2의 시간에 다 먹을 수 있고, 두 번째 도시락은 1+2+2=5의 시간에 다 먹을 수 있다.\n\n점심 시간이 지체되면 알고리즘을 위한 프로그램을 진행하는데 차질이 생기기 때문에, 가장 빠른 시간에 점심 시간을 끝내려고 한다.\n\n점심 시간이 시작될 때부터 도시락을 데우기 시작하고, 모든 사람이 도시락을 다 먹으면 점심 시간이 끝난다.\n\n어느 순서로 도시락을 데워야 가장 빨리 점심 시간을 마칠 수 있을까?\n도시락을 데우는 순서를 변경할 수 있을 때, 가장 빨리 마칠 수 있는 점심 시간을 계산하라.\n\n아래의 리스트(5개 도시락)의 첫번째 수는 도시락을 데우는 데 걸리는 시간, 두번째 수는 먹는데 걸리는 시간이다.\n${block("A(1, 4)", "B(1, 9)", "C(1, 3)", "D(2, 3)", "E(3, 1)")}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["10"] }],
    explanation:
      "(원본에 정답표 없음 — 직접 계산, 풀이는 보충) 먹는 시간이 긴 도시락부터 데우는 그리디: B(1, 9) → A(1, 4) → C(1, 3) → D(2, 3) → E(3, 1). 다 먹는 시각 B 1+9 = 10, A 2+4 = 6, C 3+3 = 6, D 5+3 = 8, E 8+1 = 9 → 10. 어떤 순서든 B는 데우는 1 + 먹는 9 = 10 이후에 끝나므로 10보다 빨리 끝낼 수 없다(5! 순서 전수 탐색으로도 10). 근거: Lec6 p.42-43(작업 스케줄링 — 정렬 기준을 고르는 그리디). 강의 자료에 이 정렬 기준(먹는 시간 내림차순) 자체는 없다(보충).",
  },
];

const DFS_ALT = "무향 그래프: a-i, a-j, a-b, i-j, i-h, h-j, h-e, j-b, j-d, j-c, b-c, c-d, d-e, e-g, e-f";
export const graphJokbo: Question[] = [
  {
    ...G9,
    ...jokboOf(["F22-6"], "jokbo"),
    ...figureOf("algorithm-graph-jokbo-001", "방향 그래프: 0→a 8, 0→f 5, 0→g 11, a→b 10, f→a 2, f→b 1, f→g 3, b→c 2, e→f 12, e→c 5, g→e 8, g→d 8, d→e 7, c→d 4", 300, 210),
    id: "algorithm-graph-jokbo-001",
    topic: "다익스트라 알고리즘",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec9 p.60-62",
    prompt: "다음 그래프에서 정점 0에서 시작하여, 다른 정점에 이르는 최단 거리를 다익스트라 알고리즘으로 구하고자 한다. 정점 d까지의 최단 거리는 얼마인가?",
    choices: ["12", "13", "15", "16", "14"],
    answerIndex: 0,
    explanation: "LMS 해설: 노드 0에서 노드 d까지 최단 거리는 0 -> f -> b -> c -> d 이므로 12임(5 + 1 + 2 + 4). 근거: Lec9 p.60-62(Dijkstra, 이완). lib/sim/algorithm/graph.ts dijkstra로 확인.",
  },
  {
    ...G9,
    ...jokboOf(["F22-10", "F23-16"], "jokbo"),
    ...figureOf("algorithm-graph-jokbo-002", "무향 그래프: a-b 11, b-c 14, a-g 9, c-g 5, a-f 7, f-g 13, g-d 12, f-d 8, f-e 10, e-d 7", 285, 245),
    id: "algorithm-graph-jokbo-002",
    topic: "프림 알고리즘",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec9 p.35-41",
    prompt: "다음의 그래프에서 프림 알고리즘으로 최소 신장 트리를 구할 때 포함되는 노드의 순서로 바른 것은?\n(노드 a에서 프림 알고리즘을 시작한다.)",
    choices: ["a -> f -> d -> e -> g -> c -> b", "a -> f -> e -> d -> g -> c -> b", "a -> f -> d -> g -> e -> c -> b", "a -> f -> d -> e -> c -> g -> b", "a -> f -> d -> e -> g -> b -> c"],
    answerIndex: 0,
    explanation:
      "LMS 해설: 프림 알고리즘에 따라 집합 s 와 V-s사이에 가장 가까운 또는 작은 간선이 선택되므로, a -> f -> d -> e -> g -> c -> b의 순서로 선택된다(7, 8, 7, 9, 5, 11). 2023 기말 16번은 같은 그래프·같은 보기(보기 순서만 다름). 근거: Lec9 p.35, p.39-41.",
  },
  {
    ...G9,
    ...jokboOf(["F22-15"], "jokbo", "clockwise-search"),
    ...figureOf("algorithm-graph-jokbo-003", DFS_ALT, 634, 332),
    id: "algorithm-graph-jokbo-003",
    topic: "깊이 우선 탐색",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec9 p.26-29",
    prompt: "다음의 그래프에서 정점 a부터 시작하여 깊이 우선 탐색을 했을 때 방문하는 노드 순서를 바르게 나열한 것은?\n(**자식 노드들은 시계 방향 우선 순서로 방문**한다.)",
    choices: ["a -> i -> h -> e -> g -> f -> d -> c -> b -> j", "a -> i -> h -> e -> f -> g -> d -> c -> b -> j", "a -> i -> h -> e -> g -> f -> d -> j -> b -> c", "a -> i -> h -> e -> g -> f -> j -> d -> c -> b", "a -> b -> c -> d -> e -> f -> g -> h -> j -> i"],
    answerIndex: 0,
    explanation:
      "LMS 해설: 깊이 우선 탐색에서 자식노드들을 시계 방향 우선으로 방문하면, a -> i -> h -> e -> g -> f -> d -> c -> b -> j의 순서로 방문함. 각 정점의 이웃을 1시 방향부터 시계 방향으로 적은 인접 리스트(예: e: g, f, d, h / d: e, c, j / c: d, b, j)로 aDFS를 돌리면 같은 순서가 나온다. 보기 4는 e에서 d를 방문하지 않고 되돌아가 DFS가 아니다. 근거: Lec9 p.27-29.",
  },
  {
    ...G9,
    ...jokboOf(["F23-10"], "generated"),
    ...figureOf("algorithm-graph-jokbo-004", "방향 그래프: a→d, a→b, b→c, d→e, d→f, e→f, e→g, f→g, f→h", 565, 535),
    id: "algorithm-graph-jokbo-004",
    topic: "위상 정렬",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec9 p.47-48",
    prompt: "다음 그래프에서 위상정렬을 했을 때, 출력될 수 있는 가능한 위상 정렬의 결과가 아닌 것은?",
    choices: ["a->b->c->d->f->e->g->h", "a->d->e->b->c->f->g->h", "a->b->d->e->f->h->g->c", "a->b->c->d->e->f->h->g", "a->d->e->f->g->h->b->c"],
    answerIndex: 0,
    explanation:
      "(원본에 정답표 없음 — 직접 계산) 간선 e→f가 있으므로 e는 f보다 앞이어야 한다. 보기 1은 f가 e보다 앞이라 위상 순서가 아니다. 나머지는 모든 간선 x→y에서 x가 앞. 근거: Lec9 p.47(정점 x에서 y로 가는 간선이 있으면 x는 반드시 y보다 앞).",
  },
  {
    ...G9,
    ...jokboOf(["F23-13"], "generated", "clockwise-search"),
    ...figureOf("algorithm-graph-jokbo-005", DFS_ALT, 634, 332),
    id: "algorithm-graph-jokbo-005",
    topic: "너비 우선 탐색",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec9 p.30-32",
    prompt: "다음의 그래프에서 정점 a부터 시작하여 너비 우선 탐색을 했을 때 방문하는 노드 순서를 바르게 나열한 것은?\n(**자식 노드들은 1시방향에서 시작하여 시계 방향 순서로 큐에 입력** 된다.)",
    choices: ["a->b->j->i->h->d->c->e->g->f", "a->i->j->b->h->d->c->e->f->g", "a->i->j->b->h->c->d->e->g->f", "a->b->j->i->c->d->h->e->g->f", "a->i->j->b->h->d->c->e->g->f"],
    answerIndex: 4,
    explanation:
      "(원본에 정답표 없음 — 직접 계산) 1시 방향부터 시계 방향: a의 이웃 i, j, b를 큐에 → i에서 h → j에서 d, c → b(새 정점 없음) → h에서 e → d, c → e에서 g, f. 방문 순서 a i j b h d c e g f. 원본 스캔은 e 오른쪽이 잘려 있어, 같은 그래프인 2022 기말 대비 테스트 15번 그림을 붙였다. 근거: Lec9 p.31-32.",
  },
  {
    ...G9,
    ...jokboOf(["F23-14"], "generated"),
    ...figureOf("algorithm-graph-jokbo-006", "방향 그래프: a→i, a→j, a→b, j→i, i→h, j→h, j→b, h→g, g→f, f→j, f→b, f→c, b→c, c→e, e→d, d→c", 450, 470),
    id: "algorithm-graph-jokbo-006",
    topic: "강연결요소",
    type: "blank",
    difficulty: 2,
    slideRef: "Lec9 p.104-108",
    prompt: "아래의 유향 그래프에서 가장 큰 강연결요소(Strong Connected Component) 집합을 찾아라.\n찾은 가장 큰 강연결 요소 집합의 원소들을 소문자 알파벳 순서대로 기술하라.\n(소문자 알파벳 사이에 아무것도 쓰지 마시오.)\n(공백, 쉼표, 기타 구분자 작성 금지, 요구된 답변대로 작성되지 않을 시, 0점 처리함)",
    text: "답: {{0}}",
    blanks: [{ accept: ["fghij"] }],
    explanation:
      "(원본에 정답표 없음 — 직접 계산) j → h → g → f → j와 j → i → h로 i, j, h, g, f가 서로 양방향으로 도달한다. c → e → d → c는 3개, a·b는 각각 혼자. 가장 큰 요소 {f, g, h, i, j}. 근거: Lec9 p.104-105(stronglyConnectedComponent).",
  },
  {
    ...G9,
    ...jokboOf(["F23-17"], "generated"),
    ...figureOf("algorithm-graph-jokbo-007", "트리: 노드 v - 가운데 노드 1(이파리 4개, 이 5개가 집합 S) - 가운데 노드 2(이파리 4개) - 가운데 노드 3(이파리 4개) - 맨 아래 노드 1개", 340, 925),
    id: "algorithm-graph-jokbo-007",
    topic: "DFS 방문 순서",
    type: "blank",
    difficulty: 3,
    slideRef: "Lec9 p.26-29",
    prompt: "아래의 그래프를 노드 v부터 DFS를 수행하면서 방문 순서대로 번호를 부여할 때,\n집합 S에 속하는 노드들 중 가장 큰 방문 번호에서 가장 작은 방문 번호를 뺀 값을 집합 S의 DFS span이라 한다.\n노드 v에서 DFS를 수행 할 때, 발생하는 방문 순서는 여러 가지이다. 이 순서들에 대응하는 집합 S의 DFS span 중 최소값은 #1 이고, 최대값은 #2 이다.",
    text: "#1 = {{0}}, #2 = {{1}}",
    blanks: [{ accept: ["4"] }, { accept: ["15"] }],
    explanation:
      "(원본에 정답표 없음 — 직접 계산) v = 1, S의 가운데 노드 = 2. 최소: S의 이파리 4개를 먼저 방문(3~6) → 6 − 2 = 4. 최대: 아래쪽 부분 트리(노드 11개, 3~13)를 먼저 다 방문한 뒤 S의 이파리(14~17) → 17 − 2 = 15. 모든 DFS 순서 전수 탐색으로 확인. 근거: Lec9 p.26-27(aDFS는 인접 정점 순서에 따라 방문 순서가 달라짐).",
  },
  {
    ...G9,
    ...jokboOf(["F23-19"], "generated"),
    ...figureOf("algorithm-graph-jokbo-008", "무향 그래프 9정점: x-A 5, x-C 6, A-B 2, A-E 2, B-F 2, E-F 2, E-H 2, F-H 2, C-D 2, C-G 2, G-H 2 (A·B 위쪽, C·D 왼쪽, E·F 가운데, G·H 아래)", 395, 350),
    id: "algorithm-graph-jokbo-008",
    topic: "프림 알고리즘",
    type: "blank",
    difficulty: 3,
    slideRef: "Lec9 p.35-41, p.110",
    prompt: "다음의 그래프에서 프림 알고리즘을 이용하여 최소 신장트리를 찾으려 한다.\n알고리즘에서 간선의 가중치가 같아, 그 중 하나를 선택할 경우, 아무것이나 먼저 선택한다.\n노드 x에서 시작하여 프림 알고리즘을 시작할 때, 만들 수 있는 서로 다른 최소 신장 트리의 개수는 몇 개인가?\n과정은 달라도 결과가 같으면 동일한 트리로 간주한다.",
    text: "답: {{0}}",
    blanks: [{ accept: ["11"] }],
    explanation:
      "(원본에 정답표 없음 — 직접 계산) x에서는 5(x-A)가 6보다 작아 먼저 선택되고, 이후 가중치 2인 간선 9개로 나머지 8정점을 잇는다(x-C 6은 쓰지 않음). 가중치 2 간선 중 C-D·C-G·G-H는 꼭 들어가고, 사이클이 있는 부분(A-B-F-E 사각형 + E-F-H 삼각형, 간선 6개·정점 5개)에서 2개를 빼는 방법 C(6,2) = 15 중 사이클이 남는 4가지(F-H·E-H를 뺌 1, A-B·B-F·A-E 중 2개 3)를 빼면 11. 같은 가중치에서 아무것이나 고르는 프림은 모든 최소 신장 트리를 만들 수 있다(안정성 정리). 간선 조합 전수 탐색으로도 가중치 19인 신장 트리 11개. 근거: Lec9 p.35, p.110.",
  },
];

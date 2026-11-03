# 알고리즘 기말 주제-문항 표 (강의 자료 6 그리디 · 9 그래프)

문항 id는 `algorithm-<챕터>-` 접두사를 뺀 것. 쪽 = PDF 쪽. 추적·계산 정답은 `data/subjects/algorithm/greedy.test.ts`·`graph.test.ts`가 시뮬레이터(`lib/sim/algorithm/greedy.ts`·`graph.ts`)로 다시 구한다.

## 강의 자료 6 — 그리디 알고리즘 (챕터 `greedy`, 32문항)

| 주제(쪽) | 문항 |
|---|---|
| 그리디의 특징·전형적 구조(p.4-7) | concept-001 |
| 최적해가 보장되지 않는 예 1: 이진 트리 최적합 경로(p.8) | tree-001 |
| 최적해가 보장되지 않는 예 2: 액면이 배수가 아닌 동전(p.9-10) | coin-004 |
| 4.1 CoinChange 수행 과정(p.11-12) | coin-001 |
| CoinChange의 문제점(160원, p.13-14·17) | coin-002 |
| Review: 동전 거스름돈 DP(p.15-16) | coin-003 |
| 4.4 부분 배낭 vs 0-1 배낭(p.18) | knapsack-002, knapsack-003 |
| FractionalKnapsack 알고리즘·수행 과정(p.19-24) | knapsack-001 |
| 부분 배낭 시간 복잡도(p.25) | knapsack-003 |
| 4.5 집합 커버 문제·최적해·단순한 방법(2ⁿ-1, p.27-33) | setcover-002 |
| SetCover 알고리즘·수행 과정(p.34-39) | setcover-001 |
| 집합 커버 시간 복잡도(p.40) | setcover-003 |
| 4.6 작업 스케줄링 문제·네 가지 그리디 기준(p.42-43) | job-002 |
| JobScheduling 수행 과정(p.44-48) | job-001 |
| 작업 스케줄링 시간 복잡도(p.49) | job-003 |
| 회의실 배정(p.50-51, 필기 "시험") | room-001, room-002, room-003 |
| 4.7 허프만 압축 아이디어·접두부 특성(p.53-55) | huffman-003, huffman-004 |
| HuffmanCoding 수행 과정(p.56-61) | huffman-001 |
| 압축률(p.62) | huffman-002 |
| 복호화(p.63) | huffman-003 |
| 허프만 시간 복잡도(p.64) | huffman-004 |
| 요약: 최적 부분 구조(p.66, p.71) | concept-002 |
| 요약: 알고리즘별 시간 복잡도(p.67-69) | complexity-001 |
| 4.2 최소 신장 트리 정의·n-1 간선(p.72-74) | mst-001 |
| KruskalMST 수행 과정(p.75-83) | kruskal-001, kruskal-002 |
| Kruskal 시간 복잡도(p.84) | kruskal-002, mst-002 |
| PrimMST·D[v](p.85-97) | prim-001, prim-002 |
| Prim에 사이클이 없는 이유·시간 복잡도·Kruskal과 비교(p.98-100) | mst-002 |
| 4.3 최단 경로 ShortestPath·간선 완화(p.102-122) | dijkstra-001, dijkstra-002 |
| ShortestPath 시간 복잡도(p.123) | complexity-001 |

- 출제하지 않은 것: 각 절의 "응용" 쪽(p.26, 41, 52, 65, 101, 124 — 사례 나열), 학습목표의 "매트로이드"(p.2, 본문 슬라이드 없음).
- 4.2·4.3(MST·다익스트라)은 이 장에서는 강의 자료 6의 배열 D 의사코드(O(n²))로 묻고, 힙 버전·벨만-포드 등은 강의 자료 9 챕터에서 묻는다.

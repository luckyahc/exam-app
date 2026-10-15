# 대조 기록 — 알고리즘 일반 문항(족보에 없던 주제)

작성: 2026-10-15. 사용자 요청: 4장 최근접 점의 쌍(PDF의 좌표 예를 바탕으로 좌표를 새로 만듦), 5장 편집 거리·배낭·동전 거스름돈 등 기존 족보에 안 나온 문제를 족보 형식으로, 난이도 보통(2)·어려움(3).

- **분류**: 일반 문항(`origin` 없음) — "족보만 풀기"에는 들어가지 않고 "일반" 분류로 보인다. id는 `algorithm-{챕터}-{주제}-NNN`.
- **족보 형식**: 기존 족보처럼 "우리 교재의 … 알고리즘" 지문, 강의 자료 코드를 고정폭 원문 블록으로 붙이고 표·배열의 빈칸 (A)·(1)… 을 묻는다. 보기 순서 고정(`shuffle: false`), 숫자 이어 쓰기 빈칸("숫자사이에는 공백을 입력하지 마시오"), 코드의 (1)·(2)·(3) 표시를 묻는 객관식 등.
- **근거**: 강의 자료 4(`Lec4 p.40-60` 최근접 점의 쌍), 5(`Lec5 p.65-121` 편집 거리·배낭·동전 거스름돈). 좌표·문자열·물건·동전 값은 강의 자료 예와 다르게 새로 만들었다.
- **정답 계산**: `lib/sim/algorithm/closestPair.ts`(ClosestPair·중간 영역·호출 수), `lib/sim/algorithm/dp.ts`(editDistanceTable·knapsackTable·knapsackItems·knapsackGreedyByRatio·coinChange·greedyCoins). 시뮬레이터는 강의 자료 예로 기준값을 고정했다(`lib/sim/algorithm/algorithm.test.ts`: strong → stone 2, 배낭 K[4, 10] = 90, 16·10·5·1원 20원 DP 2·그리디 5, p.46 중간 영역). 문항 정답은 `data/subjects/algorithm/general.test.ts`가 시뮬레이터로 다시 계산해 고정한다.
- **p.46 중간 영역**: 슬라이드 본문은 d = 10일 때 (25,-)~(37,-)만 중간 영역이라고 적었지만, 정의(26 − 10 = 16 ~ 28 + 10 = 38)와 교수님 필기는 (17,-)도 포함한다. 시뮬레이터·문항은 정의대로 계산했다(closest-pair-001의 오답 보기 "(27,-), (30,-), (34,-)"가 이 실수를 따른 것).

## 문항별

| # | id | 유형 | 근거 | 난이도 | 정답 | 검증 |
|---|---|---|---|---|---|---|
| 1 | `algorithm-dc-closest-pair-001` | mcq | Lec4 p.45-46 | 2 | (21,-), (27,-), (30,-), (34,-) | middleRegion(d = min(8, 12) = 8 → 19~38) |
| 2 | `algorithm-dc-closest-pair-002` | blank | Lec4 p.47-54 | 3 | 10 / 13 / 5 / 5 | closestPair — 경계를 사이에 둔 P4-P5가 최근접 |
| 3 | `algorithm-dc-closest-pair-003` | mcq | Lec4 p.56-60 | 2 | T(n) = 2T(n/2) + Θ(nlogn), Θ(nlog²n) | 슬라이드 p.60 마스터 정리 |
| 4 | `algorithm-dc-closest-pair-004` | blank | Lec4 p.47-50 | 3 | 7 / 6 / 9 | closestPairCalls(13) |
| 5 | `algorithm-dp-edit-distance-001` | blank | Lec5 p.74-85 | 2 | 8 | editDistanceTable("bread", "board") |
| 6 | `algorithm-dp-edit-distance-002` | mcq | Lec5 p.65-85 | 3 | 3 | editDistanceTable("algorithm", "logarithm") |
| 7 | `algorithm-dp-edit-distance-003` | mcq | Lec5 p.70-77 | 2 | (1) 삽입, (2) 삭제, (3) 대체 또는 그대로 사용, α는 sᵢ = tⱼ이면 0, 아니면 1 | 슬라이드 p.71-75 |
| 8 | `algorithm-dp-knapsack-001` | blank | Lec5 p.87-105 | 2 | 55 / 40 / 65 | knapsackTable(C = 8) |
| 9 | `algorithm-dp-knapsack-002` | mcq | Lec5 p.87-105 | 3 | 69, 물건 2, 3 | knapsackTable·knapsackItems(C = 10), 비율 그리디 56 |
| 10 | `algorithm-dp-coin-change-001` | blank | Lec5 p.107-121 | 2 | 2 / 2 / 4 | coinChange·greedyCoins(15·9·1원) |
| 11 | `algorithm-dp-coin-change-002` | blank | Lec5 p.107-121 | 3 | 4223 | coinChange(10·7·1원, n = 21) |
| 12 | `algorithm-dp-coin-change-003` | mcq | Lec5 p.112-121 | 3 | 2회, 2 | coinChange(14·9·5·1원) updates[18] |
| 13 | `algorithm-dp-complexity-001` | mcq | Lec5 p.76-121 | 2 | 동전의 액면이 d₁ > d₂ > ⋯ > dₖ = 1이면, 큰 동전부터 최대한 사용하는 그리디 알고리즘이 항상 최소 동전 수를 찾는다. | 슬라이드 p.107·120(그리디 반례) |

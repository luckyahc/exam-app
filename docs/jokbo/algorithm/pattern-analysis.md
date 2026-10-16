# 알고리즘 족보 — 유형 분석과 유사 문제 (강의 1~3강)

작성: 2026-10-16. 기준: [`inventory.md`](./inventory.md) §4의 대표 문항. 데이터: `data/subjects/algorithm/patterns.ts`, 검증: `data/subjects/algorithm/patterns.test.ts`(이 문서의 두 표 = 데이터).

## 1. 범위

- 저장소의 강의 자료는 2~5번뿐이다(1번 자료 없음). 강의 1~3강 = 강의 자료 2(설계와 분석 → 챕터 `analysis`·`recurrence`)와 3(기본 데이터 및 정렬 → `sorting`).
- 대상 족보 대표 문항 32개 중 31개를 유형으로 묶었다.
- **범위 애매로 제외(1개)**: `recurrence-jokbo-011`(피보나치 중복 재귀). 챕터는 recurrence지만 출처가 강의 자료 5(DP) p.10-14다.
- 족보 원문 문항은 고치지 않았다. 생성 문항은 `origin` 없이 `basedOn: [족보 id]`를 쓴다. 난이도는 보통 2, 어려움 3이다.

## 2. 출제 관례 (족보 정답 기준 — 생성 문항도 그대로 따름)

- 배열 인덱스는 1부터 센다. partition은 교재 방식이다(마지막 원소가 피봇, 피봇 **이하**를 앞으로 보냄). 반환값은 피봇의 위치다.
- 힙은 교재의 **최소 힙**이다(부모 ≤ 자식 2i·2i+1). buildHeap은 i = ⌊n/2⌋부터 1까지 heapify를 부른다.
- 기수 정렬은 일의 자리부터 안정 정렬한다(LSD). 답은 단계별 위치를 공백 없이 숫자로 쓴다.
- 계수 정렬은 C1(빈도)과 C2(누적)로 나눠 쓴다. 값은 1부터 k까지다.
- "어떤 함수에 비례하는가"에 O(·)로 답할 때는 꼭 맞는 증가율(Θ의 뜻)을 고른다. 마스터 정리는 기본 세 경우만 쓴다. h(n) = f(n)인 경우가 경우 ③이다.
- 족보 원문의 ox는 예/아니오 mcq로 두고, 그 유형의 생성 문항은 ox로 만든다. "모두 선택"은 multi, 알파벳·숫자 입력은 blank다.
- 이론과 다른 족보 정답(sorting-jokbo-011: 정렬된 입력에서 힙 정렬 O(n))은 족보 기준을 정답으로 하고, 이론은 해설에 적는다.

## 3. 유형표

| 패턴 | 패턴명 | 해당 족보 ID | 문항 타입 | 묻는 능력 | 출제 방식의 특징 | 틀리기 쉬운 함정 |
|---|---|---|---|---|---|---|
| P1 | 입력별 수행 시간 → 상한·하한 판정 | analysis-jokbo-001, analysis-jokbo-002, analysis-jokbo-003, analysis-jokbo-004, analysis-jokbo-005 | mcq(예/아니오, 원문 ox) | 개념 | "입력 중 100개는 …, 나머지는 …" 목록. 원문 표기는 Ω(logn)처럼 붙여 씀 | 대부분의 입력에 끌려 Θ를 말함. 하한은 가장 빠른 입력, 상한은 가장 느린 입력이 정함 |
| P2 | 최악 시간과 O 진술 | analysis-jokbo-006 | multi("틀린 것을 모두") | 개념 | "단 두 개의 입력에 대해서만" | '최악의 경우 Θ(n²)'과 'O(n²)'이 같은 뜻이라고 봄 |
| P3 | 함수의 O·Ω·Θ 관계 | analysis-jokbo-007, analysis-jokbo-008 | multi(중복 선택) | 계산(최고차항) | 다항식 × 로그 거듭제곱. 정답이 1개뿐인 multi도 있음 | 낮은 차수 항이나 로그 인수를 잘못 비교함 |
| P4 | Big-O 포함 순서 | analysis-jokbo-009 | blank(알파벳 나열) | 개념·암기 | Lec2 p.47 포함 관계 그림. 공백 없이 입력 | n log n·n², nᵏ·2ⁿ의 순서를 바꿈 |
| P5 | 마스터 정리 적용 범위 | recurrence-jokbo-001 | multi("사용할 수 없는 것 모두") | 개념 | 빼기(n−1), 상수 이동(n/3+15), f/h = log²n | 로그 차이를 다항식 차이로 착각함 |
| P6 | 마스터 정리로 점근 구하기 | recurrence-jokbo-004, recurrence-jokbo-010 | mcq | 계산(h(n) = n^(log_b a)) | Θ 보기 5개. √n·√n logn 같은 보기가 섞임 | √(n log n)과 √n·log n을 헷갈림 |
| P7 | 코드 → 점화식 → 수행 시간 | recurrence-jokbo-002, recurrence-jokbo-005 | mcq | 추적·계산 | sample(A[], n) 의사코드. n/2 재귀 | 반환식의 상수배(2·sample)를 재귀 호출 수로 셈 |
| P8 | 반복문 수행 시간 | recurrence-jokbo-003 | mcq | 계산 | 3중 for. 안쪽 시작이 i·j | 범위가 줄어드니 차수도 준다고 봄 |
| P9 | 재귀 알고리즘 수행 시간 | recurrence-jokbo-006, recurrence-jokbo-007 | mcq | 개념·계산 | 유클리드·하노이 코드. 교수 답은 O(log a)·O(2ⁿ) | 상한이 여러 개 성립함(log b 등). move(1, …)의 뜻 |
| P10 | 재귀 트리 · 상수 이동 점화식 | recurrence-jokbo-008, recurrence-jokbo-009 | mcq | 계산 | 크기가 다른 부분 문제 두 개. T(n/2 + 10) | 깊이별 비용 합(등비급수인지, 그대로인지) |
| P11 | 계수 정렬 C2 | sorting-jokbo-001, sorting-jokbo-002 | mcq | 추적 | A·C1·C2·B 틀. 인덱스 1~4 | 누적 전 C1을 고름. 배열 한 칸 차이 |
| P12 | 선형 시간 정렬 고르기 | sorting-jokbo-003 | multi | 개념 | "x부터 y까지 서로 다른 (y−x+1)개". 하나 이상 맞으면 정답 인정 | 비교 정렬도 Θ(n)이라고 봄 |
| P13 | 입력 상태와 정렬 수행 시간 | sorting-jokbo-011, sorting-jokbo-012 | multi · mcq | 개념 | 거의 정렬·정렬된 입력. 교수 기준 힙 정렬 O(n) | 퀵 정렬은 정렬된 입력이 최악 |
| P14 | 힙 성질 판정 | sorting-jokbo-005 | multi | 추적 | 원소 8개 배열 5개. 인덱스 1부터 | 4번 칸의 자식이 8번 칸임을 놓침 |
| P15 | buildHeap 과정 · 시간 | sorting-jokbo-004, sorting-jokbo-010 | mcq · blank(알파벳 순서) | 추적·개념 | 단계 배열을 알파벳으로 섞음(원문 E = G 중복) | 한 원소가 여러 번 내려감, 교환 없는 단계 |
| P16 | partition 반환 위치 | sorting-jokbo-006, sorting-jokbo-007, sorting-jokbo-008 | mcq | 추적 | 원소 8개, 위치 보기 5개 | 피봇을 첫 원소로 잡음. 반환값이 위치임 |
| P17 | 기수 정렬 단계별 위치 | sorting-jokbo-009 | blank(숫자 나열) | 추적 | 네 자리 수 8개, 4단계 | 안정 정렬(같은 자릿값의 앞 단계 순서) |

## 4. 생성 문항 (40 = 패턴 17 × 약 2.4)

검증 열: 시뮬레이터 = `lib/sim/algorithm`(증가율 비교 `compareGrowth`·`masterCase`, 정렬·힙·partition·기수 정렬 시뮬레이터, 코드 그대로의 실행 횟수)로 정답을 계산하고, 오답 보기가 정답 조건을 만족하지 않는지 확인했다. 개념 = 정렬 방법의 성질을 묻는 문항이라 계산할 정답이 없다.

| # | id | 패턴 | 난이도 | 타입 | 정답 | 검증 |
|---|---|---|---|---|---|---|
| 1 | `algorithm-analysis-bound-001` | P1 | 보통 | ox | O | 시뮬레이터 |
| 2 | `algorithm-analysis-bound-002` | P1 | 어려움 | mcq | O(n²)과 Ω(logn) | 시뮬레이터 |
| 3 | `algorithm-analysis-bound-003` | P1 | 어려움 | mcq | 100n + 5 | 시뮬레이터 |
| 4 | `algorithm-analysis-worst-001` | P2 | 보통 | multi | 이 알고리즘의 점근적인 수행 시간은 Θ(n³)이다. / 이 알고리즘의 점근적 수행 시간은 O(n)이다. | 시뮬레이터 |
| 5 | `algorithm-analysis-worst-002` | P2 | 어려움 | multi | 이 알고리즘의 점근적인 수행 시간은 Θ(n²)이다. / 이 알고리즘의 점근적 수행 시간은 Ω(n²)이다. / 이 알고리즘의 최악의 경우 수행 시간은 O(nlogn)이다. | 시뮬레이터 |
| 6 | `algorithm-analysis-relation-001` | P3 | 보통 | multi | Ω(n²) / O(n³) / Θ(n² log n) | 시뮬레이터 |
| 7 | `algorithm-analysis-relation-002` | P3 | 어려움 | multi | O(n²) / Ω(n log n) / Ω(n) | 시뮬레이터 |
| 8 | `algorithm-analysis-relation-003` | P3 | 어려움 | multi | Θ(2ⁿ) / Ω(n¹⁰⁰) / Ω(n²) | 시뮬레이터 |
| 9 | `algorithm-analysis-order-001` | P4 | 보통 | blank | BFDEAGC | 시뮬레이터 |
| 10 | `algorithm-analysis-order-002` | P4 | 어려움 | blank | BGCDFAE | 시뮬레이터 |
| 11 | `algorithm-recurrence-master-apply-001` | P5 | 보통 | multi | T(n) = T(n − 2) + n / T(n) = 2T(n/2 + 5) + n / T(n) = 2T(n/2) + n/log n | 시뮬레이터 |
| 12 | `algorithm-recurrence-master-apply-002` | P5 | 어려움 | multi | T(n) = 2T(n/2) + n log n / T(n) = 0.5T(n/2) + n / T(n) = 4T(n/2) + n²/log n | 시뮬레이터 |
| 13 | `algorithm-recurrence-master-001` | P6 | 보통 | mcq | Θ(n²) | 시뮬레이터 |
| 14 | `algorithm-recurrence-master-002` | P6 | 어려움 | mcq | Θ(n^(log₂7)) | 시뮬레이터 |
| 15 | `algorithm-recurrence-master-003` | P6 | 어려움 | mcq | 4 | 시뮬레이터 |
| 16 | `algorithm-recurrence-code-001` | P7 | 보통 | mcq | Θ(n) | 시뮬레이터 |
| 17 | `algorithm-recurrence-code-002` | P7 | 어려움 | mcq | Θ(n² logn) | 시뮬레이터 |
| 18 | `algorithm-recurrence-code-003` | P7 | 어려움 | mcq | Θ(n) | 시뮬레이터 |
| 19 | `algorithm-recurrence-loop-001` | P8 | 보통 | mcq | Θ(n³) | 시뮬레이터 |
| 20 | `algorithm-recurrence-loop-002` | P8 | 어려움 | mcq | Θ(n²) | 시뮬레이터 |
| 21 | `algorithm-recurrence-recursive-001` | P9 | 보통 | mcq | 10 | 시뮬레이터 |
| 22 | `algorithm-recurrence-recursive-002` | P9 | 어려움 | mcq | 10 | 시뮬레이터 |
| 23 | `algorithm-recurrence-tree-001` | P10 | 보통 | mcq | O(nlogn) | 시뮬레이터 |
| 24 | `algorithm-recurrence-tree-002` | P10 | 보통 | mcq | O(n²) | 시뮬레이터 |
| 25 | `algorithm-recurrence-tree-003` | P10 | 어려움 | mcq | O(nlogn) | 시뮬레이터 |
| 26 | `algorithm-sorting-counting-001` | P11 | 보통 | mcq | 2, 5, 7, 10 | 시뮬레이터 |
| 27 | `algorithm-sorting-counting-002` | P11 | 어려움 | mcq | [2, 4, 1, 5, 2, 4, 2, 4, 5] | 시뮬레이터 |
| 28 | `algorithm-sorting-linear-001` | P12 | 보통 | multi | 기수정렬 / 계수정렬 | 개념 |
| 29 | `algorithm-sorting-linear-002` | P12 | 어려움 | multi | 기수정렬 / 계수정렬 | 개념 |
| 30 | `algorithm-sorting-input-001` | P13 | 보통 | mcq | Θ(n²) | 시뮬레이터 |
| 31 | `algorithm-sorting-input-002` | P13 | 어려움 | multi | 삽입 정렬 / 계수 정렬 | 시뮬레이터 |
| 32 | `algorithm-sorting-heap-001` | P14 | 보통 | multi | [5, 9, 7, 12, 10, 8, 20, 15] / [5, 8, 7, 12, 10, 9, 20, 15] | 시뮬레이터 |
| 33 | `algorithm-sorting-heap-002` | P14 | 어려움 | multi | [3, 3, 4, 5, 3, 6, 4, 9, 5] / [1, 2, 3, 4, 5, 6, 7, 8, 9] / [1, 3, 2, 7, 4, 5, 6, 8, 9] | 시뮬레이터 |
| 34 | `algorithm-sorting-buildheap-001` | P15 | 보통 | blank | DBFAEC | 시뮬레이터 |
| 35 | `algorithm-sorting-buildheap-002` | P15 | 어려움 | mcq | 6 | 시뮬레이터 |
| 36 | `algorithm-sorting-partition-001` | P16 | 보통 | mcq | 4 | 시뮬레이터 |
| 37 | `algorithm-sorting-partition-002` | P16 | 어려움 | mcq | 6 | 시뮬레이터 |
| 38 | `algorithm-sorting-partition-003` | P16 | 어려움 | mcq | [30, 10, 80, 50, 20, 70, 40, 45] | 시뮬레이터 |
| 39 | `algorithm-sorting-radix-001` | P17 | 보통 | blank | 6284 | 시뮬레이터 |
| 40 | `algorithm-sorting-radix-002` | P17 | 어려움 | blank | 523 | 시뮬레이터 |

- 족보 기준(교수 채점: 정렬된 입력에서 힙 정렬 O(n))은 족보 원문 sorting-jokbo-011에만 적용한다. 생성 문항 `algorithm-sorting-input-002`는 "Θ(n)에 정렬하는 것"을 물어 이론으로 정답(삽입·계수)이 하나로 정해지며, 힙 정렬은 오답(Θ(n log n), 비교 횟수로 확인)이다.
- 마스터 정리 적용 문항(P5)에서 빼기·상수 이동은 모양 규칙으로 판정한다. a·b·f(n)이 있는 식은 `masterCase`로 f(n)/h(n)의 차수를 계산해 판정한다.
- 강의 자료 2에서 확인(2026-10-16): 정규 조건 af(n/b) ≤ cf(n)(c < 1)은 마스터 정리 ②에 있어 "(보충)" 표시를 뺐다. a ≥ 1·b > 1 조건은 강의 자료에 없어 "(보충)"을 유지한다.

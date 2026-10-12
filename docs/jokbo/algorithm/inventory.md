# 알고리즘 족보 — 자료 목록 · 문항 목록 · 중복 판정 (Sprint 18)

작성: 2026-10-12. 규칙: [`docs/jokbo-plan.md`](../../jokbo-plan.md). 이후 스프린트는 이 문서와 `extracted/`만 쓴다(원본 재열람 금지).

## 1. 자료 목록

| 파일 | 형식 | 쪽 | 문항 수 | 해설 | 연도/학기 | 텍스트 저장 |
|---|---|---|---|---|---|---|
| `source/algorithm/jokbo/알고리즘 족보모음집.zip` | zip | — | 아래 내부 파일 | — | — | 압축 해제 후 판독 |
| ├ `MD/시험범위_1~5_족보_문제.md` | md(남이 만든 전사본) | — | 111(범위 안만) | — | — | `extracted/zip-MD-족보_문제.md` |
| ├ `MD/시험범위_1~5_족보_상세해설.md` | md(남이 만든 풀이) | — | 111 | 계산 풀이(원본 해설 아님) | — | `extracted/zip-MD-족보_상세해설.md` |
| ├ `MD/시험범위_1~5_원본대조표.md` | md | — | 대응표·제외 목록 | — | — | `extracted/zip-MD-원본대조표.md` |
| ├ `PDF/*.pdf` 3개 | pdf | — | 위 md와 같은 내용 | — | — | 읽지 않음(md와 중복) |
| ├ `원본참조/E19/알고리즘 예상문제(2019).docx` | docx | — | 5 | [답] 있음(4번 빈칸) | 2019-10-24 중간(02분반) | `extracted/E19-알고리즘 예상문제(2019).md` |
| ├ `원본참조/M21/*.jpg` 9장 | 이미지 | — | 18(파일명 기준 1~10, 12~17, 19, 20) | 첨부 채점 답 일부(16) | 2021 중간 | 전사본 md로 갈음 |
| ├ `원본참조/M22/…해설(교수 직접) 1.pdf` | pdf(스캔) | 37 | 20(1~15, 번호 미표기 1, 16~19) | 교수 해설 있음 | 2022 중간 | 전사본 md로 갈음 |
| ├ `원본참조/M23/*` 25장 | 이미지 | — | 25 | 없음 | 2023 중간 | 전사본 md로 갈음 |
| ├ `원본참조/T22/*.png` 10장 | 이미지 | — | 16(1~6, 8, 11~18, 20) | 첨부 채점 기준(6) | 2022 중간 대비 테스트 | 전사본 md로 갈음 |
| ├ `원본참조/S22/*.png` 6장 | 이미지 | — | 6(3, 7, 9, 10, 13, 14) | 없음 | 2022 중간 대비 특별 시험 | 전사본 md로 갈음 |
| ├ `원본참조/T23/*.jpg` 14장 | 이미지 | — | 14 | 채점 기준(9) | 2023 중간 대비 테스트 | 전사본 md로 갈음 |
| ├ `원본참조/F22/*.png` 8장 | 이미지 | — | 12(2~7, 10~15) | 없음 | 2022 기말 대비 테스트 | 전사본 md로 갈음 |
| ├ `원본참조/2023 알고리즘 기말기출.pdf` | pdf(스캔) | 31 | 20 | 없음 | 2023 기말 | 전사본 md로 갈음(범위 안 5문항만 전사) |
| └ `원본그림/*.png` 2장 | 이미지 | — | (F22 2~5·7번 그래프) | — | — | 간선 목록이 전사본에 있음 |
| `source/algorithm/jokbo/2022 알고리즘 중간고사 해설(교수 직접) 1 1.pdf` | pdf(스캔) | 37 | 20 | 교수 해설 | 2022 중간 | zip의 M22와 같은 시험(쪽 수·크기 같음, 해시만 다름) → 중복 파일 |
| `source/algorithm/jokbo/23년도 알고리즘(강문수).pdf` | pdf(스캔) | 26 | 25 | 없음(선택 표시만) | 2023 중간 | zip의 M23과 같은 시험(2번 보기 대조) → 중복 파일 |
| `source/algorithm/2~5. 알고리즘-2026-*.pdf` 4개 | 강의 자료 | — | — | — | 2026 | Sprint 21에서 해설 근거로 필요한 쪽만 |

- 읽지 못한 파일: 없음. hwp 없음.
- 원본 판독 방식: 스캔·이미지 원본(M21·M22·M23·T22·S22·T23·F22·F23)은 zip 안 전사본 md가 이미 문항별로 옮겨 두었으므로 그것을 텍스트 원본으로 저장했다(토큰 절약). 전사본은 **강의자료 1~5 범위 문항만** 옮겼다 — 범위 밖 문항은 번호·주제 묶음만 대조표에 있다.
- 전사본 해설은 원본 해설이 아니라 전사자가 계산한 풀이다. `explanationSource: "jokbo"`는 원본에 해설이 있는 문항(M22 교수 해설, E19 [답])만 쓴다.
- 대조표에 번호만 있고 원본 파일에 없는 번호(14개, 문항 수에 넣지 않음): M21 11·18, T22 7·9·10·19, F22 1·8·9·16~20.

## 2. 집계

| 항목 | 수 |
|---|---|
| 원문 문항(파일에 있는 것) | 136 |
| 범위 밖(강의자료 1~5에 없는 주제) | 25 |
| 범위 안 원문 | 111 |
| 대표 문항 | 57 |
| 같은 문제로 합친 원문 | 54 |
| variantGroup | 13 |
| 애매 | 0 |
| 원본 해설 있는 원문(범위 안) | 19 (M22 16, E19 3) — 채점 기준만 3(M21 5·T22 6·T23 9) |

## 3. 챕터 체계 (족보에 나온 주제만)

| 챕터 id | 제목 | 강의 자료 | 대표 문항 |
|---|---|---|---|
| `analysis` | 알고리즘 분석 · 점근 표기 | 자료 1·2 | 10 |
| `recurrence` | 재귀 · 점화식 · 마스터 정리 | 자료 2 | 11 |
| `sorting` | 정렬 · 힙 · 선형 시간 정렬 | 자료 3 | 12 |
| `dc` | 분할 정복 · 선택 | 자료 4 | 7 |
| `dp` | 동적 계획법(최단 경로 DP 포함) | 자료 5 | 17 |

그리디·그래프 탐색·트리(B-/레드블랙)·NP는 족보에 있으나 강의 자료 1~5에 없어 범위 밖으로 두었다(§5).

## 4. 범위 안 문항 목록과 판정

열: 원문 위치(전사본 새 번호 · 원본 약어-번호) / 요약 / 판정 / 해설 / 예정 유형 / 예정 챕터·토픽.
판정: **대표 → id**, **같은 문제 → 대표 id**, vg = variantGroup(`algorithm-vg-…`).

| # | 원문 | 요약 | 판정 | 해설 | 유형 | 챕터 · 토픽 |
|---|---|---|---|---|---|---|
| 1 | E19-1 | 순차 탐색 평균 비교 (n+1)/2 | 대표 `algorithm-analysis-jokbo-001` | 있음(답안) | blank | analysis · 순차 탐색 |
| 2 | E19-3 | 배낭 표 K[3,10]=70 이유(서술) | 대표 `algorithm-dp-jokbo-001` | 있음(답안) | blank(점화식 값) | dp · 0-1 배낭 |
| 3 | E19-4 | n비트 정수 분할 정복 곱셈 O(n²) 증명(서술) | 대표 `algorithm-dc-jokbo-001` | 없음(답 빈칸) | blank(T(n)=4T(n/2)+Θ(n)) | dc · 정수 곱셈 |
| 4 | E19-5 | 1로 만들기 최소 연산(설계) | 대표 `algorithm-dp-jokbo-002` | 있음(답안·표) | blank(D[x] 값) | dp · 1차원 DP |
| 5 | M21-1 | n! 입력(n log n·log n·n) — Ω(log n)? | 대표 `algorithm-analysis-jokbo-002`, vg `nfact-bounds` | 없음 | ox | analysis · 상한·하한 |
| 6 | M21-2 | 10개 입력 n, 나머지 n log n — Θ(n log n)? | 대표 `algorithm-analysis-jokbo-005`, vg `ten-inputs` | 없음 | ox | analysis · 상한·하한 |
| 7 | M21-3 | 계수 정렬 C2, A=[3,2,3,1,1,4,2,3,1,2] | 대표 `algorithm-sorting-jokbo-001`, vg `counting-c2` | 없음 | mcq | sorting · 계수 정렬 |
| 8 | M21-4 | 정렬된 입력의 select 수행 시간 | 대표 `algorithm-dc-jokbo-002` | 없음 | mcq | dc · 평균 선형 선택 |
| 9 | M21-5 | 연속 자연수 i번째 — 어떤 정렬 | 대표 `algorithm-sorting-jokbo-003` | 채점 기준(④·⑤ 중 하나 이상) | multi | sorting · 선형 시간 정렬 |
| 10 | M21-7 | 마스터 정리 쓸 수 없는 점화식 모두 | 대표 `algorithm-recurrence-jokbo-001` | 없음 | multi | recurrence · 마스터 정리 적용 범위 |
| 11 | M21-8 | sample: 반복문 + 재귀 2회(n/2) | 대표 `algorithm-recurrence-jokbo-002` | 없음 | mcq | recurrence · 코드 수행 시간 |
| 12 | M21-9 | 정렬된 배열 buildHeap 시간 | 대표 `algorithm-sorting-jokbo-004` | 없음 | mcq | sorting · 힙 구성 |
| 13 | M21-10 | 행렬 곱 3중 반복문 | 대표 `algorithm-recurrence-jokbo-003` | 없음 | mcq | recurrence · 반복문 수행 시간 |
| 14 | M21-13 | T(n)=3T(n/3)+Θ(n) | 대표 `algorithm-recurrence-jokbo-004`, vg `master-apply` | 없음 | mcq | recurrence · 마스터 정리 |
| 15 | M21-14 | 힙인 배열 모두 | 대표 `algorithm-sorting-jokbo-005` | 없음 | multi | sorting · 힙 성질 |
| 16 | M21-15 | linearSelect 7개 그룹 분할 비율 | 대표 `algorithm-dc-jokbo-003`, vg `linear-select-group` | 없음 | mcq | dc · 최악 선형 선택 |
| 17 | M21-16 | select 상대 순위 (목표 8 ↔ 호출 i=3 충돌) | 대표 `algorithm-dc-jokbo-005`, vg `select-rank` | 첨부 채점 답 | mcq(조건 정리) | dc · 평균 선형 선택 |
| 18 | M21-17 | n + 2·sample(n/2) 수행 시간 | 대표 `algorithm-recurrence-jokbo-005` | 없음 | mcq | recurrence · 코드 수행 시간 |
| 19 | M21-19 | n³log²n+2n log³n 관계 모두 | 대표 `algorithm-analysis-jokbo-008`, vg `asym-relation` | 없음 | multi | analysis · O·Ω·Θ 관계 |
| 20 | M21-20 | partition [12,70,50,20,30,25,40,55] 반환 위치 | 대표 `algorithm-sorting-jokbo-006`, vg `partition` | 없음 | mcq | sorting · partition |
| 21 | M22-1 | 유클리드 알고리즘 복잡도 | 대표 `algorithm-recurrence-jokbo-006` | 있음(교수) | mcq(정답 하나로 정리) | recurrence · 재귀 수행 시간 |
| 22 | M22-2 | 하노이 탑 move 복잡도 | 대표 `algorithm-recurrence-jokbo-007` | 있음(교수) | mcq | recurrence · 재귀 수행 시간 |
| 23 | M22-3 | n! 입력 — Ω(n)? | 대표 `algorithm-analysis-jokbo-003`, vg `nfact-bounds` | 있음(교수) | ox | analysis · 상한·하한 |
| 24 | M22-4 | 두 입력만 n² — 틀린 것 모두 | 대표 `algorithm-analysis-jokbo-007` | 있음(교수) | multi | analysis · 최악 시간과 O |
| 25 | M22-5 | Big-O 집합 작은 것부터 | 대표 `algorithm-analysis-jokbo-010` | 있음(교수) | order | analysis · Big-O 포함 관계 |
| 26 | M22-6 | T(n)=T(n/4)+T(n/2)+n² | 대표 `algorithm-recurrence-jokbo-008` | 있음(교수) | mcq | recurrence · 재귀 트리 |
| 27 | M22-7 | T(n)=2T(n/2+10)+n | 대표 `algorithm-recurrence-jokbo-009` | 있음(교수) | mcq | recurrence · 상수 이동 점화식 |
| 28 | M22-8 | T(n)=3T(n/9)+√n | 대표 `algorithm-recurrence-jokbo-010`, vg `master-apply` | 있음(교수) | mcq | recurrence · 마스터 정리 |
| 29 | M22-9 | 계수 정렬 C2 (7과 같은 배열) | 같은 문제 → `algorithm-sorting-jokbo-001` | 있음(교수) | — | — |
| 30 | M22-10 | partition [50,70,30,20,55,25,40,12] | 대표 `algorithm-sorting-jokbo-007`, vg `partition` | 있음(교수) | mcq | sorting · partition |
| 31 | M22-11 | 기수 정렬 단계별 0283 위치 | 대표 `algorithm-sorting-jokbo-009` | 있음(교수) | blank(trace) | sorting · 기수 정렬 |
| 32 | M22-미표기 | buildHeap 단계 그림 순서 | 대표 `algorithm-sorting-jokbo-010` | 있음(교수) | order(보기 E=G 중복 정리) | sorting · 힙 구성 |
| 33 | M22-12 | 거의 정렬된 입력 — 더 나은 정렬 모두 | 대표 `algorithm-sorting-jokbo-011` | 있음(교수) | multi | sorting · 입력 특성과 정렬 |
| 34 | M22-13 | select 과정 빈칸(8번째) | 대표 `algorithm-dc-jokbo-007` | 있음(교수, 오류 인정) | blank | dc · 평균 선형 선택 |
| 35 | M22-14 | linearSelect 9개 그룹 분할 비율 | 대표 `algorithm-dc-jokbo-004`, vg `linear-select-group` | 있음(교수) | mcq | dc · 최악 선형 선택 |
| 36 | M22-15 | 정렬된 입력의 select (8과 같음) | 같은 문제 → `algorithm-dc-jokbo-002` | 있음(교수) | — | — |
| 37 | M23-1 | 연속 자연수 정렬(복수 선택·보기 순서 다름) | 같은 문제 → `algorithm-sorting-jokbo-003` | 없음 | — | — |
| 38 | M23-2 | 힙인 배열 모두(보기 순서 다름) | 같은 문제 → `algorithm-sorting-jokbo-005` | 없음 | — | — |
| 39 | M23-3 | 4년 장학금 최대 합 | 대표 `algorithm-dp-jokbo-003` | 없음 | blank(calc) | dp · 상태를 나누는 DP |
| 40 | M23-4 | 유클리드(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-006` | 없음 | — | — |
| 41 | M23-5 | 연쇄 행렬 곱 m 표 (A) | 대표 `algorithm-dp-jokbo-004`, vg `matrix-chain` | 없음 | blank | dp · 연쇄 행렬 곱 |
| 42 | M23-6 | buildHeap 단계 순서 | 같은 문제 → `algorithm-sorting-jokbo-010` | 없음 | — | — |
| 43 | M23-7 | n + 2·sample(n/2)(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-005` | 없음 | — | — |
| 44 | M23-8 | 행렬 최대 합 경로(시작 6, 4열 잘림) | 같은 문제 → `algorithm-dp-jokbo-006` (보이는 값·보기 집합이 F22-13과 일치) | 없음 | — | — |
| 45 | M23-9 | n! 입력 — Ω(n)?(보기 순서 다름) | 같은 문제 → `algorithm-analysis-jokbo-003` | 없음 | — | — |
| 46 | M23-10 | 계단 경로 친구 최대 | 대표 `algorithm-dp-jokbo-008` | 없음 | blank(calc) | dp · 격자 경로 DP |
| 47 | M23-11 | 거의 정렬된 원소(보기 순서 다름) | 같은 문제 → `algorithm-sorting-jokbo-011` | 없음 | — | — |
| 48 | M23-12 | 3T(n/9)+√n(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-010` | 없음 | — | — |
| 49 | M23-13 | Big-O 집합 순서 | 같은 문제 → `algorithm-analysis-jokbo-010` | 없음 | — | — |
| 50 | M23-14 | 반복문 + 재귀 2회(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-002` | 없음 | — | — |
| 51 | M23-15 | 9개 그룹(보기 순서 다름) | 같은 문제 → `algorithm-dc-jokbo-004` | 없음 | — | — |
| 52 | M23-16 | LCS 표 (5)+(6)+(12)+(15) (문자열·표 불일치) | 대표 `algorithm-dp-jokbo-009` | 없음 | blank | dp · LCS |
| 53 | M23-17 | select 과정 빈칸 | 같은 문제 → `algorithm-dc-jokbo-007` | 없음 | — | — |
| 54 | M23-18 | 2T(n/2+10)+n(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-009` | 없음 | — | — |
| 55 | M23-19 | 조약돌 놓기(4열 잘림) | 같은 문제 → `algorithm-dp-jokbo-010` (보이는 값·보기 집합이 F22-12와 일치) | 없음 | — | — |
| 56 | M23-20 | 정렬된 입력 퀵 정렬 | 대표 `algorithm-sorting-jokbo-012` | 없음 | mcq | sorting · 퀵 정렬 |
| 57 | M23-21 | 계수 정렬 C2(보기 순서 다름) | 같은 문제 → `algorithm-sorting-jokbo-001` | 없음 | — | — |
| 58 | M23-22 | 기수 정렬 0283 위치 | 같은 문제 → `algorithm-sorting-jokbo-009` | 없음 | — | — |
| 59 | M23-23 | 하노이 탑(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-007` | 없음 | — | — |
| 60 | M23-24 | 두 입력만 n² — 틀린 것 | 같은 문제 → `algorithm-analysis-jokbo-007` | 없음 | — | — |
| 61 | M23-25 | T(n/4)+T(n/2)+n²(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-008` | 없음 | — | — |
| 62 | T22-1 | n! 입력 — O(n²)? | 대표 `algorithm-analysis-jokbo-004`, vg `nfact-bounds` | 없음 | ox | analysis · 상한·하한 |
| 63 | T22-2 | 10개 입력 n — Ω(n)? | 대표 `algorithm-analysis-jokbo-006`, vg `ten-inputs` | 없음 | ox | analysis · 상한·하한 |
| 64 | T22-3 | 계수 정렬 C2, A=[3,4,2,1,1,4,2,3,1,2] | 대표 `algorithm-sorting-jokbo-002`, vg `counting-c2` | 없음 | mcq | sorting · 계수 정렬 |
| 65 | T22-4 | n + 2·sample(n/2) | 같은 문제 → `algorithm-recurrence-jokbo-005` | 없음 | — | — |
| 66 | T22-5 | 3T(n/9)+√n | 같은 문제 → `algorithm-recurrence-jokbo-010` | 없음 | — | — |
| 67 | T22-6 | 연속 자연수 정렬 | 같은 문제 → `algorithm-sorting-jokbo-003` | 채점 기준(4,5) | — | — |
| 68 | T22-8 | 7개 그룹 | 같은 문제 → `algorithm-dc-jokbo-003` | 없음 | — | — |
| 69 | T22-11 | partition [12,70,50,20,55,25,40,30] | 대표 `algorithm-sorting-jokbo-008`, vg `partition` | 없음 | mcq | sorting · partition |
| 70 | T22-12 | 마스터 정리 쓸 수 없는 것 | 같은 문제 → `algorithm-recurrence-jokbo-001` | 없음 | — | — |
| 71 | T22-13 | 피보나치 중복 재귀 | 대표 `algorithm-recurrence-jokbo-011` | 없음 | mcq | recurrence · 재귀 수행 시간 |
| 72 | T22-14 | (log n)² 관계 모두 | 대표 `algorithm-analysis-jokbo-009`, vg `asym-relation` | 없음 | mcq(정답 1개라 multi 불가) | analysis · O·Ω·Θ 관계 |
| 73 | T22-15 | 반복문 + 재귀 2회 | 같은 문제 → `algorithm-recurrence-jokbo-002` | 없음 | — | — |
| 74 | T22-16 | 정렬된 배열 buildHeap | 같은 문제 → `algorithm-sorting-jokbo-004` | 없음 | — | — |
| 75 | T22-17 | 정렬된 입력 select | 같은 문제 → `algorithm-dc-jokbo-002` | 없음 | — | — |
| 76 | T22-18 | 최소 힙 배열 모두 | 같은 문제 → `algorithm-sorting-jokbo-005` | 없음 | — | — |
| 77 | T22-20 | select 상대 순위 A=[…,29,65], 3번째 | 대표 `algorithm-dc-jokbo-006`, vg `select-rank` | 없음 | mcq | dc · 평균 선형 선택 |
| 78 | S22-3 | 계수 정렬 C2 (64와 같음) | 같은 문제 → `algorithm-sorting-jokbo-002` | 없음 | — | — |
| 79 | S22-7 | 3T(n/9)+√n(보기 순서 다름) | 같은 문제 → `algorithm-recurrence-jokbo-010` | 없음 | — | — |
| 80 | S22-9 | select 상대 순위(보기 순서 다름) | 같은 문제 → `algorithm-dc-jokbo-006` | 없음 | — | — |
| 81 | S22-10 | (log n)² 관계(보기 순서 다름) | 같은 문제 → `algorithm-analysis-jokbo-009` | 없음 | — | — |
| 82 | S22-13 | 피보나치 중복 재귀 | 같은 문제 → `algorithm-recurrence-jokbo-011` | 없음 | — | — |
| 83 | S22-14 | n! 입력 — O(n²)? | 같은 문제 → `algorithm-analysis-jokbo-004` | 없음 | — | — |
| 84 | T23-1 | 10개 입력 n — Ω(n)? | 같은 문제 → `algorithm-analysis-jokbo-006` | 없음 | — | — |
| 85 | T23-2 | n! 입력 — O(n²)? | 같은 문제 → `algorithm-analysis-jokbo-004` | 없음 | — | — |
| 86 | T23-3 | 계수 정렬 C2 (64와 같음) | 같은 문제 → `algorithm-sorting-jokbo-002` | 없음 | — | — |
| 87 | T23-4 | 마스터 정리 쓸 수 없는 것 | 같은 문제 → `algorithm-recurrence-jokbo-001` | 없음 | — | — |
| 88 | T23-5 | (log n)² 관계 | 같은 문제 → `algorithm-analysis-jokbo-009` | 없음 | — | — |
| 89 | T23-6 | partition [12,70,50,20,55,25,40,30] | 같은 문제 → `algorithm-sorting-jokbo-008` | 없음 | — | — |
| 90 | T23-7 | 정렬된 입력 select | 같은 문제 → `algorithm-dc-jokbo-002` | 없음 | — | — |
| 91 | T23-8 | n + 2·sample(n/2) | 같은 문제 → `algorithm-recurrence-jokbo-005` | 없음 | — | — |
| 92 | T23-9 | 연속 자연수 정렬 | 같은 문제 → `algorithm-sorting-jokbo-003` | 채점 기준(4,5) | — | — |
| 93 | T23-10 | 반복문 + 재귀 2회 | 같은 문제 → `algorithm-recurrence-jokbo-002` | 없음 | — | — |
| 94 | T23-11 | 최소 힙 배열 모두 | 같은 문제 → `algorithm-sorting-jokbo-005` | 없음 | — | — |
| 95 | T23-12 | 3T(n/9)+√n | 같은 문제 → `algorithm-recurrence-jokbo-010` | 없음 | — | — |
| 96 | T23-13 | 조약돌 놓기 표1(4,7,12,−5 / …) | 대표 `algorithm-dp-jokbo-011`, vg `pebble` | 없음 | mcq | dp · 조약돌 놓기 |
| 97 | T23-14 | 행렬 최대 합 경로 시작 4 | 대표 `algorithm-dp-jokbo-007`, vg `matrix-path` | 없음 | mcq | dp · 행렬 경로 |
| 98 | F22-2 | Floyd-Warshall D(c)의 (B) | 대표 `algorithm-dp-jokbo-012`, vg `floyd` | 없음 | mcq | dp · 모든 쌍 최단 경로 |
| 99 | F22-3 | Floyd-Warshall D(c)의 (C) | 대표 `algorithm-dp-jokbo-013`, vg `floyd` | 없음 | mcq | dp · 모든 쌍 최단 경로 |
| 100 | F22-4 | 간선 수 제한 L⁽²⁾의 (A) | 대표 `algorithm-dp-jokbo-015`, vg `edge-dp` | 없음 | mcq | dp · 간선 수 제한 거리 DP |
| 101 | F22-5 | 간선 수 제한 L⁽²⁾의 (B) | 대표 `algorithm-dp-jokbo-016`, vg `edge-dp` | 없음 | mcq | dp · 간선 수 제한 거리 DP |
| 102 | F22-7 | 벨만 포드 정점 e 거리 | 대표 `algorithm-dp-jokbo-017` | 없음 | mcq | dp · 단일 시작점 최단 경로(optional) |
| 103 | F22-11 | 조약돌 놓기 표1 | 같은 문제 → `algorithm-dp-jokbo-011` | 없음 | — | — |
| 104 | F22-12 | 조약돌 놓기 표2(6,7,9,−5 / …) | 대표 `algorithm-dp-jokbo-010`, vg `pebble` | 없음 | mcq | dp · 조약돌 놓기 |
| 105 | F22-13 | 행렬 최대 합 경로 시작 6 | 대표 `algorithm-dp-jokbo-006`, vg `matrix-path` | 없음 | mcq | dp · 행렬 경로 |
| 106 | F22-14 | 행렬 최대 합 경로 시작 4 | 같은 문제 → `algorithm-dp-jokbo-007` | 없음 | — | — |
| 107 | F23-4 | 간선 수 제한 L⁽²⁾의 B (101과 같음, 보기 없음) | 같은 문제 → `algorithm-dp-jokbo-016` | 없음 | — | — |
| 108 | F23-6 | 연쇄 행렬 곱 m 표 (B) | 대표 `algorithm-dp-jokbo-005`, vg `matrix-chain` | 없음 | blank | dp · 연쇄 행렬 곱 |
| 109 | F23-7 | 계단 경로 친구 최대 | 같은 문제 → `algorithm-dp-jokbo-008` | 없음 | — | — |
| 110 | F23-8 | Floyd-Warshall D(d)의 (D) | 대표 `algorithm-dp-jokbo-014`, vg `floyd` | 없음 | blank | dp · 모든 쌍 최단 경로 |
| 111 | F23-9 | 4년 장학금 최대 합 | 같은 문제 → `algorithm-dp-jokbo-003` | 없음 | — | — |

variantGroup 13개(접두사 `algorithm-vg-`): `nfact-bounds`(analysis 002·003·004), `ten-inputs`(005·006), `asym-relation`(008·009), `master-apply`(recurrence 004·010), `counting-c2`(sorting 001·002), `partition`(006·007·008), `linear-select-group`(dc 003·004), `select-rank`(005·006), `matrix-chain`(dp 004·005), `matrix-path`(006·007), `pebble`(010·011), `floyd`(012·013·014), `edge-dp`(015·016).

## 5. 범위 밖(강의자료 1~5에 없는 주제) — 문항 만들지 않음

| 원문 | 주제(대조표 기준) |
|---|---|
| E19-2 | 활동 선택 그리디 설계 |
| M21-6, M21-12 | B-트리 · 레드블랙 트리 |
| M22-16 ~ M22-19 (4) | 레드블랙 트리 · B-트리 |
| F22-6, F22-10, F22-15 | NP · 다익스트라 · 위상 정렬 · MST · DFS/BFS · 분리 집합 · 해시 중 하나(대조표가 묶어서만 적음) |
| F23-1, 3, 5, 10~17, 19, 20 (13) | B-트리 · 분리 집합 · 레드블랙 트리 · 위상 정렬 · 해시 · NP · BFS · SCC · 프림 · DFS span |
| F23-2, F23-18 | 활동 선택 · 도시락 스케줄링(그리디) |

## 6. Sprint 21에 넘기는 충돌·주의 후보 (정답 확정은 Sprint 21에서 코드·강의 자료로)

| 대표 id | 내용 |
|---|---|
| recurrence-006 | 유클리드: 교수 답 O(log a), 전사본은 O(log b)도 성립 — 보기 여러 개가 참. 묻는 대상을 하나로 좁혀야 함 |
| recurrence-007 | 하노이 코드의 `move(1,a,b,c)`가 같은 함수 재귀라 원문 그대로면 끝나지 않음 — 의도(원반 1개 이동)로 지문 정리 |
| sorting-003 | 원본 채점: 계수·기수 중 하나 이상이면 정답 → multi 정답 범위 결정 필요 |
| sorting-010 | 보기 E와 G 배열이 같음 → order 항목 중복(무결성 검사 위반) — 보기 정리 필요 |
| sorting-011 | 교수 답 ①④⑤(힙 정렬을 O(n)으로 설명) ↔ 힙 정렬 Θ(n log n) — 코드 검증 후 결정 |
| dc-005 | 목표 "8번째" ↔ 호출 i=3 충돌 — 조건 하나로 정리 |
| dc-007 | 교수가 "문제 오류: 모두 정답 인정" — 의도한 계산 답 44321 검증 |
| dp-006, dp-010 | 같은 문제로 합친 M23 원문은 표가 잘림 — F22 원문 표로 출제 |
| dp-009 | LCS 지문 문자열(ABCDB)과 표 행(A,B,C,B) 불일치 — 표 기준으로 정리 |

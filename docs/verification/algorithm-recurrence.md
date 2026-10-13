# 족보 대조 기록 — 알고리즘 재귀 · 점화식 · 마스터 정리

작성: 2026-10-13 (Sprint 21). 목록·판정: `docs/jokbo/algorithm/inventory.md`, 계획: `docs/jokbo-plan.md` §8 Sprint 21.

- **원본 스캔 대조**(Sprint 21 규칙): 족보 텍스트는 zip의 옮겨 적은 자료(전사본)를 원본으로 썼으므로, 숫자·배열·표·그래프·코드가 있는 대표 문항을 원본 스캔(zip `원본참조/`, `source/algorithm/jokbo/` PDF)과 대조했다. 이번에는 개념 문항도 같은 캡처에 있어 함께 대조했다(생략 0). `일치` = 전사본과 원문이 같음 / `수정` = 전사본 오류를 원문대로 고침. 판독 텍스트: `docs/jokbo/algorithm/extracted/M22-2022 중간(교수 해설).md`(교수 해설 PDF), 나머지 캡처는 전사본 + 이 표의 수정 사항.
- **족보 답 대조**: `일치` = 원본의 LMS·교수 정답과 강의 자료·시뮬레이터 결과가 같음 / `충돌` = 다름 — 교수님 채점 기준을 정답으로 하고 해설에 이론을 함께 적음(2026-10-13 규칙, 이전에는 검증된 답을 정답으로 했음) / `답 없음` = 원본에 정답 표시가 없어 강의 자료·시뮬레이터로 정함. 정답·해설이 있는 원본: M21(13번 제외)·M22(교수 해설)·T22·F22(LMS 정답·해설), S22 3·13.
- **정답 계산**: 계산·추적 문항은 `lib/sim/algorithm/*`로 다시 계산해 `data/subjects/algorithm/jokbo.test.ts`가 고정한다(기준값 테스트 `lib/sim/algorithm/algorithm.test.ts`).
- **원문 그대로**: 문장·보기·보기 순서(`shuffle: false`)·숫자·형식을 원문과 같게(점수 표기·문제은행 태그만 뺌). 코드·표·배열은 고정폭 원문 블록, 그래프는 원본 스캔에서 자른 그림(`public/jokbo/algorithm/`).

## 요약

| 항목 | 수 |
|---|---|
| 전체 | 11 |
| 족보 답 일치 | 10 |
| 족보 답과 다름(충돌) | 0 |
| 족보 답 없음 | 1 |
| 원본 스캔 대조 수정 | 1 |

## 문항별

| # | id | 유형 | slideRef | 원문(출현) | 원본 스캔 대조 | 족보 답 대조 | 해설 | 정답 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `algorithm-recurrence-jokbo-001` | multi | Lec2 p.63-72 | T23-4 · M21-7 · T22-12 | 일치(T22-12·M21-7 원문으로 대조) | 일치 | 족보 해설 | T(n) = 2T(n − 1) + 2 / T(n) = 3T(n/3 + 15) + Θ(n)… |  |
| 2 | `algorithm-recurrence-jokbo-002` | mcq | Lec2 p.63-72 | M23-14 · M21-8 · T22-15 · T23-10 | 일치 | 일치 | 족보 해설 | Θ(nlogn) |  |
| 3 | `algorithm-recurrence-jokbo-003` | mcq | Lec2 p.16-19 | M21-10 | 수정 — 전사본의 반복 범위 `for j = 1 to n`·`for k = 1 to n`을 원문 `j = i to n`·`k = j to n`으로(정답 Θ(n³) 변화 없음) | 일치 | 족보 해설 | Θ(n³) |  |
| 4 | `algorithm-recurrence-jokbo-004` | mcq | Lec2 p.63-72 | M21-13 | 일치 | 답 없음 | 생성 해설 | Θ(nlogn) |  |
| 5 | `algorithm-recurrence-jokbo-005` | mcq | Lec2 p.63-72 | M23-7 · M21-17 · T22-4 · T23-8 | 일치 | 일치 | 족보 해설 | Θ(logn) |  |
| 6 | `algorithm-recurrence-jokbo-006` | mcq | Lec2 p.5-6 | M23-4 · M22-1 | 일치 | 일치 | 족보 해설 | O(log(a)) | 주의: O(log(b))도 수학적으로 성립(복수 참) — 교수 정답 O(log(a)) 유지, 해설에 명시 |
| 7 | `algorithm-recurrence-jokbo-007` | mcq | Lec2 p.53-56 | M23-23 · M22-2 | 일치 | 일치 | 족보 해설 | O(2ⁿ) | 주의: 원문 코드 move(1, a, b, c)는 그대로 실행하면 끝나지 않음 — 출제 의도로 해설 |
| 8 | `algorithm-recurrence-jokbo-008` | mcq | Lec2 p.73 | M23-25 · M22-6 | 일치 | 일치 | 족보 해설 | O(n²) |  |
| 9 | `algorithm-recurrence-jokbo-009` | mcq | Lec2 p.60 | M23-18 · M22-7 | 일치 | 일치 | 족보 해설 | O(nlogn) |  |
| 10 | `algorithm-recurrence-jokbo-010` | mcq | Lec2 p.63-72 | M23-12 · M22-8 · T22-5 · S22-7 · T23-12 | 일치 | 일치 | 족보 해설 | Θ(√n logn) |  |
| 11 | `algorithm-recurrence-jokbo-011` | mcq | Lec5 p.10-14 | T22-13 · S22-13 | 일치 | 일치 | 족보 해설 | O(2ⁿ) |  |

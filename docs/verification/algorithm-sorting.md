# 족보 대조 기록 — 알고리즘 정렬 · 힙 · 선형 시간 정렬

작성: 2026-10-13 (Sprint 21). 목록·판정: `docs/jokbo/algorithm/inventory.md`, 계획: `docs/jokbo-plan.md` §8 Sprint 21.

- **원본 스캔 대조**(Sprint 21 규칙): 족보 텍스트는 zip의 옮겨 적은 자료(전사본)를 원본으로 썼으므로, 숫자·배열·표·그래프·코드가 있는 대표 문항을 원본 스캔(zip `원본참조/`, `source/algorithm/jokbo/` PDF)과 대조했다. 이번에는 개념 문항도 같은 캡처에 있어 함께 대조했다(생략 0). `일치` = 전사본과 원문이 같음 / `수정` = 전사본 오류를 원문대로 고침. 판독 텍스트: `docs/jokbo/algorithm/extracted/M22-2022 중간(교수 해설).md`(교수 해설 PDF), 나머지 캡처는 전사본 + 이 표의 수정 사항.
- **족보 답 대조**: `일치` = 원본의 LMS·교수 정답과 강의 자료·시뮬레이터 결과가 같음 / `충돌` = 다름(검증된 답을 정답으로, 해설에 "족보 답(…)과 다름: 이유") / `답 없음` = 원본에 정답 표시가 없어 강의 자료·시뮬레이터로 정함. 정답·해설이 있는 원본: M21(13번 제외)·M22(교수 해설)·T22·F22(LMS 정답·해설), S22 3·13.
- **정답 계산**: 계산·추적 문항은 `lib/sim/algorithm/*`로 다시 계산해 `data/subjects/algorithm/jokbo.test.ts`가 고정한다(기준값 테스트 `lib/sim/algorithm/algorithm.test.ts`).
- **원문 그대로**: 문장·보기·보기 순서(`shuffle: false`)·숫자·형식을 원문과 같게(점수 표기·문제은행 태그만 뺌). 코드·표·배열은 고정폭 원문 블록, 그래프는 원본 스캔에서 자른 그림(`public/jokbo/algorithm/`).

## 요약

| 항목 | 수 |
|---|---|
| 전체 | 12 |
| 족보 답 일치 | 10 |
| 족보 답과 다름(충돌) | 1 |
| 족보 답 없음 | 1 |
| 원본 스캔 대조 수정 | 0 |

## 문항별

| # | id | 유형 | slideRef | 원문(출현) | 원본 스캔 대조 | 족보 답 대조 | 해설 | 정답 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `algorithm-sorting-jokbo-001` | mcq | Lec3 p.73-74 | M23-21 · M21-3 · M22-9 | 일치 | 일치 | 족보 해설 | 3, 6, 9, 10 |  |
| 2 | `algorithm-sorting-jokbo-002` | mcq | Lec3 p.73-74 | T23-3 · T22-3 · S22-3 | 일치 | 일치 | 족보 해설 | 3, 6, 8, 10 |  |
| 3 | `algorithm-sorting-jokbo-003` | multi | Lec3 p.69-75 | M23-1 · M21-5 · T22-6 · T23-9 | 일치 | 일치 | 족보 해설 | 기수정렬 / 계수정렬 |  |
| 4 | `algorithm-sorting-jokbo-004` | mcq | Lec3 p.63-68 | T22-16 · M21-9 | 일치 | 일치 | 족보 해설 | Θ(n) | LMS 해설 "heapify()를 호출하지 않음"은 부정확 — 해설에 보완 |
| 5 | `algorithm-sorting-jokbo-005` | multi | Lec3 p.60-62 | M23-2 · M21-14 · T22-18 · T23-11 | 일치 | 일치 | 족보 해설 | [12, 20, 25, 40, 55, 30, 70, 50] / [12, 20, 25, 5… |  |
| 6 | `algorithm-sorting-jokbo-006` | mcq | Lec3 p.36-39 | M21-20 | 일치 | 일치 | 족보 해설 | 7 |  |
| 7 | `algorithm-sorting-jokbo-007` | mcq | Lec3 p.36-39 | M22-10 | 일치 | 일치 | 족보 해설 | 1 |  |
| 8 | `algorithm-sorting-jokbo-008` | mcq | Lec3 p.36-39 | T23-6 · T22-11 | 일치 | 일치 | 족보 해설 | 4 |  |
| 9 | `algorithm-sorting-jokbo-009` | blank | Lec3 p.70-72 | M23-22 · M22-11 | 일치 | 일치 | 족보 해설 | 6874 |  |
| 10 | `algorithm-sorting-jokbo-010` | blank | Lec3 p.63-66 | M23-6 · M22-번호 미표기 | 일치 | 일치 | 족보 해설 | FDBGEHC | 원문 보기 (E)=(G) 같은 배열 — 정답 FDBGEHC·FDBEGHC 모두 인정 |
| 11 | `algorithm-sorting-jokbo-011` | multi | Lec3 p.22-26·p.63-68·p.73-75 | M23-11 · M22-12 | 일치 | 충돌 | 족보 해설 | 삽입 정렬 / 계수 정렬 | 충돌: 족보 답 1·4·5(삽입·힙·계수) → 검증 답 삽입·계수(힙 정렬은 정렬된 입력에서도 Θ(n log n)) |
| 12 | `algorithm-sorting-jokbo-012` | mcq | Lec3 p.40-42 | M23-20 | 일치 | 답 없음 | 생성 해설 | Θ(n²) |  |

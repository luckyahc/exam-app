# 진행 기록 — Sprint 22 족보 마무리

- 시작: 2026-10-13 (Sprint 21 커밋 `67d6627` 이후)
- 계획·규칙: [`docs/jokbo-plan.md`](../jokbo-plan.md) §4·§8 Sprint 22

## 0. 족보 충돌 2건 → 교수님 채점 기준 (사용자 결정 2026-10-13)

- 규칙 추가(`jokbo-plan.md` §4): 족보 답과 이론이 다르면 교수님 채점 기준을 정답으로 하고 해설에 이론을 함께 적는다. 해설은 "교수님 채점 기준(…시험)"으로 시작, 충돌 목록·대조 기록에 "교수님 기준 채택". 이전 규칙(검증된 답을 정답으로)을 대체
- `algorithm-sorting-jokbo-011`(거의 정렬된 입력): 정답 삽입·계수 → **삽입·힙·계수**. 해설 첫머리 "교수님 채점 기준(2022 시험). 이론적으로 힙 정렬은 정렬된 입력에서도 Θ(n log n)이다(강의 자료 3 p.63)"
- `os-ch02-jokbo-010`(22-8 CPU 이용률): 정답 0.7 → **0.6**. 해설 "교수님 채점 기준(2022 시험): 스위칭 시간을 뺀 유효 실행 시간 기준 6/10 = 0.6. 바쁜 시간 전체로 계산하면 (6+0.3+0.7)/10 = 0.7"
  - 일관성 확인: Ch02 ⭐ `os-ch02-time-calc-007`(유효 CPU 이용률, 6 / (6 + 0.5 + 0.5 + 3) = 0.6)과 같은 `utilization(유효, 스위칭+휴식)` 계산 — 테스트로 고정(`data/subjects/os/jokbo.test.ts`). ⭐ `time-calc-010`(OX, "CPU 이용률 = 바쁜 시간 / 전체 시간" 정의 = 참)은 슬라이드 정의 문항이라 그대로 — 족보 해설에 이 정의를 "이론"으로 적었다
- 기록: `docs/verification/os-jokbo.md` 충돌 목록·문항 행, `docs/verification/algorithm-sorting.md` 문항 행, 알고리즘 대조 기록 5개의 `충돌` 정의, `docs/jokbo/algorithm/inventory.md` §6

## 1. 족보 필터 점검

- 단위 테스트(`lib/quiz/jokbo.test.ts` "실제 데이터 족보 필터 점검"): 과목 4개 × 챕터마다 족보 수(OS 10·13·14·13·6, 알고리즘 9·11·12·6·15, 나머지 0) = 챕터 메타 `jokboIds` = 퀴즈 필터(`source=jokbo`, 섞기) = 문제 목록 분류(족보/일반), 다른 필터(유형)와 함께 써도 족보만
- HTTP 200: 아래 5번

## 2. 문서

- README: 제목·구조에 알고리즘·OS Ch09, "족보 문항" 절(문항 수·데이터·화면·정답 규칙), 배포 확인 6번 안내
- `docs/known-limitations.md` "족보" 절: 범위 밖(알고리즘 24 — 계획의 25는 E19 제외 전 수, OS 9), 잘린 원본, 해설 출처, 교수님 기준 문항, 데이터 규칙 예외, 전사본 기반
- `docs/deploy-checklist.md` 6번: 족보·알고리즘 배포 후 확인 항목

## 3. 문항 수

| 과목 | 전체 | 족보 | 일반 |
|---|---|---|---|
| 운영체제 | 721 | 56 | 665 |
| 데이터 통신 | 170 | 0 | 170 |
| 데이터과학 | 356 | 0 | 356 |
| 알고리즘 | 53 | 53 | 0 |

## 5. 검사

- 작업 중: os·algorithm 족보 테스트, os verification, choiceOrder, lib/quiz/jokbo 통과
- 스프린트 끝 전체 검사: lint 통과 · `npm test -- --maxWorkers=1` 60파일 2736 통과 · `verify:ds` 40 통과 · build 통과 · OS 회귀 16/16 · HTTP 200: `/s/algorithm`(족보만 풀기 53), `/s/algorithm/questions`, `/s/os/chapter/ch09`, `/quiz?subject=os&source=jokbo`, `/quiz?subject=algorithm&source=jokbo`, `/s/os`(족보만 풀기 56), `/s/os/questions`, 그림 `/jokbo/algorithm/algorithm-dp-jokbo-015.png`
- 커밋·푸시

# 진행 기록 — Sprint 21 알고리즘 족보 문항

- 시작: 2026-10-13 (Sprint 20 커밋 `fe9ca07` 이후)
- 계획·규칙: [`docs/jokbo-plan.md`](../jokbo-plan.md) §4·§7·§8 Sprint 21, 목록: [`docs/jokbo/algorithm/inventory.md`](../jokbo/algorithm/inventory.md)

## 1. 원본 스캔 대조 (Sprint 21 규칙)

- 대표 53문항의 원본을 모두 봤다: M22 교수 해설 PDF 2~19쪽(판독 텍스트 `extracted/M22-2022 중간(교수 해설).md`로 저장), M23 25장, M21 9장, T22 10장, S22 6장, T23 5장(나머지 T23은 같은 문장의 T22 원문으로 대조), F22 8장, F23 PDF 4~14쪽
- 전사본 오류 1건: M21-10 matMul 반복 범위(전사본 `for j = 1 to n`·`for k = 1 to n` → 원문 `j = i to n`·`k = j to n`) — 정답 Θ(n³)은 그대로
- 새로 확인한 것: M21·T22·F22 캡처에 **LMS 정답·해설**이 있다(Sprint 18 inventory는 "없음/일부"로 적었음) → 해설 출처 "족보 해설" 45문항, inventory 해설 열 정정(원본 해설 있는 범위 안 원문 58)
- 잘린 2023 캡처(M23-8·19)는 같은 문제인 F22-13·12 원문으로 출제

## 2. 시뮬레이터 `lib/sim/algorithm/`

- sorting.ts(계수 정렬, partition, select 한 단계, 최소 힙 검사, buildHeap 단계, 힙·삽입·퀵 정렬 비교 횟수, 기수 정렬 위치, 선형 선택 그룹 비율), dp.ts(행렬 경로, 조약돌 놓기, 장학금, 연쇄 행렬 곱, LCS, 플로이드-워샬 D(k), 간선 수 제한 L(m), 벨만-포드), recursion.ts(하노이·피보나치·sample·matMul 횟수, 유클리드 호출 수, 점화식 값)
- 기준값 테스트 21개(`algorithm.test.ts`) — 교수·LMS 해설 값(C2, partition 위치, select 단계, 힙 판정, buildHeap 단계 FDBGHC, 기수 6874, 7:3·5:2·13:5, 행렬 경로 60·58, 조약돌 51·52, D(c) 6·4, L(2) −2·6, 벨만-포드 7)과 모두 일치

## 3. 문항 `data/subjects/algorithm/*.ts` 53개

- 챕터: analysis 9 · recurrence 11 · sorting 12 · dc 6 · dp 15 (= minQuestions), 과목 "준비 중" 해제
- 유형: mcq 35 · blank 11 · multi 7 — 원문 형식 그대로(보기 순서 고정, 알파벳·숫자 입력은 blank)
- 해설: 족보 해설 45 · 생성 해설 8
- 코드·표·배열은 고정폭 원문 블록, 그래프 6문항은 원본 스캔에서 자른 그림(`public/jokbo/algorithm/algorithm-dp-jokbo-010~015.png`, 270×180·305×213, 15·18KB) — 문항 `figure` 필드(src·alt·크기), 화면은 흰 카드 위(다크 모드 대응)
- 데이터 규칙 예외(족보만): mcq 보기 2개(예/아니오) 5문항(analysis-001~005), multi 정답 1개 1문항(analysis-008, 원문 "모두 선택"). mcq·multi 검증에 `origin: "jokbo"` 분기
- 충돌 1: sorting-011 — 족보 답 삽입·힙·계수 → 검증 답 삽입·계수(힙 정렬은 정렬된 입력에서도 Θ(n log n), 비교 횟수로 확인). 해설에 교수 채점 기준 함께 적음
- 주의 4(정답은 족보대로): recurrence-006 유클리드(O(log b)도 성립), recurrence-007 하노이 코드(move(1,…) 무한 재귀), dc-004 조건 충돌(8번째 ↔ select(A,1,10,3)), dc-006(2022 "모두 정답 인정", 2023 원문에 주의 사항)

## 4. 테스트·기록

- `data/subjects/algorithm/jokbo.test.ts`: inventory 대표 53 = 데이터, 출현 107·중복 없음·같은 문제 행 포함, variantGroup, 보기 순서 고정, 그림 크기·용량, 계산·추적 정답 = 시뮬레이터(26개 문항), 충돌 해설, 대조 기록 5개 ↔ 데이터
- `docs/verification/algorithm-{analysis,recurrence,sorting,dc,dp}.md`
- 기존 테스트 조정: `contentQa` slideRef 형식에 알고리즘(`Lec2 p.6`), `choiceOrder.test` 위치 비교에서 지문 원문 블록 뒤 꼬리 글자를 건너뛰고 숫자만인 족보 보기는 제외(테스트만, 앱 동작 변화 없음), `lib/quiz/jokbo.test` 알고리즘 기대값

## 5. 검사

- 작업 중: data/subjects·lib/quiz·lib/qtypes·lib/sim/algorithm 통과
- 스프린트 끝 전체 검사: lint 통과 · `npm test -- --maxWorkers=1` 60파일 2732 통과 · `verify:ds` 40 통과 · build 통과 · OS 회귀 16/16 · HTTP 200: `/s/algorithm`(족보만 풀기 53), `/s/algorithm/questions`, `/s/algorithm/chapter/analysis`·`dp`, `/quiz?subject=algorithm&source=jokbo`, 그림 `/jokbo/algorithm/algorithm-dp-jokbo-010.png`·`015.png`
- 커밋·푸시

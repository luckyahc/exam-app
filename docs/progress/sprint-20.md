# 진행 기록 — Sprint 20 OS 족보 문항

- 시작: 2026-10-13 (Sprint 19 커밋 `07b8df8` 이후, E19 제외 작업 미커밋분 포함)
- 계획·규칙: [`docs/jokbo-plan.md`](../jokbo-plan.md) §4·§8 Sprint 20

## 0. 계획 갱신 (사용자 지시)

- 족보 문항은 원문 그대로 출제(문장·보기·보기 순서·숫자·표·형식, 오타만 고치고 해설에 기록) — "서술형 → 허용 유형 변환" 규칙 삭제, 데이터 규칙과 충돌 시 족보 문항만 예외, 그림은 원본 스캔을 잘라 `public/jokbo/<과목>/<id>.png` → `jokbo-plan.md` §4, 로드맵 변경 이력
- 옛 서술형 파일(E19) 제외 반영 확인: inventory에서 E19 5행을 "제외(옛 서술형 파일)"로 표시. 대표 57 → 53(analysis 10→9, dc 7→6, dp 17→15), 범위 안 출현 111 → 107, 범위 밖 25 → 24. E19 문항은 모두 대표였고 다른 시험과 같은 문제가 없어(합친 원문 0) 남은 대표의 occurrences·출현 횟수·variantGroup(13개)은 바뀌지 않음. 남은 파일(전사본·M21~F23)에 서술형 문항 없음 — 전사본의 "설명하시오·증명하시오·제시하시오" 3건은 모두 E19
- 알고리즘 inventory "유형" 열 → "원문 형식"(원문의 묻는 형식). OS inventory도 같은 이름으로, 순서 보기 객관식 3문항·CPU 이용률 문항은 원문대로 mcq

## 1. 슬라이드 대조

- Ch02·Ch03·Ch07·Ch08 PDF 텍스트를 검색용으로만 추출(스크래치, 저장소에 넣지 않음)하고 문항별로 필요한 쪽만 확인
- 2022 LMS 정답 41개(대표 기준: 같은 문제 35 + 2022에만 있는 6) 중 40개 일치, 1개 충돌(22-8 CPU 이용률: LMS 0.6 = 유효 CPU 이용률, 슬라이드 p.21 정의로 CPU 이용률 = 0.7 → 0.7을 정답으로, 해설에 이유와 교수님 의도 가능성)
- 2023에만 있는 15문항은 정답 표시가 없어 슬라이드·시뮬레이터로 정함(23-1 page locking ↔ Frame Locking·paging의 placement, 23-9 system program code, 23-28 페이지 크기, 23-34 load control(p.61 필기 "시스템이 자동으로 부하제어를 해주지는 않는다"), 23-23·33·37·49 등)

## 2. 데이터

- `data/subjects/os/chNN-jokbo.ts` 5개(ch02 10 · ch03 13 · ch07 14 · ch08 13 · ch09 6 = 56), 공통 `jokboSource.ts`(출처·occurrences·원문 블록). 챕터 로더에 연결(`index.ts` withHints가 여러 보조 파일을 받음)
- 원문 그대로: mcq·multi 모두 `shuffle: false`, 보기 순서 = 대표 원문. 잘린 2023 캡처 3문항(23-5·23-47·23-17)은 같은 문제인 2022 원문의 문장·보기를 대표로 씀. 점수 표기는 뺌. 원문 오타 수정 3건(22-8 '소요되었었다', 23-1 '페이를', 23-19 '변화하며' — 해설에 기록)
- 메모리 상태 그림·페이지 테이블·프로세스 표·순서 항목은 지문·보기 안 고정폭 원문 블록으로: RichText의 ```text 펜스 → CodeBlock("원문")(`components/qtypes/ui.tsx`·`CodeBlock.tsx`, contentQa 형식 검사도 text 펜스 제외). 그림 이미지로 넣은 문항 0개(OS 족보 그림은 모두 글자 그림이라 텍스트로 옮김)
- 영어·약자 답 입력 문항: 없음(OS 족보 56개는 모두 객관식 — mcq 36 · multi 20)
- 데이터 규칙 예외: 0개(보기 4~5개·multi 정답 2개 이상·보기 중복 금지·위치 참조 금지 모두 통과)

## 3. 테스트·기록

- `data/subjects/os/jokbo.test.ts`: inventory 대표 56 = 데이터, 출현 91(대표 56 + 같은 문제 35)·중복 없음·같은 문제 행이 대표 occurrences에 있음, variantGroup = inventory, shuffle false·generated, 계산·추적 정답 = lib/sim/os(응답시간 RR·FCFS, CPU 이용률, 버디 2, 배치 2, 주소 변환 3, Enhanced Clock·Clock·OPT·LRU, SRT·HRRN)
- `docs/verification/os-jokbo.md` + `verification.test.ts`(챕터 대조 기록은 일반 문항만, 족보는 따로)
- `lib/quiz/jokbo.test.ts` 회귀 기대값: OS 족보 56, Ch02 족보 10
- `ch09.test.ts` 소주제 목표는 일반 문항만

## 4. 검사

- 작업 중: 관련 테스트(data/subjects·lib/quiz·lib/sim) 통과
- 스프린트 끝 전체 검사: lint 통과 · `npm test -- --maxWorkers=1` 58파일 2616 통과(처음 3건 실패 — `choiceOrder.test.ts`가 지문 안 원문 블록의 "[0]~[3]"을 보기 위치로 잘못 찾음 → 마지막 원문 블록 뒤부터 찾게 고침, 앱 동작 변화 없음) · `verify:ds` 40 통과 · build 통과 · OS 회귀 16/16 · HTTP 200: `/s/os`(족보만 풀기 56 표시), `/quiz?subject=os&source=jokbo`, `/s/os/chapter/ch07`, `/s/os/questions`
- 커밋·푸시

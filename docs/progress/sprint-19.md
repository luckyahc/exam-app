# 진행 기록 — Sprint 19 OS 9장

- 시작: 2026-10-12 (Sprint 18 커밋 `34efafc` 이후)
- 계획·규칙: [`docs/jokbo-plan.md`](../jokbo-plan.md) §8 Sprint 19

## 0. 계획 문서 갱신 (사용자 지시)

- 알고리즘 시험 범위 = 강의 1~5, 범위 밖 25문항 제외 확정 · Sprint 21 원본 스캔 대조 규칙 추가 → `jokbo-plan.md` §6·§8, 로드맵 변경 이력 한 줄

## 1. 9장 PDF 분석

- 텍스트 추출: `docs/jokbo/os/extracted/Ch09.md`(28쪽, 텍스트 층 있음 — 교수님 메모도 텍스트로 들어 있음). 그림 쪽(p.2·3·5·7·8·11·13·14·21·22·25)은 이미지로 확인, Feedback 그림(p.25)은 160dpi로 실행 구간 판독
- ⭐(교수님 필기) 근거 4곳: p.5 "용어정리 중요"·"영어로 쓰시오 turnaround라고 맞게 써야함", p.8 "시험: 스케줄러함수가 호출되는 경우가 아닌것은?", p.11 "표 보여주고 시간 4일때 시작되는 프로그램은?", p.22 "10일때 선택되는 프로세스는? B가 끝난시점(9)일때만 스케줄링해보면 됨"
- 예제 값: 공통 예제 A~E(도착 0·2·4·6·8, 서비스 3·6·4·5·2), p.27 비교 표(FCFS·RR q=1·SPN·SRT·HRRN의 Tr·평균), p.14 RR q=4, p.25 Feedback q=1·q=2ⁱ, p.22 응답 비율, p.22 필기 예(시간 4에 10분 작업, 시간 6에 1분 작업), p.5 필기 33ms, p.26 Ts=1·Tw=10

## 2. 소주제와 목표 (⭐ 8, 일반 2~4)

| 소주제 | ⭐ | slideRef | 목표 |
|---|---|---|---|
| 스케줄링 목표·수준(장기·중기·단기) | | p.2-3 | 4 |
| 스케줄러 호출 시점 | ⭐ | p.4, p.8 | 8 |
| 스케줄링 기준(용어) | ⭐ | p.2, p.5 | 8 |
| 우선순위·기아 | | p.6-7 | 3 |
| 결정 방식(비선점·선점) | | p.9 | 4 |
| 서비스 시간·CPU/I-O 중심 | | p.10, p.12, p.16 | 3 |
| FCFS | | p.11-12 | 4 |
| 시각별 스케줄링 추적 | ⭐ | p.11, p.13-14, p.19, p.21 | 8 |
| 라운드 로빈 | | p.13-15 | 4 |
| 가상 라운드 로빈 | | p.15-17 | 3 |
| 서비스 시간 추정 | | p.18 | 4 |
| SPN | | p.19-20 | 3 |
| SRT | | p.21 | 3 |
| HRRN 응답 비율 | ⭐ | p.22 | 8 |
| Feedback | | p.23-25 | 4 |
| 반환·대기·정규화 반환시간 | | p.26 | 4 |
| 알고리즘 비교 | | p.27 | 4 |
| **합계** | 4 | | **79** (= minQuestions) |

## 3. 진행

- [x] 시뮬레이터 `lib/sim/os/scheduling.ts` + 기준값 테스트 16개(`scheduling.test.ts`) — p.27 표 5개 알고리즘 전부, 그림 7개 실행 순서, HRRN 응답 비율, 필기 예 일치
- [x] 생성기 `scheduling`(시각 t의 실행 프로세스, 알고리즘 5종) — 전 과목 생성기 검사 통과
- [x] 문항 `data/subjects/os/ch09.ts` 79개(정적 77 + 생성기 고정 seed 2) — 17개 소주제 모두 목표와 같음, ⭐ 32(4 × 8, 소주제마다 유형 3~7종). 유형: mcq 27 · ox 11 · blank 9 · calc 9 · multi 7 · classify 5 · match 4 · order 4 · trace 3 (생성기 고정 문항 2개는 mcq)
- [x] 용어 사전 Ch09 22개(`glossary.ts`, `docs/os-glossary.md`) → 용어 단답형 19개(`os-ch09-term-001~019`), 3개는 기존 문항에 연결(반환시간 → criteria-001, 처리량 → criteria-008, 호위 효과 → fcfs-002). 응답시간·CPU 이용률·타임 슬라이스·비선점·디스패처는 Ch02·Ch03 용어로 이미 있음. 시험 힌트 범위 밖(힌트는 Ch02~Ch08)
- [x] 대조 기록 `docs/verification/os-ch09.md`(98행 = 79 + 용어 19, 일치 94 · 수정 4 · 필기 근거 19) + `verification.test.ts`에 ch09
- [x] ch09 minQuestions 79·status 제거, OS 레지스트리 스냅샷, `scripts/os-regression.mjs` OS_CHAPTERS에 ch09, 용어 slideRef 검사에 Ch09 허용(`hints.test.ts`)
- [x] Ch09 데이터 테스트 `data/subjects/os/ch09.test.ts`(소주제 목표 = 실제, ⭐ 6~10·유형 3종 이상·필기 근거)
- [x] 전체 검사: lint 통과 · `npm test -- --maxWorkers=1` 57파일 2495 통과 · `verify:ds` 40 통과 · build 통과 · OS 회귀 16/16(ch09 포함) · HTTP 200: `/s/os/chapter/ch09`, `/chapter/ch09`(→ 리다이렉트), `/s/os/glossary`, `/s/os/questions`, `/quiz?subject=os&chapter=ch09`
- [x] 커밋·푸시

## 작성 중 고친 것

- HRRN 2지선다 2문항(hrrn-005·007) → 보기 4개(OS mcq 보기 4~5개 규칙)
- 생성기 고정 문항 두 번째가 첫 번째와 같은 SRT라 RR(seed 3)로 바꿈
- 생성기 해설 조사("시각 3~4은") 고침
- ⭐ 시각별 스케줄링 추적이 mcq·trace 2종뿐 → trace-003(SPN)을 order(실행 순서)로 바꿔 3종

## Sprint 20에 넘길 것

- OS 족보 23-49(throughput·response·deadline·turnaround 용어)는 Ch09 p.5 스케줄링 기준에 있음 → `os-ch09-jokbo-006` 그대로
- 족보 23-2(SRT)·23-12(HRRN) 정답은 `simulate("srt"|"hrrn", …)`로 계산 가능(시뮬레이터 동점 규칙 = FIFO)

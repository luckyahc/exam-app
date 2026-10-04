# Sprint 6 — OS 콘텐츠 제작: Ch07 · Ch08 (생성기 연동 포함)

## 목표

`data/subjects/os/ch07.ts`, `data/subjects/os/ch08.ts`를 작성해 각각 최소 80문항/120문항을 채운다. Ch08은 전체에서 비중이 가장 크다. 세부 추적은 [`content-checklist.md`](../content-checklist.md)의 Ch07/Ch08 섹션을 사용하고, 소주제별 목표 문항 수·유형 배분·슬라이드 페이지는 [`coverage-matrix.md`](../coverage-matrix.md)를 따른다. PDF와 §7 대조 결과(버디 시스템 분할 규칙, Clock/교체알고리즘 Figure 8.15·8.16 등 실측 자료)는 [`source-diff.md`](../source-diff.md)를 참고한다.

## 선행 조건

- Sprint 3(데이터 모델/채점기) + Sprint 4(시뮬레이터) 완료

## 작업 항목

> Sprint 4에서 만든 생성기(`lib/sim/os/generators.ts`)를 그대로 쓸 수 있다: `paging`·`segmentation`·`buddy`·`placement`(Ch07), `replacement`·`memory-capacity`(Ch08). 정적 문제를 쓸 때도 정답은 같은 시뮬레이터 함수로 계산하고, trace 표의 F는 Figure 8.15 규칙(프레임이 다 찬 뒤의 폴트만)을 따른다.

> **폴트 수 기준 규칙** (Sprint 4 문서 "구현 중 확정한 설계" 참고): Figure 8.15의 F는 프레임이 처음 다 찬 뒤의 폴트만 센다(CLOCK F = 5, 초기 적재 포함 시 8).
> - 정답은 시뮬레이터의 두 값 — 초기 적재 포함 전체 폴트 수(`misses`)와 초기 적재 이후 폴트 수(`faults`, 슬라이드 F) — 에서 가져온다.
> - 폴트 횟수를 묻는 모든 문제(calc/mcq)는 **문제 문장에 어느 기준인지 명시**하고, **해설에 다른 기준의 값도 한 줄로** 적는다.

- [x] `content-checklist.md`의 Ch07 항목을 모두 커버 (⭐ 배치 알고리즘 4가지, ⭐ 버디 시스템, ⭐ 주소 변환은 최소 6~10문항씩)
- [x] `content-checklist.md`의 Ch08 항목을 모두 커버 (⭐ 7개 항목: 페이지폴트 처리과정/지역성/TLB/페이지크기 그래프/스래싱/반입정책/교체알고리즘, 각 최소 6~10문항)
- [x] 배치 알고리즘 문제는 `lib/sim/os/placement.ts` 호출로 정답 산출
- [x] 버디 시스템 trace/calc 문제는 `lib/sim/os/buddy.ts` 호출로 정답 산출
- [x] 페이지 주소변환 calc/trace 문제는 `lib/sim/os/paging.ts`/`segmentation.ts` 호출로 정답 산출
- [x] 페이지 교체(FIFO/LRU/OPT/Clock/Enhanced Clock) trace 문제는 `lib/sim/os/replacement.ts` 호출로 상태표 생성
- [x] `graph` 유형 SVG 2종 이상 작성: (1) 페이지 크기 vs 폴트율 곡선 (2) 멀티프로그래밍 수준 vs CPU 이용률(스래싱) — 다크모드 대응 색상 토큰 사용
- [x] 2단계 페이지 테이블/Inverted page table 계산 문제는 `lib/sim/os/memoryCapacity.ts` 호출
- [x] 모든 문제에 `subject: 'os'`와 `os-` 접두사 id(`os-{chapter}-{topicSlug}-{nnn}`, [`multi-subject-design.md`](../multi-subject-design.md) §2-1) 사용, `data/subjects/integrity.test.ts` 통과
- [x] 모든 문제에 `slideRef`, `topic`, `exam`, `examBasis: 'handwritten'`(⭐일 때), `difficulty` 채우기 + 해설 3요소(근거/오답이유/출처) 포함
- [x] 페이지 버퍼링 항목은 교수님 코멘트대로 **난이도 낮게, 문항 수 적게** 유지
- [x] 유형 비율 점검 및 중복 문제 검수
- [x] **문항별 PDF 대조 기록** `docs/verification/os-ch07.md`·`os-ch08.md`(챕터별, 2026-10-05 지시로 파일 분리)를 작성한다 — Ch07 완료 — [`os-ch02-ch03.md`](../verification/os-ch02-ch03.md)와 같은 형식(문항 한 줄: id / slideRef / ⭐ / 근거(인쇄·필기) / 대조 결과(일치·수정·신규) / 수정 내용, 맨 위에 개수 요약). 챕터 전 문항을 빠짐없이 기록하고, 요약 숫자는 표에서 센 값과 같아야 한다

## 완료 기준 (DoD)

- `data/subjects/os/ch07.ts` ≥80문항, `data/subjects/os/ch08.ts` ≥120문항
- `content-checklist.md`의 Ch07/Ch08 모든 체크박스 완료 + 실제 문항 수 기록
- `docs/verification/os-ch07.md`·`os-ch08.md`에 전 문항 대조 기록(과목-챕터별 파일 규칙)
- 생성기 연동 문제(버디/배치/교체/주소변환) 각각 최소 1개 이상 실제 렌더링해 시뮬레이터 결과와 UI 표시가 일치하는지 수동 확인
- `graph` 유형이 라이트/다크 모드 모두에서 충분한 대비로 보이는지 확인

## 진행 상황 (2026-10-05) — Ch07·Ch08 완료 (DONE)

Ch07을 먼저 작성·커밋(`062fe95`)하고 확인을 받은 뒤 Ch08을 작성했다(사용자 지시). Ch08 진행 기록: [`../progress/sprint-06-ch08.md`](../progress/sprint-06-ch08.md).

| 항목 | 결과 |
|---|---|
| 문항 | 89 = 정적 82(≥80) + 생성기 7, ⭐ 30 |
| 유형 | mcq 23(25.8%) · blank 18(20.2%) · ox 14(15.7%) · calc 14 · multi 5 · match 5 · classify 4 · trace 4 · order 2 |
| ⭐ 주제 | 배치 알고리즘 10(6종) · 버디 시스템 10(6종) · 주소 변환 10(5종) |
| 대조 기록 | [`verification/os-ch07.md`](../verification/os-ch07.md): 일치 80 · 수정 9 · 필기 근거 14 · (보충) 4 |

- 이번 Ch07에 적용한 추가 기준(사용자 지시): blank 18~22%, mcq ≤30%, ox ≤18%, trace ≥3 — 처음부터 맞춤. 필기 근거 문항은 해설에 "교수님 필기 기준" 명시. 정답이 하나로 정해지지 않는 문장 금지.
- 정답 계산: 정적 계산·시뮬레이션 문항 18개는 `lib/sim/os` 함수로 계산. [`data/subjects/os/ch07.test.ts`](../../data/subjects/os/ch07.test.ts)가 슬라이드 기준값(p.23 버디 표 10행, Figure 7.5·7.11·7.12, p.32·34·35·36·41)과 일치를, 생성기 문항은 `{generator, params, seed}`로 재생성한 결과와 같은지를 확인.
- 코드 추가·수정: `lib/sim/os/baseBounds.ts`(+테스트) 신규 — p.7 Base·Bounds 계산 문항용. `generators.ts`의 Ch07 생성기 slideRef를 실제 페이지로 정정(배치 p.16-20, 버디 p.21-24, 세그먼테이션 p.38-41), paging 해설의 "선형 탐색이라 느리다"에 (보충) 표시.
- 출제 보류: p.23 필기 "256을 할당받으면 어느쪽?"(슬라이드에 답 없음), p.21 상단 필기(p.11 인쇄와 엇갈림) — [`source-diff.md`](../source-diff.md) Ch07.
### Ch08 결과

| 항목 | 결과 |
|---|---|
| 문항 | 138 = 정적 134(≥120) + 생성기 4, ⭐ 71 |
| 유형 | mcq 32(23.2%) · blank 28(20.3%) · ox 23(16.7%) · match 10 · multi 9 · classify 9 · calc 9 · order 7 · trace 7 · graph 4 |
| ⭐ 주제 | 페이지 폴트 9 · 지역성 7 · TLB 10 · 페이지 크기 10 · 스래싱 10 · 반입 9 · 교체 알고리즘 10 · Clock 동작 6 (모두 유형 4종 이상) |
| 대조 기록 | [`verification/os-ch08.md`](../verification/os-ch08.md): 일치 121 · 수정 16 · 추가 1 · 필기 근거 24 · (보충) 3, 머리에 페이지 번호 대조 표 |

- 추가 기준(사용자 지시): trace ≥6(Figure 8.15 OPT·LRU·FIFO·CLOCK, Figure 8.16, Enhanced Clock, 생성기 1), graph ≥4(페이지 크기, 프레임 수(knee), 멀티프로그래밍 수준, Figure 8.17), 폴트 횟수 문항은 문장에 기준·해설에 다른 기준 값.
- 정답 계산: `lib/sim/os/workingSet.ts`(+테스트) 신규. [`data/subjects/os/ch08.test.ts`](../../data/subjects/os/ch08.test.ts)가 Figure 8.15(프레임·F·use bit·pointer), Figure 8.16, p.14·p.17 필기 수치, 워킹 셋, Enhanced Clock, 생성기 재생성 일치를 확인.
- ⭐ 범위: p.43-51의 출제 표시는 p.48 하나뿐. 기본 교체 알고리즘 행에서 Clock 정책 동작(Figure 8.16)·LFU/MFU를 별도 소주제로 분리했고, Clock 동작은 지시에 따라 ⭐(p.48 "시험" + p.50 필기), LFU/MFU는 ⭐ 아님.
- DoD의 "생성기 문제 실제 렌더링·graph 라이트/다크 대비 수동 확인"은 퀴즈 화면이 생기는 Sprint 7 브라우저 확인에서 함께 한다(그때까지는 `components/qtypes/render.test.ts`가 전 문항 렌더링을 검증).

## 다음 스프린트와의 연결

- Sprint 7에서 OS 4개 챕터 데이터가 모인 상태로 처음 엔드투엔드 플로우를 완성한다.

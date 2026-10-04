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

- [ ] `content-checklist.md`의 Ch07 항목을 모두 커버 (⭐ 배치 알고리즘 4가지, ⭐ 버디 시스템, ⭐ 주소 변환은 최소 6~10문항씩)
- [ ] `content-checklist.md`의 Ch08 항목을 모두 커버 (⭐ 7개 항목: 페이지폴트 처리과정/지역성/TLB/페이지크기 그래프/스래싱/반입정책/교체알고리즘, 각 최소 6~10문항)
- [ ] 배치 알고리즘 문제는 `lib/sim/os/placement.ts` 호출로 정답 산출
- [ ] 버디 시스템 trace/calc 문제는 `lib/sim/os/buddy.ts` 호출로 정답 산출
- [ ] 페이지 주소변환 calc/trace 문제는 `lib/sim/os/paging.ts`/`segmentation.ts` 호출로 정답 산출
- [ ] 페이지 교체(FIFO/LRU/OPT/Clock/Enhanced Clock) trace 문제는 `lib/sim/os/replacement.ts` 호출로 상태표 생성
- [ ] `graph` 유형 SVG 2종 이상 작성: (1) 페이지 크기 vs 폴트율 곡선 (2) 멀티프로그래밍 수준 vs CPU 이용률(스래싱) — 다크모드 대응 색상 토큰 사용
- [ ] 2단계 페이지 테이블/Inverted page table 계산 문제는 `lib/sim/os/memoryCapacity.ts` 호출
- [ ] 모든 문제에 `subject: 'os'`와 `os-` 접두사 id(`os-{chapter}-{topicSlug}-{nnn}`, [`multi-subject-design.md`](../multi-subject-design.md) §2-1) 사용, `data/subjects/integrity.test.ts` 통과
- [ ] 모든 문제에 `slideRef`, `topic`, `exam`, `examBasis: 'handwritten'`(⭐일 때), `difficulty` 채우기 + 해설 3요소(근거/오답이유/출처) 포함
- [ ] 페이지 버퍼링 항목은 교수님 코멘트대로 **난이도 낮게, 문항 수 적게** 유지
- [ ] 유형 비율 점검 및 중복 문제 검수

## 완료 기준 (DoD)

- `data/subjects/os/ch07.ts` ≥80문항, `data/subjects/os/ch08.ts` ≥120문항
- `content-checklist.md`의 Ch07/Ch08 모든 체크박스 완료 + 실제 문항 수 기록
- 생성기 연동 문제(버디/배치/교체/주소변환) 각각 최소 1개 이상 실제 렌더링해 시뮬레이터 결과와 UI 표시가 일치하는지 수동 확인
- `graph` 유형이 라이트/다크 모드 모두에서 충분한 대비로 보이는지 확인

## 다음 스프린트와의 연결

- Sprint 7에서 OS 4개 챕터 데이터가 모인 상태로 처음 엔드투엔드 플로우를 완성한다.

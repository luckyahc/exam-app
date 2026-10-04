# Sprint 5 — OS 콘텐츠 제작: Ch02 · Ch03

## 목표

`data/subjects/os/ch02.ts`, `data/subjects/os/ch03.ts`를 작성해 각각 최소 50문항/80문항을 채운다. 세부 추적은 [`content-checklist.md`](../content-checklist.md)의 Ch02/Ch03 섹션을 사용하고, 소주제별 목표 문항 수·유형 배분·슬라이드 페이지는 [`coverage-matrix.md`](../coverage-matrix.md)를 따른다. PDF와 §7 대조 결과(불일치 없음, 확인 필요 항목)는 [`source-diff.md`](../source-diff.md)를 참고한다.

## 선행 조건

- Sprint 3(데이터 모델/채점기) 완료
- Sprint 4의 `cpuTime.ts`(Ch02 §응답시간 계산 문제용) 완료

## 작업 항목

> Sprint 4 생성기 중 `cpu-time`(Ch02 시간 계산), `process-switch`(Ch03 Process switch 원인·상태 전이)를 쓸 수 있다.

- [x] `content-checklist.md`의 Ch02 항목을 모두 커버하는 문제 작성 (⭐ 항목은 최소 6~10문항씩, 유형 다각화)
- [x] `content-checklist.md`의 Ch03 항목을 모두 커버하는 문제 작성 (⭐ 항목은 최소 6~10문항씩)
- [x] Ch02 §다중프로그램 일괄처리 vs 시분할 시간 계산 문제는 `lib/sim/os/cpuTime.ts` 생성기 기반으로 작성(파라미터 다양화) — 정적 문제는 슬라이드 수치 + 일부 변형, 파라미터 다양화는 `cpu-time` 생성기
- [x] 모든 문제에 `subject: 'os'`와 `os-` 접두사 id(`os-{chapter}-{topicSlug}-{nnn}`, [`multi-subject-design.md`](../multi-subject-design.md) §2-1) 사용, `data/subjects/integrity.test.ts` 통과
- [x] 모든 문제에 `slideRef`(예: `Ch02 p.12`), `topic`, `exam`(⭐ 여부), `examBasis: 'handwritten'`(⭐일 때), `difficulty` 채우기
- [x] 모든 해설에 정답 근거 + 오답이 틀린 이유 포함, 슬라이드에 없는 보충 설명은 "(보충)" 표시
- [x] 객관식 오답 보기에 그럴듯한 오개념 반영 (원본 §8 예시 참고: mode switch/process switch 혼동 등)
- [x] 빈칸 정답 `accept` 배열에 한/영 표기 변형 포함
- [x] 유형 비율 점검(§8 비율 가이드 대략 준수) — 점검 완료, mcq·ox 과다/blank 부족은 Sprint 6에서 보정(아래 결과)
- [x] 중복/복붙 문제 없는지 자체 검수 (서로 다른 지식 포인트 요구)

## 완료 기준 (DoD)

- `data/subjects/os/ch02.ts` ≥50문항, `data/subjects/os/ch03.ts` ≥80문항, 각각 타입 체크 통과
- `content-checklist.md`의 Ch02/Ch03 모든 체크박스 완료 + 실제 문항 수 기록
- 샘플 20문항을 Sprint 3 렌더러로 실제 렌더링/채점해 스키마 오류 없음 확인

## 결과 (2026-10-04, DONE)

| 챕터 | 문항 | ⭐ | 유형 분포 |
|---|---|---|---|
| Ch02 | 51 (≥50) | 18 | mcq 17 · ox 11 · calc 7 · blank 4 · multi 4 · match 3 · order 3 · classify 2 |
| Ch03 | 90 (≥80) | 61 | mcq 32 · ox 22 · blank 11 · match 7 · order 7 · multi 6 · classify 5 |

- Ch02 시간 계산 calc 7문항은 슬라이드 수치(n=10, t=1, s=0.01, q=0.1, 출력 0.1) 기반으로 `lib/sim/os/cpuTime.ts` 함수가 정답을 계산한다(손으로 쓴 숫자 없음). 파라미터를 바꾼 문제는 Sprint 4 `cpu-time` 생성기가 담당.
- ⭐ 근거는 모두 교수님 필기(`examBasis: 'handwritten'`). Ch03 출제 보류: '잘못된 명령'의 처리 결과(p.4 필기 vs p.42 불일치), 슬라이드에 없는 "과거 CPU 이용률/오늘날 응답시간" 비교.
- 유형 비율: mcq·ox가 가이드보다 많고 blank가 적다 — 개념 챕터라 calc·trace·graph 대상이 적은 탓. Sprint 6에서 전체 비율을 맞춘다([content-checklist 공통 체크](../content-checklist.md#공통-체크)).
- 검증 추가: `data/subjects/integrity.test.ts`에 "정답 키 채점 = 1점", "문제 내 보기·항목·짝 중복 없음" 검사, `components/qtypes/render.test.ts`에서 전 문항(141)을 Sprint 3 렌더러로 풀기 전/채점 후 두 상태로 렌더링(DoD의 '샘플 20문항'을 전 문항으로 확대).
- 브라우저 화면은 챕터 화면이 아직 퀴즈를 띄우지 않아(Sprint 7) 확인하지 않았다. 렌더러 출력은 위 테스트로 검증.

## 다음 스프린트와의 연결

- Sprint 7(화면 구현)에서 이 데이터를 챕터 카드/필터/퀴즈 흐름에 연결해 처음으로 엔드투엔드 확인한다.

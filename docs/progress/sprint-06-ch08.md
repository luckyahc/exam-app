# 진행 기록 — Sprint 6 Ch08 작성

중단 대비 기록. 소주제 하나를 끝낼 때마다 `data/subjects/os/ch08.ts`에 저장하고 이 파일을 갱신한다. 반쯤 쓴 문항은 남기지 않는다.

- 시작: 2026-10-05
- 근거: `source/os/Ch08 Virtual Memory.pdf`(62쪽) — 페이지 번호는 실제 PDF 기준(coverage-matrix와 다른 곳은 `docs/verification/os-ch08.md` 머리 표 참고)
- 사전 작업 완료: `lib/sim/os/workingSet.ts`(+테스트) 신규, Ch08 생성기 slideRef 정정(replacement p.43-50, memory-capacity p.13-15, 역 페이지 테이블 p.16-18)

## 끝낸 소주제

| 소주제 | id 범위 | 문항 |
|---|---|---|
| 실제 vs 가상 메모리 | virtual-001~004 | 4 |
| ⭐ 페이지 폴트 처리 과정 | page-fault-001~009 | 9 |
| ⭐ 지역성의 원리 | locality-001~007 | 7 |
| 가상 메모리에 필요한 지원 | support-001~002 | 2 |
| 페이지 테이블 엔트리 제어 비트 | pte-001~006 | 6 |
| 2단계 페이지 테이블 | two-level-001~004 + 생성기 memory-capacity 3·4 | 4 + 2 |
| 역 페이지 테이블 | inverted-001~005 | 5 |
| ⭐ TLB 주소 변환 | tlb-001~010 | 10 |
| TLB vs 일반 캐시 | tlb-cache-001~002 | 2 |
| ⭐ 페이지 크기 그래프 | page-size-001~010 (graph 2) | 10 |
| 워킹 셋 | working-set-001~006 | 6 |
| ⭐ 스래싱과 부하 제어 | thrashing-001~010 (graph 1) | 10 |
| 세그먼테이션과 페이징 결합 | segmentation-001~005 | 5 |
| 정책 분류 | policy-001 | 1 |
| ⭐ 반입 정책 | fetch-001~009 | 9 |
| 배치 정책 | placement-policy-001~003 | 3 |
| 교체 정책 | replacement-policy-001~003 | 3 |
| 프레임 잠금 | lock-001~004 | 4 |
| ⭐ 교체 알고리즘 | replacement-001~008 + 생성기 replacement 3·2 | 8 + 2 |
| ⭐ Clock 정책 동작(Figure 8.16) | clock-001~006 (2차에 ⭐ 전환 + 006 추가) | 6 |
| LFU/MFU · 교체 알고리즘 비교 | lfu-001~004 (graph 1) | 4 |
| 개선된 클럭 | enhanced-clock-001~005 | 5 |
| 청소 정책 | cleaning-001~004 | 4 |
| 페이지 버퍼링 | page-buffering-001~002 (난이도 1) | 2 |
| 상주 집합 관리 | resident-set-001~005 | 5 |

**전 소주제 완료: 정적 133 + 생성기 4 = 137.** 유형 비율 보정(ox 3문항 → mcq·multi·order) 후 타입 체크·lint·무결성·렌더링·기준값 테스트(`ch08.test.ts`) 통과.

## 진행 중

- 없음(작성 완료, 보고 대기 — 커밋하지 않음)

## 남은 소주제

- 없음

## 대조 기록

- `docs/verification/os-ch08.md` 작성 완료: 일치 127 · 수정 10 · 필기 근거 23 · (보충) 3, 머리에 페이지 번호 대조 표

## 2차 (2026-10-05)

- ⭐ 범위 확인(p.43-51 출제 표시는 p.48뿐) → Clock 정책 동작 ⭐ 전환 + `clock-006` 추가, `tlb-009`를 TLB 히트/미스/폴트 비교(match)로 교체. 최종 138문항(정적 134 + 생성기 4). 커밋 대상.

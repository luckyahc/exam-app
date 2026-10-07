# 문항별 PDF 대조 기록 — 운영체제 Ch07

작성: 2026-10-05 (Sprint 6, Ch07만). 근거 PDF: `source/os/Ch07 Memory Management.pdf`(41쪽). 각 문항의 정답·해설을 `slideRef` 페이지의 원문(인쇄 + 필기)과 대조했다. 손글씨·그림(p.12, 15, 16, 19, 20, 21, 23, 24, 31, 33, 35, 40, 41 등)은 pdftoppm으로 렌더링한 이미지로 확인했다.

- **근거**: `인쇄` = 인쇄 본문·그림만으로 정답이 정해짐 / `p.N 필기(…)` = 정답 판정에 교수님 필기가 필요하거나 정답 문장이 필기를 옮긴 것(문항별 확인). 필기 근거 문항은 해설에 "교수님 필기 기준"을 밝혔다. `(보충)` = 슬라이드에 문장으로 없는 설명을 해설에 넣은 것.
- **정답 계산**: 계산·시뮬레이션 문항의 정답을 만든 `lib/sim/os` 함수. 슬라이드 기준값과의 일치는 `data/subjects/os/ch07.test.ts`가 확인한다(p.23 버디 표 10행, Figure 7.5, Figure 7.11·7.12, p.32·34·35·36·41 기준값).
- **대조 결과**: `일치` = 작성 후 대조에서 고칠 것 없음 / `수정` = 대조·검사 후 고침.
- **slideRef 주의**: `docs/coverage-matrix.md` Ch07 표의 페이지는 실제 PDF보다 대체로 1쪽 앞이다(예: 요구사항 p.2 → 실제 p.3, 비트 분해 p.36 → p.37, 세그먼테이션 p.37-41 → p.38-41). 문항은 실제 페이지를 쓴다.

## 요약

| 구분 | 문항 수 |
|---|---|
| 전체 | 128 (정적 82 + 생성기 7 + 시험 힌트 보강 11 + 용어 단답형 28) |
| 일치 | 119 |
| 수정 | 9 |
| 필기 근거(문항별 확인) | 23 |
| (보충) 포함 | 4 |
| 정답을 lib/sim/os로 계산 | 정적 18 + 생성기 7 |

## 출제하지 않은 것

- p.23 필기 "만약 256을 할당받으면 어느쪽을 할당받나?" — 그 시점에 빈 256K 블록이 둘([256K,512K)·[768K,1024K))이고 어느 쪽을 쓰는지 슬라이드에 답이 없어 정답이 하나로 정해지지 않는다(작성 후 교체, 위 표 buddy-004).
- p.21 필기 "동적으로 메모리를 할당하는 알고리즘은 버디 알고리즘을 더 성능이 좋게 개선시킨것이다" — 인쇄 본문(p.11: 버디 = 고정·동적 분할의 절충)과 방향이 엇갈려 판단 보류.

## 문항별 기록

| # | id | type | slideRef | ⭐ | 근거 | 정답 계산 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|---|---|
| 1 | `os-ch07-requirement-001` | multi | Ch07 p.3 |  | 인쇄 |  | 수정 | 보기 7개 → 6개(유형 규칙 4~6개, '캐싱' 제거) — PDF 대조와 무관한 형식 수정 |
| 2 | `os-ch07-requirement-002` | match | Ch07 p.4-10 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 3 | `os-ch07-requirement-003` | blank | Ch07 p.2 |  | 인쇄 |  | 일치 |  |
| 4 | `os-ch07-relocation-001` | mcq | Ch07 p.4 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 5 | `os-ch07-relocation-002` | ox | Ch07 p.4 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 6 | `os-ch07-relocation-003` | blank | Ch07 p.4 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 7 | `os-ch07-relocation-004` | ox | Ch07 p.5 | ⭐ 힌트 | p.5 필기(가짜 주소) |  | 일치 |  |
| 8 | `os-ch07-relocation-005` | multi | Ch07 p.25 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 9 | `os-ch07-protection-001` | mcq | Ch07 p.6 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 10 | `os-ch07-protection-002` | blank | Ch07 p.6 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 11 | `os-ch07-protection-003` | ox | Ch07 p.6 | ⭐ 힌트 | p.6 필기(trap → process switch) |  | 일치 |  |
| 12 | `os-ch07-protection-004` | match | Ch07 p.7 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 13 | `os-ch07-protection-005` | calc | Ch07 p.7 | ⭐ 힌트 | 인쇄 | baseBounds | 일치 |  |
| 14 | `os-ch07-protection-006` | mcq | Ch07 p.7 | ⭐ 힌트 | 인쇄 | baseBounds | 일치 |  |
| 15 | `os-ch07-sharing-001` | classify | Ch07 p.8 | ⭐ 힌트 | p.8 필기(1·2 코드, 3 데이터) |  | 일치 |  |
| 16 | `os-ch07-sharing-002` | ox | Ch07 p.8 | ⭐ 힌트 | p.8 필기(DLL은 코드 공유) |  | 일치 |  |
| 17 | `os-ch07-sharing-003` | match | Ch07 p.8 | ⭐ 힌트 | p.8 필기(정적 vs DLL) |  | 일치 |  |
| 18 | `os-ch07-sharing-004` | mcq | Ch07 p.8 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 19 | `os-ch07-sharing-005` | blank | Ch07 p.8 | ⭐ 힌트 | p.8 필기(OS·Windows API는 DLL) |  | 일치 |  |
| 20 | `os-ch07-sharing-006` | ox | Ch07 p.8 | ⭐ 힌트 | p.8 필기(코드는 읽기만) |  | 일치 |  |
| 21 | `os-ch07-logical-org-001` | mcq | Ch07 p.9 |  | 인쇄 |  | 일치 |  |
| 22 | `os-ch07-logical-org-002` | blank | Ch07 p.9 |  | 인쇄 |  | 일치 |  |
| 23 | `os-ch07-logical-org-003` | ox | Ch07 p.9 |  | 인쇄 |  | 일치 |  |
| 24 | `os-ch07-logical-org-004` | multi | Ch07 p.9 |  | 인쇄 |  | 일치 |  |
| 25 | `os-ch07-physical-org-001` | mcq | Ch07 p.10 |  | 인쇄 |  | 일치 |  |
| 26 | `os-ch07-physical-org-002` | blank | Ch07 p.10 |  | 인쇄 |  | 일치 |  |
| 27 | `os-ch07-physical-org-003` | ox | Ch07 p.10 |  | 인쇄 |  | 일치 |  |
| 28 | `os-ch07-physical-org-004` | ox | Ch07 p.10 |  | 인쇄 |  | 일치 |  |
| 29 | `os-ch07-partition-001` | classify | Ch07 p.11-14 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 30 | `os-ch07-partition-002` | mcq | Ch07 p.12-13 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 31 | `os-ch07-partition-003` | mcq | Ch07 p.15 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 32 | `os-ch07-partition-004` | blank | Ch07 p.14 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 33 | `os-ch07-partition-005` | blank | Ch07 p.11 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 34 | `os-ch07-partition-006` | multi | Ch07 p.14 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 35 | `os-ch07-partition-007` | classify | Ch07 p.12 | ⭐ 힌트 | p.12 필기(8M 2개, 줄 서기) |  | 일치 |  |
| 36 | `os-ch07-placement-001` | match | Ch07 p.16-19 | ⭐ | 인쇄 |  | 일치 |  |
| 37 | `os-ch07-placement-002` | mcq | Ch07 p.16-17 | ⭐ | 인쇄 |  | 일치 |  |
| 38 | `os-ch07-placement-003` | mcq | Ch07 p.19 | ⭐ | 인쇄 + (보충) Best·Worst가 느린 이유(전체 탐색) |  | 수정 | 해설: 속도 차이의 이유는 슬라이드에 없어 '(보충)' 표시 |
| 39 | `os-ch07-placement-004` | trace | Ch07 p.20 | ⭐ | 인쇄 | chooseHole(Figure 7.5) | 일치 |  |
| 40 | `os-ch07-placement-005` | blank | Ch07 p.20 | ⭐ | p.20 필기(Next-fit 처음으로) |  | 일치 |  |
| 41 | `os-ch07-placement-006` | blank | Ch07 p.19 | ⭐ | 인쇄 |  | 일치 |  |
| 42 | `os-ch07-placement-007` | ox | Ch07 p.18-19 | ⭐ | 인쇄 |  | 일치 |  |
| 43 | `os-ch07-placement-008` | multi | Ch07 p.16, p.19 | ⭐ | 인쇄 |  | 일치 |  |
| 44 | `os-ch07-gen-placement-1` | mcq | Ch07 p.16-20 | ⭐ | 인쇄 | 생성기 placement(seed 1, {"fit":"next"}) | 수정 | 생성기 slideRef p.15-19 → p.16-20(실제 페이지) |
| 45 | `os-ch07-gen-placement-2` | mcq | Ch07 p.16-20 | ⭐ | 인쇄 | 생성기 placement(seed 2, {"fit":"best"}) | 수정 | 생성기 slideRef p.15-19 → p.16-20 |
| 46 | `os-ch07-buddy-001` | trace | Ch07 p.23 | ⭐ | 인쇄 | simulateBuddy(p.23 표) | 일치 |  |
| 47 | `os-ch07-buddy-002` | calc | Ch07 p.23 | ⭐ | 인쇄 | roundUpPow2 | 일치 |  |
| 48 | `os-ch07-buddy-003` | mcq | Ch07 p.23-24 | ⭐ | 인쇄 |  | 일치 |  |
| 49 | `os-ch07-buddy-004` | mcq | Ch07 p.21 | ⭐ | 인쇄 | simulateBuddy(p.21) | 수정 | 교체: p.23 필기 질문 '256을 할당받으면 어느쪽?'을 묻던 문항 — 빈 256K 블록이 둘이라 어느 쪽인지 슬라이드에 답이 없음(시뮬레이터의 낮은 주소 규칙일 뿐) → 답이 인쇄된 p.21 40 bytes 할당 예로 교체 |
| 50 | `os-ch07-buddy-005` | ox | Ch07 p.21 | ⭐ | 인쇄 |  | 일치 |  |
| 51 | `os-ch07-buddy-006` | blank | Ch07 p.21 | ⭐ | 인쇄 |  | 일치 |  |
| 52 | `os-ch07-buddy-007` | blank | Ch07 p.24 | ⭐ | p.24 필기(트리 구조) |  | 일치 |  |
| 53 | `os-ch07-buddy-008` | classify | Ch07 p.23 | ⭐ | p.23 필기(new·malloc / free·delete) |  | 일치 |  |
| 54 | `os-ch07-gen-buddy-2` | mcq | Ch07 p.21-24 | ⭐ | 인쇄 | 생성기 buddy(seed 2, {"variant":"state"}) | 수정 | 생성기 slideRef p.20-24 → p.21-24 |
| 55 | `os-ch07-gen-buddy-1` | calc | Ch07 p.21-24 | ⭐ | 인쇄 | 생성기 buddy(seed 1, {"variant":"start"}) | 수정 | 생성기 slideRef p.20-24 → p.21-24 |
| 56 | `os-ch07-address-001` | match | Ch07 p.26 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 57 | `os-ch07-address-002` | ox | Ch07 p.26 | ⭐ 힌트 | p.26 필기(메모리만 진짜 주소) |  | 일치 |  |
| 58 | `os-ch07-address-003` | blank | Ch07 p.26 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 59 | `os-ch07-address-004` | mcq | Ch07 p.26, p.33 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 60 | `os-ch07-paging-basic-001` | blank | Ch07 p.27 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 61 | `os-ch07-paging-basic-002` | mcq | Ch07 p.31 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 62 | `os-ch07-paging-basic-003` | ox | Ch07 p.29-30 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 63 | `os-ch07-paging-basic-004` | calc | Ch07 p.28 | ⭐ 힌트 | 인쇄 | pageTableInfo | 일치 |  |
| 64 | `os-ch07-paging-basic-005` | mcq | Ch07 p.31 | ⭐ 힌트 | p.31 필기(N = 로딩 안 됨) |  | 일치 |  |
| 65 | `os-ch07-paging-basic-006` | blank | Ch07 p.31 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 66 | `os-ch07-translation-001` | calc | Ch07 p.34 | ⭐ | 인쇄 | logicalToPhysical | 일치 |  |
| 67 | `os-ch07-translation-002` | calc | Ch07 p.35 | ⭐ | 인쇄 + (보충) 물리→논리는 선형 탐색이라 느림 | physicalToLogical | 일치 |  |
| 68 | `os-ch07-translation-003` | calc | Ch07 p.36 | ⭐ | 인쇄 | solveFrame | 일치 |  |
| 69 | `os-ch07-translation-004` | calc | Ch07 p.32, p.37 | ⭐ | 인쇄 | logicalToPhysical | 일치 |  |
| 70 | `os-ch07-translation-005` | trace | Ch07 p.34 | ⭐ | 인쇄 | logicalToPhysical | 일치 |  |
| 71 | `os-ch07-translation-006` | mcq | Ch07 p.32, p.35 | ⭐ | 인쇄 + (보충) 물리→논리는 선형 탐색이라 느림 |  | 일치 |  |
| 72 | `os-ch07-translation-007` | order | Ch07 p.34 | ⭐ | 인쇄 |  | 일치 |  |
| 73 | `os-ch07-translation-008` | blank | Ch07 p.34 | ⭐ | 인쇄 |  | 일치 |  |
| 74 | `os-ch07-gen-paging-1` | calc | Ch07 p.32-36 | ⭐ | 인쇄 + (보충) 물리→논리는 선형 탐색이라 느림(생성기 해설) | 생성기 paging(seed 1, {"variant":"p2l","pageSize":4096}) | 수정 | 생성기 해설의 '선형 탐색이라 느리다'에 '(보충)' 표시 |
| 75 | `os-ch07-gen-paging-2` | calc | Ch07 p.32-36 | ⭐ | 인쇄 | 생성기 paging(seed 2, {"variant":"solve","pageSize":2048}) | 일치 |  |
| 76 | `os-ch07-bit-slice-001` | calc | Ch07 p.33 | ⭐ 힌트 | 인쇄 | logicalToPhysical(Figure 7.11) | 일치 |  |
| 77 | `os-ch07-bit-slice-002` | blank | Ch07 p.37 |  | 인쇄 |  | 일치 |  |
| 78 | `os-ch07-bit-slice-003` | calc | Ch07 p.37 | ⭐ 힌트 | 인쇄 | bitSplit | 일치 |  |
| 79 | `os-ch07-bit-slice-004` | mcq | Ch07 p.37 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 80 | `os-ch07-bit-slice-005` | trace | Ch07 p.37 | ⭐ 힌트 | 인쇄 | bitSplit | 일치 |  |
| 81 | `os-ch07-segmentation-001` | calc | Ch07 p.41 | ⭐ 힌트 | 인쇄 | segLogicalToPhysical | 일치 |  |
| 82 | `os-ch07-segmentation-002` | mcq | Ch07 p.41 |  | 인쇄 | segLogicalToPhysical | 일치 |  |
| 83 | `os-ch07-segmentation-003` | calc | Ch07 p.40 | ⭐ 힌트 | 인쇄 | segLogicalToPhysical(Figure 7.12) | 일치 |  |
| 84 | `os-ch07-segmentation-004` | blank | Ch07 p.40-41 |  | 인쇄 |  | 일치 |  |
| 85 | `os-ch07-segmentation-005` | ox | Ch07 p.38 |  | 인쇄 |  | 일치 |  |
| 86 | `os-ch07-segmentation-006` | mcq | Ch07 p.41 |  | p.41 필기(유일한 차이) |  | 일치 |  |
| 87 | `os-ch07-segmentation-007` | ox | Ch07 p.38 |  | 인쇄 |  | 일치 |  |
| 88 | `os-ch07-segmentation-008` | order | Ch07 p.41 | ⭐ 힌트 | 인쇄 |  | 일치 |  |
| 89 | `os-ch07-gen-segmentation-1` | mcq | Ch07 p.38-41 | ⭐ 힌트 | 인쇄 | 생성기 segmentation(seed 1, {"trap":true}) | 수정 | 생성기 slideRef p.37-41 → p.38-41 |
| 90 | `os-ch07-hint-relocation-001` | match | Ch07 p.4 | ⭐ 힌트 | p.4 필기 |  | 일치 | [시험 힌트 7-1] 신규 match |
| 91 | `os-ch07-hint-requirement-001` | match | Ch07 p.4-8 | ⭐ 힌트 | p.4-8 필기 |  | 일치 | [시험 힌트 7-1, 7-2, 7-3] 신규 match |
| 92 | `os-ch07-hint-protection-001` | blank | Ch07 p.6 | ⭐ 힌트 | p.6 필기 |  | 일치 | [시험 힌트 7-2] 신규 blank |
| 93 | `os-ch07-hint-partition-001` | match | Ch07 p.11, p.13-14 | ⭐ 힌트 | 인쇄 |  | 일치 | [시험 힌트 7-4, 7-5] 신규 match |
| 94 | `os-ch07-hint-partition-002` | blank | Ch07 p.13 | ⭐ 힌트 | p.13 필기 |  | 일치 | [시험 힌트 7-4] 신규 blank |
| 95 | `os-ch07-hint-partition-003` | mcq | Ch07 p.12-13 | ⭐ 힌트 | p.12-13 필기 |  | 일치 | [시험 힌트 7-4] 신규 mcq |
| 96 | `os-ch07-hint-partition-004` | mcq | Ch07 p.14 | ⭐ 힌트 | p.14 필기 |  | 일치 | [시험 힌트 7-5] 신규 mcq |
| 97 | `os-ch07-hint-placement-001` | match | Ch07 p.19 | ⭐ 힌트 | 인쇄 |  | 일치 | [시험 힌트 7-6] 신규 match |
| 98 | `os-ch07-hint-buddy-001` | order | Ch07 p.21 | ⭐ 힌트 | 인쇄 |  | 일치 | [시험 힌트 7-7] 신규 order |
| 99 | `os-ch07-hint-buddy-002` | order | Ch07 p.22 | ⭐ 힌트 | 인쇄 |  | 일치 | [시험 힌트 7-8] 신규 order |
| 100 | `os-ch07-hint-buddy-003` | match | Ch07 p.21-22 | ⭐ 힌트 | p.21-22 필기 |  | 일치 | [시험 힌트 7-7, 7-8] 신규 match |
| 101 | `os-ch07-term-001` | blank | Ch07 p.2 |  | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 메모리 관리 |
| 102 | `os-ch07-term-002` | blank | Ch07 p.4 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 재배치 (시험 힌트 7-1) |
| 103 | `os-ch07-term-003` | blank | Ch07 p.6 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 보호 (시험 힌트 7-2) |
| 104 | `os-ch07-term-004` | blank | Ch07 p.8 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 공유 (시험 힌트 7-3) |
| 105 | `os-ch07-term-005` | blank | Ch07 p.9 |  | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 논리적 구성 |
| 106 | `os-ch07-term-006` | blank | Ch07 p.10 |  | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 물리적 구성 |
| 107 | `os-ch07-term-007` | blank | Ch07 p.7 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 베이스 레지스터 (시험 힌트 7-1, 7-2) |
| 108 | `os-ch07-term-008` | blank | Ch07 p.7 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 바운드 레지스터 (시험 힌트 7-2) |
| 109 | `os-ch07-term-009` | blank | Ch07 p.8 | ⭐ 힌트 | p.8 필기 |  | 일치 | [용어] 신규 용어 단답형 — DLL 라이브러리 (시험 힌트 7-3) |
| 110 | `os-ch07-term-010` | blank | Ch07 p.8 | ⭐ 힌트 | p.8 필기 |  | 일치 | [용어] 신규 용어 단답형 — 정적 라이브러리 (시험 힌트 7-3) |
| 111 | `os-ch07-term-011` | blank | Ch07 p.11 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 고정 분할 (시험 힌트 7-4) |
| 112 | `os-ch07-term-012` | blank | Ch07 p.14 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 동적 분할 (시험 힌트 7-5) |
| 113 | `os-ch07-term-013` | blank | Ch07 p.16 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 배치 알고리즘 (시험 힌트 7-6) |
| 114 | `os-ch07-term-014` | blank | Ch07 p.16 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 최적 적합 (시험 힌트 7-6) |
| 115 | `os-ch07-term-015` | blank | Ch07 p.17 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 최초 적합 (시험 힌트 7-6) |
| 116 | `os-ch07-term-016` | blank | Ch07 p.18 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 다음 적합 (시험 힌트 7-6) |
| 117 | `os-ch07-term-017` | blank | Ch07 p.19 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 최악 적합 (시험 힌트 7-6) |
| 118 | `os-ch07-term-018` | blank | Ch07 p.11 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 버디 시스템 (시험 힌트 7-7, 7-8) |
| 119 | `os-ch07-term-019` | blank | Ch07 p.22 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 합병 (시험 힌트 7-8) |
| 120 | `os-ch07-term-020` | blank | Ch07 p.26 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 논리 주소 (시험 힌트 7-10) |
| 121 | `os-ch07-term-021` | blank | Ch07 p.26 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 상대 주소 (시험 힌트 7-10) |
| 122 | `os-ch07-term-022` | blank | Ch07 p.26 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 물리 주소 (시험 힌트 7-10) |
| 123 | `os-ch07-term-023` | blank | Ch07 p.27 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 기본 페이징 시스템 (시험 힌트 7-9) |
| 124 | `os-ch07-term-024` | blank | Ch07 p.27 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 페이지 테이블 (시험 힌트 7-9, 7-10) |
| 125 | `os-ch07-term-025` | blank | Ch07 p.27 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 오프셋 (시험 힌트 7-10) |
| 126 | `os-ch07-term-026` | blank | Ch07 p.38 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 기본 세그먼테이션 시스템 (시험 힌트 7-10) |
| 127 | `os-ch07-term-027` | blank | Ch07 p.38 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 세그먼트 (시험 힌트 7-10) |
| 128 | `os-ch07-term-028` | blank | Ch07 p.41 | ⭐ 힌트 | 인쇄 |  | 일치 | [용어] 신규 용어 단답형 — 세그먼트 테이블 (시험 힌트 7-10) |

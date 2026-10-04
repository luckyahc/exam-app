# 문항별 PDF 대조 기록 — 운영체제 Ch08

작성: 2026-10-05 (Sprint 6). 근거 PDF: `source/os/Ch08 Virtual Memory.pdf`(62쪽). 각 문항의 정답·해설을 `slideRef` 페이지의 원문(인쇄 + 필기)과 대조했다. 그림·필기 페이지(p.13, 20, 23, 24, 25, 28, 30, 37, 38, 49, 50, 51, 54, 62 등)는 pdftoppm으로 렌더링한 이미지로 확인했다.

- **근거**: `인쇄` = 인쇄 본문·그림만으로 정답이 정해짐 / `p.N 필기(…)` = 정답 판정에 교수님 필기가 필요하거나 정답 문장이 필기를 옮긴 것(문항별 확인). 필기 근거 문항은 해설에 "교수님 필기 기준"을 밝혔다. `(보충)` = 슬라이드에 문장으로 없는 설명.
- **정답 계산**: 계산·시뮬레이션 정답을 만든 `lib/sim/os` 함수. 슬라이드 기준값과의 일치는 `data/subjects/os/ch08.test.ts`가 확인한다(Figure 8.15 OPT·LRU·FIFO·CLOCK 프레임·F·use bit·pointer, Figure 8.16 교체·다음 폴트, p.14·p.17 필기 수치, 워킹 셋).
- **대조 결과**: `일치` = 작성 후 대조에서 고칠 것 없음 / `수정` = 대조·검사 후 고침(정답 변경 없음).

## 페이지 번호 대조 (coverage-matrix · 원본 §7 · 실제 PDF)

문항은 **실제 PDF 페이지**를 쓴다. coverage-matrix의 Ch08 페이지는 대체로 1쪽 앞이고, 원본 §7에 적힌 ⭐ 페이지(p.5-6, 7-8, 19-23, 26-28, 39, 43-51)는 실제와 일치한다.

| 소주제 | coverage-matrix | 원본 §7 | 실제 PDF | 비고 |
|---|---|---|---|---|
| 실제 vs 가상 메모리 / MMU | p.2-3 | — | p.2-4 | p.4 = 가상 메모리 차이점 |
| ⭐ 페이지 폴트 처리 과정 | p.4-6 | p.5-6 | p.5-6 | matrix만 1쪽 앞 |
| ⭐ 지역성의 원리 | p.7-8 | p.7-8 | p.7-8 | 일치 |
| 가상 메모리 HW/OS 지원 | p.9 | — | p.9 | 일치 |
| 페이지 테이블 엔트리 제어 비트 | p.9-12, p.41, p.46 | — | p.10-12, p.42, p.47 | P p.10, M p.12, Lock p.42, use p.47 |
| 2단계 페이지 테이블 | p.13-14 | — | p.13-15 | p.13 = Figure 8.3, p.15 = 페이지 테이블도 가상 메모리에 |
| 역 페이지 테이블 | p.15-17 | — | p.16-18 | |
| ⭐ TLB 주소 변환 | p.18-23 | p.19-23 | p.19-24 | p.24 = Figure 8.8 흐름도 |
| TLB vs 일반 캐시 | p.24 | — | p.25 | Figure 8.10 + 필기 |
| ⭐ 페이지 크기 그래프 | p.25-28 | p.26-28 | p.26-28, p.30 | p.30 = 페이지 크기 예시 표 |
| 워킹 셋 | p.27, p.59 | — | p.28(필기), p.60 | |
| ⭐ 스래싱·부하 제어 | p.28-29, p.60-62 | — | p.29, p.61-62 | |
| 세그먼테이션 + 결합 | p.30-35 | — | p.31-37 | p.37 = Figure 8.13 |
| 정책 분류 | p.38 | — | 정책별 슬라이드 p.39·40·41·55·58·61 | p.38은 Figure 8.14(세그먼트 보호) — 분류를 모아 둔 쪽은 없음 |
| ⭐ 반입 정책 | p.39 | p.39 | p.39 | 일치 |
| 배치 정책 | p.40 | — | p.40 | 일치 |
| 교체 정책 개념 | p.40-41 | — | p.41 | |
| 프레임 잠금 | p.41-42 | — | p.42 | |
| ⭐ 기본 교체 알고리즘 | p.42-49 (Fig 8.15 p.48) | p.43-51 | p.43-48 (Fig 8.15 p.48), Clock 동작 p.49-50, 비교 p.51 | |
| 개선된 클럭 | p.51-53 | — | p.52-53 | p.54 = Figure 8.18(그림만) |
| 청소 정책 | p.54-55 | — | p.55 | |
| 페이지 버퍼링 | p.55-57 | — | p.56-57 | |
| 상주 집합 관리 | p.57-59 | — | p.58-59 | |

## 요약

| 구분 | 문항 수 |
|---|---|
| 전체 | 138 (정적 134 + 생성기 4) |
| 일치 | 121 |
| 수정 | 16 |
| 추가(2차) | 1 |
| 필기 근거(문항별 확인) | 24 |
| (보충) 포함 | 3 |
| 정답을 lib/sim/os로 계산 | 정적 14 + 생성기 4 |

## 반드시 반영한 내용과 근거 페이지

| 내용 | 근거 | 문항 |
|---|---|---|
| Clock에서 단순 참조(히트)만 일어나면 pointer는 움직이지 않는다 | p.48 필기 | replacement-004·006 |
| 모든 use bit가 1이면 한 바퀴 돌며 0으로 바꾼 뒤 두 바퀴째에 교체 | p.47 인쇄(+p.49 필기) | replacement-004, clock-003·005 |
| 고정 할당 + 전역 교체는 불가능 | p.59 인쇄 (이유는 슬라이드에 없어 (보충)) | resident-set-001·004 |
| 선반입은 현실적으로 구현이 거의 불가능해 주로 요구 페이징을 쓴다 | p.39 필기 | fetch-005·008·009 |
| TLB는 주소 변환용 캐시이고 데이터 캐시와 별개 | p.25 필기(Figure 8.10) | tlb-cache-001·002, tlb-004 |

## ⭐ 범위 확인 (p.43-51, 2026-10-05 2차)

p.43-51을 이미지로 확인한 결과 교수님의 출제 표시는 **p.48 하나뿐**이다.

- p.48(Figure 8.15): "시험: 중간에 빈 공간 집어넣고 페이지 폴트가 발생하면 어떻게 되는가. 매꿔놓으시오." — 이 밖의 p.48 필기는 "3번의 F", "4번의 F", "궁극적으로 널리 사용되는건 CLOCK", "기존에 있는 페이지를 단순히 참조만 하는 경우에는 next frame pointer 안 바뀜! 교체가 일어날 때만 바뀜" 등.
- p.50(Figure 8.16 b): 필기 "이 상태에서 또 page fault가 발생했을 때 어떤걸 교체해야할까: 5번 프레임" — "시험" 표기는 아니지만 질문 형태의 필기.
- p.43·44·45·46·47·49·51: 출제 표시 없음(p.44·46의 LFU/MFU 포함).

결정(2026-10-05 지시): **Clock 정책 동작(Figure 8.16) 소주제를 ⭐로 전환**(소주제 분리는 유지, 근거 p.48 "시험" + p.50 필기). **LFU/MFU는 표시가 없어 ⭐ 아님** 유지.

## 출제하지 않은 것

- 정책 분류를 한 장에 모은 슬라이드는 없다(coverage-matrix의 p.38은 Figure 8.14). 각 정책 슬라이드의 첫 정의만 모아 `policy-001` 한 문항으로 냈다.
- p.31 필기 "세그먼테이션 부분은 … 실질적으로 우리가 다룰 일은 없기 때문에 그냥 넘어감" — 세그먼테이션은 인쇄 본문의 기본 사실만 5문항(난이도 1~2)으로 제한.
- p.24 Figure 8.8의 흐름도는 순서 문항으로 냈고, Figure 8.18(p.54 Clock 상태 예)·Table 8.2(p.30 페이지 크기 예시)의 개별 수치는 암기 대상이 아니라 출제하지 않음.

## 문항별 기록

| # | id | type | slideRef | ⭐ | 근거 | 정답 계산 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|---|---|
| 1 | `os-ch08-virtual-001` | mcq | Ch08 p.3-4 |  | 인쇄 |  | 일치 |  |
| 2 | `os-ch08-virtual-002` | blank | Ch08 p.2 |  | 인쇄 |  | 일치 |  |
| 3 | `os-ch08-virtual-003` | multi | Ch08 p.4 |  | 인쇄 |  | 일치 |  |
| 4 | `os-ch08-virtual-004` | mcq | Ch08 p.3 |  | 인쇄 |  | 수정 | ox → mcq(유형 비율: ox ≤18%), 같은 지식 포인트 |
| 5 | `os-ch08-page-fault-001` | order | Ch08 p.5 | ⭐ | 인쇄 |  | 일치 |  |
| 6 | `os-ch08-page-fault-002` | order | Ch08 p.6 | ⭐ | 인쇄 |  | 일치 |  |
| 7 | `os-ch08-page-fault-003` | blank | Ch08 p.5 | ⭐ | 인쇄 |  | 일치 |  |
| 8 | `os-ch08-page-fault-004` | blank | Ch08 p.5 | ⭐ | 인쇄 |  | 일치 |  |
| 9 | `os-ch08-page-fault-005` | mcq | Ch08 p.6 | ⭐ | p.6 필기(MMU가 memory fault를 건다) |  | 일치 |  |
| 10 | `os-ch08-page-fault-006` | mcq | Ch08 p.5 | ⭐ | 인쇄 |  | 일치 |  |
| 11 | `os-ch08-page-fault-007` | ox | Ch08 p.6 | ⭐ | 인쇄 |  | 일치 |  |
| 12 | `os-ch08-page-fault-008` | classify | Ch08 p.5-6 | ⭐ | 인쇄 |  | 일치 |  |
| 13 | `os-ch08-page-fault-009` | match | Ch08 p.5-6 | ⭐ | 인쇄 |  | 일치 |  |
| 14 | `os-ch08-locality-001` | blank | Ch08 p.8 | ⭐ | 인쇄 |  | 일치 |  |
| 15 | `os-ch08-locality-002` | blank | Ch08 p.8 | ⭐ | 인쇄 |  | 일치 |  |
| 16 | `os-ch08-locality-003` | mcq | Ch08 p.8 | ⭐ | 인쇄 |  | 일치 |  |
| 17 | `os-ch08-locality-004` | ox | Ch08 p.8 | ⭐ | 인쇄 |  | 일치 |  |
| 18 | `os-ch08-locality-005` | ox | Ch08 p.7 | ⭐ | 인쇄 |  | 수정 | 해설 근거 정정: p.7 필기 '이때 메모리폴트 발생'만으로는 모호 → p.4·p.5 인쇄를 주 근거로 |
| 19 | `os-ch08-locality-006` | mcq | Ch08 p.7-8, p.44 | ⭐ | 인쇄 |  | 일치 |  |
| 20 | `os-ch08-locality-007` | multi | Ch08 p.8 | ⭐ | 인쇄 |  | 일치 |  |
| 21 | `os-ch08-support-001` | classify | Ch08 p.9 |  | 인쇄 |  | 일치 |  |
| 22 | `os-ch08-support-002` | mcq | Ch08 p.9 |  | 인쇄 |  | 일치 |  |
| 23 | `os-ch08-pte-001` | match | Ch08 p.10, p.12, p.42, p.47 |  | 인쇄 |  | 일치 |  |
| 24 | `os-ch08-pte-002` | mcq | Ch08 p.12 |  | 인쇄 |  | 일치 |  |
| 25 | `os-ch08-pte-003` | blank | Ch08 p.12 |  | 인쇄 |  | 일치 |  |
| 26 | `os-ch08-pte-004` | blank | Ch08 p.10 |  | 인쇄 |  | 일치 |  |
| 27 | `os-ch08-pte-005` | ox | Ch08 p.10 |  | 인쇄 |  | 일치 |  |
| 28 | `os-ch08-pte-006` | multi | Ch08 p.11, p.42, p.47 |  | p.42·p.47 필기(엔트리 = 프레임 번호 + 제어 비트) |  | 일치 |  |
| 29 | `os-ch08-two-level-001` | calc | Ch08 p.14 |  | p.14 필기(4GB/4K → 백만 개) | pageTableInfo | 일치 |  |
| 30 | `os-ch08-two-level-002` | mcq | Ch08 p.14 |  | p.14 필기(테이블이 하나 더 필요) |  | 일치 |  |
| 31 | `os-ch08-two-level-003` | ox | Ch08 p.15 |  | 인쇄 |  | 일치 |  |
| 32 | `os-ch08-two-level-004` | blank | Ch08 p.13 |  | p.13 필기(메모리 읽음 1·2) |  | 일치 |  |
| 33 | `os-ch08-gen-memory-capacity-3` | calc | Ch08 p.13-15 |  | 인쇄 | 생성기 memory-capacity(seed 3, {"variant":"tableKB"}) | 수정 | 생성기 slideRef p.13-14 → p.13-15 |
| 34 | `os-ch08-gen-memory-capacity-4` | calc | Ch08 p.13-15 |  | 인쇄 | 생성기 memory-capacity(seed 4, {"variant":"pagesForTable"}) | 수정 | 생성기 slideRef p.13-14 → p.13-15 |
| 35 | `os-ch08-inverted-001` | match | Ch08 p.17 |  | 인쇄 |  | 일치 |  |
| 36 | `os-ch08-inverted-002` | mcq | Ch08 p.16-17 |  | 인쇄 |  | 일치 |  |
| 37 | `os-ch08-inverted-003` | blank | Ch08 p.16 |  | 인쇄 |  | 일치 |  |
| 38 | `os-ch08-inverted-004` | multi | Ch08 p.16 |  | 인쇄 |  | 수정 | ox → multi(유형 비율), p.30 표의 컴퓨터를 오답으로 |
| 39 | `os-ch08-inverted-005` | calc | Ch08 p.17-18 |  | p.17 필기(RAM 4GB → 엔트리 100만) | invertedEntries | 일치 |  |
| 40 | `os-ch08-tlb-001` | order | Ch08 p.21-22, p.24 | ⭐ | 인쇄 |  | 일치 |  |
| 41 | `os-ch08-tlb-002` | order | Ch08 p.24 | ⭐ | 인쇄 |  | 일치 |  |
| 42 | `os-ch08-tlb-003` | mcq | Ch08 p.19 | ⭐ | 인쇄 |  | 일치 |  |
| 43 | `os-ch08-tlb-004` | mcq | Ch08 p.19 | ⭐ | 인쇄 |  | 일치 |  |
| 44 | `os-ch08-tlb-005` | blank | Ch08 p.19 | ⭐ | 인쇄 |  | 일치 |  |
| 45 | `os-ch08-tlb-006` | blank | Ch08 p.21 | ⭐ | 인쇄 |  | 일치 |  |
| 46 | `os-ch08-tlb-007` | classify | Ch08 p.21-24 | ⭐ | p.23 필기(blocked·page table 수정) |  | 일치 |  |
| 47 | `os-ch08-tlb-008` | ox | Ch08 p.21-22 | ⭐ | 인쇄 |  | 일치 |  |
| 48 | `os-ch08-tlb-009` | match | Ch08 p.19-23 | ⭐ | p.20·p.23 필기(메모리 두 번 읽음, 캐시에서 바로 꺼냄, blocked) |  | 수정 | [2차] multi → match: TLB 히트 / TLB 미스·페이지 테이블 히트 / 페이지 폴트별 메모리·디스크 접근 비교로 교체(TLB ⭐가 이미 10문항이라 추가 대신 교체, 이전 multi의 내용은 해설에 남김) |
| 49 | `os-ch08-tlb-010` | mcq | Ch08 p.23-24 | ⭐ | 인쇄 |  | 일치 |  |
| 50 | `os-ch08-tlb-cache-001` | ox | Ch08 p.25 |  | p.25 필기(TLB ≠ 데이터 캐시) |  | 일치 |  |
| 51 | `os-ch08-tlb-cache-002` | mcq | Ch08 p.25 |  | 인쇄 |  | 일치 |  |
| 52 | `os-ch08-page-size-001` | graph | Ch08 p.28 | ⭐ | 인쇄 |  | 일치 |  |
| 53 | `os-ch08-page-size-002` | graph | Ch08 p.28 | ⭐ | 인쇄 |  | 일치 |  |
| 54 | `os-ch08-page-size-003` | blank | Ch08 p.26 | ⭐ | 인쇄 |  | 일치 |  |
| 55 | `os-ch08-page-size-004` | blank | Ch08 p.28 | ⭐ | 인쇄 |  | 일치 |  |
| 56 | `os-ch08-page-size-005` | mcq | Ch08 p.26 | ⭐ | 인쇄 |  | 일치 |  |
| 57 | `os-ch08-page-size-006` | mcq | Ch08 p.27 | ⭐ | 인쇄 |  | 일치 |  |
| 58 | `os-ch08-page-size-007` | ox | Ch08 p.26 | ⭐ | 인쇄 |  | 일치 |  |
| 59 | `os-ch08-page-size-008` | ox | Ch08 p.28 | ⭐ | p.28 필기(무릎 높이) |  | 일치 |  |
| 60 | `os-ch08-page-size-009` | classify | Ch08 p.26-27 | ⭐ | 인쇄 |  | 일치 |  |
| 61 | `os-ch08-page-size-010` | match | Ch08 p.28 | ⭐ | 인쇄 |  | 일치 |  |
| 62 | `os-ch08-working-set-001` | calc | Ch08 p.60 |  | 인쇄 + (보충) W(t,Δ) 창 경계(t 포함 최근 Δ번)를 문제에서 정의 | workingSet | 일치 |  |
| 63 | `os-ch08-working-set-002` | calc | Ch08 p.60 |  | 인쇄 + (보충) W(t,Δ) 창 경계를 문제에서 정의 | workingSet | 일치 |  |
| 64 | `os-ch08-working-set-003` | blank | Ch08 p.60 |  | 인쇄 |  | 일치 |  |
| 65 | `os-ch08-working-set-004` | mcq | Ch08 p.60 |  | 인쇄 |  | 일치 |  |
| 66 | `os-ch08-working-set-005` | ox | Ch08 p.28 |  | p.28 필기(프로세스 자기 페이지 집합) |  | 일치 |  |
| 67 | `os-ch08-working-set-006` | multi | Ch08 p.60 |  | 인쇄 |  | 일치 |  |
| 68 | `os-ch08-thrashing-001` | graph | Ch08 p.62 | ⭐ | 인쇄 |  | 일치 |  |
| 69 | `os-ch08-thrashing-002` | blank | Ch08 p.29 | ⭐ | 인쇄 |  | 일치 |  |
| 70 | `os-ch08-thrashing-003` | blank | Ch08 p.62 | ⭐ | 인쇄 |  | 일치 |  |
| 71 | `os-ch08-thrashing-004` | order | Ch08 p.29 | ⭐ | 인쇄 |  | 일치 |  |
| 72 | `os-ch08-thrashing-005` | mcq | Ch08 p.29, p.61 | ⭐ | 인쇄 |  | 일치 |  |
| 73 | `os-ch08-thrashing-006` | mcq | Ch08 p.29 | ⭐ | 인쇄 |  | 일치 |  |
| 74 | `os-ch08-thrashing-007` | ox | Ch08 p.61 | ⭐ | p.61 필기(자동 부하 제어 없음) |  | 일치 |  |
| 75 | `os-ch08-thrashing-008` | ox | Ch08 p.61 | ⭐ | 인쇄 |  | 일치 |  |
| 76 | `os-ch08-thrashing-009` | classify | Ch08 p.61 | ⭐ | 인쇄 |  | 일치 |  |
| 77 | `os-ch08-thrashing-010` | multi | Ch08 p.60-62 | ⭐ | 인쇄 |  | 일치 |  |
| 78 | `os-ch08-segmentation-001` | multi | Ch08 p.31 |  | 인쇄 |  | 일치 |  |
| 79 | `os-ch08-segmentation-002` | blank | Ch08 p.35 |  | 인쇄 |  | 일치 |  |
| 80 | `os-ch08-segmentation-003` | classify | Ch08 p.31, p.35 |  | 인쇄 |  | 일치 |  |
| 81 | `os-ch08-segmentation-004` | mcq | Ch08 p.32 |  | 인쇄 |  | 일치 |  |
| 82 | `os-ch08-segmentation-005` | order | Ch08 p.37 |  | 인쇄 |  | 수정 | ox → order(유형 비율), Figure 8.13 변환 단계 |
| 83 | `os-ch08-policy-001` | match | Ch08 p.39-41, p.55, p.61 |  | 인쇄 |  | 일치 |  |
| 84 | `os-ch08-fetch-001` | blank | Ch08 p.39 | ⭐ | 인쇄 |  | 일치 |  |
| 85 | `os-ch08-fetch-002` | blank | Ch08 p.39 | ⭐ | 인쇄 |  | 일치 |  |
| 86 | `os-ch08-fetch-003` | match | Ch08 p.39 | ⭐ | p.39 필기(Fetch 정의) |  | 수정 | 해설의 필기 인용에 '교수님 필기 기준' 표시 |
| 87 | `os-ch08-fetch-004` | mcq | Ch08 p.39 | ⭐ | 인쇄 |  | 일치 |  |
| 88 | `os-ch08-fetch-005` | mcq | Ch08 p.39 | ⭐ | p.39 필기(선반입 구현 거의 불가능) |  | 일치 |  |
| 89 | `os-ch08-fetch-006` | ox | Ch08 p.39 | ⭐ | 인쇄 |  | 일치 |  |
| 90 | `os-ch08-fetch-007` | ox | Ch08 p.39 | ⭐ | 인쇄 |  | 일치 |  |
| 91 | `os-ch08-fetch-008` | classify | Ch08 p.39 | ⭐ | p.39 필기(주로 요구 페이징) |  | 수정 | 해설의 필기 인용에 '교수님 필기 기준' 표시 |
| 92 | `os-ch08-fetch-009` | multi | Ch08 p.39 | ⭐ | p.39 필기(선반입 구현 거의 불가능) |  | 일치 |  |
| 93 | `os-ch08-placement-policy-001` | mcq | Ch08 p.40 |  | 인쇄 |  | 일치 |  |
| 94 | `os-ch08-placement-policy-002` | ox | Ch08 p.40 |  | 인쇄 |  | 일치 |  |
| 95 | `os-ch08-placement-policy-003` | blank | Ch08 p.40 |  | p.40 필기(그래서 페이징을 많이 씀) |  | 일치 |  |
| 96 | `os-ch08-replacement-policy-001` | mcq | Ch08 p.41 |  | 인쇄 |  | 일치 |  |
| 97 | `os-ch08-replacement-policy-002` | blank | Ch08 p.41 |  | 인쇄 |  | 일치 |  |
| 98 | `os-ch08-replacement-policy-003` | ox | Ch08 p.41 |  | p.41 필기(성능을 좌지우지) |  | 일치 |  |
| 99 | `os-ch08-lock-001` | multi | Ch08 p.42 |  | 인쇄 |  | 일치 |  |
| 100 | `os-ch08-lock-002` | blank | Ch08 p.42 |  | 인쇄 |  | 일치 |  |
| 101 | `os-ch08-lock-003` | ox | Ch08 p.42 |  | 인쇄 |  | 일치 |  |
| 102 | `os-ch08-lock-004` | mcq | Ch08 p.42 |  | p.42 필기(락 정보 = 엔트리 비트) |  | 일치 |  |
| 103 | `os-ch08-replacement-001` | trace | Ch08 p.48 | ⭐ | p.48 필기(OPT 동점이면 맨 앞) | simulateReplacement(OPT, Figure 8.15) | 일치 |  |
| 104 | `os-ch08-replacement-002` | trace | Ch08 p.48 | ⭐ | 인쇄 | simulateReplacement(LRU, Figure 8.15) | 일치 |  |
| 105 | `os-ch08-replacement-003` | trace | Ch08 p.45, p.48 | ⭐ | 인쇄 | simulateReplacement(FIFO, Figure 8.15) | 일치 |  |
| 106 | `os-ch08-replacement-004` | trace | Ch08 p.47-48 | ⭐ | 인쇄 | simulateReplacement(CLOCK, Figure 8.15) | 일치 |  |
| 107 | `os-ch08-replacement-005` | calc | Ch08 p.48 | ⭐ | 인쇄 | simulateReplacement(FIFO) faults/misses | 일치 |  |
| 108 | `os-ch08-replacement-006` | ox | Ch08 p.48 | ⭐ | p.48 필기(히트 시 pointer 고정) |  | 일치 |  |
| 109 | `os-ch08-replacement-007` | match | Ch08 p.43-47 | ⭐ | 인쇄 |  | 일치 |  |
| 110 | `os-ch08-replacement-008` | mcq | Ch08 p.43 | ⭐ | 인쇄 |  | 일치 |  |
| 111 | `os-ch08-gen-replacement-3` | calc | Ch08 p.43-50 | ⭐ | 인쇄 | 생성기 replacement(seed 3, {"variant":"count","algo":"lru"}) | 수정 | 생성기 slideRef p.42-49 → p.43-50 |
| 112 | `os-ch08-gen-replacement-2` | trace | Ch08 p.43-50 | ⭐ | 인쇄 | 생성기 replacement(seed 2, {"variant":"trace","algo":"opt"}) | 수정 | 생성기 slideRef p.42-49 → p.43-50 |
| 113 | `os-ch08-clock-001` | trace | Ch08 p.49-50 | ⭐ | 인쇄 | clockReplace(Figure 8.16) | 수정 | [2차] ⭐로 전환(exam: true, examBasis: handwritten) — 근거: p.48 "시험"(Figure 8.15 CLOCK 행), p.50 필기 |
| 114 | `os-ch08-clock-002` | mcq | Ch08 p.50 | ⭐ | p.50 필기(또 폴트 → 5번 프레임) | clockReplace(Figure 8.16 다음 폴트) | 수정 | [2차] ⭐로 전환(exam: true, examBasis: handwritten) — 근거: p.48 "시험"(Figure 8.15 CLOCK 행), p.50 필기 |
| 115 | `os-ch08-clock-003` | ox | Ch08 p.47 | ⭐ | 인쇄 |  | 수정 | [2차] ⭐로 전환(exam: true, examBasis: handwritten) — 근거: p.48 "시험"(Figure 8.15 CLOCK 행), p.50 필기 |
| 116 | `os-ch08-clock-004` | blank | Ch08 p.47 | ⭐ | 인쇄 |  | 수정 | [2차] ⭐로 전환(exam: true, examBasis: handwritten) — 근거: p.48 "시험"(Figure 8.15 CLOCK 행), p.50 필기 |
| 117 | `os-ch08-clock-005` | calc | Ch08 p.47 | ⭐ | 인쇄 | clockReplace(모든 use=1) | 수정 | [2차] ⭐로 전환(exam: true, examBasis: handwritten) — 근거: p.48 "시험"(Figure 8.15 CLOCK 행), p.50 필기 |
| 118 | `os-ch08-clock-006` | classify | Ch08 p.47-48 | ⭐ | p.48 필기(히트 시 pointer 고정) |  | 추가 | [2차] Clock ⭐ 최소 6문항을 맞추려고 추가(히트 vs 교체 때 동작 분류) |
| 119 | `os-ch08-lfu-001` | mcq | Ch08 p.46 |  | 인쇄 |  | 일치 |  |
| 120 | `os-ch08-lfu-002` | ox | Ch08 p.46 |  | 인쇄 |  | 일치 |  |
| 121 | `os-ch08-lfu-003` | graph | Ch08 p.51 |  | 인쇄 |  | 일치 |  |
| 122 | `os-ch08-lfu-004` | blank | Ch08 p.51 |  | 인쇄 |  | 일치 |  |
| 123 | `os-ch08-enhanced-clock-001` | order | Ch08 p.52 |  | 인쇄 |  | 일치 |  |
| 124 | `os-ch08-enhanced-clock-002` | trace | Ch08 p.52-53 |  | 인쇄 | simulateEnhancedClock | 일치 |  |
| 125 | `os-ch08-enhanced-clock-003` | mcq | Ch08 p.53 |  | 인쇄 | enhancedClockVictim | 일치 |  |
| 126 | `os-ch08-enhanced-clock-004` | blank | Ch08 p.52 |  | 인쇄 |  | 일치 |  |
| 127 | `os-ch08-enhanced-clock-005` | ox | Ch08 p.53 |  | p.53 필기(read만 하는 페이지 먼저 교체) |  | 일치 |  |
| 128 | `os-ch08-cleaning-001` | match | Ch08 p.55 |  | 인쇄 |  | 일치 |  |
| 129 | `os-ch08-cleaning-002` | mcq | Ch08 p.55 |  | 인쇄 |  | 일치 |  |
| 130 | `os-ch08-cleaning-003` | ox | Ch08 p.55 |  | 인쇄 |  | 일치 |  |
| 131 | `os-ch08-cleaning-004` | blank | Ch08 p.55 |  | 인쇄 |  | 일치 |  |
| 132 | `os-ch08-page-buffering-001` | mcq | Ch08 p.57 |  | 인쇄 |  | 일치 |  |
| 133 | `os-ch08-page-buffering-002` | blank | Ch08 p.57 |  | 인쇄 |  | 일치 |  |
| 134 | `os-ch08-resident-set-001` | classify | Ch08 p.59 |  | 인쇄 + (보충) 고정+전역이 불가능한 이유 |  | 일치 |  |
| 135 | `os-ch08-resident-set-002` | match | Ch08 p.58-59 |  | 인쇄 |  | 일치 |  |
| 136 | `os-ch08-resident-set-003` | mcq | Ch08 p.59 |  | 인쇄 |  | 일치 |  |
| 137 | `os-ch08-resident-set-004` | blank | Ch08 p.59 |  | 인쇄 |  | 일치 |  |
| 138 | `os-ch08-resident-set-005` | ox | Ch08 p.58 |  | 인쇄 |  | 일치 |  |

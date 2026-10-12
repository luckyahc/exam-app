# 운영체제 족보 — 자료 목록 · 문항 목록 · 중복 판정 (Sprint 18)

작성: 2026-10-12. 규칙: [`docs/jokbo-plan.md`](../../jokbo-plan.md). 이후 스프린트는 이 문서와 `extracted/`만 쓴다(원본 재열람 금지).
시험 범위: Ch02 · Ch03 · Ch07 · Ch08 · Ch09.

## 1. 자료 목록

| 파일 | 형식 | 쪽 | 문항 수 | 해설 | 연도/학기 | 텍스트 저장 |
|---|---|---|---|---|---|---|
| `source/os/jokbo/23운영체제 중간(심재홍).pdf` | pdf(스캔, LMS 화면) | 50 | 50 | 없음(정답 표시도 없음) | 2023 중간 | `extracted/23운영체제 중간(심재홍).md` (이미지 판독) |
| `source/os/jokbo/운영체제 - 심재홍 - 2022 중간 시험지.pdf` | pdf(스캔, LMS 채점 화면) | 50 | 50 | 정답만 있음(해설 칸 비어 있음) | 2022 중간(1학기) | `extracted/운영체제 - 심재홍 - 2022 중간 시험지.md` (이미지 판독) |
| `source/os/Ch09 Uniprocessor Scheduling.pdf` | 강의 PDF(텍스트 층 있음) | 28 | — | — | 2026 | Sprint 19에서 분석 |

- 읽지 못한 파일: 없음. 두 족보 모두 텍스트 층이 없어 전 쪽을 90dpi 이미지로 판독했다.
- 캡처 잘림: 2023-5·2023-47(보기 일부)·2023-17(보기 전체) — 같은 문제인 2022-32·2022-33·2022-39로 보완. 2022-31은 정답 칸이 가려져 학생 선택·점수(2/2)로 판독.
- 2022 정답은 LMS의 채점 정답이다(해설 아님) → 족보 해설 없음, 전 문항 `explanationSource: "generated"`(슬라이드 근거)로 쓴다. 정답 대조용으로만 쓴다.

## 2. 집계

| 항목 | 수 |
|---|---|
| 원문 문항 | 100 (2023 50 + 2022 50) |
| 범위 밖(Ch04 스레드) | 9 (2022-42~50) |
| 범위 안 원문 | 91 |
| 대표 문항 | 56 (Ch02 10 · Ch03 13 · Ch07 14 · Ch08 13 · Ch09 6) |
| 같은 문제로 합친 원문 | 35 (2022 ↔ 2023, 보기 순서만 다름) |
| variantGroup | 8 |
| 애매 | 0 |
| 해설 있는 원문 | 0 (2022는 정답만 50) |

## 3. 문항 목록과 판정

원문: `23-N` = 2023 N번, `22-N` = 2022 N번. 판정: **대표 → id**, **같은 문제 → 대표 id**, vg = variantGroup(`os-vg-…`). 해설: 정답 = 2022 LMS 정답 있음.

| # | 원문 | 요약 | 판정 | 해설 | 유형 | 챕터 · 토픽 |
|---|---|---|---|---|---|---|
| 1 | 23-1 | 가상기억장치 정책(demand·prepaging·locking·optimal·placement) 잘못 2 | 대표 `os-ch08-jokbo-001` | 없음 | multi | ch08 · 가상 메모리 정책 분류 |
| 2 | 23-2 | SRT 0~4 스케줄 잘못 2 (A0/5 B1/3 C2/1) | 대표 `os-ch09-jokbo-001`, vg `sched-trace` | 없음 | multi | ch09 · SRT |
| 3 | 23-3 | Enhanced Clock 교체 프레임 | 대표 `os-ch08-jokbo-002`, vg `replace-frame` | 없음 | mcq | ch08 · 개선된 클럭(Enhanced Clock) |
| 4 | 23-4 | OS 구성요소 틀린 3 | 대표 `os-ch02-jokbo-001` | 없음 | multi | ch02 · 커널 / 시스템 프로그램 |
| 5 | 23-5 | Buddy 두 블록 반납 후 상태 | 대표 `os-ch07-jokbo-001`, vg `buddy` | 없음 | mcq | ch07 · 버디 시스템 |
| 6 | 23-6 | Clock 교체 프레임·포인터·[3] 상태 | 대표 `os-ch08-jokbo-003`, vg `replace-frame` | 없음 | mcq | ch08 · Clock 정책 동작 |
| 7 | 23-7 | Time Sharing에서 B의 response time | 대표 `os-ch02-jokbo-006`, vg `response-time` | 없음 | mcq | ch02 · 시간 계산(응답시간/유효 CPU 이용률) |
| 8 | 23-8 | Thrashing 잘못 3 | 대표 `os-ch08-jokbo-006` | 없음 | multi | ch08 · 스래싱과 부하 제어 |
| 9 | 23-9 | frame locking 영역이 아닌 것 | 대표 `os-ch08-jokbo-007` | 없음 | mcq | ch08 · 프레임 잠금 |
| 10 | 23-10 | Dynamic partitioning 틀린 2 | 대표 `os-ch07-jokbo-003`, vg `partitioning` | 없음 | multi | ch07 · 고정 분할 / 동적 분할 |
| 11 | 23-11 | Process image 구성요소 아닌 것 | 대표 `os-ch03-jokbo-001` | 없음 | mcq | ch03 · 프로세스 이미지 |
| 12 | 23-12 | HRRN 0~4 스케줄 잘못 2 (A0/2 B1/2 C2/1) | 대표 `os-ch09-jokbo-002`, vg `sched-trace` | 없음 | multi | ch09 · HRRN |
| 13 | 23-13 | page fault 시 상태 변화 | 대표 `os-ch03-jokbo-002` | 없음 | mcq | ch03 · 5-상태 모델 / 상태 전이 |
| 14 | 23-14 | 메모리 공유 예가 아닌 것 | 대표 `os-ch07-jokbo-008` | 없음 | mcq | ch07 · 공유 |
| 15 | 23-15 | running→blocked가 아닌 함수 | 대표 `os-ch03-jokbo-003` | 없음 | mcq | ch03 · 5-상태 모델 / 상태 전이 |
| 16 | 23-16 | 15KB 할당 결과로 알고리즘(next-fit) | 대표 `os-ch07-jokbo-005`, vg `fit` | 없음 | mcq | ch07 · 배치 알고리즘 |
| 17 | 23-17 | 가상기억장치 실행 과정 순서(보기 잘림) | 대표 `os-ch08-jokbo-008` | 없음 | order | ch08 · 페이지 폴트 처리 과정 |
| 18 | 23-18 | Process switch가 아닌 경우 | 대표 `os-ch03-jokbo-004` | 없음 | mcq | ch03 · Process switch 5가지 경우 |
| 19 | 23-19 | basic paging 옳은 것 | 대표 `os-ch07-jokbo-009` | 없음 | mcq | ch07 · 기본 페이징 |
| 20 | 23-20 | 지역성 잘못 2 | 대표 `os-ch08-jokbo-009` | 없음 | multi | ch08 · 지역성의 원리 |
| 21 | 23-21 | Trap interrupt 틀린 것 | 대표 `os-ch03-jokbo-005` | 없음 | mcq | ch03 · Process switch 5가지 경우 |
| 22 | 23-22 | Multiprogramming에서 B의 response time | 대표 `os-ch02-jokbo-007`, vg `response-time` | 없음 | mcq | ch02 · 시간 계산(응답시간/유효 CPU 이용률) |
| 23 | 23-23 | Feedback·SPN/SRT/HRRN 올바른 2 | 대표 `os-ch09-jokbo-003` | 없음 | multi | ch09 · Feedback |
| 24 | 23-24 | OS 목적 잘못 2 | 대표 `os-ch02-jokbo-002` | 없음 | multi | ch02 · OS 정의 / 3대 목표 |
| 25 | 23-25 | Multiprogramming 틀린 것 | 대표 `os-ch02-jokbo-004`, vg `mp-ts` | 없음 | mcq | ch02 · 단일 vs 다중프로그래밍 |
| 26 | 23-26 | Optimal 교체 프레임 | 대표 `os-ch08-jokbo-004`, vg `replace-frame` | 없음 | mcq | ch08 · 교체 알고리즘 |
| 27 | 23-27 | virtual memory 특성 3 | 대표 `os-ch08-jokbo-010` | 없음 | multi | ch08 · 실제 메모리 vs 가상 메모리 |
| 28 | 23-28 | 페이지 크기 작아질수록 틀린 2 | 대표 `os-ch08-jokbo-011` | 없음 | multi | ch08 · 페이지 크기 그래프 |
| 29 | 23-29 | Time sharing 틀린 2 | 대표 `os-ch02-jokbo-005`, vg `mp-ts` | 없음 | multi | ch02 · 단일 vs 다중프로그래밍 |
| 30 | 23-30 | registers 백업 데이터 이름 | 대표 `os-ch03-jokbo-006` | 없음 | mcq | ch03 · 문맥 데이터 / dispatcher |
| 31 | 23-31 | Interrupt handler가 하지 않는 일 | 대표 `os-ch03-jokbo-007` | 없음 | mcq | ch03 · 인터럽트 처리 과정 |
| 32 | 23-32 | 문서 편집기 입력 상태 변화 | 대표 `os-ch03-jokbo-008` | 없음 | mcq | ch03 · 5-상태 모델 / 상태 전이 |
| 33 | 23-33 | Round-robin 올바른 2 | 대표 `os-ch09-jokbo-004` | 없음 | multi | ch09 · Round-robin / VRR |
| 34 | 23-34 | load control 잘못 2 | 대표 `os-ch08-jokbo-012` | 없음 | multi | ch08 · 스래싱과 부하 제어 |
| 35 | 23-35 | 메모리 보호 맞는 것 | 대표 `os-ch07-jokbo-010` | 없음 | mcq | ch07 · 보호 / Base·Bounds 레지스터 |
| 36 | 23-36 | PCB에 없는 항목 | 대표 `os-ch03-jokbo-009` | 없음 | mcq | ch03 · PCB 3대 구성 |
| 37 | 23-37 | selection function 올바른 2 | 대표 `os-ch09-jokbo-005` | 없음 | multi | ch09 · selection function |
| 38 | 23-38 | 논리주소 2049 → 실주소 | 대표 `os-ch07-jokbo-011`, vg `addr-translate` | 없음 | mcq | ch07 · 주소 변환 |
| 39 | 23-39 | swap out/in 근본 이유 | 대표 `os-ch03-jokbo-010` | 없음 | mcq | ch03 · Suspend(swap out/in) |
| 40 | 23-40 | 실주소 2 → 논리주소 | 대표 `os-ch07-jokbo-012`, vg `addr-translate` | 없음 | mcq | ch07 · 주소 변환 |
| 41 | 23-41 | Stack에 없는 것 2 | 대표 `os-ch03-jokbo-011` | 없음 | multi | ch03 · 스택에 저장되는 것 |
| 42 | 23-42 | 프로세스 틀린 2 | 대표 `os-ch03-jokbo-012` | 없음 | multi | ch03 · 프로세스 정의 |
| 43 | 23-43 | I/O 인터럽트 처리 순서 | 대표 `os-ch03-jokbo-013` | 없음 | order | ch03 · 인터럽트 처리 과정 |
| 44 | 23-44 | OS 서비스 아닌 2 | 대표 `os-ch02-jokbo-003` | 없음 | multi | ch02 · OS 서비스(편리성) |
| 45 | 23-45 | 재배치 틀린 것 | 대표 `os-ch07-jokbo-014` | 없음 | mcq | ch07 · 재배치 |
| 46 | 23-46 | Dynamic partitioning 알고리즘 틀린 것 | 대표 `os-ch07-jokbo-004`, vg `partitioning` | 없음 | mcq | ch07 · 배치 알고리즘 |
| 47 | 23-47 | Buddy 129K 할당 후 상태(보기 잘림) | 대표 `os-ch07-jokbo-002`, vg `buddy` | 없음 | mcq | ch07 · 버디 시스템 |
| 48 | 23-48 | LRU 교체 프레임 | 대표 `os-ch08-jokbo-005`, vg `replace-frame` | 없음 | mcq | ch08 · 교체 알고리즘 |
| 49 | 23-49 | 용어(throughput·response·deadline·turnaround) 올바른 2 | 대표 `os-ch09-jokbo-006` | 없음 | multi | ch09 · 스케줄링 기준(Sprint 19에서 확인, 슬라이드에 없으면 ch02) |
| 50 | 23-50 | TLB 주소 변환 순서 | 대표 `os-ch08-jokbo-013` | 없음 | order | ch08 · TLB 주소 변환 |
| 51 | 22-1 | 운영체제 설명 잘못된 것 | 대표 `os-ch02-jokbo-008` | 정답 | mcq | ch02 · OS 정의 / 3대 목표 |
| 52 | 22-2 | OS 목적 잘못 2 | 같은 문제 → `os-ch02-jokbo-002` | 정답 | — | — |
| 53 | 22-3 | OS 서비스 아닌 2 | 같은 문제 → `os-ch02-jokbo-003` | 정답 | — | — |
| 54 | 22-4 | OS 구성요소 틀린 3 | 같은 문제 → `os-ch02-jokbo-001` | 정답 | — | — |
| 55 | 22-5 | time slice로 번갈아 실행하는 기능 이름 | 대표 `os-ch02-jokbo-009` | 정답 | mcq | ch02 · 단일 vs 다중프로그래밍 |
| 56 | 22-6 | Multiprogramming 틀린 것 | 같은 문제 → `os-ch02-jokbo-004` | 정답 | — | — |
| 57 | 22-7 | Time sharing 틀린 2 | 같은 문제 → `os-ch02-jokbo-005` | 정답 | — | — |
| 58 | 22-8 | CPU 이용률(6/0.3/0.7/3초) | 대표 `os-ch02-jokbo-010` | 정답 | calc | ch02 · 시간 계산(응답시간/유효 CPU 이용률) |
| 59 | 22-9 | Multiprogramming B response time | 같은 문제 → `os-ch02-jokbo-007` | 정답 | — | — |
| 60 | 22-10 | Time Sharing B response time | 같은 문제 → `os-ch02-jokbo-006` | 정답 | — | — |
| 61 | 22-11 | 프로세스 틀린 2 | 같은 문제 → `os-ch03-jokbo-012` | 정답 | — | — |
| 62 | 22-12 | Process image 아닌 것 | 같은 문제 → `os-ch03-jokbo-001` | 정답 | — | — |
| 63 | 22-13 | Stack에 없는 것 2 | 같은 문제 → `os-ch03-jokbo-011` | 정답 | — | — |
| 64 | 22-14 | running→blocked 아닌 것 | 같은 문제 → `os-ch03-jokbo-003` | 정답 | — | — |
| 65 | 22-15 | page fault 상태 변화 | 같은 문제 → `os-ch03-jokbo-002` | 정답 | — | — |
| 66 | 22-16 | 문서 편집기 상태 변화 | 같은 문제 → `os-ch03-jokbo-008` | 정답 | — | — |
| 67 | 22-17 | swap out/in 이유 | 같은 문제 → `os-ch03-jokbo-010` | 정답 | — | — |
| 68 | 22-18 | PCB에 없는 항목 | 같은 문제 → `os-ch03-jokbo-009` | 정답 | — | — |
| 69 | 22-19 | I/O 인터럽트 처리 순서 | 같은 문제 → `os-ch03-jokbo-013` | 정답 | — | — |
| 70 | 22-20 | registers 백업 데이터 이름 | 같은 문제 → `os-ch03-jokbo-006` | 정답 | — | — |
| 71 | 22-21 | Process switch 아닌 경우 | 같은 문제 → `os-ch03-jokbo-004` | 정답 | — | — |
| 72 | 22-22 | Trap interrupt 틀린 것 | 같은 문제 → `os-ch03-jokbo-005` | 정답 | — | — |
| 73 | 22-23 | Interrupt handler 아닌 일 | 같은 문제 → `os-ch03-jokbo-007` | 정답 | — | — |
| 74 | 22-24 | 재배치 틀린 것 | 같은 문제 → `os-ch07-jokbo-014` | 정답 | — | — |
| 75 | 22-25 | 메모리 보호 맞는 것 | 같은 문제 → `os-ch07-jokbo-010` | 정답 | — | — |
| 76 | 22-26 | 메모리 공유 예가 아닌 것 | 같은 문제 → `os-ch07-jokbo-008` | 정답 | — | — |
| 77 | 22-27 | Fixed partitioning 틀린 2 | 대표 `os-ch07-jokbo-007`, vg `partitioning` | 정답 | multi | ch07 · 고정 분할 / 동적 분할 |
| 78 | 22-28 | Dynamic partitioning 틀린 2 | 같은 문제 → `os-ch07-jokbo-003` | 정답 | — | — |
| 79 | 22-29 | Dynamic 알고리즘 틀린 것 | 같은 문제 → `os-ch07-jokbo-004` | 정답 | — | — |
| 80 | 22-30 | 15KB 할당 결과(next-fit) | 같은 문제 → `os-ch07-jokbo-005` | 정답 | — | — |
| 81 | 22-31 | 15KB 할당 결과(D에 할당 → worst-fit) | 대표 `os-ch07-jokbo-006`, vg `fit` | 정답(가려짐, 점수로 판독) | mcq | ch07 · 배치 알고리즘 |
| 82 | 22-32 | Buddy 반납 후 상태 | 같은 문제 → `os-ch07-jokbo-001` | 정답 | — | — |
| 83 | 22-33 | Buddy 129K 할당 | 같은 문제 → `os-ch07-jokbo-002` | 정답 | — | — |
| 84 | 22-34 | 논리주소 2049 → 실주소 | 같은 문제 → `os-ch07-jokbo-011` | 정답 | — | — |
| 85 | 22-35 | 실주소 2 → 논리주소 | 같은 문제 → `os-ch07-jokbo-012` | 정답 | — | — |
| 86 | 22-36 | Segmentation 논리주소 2051 → 실주소 | 대표 `os-ch07-jokbo-013`, vg `addr-translate` | 정답 | mcq | ch07 · 기본 세그먼테이션 |
| 87 | 22-37 | basic paging 옳은 것 | 같은 문제 → `os-ch07-jokbo-009` | 정답 | — | — |
| 88 | 22-38 | virtual memory 특성 3 | 같은 문제 → `os-ch08-jokbo-010` | 정답 | — | — |
| 89 | 22-39 | 가상기억장치 실행 과정 순서 | 같은 문제 → `os-ch08-jokbo-008` | 정답 | — | — |
| 90 | 22-40 | 지역성 잘못 2 | 같은 문제 → `os-ch08-jokbo-009` | 정답 | — | — |
| 91 | 22-41 | TLB 주소 변환 순서 | 같은 문제 → `os-ch08-jokbo-013` | 정답 | — | — |
| 92 | 22-42 | 스레드·프로세스 구분 올바른 2 | 범위 밖(Ch04) | 정답 | — | — |
| 93 | 22-43 | 스레드 우수성 틀린 2 | 범위 밖(Ch04) | 정답 | — | — |
| 94 | 22-44 | 스레드 동시 접근 틀린 2 | 범위 밖(Ch04) | 정답 | — | — |
| 95 | 22-45 | 스레드 이점 틀린 2 | 범위 밖(Ch04) | 정답 | — | — |
| 96 | 22-46 | 스레드 시작 함수 틀린 2 | 범위 밖(Ch04) | 정답 | — | — |
| 97 | 22-47 | TCB에 없는 것 2 | 범위 밖(Ch04) | 정답 | — | — |
| 98 | 22-48 | 스레드와 TCB 틀린 2 | 범위 밖(Ch04) | 정답 | — | — |
| 99 | 22-49 | 지역변수 스택 저장 이유 올바른 2 | 범위 밖(Ch04) | 정답 | — | — |
| 100 | 22-50 | 스레드 생성·종료 틀린 2 | 범위 밖(Ch04) | 정답 | — | — |

variantGroup 8개(접두사 `os-vg-`): `sched-trace`(ch09 001·002), `replace-frame`(ch08 002·003·004·005), `response-time`(ch02 006·007), `mp-ts`(ch02 004·005), `buddy`(ch07 001·002), `partitioning`(ch07 003·004·007), `fit`(ch07 005·006), `addr-translate`(ch07 011·012·013).

## 4. Sprint 20에 넘기는 주의 후보

- 2022 정답과 슬라이드가 다를 수 있는 문항(정답 검증은 Sprint 20에서 슬라이드·코드로): 22-22(Trap — 정답 5만, "강제 종료" 문장은 참으로 채점), 22-29(성능 최고 best-fit을 틀린 것으로), 22-17(swap 이유 = processor 이용률), 22-27(Fixed partitioning의 external fragmentation).
- 2023에만 있는 문항 15개(23-1·2·3·6·8·9·12·23·26·28·33·34·37·48·49)는 정답 표시가 없다 → 슬라이드·시뮬레이터로 정답을 정한다(Clock·Enhanced Clock·Optimal·LRU·SRT·HRRN은 기존 `lib/sim/os` 또는 Sprint 19 스케줄링 시뮬레이터로 고정).
- 2023-40 보기 5 앞 선택 원이 캡처에 없음 — 문항 내용에는 영향 없음.

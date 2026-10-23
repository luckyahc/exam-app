# 운영체제 단답형 — 핵심 용어

2026-10-21 다시 만듦. 앱의 "단답형 모음 풀기"와 챕터·문제 목록의 분류 "단답형 모음"에 나오는 문항이다. 데이터: `data/subjects/os/shortAnswer.ts`, 검사: `shortAnswer.test.ts`·`verification.test.ts`.

## 규칙

- 시험에 나올 만한 **핵심 용어만** 단답형으로 낸다. 설명(용어 사전 `glossary.ts`의 정의 = 슬라이드 문장)을 보고 용어를 한국어 또는 영어로 쓴다.
- 계산·공식·목록 문제는 단답형에 넣지 않는다(처음 만든 71문항 중 계산 37·공식·목록 10은 지웠다).
- 지엽적인 용어(실행 전용, 프로세스 권한, 종료 사유, 레지스터 세부, 예시용 용어 등)는 고르지 않았다 — 아래 "고르지 않은 용어".
- 인정 답안: 용어 사전의 한국어·영어·약자·같은 뜻(termAccept). 공백·대소문자는 무시한다.
- 오답 처리 확인: 문항마다 헷갈리기 쉬운 용어 1개가 오답으로 채점되는지 테스트한다. 해설에 그 용어와 다른 점을 적었다.
- ⭐: 필기 출제 표시 쪽이면 `⭐ 필기`(+한 줄 요약), 그 밖에 시험 힌트가 붙은 용어면 `⭐ 힌트`, Ch09는 ⭐ 없음.
- 고른 용어는 용어 단답형(`os-chNN-term-NNN`)을 따로 만들지 않는다(중복 방지). "기존 문항" 열은 같은 용어를 다른 지문으로 묻는 기존 빈칸 문항(용어 사전 linkedQuestionIds)이다.

## 장별 문항 수

| 장 | 문항 |
|---|---|
| ch02 | 20 |
| ch03 | 27 |
| ch07 | 27 |
| ch08 | 31 |
| ch09 | 22 |
| 합계 | 127 |

## Ch02 운영체제 개요 (20)

| 장 | 쪽 | 정답(용어) | 헷갈리는 답(오답) | ⭐ | 기존 문항 | ID |
|---|---|---|---|---|---|---|
| ch02 | p.11 | 커널 · Kernel | 시스템 프로그램 | ⭐ 힌트 |  | `os-ch02-short-001` |
| ch02 | p.11 | 시스템 콜 인터페이스 · system call interface | 디바이스 드라이버 | ⭐ 힌트 |  | `os-ch02-short-002` |
| ch02 | p.7 | 디바이스 드라이버 · device driver | 시스템 콜 인터페이스 | ⭐ 힌트 |  | `os-ch02-short-003` |
| ch02 | p.11 | 프로세스 · Process | 프로세서 | ⭐ 힌트 |  | `os-ch02-short-004` |
| ch02 | p.13 | 직렬 처리 · Serial Processing | 단순 일괄처리 | ⭐ 힌트 |  | `os-ch02-short-005` |
| ch02 | p.13 | 단순 일괄처리 시스템 · Simple Batch Systems | 다중프로그램 일괄처리 | ⭐ 힌트 |  | `os-ch02-short-006` |
| ch02 | p.13 | 모니터 · Monitor | 커널 | ⭐ 힌트 | `os-ch02-history-002` | `os-ch02-short-007` |
| ch02 | p.14 | 다중프로그램 일괄처리 시스템 · Multiprogrammed Batch Systems | 시분할 시스템 | ⭐ 힌트 |  | `os-ch02-short-008` |
| ch02 | p.20 | 시분할 시스템 · Time Sharing System | 다중프로그램 일괄처리 | ⭐ 힌트 |  | `os-ch02-short-009` |
| ch02 | p.20 | 타임 슬라이스 · time slice | 응답시간 | ⭐ 힌트 | `os-ch02-batch-switch-004` | `os-ch02-short-010` |
| ch02 | p.17 | 단일프로그래밍 · Uniprogramming | 다중프로그래밍 | ⭐ 힌트 | `os-ch02-uniprog-003` | `os-ch02-short-011` |
| ch02 | p.18 | 다중프로그래밍 · Multiprogramming | 단일프로그래밍 | ⭐ 힌트 |  | `os-ch02-short-012` |
| ch02 | p.14 | 비선점 | 선점 | ⭐ 힌트 |  | `os-ch02-short-013` |
| ch02 | p.21 | CPU 이용률 · CPU utilization | 유효 CPU 이용률 | ⭐ 힌트 |  | `os-ch02-short-014` |
| ch02 | p.21 | 유효 CPU 이용률 · effective CPU utilization | CPU 이용률 | ⭐ 힌트 |  | `os-ch02-short-015` |
| ch02 | p.21 | 응답시간 · response time | 반환시간 | ⭐ 힌트 |  | `os-ch02-short-016` |
| ch02 | p.24 | CPU 오버헤드 · CPU overhead | 타임 슬라이스 | ⭐ 힌트 |  | `os-ch02-short-017` |
| ch02 | p.25 | 대칭 다중처리 · Symmetric Multiprocessing · SMP | 멀티코어 |  |  | `os-ch02-short-018` |
| ch02 | p.25 | 동시성 · Concurrency | 병렬성 |  |  | `os-ch02-short-019` |
| ch02 | p.25 | 병렬성 · Parallelism | 동시성 |  |  | `os-ch02-short-020` |

## Ch03 프로세스 (27)

| 장 | 쪽 | 정답(용어) | 헷갈리는 답(오답) | ⭐ | 기존 문항 | ID |
|---|---|---|---|---|---|---|
| ch03 | p.5 | 프로세스 제어 블록 · process control block · PCB | 프로세스 이미지 | ⭐ 힌트 | `os-ch03-hint-pcb-002` | `os-ch03-short-001` |
| ch03 | p.23 | 프로세스 이미지 · Process Image | 프로세스 제어 블록 | ⭐ 힌트 |  | `os-ch03-short-002` |
| ch03 | p.7 | 프로세스 추적 · Trace | 프로그램 카운터 | ⭐ 힌트 | `os-ch03-scheduler-005` | `os-ch03-short-003` |
| ch03 | p.7 | 디스패처 · Dispatcher | 스케줄러 | ⭐ 힌트 | `os-ch03-context-003` | `os-ch03-short-004` |
| ch03 | p.7 | 스케줄러 · Scheduler | 디스패처 | ⭐ 힌트 |  | `os-ch03-short-005` |
| ch03 | p.12 | 실행 상태 · Running | 준비 상태 | ⭐ 힌트 |  | `os-ch03-short-006` |
| ch03 | p.12 | 준비 상태 · Ready | 대기 상태 | ⭐ 힌트 |  | `os-ch03-short-007` |
| ch03 | p.12 | 대기 상태 · Blocked | 준비 상태 | ⭐ 힌트 |  | `os-ch03-short-008` |
| ch03 | p.20 | 보류 상태 · Suspend | 대기 상태 | ⭐ 힌트 | `os-ch03-suspend-005` | `os-ch03-short-009` |
| ch03 | p.20 | 스왑 아웃 · swap out | 스왑 인 | ⭐ 힌트 |  | `os-ch03-short-010` |
| ch03 | p.19 | 준비 큐 · Ready Queue | 대기 큐 | ⭐ 힌트 |  | `os-ch03-short-011` |
| ch03 | p.24 | 텍스트 영역 · Text segment | 초기화된 데이터 영역 | ⭐ 힌트 |  | `os-ch03-short-012` |
| ch03 | p.25 | 스택 · Stack | 힙 | ⭐ 필기 |  | `os-ch03-short-013` |
| ch03 | p.25 | 힙 · Heap | 스택 | ⭐ 필기 |  | `os-ch03-short-014` |
| ch03 | p.26 | 프로세스 식별 정보 · Process Identification | 프로세스 제어 정보 | ⭐ 힌트 |  | `os-ch03-short-015` |
| ch03 | p.26 | 프로세서 상태 정보 · Processor State Information | 프로세스 제어 정보 | ⭐ 힌트 |  | `os-ch03-short-016` |
| ch03 | p.26 | 프로세스 제어 정보 · Process Control Information | 프로세서 상태 정보 | ⭐ 힌트 |  | `os-ch03-short-017` |
| ch03 | p.29 | 프로그램 카운터 · program counter · PC | 프로그램 상태 워드 | ⭐ 힌트 |  | `os-ch03-short-018` |
| ch03 | p.29 | 프로그램 상태 워드 · PSW | 프로그램 카운터 | ⭐ 힌트 | `os-ch03-hint-pcb-003` | `os-ch03-short-019` |
| ch03 | p.36 | 사용자 모드 · user mode | 커널 모드 | ⭐ 힌트 | `os-ch03-mode-003` | `os-ch03-short-020` |
| ch03 | p.36 | 커널 모드 · kernel mode | 사용자 모드 | ⭐ 힌트 | `os-ch03-mode-003` | `os-ch03-short-021` |
| ch03 | p.38 | 모드 전환 · Mode switch | 프로세스 전환 | ⭐ 힌트 |  | `os-ch03-short-022` |
| ch03 | p.40 | 프로세스 전환 · Process Switch | 모드 전환 | ⭐ 힌트 |  | `os-ch03-short-023` |
| ch03 | p.38 | 인터럽트 · Interrupt | 트랩 | ⭐ 힌트 |  | `os-ch03-short-024` |
| ch03 | p.38 | 인터럽트 처리 함수 · interrupt service routine · ISR | 디스패처 | ⭐ 힌트 | `os-ch03-hint-interrupt-003` | `os-ch03-short-025` |
| ch03 | p.41 | 클럭 인터럽트 · Clock interrupt | 입출력 인터럽트 | ⭐ 필기 |  | `os-ch03-short-026` |
| ch03 | p.42 | 트랩 · Trap interrupt | 클럭 인터럽트 | ⭐ 힌트 |  | `os-ch03-short-027` |

## Ch07 메모리 관리 (27)

| 장 | 쪽 | 정답(용어) | 헷갈리는 답(오답) | ⭐ | 기존 문항 | ID |
|---|---|---|---|---|---|---|
| ch07 | p.4 | 재배치 · Relocation | 보호 | ⭐ 힌트 |  | `os-ch07-short-001` |
| ch07 | p.6 | 보호 · Protection | 공유 | ⭐ 힌트 |  | `os-ch07-short-002` |
| ch07 | p.8 | 공유 · Sharing | 보호 | ⭐ 힌트 |  | `os-ch07-short-003` |
| ch07 | p.6 | 메모리 관리 하드웨어 · memory management unit · MMU | 베이스 레지스터 | ⭐ 힌트 | `os-ch07-protection-002` | `os-ch07-short-004` |
| ch07 | p.7 | 베이스 레지스터 · base register | 바운드 레지스터 | ⭐ 힌트 |  | `os-ch07-short-005` |
| ch07 | p.7 | 바운드 레지스터 · bounds register | 베이스 레지스터 | ⭐ 힌트 |  | `os-ch07-short-006` |
| ch07 | p.8 | DLL 라이브러리 · DLL | 정적 라이브러리 | ⭐ 힌트 |  | `os-ch07-short-007` |
| ch07 | p.8 | 정적 라이브러리 · static library | DLL | ⭐ 힌트 |  | `os-ch07-short-008` |
| ch07 | p.4 | 메모리 압축 · Memory compaction | 외부 단편화 | ⭐ 힌트 | `os-ch07-relocation-003` | `os-ch07-short-009` |
| ch07 | p.11 | 고정 분할 · Fixed Partitioning | 동적 분할 | ⭐ 힌트 |  | `os-ch07-short-010` |
| ch07 | p.14 | 동적 분할 · Dynamic Partitioning | 고정 분할 | ⭐ 힌트 |  | `os-ch07-short-011` |
| ch07 | p.13 | 내부 단편화 · Internal Fragmentation | 외부 단편화 | ⭐ 힌트 | `os-ch07-hint-partition-002` | `os-ch07-short-012` |
| ch07 | p.14 | 외부 단편화 · External Fragmentation | 내부 단편화 | ⭐ 힌트 | `os-ch07-partition-004` | `os-ch07-short-013` |
| ch07 | p.16 | 배치 알고리즘 · placement algorithm | 최초 적합 | ⭐ 필기 |  | `os-ch07-short-014` |
| ch07 | p.16 | 최적 적합 · Best-fit | 최초 적합 | ⭐ 필기 |  | `os-ch07-short-015` |
| ch07 | p.17 | 최초 적합 · First-fit | 다음 적합 | ⭐ 힌트 |  | `os-ch07-short-016` |
| ch07 | p.18 | 다음 적합 · Next-fit | 최초 적합 | ⭐ 힌트 |  | `os-ch07-short-017` |
| ch07 | p.19 | 최악 적합 · Worst-fit | 최적 적합 | ⭐ 힌트 |  | `os-ch07-short-018` |
| ch07 | p.11 | 버디 시스템 · Buddy system | 동적 분할 | ⭐ 힌트 |  | `os-ch07-short-019` |
| ch07 | p.26 | 논리 주소 · logical address | 물리 주소 | ⭐ 힌트 |  | `os-ch07-short-020` |
| ch07 | p.26 | 상대 주소 · relative address | 물리 주소 | ⭐ 힌트 |  | `os-ch07-short-021` |
| ch07 | p.26 | 물리 주소 · physical address | 논리 주소 | ⭐ 힌트 |  | `os-ch07-short-022` |
| ch07 | p.27 | 페이지 · page | 프레임 | ⭐ 힌트 | `os-ch07-paging-basic-001` | `os-ch07-short-023` |
| ch07 | p.27 | 프레임 · frame | 페이지 | ⭐ 힌트 | `os-ch07-paging-basic-001` | `os-ch07-short-024` |
| ch07 | p.27 | 페이지 테이블 · page table | 세그먼트 테이블 | ⭐ 힌트 |  | `os-ch07-short-025` |
| ch07 | p.38 | 세그먼트 · Segment | 페이지 | ⭐ 힌트 |  | `os-ch07-short-026` |
| ch07 | p.41 | 세그먼트 테이블 · Segmentation table | 페이지 테이블 | ⭐ 힌트 |  | `os-ch07-short-027` |

## Ch08 가상 메모리 (31)

| 장 | 쪽 | 정답(용어) | 헷갈리는 답(오답) | ⭐ | 기존 문항 | ID |
|---|---|---|---|---|---|---|
| ch08 | p.2 | 가상 메모리 · virtual memory | 실제 메모리 | ⭐ 힌트 |  | `os-ch08-short-001` |
| ch08 | p.5 | 상주 집합 · Resident set | 워킹 셋 | ⭐ 필기 | `os-ch08-page-fault-003` | `os-ch08-short-002` |
| ch08 | p.8 | 지역성의 원리 · Principle of Locality | 워킹 셋 | ⭐ 필기 | `os-ch08-locality-001` | `os-ch08-short-003` |
| ch08 | p.10 | P 비트 · P | 수정 비트 |  |  | `os-ch08-short-004` |
| ch08 | p.12 | 수정 비트 · Modify Bit · M | 사용 비트 | ⭐ 힌트 | `os-ch08-pte-003` | `os-ch08-short-005` |
| ch08 | p.14 | 2단계 페이지 테이블 · Two-Level Scheme | 역 페이지 테이블 |  |  | `os-ch08-short-006` |
| ch08 | p.16 | 역 페이지 테이블 · Inverted Page Table | 2단계 페이지 테이블 |  |  | `os-ch08-short-007` |
| ch08 | p.19 | 변환 색인 버퍼 · Translation Lookaside Buffer · TLB | 페이지 테이블 | ⭐ 힌트 | `os-ch08-tlb-005` | `os-ch08-short-008` |
| ch08 | p.60 | 워킹 셋 · Working Set | 상주 집합 |  | `os-ch08-working-set-003` | `os-ch08-short-009` |
| ch08 | p.29 | 스래싱 · Thrashing | 페이지 폴트 | ⭐ 필기 | `os-ch08-thrashing-002` | `os-ch08-short-010` |
| ch08 | p.61 | 부하 제어 · Load Control | 가변 할당 | ⭐ 필기 |  | `os-ch08-short-011` |
| ch08 | p.39 | 반입 정책 · Fetch Policy | 배치 정책 | ⭐ 필기 |  | `os-ch08-short-012` |
| ch08 | p.39 | 요구 페이징 · Demand Paging | 선반입 | ⭐ 필기 | `os-ch08-fetch-001` | `os-ch08-short-013` |
| ch08 | p.39 | 선반입 · Prepaging | 요구 페이징 | ⭐ 필기 | `os-ch08-fetch-002` | `os-ch08-short-014` |
| ch08 | p.40 | 배치 정책 · Placement Policy | 반입 정책 | ⭐ 힌트 |  | `os-ch08-short-015` |
| ch08 | p.41 | 교체 정책 · Replacement Policy | 청소 정책 | ⭐ 힌트 |  | `os-ch08-short-016` |
| ch08 | p.42 | 프레임 잠금 · Frame Locking | 페이지 버퍼링 | ⭐ 힌트 |  | `os-ch08-short-017` |
| ch08 | p.43 | 최적 정책 · Optimal · OPT | LRU | ⭐ 힌트 |  | `os-ch08-short-018` |
| ch08 | p.44 | LRU · Least Recently Used | 최적 정책 | ⭐ 힌트 |  | `os-ch08-short-019` |
| ch08 | p.45 | FIFO · First-in, First-out | LRU | ⭐ 힌트 |  | `os-ch08-short-020` |
| ch08 | p.47 | 클럭 정책 · Clock Policy | FIFO | ⭐ 필기 |  | `os-ch08-short-021` |
| ch08 | p.47 | 사용 비트 · use bit | 수정 비트 | ⭐ 필기 | `os-ch08-clock-004` | `os-ch08-short-022` |
| ch08 | p.52 | 개선된 클럭 정책 · Enhanced Clock Policy | 클럭 정책 | ⭐ 힌트 |  | `os-ch08-short-023` |
| ch08 | p.55 | 청소 정책 · Cleaning Policy | 교체 정책 | ⭐ 힌트 |  | `os-ch08-short-024` |
| ch08 | p.55 | 요구 청소 · Demand Cleaning | 선청소 | ⭐ 힌트 |  | `os-ch08-short-025` |
| ch08 | p.55 | 선청소 · Precleaning | 요구 청소 | ⭐ 힌트 |  | `os-ch08-short-026` |
| ch08 | p.57 | 페이지 버퍼링 · Page Buffering | 선청소 | ⭐ 힌트 |  | `os-ch08-short-027` |
| ch08 | p.58 | 고정 할당 · fixed allocation | 가변 할당 | ⭐ 힌트 |  | `os-ch08-short-028` |
| ch08 | p.58 | 가변 할당 · variable allocation | 고정 할당 | ⭐ 힌트 |  | `os-ch08-short-029` |
| ch08 | p.59 | 지역 교체 · local | 전역 교체 | ⭐ 힌트 |  | `os-ch08-short-030` |
| ch08 | p.59 | 전역 교체 · global | 지역 교체 | ⭐ 힌트 |  | `os-ch08-short-031` |

## Ch09 단일처리기 스케줄링 (22)

| 장 | 쪽 | 정답(용어) | 헷갈리는 답(오답) | ⭐ | 기존 문항 | ID |
|---|---|---|---|---|---|---|
| ch09 | p.3 | 장기 스케줄링 · Long-term scheduling | 중기 스케줄링 |  |  | `os-ch09-short-001` |
| ch09 | p.3 | 중기 스케줄링 · Medium-term scheduling | 장기 스케줄링 |  |  | `os-ch09-short-002` |
| ch09 | p.3 | 단기 스케줄링 · Short-term scheduling | 장기 스케줄링 |  |  | `os-ch09-short-003` |
| ch09 | p.5 | 반환시간 · Turnaround time | 응답시간 |  | `os-ch09-criteria-001` | `os-ch09-short-004` |
| ch09 | p.5 | 마감시간 · Deadlines | 처리량 |  |  | `os-ch09-short-005` |
| ch09 | p.5 | 처리량 · Throughput | 반환시간 |  | `os-ch09-criteria-008` | `os-ch09-short-006` |
| ch09 | p.6 | 기아 · starvation | 호위 효과 |  |  | `os-ch09-short-007` |
| ch09 | p.9 | 선점형 · Preemptive | 비선점형 |  |  | `os-ch09-short-008` |
| ch09 | p.10 | 서비스 시간 · service time | 대기시간 |  |  | `os-ch09-short-009` |
| ch09 | p.12 | 호위 효과 · convoy effect | 기아 |  | `os-ch09-fcfs-002` | `os-ch09-short-010` |
| ch09 | p.12 | CPU 중심 프로세스 · CPU-bound | I/O 중심 프로세스 |  |  | `os-ch09-short-011` |
| ch09 | p.12 | I/O 중심 프로세스 · I/O-bound | CPU 중심 프로세스 |  |  | `os-ch09-short-012` |
| ch09 | p.11 | 선착순 · First-Come-First-Served · FCFS | 라운드 로빈 |  |  | `os-ch09-short-013` |
| ch09 | p.13 | 라운드 로빈 · Round-Robin · RR | 가상 라운드 로빈 |  |  | `os-ch09-short-014` |
| ch09 | p.15 | 가상 라운드 로빈 · Virtual Round-Robin · VRR | 라운드 로빈 |  |  | `os-ch09-short-015` |
| ch09 | p.18 | 지수 평균 · Exponential Averaging | 단순 평균 |  |  | `os-ch09-short-016` |
| ch09 | p.19 | 최단 작업 우선 · Shortest Process Next · SPN | SRT |  |  | `os-ch09-short-017` |
| ch09 | p.21 | 최단 잔여 시간 우선 · Shortest Remaining Time · SRT | SPN |  |  | `os-ch09-short-018` |
| ch09 | p.22 | 최고 응답 비율 우선 · Highest Response Ratio Next · HRRN | SPN |  |  | `os-ch09-short-019` |
| ch09 | p.23 | 피드백 · Feedback | 라운드 로빈 |  |  | `os-ch09-short-020` |
| ch09 | p.26 | 대기시간 · waiting time | 서비스 시간 |  |  | `os-ch09-short-021` |
| ch09 | p.26 | 정규화 반환시간 · normalized turnaround time | 반환시간 |  |  | `os-ch09-short-022` |

## 고르지 않은 용어(용어 사전에 정의가 있지만 지엽적이라 단답형으로 내지 않음)

이 용어들은 지금처럼 용어 사전과 기존 문항(용어 단답형 `os-chNN-term-NNN` 포함)에만 남는다.

- **ch02** (12): 운영체제, 편리성, 효율성, 발전성, 사용 통계 관리, 오류 탐지 및 대응, 시스템 프로그램, 프로세서, 커널 버퍼, I/O 대기, 작업 제어 언어, 멀티코어
- **ch03** (31): 생성(spawn), 부모 프로세스, 자식 프로세스, 프로세스 트리, init, 정상 종료, 시간 초과, 경계 위반, 보호 오류, 메모리 부족, 산술 오류, New, Exit, 다중 블록 큐, 대기 큐, idle, 스왑 인, 초기화된 데이터 영역, 미초기화 데이터 영역, 스택 포인터, 조건 코드, 사용자 레지스터, 벡터링, 문맥 저장, 문맥 복구, 입출력 인터럽트, 세그먼트 폴트, 잘못된 명령어, 메모리 폴트, 소프트웨어 인터럽트, 세마포어
- **ch07** (10): 메모리 관리, 논리적 구성, 물리적 구성, 모듈, 오버레이, 버디, 합병, 기본 페이징 시스템, 오프셋, 기본 세그먼테이션 시스템
- **ch08** (12): 실제 메모리, 디스크 인터럽트, TLB 히트, TLB 미스, 멀티프로그래밍 수준, 잠금 비트, LFU, MFU, 다음 프레임 포인터, 프리 리스트, 수정 리스트, 교체 범위
- **ch09** (0): 없음 — 스케줄링 용어는 모두 골랐다

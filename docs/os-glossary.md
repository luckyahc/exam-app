# 운영체제 용어 사전

교수님은 수업에서 용어를 특히 중요하게 여기셨다(사용자 전달, 시험 힌트: "선다형, 단답형 등에서 영어 단어, 영어 약자 등이 나올 수 있음"). `source/os/` PDF 4개(인쇄 + 교수님 필기)에서 정의나 설명이 있는 OS 개념 용어를 모았다.

- 데이터: `data/subjects/os/glossary.ts`(공용 구조 `data/subjects/glossary.ts` — 다른 과목도 `loadGlossary`만 달면 같은 화면을 쓴다)
- 화면: `/s/os/glossary`(용어 정리 — 검색·챕터·시험 힌트 범위·정렬·관련 문제 풀기), 용어 퀴즈(과목 화면 버튼)
- 용어 단답형: 정의가 있는 모든 용어에 "다음 설명에 해당하는 용어를 쓰시오(한국어 또는 영어)" blank. 새 문항 id는 `os-chXX-term-NNN`(`data/subjects/os/terms.ts`가 사전에서 만든다 — 새 용어는 챕터 끝에 추가하고 순서를 바꾸지 않는다), topic "용어". 같은 용어를 이미 정의로 묻는 기존 blank가 있으면 새로 만들지 않고 연결(`linkedQuestionIds`)
- 규칙: 정의는 처음 정의된 곳(slideRef) 기준, 다른 곳은 참고 위치(seeAlso). 정의 문장에 정답 용어를 넣지 않는다(테스트가 검사). 영어 표기·약자의 풀네임은 슬라이드에 있는 것만(예: TLB = Translation Lookaside Buffer, bss = block started by symbol). 정의가 없는 용어는 "정의 없음(슬라이드에 이름만 등장)"으로 두고 문제를 만들지 않는다
- 정답 인정(accept): 한국어·영어·약자·동의어와 대소문자·띄어쓰기·하이픈 변형(`termAccept`). 예외적으로 시험 힌트의 표현 processor utilization을 CPU 이용률의 정답으로 인정했다(슬라이드 표현은 CPU utilization)
- 기존 문항 연결: 용어 47개 → 기존 blank 40개(한 문항이 두 용어를 묻는 경우: 모니터·JCL, 정상 종료·시간 초과, 경계 위반·보호 오류, 사용자·커널 모드, Segment fault·Illegal instruction, 페이지·프레임, Suspend·swap in). 연결하면서 accept에 영어를 더한 기존 문항 3개: `os-ch08-page-fault-004`(Memory fault interrupt), `os-ch08-locality-001`(Principle of Locality), `os-ch08-pte-003`(Modify Bit)

## 정의를 보강한 용어 (2026-10-07)

처음에 "정의 없음"으로 둔 3개를 슬라이드에서 다시 확인해 정의를 붙이고 용어 단답형을 만들었다(기존 단답형 번호가 바뀌지 않게 사전의 챕터 끝으로 옮김). **정의 없음은 이제 0개**다.

| 용어 | 근거 | 정의를 쓴 근거 |
|---|---|---|
| 프로세스 이미지(Process Image) | Ch03 p.23(참고 p.22, p.24-25) | p.23 그림 "메모리 내의 Process Image" — 높은 주소부터 인자·환경변수, 스택, 힙, 미초기화 데이터(bss), 초기화된 데이터, text(코드). 각 구성은 p.24-25 "프로세스 구성 요소" |
| 시스템 콜 인터페이스(system call interface) | Ch02 p.11(참고 Ch03 p.36, p.41) | p.11 "시스템 콜 인터페이스(system call interface, API 함수)", Ch03 p.36 필기 "응용프로그램에서 API함수(print, scanf 등)를 호출해서 운영체제 안으로 진입", p.41 "system call: OS API 함수" |
| 세마포어(semaphore) | Ch03 p.14(참고 p.12, p.19) | p.14 표 "세마포어 변수 s; lock(s) 함수 호출 때 자원을 혼자 사용하기 위해 lock 호출했지만 누군가 이미 lock한 경우 → 대기, 다른 프로세스가 unlock(s) 함수를 호출하여 lock을 풀어 줄 때 → Ready"(필기 "lock: 자원을 독점적으로 사용하기 위해 사용"), p.12 "세마포어 lock을 위해 대기" |

## 챕터별 개수

| 챕터 | 용어 | 정의 있음 | 정의 없음 | 새 용어 단답형 | 기존 문항 연결 | 시험 힌트 범위 |
|---|---|---|---|---|---|---|
| Ch02 운영체제 개요 | 32 | 32 | 0 | 25 | 7 | 26 |
| Ch03 프로세스 기술과 제어 | 58 | 58 | 0 | 38 | 20 | 58 |
| Ch07 메모리 관리 | 37 | 37 | 0 | 28 | 9 | 32 |
| Ch08 가상 메모리 | 43 | 43 | 0 | 32 | 11 | 39 |
| 합계 | 170 | 170 | 0 | 123 | 47 | 155 |

## 용어 목록


### Ch02 운영체제 개요 (32)

| 용어 | 영어 / 약자 | 근거 | 정의 | 단답형 | 힌트 |
|---|---|---|---|---|---|
| 운영체제 | Operating System / OS | Ch02 p.2 인쇄 | 있음 | `os-ch02-term-001` | 2-1 |
| 편리성 | Convenience | Ch02 p.3 인쇄 | 있음 | `os-ch02-term-002` | 2-1 |
| 효율성 | Efficiency | Ch02 p.3 인쇄 | 있음 | `os-ch02-term-003` | 2-1 |
| 발전성 | Ability to evolve | Ch02 p.3 인쇄 | 있음 | 연결: `os-ch02-os-goal-004` | 2-1 |
| 사용 통계 관리 | Accounting | Ch02 p.5 인쇄 | 있음 | 연결: `os-ch02-hint-service-003` | 2-2 |
| 오류 탐지 및 대응 | — | Ch02 p.6 인쇄 | 있음 | `os-ch02-term-004` | 2-2 |
| 디바이스 드라이버 | device driver | Ch02 p.7 필기 | 있음 | `os-ch02-term-005` | 2-4 |
| 커널 | Kernel | Ch02 p.11 인쇄 | 있음 | `os-ch02-term-006` | 2-3 |
| 시스템 프로그램 | System Programs | Ch02 p.10 인쇄 | 있음 | `os-ch02-term-007` | 2-3 |
| 프로세스 | Process | Ch02 p.11 필기 | 있음 | `os-ch02-term-008` | 3-1 |
| 프로세서 | Processor | Ch02 p.11 필기 | 있음 | `os-ch02-term-009` | 3-1 |
| 커널 버퍼 | — | Ch02 p.12 필기 | 있음 | `os-ch02-term-010` | — |
| I/O 대기 | blocked | Ch02 p.12 인쇄 | 있음 | `os-ch02-term-011` | — |
| 직렬 처리 | Serial Processing | Ch02 p.13 인쇄 | 있음 | `os-ch02-term-012` | 2-5 |
| 단순 일괄처리 시스템 | Simple Batch Systems | Ch02 p.13 인쇄 | 있음 | `os-ch02-term-013` | 2-5 |
| 모니터 | Monitor | Ch02 p.13 인쇄 | 있음 | 연결: `os-ch02-history-002` | 2-5 |
| 작업 제어 언어 | JCL | Ch02 p.13 인쇄 | 있음 | 연결: `os-ch02-history-002` | 2-5 |
| 다중프로그램 일괄처리 시스템 | Multiprogrammed Batch Systems | Ch02 p.14 인쇄 | 있음 | `os-ch02-term-014` | 2-5 |
| 시분할 시스템 | Time Sharing System | Ch02 p.20 인쇄 | 있음 | `os-ch02-term-015` | 2-5 |
| 타임 슬라이스 | time slice | Ch02 p.20 인쇄 | 있음 | 연결: `os-ch02-batch-switch-004` | 2-6 |
| 단일프로그래밍 | Uniprogramming | Ch02 p.17 인쇄 | 있음 | 연결: `os-ch02-uniprog-003` | 2-5 |
| 다중프로그래밍 | Multiprogramming | Ch02 p.18 인쇄 | 있음 | `os-ch02-term-016` | 2-5 |
| 비선점 | — | Ch02 p.14 인쇄 | 있음 | `os-ch02-term-017` | 2-6 |
| CPU 이용률 | CPU utilization | Ch02 p.21 인쇄 | 있음 | `os-ch02-term-018` | 2-7 |
| 유효 CPU 이용률 | effective CPU utilization | Ch02 p.21 인쇄 | 있음 | `os-ch02-term-019` | 2-7, 2-9 |
| 응답시간 | response time | Ch02 p.21 인쇄 | 있음 | `os-ch02-term-020` | 2-8, 2-10 |
| CPU 오버헤드 | CPU overhead | Ch02 p.24 인쇄 | 있음 | `os-ch02-term-021` | 2-7 |
| 대칭 다중처리 | Symmetric Multiprocessing / SMP | Ch02 p.25 인쇄 | 있음 | `os-ch02-term-022` | — |
| 멀티코어 | Multicore | Ch02 p.25 인쇄 | 있음 | 연결: `os-ch02-smp-004` | — |
| 동시성 | Concurrency | Ch02 p.25 인쇄 | 있음 | `os-ch02-term-023` | — |
| 병렬성 | Parallelism | Ch02 p.25 인쇄 | 있음 | `os-ch02-term-024` | — |
| 시스템 콜 인터페이스 | system call interface | Ch02 p.11 인쇄 | 있음 | `os-ch02-term-025` | 2-3, 2-4 |

### Ch03 프로세스 기술과 제어 (58)

| 용어 | 영어 / 약자 | 근거 | 정의 | 단답형 | 힌트 |
|---|---|---|---|---|---|
| 생성(spawn) | spawn | Ch03 p.3 인쇄 | 있음 | `os-ch03-term-001` | 3-2 |
| 부모 프로세스 | parent | Ch03 p.3 인쇄 | 있음 | `os-ch03-term-002` | 3-2 |
| 자식 프로세스 | child | Ch03 p.3 인쇄 | 있음 | `os-ch03-term-003` | 3-2 |
| 프로세스 트리 | process tree | Ch03 p.3 인쇄 | 있음 | `os-ch03-term-004` | 3-2 |
| init | systemd | Ch03 p.3 인쇄 | 있음 | 연결: `os-ch03-creation-002` | 3-2 |
| 정상 종료 | normal completion | Ch03 p.4 인쇄 | 있음 | 연결: `os-ch03-termination-009` | 3-2 |
| 시간 초과 | — | Ch03 p.4 인쇄 | 있음 | 연결: `os-ch03-termination-009` | 3-2 |
| 경계 위반 | bounds violation | Ch03 p.4 인쇄 | 있음 | 연결: `os-ch03-termination-008` | 3-2 |
| 보호 오류 | protection error | Ch03 p.4 인쇄 | 있음 | 연결: `os-ch03-termination-008` | 3-2 |
| 메모리 부족 | — | Ch03 p.4 인쇄 | 있음 | `os-ch03-term-005` | 3-2 |
| 산술 오류 | — | Ch03 p.4 인쇄 | 있음 | `os-ch03-term-006` | 3-2 |
| 프로세스 제어 블록 | process control block / PCB | Ch03 p.5 인쇄 | 있음 | 연결: `os-ch03-hint-pcb-002` | 3-7 |
| 프로세스 추적 | Trace | Ch03 p.7 인쇄 | 있음 | 연결: `os-ch03-scheduler-005` | 3-2 |
| 디스패처 | Dispatcher | Ch03 p.7 인쇄 | 있음 | 연결: `os-ch03-context-003` | 3-2 |
| 스케줄러 | Scheduler | Ch03 p.7 인쇄 | 있음 | `os-ch03-term-007` | 3-2, 3-11 |
| 실행 상태 | Running | Ch03 p.12 인쇄 | 있음 | `os-ch03-term-008` | 3-3 |
| 준비 상태 | Ready | Ch03 p.12 인쇄 | 있음 | `os-ch03-term-009` | 3-3 |
| 대기 상태 | Blocked | Ch03 p.12 인쇄 | 있음 | `os-ch03-term-010` | 3-3 |
| New | New | Ch03 p.12 인쇄 | 있음 | `os-ch03-term-011` | 3-3 |
| Exit | Exit | Ch03 p.12 인쇄 | 있음 | `os-ch03-term-012` | 3-3 |
| 다중 블록 큐 | Multiple Blocked Queues | Ch03 p.17 인쇄 | 있음 | 연결: `os-ch03-wait-event-004` | 3-4 |
| 준비 큐 | Ready Queue | Ch03 p.19 인쇄 | 있음 | `os-ch03-term-013` | 3-4 |
| 대기 큐 | — | Ch03 p.19 인쇄 | 있음 | `os-ch03-term-014` | 3-4 |
| idle | idle | Ch03 p.15 인쇄 | 있음 | `os-ch03-term-015` | 3-2 |
| 보류 상태 | Suspend | Ch03 p.20 인쇄 | 있음 | 연결: `os-ch03-suspend-005` | 3-3 |
| 스왑 아웃 | swap out | Ch03 p.20 인쇄 | 있음 | `os-ch03-term-016` | 3-4 |
| 스왑 인 | swap in | Ch03 p.20 인쇄 | 있음 | 연결: `os-ch03-suspend-005` | 3-4 |
| 텍스트 영역 | Text segment | Ch03 p.24 인쇄 | 있음 | `os-ch03-term-017` | 3-5, 3-6 |
| 초기화된 데이터 영역 | Initialized data segment | Ch03 p.24 인쇄 | 있음 | `os-ch03-term-018` | 3-5, 3-6 |
| 미초기화 데이터 영역 | Uninitialized data segment / bss (block started by symbol) | Ch03 p.24 인쇄 | 있음 | `os-ch03-term-019` | 3-5, 3-6 |
| 스택 | Stack | Ch03 p.25 인쇄 | 있음 | `os-ch03-term-020` | 3-5, 3-6 |
| 힙 | Heap | Ch03 p.25 인쇄 | 있음 | `os-ch03-term-021` | 3-5, 3-6 |
| 프로세스 식별 정보 | Process Identification | Ch03 p.26 인쇄 | 있음 | `os-ch03-term-022` | 3-7 |
| 프로세서 상태 정보 | Processor State Information | Ch03 p.26 인쇄 | 있음 | `os-ch03-term-023` | 3-7 |
| 프로세스 제어 정보 | Process Control Information | Ch03 p.26 인쇄 | 있음 | `os-ch03-term-024` | 3-7 |
| 프로그램 카운터 | program counter / PC | Ch03 p.29 인쇄 | 있음 | `os-ch03-term-025` | 3-7 |
| 프로그램 상태 워드 | PSW | Ch03 p.29 인쇄 | 있음 | 연결: `os-ch03-hint-pcb-003` | 3-7 |
| 스택 포인터 | SP | Ch03 p.31 인쇄 | 있음 | 연결: `os-ch03-stack-007` | 3-7 |
| 조건 코드 | — | Ch03 p.29 인쇄 | 있음 | `os-ch03-term-026` | 3-7 |
| 사용자 레지스터 | — | Ch03 p.28 인쇄 | 있음 | `os-ch03-term-027` | 3-7 |
| 사용자 모드 | user mode | Ch03 p.36 인쇄 | 있음 | 연결: `os-ch03-mode-003` | 3-2 |
| 커널 모드 | kernel mode | Ch03 p.36 인쇄 | 있음 | 연결: `os-ch03-mode-003` | 3-2 |
| 모드 전환 | Mode switch | Ch03 p.38 인쇄 | 있음 | `os-ch03-term-028` | 3-11 |
| 프로세스 전환 | Process Switch | Ch03 p.40 인쇄 | 있음 | `os-ch03-term-029` | 3-8 |
| 인터럽트 | Interrupt | Ch03 p.38 필기 | 있음 | `os-ch03-term-030` | 3-10 |
| 벡터링 | vectoring | Ch03 p.38 인쇄 | 있음 | `os-ch03-term-031` | 3-11 |
| 문맥 저장 | — | Ch03 p.38 인쇄 | 있음 | `os-ch03-term-032` | 3-11 |
| 문맥 복구 | — | Ch03 p.38 인쇄 | 있음 | `os-ch03-term-033` | 3-11 |
| 인터럽트 처리 함수 | interrupt service routine / ISR | Ch03 p.38 인쇄 | 있음 | 연결: `os-ch03-hint-interrupt-003` | 3-10, 3-11 |
| 클럭 인터럽트 | Clock interrupt | Ch03 p.41 인쇄 | 있음 | `os-ch03-term-034` | 3-8 |
| 입출력 인터럽트 | I/O interrupt | Ch03 p.41 인쇄 | 있음 | `os-ch03-term-035` | 3-8 |
| 트랩 | Trap interrupt | Ch03 p.42 인쇄 | 있음 | `os-ch03-term-036` | 3-8 |
| 세그먼트 폴트 | Segment fault | Ch03 p.42 인쇄 | 있음 | 연결: `os-ch03-process-switch-004` | 3-8 |
| 잘못된 명령어 | Illegal instruction | Ch03 p.42 인쇄 | 있음 | 연결: `os-ch03-process-switch-004` | 3-8 |
| 메모리 폴트 | Memory fault interrupt | Ch03 p.42 인쇄 | 있음 | 연결: `os-ch08-page-fault-004` | 3-8, 8-3 |
| 소프트웨어 인터럽트 | software interrupt | Ch03 p.41 인쇄 | 있음 | 연결: `os-ch03-process-switch-010` | 3-8 |
| 세마포어 | semaphore | Ch03 p.14 인쇄 | 있음 | `os-ch03-term-037` | 3-4 |
| 프로세스 이미지 | Process Image | Ch03 p.23 인쇄 | 있음 | `os-ch03-term-038` | 3-5 |

### Ch07 메모리 관리 (37)

| 용어 | 영어 / 약자 | 근거 | 정의 | 단답형 | 힌트 |
|---|---|---|---|---|---|
| 메모리 관리 | — | Ch07 p.2 인쇄 | 있음 | `os-ch07-term-001` | — |
| 재배치 | Relocation | Ch07 p.4 인쇄 | 있음 | `os-ch07-term-002` | 7-1 |
| 보호 | Protection | Ch07 p.6 인쇄 | 있음 | `os-ch07-term-003` | 7-2 |
| 공유 | Sharing | Ch07 p.8 인쇄 | 있음 | `os-ch07-term-004` | 7-3 |
| 논리적 구성 | Logical Organization | Ch07 p.9 인쇄 | 있음 | `os-ch07-term-005` | — |
| 물리적 구성 | Physical Organization | Ch07 p.10 인쇄 | 있음 | `os-ch07-term-006` | — |
| 모듈 | Module | Ch07 p.9 인쇄 | 있음 | 연결: `os-ch07-logical-org-002` | — |
| 오버레이 | Overlaying | Ch07 p.10 인쇄 | 있음 | 연결: `os-ch07-physical-org-002` | — |
| 메모리 관리 하드웨어 | memory management unit / MMU | Ch07 p.6 인쇄 | 있음 | 연결: `os-ch07-protection-002` | 7-2, 8-1 |
| 베이스 레지스터 | base register | Ch07 p.7 인쇄 | 있음 | `os-ch07-term-007` | 7-1, 7-2 |
| 바운드 레지스터 | bounds register | Ch07 p.7 인쇄 | 있음 | `os-ch07-term-008` | 7-2 |
| DLL 라이브러리 | DLL | Ch07 p.8 필기 | 있음 | `os-ch07-term-009` | 7-3 |
| 정적 라이브러리 | static library | Ch07 p.8 필기 | 있음 | `os-ch07-term-010` | 7-3 |
| 메모리 압축 | Memory compaction | Ch07 p.4 필기 | 있음 | 연결: `os-ch07-relocation-003` | 7-1, 7-5 |
| 고정 분할 | Fixed Partitioning | Ch07 p.11 인쇄 | 있음 | `os-ch07-term-011` | 7-4 |
| 동적 분할 | Dynamic Partitioning | Ch07 p.14 인쇄 | 있음 | `os-ch07-term-012` | 7-5 |
| 내부 단편화 | Internal Fragmentation | Ch07 p.13 인쇄 | 있음 | 연결: `os-ch07-hint-partition-002` | 7-4 |
| 외부 단편화 | External Fragmentation | Ch07 p.14 인쇄 | 있음 | 연결: `os-ch07-partition-004` | 7-5 |
| 배치 알고리즘 | placement algorithm | Ch07 p.16 인쇄 | 있음 | `os-ch07-term-013` | 7-6 |
| 최적 적합 | Best-fit | Ch07 p.16 인쇄 | 있음 | `os-ch07-term-014` | 7-6 |
| 최초 적합 | First-fit | Ch07 p.17 인쇄 | 있음 | `os-ch07-term-015` | 7-6 |
| 다음 적합 | Next-fit | Ch07 p.18 인쇄 | 있음 | `os-ch07-term-016` | 7-6 |
| 최악 적합 | Worst-fit | Ch07 p.19 인쇄 | 있음 | `os-ch07-term-017` | 7-6 |
| 버디 시스템 | Buddy system | Ch07 p.11 인쇄 | 있음 | `os-ch07-term-018` | 7-7, 7-8 |
| 버디 | buddy | Ch07 p.21 인쇄 | 있음 | 연결: `os-ch07-buddy-006` | 7-7 |
| 합병 | merging | Ch07 p.22 인쇄 | 있음 | `os-ch07-term-019` | 7-8 |
| 논리 주소 | logical address | Ch07 p.26 인쇄 | 있음 | `os-ch07-term-020` | 7-10 |
| 상대 주소 | relative address | Ch07 p.26 인쇄 | 있음 | `os-ch07-term-021` | 7-10 |
| 물리 주소 | physical address | Ch07 p.26 인쇄 | 있음 | `os-ch07-term-022` | 7-10 |
| 기본 페이징 시스템 | Basic Paging System | Ch07 p.27 인쇄 | 있음 | `os-ch07-term-023` | 7-9 |
| 페이지 | page | Ch07 p.27 인쇄 | 있음 | 연결: `os-ch07-paging-basic-001` | 7-9 |
| 프레임 | frame | Ch07 p.27 인쇄 | 있음 | 연결: `os-ch07-paging-basic-001` | 7-9 |
| 페이지 테이블 | page table | Ch07 p.27 인쇄 | 있음 | `os-ch07-term-024` | 7-9, 7-10 |
| 오프셋 | offset | Ch07 p.27 인쇄 | 있음 | `os-ch07-term-025` | 7-10 |
| 기본 세그먼테이션 시스템 | Basic Segmentation System | Ch07 p.38 인쇄 | 있음 | `os-ch07-term-026` | 7-10 |
| 세그먼트 | Segment | Ch07 p.38 인쇄 | 있음 | `os-ch07-term-027` | 7-10 |
| 세그먼트 테이블 | Segmentation table | Ch07 p.41 인쇄 | 있음 | `os-ch07-term-028` | 7-10 |

### Ch08 가상 메모리 (43)

| 용어 | 영어 / 약자 | 근거 | 정의 | 단답형 | 힌트 |
|---|---|---|---|---|---|
| 실제 메모리 | real memory | Ch08 p.2 인쇄 | 있음 | `os-ch08-term-001` | 8-1, 8-2 |
| 가상 메모리 | virtual memory | Ch08 p.2 인쇄 | 있음 | `os-ch08-term-002` | 8-1, 8-2 |
| 상주 집합 | Resident set | Ch08 p.5 인쇄 | 있음 | 연결: `os-ch08-page-fault-003` | 8-3, 8-7 |
| 디스크 인터럽트 | Disk interrupt | Ch08 p.6 인쇄 | 있음 | `os-ch08-term-003` | 8-3 |
| 지역성의 원리 | Principle of Locality | Ch08 p.8 인쇄 | 있음 | 연결: `os-ch08-locality-001` | 8-4 |
| P 비트 | P | Ch08 p.10 인쇄 | 있음 | `os-ch08-term-004` | — |
| 수정 비트 | Modify Bit / M | Ch08 p.12 인쇄 | 있음 | 연결: `os-ch08-pte-003` | 8-7 |
| 2단계 페이지 테이블 | Two-Level Scheme | Ch08 p.14 인쇄 | 있음 | `os-ch08-term-005` | — |
| 역 페이지 테이블 | Inverted Page Table | Ch08 p.16 인쇄 | 있음 | `os-ch08-term-006` | — |
| 변환 색인 버퍼 | Translation Lookaside Buffer / TLB | Ch08 p.19 인쇄 | 있음 | 연결: `os-ch08-tlb-005` | 8-5 |
| TLB 히트 | TLB hit | Ch08 p.21 인쇄 | 있음 | `os-ch08-term-007` | 8-5 |
| TLB 미스 | TLB miss | Ch08 p.21 인쇄 | 있음 | `os-ch08-term-008` | 8-5 |
| 워킹 셋 | Working Set | Ch08 p.60 인쇄 | 있음 | 연결: `os-ch08-working-set-003` | — |
| 스래싱 | Thrashing | Ch08 p.29 인쇄 | 있음 | 연결: `os-ch08-thrashing-002` | 8-6 |
| 부하 제어 | Load Control | Ch08 p.61 인쇄 | 있음 | `os-ch08-term-009` | 8-6, 8-7 |
| 멀티프로그래밍 수준 | Multiprogramming Level | Ch08 p.61 인쇄 | 있음 | `os-ch08-term-010` | 8-6 |
| 반입 정책 | Fetch Policy | Ch08 p.39 인쇄 | 있음 | `os-ch08-term-011` | 8-7 |
| 요구 페이징 | Demand Paging | Ch08 p.39 인쇄 | 있음 | 연결: `os-ch08-fetch-001` | 8-7 |
| 선반입 | Prepaging | Ch08 p.39 인쇄 | 있음 | 연결: `os-ch08-fetch-002` | 8-7 |
| 배치 정책 | Placement Policy | Ch08 p.40 인쇄 | 있음 | `os-ch08-term-012` | 8-7 |
| 교체 정책 | Replacement Policy | Ch08 p.41 인쇄 | 있음 | `os-ch08-term-013` | 8-7 |
| 프레임 잠금 | Frame Locking | Ch08 p.42 인쇄 | 있음 | `os-ch08-term-014` | 8-8 |
| 잠금 비트 | Lock Bit | Ch08 p.42 인쇄 | 있음 | 연결: `os-ch08-lock-002` | 8-8 |
| 최적 정책 | Optimal / OPT | Ch08 p.43 인쇄 | 있음 | `os-ch08-term-015` | 8-9 |
| LRU | Least Recently Used / LRU | Ch08 p.44 인쇄 | 있음 | `os-ch08-term-016` | 8-9 |
| LFU | Least Frequently Used / LFU | Ch08 p.46 인쇄 | 있음 | `os-ch08-term-017` | 8-9 |
| MFU | Most Frequently Used / MFU | Ch08 p.46 인쇄 | 있음 | `os-ch08-term-018` | 8-9 |
| FIFO | First-in, First-out / FIFO | Ch08 p.45 인쇄 | 있음 | `os-ch08-term-019` | 8-9 |
| 클럭 정책 | Clock Policy | Ch08 p.47 인쇄 | 있음 | `os-ch08-term-020` | 8-9 |
| 사용 비트 | use bit | Ch08 p.47 인쇄 | 있음 | 연결: `os-ch08-clock-004` | 8-9 |
| 다음 프레임 포인터 | next frame pointer | Ch08 p.48 필기 | 있음 | `os-ch08-term-021` | 8-9 |
| 개선된 클럭 정책 | Enhanced Clock Policy | Ch08 p.52 인쇄 | 있음 | `os-ch08-term-022` | 8-9 |
| 청소 정책 | Cleaning Policy | Ch08 p.55 인쇄 | 있음 | `os-ch08-term-023` | 8-7 |
| 요구 청소 | Demand Cleaning | Ch08 p.55 인쇄 | 있음 | `os-ch08-term-024` | 8-7 |
| 선청소 | Precleaning | Ch08 p.55 인쇄 | 있음 | `os-ch08-term-025` | 8-7 |
| 페이지 버퍼링 | Page Buffering | Ch08 p.57 인쇄 | 있음 | `os-ch08-term-026` | 8-7 |
| 프리 리스트 | free list | Ch08 p.57 인쇄 | 있음 | `os-ch08-term-027` | 8-7 |
| 수정 리스트 | modified list | Ch08 p.57 인쇄 | 있음 | 연결: `os-ch08-page-buffering-002` | 8-7 |
| 고정 할당 | fixed allocation | Ch08 p.58 인쇄 | 있음 | `os-ch08-term-028` | 8-7 |
| 가변 할당 | variable allocation | Ch08 p.58 인쇄 | 있음 | `os-ch08-term-029` | 8-7 |
| 교체 범위 | Replacement Scope | Ch08 p.59 인쇄 | 있음 | `os-ch08-term-030` | 8-7 |
| 지역 교체 | local | Ch08 p.59 인쇄 | 있음 | `os-ch08-term-031` | 8-7 |
| 전역 교체 | global | Ch08 p.59 인쇄 | 있음 | `os-ch08-term-032` | 8-7 |

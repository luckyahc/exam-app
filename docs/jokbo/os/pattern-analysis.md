# 운영체제 족보 — 유형 분석과 유사 문제("족보관련")

작성: 2026-10-19. 기준: [`inventory.md`](./inventory.md)의 대표 문항 56개, 대조 기록 [`docs/verification/os-jokbo.md`](../../verification/os-jokbo.md). 데이터: `data/subjects/os/jokboPatterns.ts`, 검증: `data/subjects/os/jokboPatterns.test.ts`(이 문서의 두 표 = 데이터).

## 1. 범위

- 시험 범위 단원 Ch02 · Ch03 · Ch07 · Ch08 · Ch09만. Ch04(스레드, 2022-42~50)는 범위 밖이라 쓰지 않았다.
- 대표 족보 56개를 24개 패턴으로 빠짐없이 한 번씩 묶었다. 족보 원문 문항은 고치지 않았다.
- 생성 문항은 `origin` 없이 `basedOn: [족보 id]`를 쓴다(알고리즘 족보 유형 문항과 같은 필드). 난이도는 보통 2, 어려움 3이다. 패턴마다 보통 1개 + 어려움 1개, 계산·추적이 중심인 패턴(P3·P10·P11·P13·P16·P19·P23)은 어려움 2개 — 모두 55문항.
- 앱에서는 분류 "족보관련"으로 묶인다(과목 홈 "족보관련만 풀기", 챕터 시작·문제 목록의 분류 필터, 문항 뱃지). 족보 원문 분류 "족보"와 따로 보이며, "일반"에도 들어간다.
- `exam: false`(⭐ 아님) — OS 족보 문항과 같은 규칙. 챕터 대조 기록(`docs/verification/os-ch*.md`)과 Ch09 소주제 목표에서는 족보 문항처럼 뺀다.

## 2. 족보 형식 관례 (생성 문항도 그대로 따름)

- 모든 문항이 보기 중 고르는 형식이다(빈칸·단답 없음). 5지선다(mcq)와 "[두 개]/[세 개] 고르시오" 복수선택(multi)만 쓰고, 보기 순서는 고정한다(`shuffle: false`).
- 강조는 대괄호로 한다: "[틀린]", "[아닌]", "[잘못]된", "[올바른 두 개]", "[잘못된 두 개]".
- 순서 문제는 [1]~[n] 또는 A)~F) 단계를 주고, 올바른 순서를 보기에서 고른다.
- 버디·배치 문제는 크기 줄 + `|###|` 줄의 ASCII 그림(고정폭 원문 블록), 페이지 테이블·프레임 상태는 "[0] 2" 형식(*는 use bit, +는 modify bit, <--는 next frame pointer)이다.
- 스케줄링 추적은 "시간: 프로세스" 보기에서 잘못된 것을 고른다. 응답 비율·남은 시간이 같으면 먼저 도착한 프로세스(Ch09 p.21 필기 "우선순위 같으면 FIFO방식으로").
- 정답은 이론(슬라이드)으로 하나로 정해지게 만들었다. 교수님 채점 기준은 족보 원문 문항에만 적용한다 — 이론과 갈린 지점(아래 §5)은 함정 보기 + 해설 한 줄로만 다룬다.
- 해설 = "풀이: … 원문과 달라진 점: … 함정: …". 슬라이드에 없는 내용은 쓰지 않았다(보충 표시 0건).

## 3. 패턴표

| 패턴 | 패턴명 | 단원 | 해당 족보 ID | 출제 형식 | 묻는 능력 | 학생이 틀리기 쉬운 함정 |
|---|---|---|---|---|---|---|
| P1 | OS 정의·목적·서비스·구성요소 | Ch02 | ch02-jokbo-001, ch02-jokbo-002, ch02-jokbo-003, ch02-jokbo-008 | 복수선택("[틀린] 세 개", "[아닌] 두 개")·5지선다 | 개념 판별 | 시스템 프로그램을 커널의 일부로 봄, 소프트웨어 오류는 탐지 못한다고 봄, DB·AI·바이러스를 OS 서비스로 봄 |
| P2 | 일괄처리 vs 시분할 | Ch02 | ch02-jokbo-004, ch02-jokbo-005, ch02-jokbo-009 | 5지선다("[틀린]")·복수선택 | 개념 판별 | 두 시스템의 목표(CPU 이용률 vs 응답시간)를 맞바꿈, time slice를 다 써야만 전환된다고 봄 |
| P3 | 응답시간 계산 | Ch02 | ch02-jokbo-006, ch02-jokbo-007 | 5지선다(수치) | 계산·추적 | 시분할에서 B 혼자 실행되는 것처럼 계산, 일괄처리에서 A가 끝까지 실행됨을 놓침 |
| P4 | 유효 CPU 이용률 | Ch02 | ch02-jokbo-010 | 5지선다(수치) | 계산 | 스위칭 시간을 유효 실행시간에 넣음(교수님 기준 0.6 vs 이론 0.7) |
| P5 | 프로세스 이미지·PCB·스택 구성 | Ch03 | ch03-jokbo-001, ch03-jokbo-006, ch03-jokbo-009, ch03-jokbo-011 | 5지선다("[아닌]")·복수선택 | 개념 판별 | context data(PCB)와 bss data(이미지)를 섞음, static 변수를 스택으로 봄 |
| P6 | 상태 전이 | Ch03 | ch03-jokbo-002, ch03-jokbo-003, ch03-jokbo-008 | 5지선다(상태 변화 문자열) | 추적·순서 | 인터럽트로 깨어나면 바로 running이라 봄, page fault를 ready로 봄 |
| P7 | Process switch·인터럽트 종류 | Ch03 | ch03-jokbo-004, ch03-jokbo-005 | 5지선다("[아닌]", "[틀린]") | 개념 판별 | 새 프로세스 도착만으로 switch된다고 봄, 명령어가 디스크에 있는 경우를 Trap으로 봄 |
| P8 | 인터럽트 처리 순서 | Ch03 | ch03-jokbo-007, ch03-jokbo-013 | 보기 중 순서 고르기([1]~[7])·5지선다 | 순서 | 벡터링·문맥 저장 순서, 문맥 복구를 scheduler보다 먼저 둠, 벡터링·복구를 handler 일로 봄 |
| P9 | 프로세스 정의·swap 이유 | Ch03 | ch03-jokbo-010, ch03-jokbo-012 | 복수선택("[틀린] 두 개")·5지선다 | 개념 판별 | spawn 불가로 봄, swap 이유를 응답시간으로 봄 |
| P10 | 버디 시스템 | Ch07 | ch07-jokbo-001, ch07-jokbo-002 | 5지선다·ASCII 그림 | 추적 | 짝이 아닌 이웃 free 블록과 합침, 129K를 129K·127K로 쪼갬 |
| P11 | 배치 결과 → 알고리즘 | Ch07 | ch07-jokbo-005, ch07-jokbo-006 | 5지선다·ASCII 그림 | 추적(역으로 묻기) | next-fit의 시작 위치(마지막 할당 다음), worst-fit과 best-fit 혼동 |
| P12 | 고정·동적 분할과 배치 알고리즘 개념 | Ch07 | ch07-jokbo-003, ch07-jokbo-004, ch07-jokbo-007 | 복수선택("[틀린] 두 개")·5지선다 | 개념 판별 | internal/external fragmentation 혼동, best-fit이 성능 최고라고 봄 |
| P13 | 페이징 주소 변환 | Ch07 | ch07-jokbo-011, ch07-jokbo-012 | 5지선다(수치)·페이지 테이블 "[0] 2" | 계산(역으로 묻기 포함) | 실주소 → 논리주소에서 인덱스와 값을 혼동 |
| P14 | 세그먼테이션 주소 변환 | Ch07 | ch07-jokbo-013 | 5지선다(수치)·세그먼트 테이블 | 계산 | 시작주소 대신 세그먼트 번호 × 최대 크기를 더함, 길이 검사 생략 |
| P15 | 재배치·보호·공유·기본 페이징 | Ch07 | ch07-jokbo-008, ch07-jokbo-009, ch07-jokbo-010, ch07-jokbo-014 | 5지선다("[옳은]", "[틀린]", "[아닌]") | 개념 판별 | page/frame 이름 맞바꿈, MMU가 페이지 테이블을 만든다고 봄, heap 공유 |
| P16 | 교체 프레임(Optimal·LRU) | Ch08 | ch08-jokbo-004, ch08-jokbo-005 | 5지선다(프레임 번호)·"[0] 2" | 추적 | LRU에 미래 참조를 씀, Optimal에서 가장 늦게 쓰일 페이지를 잘못 셈 |
| P17 | Clock 교체 | Ch08 | ch08-jokbo-003 | 5지선다(프레임·pointer·use bit 조합) | 추적 | 지나친 프레임의 use bit를 그대로 둠, 교체 후 pointer 위치 |
| P18 | Enhanced Clock 교체 | Ch08 | ch08-jokbo-002 | 5지선다(프레임 번호) | 추적 | (0,0)보다 (0,1)을 먼저 고름, 1단계에서 비트를 바꿈 |
| P19 | 주소 변환·페이지 폴트 처리 순서 | Ch08 | ch08-jokbo-008, ch08-jokbo-013 | 보기 중 순서 고르기(A)~G)) | 순서 | page table을 TLB보다 먼저 봄, 디스크 요청 뒤 switch를 빠뜨림 |
| P20 | 가상 메모리 정책·지역성·특성·프레임 잠금 | Ch08 | ch08-jokbo-001, ch08-jokbo-007, ch08-jokbo-009, ch08-jokbo-010 | 복수선택("[잘못] 두 개", "[세 개]")·5지선다 | 개념 판별 | page locking(이름 오류), paging에서 placement가 중요하다고 봄, 참조 영역 개수가 늘어난다고 봄 |
| P21 | 스래싱·부하 제어·페이지 크기 | Ch08 | ch08-jokbo-006, ch08-jokbo-011, ch08-jokbo-012 | 복수선택("[잘못]/[틀린] 두·세 개") | 개념 판별(그래프) | 메모리를 많이 줄수록 폴트율이 오른다고 봄, OS가 부하를 자동 제어한다고 봄 |
| P22 | SRT 시각별 추적 | Ch09 | ch09-jokbo-001 | 복수선택("[잘못된 두 개]", "시간: 프로세스") | 추적 | 도착하면 무조건 선점, 남은 시간 대신 전체 서비스 시간 비교 |
| P23 | HRRN 시각별 추적 | Ch09 | ch09-jokbo-002 | 복수선택("[잘못된 두 개]", "시간: 프로세스") | 추적·계산 | 선점한다고 봄, 응답 비율 대신 서비스 시간(SPN)으로 고름 |
| P24 | 스케줄링 개념(selection function·Feedback·RR·용어) | Ch09 | ch09-jokbo-003, ch09-jokbo-004, ch09-jokbo-005, ch09-jokbo-006 | 복수선택("[올바른 두 개]") | 개념 판별 | min/max 뒤집기, Feedback의 효과를 'SRT보다 뛰어남'으로 봄, VRR과 Feedback 혼동, throughput과 turnaround 맞바꿈 |

## 4. 생성 문항표

난이도: 보통 = 같은 형식·절차에 수치·입력·보기만 바꾼 변형, 어려움 = 입력 확장·경계 조건(타이, 연쇄 합치기, next-fit 되돌아가기, 방금 적재한 페이지 교체, 메모리에 없는 페이지, 길이 초과), 역으로 묻기, 두 개념 결합, 족보 함정을 보기에 넣기 중 하나 이상.
검증: 시뮬레이터 = `lib/sim/os`(scheduling·cpuTime·buddy·placement·paging·segmentation·replacement)로 정답을 다시 계산하고, 그 값이 정답 보기에만 있는지(오답 보기가 우연히 정답이 되지 않는지) 확인. 순서 = 슬라이드 순서와 같은 보기가 정확히 하나. 개념 = 슬라이드 문장으로 판단(실행할 계산 없음).

| # | id | 패턴 | 난이도 | 형식 | 정답 | 검증 |
|---|---|---|---|---|---|---|
| 1 | `os-ch02-pattern-service-001` | P1 | 보통 | 복수선택(2개) | AI model training / Data base management | 개념 |
| 2 | `os-ch02-pattern-service-002` | P1 | 어려움 | 복수선택(3개) | 시스템 프로그램은 커널 안에 포함되어 부팅 후 항상 메모리에 상주한다. / 하드웨어가 발전해도 운영체제는 바뀌지 않도록 만드는 것이 운영체제의 발전성 목표다. / 커널 함수는 인터럽트가 발생했을 때만 호출된다. | 개념 |
| 3 | `os-ch02-pattern-mpts-001` | P2 | 보통 | 5지선다 | CPU 이용률 최대화가 주 목적이며 타이머에 의한 강제 전환은 하지 않음 | 개념 |
| 4 | `os-ch02-pattern-mpts-002` | P2 | 어려움 | 복수선택(2개) | 다중프로그래밍 일괄처리에서는 실행 중인 프로그램이 종료하거나 I/O 입력을 기다릴 때만 CPU를 넘긴다. / CPU가 각 프로그램을 일정시간(time slice) 동안 번갈아 실행시키는 기능을 시분할처리 기능이라 한다. | 개념 |
| 5 | `os-ch02-pattern-response-001` | P3 | 보통 | 5지선다 | 0.6 | 시뮬레이터 |
| 6 | `os-ch02-pattern-response-002` | P3 | 어려움 | 5지선다 | 0.6, 2.2 | 시뮬레이터 |
| 7 | `os-ch02-pattern-response-003` | P3 | 어려움 | 5지선다 | 0.4 | 시뮬레이터 |
| 8 | `os-ch02-pattern-utilization-001` | P4 | 보통 | 5지선다 | 0.8 | 시뮬레이터 |
| 9 | `os-ch02-pattern-utilization-002` | P4 | 어려움 | 5지선다 | 0.83 | 시뮬레이터 |
| 10 | `os-ch03-pattern-image-001` | P5 | 보통 | 5지선다 | heap | 개념 |
| 11 | `os-ch03-pattern-image-002` | P5 | 어려움 | 복수선택(2개) | 지역변수와 함수 매개변수는 stack에 저장된다. / 초기화되지 않은 전역 변수는 bss data 영역에 있다. | 개념 |
| 12 | `os-ch03-pattern-state-001` | P6 | 보통 | 5지선다 | 주어진 time slice를 모두 소진함 | 개념 |
| 13 | `os-ch03-pattern-state-002` | P6 | 어려움 | 5지선다 | blocked -> ready -> running -> ready -> running -> blocked | 순서 |
| 14 | `os-ch03-pattern-switch-001` | P7 | 보통 | 5지선다 | 실행 중인 프로그램이 자기 안의 일반 함수 sum()을 호출한 경우 | 개념 |
| 15 | `os-ch03-pattern-switch-002` | P7 | 어려움 | 5지선다 | 0으로 나누기: Trap / 다음에 실행할 명령어가 디스크에 있음: Memory fault | 개념 |
| 16 | `os-ch03-pattern-interrupt-001` | P8 | 보통 | 5지선다 | [4] [1] [6] [2] [7] [5] [3] | 순서 |
| 17 | `os-ch03-pattern-interrupt-002` | P8 | 어려움 | 복수선택(2개) | 벡터링과 문맥 저장은 interrupt handler가 실행되기 전에 일어난다. / 모든 ISR의 마지막에서 scheduler()가 호출된다. | 개념 |
| 18 | `os-ch03-pattern-process-001` | P9 | 보통 | 복수선택(2개) | PCB는 Process Communication Block의 약자임 / arithmetic error가 발생해도 프로세스는 종료되지 않음 | 개념 |
| 19 | `os-ch03-pattern-process-002` | P9 | 어려움 | 5지선다 | 장시간 대기 중인 프로세스를 디스크로 swap out하고 다른 프로세스를 메모리에 넣어 processor 이용률을 높인다. | 개념 |
| 20 | `os-ch07-pattern-buddy-001` | P10 | 보통 | 5지선다·ASCII 그림 | (그림) | 시뮬레이터 |
| 21 | `os-ch07-pattern-buddy-002` | P10 | 어려움 | 5지선다·ASCII 그림 | (그림) | 시뮬레이터 |
| 22 | `os-ch07-pattern-buddy-003` | P10 | 어려움 | 5지선다·ASCII 그림 | (그림) | 시뮬레이터 |
| 23 | `os-ch07-pattern-fit-001` | P11 | 보통 | 5지선다 | best-fit | 시뮬레이터 |
| 24 | `os-ch07-pattern-fit-002` | P11 | 어려움 | 복수선택(2개) | first-fit / next-fit | 시뮬레이터 |
| 25 | `os-ch07-pattern-fit-003` | P11 | 어려움 | 5지선다 | B의 남은 14K 영역 | 시뮬레이터 |
| 26 | `os-ch07-pattern-partition-001` | P12 | 보통 | 5지선다 | 아무리 작은 프로그램이라도 partition 하나 전체를 차지하므로 internal fragmentation이 생긴다. | 개념 |
| 27 | `os-ch07-pattern-partition-002` | P12 | 어려움 | 복수선택(2개) | Next-fit은 항상 메모리의 처음부터 빈 블록을 찾는다. / Worst-fit은 요청 크기에 가장 가까운 크기의 빈 블록을 고른다. | 개념 |
| 28 | `os-ch07-pattern-address-001` | P13 | 보통 | 5지선다 | 1052 | 시뮬레이터 |
| 29 | `os-ch07-pattern-address-002` | P13 | 어려움 | 5지선다 | 1027 | 시뮬레이터 |
| 30 | `os-ch07-pattern-address-003` | P13 | 어려움 | 5지선다 | page fault 발생, 788 | 시뮬레이터 |
| 31 | `os-ch07-pattern-segment-001` | P14 | 보통 | 5지선다 | 1076 | 시뮬레이터 |
| 32 | `os-ch07-pattern-segment-002` | P14 | 어려움 | 5지선다 | 76, 보호 위반(trap) 발생 | 시뮬레이터 |
| 33 | `os-ch07-pattern-memreq-001` | P15 | 보통 | 5지선다 | MMU가 페이지 테이블을 만들고 관리한다. | 개념 |
| 34 | `os-ch07-pattern-memreq-002` | P15 | 어려움 | 복수선택(2개) | 메모리 보호 검사는 compile time이 아니라 run time에 하드웨어(MMU)가 수행한다. / compaction이나 swap in으로 재배치가 일어나도 포인터 변수의 주소 값은 바뀌지 않는다. | 개념 |
| 35 | `os-ch08-pattern-replace-001` | P16 | 보통 | 5지선다 | [2] | 시뮬레이터 |
| 36 | `os-ch08-pattern-replace-002` | P16 | 어려움 | 5지선다 | FIFO [0], LRU [2] | 시뮬레이터 |
| 37 | `os-ch08-pattern-replace-003` | P16 | 어려움 | 5지선다 | [0], [0] | 시뮬레이터 |
| 38 | `os-ch08-pattern-clock-001` | P17 | 보통 | 5지선다 | [2], [3], 2 | 시뮬레이터 |
| 39 | `os-ch08-pattern-clock-002` | P17 | 어려움 | 5지선다 | [2], [3], 1 | 시뮬레이터 |
| 40 | `os-ch08-pattern-eclock-001` | P18 | 보통 | 5지선다 | [2] | 시뮬레이터 |
| 41 | `os-ch08-pattern-eclock-002` | P18 | 어려움 | 5지선다 | [2], 2 + | 시뮬레이터 |
| 42 | `os-ch08-pattern-order-001` | P19 | 보통 | 5지선다 | C-A-B-D | 순서 |
| 43 | `os-ch08-pattern-order-002` | P19 | 어려움 | 5지선다 | A-B-C-D-E-F | 순서 |
| 44 | `os-ch08-pattern-order-003` | P19 | 어려움 | 5지선다 | running -> blocked -> ready -> running | 순서 |
| 45 | `os-ch08-pattern-vm-001` | P20 | 보통 | 5지선다 | 사용자 프로그램의 데이터 페이지 | 개념 |
| 46 | `os-ch08-pattern-vm-002` | P20 | 어려움 | 복수선택(2개) | 지역성 때문에 프로세스가 참조하는 영역의 개수는 시간이 흐를수록 계속 늘어남 / 가상 메모리에서는 프로세스 전체가 메모리에 있어야만 실행할 수 있음 | 개념 |
| 47 | `os-ch08-pattern-thrashing-001` | P21 | 보통 | 복수선택(2개) | 실행할 프로세스 수가 너무 많아지면 프로세스당 frame이 부족해 page fault가 급격히 많이 발생함 / Thrashing이 발생하면 processor는 page fault 처리에 시간을 써서 processor 이용률이 떨어짐 | 개념 |
| 48 | `os-ch08-pattern-thrashing-002` | P21 | 어려움 | 복수선택(2개) | 페이지 크기가 작아질수록 최근 참조한 페이지가 메모리에 덜 남아 page fault율이 높아짐 / 대부분의 운영체제는 시스템 내의 프로세스 수를 자동으로 조절해 주는 기능을 가지고 있음 | 개념 |
| 49 | `os-ch09-pattern-srt-001` | P22 | 보통 | 복수선택(2개) | 2: C / 4: C | 시뮬레이터 |
| 50 | `os-ch09-pattern-srt-002` | P22 | 어려움 | 복수선택(2개) | 3: D / 6: A | 시뮬레이터 |
| 51 | `os-ch09-pattern-hrrn-001` | P23 | 보통 | 복수선택(2개) | 2: B / 4: C | 시뮬레이터 |
| 52 | `os-ch09-pattern-hrrn-002` | P23 | 어려움 | 복수선택(2개) | 3: C / 7: C | 시뮬레이터 |
| 53 | `os-ch09-pattern-hrrn-003` | P23 | 어려움 | 5지선다 | 10, 1.75 | 시뮬레이터 |
| 54 | `os-ch09-pattern-concept-001` | P24 | 보통 | 복수선택(2개) | SPN: min[s] / HRRN: max((w+s)/s) | 개념 |
| 55 | `os-ch09-pattern-concept-002` | P24 | 어려움 | 복수선택(2개) | Virtual round-robin은 상대적으로 불리한 I/O-bound 프로세스를 위해 보조 큐를 둔 것임 / Feedback은 여러 개의 ready queue를 두고 프로세스가 한 번 실행될 때마다 다음 단계의 큐로 내려감 | 개념 |

## 5. 족보 채점과 이론이 갈린 지점

| 족보 | 생성 문항 | 처리 |
|---|---|---|
| `os-ch02-jokbo-010` | `os-ch02-pattern-utilization-001` | 족보는 "CPU 이용률"만 물어 교수님 기준(유효 실행시간 6/10 = 0.6)과 이론(바쁜 시간 7/10 = 0.7)이 갈렸다. 생성 문항은 지문에 "유효 CPU 이용률(= 유효 프로그램 실행시간 / 총 경과시간)"을 적어 정답을 하나로 정하고, 바쁜 시간 기준 값(0.9)을 함정 보기로 넣었다. |

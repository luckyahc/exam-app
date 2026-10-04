# 콘텐츠 출제 범위 체크리스트

원본 §7(챕터별 출제 범위)을 추적 가능한 체크리스트로 변환한 문서. Sprint 5·6(콘텐츠 제작)에서 항목별로 작성 완료 시 체크하고, 실제 작성한 문항 수를 괄호에 기록한다. ⭐ 표시는 "교수님이 시험이라고 직접 언급"한 항목으로, **유형을 골고루 섞어 한 주제당 최소 6~10문항**을 만들어야 한다.

## 과목 1 — 운영체제 (os)

### Ch02. 운영체제 개요 (목표 ≥ 50문항 → 작성 59, ⭐ 22)

- [x] OS 정의 및 3대 목표(편리성/효율성/발전성) — mcq/blank/match (4문항)
- [x] OS 서비스 7가지(편리성) — mcq/multi/blank (3문항) — 7가지는 p.5(6개)+p.6(오류 탐지 및 대응) 인쇄 기준으로 확인(2026-10-05). 이 소주제 문항 3개는 개수를 묻지 않고, 7가지 전체 목록은 ⭐ "지원하지 않는 것" 문항(not-supported-005 해설 등)에서 다룬다
- [x] ⭐ "OS가 지원하지 않는 것 고르기" (바이러스 검사, AI 추론, DB 체킹 등 오답 보기) — **최소 6~10문항**, mcq/multi/ox 혼합 (8문항)
- [x] 자원 관리자로서의 OS(자원 목록, 디바이스 드라이버 정의) — mcq/match/blank (4문항)
- [x] 발전성(하드웨어 업그레이드/새 서비스/오류 수정 사례) — mcq/ox (3문항)
- [x] 커널 vs 시스템 프로그램, 커널 주요 기능 7가지 — match/blank (3문항)
- [x] 커널 함수가 호출되는 2가지 경우(API/인터럽트) — mcq/order/blank (2문항)
- [x] I/O 흐름(커널 버퍼→사용자 버퍼, 입력 대기/출력 비대기), 장치 속도 순서 — mcq/ox/order (4문항)
- [x] OS 발전 과정 4단계 순서(직렬→단순일괄→다중프로그램일괄→시분할) — **order 핵심 문제** (3문항)
- [x] 다중프로그램 일괄처리 CPU 양도 2가지 vs 시분할 3가지(타임슬라이스 추가), 비선점/선점 구분 — mcq/classify (4문항)
- [x] 단일 vs 다중프로그래밍 비교 — mcq/ox (3문항)
- [x] ⭐ 다중프로그램 일괄처리 vs 시분할 "시간 계산"(응답시간/유효 CPU 이용률, §6-5 생성기 연동) — **최소 6~10문항**, calc/trace (14문항) — calc 7(`cpuTime.ts` 함수로 정답 계산, 허용오차 0.005) + 개념 7(응답시간·CPU 이용률 정의, 주 목표, 시분할 오버헤드 함수, p.24 필기 "과거는 CPU 이용률·오늘날은 응답시간"). 파라미터 다양화 생성기는 Sprint 4 `cpu-time`
- [x] SMP, 멀티코어, 동시성 vs 병렬성 — mcq/match/blank (4문항)

### Ch03. 프로세스 기술과 제어 (목표 ≥ 80문항 → 작성 95, ⭐ 63)

- [x] 프로세스 정의(프로그램+데이터+PCB), Process vs Processor 구분 — ⭐ "프로세스 설명이 아닌 것" mcq (최소 6~10문항) (8문항)
- [x] 프로세스 생성 사유 4가지, 부모-자식 트리(init/systemd, pstree) — mcq/match/blank (3문항)
- [x] ⭐ 프로세스 종료 사유 전부(정상종료/시간초과/메모리부족/경계위반/보호오류/산술오류/잘못된명령/IO실패/부모종료요청) + 명백한 오답(TLB 히트 등) — **최소 6~10문항**, mcq/ox/blank (10문항) — '잘못된 명령'은 **종료 사유 맥락에서 출제 보류**(p.4 인쇄=종료 사유, 필기="운영체제가 죽이진 않고 보통 프로그램이 에러메시지를 줌"). Process switch 맥락(p.42 Illegal instruction → Trap → Exit)은 Process switch 항목에서 출제(파일 머리 주석)
- [x] PCB 3대 구성(식별정보/프로세서상태정보/제어정보), 이중연결리스트 큐 — match/blank (4문항)
- [x] 문맥 데이터(PC/SP/PSW), dispatcher 역할 — mcq/blank (3문항)
- [x] 프로세스 이미지 메모리 레이아웃(text~stack), exe에 저장되는 것(text+initialized data) — mcq/order (5문항)
- [x] ⭐ 스택에 저장되는 것 vs 저장되지 않는 것(전역변수/힙 오답) — **최소 6~10문항**, mcq/classify (8문항)
- [x] ⭐ 5-상태 모델과 상태 전이도(New/Ready/Running/Blocked/Exit, 전이 원인) — **최소 6~10문항**, classify/match/mcq/order (10문항)
- [x] ⭐ Suspend(swap out/in, Blocked→Suspend→Ready) — **최소 6~10문항**, mcq/ox/blank (8문항)
- [x] 대기 이벤트표(키보드/마우스/디스크/네트워크/타이머/세마포어 ↔ 함수호출·인터럽트) — match (4문항)
- [x] Scheduler/Dispatcher 동작, ISR 마지막 scheduler() 호출 — mcq/ox/blank (5문항)
- [x] 실행 모드(사용자/커널) 구분 이유, 커널 모드 전환 2가지 — mcq/blank (3문항)
- [x] 프로세스 생성/종료 시 수행 작업 순서 — order (2문항)
- [x] ⭐ 인터럽트 발생 시 처리 과정 8단계(p.38-39) — **order 최소 6~10 변형**(전체 순서/일부 빈칸/일부 위치 고르기), mode switch ≠ process switch 구분 mcq (9문항) — order 3(전체·앞 4단계·ISR 고유 업무) + mcq/blank/ox 6(직후 단계·벡터링·mode≠process switch 등)
- [x] ⭐ Process switch 발생 5가지 경우(Clock/IO interrupt/IO 함수호출/Trap/Memory fault) — **최소 6~10문항**, classify/mcq/blank/match (10문항)
- [x] 재실행 위치(scheduler() return;부터 vs 인터럽트 직전 다음 명령어부터) — mcq/ox (3문항)

### Ch07. 메모리 관리 (목표 ≥ 80문항 → 작성 89 = 정적 82 + 생성기 7, ⭐ 30)

- [x] 메모리 관리 요구사항 5가지(재배치/보호/공유/논리적구성/물리적구성) — order/blank/match (3문항) — order 대신 multi(요구사항 5가지 목록 순서는 지식 포인트가 아님)
- [x] 재배치 필요 2가지 경우, 논리주소=가짜주소 개념 — mcq/ox (5문항)
- [x] 보호(실행 시점 MMU 검사, trap+process switch), Base·Bounds 레지스터 — mcq/calc/blank (6문항)
- [x] 공유(코드 공유, 정적 vs 동적(DLL) 라이브러리, 데이터 공유) — mcq/match/ox (6문항)
- [x] 논리적 구성(모듈, 세그먼테이션과의 관계) — mcq/blank (4문항)
- [x] 물리적 구성(오버레이→가상메모리) — mcq/ox (4문항)
- [x] 고정분할(내부단편화) vs 동적분할(외부단편화/압축) — mcq/classify (7문항)
- [x] ⭐ 동적 분할 배치 알고리즘 4가지(Best/First/Next/Worst-fit) 특징·성능 비교 — **최소 6~10문항**, match + §6-4 생성기 연동 calc/mcq (10문항) — 생성기 `placement` 2 포함, Figure 7.5(p.20) trace
- [x] ⭐ 버디 시스템 할당/병합 과정(2^k 올림, 내부단편화, buddy 병합, 트리구조) — **최소 6~10문항**, §6-3 생성기 연동 trace/calc/mcq (10문항) — 생성기 `buddy` 2 포함, p.23 표 trace(10행 슬라이드 전사와 테스트로 일치 확인)
- [x] 주소 용어(논리/상대/물리주소) 구분 — mcq/ox (4문항)
- [x] 기본 페이징(프레임/페이지, 페이지 테이블 구조) — mcq/blank (6문항)
- [x] ⭐ 주소 변환(페이지 테이블 기준 논리↔물리, 선형탐색 속도 차이) — **최소 6~10문항**, §6-1 생성기 연동 calc/trace (10문항) — 생성기 `paging` 2 포함. "선형 탐색이라 느림"은 슬라이드 문장이 없어 해설에 (보충)
- [x] 페이지 크기 2^k 비트 슬라이싱(상위/하위 비트 분해) — calc/blank (5문항)
- [x] 기본 세그먼테이션(세그먼트 테이블=길이+시작주소, 보호 트랩) — §6-2 생성기 연동 calc/mcq/ox (9문항) — 생성기 `segmentation` 1 포함, Figure 7.12(p.40) 비트 예제

### Ch08. 가상 메모리 (목표 ≥ 120문항 → 작성 138 = 정적 134 + 생성기 4, ⭐ 71)

- [x] 가상메모리 개념(실제메모리 vs 가상메모리), MMU 역할 — mcq/ox/blank (4문항)
- [x] ⭐ 페이지 폴트 처리 과정(p.5-6, Resident set→폴트→인터럽트 핸들러→디스크 I/O→재실행) — **최소 6~10문항**, order/blank/mcq (9문항)
- [x] ⭐ 지역성의 원리(Locality) — **최소 6~10문항**, blank(한 단어)/mcq/ox (7문항)
- [x] 가상메모리 HW/OS 지원 역할 분담 — mcq/blank (2문항)
- [x] 페이지 테이블 엔트리 제어비트(P/M/Use/Protection/Lock), 32비트 엔트리 비트분해 — mcq/calc/blank (6문항 — 32비트 엔트리 비트 분해는 calc 대신 pte-006 해설(20비트 프레임 번호, p.47 필기)로 다룸)
- [x] 2단계 페이지 테이블(§6-8 계산: 4GB/4KB→100만 엔트리→4MB→재귀 테이블) — calc (4문항 + 생성기 memory-capacity 2)
- [x] 역 페이지 테이블(PowerPC/UltraSPARC/IA-64, 프레임당 엔트리, 해시+chain pointer) — mcq/blank/order (5문항)
- [x] ⭐ TLB 주소변환 과정(TLB 검사→히트/미스→페이지테이블→폴트 분기) — **최소 6~10문항**, order/mcq/calc(메모리 접근 횟수 비교) (10문항 — tlb-009가 TLB 히트 / 미스·페이지 테이블 히트 / 페이지 폴트별 메모리·디스크 접근 비교(match))
- [x] ⭐ 페이지 크기 vs 폴트율 그래프(내부단편화↓/테이블크기↑, 올라갔다 내려가는 곡선) + 프레임 수 vs 폴트율(knee) — **최소 6~10문항**, graph/blank(↑↓)/mcq/ox, 두 그래프 x축 구분 문제 포함 (10문항 (graph 2))
- [x] 워킹 셋(W(t,Δ)) 정의 및 계산 — blank/calc (6문항 — W(t,Δ) 계산은 lib/sim/os/workingSet.ts)
- [x] ⭐ 스래싱과 부하 제어(곡선/최적 멀티프로그래밍 수준) — **최소 6~10문항**, graph/mcq/ox (10문항 (graph 1))
- [x] 가상메모리 세그먼테이션, 페이징+세그먼테이션 결합 — mcq/blank (5문항)
- [x] 정책 분류(반입/배치/교체/청소/상주집합관리/부하제어) 전체 나열 — blank/match (1문항 — 정책을 한 장에 모은 슬라이드가 없어 정책별 첫 정의를 match 1문항으로)
- [x] ⭐ 반입 정책(Demand Paging vs Prepaging) — **최소 6~10문항**, match/mcq/ox/blank (9문항)
- [x] 배치 정책(페이징=중요X vs 세그먼테이션=중요) — mcq/ox (3문항)
- [x] 교체 정책 개념(미래 참조 가능성 예측) — mcq/blank (3문항)
- [x] 프레임 잠금(Lock bit, 대상: 커널/제어구조체/IO버퍼) — mcq/match (4문항)
- [x] ⭐ 기본 교체 알고리즘(Optimal/LRU/FIFO/LFU·MFU/Clock) 특징·성능 비교 + §6-6 생성기 연동 trace(빈 칸 채우기, pointer 이동, 두 바퀴째 교체 등) — **최소 6~10문항**, trace/mcq/calc/match (20문항 = ⭐ 교체 알고리즘 10(Figure 8.15 trace 4 + 생성기 2) + ⭐ Clock 정책 동작 6(Figure 8.16, p.48 "시험"·p.50 필기) + LFU/MFU·비교 4(출제 표시 없음, Figure 8.17 graph))
- [x] 개선된 클럭(Enhanced Clock, u/m 4분류, 1차/2차 스캔) — mcq/trace/calc (5문항 — trace 1(simulateEnhancedClock) + 다음 교체 대상 mcq 1(enhancedClockVictim))
- [x] 청소 정책(Demand Cleaning vs Precleaning) — match/mcq/ox (4문항)
- [x] 페이지 버퍼링(free list/modified list, reclaim) — mcq/blank (난이도 낮게, 문항 수 적게 — 교수님 코멘트 반영) (2문항(난이도 1))
- [x] 상주 집합 관리(고정/가변 할당 × 지역/전역 교체, 고정+전역 불가능) — classify/match/mcq (5문항)

## 공통 체크

- [ ] 유형 비율이 대략 mcq25/multi10/ox15/blank20/order8/match7/classify5/calc5/trace3/graph2(%)에 근접하는지 챕터별로 확인
- [ ] 같은 문장 복붙 수준의 저품질 중복 문제 없는지 검수
- [ ] 모든 해설에 (1)정답 근거 (2)오답이 틀린 이유 (3)`slideRef` 포함 확인
- [ ] 빈칸 정답 `accept` 배열에 한/영 표기 변형 포함 확인
- [ ] 슬라이드에 없는 보충 설명은 해설에 "(보충)" 표시했는지 확인

> 공통 체크는 모든 챕터가 끝나는 Sprint 11에서 일괄 체크한다. 지금까지의 점검 결과:
> - **Ch02(59)**: mcq 18 · ox 12 · blank 10 · calc 7 · multi 4 · match 3 · order 3 · classify 2. **Ch03(95)**: mcq 32 · ox 22 · blank 16 · match 7 · order 7 · multi 6 · classify 5. 합계 154: mcq 32.5% · ox 22.1% · blank 16.9%(2026-10-05 blank 11문항 추가로 10.6%에서 보정). mcq·ox는 여전히 가이드(25%·15%)보다 많다 — Ch07·08(Sprint 6)에서 계산·trace 비중으로 전체 비율을 맞춘다.
> - 문제 내 보기·순서 항목·짝 중복 없음, 정답 키 채점 = 1점, 렌더링 오류 없음 — `data/subjects/integrity.test.ts`, `components/qtypes/render.test.ts`로 자동 검사(전 과목·전 챕터).
> - 챕터 안에서 문제 본문+보기가 완전히 같은 문항 0건(스크립트 점검). 해설은 슬라이드 근거만 사용해 "(보충)" 표시 대상 없음.
> - **Ch07(89)**: mcq 23 · blank 18 · ox 14 · calc 14 · multi 5 · match 5 · classify 4 · trace 4 · order 2 — blank 20.2%, mcq 25.8%, ox 15.7%로 처음부터 비율 기준(blank 18~22%, mcq ≤30%, ox ≤18%, trace ≥3) 안에서 작성. 대조 기록 [`verification/os-ch07.md`](./verification/os-ch07.md).
> - **Ch08(138)**: mcq 32 · blank 28 · ox 23 · match 10 · multi 9 · classify 9 · calc 9 · order 7 · trace 7 · graph 4 — blank 20.3%, mcq 23.2%, ox 16.7%. 대조 기록 [`verification/os-ch08.md`](./verification/os-ch08.md).
> - **OS 전체 4챕터**: 381문항(Ch02 59 · Ch03 95 · Ch07 89 · Ch08 138, 생성기 문항 11 포함). Ch02·03의 mcq·ox 과다는 Ch07·08을 처음부터 비율 안에서 써서 전체로 보정.
> - 문항별 PDF 대조 기록: [`verification/os-ch02-ch03.md`](./verification/os-ch02-ch03.md) (154문항: 기존 일치 126 · 수정 15 · 신규 13(그중 수정 7) · 필기 근거 31 — blank 정답 유일성 점검 반영).

## 과목 2 — 데이터 통신 (data-comm)

근거: [`dc-source-analysis.md`](./dc-source-analysis.md). ⭐ 3개 — `examBasis`는 모두 `printed-emphasis`(슬라이드에 인쇄된 "very important", 필기 아님). 근거 구분은 항목마다 적었다. s.41 "important"는 ⭐ 제외. Sprint 10에서 체크하고 실제 문항 수를 괄호에 기록한다.

### Ch01. 개요 (목표 ≥ 57문항)

- [ ] 데이터·데이터 통신 정의, 4가지 특성(전달·정확성·적시성·지터) — mcq/multi/blank · s.2 · 목표 3
- [ ] 5가지 구성 요소, 프로토콜 정의 — mcq/multi/blank · s.3 · 목표 3
- [ ] 데이터 표현(유니코드 32비트, ASCII 7비트·128자, 확장 ASCII 8비트, 픽셀) — mcq/ox/blank · s.4 · 목표 3
- [ ] 데이터 흐름: 단방향·반이중·전이중 — mcq/match/graph · s.5 · 목표 3
- [ ] 네트워크 정의·장치, 네트워크 기준(성능·신뢰성·보안) — mcq/multi · s.6 · 목표 2
- [ ] 연결 유형: 점대점·다중점 — mcq/graph · s.7 · 목표 2
- [ ] 물리 토폴로지 4종(메시·스타·버스·링)과 구성품 — mcq/ox/match/graph · s.8-12 · 목표 4
- [ ] LAN(범위, 주소·IP, 과거 공용 케이블 vs 현재 스위치) — mcq/ox/blank · s.13-14 · 목표 3
- [ ] WAN, LAN과의 차이, 점대점·교환 WAN — mcq/ox/classify/graph · s.15-17 · 목표 4
- [ ] 인터네트워크, internet vs Internet, 오늘날 인터넷 구조 — mcq/ox/blank · s.18-21 · 목표 3
- [ ] 인터넷 접속 4가지(다이얼업·DSL·케이블·무선·직접 연결) — mcq/multi/ox/classify · s.22-25 · 목표 4
- [ ] 프로토콜 계층화 필요성, 1계층·3계층 프로토콜 예 — mcq/ox/match · s.26-28 · 목표 3
- [ ] 계층화 2원칙, 논리적 연결 — mcq/ox/blank · s.29-31 · 목표 3
- [ ] TCP/IP 5계층 순서, 계층적 구조, 장비별 관여 계층 — mcq/blank/order/classify · s.32-35 · 목표 4
- [ ] 계층별 동일 객체(메시지·세그먼트·데이터그램·프레임·비트) — mcq/blank/match · s.36 · 목표 3
- [ ] 계층별 역할과 헤더(H2/T2, H3, H4) — mcq/ox/blank/match · s.37-41 · 목표 4
- [ ] OSI 모델(ISO vs OSI, 1970년대 후반), 7계층 — mcq/ox/order · s.42-43 · 목표 3
- [ ] TCP/IP vs OSI 대응(응용 = 응용+표현+세션) — mcq/blank/classify · s.43-44 · 목표 3

### Ch02. 물리 계층 (목표 ≥ 106문항)

- [ ] 물리 계층 역할 — mcq/ox · s.2-3 · 목표 2
- [ ] 아날로그·디지털 데이터와 신호 — mcq/classify/graph · s.4-6 · 목표 3
- [ ] 주기 신호(단순/복합), 사인파 3요소, 주파수·주기 — mcq/blank/calc/graph · s.7-10 · 목표 4
- [ ] 위상(도·라디안) — mcq/calc/graph · s.11-12 · 목표 3
- [ ] 파장(λ = c/f) — mcq/blank/calc · s.13 · 목표 3
- [ ] 시간/주파수 영역, 복합 신호, 대역폭 — mcq/ox/calc/graph · s.14-17 · 목표 4
- [ ] 디지털 신호: 레벨·r, 비트율, 비트 길이 — mcq/calc/graph · s.18-21 · 목표 4
- [ ] 기저대역 vs 광대역(변조) — mcq/ox · s.22-23 · 목표 2
- [ ] 전송 장애 3원인, 감쇠·증폭(dB) — mcq/multi/ox/calc · s.24-27 · 목표 4
- [ ] 왜곡, 잡음 4종 — mcq/match/graph · s.28-29 · 목표 3
- [ ] SNR / SNR_dB — ox/calc/graph · s.30-32 · 목표 3
- [ ] ⭐ (printed-emphasis · 인쇄 강조 직접(s.33)) 데이터 전송률 한계 3요소, Nyquist 비트율 — mcq/multi/blank/calc/trace/graph · s.33-35 · 목표 8 — **최소 6~10문항**
- [ ] ⭐ (printed-emphasis · s.33 인쇄 강조의 범위 확장(s.36~40에는 강조 문구 없음)) Shannon 용량, 두 한계 함께 쓰기 — mcq/multi/ox/blank/calc/trace · s.36-40 · 목표 8 — **최소 6~10문항**
- [ ] 성능 지표 5종, 대역폭 두 의미, 처리량 — mcq/multi/ox/calc · s.41-45 · 목표 4
- [ ] 지연(4요소, 전파·전송 시간) — multi/blank/calc · s.46-47 · 목표 4
- [ ] ⭐ (printed-emphasis · 인쇄 강조 직접(s.48)) 대역폭-지연 곱, 지터 — mcq/ox/blank/calc/trace/graph · s.48-52 · 목표 8 — **최소 6~10문항**
- [ ] 디지털→디지털 변환, 블록 코딩 mB/nB — mcq/blank/order · s.53-57 · 목표 3
- [ ] PCM 3과정, Nyquist 표본화율 — mcq/blank/order/calc · s.58-62 · 목표 4
- [ ] 델타 변조(PCM과 비교, 구성요소) — mcq/match · s.63-66 · 목표 2
- [ ] 디지털→아날로그 분류, 비트율 vs 보오율 — mcq/classify/calc · s.67-68 · 목표 3
- [ ] BASK·BFSK·BPSK 대역폭·구현, 성상도, QAM — mcq/match/calc/graph · s.69-76 · 목표 4
- [ ] 아날로그→아날로그: AM·FM·PM 대역폭, 대역 할당 — mcq/match/calc/graph · s.77-80 · 목표 4
- [ ] 다중화 개념·분류, FDM과 보호 대역 — mcq/blank/classify/calc · s.81-87 · 목표 4
- [ ] WDM, TDM·동기식 TDM — mcq/calc/trace · s.88-90 · 목표 3
- [ ] 전송 매체 분류(유도/비유도), 꼬임쌍선(UTP/STP) — mcq/ox/classify/graph · s.91-94 · 목표 4
- [ ] 동축 케이블, 광섬유(임계각·클래딩) — mcq/ox/blank/graph · s.95-98 · 목표 4
- [ ] 무선: 전파·마이크로파·적외선 — mcq/ox/match/classify · s.99-101 · 목표 4

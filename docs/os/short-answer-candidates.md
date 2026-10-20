# OS 단답형 보강 — 후보와 중복 판정

시험 범위 Ch02·03·07·08·09(Ch04 스레드 제외)의 강의자료(`source/os/*.pdf`, pdftotext로 장별 1회 추출)에서 단답(1~3단어 또는 숫자)으로 묻기 좋은 지점을 뽑았다. 문항: `data/subjects/os/shortAnswer.ts`, 검증: `shortAnswer.test.ts`.

## 판정 규칙

- **중복**: 기존 OS 문항(blank·용어 단답형 포함, 모든 유형)의 지문·보기·짝·순서 항목·인정 답안에 후보 정답이 같은 사실로 이미 나오면 만들지 않고 아래 "중복으로 건너뜀"에 그 ID를 적었다(해설에만 나오는 경우는 중복으로 보지 않음).
- **용어형·목록형**: 정답 문자열이 슬라이드 추출 텍스트에 실제로 있는지 확인했다(짧은 답은 앞뒤 구절까지) — 33개 모두 확인됨. 공식형 1개(`os-ch09-short-010`, RQ3 quantum = 2^3 = 8)는 공식 2^i가 Ch09 p.24-25에 있음을 확인했다.
- **계산형**: 정답은 `lib/sim/os` 함수로 계산하고, 테스트가 같은 함수로 따로 다시 계산해 비교한다(37개 전부).
- **제외**: 교수님 족보 채점과 이론이 갈리는 유효 CPU 이용률 계산은 만들지 않았다.

## 장별 × 유형 문항 수

| 장 | 용어 | 계산 | 공식·목록 | 합계 |
|---|---|---|---|---|
| ch02 | 1 | 5 | 2 | 8 |
| ch03 | 10 | 0 | 4 | 14 |
| ch07 | 0 | 12 | 3 | 15 |
| ch08 | 6 | 11 | 0 | 17 |
| ch09 | 7 | 9 | 1 | 17 |
| 합계 | 24 | 37 | 10 | 71 |

요청 비율(용어 50% / 계산 35% / 공식·목록 15%)과 다른 이유: 기존 OS 문항 776개(용어 단답형 142개 포함)이 슬라이드의 정의·구성요소를 거의 다 묻고 있어, 중복을 빼면 새 용어형 후보가 부족했다. 대신 기존과 다른 수치의 계산형으로 채웠다. Ch02는 남은 후보가 적어 8개다.

## 채택 (71개)

| 장 | 슬라이드 페이지 | 유형 | 정답 | 중복 | 문항 ID |
|---|---|---|---|---|---|
| ch02 | p.22-23 | 계산 | 14.26 | 없음 | `os-ch02-short-001` |
| ch02 | p.22-23 | 계산 | 0.96 | 없음 | `os-ch02-short-002` |
| ch02 | p.22-23 | 계산 | 12.45 | 없음 | `os-ch02-short-003` |
| ch02 | p.22-23 | 계산 | 1.25 | 없음 | `os-ch02-short-004` |
| ch02 | p.24 | 계산 | 160 | 없음 | `os-ch02-short-005` |
| ch02 | p.15 | 용어 | I/O | 없음 | `os-ch02-short-006` |
| ch02 | p.11 | 공식·목록 | 윈도우 관리 | 없음 | `os-ch02-short-007` |
| ch02 | p.9 | 공식·목록 | GPU | 없음 | `os-ch02-short-008` |
| ch03 | p.31 | 용어 | 후입선출 | 없음 | `os-ch03-short-001` |
| ch03 | p.34 | 용어 | 프로세스 권한 | 없음 | `os-ch03-short-002` |
| ch03 | p.34 | 용어 | 프로세스 간 통신 | 없음 | `os-ch03-short-003` |
| ch03 | p.33 | 용어 | 데이터 구조화 | 없음 | `os-ch03-short-004` |
| ch03 | p.35 | 용어 | 메모리 관리 | 없음 | `os-ch03-short-005` |
| ch03 | p.35 | 용어 | 자원 소유 및 사용 | 없음 | `os-ch03-short-006` |
| ch03 | p.32 | 용어 | 이벤트 | 없음 | `os-ch03-short-007` |
| ch03 | p.32 | 공식·목록 | halted | 없음 | `os-ch03-short-008` |
| ch03 | p.32 | 공식·목록 | 최대허용값 | 없음 | `os-ch03-short-009` |
| ch03 | p.36 | 용어 | 제어 | 없음 | `os-ch03-short-010` |
| ch03 | p.37 | 공식·목록 | 식별자 | 없음 | `os-ch03-short-011` |
| ch03 | p.14 | 용어 | 네트워크 인터럽트 | 없음 | `os-ch03-short-012` |
| ch03 | p.28 | 용어 | RISC | 없음 | `os-ch03-short-013` |
| ch03 | p.34 | 공식·목록 | 시그널 | 없음 | `os-ch03-short-014` |
| ch07 | p.34 | 계산 | 8196 | 없음 | `os-ch07-short-001` |
| ch07 | p.35 | 계산 | 1034 | 없음 | `os-ch07-short-002` |
| ch07 | p.36 | 계산 | 6 | 없음 | `os-ch07-short-003` |
| ch07 | p.37 | 계산 | 6 | 없음 | `os-ch07-short-004` |
| ch07 | p.37 | 계산 | 5 | 없음 | `os-ch07-short-005` |
| ch07 | p.41 | 계산 | 1276 | 없음 | `os-ch07-short-006` |
| ch07 | p.41 | 계산 | 4096 | 없음 | `os-ch07-short-007` |
| ch07 | p.7 | 계산 | 28096 | 없음 | `os-ch07-short-008` |
| ch07 | p.21-23 | 계산 | 512 | 없음 | `os-ch07-short-009` |
| ch07 | p.21, p.23 | 계산 | 212 | 없음 | `os-ch07-short-010` |
| ch07 | p.16 | 계산 | D | 없음 | `os-ch07-short-011` |
| ch07 | p.18, p.20 | 계산 | C | 없음 | `os-ch07-short-012` |
| ch07 | p.9 | 공식·목록 | execute-only | 없음 | `os-ch07-short-013` |
| ch07 | p.38 | 공식·목록 | 스택 | 없음 | `os-ch07-short-014` |
| ch07 | p.8 | 공식·목록 | 데이터 | 없음 | `os-ch07-short-015` |
| ch08 | p.44, p.48 | 계산 | 6 | 없음 | `os-ch08-short-001` |
| ch08 | p.45, p.48 | 계산 | 7 | 없음 | `os-ch08-short-002` |
| ch08 | p.43, p.48 | 계산 | 4 | 없음 | `os-ch08-short-003` |
| ch08 | p.47-48 | 계산 | 6 | 없음 | `os-ch08-short-004` |
| ch08 | p.47, p.49-50 | 계산 | 1 | 없음 | `os-ch08-short-005` |
| ch08 | p.60 | 계산 | 3 | 없음 | `os-ch08-short-006` |
| ch08 | p.14 | 계산 | 2 | 없음 | `os-ch08-short-007` |
| ch08 | p.14 | 계산 | 2048 | 없음 | `os-ch08-short-008` |
| ch08 | p.17-18 | 계산 | 2097152 | 없음 | `os-ch08-short-009` |
| ch08 | p.52-53 | 계산 | 2 | 없음 | `os-ch08-short-010` |
| ch08 | p.11 | 계산 | 13 | 없음 | `os-ch08-short-011` |
| ch08 | p.46 | 용어 | 에이징 | 없음 | `os-ch08-short-012` |
| ch08 | p.44, p.46 | 용어 | LRU | 없음 | `os-ch08-short-013` |
| ch08 | p.45 | 용어 | 라운드 로빈 | 없음 | `os-ch08-short-014` |
| ch08 | p.42 | 용어 | Protection bit | 없음 | `os-ch08-short-015` |
| ch08 | p.15 | 용어 | 가상 메모리 | 없음 | `os-ch08-short-016` |
| ch08 | p.56-57 | 용어 | 일괄 | 없음 | `os-ch08-short-017` |
| ch09 | p.11, p.26-27 | 계산 | 7.2 | 없음 | `os-ch09-short-001` |
| ch09 | p.13 | 계산 | 14 | 없음 | `os-ch09-short-002` |
| ch09 | p.19, p.26 | 계산 | 8 | 없음 | `os-ch09-short-003` |
| ch09 | p.21, p.26 | 계산 | 8 | 없음 | `os-ch09-short-004` |
| ch09 | p.22 | 계산 | B | 없음 | `os-ch09-short-005` |
| ch09 | p.22 | 계산 | 2.5 | 없음 | `os-ch09-short-006` |
| ch09 | p.18 | 계산 | 7.312 | 없음 | `os-ch09-short-007` |
| ch09 | p.26 | 계산 | 3 | 없음 | `os-ch09-short-008` |
| ch09 | p.23-25 | 계산 | 8 | 없음 | `os-ch09-short-009` |
| ch09 | p.24-25 | 공식·목록 | 8 | 없음 | `os-ch09-short-010` |
| ch09 | p.15 | 용어 | 타임 슬라이싱 | 없음 | `os-ch09-short-011` |
| ch09 | p.18 | 용어 | I/O burst | 없음 | `os-ch09-short-012` |
| ch09 | p.18 | 용어 | 단순 평균 | 없음 | `os-ch09-short-013` |
| ch09 | p.2 | 용어 | 스케줄링 알고리즘 | 없음 | `os-ch09-short-014` |
| ch09 | p.23 | 용어 | 승격 | 없음 | `os-ch09-short-015` |
| ch09 | p.12 | 용어 | 도착 순서 | 없음 | `os-ch09-short-016` |
| ch09 | p.26 | 용어 | 공정성 | 없음 | `os-ch09-short-017` |

## 중복으로 건너뜀 (49개) · 제외 (1개)

| 장 | 슬라이드 페이지 | 유형 | 정답 | 중복(기존 ID) |
|---|---|---|---|---|
| ch02 | p.13 | 용어 | 콘솔 | `os-ch02-history-003` |
| ch02 | p.13 | 용어 | 셋업 시간 | `os-ch02-history-003` |
| ch02 | p.5 | 공식·목록 | 파일 접근 제어 | `os-ch02-hint-service-001` |
| ch02 | p.5 | 공식·목록 | I/O 장치 접근 | `os-ch02-os-service-002` |
| ch02 | p.5 | 공식·목록 | 시스템 접근 | `os-ch02-hint-service-002` |
| ch02 | p.6 | 공식·목록 | 소프트웨어 오류 | `os-ch02-not-supported-006` |
| ch02 | p.25 | 공식·목록 | 가용성(SMP 장점) | `os-ch02-smp-002` |
| ch02 | p.25 | 공식·목록 | 점진적 확장(SMP 장점) | `os-ch02-smp-002` |
| ch02 | p.25 | 용어 | 캐시(멀티코어) | `os-ch02-smp-001` |
| ch02 | p.9 | 공식·목록 | 하드웨어 업그레이드 | `os-ch02-evolve-001` |
| ch02 | p.9 | 용어 | GUI | `os-ch02-evolve-001` |
| ch02 | p.9 | 공식·목록 | 오류 수정(Fixes) | `os-ch02-evolve-001` |
| ch02 | p.12 | 용어 | 사용자 프로그램 버퍼 | `os-ch02-io-001` |
| ch02 | p.12 | 용어 | 버퍼(가득 찬 경우만 출력 대기) | `os-ch02-io-003` |
| ch02 | p.20 | 용어 | time slice | `os-ch02-batch-switch-004` |
| ch02 | p.24 | 용어 | scheduler() | `os-ch02-time-calc-011` |
| ch02 | p.21·24 | 계산 | 유효 CPU 이용률 | 제외(교수님 족보 채점과 이론이 갈림 — ch02-jokbo-010) |
| ch03 | p.3 | 용어 | pstree | `os-ch03-creation-003` |
| ch03 | p.3 | 공식·목록 | 대화형 세션(생성 사유) | `os-ch03-creation-001` |
| ch03 | p.14 | 용어 | unlock(s) | `os-ch03-wait-event-002` |
| ch03 | p.14 | 용어 | 키보드 인터럽트(scanf·GetMessage) | `os-ch03-wait-event-001` |
| ch03 | p.19 | 공식·목록 | 타이머 대기 큐 | `os-ch03-wait-event-004` |
| ch03 | p.20 | 용어 | swap 영역 | `os-ch03-suspend-005` |
| ch03 | p.24 | 용어 | block started by symbol | `os-ch03-image-005` |
| ch03 | p.24 | 용어 | 읽기 전용(Text segment) | `os-ch03-image-003` |
| ch03 | p.26 | 공식·목록 | 그룹 ID | `os-ch03-hint-pcb-001` |
| ch03 | p.29 | 공식·목록 | 실행 모드(PSW) | `os-ch03-hint-pcb-003` |
| ch03 | p.31 | 용어 | 최상단(SP) | `os-ch03-stack-007` |
| ch03 | p.44 | 용어 | return; | `os-ch03-resume-001` |
| ch03 | p.5 | 용어 | 프로세스 구조체 | `os-ch03-process-def-007` |
| ch07 | p.6 | 용어 | 실행 시점(run time) | `os-ch07-protection-001` |
| ch07 | p.7 | 용어 | limit 레지스터 | `os-ch07-protection-004` |
| ch07 | p.8 | 용어 | 프로그램 코드(PowerPoint) | `os-ch07-sharing-001` |
| ch07 | p.10 | 용어 | 임베디드(오버레이 잔존) | `os-ch07-physical-org-004` |
| ch07 | p.18 | 용어 | 마지막으로 배치한 위치(Next-fit) | `os-ch07-placement-001` |
| ch07 | p.37 | 용어 | 비트 슬라이싱 | `os-ch07-bit-slice-004` |
| ch08 | p.19 | 용어 | Translation Lookaside Buffer | `os-ch08-tlb-005` |
| ch08 | p.45 | 용어 | 원형 버퍼(FIFO) | `os-ch08-term-019` |
| ch08 | p.46 | 용어 | MFU 논리(방금 들어온 페이지) | `os-ch08-term-018` |
| ch08 | p.55 | 용어 | dirty(수정된 페이지) | `os-ch08-pte-003` |
| ch08 | p.57 | 용어 | 회수(reclaim) | `os-ch08-term-027` |
| ch08 | p.17 | 공식·목록 | Chain pointer | `os-ch08-inverted-001` |
| ch08 | p.58 | 공식·목록 | 균등·비례 배분 | `os-ch08-resident-set-002` |
| ch09 | p.3 | 용어 | Admission(장기 스케줄링) | `os-ch09-level-002` |
| ch09 | p.15 | 용어 | 평균 CPU 버스트보다 약간 크게 | `os-ch09-rr-001` |
| ch09 | p.17 | 용어 | 보조 큐(VRR) | `os-ch09-vrr-001` |
| ch09 | p.21 | 용어 | SPN의 선점형 버전 | `os-ch09-srt-001` |
| ch09 | p.21 | 공식·목록 | s − e | `os-ch09-term-015` |
| ch09 | p.23 | 용어 | 불이익(Feedback) | `os-ch09-feedback-001` |
| ch09 | p.26 | 공식·목록 | 정규화 반환시간 최소 1 | `os-ch09-term-019` |

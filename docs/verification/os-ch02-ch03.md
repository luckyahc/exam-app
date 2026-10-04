# 문항별 PDF 대조 기록 — 운영체제 Ch02·Ch03

작성: 2026-10-05. 각 문항의 정답·해설을 `slideRef` 페이지의 PDF 원문(인쇄 본문 + 필기)과 대조한 결과다. 손글씨·도형은 pdftoppm으로 렌더링한 이미지로 확인했다.

- **근거**: `인쇄` = 슬라이드 인쇄 본문만으로 정답이 정해짐 / `p.N 필기(…)` = 정답 판정에 교수님 필기가 필요하거나 정답 문장이 필기를 옮긴 것. **문항을 하나씩 확인해 분류**했다(해설에 '필기'라는 단어가 있어도 인쇄만으로 정답이 정해지면 `인쇄`). ⭐ 표시 자체의 근거(필기 "시험")는 ⭐ 열로 따로 표시.
- **대조 결과**: `일치` = 수정 없음 / `수정` = 대조 후 고침(정답 변경 없음) / `신규·일치`·`신규·수정` = Sprint 5 보강 때 추가한 문항
- **[1차]** = 2026-10-05 PDF 대조 점검, **[2차]** = 같은 날 blank 정답 유일성·표기 변형 점검(blank 26문항 전수)
- 계산 문항(calc)의 정답은 `lib/sim/os/cpuTime.ts`가 계산하고, 슬라이드 예제 값(p.23 ≈ 9.2초·≈ 1.1초, p.24 ≈ 0.91·≈ 0.99)과 같은지 확인했다.

## 요약

| 구분 | 문항 수 |
|---|---|
| 전체 | 154 (Ch02 59 + Ch03 95) |
| 기존 문항 일치 | 126 |
| 기존 문항 수정 | 15 |
| 신규 문항 일치 | 6 |
| 신규 문항 수정 | 7 |
| 필기 근거(문항별 확인) | 31 (Ch02 13 + Ch03 18) |

> 이전 기록의 "필기 근거 41"은 해설에 '필기'라는 단어가 있는지로 센 값이라 과다 집계였다. 문항별 확인 결과는 위 숫자다.

## 출제 보류·맥락 구분

- '잘못된 명령(invalid instruction)': 종료 사유 맥락(Ch03 p.4)은 출제 보류(인쇄=종료 사유 목록, 필기="운영체제가 죽이진 않고 보통 프로그램이 에러메시지를 줌"). Process switch 맥락(p.42 Illegal instruction → Trap → Exit)은 출제 — `os-ch03-process-switch-001·003·004·005`.
- Ch03 p.2 필기 문구 "각 프로세서의 정보를 담아놓는 구조체"는 판독 불확실로 재사용하지 않음.

## Ch02 (source/os/Ch02 OS Overview.pdf) — 59문항

| # | id | slideRef | ⭐ | 근거 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|
| 1 | `os-ch02-os-goal-001` | Ch02 p.2 |  | 인쇄 | 일치 |  |
| 2 | `os-ch02-os-goal-002` | Ch02 p.3 |  | 인쇄 | 일치 |  |
| 3 | `os-ch02-os-goal-003` | Ch02 p.3 |  | 인쇄 | 일치 |  |
| 4 | `os-ch02-os-goal-004` | Ch02 p.3 |  | 인쇄 | 일치 |  |
| 5 | `os-ch02-os-service-001` | Ch02 p.5 |  | 인쇄 | 수정 | [2차] accept 보강 |
| 6 | `os-ch02-os-service-002` | Ch02 p.5 |  | 인쇄 | 일치 |  |
| 7 | `os-ch02-os-service-003` | Ch02 p.5 |  | 인쇄 | 일치 |  |
| 8 | `os-ch02-not-supported-001` | Ch02 p.6 | ⭐ | p.6 필기(바이러스·AI·DB 체킹) | 일치 |  |
| 9 | `os-ch02-not-supported-002` | Ch02 p.6 | ⭐ | p.6 필기 | 일치 |  |
| 10 | `os-ch02-not-supported-003` | Ch02 p.6 | ⭐ | p.6 필기 | 일치 |  |
| 11 | `os-ch02-not-supported-004` | Ch02 p.5-6 | ⭐ | p.6 필기 | 일치 |  |
| 12 | `os-ch02-not-supported-005` | Ch02 p.6 | ⭐ | p.6 필기 | 일치 |  |
| 13 | `os-ch02-not-supported-006` | Ch02 p.6 | ⭐ | 인쇄 | 일치 |  |
| 14 | `os-ch02-not-supported-007` | Ch02 p.6 | ⭐ | 인쇄 | 일치 |  |
| 15 | `os-ch02-not-supported-008` | Ch02 p.6 | ⭐ | 인쇄 | 수정 | [1차] 해설: '허용할 수 없는 응용 프로그램의 요청'을 소프트웨어 오류 아래에 넣었던 것을 p.6 계층대로 별도 항목으로 정정 |
| 16 | `os-ch02-resource-001` | Ch02 p.7 |  | p.7 필기(디바이스 드라이버 정의) | 일치 |  |
| 17 | `os-ch02-resource-002` | Ch02 p.7 |  | 인쇄 | 일치 |  |
| 18 | `os-ch02-resource-003` | Ch02 p.7 |  | 인쇄 | 일치 |  |
| 19 | `os-ch02-resource-004` | Ch02 p.7 |  | p.7 필기(IO디바이스: 타이머 빼고) | 신규·수정 | [2차] 지문: p.7 자원 목록을 지문에 넣고 'CPU, 메모리, 그리고 ___ 하나뿐'으로 좁힘(답 = 타이머로 유일). 해설에 '교수님 필기 기준' 명시 |
| 20 | `os-ch02-evolve-001` | Ch02 p.9 |  | 인쇄 | 일치 |  |
| 21 | `os-ch02-evolve-002` | Ch02 p.9 |  | 인쇄 | 일치 |  |
| 22 | `os-ch02-evolve-003` | Ch02 p.9 |  | 인쇄 | 일치 |  |
| 23 | `os-ch02-kernel-001` | Ch02 p.10-11 |  | 인쇄 | 일치 |  |
| 24 | `os-ch02-kernel-002` | Ch02 p.10 |  | 인쇄 | 수정 | [2차] accept 보강 |
| 25 | `os-ch02-kernel-003` | Ch02 p.11 |  | 인쇄 | 일치 |  |
| 26 | `os-ch02-kernel-call-001` | Ch02 p.11 |  | 인쇄 | 일치 |  |
| 27 | `os-ch02-kernel-call-002` | Ch02 p.11 |  | p.11 필기(인터럽트 신호) | 일치 |  |
| 28 | `os-ch02-io-001` | Ch02 p.12 |  | 인쇄 | 일치 |  |
| 29 | `os-ch02-io-002` | Ch02 p.12 |  | p.12 필기(커널 버퍼≠사용자 버퍼) | 일치 |  |
| 30 | `os-ch02-io-003` | Ch02 p.12 |  | 인쇄 | 일치 |  |
| 31 | `os-ch02-io-004` | Ch02 p.12 |  | p.12 필기(SSD→USB→HDD) | 일치 |  |
| 32 | `os-ch02-history-001` | Ch02 p.13 |  | 인쇄 | 일치 |  |
| 33 | `os-ch02-history-002` | Ch02 p.13 |  | 인쇄 | 수정 | [2차] accept 보강 |
| 34 | `os-ch02-history-003` | Ch02 p.13 |  | 인쇄 | 일치 |  |
| 35 | `os-ch02-batch-switch-001` | Ch02 p.14, p.20 |  | 인쇄 | 일치 |  |
| 36 | `os-ch02-batch-switch-002` | Ch02 p.14 |  | 인쇄 | 일치 |  |
| 37 | `os-ch02-batch-switch-003` | Ch02 p.14 |  | 인쇄 | 일치 |  |
| 38 | `os-ch02-batch-switch-004` | Ch02 p.20 |  | 인쇄 | 신규·수정 | [2차] accept 보강 |
| 39 | `os-ch02-uniprog-001` | Ch02 p.17-18 |  | 인쇄 | 일치 |  |
| 40 | `os-ch02-uniprog-002` | Ch02 p.16 |  | 인쇄 | 일치 |  |
| 41 | `os-ch02-uniprog-003` | Ch02 p.17 |  | 인쇄 | 신규·수정 | [2차] accept 보강 |
| 42 | `os-ch02-time-calc-001` | Ch02 p.22-23 | ⭐ | 인쇄 | 일치 |  |
| 43 | `os-ch02-time-calc-002` | Ch02 p.22-23 | ⭐ | 인쇄 | 일치 |  |
| 44 | `os-ch02-time-calc-003` | Ch02 p.24 | ⭐ | 인쇄 | 일치 |  |
| 45 | `os-ch02-time-calc-004` | Ch02 p.24 | ⭐ | 인쇄 | 일치 |  |
| 46 | `os-ch02-time-calc-005` | Ch02 p.22-23 | ⭐ | 인쇄 | 일치 |  |
| 47 | `os-ch02-time-calc-006` | Ch02 p.22-23 | ⭐ | 인쇄 | 일치 |  |
| 48 | `os-ch02-time-calc-007` | Ch02 p.21 | ⭐ | 인쇄 | 일치 |  |
| 49 | `os-ch02-time-calc-008` | Ch02 p.21 | ⭐ | 인쇄 | 일치 |  |
| 50 | `os-ch02-time-calc-009` | Ch02 p.21-24 | ⭐ | 인쇄 | 일치 |  |
| 51 | `os-ch02-time-calc-010` | Ch02 p.21 | ⭐ | 인쇄 | 일치 |  |
| 52 | `os-ch02-time-calc-011` | Ch02 p.24 | ⭐ | 인쇄 | 신규·수정 | [2차] 지문: 'timer interrupt handler, ___ 등'(열린 목록)을 p.24 '타이머·___ 실행'으로 좁힘 |
| 53 | `os-ch02-time-calc-012` | Ch02 p.21, p.24 | ⭐ | p.24 필기(과거/오늘날) | 신규·일치 |  |
| 54 | `os-ch02-time-calc-013` | Ch02 p.24 | ⭐ | p.24 필기(스케줄링 복잡해짐) | 신규·일치 |  |
| 55 | `os-ch02-time-calc-014` | Ch02 p.21 | ⭐ | 인쇄 | 신규·수정 | [2차] accept 보강 |
| 56 | `os-ch02-smp-001` | Ch02 p.25 |  | 인쇄 | 일치 |  |
| 57 | `os-ch02-smp-002` | Ch02 p.25 |  | 인쇄 | 일치 |  |
| 58 | `os-ch02-smp-003` | Ch02 p.25 |  | p.25 필기(역할 다르면 대칭 아님) | 일치 |  |
| 59 | `os-ch02-smp-004` | Ch02 p.25 |  | 인쇄 | 신규·수정 | [2차] accept 보강(p.25에서 '오늘날 PC·스마트폰의 표준 구조'는 멀티코어 항목의 인쇄 하위 항목 — 답 유일 확인) |

## Ch03 (source/os/Ch03 Processes.pdf) — 95문항

| # | id | slideRef | ⭐ | 근거 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|
| 1 | `os-ch03-process-def-001` | Ch03 p.2 | ⭐ | p.2 필기(디스크 exe = 프로그램) | 일치 |  |
| 2 | `os-ch03-process-def-002` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 3 | `os-ch03-process-def-003` | Ch03 p.2 | ⭐ | p.2 필기(전역/지역변수) | 일치 |  |
| 4 | `os-ch03-process-def-004` | Ch03 p.2 | ⭐ | p.2 필기 | 일치 |  |
| 5 | `os-ch03-process-def-005` | Ch03 p.2 | ⭐ | p.2 필기(processor = CPU+제어장치 칩) | 일치 |  |
| 6 | `os-ch03-process-def-006` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 7 | `os-ch03-process-def-007` | Ch03 p.2 | ⭐ | 인쇄 | 수정 | [2차] accept 보강 |
| 8 | `os-ch03-process-def-008` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 9 | `os-ch03-creation-001` | Ch03 p.3 |  | 인쇄 | 일치 |  |
| 10 | `os-ch03-creation-002` | Ch03 p.3 |  | 인쇄 | 수정 | [2차] accept 보강(PID 1) |
| 11 | `os-ch03-creation-003` | Ch03 p.3 |  | 인쇄 | 일치 |  |
| 12 | `os-ch03-termination-001` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 13 | `os-ch03-termination-002` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 14 | `os-ch03-termination-003` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 15 | `os-ch03-termination-004` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 16 | `os-ch03-termination-005` | Ch03 p.4 | ⭐ | p.4 필기(0으로 나누기) | 일치 |  |
| 17 | `os-ch03-termination-006` | Ch03 p.4 | ⭐ | p.4 필기(I/O 실패) | 일치 |  |
| 18 | `os-ch03-termination-007` | Ch03 p.4 | ⭐ | p.4 필기(오버플로우) | 일치 |  |
| 19 | `os-ch03-termination-008` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 20 | `os-ch03-termination-009` | Ch03 p.4 | ⭐ | 인쇄 | 수정 | [2차] accept 보강 |
| 21 | `os-ch03-termination-010` | Ch03 p.4 | ⭐ | p.4 필기(결론 문장) | 일치 |  |
| 22 | `os-ch03-pcb-001` | Ch03 p.26 |  | 인쇄 | 일치 |  |
| 23 | `os-ch03-pcb-002` | Ch03 p.5 |  | 인쇄 | 일치 |  |
| 24 | `os-ch03-pcb-003` | Ch03 p.6, p.19 |  | 인쇄 | 수정 | [2차] accept 보강 |
| 25 | `os-ch03-pcb-004` | Ch03 p.18 |  | p.18 필기(큐에는 구조체만) | 일치 |  |
| 26 | `os-ch03-context-001` | Ch03 p.29, p.31 |  | 인쇄 | 일치 |  |
| 27 | `os-ch03-context-002` | Ch03 p.28 |  | 인쇄 | 일치 |  |
| 28 | `os-ch03-context-003` | Ch03 p.7, p.29 |  | 인쇄 | 수정 | [2차] 지문: '전환하는 것'은 process switch(p.40)와 겹쳐 답이 둘 → '전환하는 일을 맡는 구성 요소'로 좁힘. accept에서 동작명 dispatch/디스패치 제외 |
| 29 | `os-ch03-image-001` | Ch03 p.23 |  | 인쇄 | 일치 |  |
| 30 | `os-ch03-image-002` | Ch03 p.23, p.25 |  | 인쇄 | 일치 |  |
| 31 | `os-ch03-image-003` | Ch03 p.24 |  | 인쇄 | 일치 |  |
| 32 | `os-ch03-image-004` | Ch03 p.24 |  | 인쇄 | 일치 |  |
| 33 | `os-ch03-image-005` | Ch03 p.24 |  | 인쇄 | 신규·일치 |  |
| 34 | `os-ch03-stack-001` | Ch03 p.25 | ⭐ | 인쇄 | 일치 |  |
| 35 | `os-ch03-stack-002` | Ch03 p.25 | ⭐ | 인쇄 | 일치 |  |
| 36 | `os-ch03-stack-003` | Ch03 p.23-25 | ⭐ | 인쇄 | 일치 |  |
| 37 | `os-ch03-stack-004` | Ch03 p.25 | ⭐ | 인쇄 | 일치 |  |
| 38 | `os-ch03-stack-005` | Ch03 p.23 | ⭐ | p.23 필기(쓰레기 값) | 일치 |  |
| 39 | `os-ch03-stack-006` | Ch03 p.22 | ⭐ | p.22 필기(스택 아래로·힙 위로) | 일치 |  |
| 40 | `os-ch03-stack-007` | Ch03 p.31 | ⭐ | 인쇄 | 수정 | [2차] accept 보강 |
| 41 | `os-ch03-stack-008` | Ch03 p.31 | ⭐ | 인쇄 | 일치 |  |
| 42 | `os-ch03-state-001` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 43 | `os-ch03-state-002` | Ch03 p.12 | ⭐ | p.12 필기(New·Exit 설명) | 수정 | [1차] 해설: New의 '디스크→메모리', Exit의 '메모리 반납'이 p.12 필기임을 표시 |
| 44 | `os-ch03-state-003` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 45 | `os-ch03-state-004` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 46 | `os-ch03-state-005` | Ch03 p.12-13 | ⭐ | 인쇄 | 일치 |  |
| 47 | `os-ch03-state-006` | Ch03 p.12 | ⭐ | 인쇄 | 일치 |  |
| 48 | `os-ch03-state-007` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 49 | `os-ch03-state-008` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 50 | `os-ch03-state-009` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 51 | `os-ch03-state-010` | Ch03 p.12 | ⭐ | 인쇄 | 신규·일치 |  |
| 52 | `os-ch03-suspend-001` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 53 | `os-ch03-suspend-002` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 54 | `os-ch03-suspend-003` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 55 | `os-ch03-suspend-004` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 56 | `os-ch03-suspend-005` | Ch03 p.20 | ⭐ | 인쇄 | 수정 | [2차] accept 보강 |
| 57 | `os-ch03-suspend-006` | Ch03 p.21 | ⭐ | p.21 필기(최소화 창) | 일치 |  |
| 58 | `os-ch03-suspend-007` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 59 | `os-ch03-suspend-008` | Ch03 p.20-21 | ⭐ | 인쇄 | 일치 |  |
| 60 | `os-ch03-wait-event-001` | Ch03 p.14 |  | 인쇄 | 일치 |  |
| 61 | `os-ch03-wait-event-002` | Ch03 p.14 |  | 인쇄 | 일치 |  |
| 62 | `os-ch03-wait-event-003` | Ch03 p.14 |  | 인쇄 | 일치 |  |
| 63 | `os-ch03-wait-event-004` | Ch03 p.17 |  | 인쇄 | 신규·일치 |  |
| 64 | `os-ch03-scheduler-001` | Ch03 p.7, p.15 |  | 인쇄 | 일치 |  |
| 65 | `os-ch03-scheduler-002` | Ch03 p.15 |  | 인쇄 | 일치 |  |
| 66 | `os-ch03-scheduler-003` | Ch03 p.16, p.38 |  | 인쇄 | 일치 |  |
| 67 | `os-ch03-scheduler-004` | Ch03 p.16 |  | 인쇄 | 일치 |  |
| 68 | `os-ch03-scheduler-005` | Ch03 p.7 |  | 인쇄 | 신규·수정 | [2차] accept 보강('프로세스 추적' — 빈칸 앞 '프로세스'까지 쓴 답 허용) |
| 69 | `os-ch03-mode-001` | Ch03 p.36 |  | 인쇄 | 일치 |  |
| 70 | `os-ch03-mode-002` | Ch03 p.36 |  | p.36 필기(모드 구분 이유) | 일치 |  |
| 71 | `os-ch03-mode-003` | Ch03 p.36 |  | 인쇄 | 일치 |  |
| 72 | `os-ch03-create-steps-001` | Ch03 p.37 |  | 인쇄 | 일치 |  |
| 73 | `os-ch03-create-steps-002` | Ch03 p.37 |  | p.37 필기(종료 시 메모리 반납) | 일치 |  |
| 74 | `os-ch03-interrupt-001` | Ch03 p.38-39 | ⭐ | 인쇄 | 일치 |  |
| 75 | `os-ch03-interrupt-002` | Ch03 p.38 | ⭐ | 인쇄 | 일치 |  |
| 76 | `os-ch03-interrupt-003` | Ch03 p.38-39 | ⭐ | 인쇄 | 일치 |  |
| 77 | `os-ch03-interrupt-004` | Ch03 p.38 | ⭐ | 인쇄 | 일치 |  |
| 78 | `os-ch03-interrupt-005` | Ch03 p.38 | ⭐ | p.38 필기(인터럽트 번호·테이블) | 일치 |  |
| 79 | `os-ch03-interrupt-006` | Ch03 p.38 | ⭐ | 인쇄 | 수정 | [2차] accept 보강 |
| 80 | `os-ch03-interrupt-007` | Ch03 p.40 | ⭐ | 인쇄 | 일치 |  |
| 81 | `os-ch03-interrupt-008` | Ch03 p.39 | ⭐ | p.39 필기(커널 모드 구간) | 일치 |  |
| 82 | `os-ch03-interrupt-009` | Ch03 p.39 | ⭐ | p.39 필기(타이머 인터럽트 후 계속 실행) | 일치 |  |
| 83 | `os-ch03-process-switch-001` | Ch03 p.41-42 | ⭐ | 인쇄 | 일치 |  |
| 84 | `os-ch03-process-switch-002` | Ch03 p.41-42 | ⭐ | 인쇄 | 수정 | [1차] 해설: '일반 함수 호출은 process switch를 일으키지 않음'의 근거로 p.36 추가 |
| 85 | `os-ch03-process-switch-003` | Ch03 p.41-42 | ⭐ | 인쇄 | 일치 |  |
| 86 | `os-ch03-process-switch-004` | Ch03 p.42 | ⭐ | 인쇄 | 수정 | [2차] accept 보강 |
| 87 | `os-ch03-process-switch-005` | Ch03 p.42 | ⭐ | 인쇄 | 일치 |  |
| 88 | `os-ch03-process-switch-006` | Ch03 p.42 | ⭐ | 인쇄 | 일치 |  |
| 89 | `os-ch03-process-switch-007` | Ch03 p.40 | ⭐ | 인쇄 | 일치 |  |
| 90 | `os-ch03-process-switch-008` | Ch03 p.41 | ⭐ | 인쇄 | 일치 |  |
| 91 | `os-ch03-process-switch-009` | Ch03 p.40 | ⭐ | 인쇄 | 일치 |  |
| 92 | `os-ch03-process-switch-010` | Ch03 p.41 | ⭐ | 인쇄 | 신규·일치 |  |
| 93 | `os-ch03-resume-001` | Ch03 p.44 |  | 인쇄 | 일치 |  |
| 94 | `os-ch03-resume-002` | Ch03 p.45 |  | 인쇄 | 일치 |  |
| 95 | `os-ch03-resume-003` | Ch03 p.45 |  | 인쇄 | 일치 |  |

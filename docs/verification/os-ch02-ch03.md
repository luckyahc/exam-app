# 문항별 PDF 대조 기록 — 운영체제 Ch02·Ch03

작성: 2026-10-05 (Sprint 5 점검). 각 문항의 정답·해설을 `slideRef` 페이지의 PDF 원문(인쇄 본문 + 필기)과 대조한 결과다. 손글씨·도형은 pdftoppm으로 렌더링한 이미지로 확인했다.

- **근거**: `인쇄` = 슬라이드 인쇄 본문만으로 정답이 정해짐 / `필기` = 정답·해설이 교수님 필기에 기대거나 필기를 인용함(⭐ 표시 자체의 근거는 ⭐ 열)
- **대조 결과**: `일치` = 수정 없이 PDF와 일치 / `수정` = 대조 후 해설을 고침(정답 변경 없음) / `신규·일치` = 이번에 추가한 문항, 작성 후 대조 일치
- 계산 문항(calc)의 정답은 `lib/sim/os/cpuTime.ts`가 계산하고, 슬라이드 예제 값(p.23 ≈ 9.2초·≈ 1.1초, p.24 ≈ 0.91·≈ 0.99)과 같은지 확인했다.

## 요약

| 구분 | 문항 수 |
|---|---|
| 전체 | 154 (Ch02 59 + Ch03 95) |
| 기존 문항 일치 | 138 |
| 기존 문항 수정 | 3 |
| 신규 추가(대조 일치) | 13 |
| 필기 근거 | 41 |

> 이전 보고의 "139문항 일치"는 잘못된 숫자였다. 기존 141문항 = 일치 138 + 수정 3.

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
| 5 | `os-ch02-os-service-001` | Ch02 p.5 |  | 인쇄 | 일치 |  |
| 6 | `os-ch02-os-service-002` | Ch02 p.5 |  | 인쇄 | 일치 |  |
| 7 | `os-ch02-os-service-003` | Ch02 p.5 |  | 인쇄 | 일치 |  |
| 8 | `os-ch02-not-supported-001` | Ch02 p.6 | ⭐ | 필기 | 일치 |  |
| 9 | `os-ch02-not-supported-002` | Ch02 p.6 | ⭐ | 필기 | 일치 |  |
| 10 | `os-ch02-not-supported-003` | Ch02 p.6 | ⭐ | 필기 | 일치 |  |
| 11 | `os-ch02-not-supported-004` | Ch02 p.5-6 | ⭐ | 필기 | 일치 |  |
| 12 | `os-ch02-not-supported-005` | Ch02 p.6 | ⭐ | 필기 | 일치 |  |
| 13 | `os-ch02-not-supported-006` | Ch02 p.6 | ⭐ | 인쇄 | 일치 |  |
| 14 | `os-ch02-not-supported-007` | Ch02 p.6 | ⭐ | 필기 | 일치 |  |
| 15 | `os-ch02-not-supported-008` | Ch02 p.6 | ⭐ | 필기 | 수정 | 해설: '허용할 수 없는 응용 프로그램의 요청'을 소프트웨어 오류 아래에 넣었던 것을 p.6 계층대로 별도 항목으로 정정 |
| 16 | `os-ch02-resource-001` | Ch02 p.7 |  | 필기 | 일치 |  |
| 17 | `os-ch02-resource-002` | Ch02 p.7 |  | 인쇄 | 일치 |  |
| 18 | `os-ch02-resource-003` | Ch02 p.7 |  | 인쇄 | 일치 |  |
| 19 | `os-ch02-resource-004` | Ch02 p.7 |  | 필기 | 신규·일치 |  |
| 20 | `os-ch02-evolve-001` | Ch02 p.9 |  | 인쇄 | 일치 |  |
| 21 | `os-ch02-evolve-002` | Ch02 p.9 |  | 인쇄 | 일치 |  |
| 22 | `os-ch02-evolve-003` | Ch02 p.9 |  | 인쇄 | 일치 |  |
| 23 | `os-ch02-kernel-001` | Ch02 p.10-11 |  | 인쇄 | 일치 |  |
| 24 | `os-ch02-kernel-002` | Ch02 p.10 |  | 인쇄 | 일치 |  |
| 25 | `os-ch02-kernel-003` | Ch02 p.11 |  | 인쇄 | 일치 |  |
| 26 | `os-ch02-kernel-call-001` | Ch02 p.11 |  | 인쇄 | 일치 |  |
| 27 | `os-ch02-kernel-call-002` | Ch02 p.11 |  | 필기 | 일치 |  |
| 28 | `os-ch02-io-001` | Ch02 p.12 |  | 인쇄 | 일치 |  |
| 29 | `os-ch02-io-002` | Ch02 p.12 |  | 필기 | 일치 |  |
| 30 | `os-ch02-io-003` | Ch02 p.12 |  | 인쇄 | 일치 |  |
| 31 | `os-ch02-io-004` | Ch02 p.12 |  | 필기 | 일치 |  |
| 32 | `os-ch02-history-001` | Ch02 p.13 |  | 인쇄 | 일치 |  |
| 33 | `os-ch02-history-002` | Ch02 p.13 |  | 인쇄 | 일치 |  |
| 34 | `os-ch02-history-003` | Ch02 p.13 |  | 인쇄 | 일치 |  |
| 35 | `os-ch02-batch-switch-001` | Ch02 p.14, p.20 |  | 인쇄 | 일치 |  |
| 36 | `os-ch02-batch-switch-002` | Ch02 p.14 |  | 인쇄 | 일치 |  |
| 37 | `os-ch02-batch-switch-003` | Ch02 p.14 |  | 인쇄 | 일치 |  |
| 38 | `os-ch02-batch-switch-004` | Ch02 p.20 |  | 인쇄 | 신규·일치 |  |
| 39 | `os-ch02-uniprog-001` | Ch02 p.17-18 |  | 인쇄 | 일치 |  |
| 40 | `os-ch02-uniprog-002` | Ch02 p.16 |  | 인쇄 | 일치 |  |
| 41 | `os-ch02-uniprog-003` | Ch02 p.17 |  | 인쇄 | 신규·일치 |  |
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
| 52 | `os-ch02-time-calc-011` | Ch02 p.24 | ⭐ | 인쇄 | 신규·일치 |  |
| 53 | `os-ch02-time-calc-012` | Ch02 p.21, p.24 | ⭐ | 필기 | 신규·일치 |  |
| 54 | `os-ch02-time-calc-013` | Ch02 p.24 | ⭐ | 필기 | 신규·일치 |  |
| 55 | `os-ch02-time-calc-014` | Ch02 p.21 | ⭐ | 필기 | 신규·일치 |  |
| 56 | `os-ch02-smp-001` | Ch02 p.25 |  | 인쇄 | 일치 |  |
| 57 | `os-ch02-smp-002` | Ch02 p.25 |  | 인쇄 | 일치 |  |
| 58 | `os-ch02-smp-003` | Ch02 p.25 |  | 필기 | 일치 |  |
| 59 | `os-ch02-smp-004` | Ch02 p.25 |  | 인쇄 | 신규·일치 |  |

## Ch03 (source/os/Ch03 Processes.pdf) — 95문항

| # | id | slideRef | ⭐ | 근거 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|
| 1 | `os-ch03-process-def-001` | Ch03 p.2 | ⭐ | 필기 | 일치 |  |
| 2 | `os-ch03-process-def-002` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 3 | `os-ch03-process-def-003` | Ch03 p.2 | ⭐ | 필기 | 일치 |  |
| 4 | `os-ch03-process-def-004` | Ch03 p.2 | ⭐ | 필기 | 일치 |  |
| 5 | `os-ch03-process-def-005` | Ch03 p.2 | ⭐ | 필기 | 일치 |  |
| 6 | `os-ch03-process-def-006` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 7 | `os-ch03-process-def-007` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 8 | `os-ch03-process-def-008` | Ch03 p.2 | ⭐ | 인쇄 | 일치 |  |
| 9 | `os-ch03-creation-001` | Ch03 p.3 |  | 인쇄 | 일치 |  |
| 10 | `os-ch03-creation-002` | Ch03 p.3 |  | 인쇄 | 일치 |  |
| 11 | `os-ch03-creation-003` | Ch03 p.3 |  | 인쇄 | 일치 |  |
| 12 | `os-ch03-termination-001` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 13 | `os-ch03-termination-002` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 14 | `os-ch03-termination-003` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 15 | `os-ch03-termination-004` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 16 | `os-ch03-termination-005` | Ch03 p.4 | ⭐ | 필기 | 일치 |  |
| 17 | `os-ch03-termination-006` | Ch03 p.4 | ⭐ | 필기 | 일치 |  |
| 18 | `os-ch03-termination-007` | Ch03 p.4 | ⭐ | 필기 | 일치 |  |
| 19 | `os-ch03-termination-008` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 20 | `os-ch03-termination-009` | Ch03 p.4 | ⭐ | 인쇄 | 일치 |  |
| 21 | `os-ch03-termination-010` | Ch03 p.4 | ⭐ | 필기 | 일치 |  |
| 22 | `os-ch03-pcb-001` | Ch03 p.26 |  | 인쇄 | 일치 |  |
| 23 | `os-ch03-pcb-002` | Ch03 p.5 |  | 인쇄 | 일치 |  |
| 24 | `os-ch03-pcb-003` | Ch03 p.6, p.19 |  | 필기 | 일치 |  |
| 25 | `os-ch03-pcb-004` | Ch03 p.18 |  | 필기 | 일치 |  |
| 26 | `os-ch03-context-001` | Ch03 p.29, p.31 |  | 인쇄 | 일치 |  |
| 27 | `os-ch03-context-002` | Ch03 p.28 |  | 인쇄 | 일치 |  |
| 28 | `os-ch03-context-003` | Ch03 p.7, p.29 |  | 필기 | 일치 |  |
| 29 | `os-ch03-image-001` | Ch03 p.23 |  | 인쇄 | 일치 |  |
| 30 | `os-ch03-image-002` | Ch03 p.23, p.25 |  | 인쇄 | 일치 |  |
| 31 | `os-ch03-image-003` | Ch03 p.24 |  | 인쇄 | 일치 |  |
| 32 | `os-ch03-image-004` | Ch03 p.24 |  | 인쇄 | 일치 |  |
| 33 | `os-ch03-image-005` | Ch03 p.24 |  | 인쇄 | 신규·일치 |  |
| 34 | `os-ch03-stack-001` | Ch03 p.25 | ⭐ | 인쇄 | 일치 |  |
| 35 | `os-ch03-stack-002` | Ch03 p.25 | ⭐ | 인쇄 | 일치 |  |
| 36 | `os-ch03-stack-003` | Ch03 p.23-25 | ⭐ | 인쇄 | 일치 |  |
| 37 | `os-ch03-stack-004` | Ch03 p.25 | ⭐ | 인쇄 | 일치 |  |
| 38 | `os-ch03-stack-005` | Ch03 p.23 | ⭐ | 필기 | 일치 |  |
| 39 | `os-ch03-stack-006` | Ch03 p.22 | ⭐ | 필기 | 일치 |  |
| 40 | `os-ch03-stack-007` | Ch03 p.31 | ⭐ | 인쇄 | 일치 |  |
| 41 | `os-ch03-stack-008` | Ch03 p.31 | ⭐ | 인쇄 | 일치 |  |
| 42 | `os-ch03-state-001` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 43 | `os-ch03-state-002` | Ch03 p.12 | ⭐ | 필기 | 수정 | 해설: New의 '디스크→메모리', Exit의 '메모리 반납'이 p.12 필기임을 표시 |
| 44 | `os-ch03-state-003` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 45 | `os-ch03-state-004` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 46 | `os-ch03-state-005` | Ch03 p.12-13 | ⭐ | 인쇄 | 일치 |  |
| 47 | `os-ch03-state-006` | Ch03 p.12 | ⭐ | 인쇄 | 일치 |  |
| 48 | `os-ch03-state-007` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 49 | `os-ch03-state-008` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 50 | `os-ch03-state-009` | Ch03 p.13 | ⭐ | 인쇄 | 일치 |  |
| 51 | `os-ch03-state-010` | Ch03 p.12 | ⭐ | 인쇄 | 신규·일치 |  |
| 52 | `os-ch03-suspend-001` | Ch03 p.20 | ⭐ | 필기 | 일치 |  |
| 53 | `os-ch03-suspend-002` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 54 | `os-ch03-suspend-003` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 55 | `os-ch03-suspend-004` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 56 | `os-ch03-suspend-005` | Ch03 p.20 | ⭐ | 인쇄 | 일치 |  |
| 57 | `os-ch03-suspend-006` | Ch03 p.21 | ⭐ | 필기 | 일치 |  |
| 58 | `os-ch03-suspend-007` | Ch03 p.20 | ⭐ | 필기 | 일치 |  |
| 59 | `os-ch03-suspend-008` | Ch03 p.20-21 | ⭐ | 인쇄 | 일치 |  |
| 60 | `os-ch03-wait-event-001` | Ch03 p.14 |  | 인쇄 | 일치 |  |
| 61 | `os-ch03-wait-event-002` | Ch03 p.14 |  | 인쇄 | 일치 |  |
| 62 | `os-ch03-wait-event-003` | Ch03 p.14 |  | 인쇄 | 일치 |  |
| 63 | `os-ch03-wait-event-004` | Ch03 p.17 |  | 필기 | 신규·일치 |  |
| 64 | `os-ch03-scheduler-001` | Ch03 p.7, p.15 |  | 인쇄 | 일치 |  |
| 65 | `os-ch03-scheduler-002` | Ch03 p.15 |  | 인쇄 | 일치 |  |
| 66 | `os-ch03-scheduler-003` | Ch03 p.16, p.38 |  | 인쇄 | 일치 |  |
| 67 | `os-ch03-scheduler-004` | Ch03 p.16 |  | 인쇄 | 일치 |  |
| 68 | `os-ch03-scheduler-005` | Ch03 p.7 |  | 인쇄 | 신규·일치 |  |
| 69 | `os-ch03-mode-001` | Ch03 p.36 |  | 인쇄 | 일치 |  |
| 70 | `os-ch03-mode-002` | Ch03 p.36 |  | 필기 | 일치 |  |
| 71 | `os-ch03-mode-003` | Ch03 p.36 |  | 인쇄 | 일치 |  |
| 72 | `os-ch03-create-steps-001` | Ch03 p.37 |  | 인쇄 | 일치 |  |
| 73 | `os-ch03-create-steps-002` | Ch03 p.37 |  | 필기 | 일치 |  |
| 74 | `os-ch03-interrupt-001` | Ch03 p.38-39 | ⭐ | 인쇄 | 일치 |  |
| 75 | `os-ch03-interrupt-002` | Ch03 p.38 | ⭐ | 인쇄 | 일치 |  |
| 76 | `os-ch03-interrupt-003` | Ch03 p.38-39 | ⭐ | 인쇄 | 일치 |  |
| 77 | `os-ch03-interrupt-004` | Ch03 p.38 | ⭐ | 인쇄 | 일치 |  |
| 78 | `os-ch03-interrupt-005` | Ch03 p.38 | ⭐ | 필기 | 일치 |  |
| 79 | `os-ch03-interrupt-006` | Ch03 p.38 | ⭐ | 인쇄 | 일치 |  |
| 80 | `os-ch03-interrupt-007` | Ch03 p.40 | ⭐ | 필기 | 일치 |  |
| 81 | `os-ch03-interrupt-008` | Ch03 p.39 | ⭐ | 필기 | 일치 |  |
| 82 | `os-ch03-interrupt-009` | Ch03 p.39 | ⭐ | 필기 | 일치 |  |
| 83 | `os-ch03-process-switch-001` | Ch03 p.41-42 | ⭐ | 인쇄 | 일치 |  |
| 84 | `os-ch03-process-switch-002` | Ch03 p.41-42 | ⭐ | 필기 | 수정 | 해설: '일반 함수 호출은 process switch를 일으키지 않음'의 근거로 p.36(커널 모드 전환 2가지, 필기) 추가 |
| 85 | `os-ch03-process-switch-003` | Ch03 p.41-42 | ⭐ | 인쇄 | 일치 |  |
| 86 | `os-ch03-process-switch-004` | Ch03 p.42 | ⭐ | 인쇄 | 일치 |  |
| 87 | `os-ch03-process-switch-005` | Ch03 p.42 | ⭐ | 인쇄 | 일치 |  |
| 88 | `os-ch03-process-switch-006` | Ch03 p.42 | ⭐ | 인쇄 | 일치 |  |
| 89 | `os-ch03-process-switch-007` | Ch03 p.40 | ⭐ | 인쇄 | 일치 |  |
| 90 | `os-ch03-process-switch-008` | Ch03 p.41 | ⭐ | 인쇄 | 일치 |  |
| 91 | `os-ch03-process-switch-009` | Ch03 p.40 | ⭐ | 인쇄 | 일치 |  |
| 92 | `os-ch03-process-switch-010` | Ch03 p.41 | ⭐ | 인쇄 | 신규·일치 |  |
| 93 | `os-ch03-resume-001` | Ch03 p.44 |  | 인쇄 | 일치 |  |
| 94 | `os-ch03-resume-002` | Ch03 p.45 |  | 인쇄 | 일치 |  |
| 95 | `os-ch03-resume-003` | Ch03 p.45 |  | 인쇄 | 일치 |  |

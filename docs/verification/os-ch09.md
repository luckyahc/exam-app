# 문항별 PDF 대조 기록 — 운영체제 Ch09

작성: 2026-10-12 (Sprint 19). 근거 PDF: `source/os/Ch09 Uniprocessor Scheduling.pdf`(28쪽), 판독 텍스트 `docs/jokbo/os/extracted/Ch09.md`. 각 문항의 정답·해설을 `slideRef` 페이지의 원문(인쇄 + 교수님 필기 — 이 PDF는 필기가 텍스트 층에 들어 있다)과 대조했다. 그림 쪽(p.2·3·5·7·8·11·13·14·21·22·25)은 렌더링한 이미지로 확인했고, p.25 Feedback 그림은 160dpi로 실행 구간을 판독했다.

- **⭐**: 4개 소주제(스케줄러 호출 시점 p.8, 스케줄링 기준 p.5, 시각별 스케줄링 추적 p.11, HRRN 응답 비율 p.22) — 모두 `handwritten`(교수님 필기의 출제 표시). 각 8문항, 유형 3종 이상.
- **근거**: `인쇄` = 인쇄 본문·그림만으로 정답이 정해짐 / `p.N 필기` = 정답 판정에 교수님 필기가 필요하거나 정답 문장이 필기를 옮긴 것(해설에 "교수님 필기 기준"을 밝힘).
- **정답 계산**: 계산·추적 정답을 만든 `lib/sim/os/scheduling.ts` 함수. 슬라이드 기준값과의 일치는 `lib/sim/os/scheduling.test.ts`가 확인한다(p.27 표 5개 알고리즘의 Tr·평균 Tr·평균 Tw·평균 Tr/Ts, p.11·13·14·19·21·22·25 그림의 실행 순서, p.22 응답 비율, p.22 필기 예).
- **대조 결과**: `일치` = 작성 후 대조에서 고칠 것 없음 / `수정` = 대조·검사 후 고침(정답 변경 없음).
- 용어 단답형(`os-ch09-term-NNN`)은 용어 사전(`data/subjects/os/glossary.ts`)의 정의 문장으로 만들어지며, 정의는 slideRef 쪽의 인쇄 문장을 옮겼다.

## 요약

| 항목 | 수 |
|---|---|
| 전체 | 98 |
| 일치 | 94 |
| 수정 | 4 |
| 필기 근거(문항별 확인) | 19 |

## 문항별

| # | id | 유형 | slideRef | ⭐ | 근거 | 정답 계산 | 대조 결과 | 정답 |
|---|---|---|---|---|---|---|---|---|
| 1 | `os-ch09-level-001` | mcq | Ch09 p.3 |  | 인쇄 |  | 일치 | Ready 큐에서 다음 실행 프로세스를 선택해 CPU를 배정한다 |
| 2 | `os-ch09-level-002` | match | Ch09 p.3 |  | 인쇄 |  | 일치 | 3쌍 |
| 3 | `os-ch09-level-003` | ox | Ch09 p.3 |  | 인쇄 |  | 일치 | X |
| 4 | `os-ch09-level-004` | blank | Ch09 p.2 |  | p.2 필기 |  | 일치 | 디스패처 |
| 5 | `os-ch09-switch-001` | mcq | Ch09 p.8 | ⭐ 필기 | p.8 필기 |  | 일치 | 실행 중인 프로세스가 함수 안의 지역 변수에 값을 대입할 때 |
| 6 | `os-ch09-switch-002` | multi | Ch09 p.4 | ⭐ 필기 | 인쇄 |  | 일치 | 클록 인터럽트 / I/O 인터럽트 / 운영체제 호출(I/O API 함수) / 트랩 인터럽트 / 메모리(페이지) 폴트 인터럽트 |
| 7 | `os-ch09-switch-003` | ox | Ch09 p.8 | ⭐ 필기 | 인쇄 |  | 일치 | O |
| 8 | `os-ch09-switch-004` | blank | Ch09 p.8 | ⭐ 필기 | p.8 필기 |  | 일치 | scheduling |
| 9 | `os-ch09-switch-005` | match | Ch09 p.8 | ⭐ 필기 | 인쇄 |  | 일치 | 4쌍 |
| 10 | `os-ch09-switch-006` | classify | Ch09 p.8 | ⭐ 필기 | p.8 필기 |  | 일치 | 6개 → 2분류 |
| 11 | `os-ch09-switch-007` | order | Ch09 p.8 | ⭐ 필기 | 인쇄 |  | 일치 | 프로세스가 scanf()를 호출함 → 입력 데이터가 없어 대기(Blocked)해야 함 → scheduler()를 호출함 → … |
| 12 | `os-ch09-switch-008` | mcq | Ch09 p.8 | ⭐ 필기 | 인쇄 |  | 일치 | 데이터를 기다리던 프로세스가 깨어나 다시 스케줄링해야 하므로 |
| 13 | `os-ch09-criteria-001` | blank | Ch09 p.5 | ⭐ 필기 | p.5 필기 |  | 일치 | turnaround time |
| 14 | `os-ch09-criteria-002` | match | Ch09 p.5 | ⭐ 필기 | 인쇄 |  | 일치 | 5쌍 |
| 15 | `os-ch09-criteria-003` | classify | Ch09 p.5 | ⭐ 필기 | 인쇄 |  | 일치 | 5개 → 2분류 |
| 16 | `os-ch09-criteria-004` | mcq | Ch09 p.5 | ⭐ 필기 | 인쇄 |  | 일치 | 응답시간(Response time) |
| 17 | `os-ch09-criteria-005` | ox | Ch09 p.5 | ⭐ 필기 | p.5 필기 |  | 일치 | X |
| 18 | `os-ch09-criteria-006` | calc | Ch09 p.5 | ⭐ 필기 | p.5 필기 |  | 일치 | 33.33 |
| 19 | `os-ch09-criteria-007` | multi | Ch09 p.2 | ⭐ 필기 | 인쇄 |  | 일치 | 응답시간(response time) / 처리량(throughput) / 프로세서 효율(efficiency) 또는 이용률(ut… |
| 20 | `os-ch09-criteria-008` | blank | Ch09 p.5 | ⭐ 필기 | 인쇄 |  | 일치 | 처리량 |
| 21 | `os-ch09-priority-001` | mcq | Ch09 p.6 |  | 인쇄 |  | 일치 | 기아(starvation) |
| 22 | `os-ch09-priority-002` | ox | Ch09 p.6 |  | 인쇄 |  | 일치 | O |
| 23 | `os-ch09-priority-003` | mcq | Ch09 p.7 |  | p.7 필기 |  | 일치 | RQ1의 프로세스가 실행 중지되고 RQ0의 프로세스가 실행된다 |
| 24 | `os-ch09-decision-001` | classify | Ch09 p.9 |  | 인쇄 |  | 일치 | 5개 → 2분류 |
| 25 | `os-ch09-decision-002` | ox | Ch09 p.9 |  | 인쇄 |  | 일치 | X |
| 26 | `os-ch09-decision-003` | classify | Ch09 p.9 |  | 인쇄 |  | 일치 | 5개 → 2분류 |
| 27 | `os-ch09-decision-004` | mcq | Ch09 p.9 |  | 인쇄 |  | 일치 | Ready |
| 28 | `os-ch09-burst-001` | mcq | Ch09 p.10 |  | 인쇄 |  | 일치 | 프로세스가 실행을 시작한 후, 종료되거나 I/O 함수 호출로 대기 큐로 이동하기 전까지의 실행 예상 시간 |
| 29 | `os-ch09-burst-002` | classify | Ch09 p.12 |  | 인쇄 |  | 일치 | 4개 → 2분류 |
| 30 | `os-ch09-burst-003` | ox | Ch09 p.16 |  | p.16 필기 |  | 일치 | O |
| 31 | `os-ch09-fcfs-001` | mcq | Ch09 p.11 |  | 인쇄 |  | 일치 | Ready queue에서 가장 오랫동안 있었던(대기시간이 가장 긴) 프로세스 |
| 32 | `os-ch09-fcfs-002` | blank | Ch09 p.12 |  | 인쇄 |  | 일치 | 호위 효과 |
| 33 | `os-ch09-fcfs-003` | multi | Ch09 p.11-12 |  | 인쇄 |  | 일치 | 비선점(Nonpreemptive) 정책이다 / 기아가 없다 / CPU 중심 프로세스에 유리하다 |
| 34 | `os-ch09-fcfs-004` | calc | Ch09 p.27 |  | 인쇄 | simulate fcfs | 일치 | 8.6 |
| 35 | `os-ch09-trace-001` | mcq | Ch09 p.11 | ⭐ 필기 | p.11 필기 | simulate fcfs · runningAt | 일치 | B |
| 36 | `os-ch09-trace-002` | trace | Ch09 p.13 | ⭐ 필기 | p.13 필기 | simulate rr q=1 | 일치 | C, E, C, E |
| 37 | `os-ch09-trace-003` | order | Ch09 p.19 | ⭐ 필기 | 인쇄 | simulate spn · segments | 수정 | A → B → E → C → D — mcq(시각 9 선택) → order(실행 순서)로 바꿈: ⭐ 소주제 유형 3종 이상 규칙 |
| 38 | `os-ch09-trace-004` | mcq | Ch09 p.21 | ⭐ 필기 | 인쇄 | simulate srt | 일치 | C |
| 39 | `os-ch09-trace-005` | trace | Ch09 p.14 | ⭐ 필기 | 인쇄 | simulate rr q=4 | 일치 | B, D, B, D |
| 40 | `os-ch09-trace-006` | mcq | Ch09 p.21 | ⭐ 필기 | p.21 필기 | simulate srt(동점 예) | 일치 | A |
| 41 | `os-ch09-gen-scheduling-1` | mcq | Ch09 p.11 | ⭐ 필기 | 인쇄 | schedulingGen(simulate srt) | 일치 | B |
| 42 | `os-ch09-gen-scheduling-3` | mcq | Ch09 p.11 | ⭐ 필기 | 인쇄 | schedulingGen(simulate rr q=1) | 수정 | C — 고정 seed 2(SRT) → seed 3 RR로 교체(알고리즘 다양화) |
| 43 | `os-ch09-rr-001` | match | Ch09 p.15 |  | 인쇄 |  | 일치 | 3쌍 |
| 44 | `os-ch09-rr-002` | ox | Ch09 p.13 |  | p.13 필기 |  | 일치 | X |
| 45 | `os-ch09-rr-003` | mcq | Ch09 p.15 |  | 인쇄 |  | 일치 | CPU 중심 프로세스 |
| 46 | `os-ch09-rr-004` | calc | Ch09 p.27 |  | 인쇄 | simulate rr q=1 | 일치 | 10.8 |
| 47 | `os-ch09-vrr-001` | order | Ch09 p.17 |  | 인쇄 |  | 일치 | 대기 큐에서 깨어난 프로세스를 보조 큐로 옮김 → 스케줄러가 보조 큐의 프로세스를 먼저 실행함 → 앞서 다 사용하지 못한 t… |
| 48 | `os-ch09-vrr-002` | mcq | Ch09 p.17 |  | 인쇄 |  | 일치 | 보조 큐가 빈 경우에만 |
| 49 | `os-ch09-vrr-003` | ox | Ch09 p.15-17 |  | 인쇄 |  | 일치 | O |
| 50 | `os-ch09-estimate-001` | calc | Ch09 p.18 |  | 인쇄 | exponentialAverage | 일치 | 6 |
| 51 | `os-ch09-estimate-002` | mcq | Ch09 p.18 |  | 인쇄 |  | 일치 | 최근 변화에 민감해진다(빠른 반응) |
| 52 | `os-ch09-estimate-003` | blank | Ch09 p.18 |  | 인쇄 |  | 일치 | T(n) / S(n) |
| 53 | `os-ch09-estimate-004` | multi | Ch09 p.18 |  | 인쇄 |  | 일치 | SPN / SRT / HRRN |
| 54 | `os-ch09-spn-001` | mcq | Ch09 p.19 |  | 인쇄 |  | 일치 | 예상 처리(서비스) 시간이 가장 짧은 프로세스 |
| 55 | `os-ch09-spn-002` | multi | Ch09 p.19-20 |  | 인쇄 |  | 일치 | 비선점형 정책이다 / 긴 프로세스에 기아가 발생할 수 있다 / 평균 대기시간(반환시간) 최소화에 유리하다 |
| 56 | `os-ch09-spn-003` | calc | Ch09 p.27 |  | 인쇄 | simulate spn | 일치 | 7.6 |
| 57 | `os-ch09-srt-001` | mcq | Ch09 p.21 |  | 인쇄 |  | 일치 | SPN |
| 58 | `os-ch09-srt-002` | ox | Ch09 p.21 |  | p.21 필기 |  | 일치 | O |
| 59 | `os-ch09-srt-003` | blank | Ch09 p.21 |  | p.21 필기 |  | 일치 | s / e |
| 60 | `os-ch09-hrrn-001` | blank | Ch09 p.22 | ⭐ 필기 | 인쇄 |  | 일치 | 대기한 시간 / 예상 서비스 시간 |
| 61 | `os-ch09-hrrn-002` | mcq | Ch09 p.22 | ⭐ 필기 | p.22 필기 | simulate hrrn · decisions | 일치 | C |
| 62 | `os-ch09-hrrn-003` | calc | Ch09 p.22 | ⭐ 필기 | 인쇄 | simulate hrrn · decisions | 일치 | 2.25 |
| 63 | `os-ch09-hrrn-004` | trace | Ch09 p.22 | ⭐ 필기 | 인쇄 | simulate hrrn · decisions | 일치 | 2.25, 1.6, 1.5 |
| 64 | `os-ch09-hrrn-005` | mcq | Ch09 p.22 | ⭐ 필기 | p.22 필기 | responseRatio | 수정 | A — R = (2+10)/10 = 1.2 — 보기 2개 → 4개(OS mcq 보기 4~5개 규칙), 정답 변경 없음 |
| 65 | `os-ch09-hrrn-006` | ox | Ch09 p.22 | ⭐ 필기 | 인쇄 |  | 일치 | O |
| 66 | `os-ch09-hrrn-007` | mcq | Ch09 p.22 | ⭐ 필기 | 인쇄 | simulate hrrn · decisions | 수정 | E — R = (5+2)/2 = 3.5 — 보기 2개 → 4개(OS mcq 보기 4~5개 규칙), 정답 변경 없음 |
| 67 | `os-ch09-hrrn-008` | multi | Ch09 p.22 | ⭐ 필기 | 인쇄 |  | 일치 | 비선점형(nonpreemptive) 정책이다 / 응답 비율(R)이 가장 큰 프로세스를 다음으로 선택한다 / aging이 내장… |
| 68 | `os-ch09-feedback-001` | multi | Ch09 p.23 |  | 인쇄 |  | 일치 | 더 오래 실행된 작업에 불이익을 준다 / 실제 remaining time을 몰라도 SRT와 비슷한 효과를 낸다 / 종료되거나… |
| 69 | `os-ch09-feedback-002` | mcq | Ch09 p.25 |  | 인쇄 |  | 일치 | 4 |
| 70 | `os-ch09-feedback-003` | ox | Ch09 p.25 |  | p.24 필기 |  | 일치 | X |
| 71 | `os-ch09-feedback-004` | mcq | Ch09 p.25 |  | p.25 필기 | simulate feedback pow2 | 일치 | B |
| 72 | `os-ch09-metric-001` | calc | Ch09 p.26 |  | 인쇄 |  | 일치 | 11 |
| 73 | `os-ch09-metric-002` | blank | Ch09 p.26 |  | 인쇄 |  | 일치 | Tw / Ts |
| 74 | `os-ch09-metric-003` | calc | Ch09 p.26-27 |  | 인쇄 | simulate fcfs | 일치 | 7 |
| 75 | `os-ch09-metric-004` | mcq | Ch09 p.26 |  | 인쇄 |  | 일치 | 1 |
| 76 | `os-ch09-compare-001` | mcq | Ch09 p.27 |  | 인쇄 | simulate 5종 | 일치 | SRT |
| 77 | `os-ch09-compare-002` | order | Ch09 p.27 |  | 인쇄 | simulate 5종 | 일치 | SRT → SPN → HRRN → FCFS → RR(q=1) |
| 78 | `os-ch09-compare-003` | mcq | Ch09 p.27 |  | 인쇄 | simulate rr·srt | 일치 | 평균 반환시간은 크지만 짧은 작업의 응답성은 우수하다 |
| 79 | `os-ch09-compare-004` | calc | Ch09 p.27 |  | 인쇄 | simulate srt | 일치 | 1.59 |
| 80 | `os-ch09-term-001` | blank | Ch09 p.3 |  | 인쇄 |  | 일치 | 장기 스케줄링 |
| 81 | `os-ch09-term-002` | blank | Ch09 p.3 |  | 인쇄 |  | 일치 | 중기 스케줄링 |
| 82 | `os-ch09-term-003` | blank | Ch09 p.3 |  | 인쇄 |  | 일치 | 단기 스케줄링 |
| 83 | `os-ch09-term-004` | blank | Ch09 p.5 |  | 인쇄 |  | 일치 | 마감시간 |
| 84 | `os-ch09-term-005` | blank | Ch09 p.6 |  | 인쇄 |  | 일치 | 기아 |
| 85 | `os-ch09-term-006` | blank | Ch09 p.9 |  | 인쇄 |  | 일치 | 선점형 |
| 86 | `os-ch09-term-007` | blank | Ch09 p.10 |  | 인쇄 |  | 일치 | 서비스 시간 |
| 87 | `os-ch09-term-008` | blank | Ch09 p.12 |  | 인쇄 |  | 일치 | CPU 중심 프로세스 |
| 88 | `os-ch09-term-009` | blank | Ch09 p.12 |  | 인쇄 |  | 일치 | I/O 중심 프로세스 |
| 89 | `os-ch09-term-010` | blank | Ch09 p.11 |  | 인쇄 |  | 일치 | 선착순 |
| 90 | `os-ch09-term-011` | blank | Ch09 p.13 |  | 인쇄 |  | 일치 | 라운드 로빈 |
| 91 | `os-ch09-term-012` | blank | Ch09 p.15 |  | 인쇄 |  | 일치 | 가상 라운드 로빈 |
| 92 | `os-ch09-term-013` | blank | Ch09 p.18 |  | 인쇄 |  | 일치 | 지수 평균 |
| 93 | `os-ch09-term-014` | blank | Ch09 p.19 |  | 인쇄 |  | 일치 | 최단 작업 우선 |
| 94 | `os-ch09-term-015` | blank | Ch09 p.21 |  | 인쇄 |  | 일치 | 최단 잔여 시간 우선 |
| 95 | `os-ch09-term-016` | blank | Ch09 p.22 |  | 인쇄 |  | 일치 | 최고 응답 비율 우선 |
| 96 | `os-ch09-term-017` | blank | Ch09 p.23 |  | 인쇄 |  | 일치 | 피드백 |
| 97 | `os-ch09-term-018` | blank | Ch09 p.26 |  | 인쇄 |  | 일치 | 대기시간 |
| 98 | `os-ch09-term-019` | blank | Ch09 p.26 |  | 인쇄 |  | 일치 | 정규화 반환시간 |

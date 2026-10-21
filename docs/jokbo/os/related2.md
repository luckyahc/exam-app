# 운영체제 족보관련2

2026-10-21. 앱의 분류 **족보관련2**(과목 홈 "족보관련2만 풀기", 챕터 시작·문제 목록의 분류). 기존 "족보관련"(`jokboPatterns.ts`, 객관식·복수 선택 55문항)과 따로 센다. 데이터: `data/subjects/os/jokboRelated2.ts`, 검사: `jokboRelated2.test.ts`.

## 만든 기준

- 교수님 시험 힌트의 출제 유형: 객관식(4~5지), 보기 순서 나열, 짝 짓기, 단답형. 영어 단어·약자를 답으로 쓰는 문항을 넣었다(인정 답안에 한국어·영어 모두).
- 장별 출제 범위(힌트)를 따랐다: Ch02 목적·서비스·커널·커널 함수 호출 시점·Multiprogrammed vs Time Sharing·응답시간/이용률 계산, Ch03 상태 변화·process image·PCB·process switch·인터럽트 처리 순서, Ch07 재배치·보호·공유·고정/동적 분할·배치 알고리즘·Buddy·paging·주소 변환, Ch08 real vs virtual·page fault 전후 실행 순서·지역성·TLB·thrashing·정책·frame locking·교체, Ch09 용어·selection function·스케줄링 추적.
- 기존 족보의 특징을 따랐다: 같은 주제, 족보의 함정(뒤바뀐 정의, 비슷한 용어, 잘못된 이름), 족보의 표·그림 형식(프로세스 표, 페이지 테이블, 메모리 프레임, Buddy 상태). 해설은 풀이 + 원문과 달라진 점 + 함정 + 근거 페이지.
- 계산·추적 정답은 `lib/sim/os` 시뮬레이터로 다시 계산해 테스트한다(검증 열 "시뮬레이터"). 교수님 채점과 이론이 갈리는 지점(유효 CPU 이용률의 바쁜 시간 기준)은 만들지 않았다.

## 장별 문항 수

| 장 | 문항 |
|---|---|
| ch02 | 10 |
| ch03 | 10 |
| ch07 | 10 |
| ch08 | 10 |
| ch09 | 7 |
| 합계 | 47 |

유형: 객관식 9, 복수 선택 2, 단답형 20, 순서 6, 짝 짓기 10

## 문항

| 장 | ID | 유형 | 주제 | 난이도 | 바탕 족보 | 정답 | 검증 |
|---|---|---|---|---|---|---|---|
| ch02 | `os-ch02-jr2-mpts-001` | mcq | 단일 vs 다중프로그래밍 | 보통 | ch02-jokbo-004, ch02-jokbo-005 | 4번 | 슬라이드 |
| ch02 | `os-ch02-jr2-mpts-002` | blank | 단일 vs 다중프로그래밍 | 보통 | ch02-jokbo-004, ch02-jokbo-005 | processor utilization / response time | 슬라이드 |
| ch02 | `os-ch02-jr2-response-001` | blank | 시간 계산(응답시간/유효 CPU 이용률) | 어려움 | ch02-jokbo-006, ch02-jokbo-007 | 0.8 / 30.2 | 시뮬레이터 |
| ch02 | `os-ch02-jr2-utilization-001` | blank | 시간 계산(응답시간/유효 CPU 이용률) | 어려움 | ch02-jokbo-010, ch02-jokbo-005 | 0.99 / 0.91 | 시뮬레이터 |
| ch02 | `os-ch02-jr2-kernel-001` | match | 커널 / 시스템 프로그램 | 보통 | ch02-jokbo-001, ch02-jokbo-008 | 4쌍 + 오답 1 | 슬라이드 |
| ch02 | `os-ch02-jr2-service-001` | match | OS 서비스(편리성) | 보통 | ch02-jokbo-003 | 4쌍 + 오답 1 | 슬라이드 |
| ch02 | `os-ch02-jr2-kernel-002` | mcq | 커널 / 시스템 프로그램 | 보통 | ch02-jokbo-008, ch02-jokbo-001 | 4번 | 슬라이드 |
| ch02 | `os-ch02-jr2-mpts-003` | mcq | 단일 vs 다중프로그래밍 | 보통 | ch02-jokbo-005, ch02-jokbo-009 | 3번 | 슬라이드 |
| ch02 | `os-ch02-jr2-goal-001` | blank | OS 서비스(편리성) | 보통 | ch02-jokbo-002 | 발전성 | 슬라이드 |
| ch02 | `os-ch02-jr2-history-001` | order | 단일 vs 다중프로그래밍 | 보통 | ch02-jokbo-004, ch02-jokbo-009 | 4단계 | 슬라이드 |
| ch03 | `os-ch03-jr2-interrupt-001` | order | 인터럽트 처리 과정 | 어려움 | ch03-jokbo-013, ch03-jokbo-007 | 6단계 | 슬라이드 |
| ch03 | `os-ch03-jr2-state-001` | order | 5-상태 모델 / 상태 전이 | 보통 | ch03-jokbo-003, ch03-jokbo-008 | 6단계 | 슬라이드 |
| ch03 | `os-ch03-jr2-state-002` | match | 5-상태 모델 / 상태 전이 | 보통 | ch03-jokbo-003, ch03-jokbo-002, ch03-jokbo-004 | 5쌍 + 오답 1 | 슬라이드 |
| ch03 | `os-ch03-jr2-image-001` | match | 스택에 저장되는 것 | 보통 | ch03-jokbo-001, ch03-jokbo-011 | 5쌍 + 오답 1 | 슬라이드 |
| ch03 | `os-ch03-jr2-pcb-001` | match | PCB 3대 구성 | 보통 | ch03-jokbo-009, ch03-jokbo-006 | 3쌍 + 오답 2 | 슬라이드 |
| ch03 | `os-ch03-jr2-pcb-002` | blank | PCB 3대 구성 | 보통 | ch03-jokbo-006, ch03-jokbo-009 | PC / PSW | 슬라이드 |
| ch03 | `os-ch03-jr2-switch-001` | mcq | Process switch 5가지 경우 | 어려움 | ch03-jokbo-004, ch03-jokbo-007 | 4번 | 슬라이드 |
| ch03 | `os-ch03-jr2-state-003` | blank | 5-상태 모델 / 상태 전이 | 보통 | ch03-jokbo-002, ch03-jokbo-003 | Running / Blocked / Ready | 슬라이드 |
| ch03 | `os-ch03-jr2-interrupt-002` | mcq | 인터럽트 처리 과정 | 보통 | ch03-jokbo-005, ch03-jokbo-007 | 3번 | 슬라이드 |
| ch03 | `os-ch03-jr2-suspend-001` | blank | Suspend(swap out/in) | 보통 | ch03-jokbo-010 | swap out / Suspend | 슬라이드 |
| ch07 | `os-ch07-jr2-memreq-001` | match | 보호 / Base·Bounds 레지스터 | 보통 | ch07-jokbo-014, ch07-jokbo-010, ch07-jokbo-008 | 3쌍 + 오답 2 | 슬라이드 |
| ch07 | `os-ch07-jr2-partition-001` | mcq | 고정 분할 / 동적 분할 | 보통 | ch07-jokbo-007, ch07-jokbo-003 | 2번 | 슬라이드 |
| ch07 | `os-ch07-jr2-fit-001` | blank | 배치 알고리즘 | 어려움 | ch07-jokbo-005, ch07-jokbo-006, ch07-jokbo-004 | A / D / C / E | 시뮬레이터 |
| ch07 | `os-ch07-jr2-buddy-001` | blank | 버디 시스템 | 어려움 | ch07-jokbo-001, ch07-jokbo-002 | 128 / 28 / 512 | 시뮬레이터 |
| ch07 | `os-ch07-jr2-buddy-002` | blank | 버디 시스템 | 어려움 | ch07-jokbo-002, ch07-jokbo-001 | 256 / 128 | 시뮬레이터 |
| ch07 | `os-ch07-jr2-paging-001` | mcq | 기본 페이징 | 보통 | ch07-jokbo-009 | 1번 | 슬라이드 |
| ch07 | `os-ch07-jr2-address-001` | blank | 주소 변환 | 어려움 | ch07-jokbo-011, ch07-jokbo-012 | 7220 / 1076 | 시뮬레이터 |
| ch07 | `os-ch07-jr2-address-002` | order | 주소 변환 | 보통 | ch07-jokbo-011, ch07-jokbo-009 | 4단계 | 슬라이드 |
| ch07 | `os-ch07-jr2-fit-002` | match | 배치 알고리즘 | 보통 | ch07-jokbo-004, ch07-jokbo-005 | 4쌍 + 오답 1 | 슬라이드 |
| ch07 | `os-ch07-jr2-partition-002` | blank | 고정 분할 / 동적 분할 | 보통 | ch07-jokbo-003, ch07-jokbo-007 | 내부 단편화 / 외부 단편화 / 메모리 압축 | 슬라이드 |
| ch08 | `os-ch08-jr2-order-001` | order | 페이지 폴트 처리 과정 | 어려움 | ch08-jokbo-008 | 7단계 | 슬라이드 |
| ch08 | `os-ch08-jr2-order-002` | order | TLB 주소 변환 | 어려움 | ch08-jokbo-013 | 5단계 | 슬라이드 |
| ch08 | `os-ch08-jr2-vm-001` | multi | 가상 메모리 정책 분류 | 어려움 | ch08-jokbo-010 | 1번·2번 | 슬라이드 |
| ch08 | `os-ch08-jr2-policy-001` | match | 가상 메모리 정책 분류 | 보통 | ch08-jokbo-001, ch08-jokbo-007, ch08-jokbo-012 | 5쌍 + 오답 1 | 슬라이드 |
| ch08 | `os-ch08-jr2-locking-001` | blank | 프레임 잠금 | 보통 | ch08-jokbo-007, ch08-jokbo-001 | frame locking / lock bit | 슬라이드 |
| ch08 | `os-ch08-jr2-replace-001` | blank | 교체 알고리즘 | 어려움 | ch08-jokbo-002, ch08-jokbo-003 | 4 / 8 / 7 | 시뮬레이터 |
| ch08 | `os-ch08-jr2-clock-001` | blank | Clock 교체 추적 | 어려움 | ch08-jokbo-004, ch08-jokbo-005 | 4 / 0 | 시뮬레이터 |
| ch08 | `os-ch08-jr2-locality-001` | mcq | 스래싱과 부하 제어 | 보통 | ch08-jokbo-009 | 1번 | 슬라이드 |
| ch08 | `os-ch08-jr2-thrashing-001` | multi | 스래싱과 부하 제어 | 보통 | ch08-jokbo-006, ch08-jokbo-012 | 1번·2번 | 슬라이드 |
| ch08 | `os-ch08-jr2-tlb-001` | blank | TLB 주소 변환 | 보통 | ch08-jokbo-013 | TLB / hit / miss | 슬라이드 |
| ch09 | `os-ch09-jr2-selection-001` | match | 알고리즘 비교 | 어려움 | ch09-jokbo-005 | 4쌍 + 오답 2 | 슬라이드 |
| ch09 | `os-ch09-jr2-term-001` | match | 스케줄링 기준(용어) | 보통 | ch09-jokbo-006 | 4쌍 + 오답 1 | 슬라이드 |
| ch09 | `os-ch09-jr2-spn-001` | blank | 알고리즘 비교 | 어려움 | ch09-jokbo-001, ch09-jokbo-005 | A D B E C | 시뮬레이터 |
| ch09 | `os-ch09-jr2-srt-001` | blank | SRT | 어려움 | ch09-jokbo-001, ch09-jokbo-002 | 16 / 6 / 6.2 | 시뮬레이터 |
| ch09 | `os-ch09-jr2-hrrn-001` | blank | HRRN 응답 비율 | 어려움 | ch09-jokbo-002, ch09-jokbo-005 | 1.8 / 2.5 / D | 시뮬레이터 |
| ch09 | `os-ch09-jr2-rr-001` | blank | 알고리즘 비교 | 어려움 | ch09-jokbo-004, ch09-jokbo-001 | 8 / 17 | 시뮬레이터 |
| ch09 | `os-ch09-jr2-concept-001` | mcq | Feedback | 보통 | ch09-jokbo-003, ch09-jokbo-004 | 2번 | 슬라이드 |

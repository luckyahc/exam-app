# 운영체제 시험 힌트 (교수님 공식)

## 원문 (사용자 전달, 그대로)

```
문제 출제 유형:
객관식(4~5지 선다형), 보기에서 순서 나열, 짝 짓기, 단답형 등
선다형, 단답형 등에서 영어 단어, 영어 약자 등이 나올 수 있음

2장
운영체제의 목적, 운영체제가 제공하는 서비스, 커널, 커널 함수의 호출시점
Multiprogrammed System과 Time Sharing System의 특정 및 차이점
(시스템의 목적, process switch 발생 시점과 processor utilization, response time 등의 차이)
processor utilization, response time 계산 문제

3장
프로세스 전반의 특징 및 기능
프로세스 상태 종류 및 상태 변화도, 언제 각각의 상태가 변하는지 등등
프로세스 image의 구성요소 및 각 구성요소에 저장되는 내용들
process control block의 구성요소(저장되는 내용)
Process Switch 발생하는 시점과 프로세스 상태 변화도와의 관계
Interrupt 처리 전 과정 순서 및 각 과정별 하는 일

7장
Relocation. protection, sharing의 의미와 발생시점 또는 예시
Fixed 및 Dynamic memory partitioning의 이해
동적 메모리 할당 알고리즘에 의한 메모리 할당
Buddy system(buddy algorithm)에 의한 메모리 할당 및 반납
basic paging system의 이해
가상주소 및 실제주소 변환

8장
Real memory system과 virtual memory system의 공통점과 차이점
가상 기억장치에서 프로그램의 실행 과정의 순서 (특히 page fault 발생 전후를 기준으로)
지역성의 원리, TLB 작동 순서, thrashing의 이해
가상기억장치의 정책들 및 frame locking의 이해
페이지 교체 알고리즘
```

교수님은 수업에서 용어를 특히 중요하게 여기셨다(사용자 전달).

## 세부 항목과 현황

힌트 문장을 40개 세부 항목으로 나눴다(괄호 안의 세부 요소도 각각 항목). 항목 정의·근거 슬라이드·문항 연결은 `data/subjects/os/hints.ts`, 집계·형식 규칙은 `data/subjects/os/hintStats.ts`(무결성 테스트가 같은 규칙으로 검사).

- 2장 "특정(특징) 및 차이점" 괄호 안 요소: 시스템의 목적(2-5) · process switch 발생 시점(2-6) · processor utilization 차이(2-7) · response time 차이(2-8) · 계산(2-9 이용률, 2-10 응답시간)
- 3장 "프로세스 전반의 특징 및 기능": 특징(3-1 정의)과 기능(3-2 생성·종료·스케줄링·실행 모드)으로 나눔. "image의 구성요소 및 저장 내용"은 3-5·3-6, "Interrupt 처리 전 과정 순서 및 각 과정별 하는 일"은 3-10·3-11
- 7장 "Relocation, protection, sharing"은 7-1~7-3, "Fixed 및 Dynamic"은 7-4·7-5, "Buddy 할당 및 반납"은 7-7·7-8. "가상주소 및 실제주소 변환"(7-10)은 페이징·세그먼테이션 변환과 비트 분해를 포함
- 8장 "공통점과 차이점"은 8-1·8-2, "지역성·TLB·thrashing"은 8-4~8-6, "정책들 및 frame locking"은 8-7·8-8

형식 규칙(힌트의 출제 유형 기준): 항목마다 문항 6개 이상 · 유형 3종 이상 · 객관식(mcq)·순서(order)·짝(match)·단답(blank) 중 2종 이상. 순서가 핵심인 항목(3-4, 3-10, 7-10, 8-3, 8-5, 8-6)은 order 2개 이상, 구성요소·대응이 핵심인 항목(2-2, 2-5~2-8, 3-4~3-9, 3-11, 7-1~7-3, 7-6, 8-1, 8-2, 8-7)은 match 2개 이상.

### 보강 전 현황 (2026-10-07)

연결 기준: 기존 문항을 소주제·지문으로 힌트 항목에 연결(한 문항이 여러 항목에 걸칠 수 있음). "⭐ 필기"는 그 항목 문항 중 기존 handwritten ⭐ 수.

| 항목 | 내용 | 근거 | 문항 | mcq | order | match | blank | calc | trace | ox | 기타 | ⭐ 필기 | 부족한 점 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2-1 | 운영체제의 목적(목표) | Ch02 p.2-3, p.9 | 7 | 3 | 0 | 2 | 1 | 0 | 0 | 1 | 0 | 0 | — |
| 2-2 | 운영체제가 제공하는 서비스 | Ch02 p.5-6 | 11 | 6 | 0 | 0 | 1 | 0 | 0 | 3 | multi 1 | 8 | match 0개(2개 이상 필요) |
| 2-3 | 커널 | Ch02 p.10-11 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | classify 1, multi 1 | 0 | 문항 3개(6개 이상 필요); 객관식·순서·짝·단답 중 1종(2종 이상 필요) |
| 2-4 | 커널 함수의 호출 시점 | Ch02 p.11 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 문항 2개(6개 이상 필요); 유형 2종(3종 이상 필요); 객관식·순서·짝·단답 중 1종(2종 이상 필요) |
| 2-5 | Multiprogrammed vs Time Sharing: 시스템의 목적·특징 | Ch02 p.13-14, p.18, p.20-21 | 6 | 2 | 1 | 0 | 2 | 0 | 0 | 1 | 0 | 2 | match 0개(2개 이상 필요) |
| 2-6 | Multiprogrammed vs Time Sharing: process switch(CPU 양도) 발생 시점 | Ch02 p.14, p.20 | 4 | 1 | 0 | 0 | 1 | 0 | 0 | 1 | classify 1 | 0 | 문항 4개(6개 이상 필요); match 0개(2개 이상 필요) |
| 2-7 | Multiprogrammed vs Time Sharing: processor utilization 차이 | Ch02 p.21, p.24 | 5 | 2 | 0 | 0 | 1 | 0 | 0 | 2 | 0 | 5 | 문항 5개(6개 이상 필요); match 0개(2개 이상 필요) |
| 2-8 | Multiprogrammed vs Time Sharing: response time 차이 | Ch02 p.21, p.23-24 | 5 | 3 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 5 | 문항 5개(6개 이상 필요); match 0개(2개 이상 필요) |
| 2-9 | processor utilization 계산 | Ch02 p.21, p.24 | 4 | 0 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 4 | 문항 4개(6개 이상 필요); 유형 2종(3종 이상 필요); 객관식·순서·짝·단답 중 0종(2종 이상 필요) |
| 2-10 | response time 계산 | Ch02 p.21-23 | 6 | 1 | 0 | 0 | 1 | 4 | 0 | 0 | 0 | 6 | — |
| 3-1 | 프로세스 전반의 특징(정의) | Ch03 p.2 | 8 | 4 | 0 | 0 | 1 | 0 | 0 | 3 | 0 | 8 | — |
| 3-2 | 프로세스의 기능(생성·종료·스케줄링·실행 모드) | Ch03 p.3-4, p.7, p.15-16, p.36-37 | 23 | 6 | 1 | 2 | 5 | 0 | 0 | 6 | multi 3 | 10 | — |
| 3-3 | 프로세스 상태 종류 | Ch03 p.12, p.20 | 9 | 3 | 0 | 1 | 2 | 0 | 0 | 3 | 0 | 9 | — |
| 3-4 | 프로세스 상태 변화도와 상태가 변하는 시점 | Ch03 p.12-14, p.20-21 | 13 | 4 | 2 | 2 | 1 | 0 | 0 | 2 | classify 1, multi 1 | 9 | — |
| 3-5 | 프로세스 image의 구성요소 | Ch03 p.22-26 | 5 | 1 | 1 | 0 | 1 | 0 | 0 | 1 | classify 1 | 1 | 문항 5개(6개 이상 필요); match 0개(2개 이상 필요) |
| 3-6 | 프로세스 image 구성요소별 저장 내용 | Ch03 p.22-25 | 10 | 4 | 0 | 0 | 1 | 0 | 0 | 2 | multi 2, classify 1 | 7 | match 0개(2개 이상 필요) |
| 3-7 | PCB(process control block)의 구성요소와 저장 내용 | Ch03 p.5-7, p.26-31 | 7 | 2 | 0 | 1 | 2 | 0 | 0 | 1 | classify 1 | 0 | match 1개(2개 이상 필요) |
| 3-8 | Process switch 발생 시점 | Ch03 p.40-42 | 10 | 3 | 0 | 1 | 2 | 0 | 0 | 2 | classify 2 | 10 | match 1개(2개 이상 필요) |
| 3-9 | Process switch와 상태 변화도의 관계 | Ch03 p.13, p.40-45 | 9 | 6 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 5 | 유형 2종(3종 이상 필요); 객관식·순서·짝·단답 중 1종(2종 이상 필요); match 0개(2개 이상 필요) |
| 3-10 | Interrupt 처리 전 과정의 순서 | Ch03 p.38-39 | 4 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 문항 4개(6개 이상 필요); 유형 2종(3종 이상 필요) |
| 3-11 | Interrupt 처리 과정별 하는 일 | Ch03 p.38-40 | 6 | 2 | 1 | 0 | 1 | 0 | 0 | 2 | 0 | 5 | match 0개(2개 이상 필요) |
| 7-1 | Relocation(재배치)의 의미와 발생 시점·예시 | Ch07 p.4-5, p.25 | 7 | 1 | 0 | 1 | 1 | 1 | 0 | 2 | multi 1 | 0 | match 1개(2개 이상 필요) |
| 7-2 | Protection(보호)의 의미와 발생 시점·예시 | Ch07 p.6-7 | 7 | 2 | 0 | 2 | 1 | 1 | 0 | 1 | 0 | 0 | — |
| 7-3 | Sharing(공유)의 의미와 예시 | Ch07 p.8 | 7 | 1 | 0 | 2 | 1 | 0 | 0 | 2 | classify 1 | 0 | — |
| 7-4 | Fixed partitioning(고정 분할) | Ch07 p.11-13 | 4 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | classify 2 | 0 | 문항 4개(6개 이상 필요) |
| 7-5 | Dynamic partitioning(동적 분할) | Ch07 p.11, p.14-15 | 4 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | classify 1, multi 1 | 0 | 문항 4개(6개 이상 필요) |
| 7-6 | 동적 메모리 할당(배치) 알고리즘에 의한 할당 | Ch07 p.16-20 | 10 | 4 | 0 | 1 | 2 | 0 | 1 | 1 | multi 1 | 10 | match 1개(2개 이상 필요) |
| 7-7 | Buddy system에 의한 메모리 할당 | Ch07 p.21-24 | 5 | 1 | 0 | 0 | 1 | 2 | 1 | 0 | 0 | 5 | 문항 5개(6개 이상 필요) |
| 7-8 | Buddy system에 의한 메모리 반납 | Ch07 p.21-24 | 6 | 2 | 0 | 0 | 1 | 0 | 1 | 1 | classify 1 | 6 | — |
| 7-9 | basic paging system | Ch07 p.27-31 | 7 | 3 | 0 | 0 | 2 | 1 | 0 | 1 | 0 | 0 | — |
| 7-10 | 가상(논리)주소와 실제주소 변환 | Ch07 p.26, p.32-37, p.40-41 | 21 | 3 | 2 | 1 | 2 | 10 | 2 | 1 | 0 | 10 | — |
| 8-1 | Real memory와 virtual memory의 공통점 | Ch08 p.2-4 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 문항 2개(6개 이상 필요); 유형 1종(3종 이상 필요); 객관식·순서·짝·단답 중 1종(2종 이상 필요); match 0개(2개 이상 필요) |
| 8-2 | Real memory와 virtual memory의 차이점 | Ch08 p.2-4 | 3 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | multi 1 | 0 | 문항 3개(6개 이상 필요); match 0개(2개 이상 필요) |
| 8-3 | 가상 기억장치에서 프로그램 실행 과정(page fault 전후) | Ch08 p.5-6, p.24 | 11 | 3 | 3 | 1 | 2 | 0 | 0 | 1 | classify 1 | 11 | — |
| 8-4 | 지역성의 원리 | Ch08 p.7-8 | 7 | 2 | 0 | 0 | 2 | 0 | 0 | 2 | multi 1 | 7 | — |
| 8-5 | TLB 작동 순서 | Ch08 p.19-24 | 11 | 4 | 2 | 1 | 2 | 0 | 0 | 1 | classify 1 | 10 | — |
| 8-6 | Thrashing | Ch08 p.29, p.60-62 | 10 | 2 | 1 | 0 | 2 | 0 | 0 | 2 | graph 1, classify 1, multi 1 | 10 | order 1개(2개 이상 필요) |
| 8-7 | 가상 기억장치의 정책들 | Ch08 p.38-61 | 27 | 7 | 0 | 4 | 7 | 0 | 0 | 6 | classify 2, multi 1 | 9 | — |
| 8-8 | Frame locking | Ch08 p.42 | 5 | 1 | 0 | 1 | 1 | 0 | 0 | 1 | multi 1 | 0 | 문항 5개(6개 이상 필요) |
| 8-9 | 페이지 교체 알고리즘 | Ch08 p.43-53 | 25 | 4 | 1 | 1 | 3 | 3 | 7 | 4 | classify 1, graph 1 | 16 | — |


- 보강 전 기준 미달 항목: 24/40
- **mcq 중 보기가 4~5개가 아닌 문항: 0개**(OS mcq 105개 모두 4~5개) — 보기 수 조정 없음
- **영어 단어·약자 문항(보강 전, 자동 집계)**: Ch02 14 · Ch03 48 · Ch07 21 · Ch08 40. 집계 기준(`isEnglishQuestion`): blank는 첫 정답이 영어이거나 지문이 영어·약자로 쓰라고 할 때, mcq·multi는 보기 2개 이상, match는 한쪽 항목 2개 이상, order·classify는 항목 2개 이상에 영어 단어(2글자 이상)가 있을 때
- 힌트 범위 밖 기존 문항(지우지 않음, ⭐ 아님): 자원 관리자·디바이스 드라이버, I/O 흐름, 직렬 처리, SMP·멀티코어, 세그먼테이션 일부·논리/물리적 구성, 2단계·역 페이지 테이블, 페이지 크기 그래프(필기 ⭐는 유지), 워킹 셋 등

### 보강 후 (2026-10-07)

용어 단답형(os-chXX-term-NNN, 123개)은 힌트 항목 집계와 형식 규칙에서 **제외**하고 따로 센다(아래). 보강 문항은 `data/subjects/os/chNN-hint.ts`(63개: Ch02 26 · Ch03 18 · Ch07 11 · Ch08 8).

| 항목 | 내용 | 문항(기존 → 보강 후) | 유형(기존 → 보강 후) | 규칙 |
|---|---|---|---|---|
| 2-1 | 운영체제의 목적(목표) | 7 → **7** | mcq 3, match 2, blank 1, ox 1 → mcq 3, match 2, blank 1, ox 1 | 충족 |
| 2-2 | 운영체제가 제공하는 서비스 | 11 → **14** | mcq 6, blank 1, ox 3, multi 1 → mcq 6, match 2, blank 2, ox 3, multi 1 | 충족 |
| 2-3 | 커널 | 3 → **6** | blank 1, classify 1, multi 1 → mcq 1, match 1, blank 2, classify 1, multi 1 | 충족 |
| 2-4 | 커널 함수의 호출 시점 | 2 → **6** | mcq 1, ox 1 → mcq 2, order 1, blank 2, ox 1 | 충족 |
| 2-5 | Multiprogrammed vs Time Sharing: 시스템의 목적·특징 | 6 → **10** | mcq 2, order 1, blank 2, ox 1 → mcq 3, order 1, match 3, blank 2, ox 1 | 충족 |
| 2-6 | Multiprogrammed vs Time Sharing: process switch(CPU 양도) 발생 시점 | 4 → **7** | mcq 1, blank 1, ox 1, classify 1 → mcq 2, match 2, blank 1, ox 1, classify 1 | 충족 |
| 2-7 | Multiprogrammed vs Time Sharing: processor utilization 차이 | 5 → **9** | mcq 2, blank 1, ox 2 → mcq 2, match 4, blank 1, ox 2 | 충족 |
| 2-8 | Multiprogrammed vs Time Sharing: response time 차이 | 5 → **10** | mcq 3, blank 1, ox 1 → mcq 4, match 4, blank 1, ox 1 | 충족 |
| 2-9 | processor utilization 계산 | 4 → **9** | calc 3, ox 1 → mcq 1, match 1, blank 1, calc 5, ox 1 | 충족 |
| 2-10 | response time 계산 | 6 → **9** | mcq 1, blank 1, calc 4 → mcq 2, match 1, blank 1, calc 5 | 충족 |
| 3-1 | 프로세스 전반의 특징(정의) | 8 → **8** | mcq 4, blank 1, ox 3 → mcq 4, blank 1, ox 3 | 충족 |
| 3-2 | 프로세스의 기능(생성·종료·스케줄링·실행 모드) | 23 → **23** | mcq 6, order 1, match 2, blank 5, ox 6, multi 3 → mcq 6, order 1, match 2, blank 5, ox 6, multi 3 | 충족 |
| 3-3 | 프로세스 상태 종류 | 9 → **9** | mcq 3, match 1, blank 2, ox 3 → mcq 3, match 1, blank 2, ox 3 | 충족 |
| 3-4 | 프로세스 상태 변화도와 상태가 변하는 시점 | 13 → **13** | mcq 4, order 2, match 2, blank 1, ox 2, classify 1, multi 1 → mcq 4, order 2, match 2, blank 1, ox 2, classify 1, multi 1 | 충족 |
| 3-5 | 프로세스 image의 구성요소 | 5 → **8** | mcq 1, order 1, blank 1, ox 1, classify 1 → mcq 2, order 1, match 2, blank 1, ox 1, classify 1 | 충족 |
| 3-6 | 프로세스 image 구성요소별 저장 내용 | 10 → **13** | mcq 4, blank 1, ox 2, multi 2, classify 1 → mcq 5, match 2, blank 1, ox 2, multi 2, classify 1 | 충족 |
| 3-7 | PCB(process control block)의 구성요소와 저장 내용 | 7 → **11** | mcq 2, match 1, blank 2, ox 1, classify 1 → mcq 3, match 2, blank 4, ox 1, classify 1 | 충족 |
| 3-8 | Process switch 발생 시점 | 10 → **13** | mcq 3, match 1, blank 2, ox 2, classify 2 → mcq 3, order 1, match 3, blank 2, ox 2, classify 2 | 충족 |
| 3-9 | Process switch와 상태 변화도의 관계 | 9 → **13** | mcq 6, ox 3 → mcq 6, order 1, match 2, blank 1, ox 3 | 충족 |
| 3-10 | Interrupt 처리 전 과정의 순서 | 4 → **8** | mcq 1, order 3 → mcq 2, order 4, match 1, blank 1 | 충족 |
| 3-11 | Interrupt 처리 과정별 하는 일 | 6 → **9** | mcq 2, order 1, blank 1, ox 2 → mcq 2, order 1, match 2, blank 2, ox 2 | 충족 |
| 7-1 | Relocation(재배치)의 의미와 발생 시점·예시 | 7 → **9** | mcq 1, match 1, blank 1, calc 1, ox 2, multi 1 → mcq 1, match 3, blank 1, calc 1, ox 2, multi 1 | 충족 |
| 7-2 | Protection(보호)의 의미와 발생 시점·예시 | 7 → **9** | mcq 2, match 2, blank 1, calc 1, ox 1 → mcq 2, match 3, blank 2, calc 1, ox 1 | 충족 |
| 7-3 | Sharing(공유)의 의미와 예시 | 7 → **8** | mcq 1, match 2, blank 1, ox 2, classify 1 → mcq 1, match 3, blank 1, ox 2, classify 1 | 충족 |
| 7-4 | Fixed partitioning(고정 분할) | 4 → **7** | mcq 1, blank 1, classify 2 → mcq 2, match 1, blank 2, classify 2 | 충족 |
| 7-5 | Dynamic partitioning(동적 분할) | 4 → **6** | mcq 1, blank 1, classify 1, multi 1 → mcq 2, match 1, blank 1, classify 1, multi 1 | 충족 |
| 7-6 | 동적 메모리 할당(배치) 알고리즘에 의한 할당 | 10 → **11** | mcq 4, match 1, blank 2, trace 1, ox 1, multi 1 → mcq 4, match 2, blank 2, trace 1, ox 1, multi 1 | 충족 |
| 7-7 | Buddy system에 의한 메모리 할당 | 5 → **7** | mcq 1, blank 1, calc 2, trace 1 → mcq 1, order 1, match 1, blank 1, calc 2, trace 1 | 충족 |
| 7-8 | Buddy system에 의한 메모리 반납 | 6 → **8** | mcq 2, blank 1, trace 1, ox 1, classify 1 → mcq 2, order 1, match 1, blank 1, trace 1, ox 1, classify 1 | 충족 |
| 7-9 | basic paging system | 7 → **7** | mcq 3, blank 2, calc 1, ox 1 → mcq 3, blank 2, calc 1, ox 1 | 충족 |
| 7-10 | 가상(논리)주소와 실제주소 변환 | 21 → **21** | mcq 3, order 2, match 1, blank 2, calc 10, trace 2, ox 1 → mcq 3, order 2, match 1, blank 2, calc 10, trace 2, ox 1 | 충족 |
| 8-1 | Real memory와 virtual memory의 공통점 | 2 → **6** | mcq 2 → mcq 3, match 2, blank 1 | 충족 |
| 8-2 | Real memory와 virtual memory의 차이점 | 3 → **6** | mcq 1, blank 1, multi 1 → mcq 1, match 2, blank 2, multi 1 | 충족 |
| 8-3 | 가상 기억장치에서 프로그램 실행 과정(page fault 전후) | 11 → **11** | mcq 3, order 3, match 1, blank 2, ox 1, classify 1 → mcq 3, order 3, match 1, blank 2, ox 1, classify 1 | 충족 |
| 8-4 | 지역성의 원리 | 7 → **7** | mcq 2, blank 2, ox 2, multi 1 → mcq 2, blank 2, ox 2, multi 1 | 충족 |
| 8-5 | TLB 작동 순서 | 11 → **11** | mcq 4, order 2, match 1, blank 2, ox 1, classify 1 → mcq 4, order 2, match 1, blank 2, ox 1, classify 1 | 충족 |
| 8-6 | Thrashing | 10 → **11** | mcq 2, order 1, blank 2, ox 2, graph 1, classify 1, multi 1 → mcq 2, order 2, blank 2, ox 2, graph 1, classify 1, multi 1 | 충족 |
| 8-7 | 가상 기억장치의 정책들 | 27 → **27** | mcq 7, match 4, blank 7, ox 6, classify 2, multi 1 → mcq 7, match 4, blank 7, ox 6, classify 2, multi 1 | 충족 |
| 8-8 | Frame locking | 5 → **6** | mcq 1, match 1, blank 1, ox 1, multi 1 → mcq 2, match 1, blank 1, ox 1, multi 1 | 충족 |
| 8-9 | 페이지 교체 알고리즘 | 25 → **25** | mcq 4, order 1, match 1, blank 3, calc 3, trace 7, ox 4, classify 1, graph 1 → mcq 4, order 1, match 1, blank 3, calc 3, trace 7, ox 4, classify 1, graph 1 | 충족 |

- **미달 항목 24/40 → 0/40.** 규칙은 `data/subjects/os/hints.test.ts`가 `npm test`에서 검사한다
- **영어 단어·약자 문항(자동 집계)**: Ch02 14 → 50 · Ch03 48 → 102 · Ch07 21 → 56 · Ch08 40 → 76 (용어 단답형 포함 — 지문이 "한국어 또는 영어"로 쓰라고 함. 용어 단답형을 빼면 Ch02 26 · Ch03 66 · Ch07 28 · Ch08 45)
- **⭐ 문항**: 보강 전(교수님 필기만) Ch02 22 · Ch03 63 · Ch07 30 · Ch08 71 = 186 → 보강 후 필기 + 시험 힌트 Ch02 22+69 · Ch03 63+88 · Ch07 30+79 · Ch08 71+74 = 496(용어 단답형 중 힌트 범위 포함)
- 계산·시뮬레이션: 2장 계산 문항 7개와 생성기 지문에 response time·processor utilization 병기, 계산 2개 추가(cpuTime.ts). 7장 주소 변환(calc 10 + trace 2 + 생성기 2)·버디(trace·calc·생성기 2)·동적 할당(trace·생성기 2), 8장 교체 알고리즘(trace 7·calc 3·생성기 2)은 기존 문항으로 충분해 계산 문항은 추가하지 않았다(버디는 할당·반납 순서 order 2개만 추가)

## 렌더링이 바뀐 기존 문항 (렌더링 해시 비교, 기준 586개 중 312개 — 모두 OS)

1. **내용을 고친 문항 10개**: 지문에 영어 병기 7개(`os-ch02-time-calc-001`, `os-ch02-time-calc-002`, `os-ch02-time-calc-003`, `os-ch02-time-calc-004`, `os-ch02-time-calc-005`, `os-ch02-time-calc-006`, `os-ch02-time-calc-007`), 용어 연결로 accept에 영어 추가 3개(`os-ch08-page-fault-004`, `os-ch08-locality-001`, `os-ch08-pte-003`). 보기 수 조정은 없음(OS mcq 모두 4~5개)
2. **시험 힌트로 새로 ⭐(exam-hint)가 된 문항 135개**: ⭐ 뱃지 "시험 힌트" 표시가 생김(정답·해설 변경 없음)
3. **이미 교수님 필기 ⭐이던 문항 167개**: 뱃지는 그대로 "교수님 필기", 툴팁에 시험 힌트 항목 번호가 붙음(정답·해설 변경 없음)

<details><summary>2·3번 문항 id</summary>

- exam-hint(135): ch02-os-goal-001, ch02-os-goal-002, ch02-os-goal-003, ch02-os-goal-004, ch02-os-service-001, ch02-os-service-002, ch02-os-service-003, ch02-evolve-001, ch02-evolve-002, ch02-evolve-003, ch02-kernel-001, ch02-kernel-002, ch02-kernel-003, ch02-kernel-call-001, ch02-kernel-call-002, ch02-history-001, ch02-history-002, ch02-batch-switch-001, ch02-batch-switch-002, ch02-batch-switch-003, ch02-batch-switch-004, ch02-uniprog-001, ch02-uniprog-003, ch03-creation-001, ch03-creation-002, ch03-creation-003, ch03-pcb-001, ch03-pcb-002, ch03-pcb-003, ch03-pcb-004, ch03-context-001, ch03-context-002, ch03-context-003, ch03-image-001, ch03-image-002, ch03-image-003, ch03-image-004, ch03-image-005, ch03-wait-event-001, ch03-wait-event-002, ch03-wait-event-003, ch03-wait-event-004, ch03-scheduler-001, ch03-scheduler-002, ch03-scheduler-003, ch03-scheduler-004, ch03-scheduler-005, ch03-mode-001, ch03-mode-002, ch03-mode-003, ch03-create-steps-001, ch03-create-steps-002, ch03-resume-001, ch03-resume-002, ch03-resume-003, ch07-requirement-002, ch07-relocation-001, ch07-relocation-002, ch07-relocation-003, ch07-relocation-004, ch07-relocation-005, ch07-protection-001, ch07-protection-002, ch07-protection-003, ch07-protection-004, ch07-protection-005, ch07-protection-006, ch07-sharing-001, ch07-sharing-002, ch07-sharing-003, ch07-sharing-004, ch07-sharing-005, ch07-sharing-006, ch07-partition-001, ch07-partition-002, ch07-partition-003, ch07-partition-004, ch07-partition-005, ch07-partition-006, ch07-partition-007, ch07-address-001, ch07-address-002, ch07-address-003, ch07-address-004, ch07-paging-basic-001, ch07-paging-basic-002, ch07-paging-basic-003, ch07-paging-basic-004, ch07-paging-basic-005, ch07-paging-basic-006, ch07-bit-slice-001, ch07-bit-slice-003, ch07-bit-slice-004, ch07-bit-slice-005, ch07-segmentation-001, ch07-segmentation-003, ch07-segmentation-008, ch07-gen-segmentation-1, ch08-virtual-001, ch08-virtual-002, ch08-virtual-003, ch08-virtual-004, ch08-pte-001, ch08-tlb-cache-002, ch08-policy-001, ch08-placement-policy-001, ch08-placement-policy-002, ch08-placement-policy-003, ch08-replacement-policy-001, ch08-replacement-policy-002, ch08-replacement-policy-003, ch08-lock-001, ch08-lock-002, ch08-lock-003, ch08-lock-004, ch08-lfu-001, ch08-lfu-002, ch08-lfu-003, ch08-lfu-004, ch08-enhanced-clock-001, ch08-enhanced-clock-002, ch08-enhanced-clock-003, ch08-enhanced-clock-004, ch08-enhanced-clock-005, ch08-cleaning-001, ch08-cleaning-002, ch08-cleaning-003, ch08-cleaning-004, ch08-page-buffering-001, ch08-page-buffering-002, ch08-resident-set-001, ch08-resident-set-002, ch08-resident-set-003, ch08-resident-set-004, ch08-resident-set-005
- handwritten + hintIds(167): ch02-not-supported-001, ch02-not-supported-002, ch02-not-supported-003, ch02-not-supported-004, ch02-not-supported-005, ch02-not-supported-006, ch02-not-supported-007, ch02-not-supported-008, ch02-time-calc-008, ch02-time-calc-009, ch02-time-calc-010, ch02-time-calc-011, ch02-time-calc-012, ch02-time-calc-013, ch02-time-calc-014, ch03-process-def-001, ch03-process-def-002, ch03-process-def-003, ch03-process-def-004, ch03-process-def-005, ch03-process-def-006, ch03-process-def-007, ch03-process-def-008, ch03-termination-001, ch03-termination-002, ch03-termination-003, ch03-termination-004, ch03-termination-005, ch03-termination-006, ch03-termination-007, ch03-termination-008, ch03-termination-009, ch03-termination-010, ch03-stack-001, ch03-stack-002, ch03-stack-003, ch03-stack-004, ch03-stack-005, ch03-stack-006, ch03-stack-007, ch03-stack-008, ch03-state-001, ch03-state-002, ch03-state-003, ch03-state-004, ch03-state-005, ch03-state-006, ch03-state-007, ch03-state-008, ch03-state-009, ch03-state-010, ch03-suspend-001, ch03-suspend-002, ch03-suspend-003, ch03-suspend-004, ch03-suspend-005, ch03-suspend-006, ch03-suspend-007, ch03-suspend-008, ch03-interrupt-001, ch03-interrupt-002, ch03-interrupt-003, ch03-interrupt-004, ch03-interrupt-005, ch03-interrupt-006, ch03-interrupt-007, ch03-interrupt-008, ch03-interrupt-009, ch03-process-switch-001, ch03-process-switch-002, ch03-process-switch-003, ch03-process-switch-004, ch03-process-switch-005, ch03-process-switch-006, ch03-process-switch-007, ch03-process-switch-008, ch03-process-switch-009, ch03-process-switch-010, ch07-placement-001, ch07-placement-002, ch07-placement-003, ch07-placement-004, ch07-placement-005, ch07-placement-006, ch07-placement-007, ch07-placement-008, ch07-gen-placement-1, ch07-gen-placement-2, ch07-buddy-001, ch07-buddy-002, ch07-buddy-003, ch07-buddy-004, ch07-buddy-005, ch07-buddy-006, ch07-buddy-007, ch07-buddy-008, ch07-gen-buddy-2, ch07-gen-buddy-1, ch07-translation-001, ch07-translation-002, ch07-translation-003, ch07-translation-004, ch07-translation-005, ch07-translation-006, ch07-translation-007, ch07-translation-008, ch07-gen-paging-1, ch07-gen-paging-2, ch08-page-fault-001, ch08-page-fault-002, ch08-page-fault-003, ch08-page-fault-005, ch08-page-fault-006, ch08-page-fault-007, ch08-page-fault-008, ch08-page-fault-009, ch08-locality-002, ch08-locality-003, ch08-locality-004, ch08-locality-005, ch08-locality-006, ch08-locality-007, ch08-tlb-001, ch08-tlb-002, ch08-tlb-003, ch08-tlb-004, ch08-tlb-005, ch08-tlb-006, ch08-tlb-007, ch08-tlb-008, ch08-tlb-009, ch08-tlb-010, ch08-thrashing-001, ch08-thrashing-002, ch08-thrashing-003, ch08-thrashing-004, ch08-thrashing-005, ch08-thrashing-006, ch08-thrashing-007, ch08-thrashing-008, ch08-thrashing-009, ch08-thrashing-010, ch08-fetch-001, ch08-fetch-002, ch08-fetch-003, ch08-fetch-004, ch08-fetch-005, ch08-fetch-006, ch08-fetch-007, ch08-fetch-008, ch08-fetch-009, ch08-replacement-001, ch08-replacement-002, ch08-replacement-003, ch08-replacement-004, ch08-replacement-005, ch08-replacement-006, ch08-replacement-007, ch08-replacement-008, ch08-gen-replacement-3, ch08-gen-replacement-2, ch08-clock-001, ch08-clock-002, ch08-clock-003, ch08-clock-004, ch08-clock-005, ch08-clock-006

</details>

# Sprint 4 — OS 시뮬레이터 / 문제 생성기 (`lib/sim/os/*`)

## 목표

원본 §6에 명시된 8개 시뮬레이터를 구현하고, 슬라이드 기준값을 Vitest로 **고정**해 오답키가 나올 수 없게 만든다. 모든 계산·시뮬레이션 문제의 정답은 이 모듈을 통해서만 산출된다.

## 작업 항목

- [ ] 공용 기반: `lib/sim/_shared/rng.ts`(seed PRNG), `lib/sim/_shared/types.ts`(`Generator` 인터페이스) — [`multi-subject-design.md`](../multi-subject-design.md) §6
- [ ] `lib/sim/os/generators.ts`에 OS 생성기 맵을 모으고 `data/subjects/os/index.ts`의 `generators`에 연결 (생성 문제 id: `os-{chapter}-gen-{name}-{seed}`, `subject: 'os'`)
- [ ] `lib/sim/os/paging.ts` — 논리→물리, 물리→논리(선형탐색), 페이지 테이블 빈칸(x) 역산, 비트 슬라이싱(2^k 페이지)
  - [ ] 테스트: 페이지 크기 1024 기준값(논리 3→물리 1027, 논리 1026→물리 2050, 물리 2050→논리 1026, 논리 2049→물리 1·x=0), 페이지 크기 1000 예시(논리 1179→물리 5179)
- [ ] `lib/sim/os/segmentation.ts` — 세그먼트 변환 + 길이 초과 시 보호위반(트랩) 판정
  - [ ] 테스트: 세그먼트 테이블 기준값(논리 3→물리 1027, 논리 1026→물리 2050, 논리 2049→물리 1·x=0), 길이초과 트랩 케이스
- [ ] `lib/sim/os/buddy.ts` — 2^k 올림 할당, 분할(왼쪽 할당), 반납 시 buddy 병합(연쇄), 트리/표 상태 출력
  - [ ] **중요(실사 확인됨, `source-diff.md` Ch07 참고)**: 두 블록이 단순히 둘 다 free라고 병합되는 게 아니라, **같은 분할(split)에서 나온 buddy 쌍이 둘 다 비분할·free 상태일 때만** 병합된다(Ch07 p.23 Release A 사례: A의 buddy가 C+64K로 더 쪼개져 있어 둘 다 비어도 병합 불가). 따라서 내부적으로 이진 트리(또는 분할 계보를 추적하는 등가 구조)로 구현해야 하며, 단순 "인접 free 블록 병합"으로 구현하면 틀린다.
  - [ ] 테스트: 1MB 시나리오(A=100K→B=240K→C=64K→D=256K→Release B→Release A→E=75K→Release C→Release E→Release D ⇒ 최종 1MB 완전 병합). 슬라이드(Ch07 p.23)에서 직접 전사한 단계별 전체 상태를 그대로 고정: Request100K(A=128K|128K|256K|512K) → Request240K(…B=256K|512K) → Request64K(…C=64K|64K|B=256K|512K) → Request256K(…D=256K|256K) → ReleaseB → ReleaseA(병합 안 됨 확인) → Request75K(E가 A 자리 재사용) → ReleaseC(C+64K→128K 병합) → ReleaseE(E+128K+256K→512K 병합) → ReleaseD(전체 1M 병합)
- [ ] `lib/sim/os/placement.ts` — First/Best/Next/Worst-fit 블록 선택, Next-fit wrap-around 처리
  - [ ] 테스트: 각 알고리즘 선택 결과가 다르게 나오는 케이스 + wrap-around 케이스
- [ ] `lib/sim/os/cpuTime.ts` — 다중프로그램 일괄처리/시분할 첫 응답시간, 유효 CPU 이용률
  - [ ] 테스트: N=10,T=1,s=0.01,q=0.1 ⇒ 일괄 9.2초/시분할 1.1초, 이용률 10/11≈0.91 vs 10/10.1≈0.99; 별도 예시 7/10=0.7
- [ ] `lib/sim/os/replacement.ts` — OPT/FIFO/LRU/Clock/Enhanced Clock, 단계별 상태표(프레임 내용/폴트 F/use bit/next pointer) 반환
  - [ ] 테스트: Clock 규칙(참조 시 use=1, 포인터는 교체 시에만 이동, 모든 use=1이면 한 바퀴 돌며 전부 0 후 두 바퀴째 교체), Enhanced Clock 4분류 스캔 순서
  - [ ] **추가 기준값(실사 확인됨, Stallings 교과서 표준 예시, `source-diff.md` Ch08 참고)**: Ch08 슬라이드 p.48 "Figure 8.15 Behavior of Four Page-Replacement Algorithms" — 참조열 `2,3,2,1,5,2,4,5,3,2,5,2`(12개), 프레임 3개, OPT/LRU/FIFO/CLOCK 4개 알고리즘 비교. **집계 규칙**: F(폴트)는 "3개 프레임이 최초로 다 채워진 이후"에만 집계(최초 3회의 compulsory miss는 F로 세지 않음). 이 스프린트 시작 시 해당 페이지를 다시 고해상도로 렌더링해 셀 값을 한 칸씩 재대조하고 정확한 기준값으로 확정할 것(참조열·프레임수·F 집계 규칙은 이미 확정, 셀별 수치만 재확인 필요).
  - [ ] **추가 기준값**: Ch08 p.49-50 "Figure 8.16 Example of Clock Policy Operation" — 10개 프레임 원형 버퍼 예시. (a) pointer가 frame2(use=1)에서 시작해 frame3(use=1→0 변경)을 지나 frame4(page556, use=0)에서 교체. (b) 교체 후 frame4=새page(use=1), pointer는 frame5로 이동. "이 상태에서 또 폴트가 나면 어느 프레임이 교체되는가" 질문의 정답은 frame5(이미 use=0이므로 즉시 교체) — Clock 포인터 이동 규칙의 mcq/calc 테스트 케이스로 활용.
- [ ] `lib/sim/os/processScenario.ts` — 상태전이/인터럽트 분류용 시나리오 생성기 (정적 데이터 + 랜덤 조합)
- [ ] `lib/sim/os/memoryCapacity.ts` — n비트 주소공간/페이지 크기/엔트리 크기 → 페이지 수·테이블 크기·2단계 필요 여부, Inverted page table 엔트리 수
  - [ ] 테스트: 4GB/4KB/4B 엔트리 ⇒ 약 100만 엔트리·4MB 테이블·4KB 페이지 1024개 필요(2단계), Inverted table 프레임 100만개

## 완료 기준 (DoD)

- 8개 모듈 전부 구현, 각 모듈에 원본 §6 기준값을 그대로 담은 Vitest 테스트 통과
- 모든 함수가 순수 함수(동일 입력 → 동일 출력), 전역 상태 없음
- "새 문제 생성" 시 seed만 바꿔 호출해도 일관된 스키마의 결과를 반환하는지 확인하는 스모크 테스트 1개 이상 — **레지스트리의 모든 과목 생성기를 순회**하도록 작성(seed 20개, 같은 seed 재호출 결과 동일, 생성 문제가 무결성 검사 통과)해서 Sprint 9의 데이터 통신 생성기도 자동으로 검사 대상이 되게 한다

## 다음 스프린트와의 연결

- Sprint 6(Ch07·Ch08 콘텐츠)의 버디/배치/페이지교체/주소변환 문제들이 이 모듈을 직접 호출한다.
- Sprint 8(비슷한 문제 새로 생성)도 이 모듈의 생성기 함수를 재사용한다.

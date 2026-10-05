# 로드맵 / 스프린트 인덱스

진행 상태는 작업할 때마다 이 표를 갱신한다. 상태값: `TODO` / `IN PROGRESS` / `DONE`.

| # | 스프린트 | 핵심 산출물 | 상태 |
|---|---|---|---|
| 1 | [프로젝트 기반 구축](./sprints/sprint-01-foundation.md) | 스캐폴딩, 다크모드, 라우팅 틀, safeStorage | DONE |
| 2 | [다과목 구조 전환 + OS 회귀](./sprints/sprint-02-multi-subject.md) | 과목 레지스트리, `/s/[subject]` 라우팅, 과목별 localStorage + 자동 마이그레이션, `lib/sim/{과목}` 규칙 | DONE |
| 3 | [문제 유형 엔진](./sprints/sprint-03-question-engine.md) | 데이터 모델(`subject` 포함), 문제 유형 레지스트리, 10종 렌더러/채점기 + 단위 테스트 | DONE |
| 4 | [OS 시뮬레이터/생성기](./sprints/sprint-04-simulators.md) | `lib/sim/os/*` 8종 + Vitest 기준값 테스트 | DONE |
| 5 | [OS 콘텐츠: Ch02·Ch03](./sprints/sprint-05-content-os-ch02-ch03.md) | 정적 문제 ≥130문항 | DONE |
| 6 | [OS 콘텐츠: Ch07·Ch08](./sprints/sprint-06-content-os-ch07-ch08.md) | 정적 문제 ≥200문항 + 생성기 연동 문제 | DONE |
| 7 | [화면/UX 구현](./sprints/sprint-07-screens-ux.md) | 홈(과목)/과목 홈/챕터/퀴즈/결과/오답노트(과목 탭+전체) | DONE |
| 8 | [학습 기능 고도화](./sprints/sprint-08-learning-features.md) | 과목별·전체 대시보드, 비슷한 문제 생성, 버전 있는 JSON 내보내기/가져오기 | DONE |
| 9 | [데이터 통신: 계산 생성기 + calc 보강](./sprints/sprint-09-dc-calc-generators.md) | `lib/sim/data-comm/*` 생성기 10개, `calc` 지수 표기·상대 오차, graph SVG 12종 | DONE |
| 10 | [데이터 통신 콘텐츠: Ch01·Ch02](./sprints/sprint-10-dc-content.md) | 정적 문제 ≥163문항 (Ch01 ≥57, Ch02 ≥106, ⭐ 3개 printed-emphasis) | TODO |
| 11 | [QA & 배포 준비](./sprints/sprint-11-qa-release.md) | 전 과목 접근성·반응형 점검, lint/test/build, README | TODO |

## 의존 관계 요약

```
Sprint 1 ──▶ Sprint 2 ──▶ Sprint 3 ──▶ Sprint 5 ─┐
                     └──▶ Sprint 4 ──▶ Sprint 6 ─┴─▶ Sprint 7 ──▶ Sprint 8 ──▶ Sprint 9 ──▶ Sprint 10 ──▶ Sprint 11
                                                                               ▲
                                    dc-source-analysis.md (완료, 확인 필요 전 항목 결정됨) ┘
```

- Sprint 2(다과목 전환)는 문제 유형 엔진보다 먼저 한다 — 이후 모든 데이터·저장소·생성기 코드를 처음부터 과목 단위로 쓰기 위해서다.
- Sprint 3(유형 엔진)과 Sprint 4(OS 시뮬레이터)는 서로 독립적이라 병행 가능 (둘 다 Sprint 2 이후).
- Sprint 5(Ch02·03 콘텐츠)는 Sprint 3 완료 후 시작. Sprint 6(Ch07·08)은 Sprint 3+4 완료 후 시작(생성기 기반 문제 포함).
- Sprint 7(화면)은 최소 Sprint 3 완료 + 콘텐츠 일부(Sprint 5)가 있어야 실제 동작 확인 가능.
- **OS 핵심 스프린트(2~8)가 모두 끝난 뒤** 데이터 통신 고유 스프린트(9·10)를 진행한다. 화면·학습 기능은 과목 공용으로 만들어 두었으므로 데이터 통신은 생성기·SVG·콘텐츠만 추가한다(새 문제 유형 없음).
- 데이터 통신 PDF 분석(`dc-source-analysis.md`)은 완료됐고 "확인 필요" 전 항목이 결정됐다.
- Sprint 11(QA)은 두 과목 전체를 대상으로 마지막에 한 번 한다.

## 변경 이력

- 2026-10-04: 최초 작성 (원본 요구사항 `antigravity_prompt_os_exam_app.md` 기준).
- 2026-10-04: `source/` PDF 4개(Ch02/Ch03/Ch07/Ch08) 실사 대조 완료 → [`source-diff.md`](./source-diff.md), [`coverage-matrix.md`](./coverage-matrix.md) 추가. §7과 PDF 간 의미 있는 불일치는 0건으로 확인됨(§7을 그대로 신뢰 가능). Sprint 3 문서에 버디 시스템의 "분할 계보 기반 병합" 규칙과 Ch08 Figure 8.15/8.16 추가 기준값을 반영함. Sprint 1 착수.
- 2026-10-04: Sprint 1 완료. lint/test(4건)/build 통과, 5개 라우트 200 응답 및 외부 CDN 요청 0건 확인. Tailwind v4라 `darkMode: 'class'` 대신 `globals.css`의 `@custom-variant dark`로 구현, Vitest 설정은 ESM 경고 때문에 `vitest.config.mts`로 둠.
- 2026-10-04: **다과목 구조로 확장** (os + 두 번째 과목 — 이때는 "데이터과학"으로 잘못 지시됨, 아래 정정 항목 참고). [`multi-subject-design.md`](./multi-subject-design.md) 추가. 스프린트 재배치: Sprint 2 "다과목 구조 전환 + OS 회귀" 신설 → 기존 2~7이 3~8로 한 칸씩 밀림 → 두 번째 과목 고유 Sprint 9·10 신설 → 기존 8(QA)은 11로 이동. Sprint 3 데이터 모델에 `subject` 필드와 문제 유형 레지스트리 포함, OS 문제 id에 `os-` 접두사, `lib/sim/` → `lib/sim/os/`, `data/chXX.ts` → `data/subjects/os/chXX.ts`. OS PDF를 `source/os/`로 이동.
- 2026-10-04: **과목 정정 — "데이터과학"이 아니라 "데이터 통신"**. 과목 id `data-science` → `data-comm`, 표시 이름 "데이터 통신", PDF 폴더 `source/data-science/` → `source/data-communication/`(PDF 2개 그대로 보존, SHA-256 일치 확인). PDF를 읽기 전 데이터과학을 가정해 만든 `ds-source-analysis.md`, `ds-question-types.md`, Sprint 9·10 문서는 **폐기하고** PDF 2개(`DC-1-Introduction.pdf` 44장, `DC-2-PhyLayer.pdf` 101장) 전수 분석 후 다시 작성: [`dc-source-analysis.md`](./dc-source-analysis.md), [`dc-question-types.md`](./dc-question-types.md), [Sprint 9](./sprints/sprint-09-dc-calc-generators.md), [Sprint 10](./sprints/sprint-10-dc-content.md). 결과: 챕터 `ch01` 개요·`ch02` 물리 계층, 코드 0줄 → `code-*` 유형 4종 계획에서 제외(새 유형 없음, `calc` 입력 보강만), Ch02 공식 기반 생성기 10개, 교수님 필기 0건 → ⭐ 확정 0·⭐ 후보 3(인쇄된 "very important"), 목표 Ch01 ≥57·Ch02 ≥94(⭐ 후보 확정 시 106). 스프린트 순서 규칙(다과목 전환 = Sprint 2, 과목 고유 = OS 핵심 2~8 뒤 9·10, QA = 11)은 그대로 유지. `multi-subject-design.md` 레지스트리 예시를 `os`, `data-comm`으로 수정. → 이후 106으로 확정(43줄)
- 2026-10-04: **데이터 통신 확인 필요 답변 반영.** 필기본 없음(PDF 2개가 전부) → 필기 기반 ⭐ 0. 인쇄된 "very important" 2곳(Ch02 s.33, s.48)을 ⭐로 확정하고 근거를 `printed-emphasis`로 구분(OS ⭐는 `handwritten`) — 문제 데이터 모델에 `examBasis` 필드 추가(Sprint 3 범위). 비트 길이 문제는 답 단위 명시 + 해설에 정의(거리)/예제(시간) 차이 한 줄. 나머지 확인 필요 3~10번은 제안대로. 챕터 최소 문항 수 확정: Ch01 ≥57, Ch02 ≥106(일반 24개 = 82 + ⭐ 3개 × 8 = 24).
- 2026-10-04: **Sprint 2 완료.** 과목 레지스트리(`data/subjects/`, os·data-comm), `/s/[subject]`·`/s/[subject]/chapter/[id]` 라우팅 + `/chapter/:id` → `/s/os/chapter/:id` 리다이렉트, 헤더 브레드크럼, `/review`·`/stats` 과목 탭, 과목별 localStorage 키 + v1→v2 자동 마이그레이션, `lib/sim/` 과목 폴더 규칙. OS 회귀 14/14(전·후 동일), Vitest 4 → 40건 통과, lint·build 통과. 조정: 문제 0개 과목 카드는 비활성 대신 "문제 준비 중" 링크.
- 2026-10-04: **Sprint 3 구현.** 문제 데이터 모델(`examBasis` 포함), 문제 유형 레지스트리(core/UI 2곳, UI 등록 누락 시 빌드 실패 확인), 10종 채점기·렌더러, 키보드 훅, `/playground` 유형 미리보기. Vitest 104건·lint·build 통과. 결정: multi 부분점수 = max(0,(맞게 고른 수−잘못 고른 수)/정답 수), order = 상대 순서 일치 쌍 비율·items는 정답 순서로 저장 후 고정 셔플, graph = 정규화 좌표 곡선 데이터→인라인 SVG, 숫자키 동작은 core의 `applyChoice`.
- 2026-10-04: **Sprint 3 완료.** 브라우저(Chrome, 프로덕션 빌드)에서 키보드만으로 mcq/ox 풀이 확인, 10종 입력·채점 화면 텍스트 대비 라이트 902개·다크 1,108개 모두 기준 통과, OS 회귀 14/14, 콘솔 오류 없음.
- 2026-10-04: **채점 결과 표시·판정 규칙 변경.** 결과 화면 맨 위에 "✓ 정답 / ✗ 오답" 큰 배너, 완전히 맞았을 때만 정답(부분 점수가 있어도 하나라도 틀리면 오답), 부분 점수는 아래에 작게 보조 표시. 학습 기록·통계·오답노트도 완전히 맞음 기준으로 세고 부분 점수는 `lastScore`에 저장만 — `lib/storage/records.ts`(`recordAttempt`, `summarize`) 추가. 판정·기록 테스트 15건 추가(전체 119건). 배너 대비 라이트·다크 모두 4.5:1 이상 확인. Sprint 7·8 문서에 규칙 반영.
- 2026-10-04: **Sprint 4 완료.** `lib/sim/os/` 시뮬레이터 8종(페이징·세그먼테이션·버디(분할 트리)·배치·CPU 시간·페이지 교체(OPT/LRU/FIFO/Clock/Enhanced Clock)·메모리 용량·프로세스 시나리오) + 생성기 8개(지연 로딩). Ch08 p.48 Figure 8.15를 200dpi로 재렌더링해 전 칸 전사(F: OPT 3·LRU 4·FIFO 6·CLOCK 5) — source-diff의 마지막 주요 "확인 필요" 해소. 기준값 테스트 73건 + 전 과목 생성기 스모크 테스트, 전체 Vitest 200건·lint·build·OS 회귀 14/14 통과.
- 2026-10-04: **Sprint 4 완료 상태 재확인 + 문서 정정.** lint·test·build 재실행 결과 통과(표의 Sprint 4는 이미 DONE). 데이터 통신 ⭐ 근거를 "인쇄 강조 직접(s.33·s.48)"과 "s.33 범위 확장(13번 Shannon)"으로 구분해 기록, s.41 "important"는 검토 후 ⭐ 제외(Ch02 목표 106 유지). Figure 8.16 프레임 수를 "n개(테스트는 10 가정)"로, "히트 시 pointer 이동 없음"의 근거를 p.48 필기 + Figure 8.15 그림으로 정정. 폴트 수 기준 규칙(초기 적재 포함/이후 둘 다 제공, 문제에 기준 명시·해설에 다른 기준 값) 추가 — 생성기 해설의 다른 기준 값은 미반영(코드 수정 필요) → 해결(다음 줄).
- 2026-10-04: **폴트 수 기준 규칙 반영 완료.** `replacement` 생성기 해설에 "초기 적재까지 포함하면 N회" 추가(F 횟수·trace 변형), Figure 8.15 `misses` 고정(OPT 6·LRU 7·FIFO 9·CLOCK 8), 생성기 해설 검증 테스트 추가, `replacement.ts` 주석의 Clock 규칙 근거를 규칙별로 정정. 앞 줄의 미반영 항목 해결.
- 2026-10-04: **Sprint 5 완료.** `data/subjects/os/ch02.ts` 51문항(⭐ 18, 시간 계산 calc 7은 `cpuTime.ts`로 정답 계산), `ch03.ts` 90문항(⭐ 61). content-checklist Ch02/Ch03 전 항목 체크 + 소주제별 문항 수 기록. 정답 키 채점·문제 내 중복 검사(integrity)와 전 문항 렌더링 테스트(`components/qtypes/render.test.ts`) 추가. 유형 비율은 mcq·ox 과다/blank 부족 — Sprint 6에서 보정.
- 2026-10-04: **Sprint 5 완료 내용 재확인 + 문서 최신화.** `coverage-matrix.md` Ch02·Ch03 표에 소주제별 **실제** 문항 수 열과 전체 합계(141/330) 추가, 스프린트 번호 오기(4·5→5·6) 정정. `source-diff.md` Ch03에 p.4 필기↔p.42 "잘못된 명령" 처리 결과 불일치와 출제 보류 결정 기록.
- 2026-10-05: **Sprint 5 결과 점검(PDF 대조).** OS 서비스는 p.5(6개)+p.6(1개) 인쇄 7가지로 확인 — `coverage-matrix.md`의 "6종"을 7종으로 정정. '잘못된 명령'은 종료 사유 맥락(p.4)만 출제 보류, Process switch 맥락(p.42)은 출제로 결정을 구체화(`source-diff.md`·`content-checklist.md`·sprint-05·ch03.ts 머리 주석). PDF 대조로 해설 3건 수정(`os-ch02-not-supported-008` 오류 탐지 대상 계층, `os-ch03-state-002` 필기 근거 표시, `os-ch03-process-switch-002` 근거 p.36 추가). 정답 변경 없음.
- 2026-10-05: **Sprint 5 보강.** blank 11문항 추가(15→26, 10.6%→16.9%), Ch02 p.24 필기 "과거 CPU 이용률/오늘날 응답시간" 개념 문항 추가(처음 제외 판단 정정) — Ch02 59·Ch03 95, 합계 154. 문항별 PDF 대조 기록 `docs/verification/os-ch02-ch03.md` 신설(기존 141 = 일치 138 + 수정 3, 신규 13), 문제 작성 스프린트마다 같은 형식의 기록을 남기는 규칙을 sprint-06·sprint-10에 추가.
- 2026-10-05: **blank 정답 유일성 점검.** blank 26문항 전수 확인 — `os-ch03-context-003`은 "전환하는 것"이 process switch(p.40)와 겹쳐 답이 둘이라 "전환을 맡는 구성 요소"로 좁힘, `os-ch02-resource-004`·`time-calc-011` 지문을 좁힘, 16문항 accept 보강. 대조 기록의 필기 근거를 문항별로 다시 분류(41 → 31, 단어 검색 과다 집계 정정).
- 2026-10-05: **다크모드 하이드레이션 경고 수정.** `<html>`에 `suppressHydrationWarning`(noFlashScript가 하이드레이션 전에 dark 클래스를 붙여 생기던 className 불일치). 시스템·라이트·다크 새로고침에서 경고 없음 확인.
- 2026-10-05: **Sprint 6 착수 — Ch07 완료(Ch08 대기).** `data/subjects/os/ch07.ts` 89문항(정적 82 + 생성기 7, ⭐ 30), 유형 비율 기준(blank 18~22%·mcq ≤30%·ox ≤18%·trace ≥3) 충족. 슬라이드 기준값 테스트 `ch07.test.ts`, `lib/sim/os/baseBounds.ts` 신규, Ch07 생성기 slideRef 정정. 대조 기록 `docs/verification/os-ch07.md`(일치 80·수정 9·필기 근거 14). coverage-matrix Ch07 slideRef가 실제보다 1쪽 앞인 점 기록.
- 2026-10-05: **Ch07 마무리.** "물리→논리 변환은 선형 탐색이라 느리다"를 p.32-36 이미지로 재확인 — 인쇄·필기 어디에도 없어 해설의 (보충) 유지, source-diff에 "요구사항 §6-1·§7에는 있으나 슬라이드에 없음"으로 기록. coverage-matrix Ch07 slideRef를 실제 PDF 페이지로 정정.
- 2026-10-05: **Sprint 6 완료.** `data/subjects/os/ch08.ts` 138문항(정적 134 + 생성기 4, ⭐ 71) — blank 20.3%·mcq 23.2%·ox 16.7%, trace 7·graph 4. `lib/sim/os/workingSet.ts` 신규, Ch08 생성기 slideRef 정정, 슬라이드 기준값 테스트 `ch08.test.ts`. p.43-51 출제 표시는 p.48뿐 — Clock 정책 동작(Figure 8.16)을 별도 ⭐ 소주제로(지시), LFU/MFU는 ⭐ 아님. TLB 히트/미스/폴트 비교 문항(`tlb-009`). coverage-matrix Ch08 slideRef를 실제 페이지로 정정하고 실제 문항 수 기록(OS 전체 381문항). 대조 기록 `docs/verification/os-ch08.md`.
- 2026-10-05: **Sprint 7 구현·확인 완료(커밋 대기).** 홈·과목 홈·챕터 시작·퀴즈(즉시 채점/시험 모드·타이머·단축키·북마크)·결과·오답노트/북마크 화면을 실제 데이터와 연결. 기록 스토어 `lib/storage/recordsStore.ts`, 세션 `lib/quiz/session.ts`, 375px trace 카드 레이아웃, 핵심 한 줄 요약 대체. 프로덕션 빌드에서 375/1280 × 라이트/다크 전 흐름 확인(넘침·콘솔 오류 0), 저장소 차단 동작 확인, OS 회귀 14/14, 테스트 651건. `/quiz` 쿼리·세션 형식을 multi-subject-design에 반영.
- 2026-10-05: **dev 서버 오류 원인 기록.** `/s/os`의 "Jest worker … child process exceptions"는 고아가 된 `next dev`의 작업자가 메모리 부족 속에서 죽은 것(build와의 `.next` 직접 충돌 아님). 클린 `build && start`에서는 재현되지 않음. 이후 브라우저 확인은 dev 서버를 끈 상태에서 `build && start`로만 한다(sprint-07 운영 메모).
- 2026-10-05: **Sprint 7 완료.** 이 문서와 다르게 한 부분(sprint-07 "이 문서와 다르게 한 부분"): ① summary가 없으면 해설 첫 문장을 핵심 요약으로 ② 640px 미만 trace는 열별 카드 ③ 시험 모드 미응답은 결과·다시 풀기에는 포함, 학습 기록·오답노트에는 미포함 ④ `/quiz` 쿼리 이름을 구현에 맞춰 설계 문서 수정(+ `/stats`는 Sprint 8). 미응답을 오답노트에 넣는 요청은 판정 규칙(오답노트 = 채점된 오답)과 충돌해 보류.
- 2026-10-05: **Sprint 8 완료.** `/stats` 대시보드(과목 → 챕터 → 토픽 진행률·정답률·⭐ 달성도, `lib/stats.ts`), 기록 관리(v2 JSON 내보내기/가져오기 — 합치기·덮어쓰기 다이얼로그, v1 변환, 잘못된 파일·미래 버전·모르는 과목 처리 / 전체·과목별 초기화, `lib/storage/backup.ts`), "비슷한 문제 새로 생성"(`lib/quiz/similar.ts`, seed ≥ 1,000,000 — 기록 분리, `SessionItem.gen`), 오답노트 시도 횟수 표시와 생성기 오답 복원, 헤더 통계 링크(375px는 아이콘 + aria-label). 이 문서와 다르게 한 부분(sprint-08): ① ⭐ 달성도 = 마지막 풀이가 완전히 맞은 ⭐ 문제 비율 ② 가져오기 방식은 파일 단위로 하나 ③ 비슷한 문제 버튼은 즉시 채점에서만. 내보내기 → 초기화 → 가져오기 복원 테스트, 생성 문제 다시 풀기 재생성 테스트 포함. 375/1280 × 라이트/다크 확인(넘침·콘솔 오류 0).
- 2026-10-05: **Sprint 9 완료.** `calc` 보강(지수 표기 `3e8`·`3×10^8`·`3*10^8`·`3x10^8`·`10^6`, 형식 오류 시 제출 막음, `relTolerance`) — OS calc 채점 결과는 보강 전 구현과 비교해 변화 없음. `lib/sim/data-comm/` 계산 함수 10개 + 생성기 10개(signal·digital·decibel·capacity⭐·performance(대역폭-지연 곱⭐)·pcm·modulation·multiplexing·link-fill⭐·tdm-frame), 슬라이드 기준값 41건("s.번호 (p.쪽)"), graph 그림 12종(`kind: "dc"`, 라이트/다크 대비 테스트), `/playground` 데이터 통신 미리보기. 데이터 통신 calc는 모두 입력칸 옆에 단위 표시(무차원 SNR은 "(단위 없음)"). 이 문서와 다르게 한 부분(sprint-09): ① trace 생성기 이름 `link-fill`·`tdm-frame`(id 규칙) ② 입력의 단위 접두어는 해석하지 않음(§2 단위 고정) ③ 영문 x·가수 없는 10^n은 마무리에서 추가(`-10^6`은 거부) ④ graph에 `kind: "dc"` 추가 ⑤ FM·PM은 그림만으로 구별하는 문제를 내지 않음. "(보충)" 규칙: dB ±0.05, 위상 ±0.002, 피크 ±1.5 V, 소수 자리 절반 허용, 유효숫자 3자리 ±0.5%, Shannon ±0.1%, 두 한계에서 고르는 비트율 규칙, 전파·마이크로파 파장에 c 적용, link-fill은 t ≤ 지연. s.97 세 번째 그림 캡션(refraction)과 화살표(반사) 불일치 기록.

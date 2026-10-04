# 로드맵 / 스프린트 인덱스

진행 상태는 작업할 때마다 이 표를 갱신한다. 상태값: `TODO` / `IN PROGRESS` / `DONE`.

| # | 스프린트 | 핵심 산출물 | 상태 |
|---|---|---|---|
| 1 | [프로젝트 기반 구축](./sprints/sprint-01-foundation.md) | 스캐폴딩, 다크모드, 라우팅 틀, safeStorage | DONE |
| 2 | [다과목 구조 전환 + OS 회귀](./sprints/sprint-02-multi-subject.md) | 과목 레지스트리, `/s/[subject]` 라우팅, 과목별 localStorage + 자동 마이그레이션, `lib/sim/{과목}` 규칙 | DONE |
| 3 | [문제 유형 엔진](./sprints/sprint-03-question-engine.md) | 데이터 모델(`subject` 포함), 문제 유형 레지스트리, 10종 렌더러/채점기 + 단위 테스트 | DONE |
| 4 | [OS 시뮬레이터/생성기](./sprints/sprint-04-simulators.md) | `lib/sim/os/*` 8종 + Vitest 기준값 테스트 | DONE |
| 5 | [OS 콘텐츠: Ch02·Ch03](./sprints/sprint-05-content-os-ch02-ch03.md) | 정적 문제 ≥130문항 | TODO |
| 6 | [OS 콘텐츠: Ch07·Ch08](./sprints/sprint-06-content-os-ch07-ch08.md) | 정적 문제 ≥200문항 + 생성기 연동 문제 | TODO |
| 7 | [화면/UX 구현](./sprints/sprint-07-screens-ux.md) | 홈(과목)/과목 홈/챕터/퀴즈/결과/오답노트(과목 탭+전체) | TODO |
| 8 | [학습 기능 고도화](./sprints/sprint-08-learning-features.md) | 과목별·전체 대시보드, 비슷한 문제 생성, 버전 있는 JSON 내보내기/가져오기 | TODO |
| 9 | [데이터 통신: 계산 생성기 + calc 보강](./sprints/sprint-09-dc-calc-generators.md) | `lib/sim/data-comm/*` 생성기 10개, `calc` 지수 표기·상대 오차, graph SVG 12종 | TODO |
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
- 2026-10-04: **과목 정정 — "데이터과학"이 아니라 "데이터 통신"**. 과목 id `data-science` → `data-comm`, 표시 이름 "데이터 통신", PDF 폴더 `source/data-science/` → `source/data-communication/`(PDF 2개 그대로 보존, SHA-256 일치 확인). PDF를 읽기 전 데이터과학을 가정해 만든 `ds-source-analysis.md`, `ds-question-types.md`, Sprint 9·10 문서는 **폐기하고** PDF 2개(`DC-1-Introduction.pdf` 44장, `DC-2-PhyLayer.pdf` 101장) 전수 분석 후 다시 작성: [`dc-source-analysis.md`](./dc-source-analysis.md), [`dc-question-types.md`](./dc-question-types.md), [Sprint 9](./sprints/sprint-09-dc-calc-generators.md), [Sprint 10](./sprints/sprint-10-dc-content.md). 결과: 챕터 `ch01` 개요·`ch02` 물리 계층, 코드 0줄 → `code-*` 유형 4종 계획에서 제외(새 유형 없음, `calc` 입력 보강만), Ch02 공식 기반 생성기 10개, 교수님 필기 0건 → ⭐ 확정 0·⭐ 후보 3(인쇄된 "very important"), 목표 Ch01 ≥57·Ch02 ≥94(⭐ 후보 확정 시 106). 스프린트 순서 규칙(다과목 전환 = Sprint 2, 과목 고유 = OS 핵심 2~8 뒤 9·10, QA = 11)은 그대로 유지. `multi-subject-design.md` 레지스트리 예시를 `os`, `data-comm`으로 수정.
- 2026-10-04: **데이터 통신 확인 필요 답변 반영.** 필기본 없음(PDF 2개가 전부) → 필기 기반 ⭐ 0. 인쇄된 "very important" 2곳(Ch02 s.33, s.48)을 ⭐로 확정하고 근거를 `printed-emphasis`로 구분(OS ⭐는 `handwritten`) — 문제 데이터 모델에 `examBasis` 필드 추가(Sprint 3 범위). 비트 길이 문제는 답 단위 명시 + 해설에 정의(거리)/예제(시간) 차이 한 줄. 나머지 확인 필요 3~10번은 제안대로. 챕터 최소 문항 수 확정: Ch01 ≥57, Ch02 ≥106(⭐ 3개 × 8).
- 2026-10-04: **Sprint 2 완료.** 과목 레지스트리(`data/subjects/`, os·data-comm), `/s/[subject]`·`/s/[subject]/chapter/[id]` 라우팅 + `/chapter/:id` → `/s/os/chapter/:id` 리다이렉트, 헤더 브레드크럼, `/review`·`/stats` 과목 탭, 과목별 localStorage 키 + v1→v2 자동 마이그레이션, `lib/sim/` 과목 폴더 규칙. OS 회귀 14/14(전·후 동일), Vitest 4 → 40건 통과, lint·build 통과. 조정: 문제 0개 과목 카드는 비활성 대신 "문제 준비 중" 링크.
- 2026-10-04: **Sprint 3 구현.** 문제 데이터 모델(`examBasis` 포함), 문제 유형 레지스트리(core/UI 2곳, UI 등록 누락 시 빌드 실패 확인), 10종 채점기·렌더러, 키보드 훅, `/playground` 유형 미리보기. Vitest 104건·lint·build 통과. 결정: multi 부분점수 = max(0,(맞게 고른 수−잘못 고른 수)/정답 수), order = 상대 순서 일치 쌍 비율·items는 정답 순서로 저장 후 고정 셔플, graph = 정규화 좌표 곡선 데이터→인라인 SVG, 숫자키 동작은 core의 `applyChoice`.
- 2026-10-04: **Sprint 3 완료.** 브라우저(Chrome, 프로덕션 빌드)에서 키보드만으로 mcq/ox 풀이 확인, 10종 입력·채점 화면 텍스트 대비 라이트 902개·다크 1,108개 모두 기준 통과, OS 회귀 14/14, 콘솔 오류 없음.
- 2026-10-04: **채점 결과 표시·판정 규칙 변경.** 결과 화면 맨 위에 "✓ 정답 / ✗ 오답" 큰 배너, 완전히 맞았을 때만 정답(부분 점수가 있어도 하나라도 틀리면 오답), 부분 점수는 아래에 작게 보조 표시. 학습 기록·통계·오답노트도 완전히 맞음 기준으로 세고 부분 점수는 `lastScore`에 저장만 — `lib/storage/records.ts`(`recordAttempt`, `summarize`) 추가. 판정·기록 테스트 15건 추가(전체 119건). 배너 대비 라이트·다크 모두 4.5:1 이상 확인. Sprint 7·8 문서에 규칙 반영.
- 2026-10-04: **Sprint 4 완료.** `lib/sim/os/` 시뮬레이터 8종(페이징·세그먼테이션·버디(분할 트리)·배치·CPU 시간·페이지 교체(OPT/LRU/FIFO/Clock/Enhanced Clock)·메모리 용량·프로세스 시나리오) + 생성기 8개(지연 로딩). Ch08 p.48 Figure 8.15를 200dpi로 재렌더링해 전 칸 전사(F: OPT 3·LRU 4·FIFO 6·CLOCK 5) — source-diff의 마지막 주요 "확인 필요" 해소. 기준값 테스트 73건 + 전 과목 생성기 스모크 테스트, 전체 Vitest 200건·lint·build·OS 회귀 14/14 통과.

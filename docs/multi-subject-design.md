# 다과목 구조 설계 (os + data-comm)

> 이 문서는 "여러 과목을 한 앱에서 푸는 구조"로 전환하기 위한 설계다. 구현은 [Sprint 2](./sprints/sprint-02-multi-subject.md)에서 하고, 문제 유형 레지스트리의 실제 구현은 [Sprint 3](./sprints/sprint-03-question-engine.md)에서 한다.
>
> **모든 과목 공통 적용 규칙** (원본 `antigravity_prompt_os_exam_app.md` 기준, 과목이 늘어도 바뀌지 않음):
> §4 문제 유형(서술형 금지) · §5 데이터 모델 · §6 생성기/시뮬레이터(정답은 코드로 계산 + Vitest 기준값 고정) · §8 품질 규칙(해설 3요소, 그럴듯한 오답, 모호 문장 금지, 슬라이드에 없는 내용은 "(보충)") · §9 학습 기능 · 다크모드(시스템/라이트/다크, FOUC 없음, 전 컴포넌트 대비) · Vercel 정적 배포(백엔드/DB/환경변수/외부 API/외부 CDN 없음).

## 0. 현재 상태와 전환 비용

- 현재 구현은 Sprint 1(기반)뿐이다. **OS 문제 데이터, 채점기, 시뮬레이터, 학습 기록 저장 코드는 아직 한 줄도 없다.** 실제 브라우저에 저장된 값은 테마(`theme`) 하나뿐이다.
- 따라서 문제 id, `lib/sim`, localStorage 키는 대부분 **처음부터 새 구조로 작성**하면 된다. "마이그레이션"이 실제로 옮기는 대상은 기존 계획 문서(`01-architecture.md`, 원본 §5)에 정의돼 있던 형식이며, 이를 **v1 스키마**로 간주하고 변환 규칙과 테스트를 둔다(§2-3, §5). 앞으로 v2→v3 같은 변경에도 같은 틀을 재사용한다.
- 이미 구현된 Sprint 1 코드 중 바뀌는 것: `lib/chapters.ts`(→ 과목 레지스트리로 대체), `app/chapter/[id]`(→ `/s/[subject]/chapter/[id]`), 홈 화면(→ 과목 카드), 헤더(과목 표시 추가).

## 1. 과목 레지스트리

### 1-1. 폴더 구조

```
data/subjects/
  registry.ts                 # ★ 과목 등록 지점 (과목 배열 한 곳)
  types.ts                    # SubjectDef / ChapterDef 타입
  os/
    index.ts                  # os 과목 정의 (이름·색상·챕터 목록·생성기 연결)
    ch02.ts ch03.ts ch07.ts ch08.ts   # 챕터별 정적 문제 배열
  data-comm/
    index.ts
    ch01.ts ch02.ts           # dc-source-analysis.md 기준 (개요, 물리 계층)
  integrity.test.ts           # 전 과목 데이터 무결성 테스트 (§2-4)
lib/subjects.ts               # 조회 헬퍼: getSubject, getChapter, listQuestions …
```

**새 과목 추가 = `data/subjects/{과목}/` 폴더 + `registry.ts`에 한 줄.** (계산·시뮬레이션 문제가 있는 과목이면 `lib/sim/{과목}/`도 추가하고 과목 `index.ts`에서 생성기를 연결 — §6.) 라우트·홈 카드·필터·오답노트 탭·통계는 모두 레지스트리를 순회해 만들어지므로 다른 파일은 손대지 않는다.

### 1-2. 타입

```ts
// data/subjects/types.ts
export interface ChapterDef {
  id: string;              // 과목 안에서만 유일. 예: 'ch08'
  title: string;           // 'Ch08. 가상 메모리'
  shortTitle: string;      // '가상 메모리'
  minQuestions: number;    // 정적 문제 최소 문항 수 (OS: 50/80/80/120)
  load: () => Promise<Question[]>;   // 동적 import — 퀴즈 화면에서 해당 챕터만 로드
}

export interface SubjectDef {
  id: string;              // URL slug: 소문자 + 하이픈. 'os', 'data-comm'
  name: string;            // '운영체제', '데이터 통신'
  shortName: string;       // 'OS', 'DC' — 좁은 화면/뱃지용
  color: { light: string; dark: string };  // 대표 색상 (hex), §1-3
  sourceDir: string;       // 'source/os' — 근거 PDF 위치 (문서/검수용)
  chapters: ChapterDef[];  // 배열 순서 = 화면 표시 순서
  loadGenerators?: () => Promise<GeneratorMap>;  // lib/sim/{과목}/generators.ts를 동적 import (§6)
}
```

```ts
// data/subjects/registry.ts
import os from "./os";
import dataComm from "./data-comm";

export const SUBJECTS = [os, dataComm] as const satisfies readonly SubjectDef[];
export type SubjectId = (typeof SUBJECTS)[number]["id"];   // 'os' | 'data-comm'
```

등록 예 — 두 과목의 실제 값:

| 필드 | os | data-comm |
|---|---|---|
| `id` | `os` | `data-comm` |
| `name` / `shortName` | 운영체제 / OS | 데이터 통신 / DC |
| `sourceDir` | `source/os` | `source/data-communication` (폴더 이름은 과목 id와 달라도 됨) |
| `chapters` | `ch02` 운영체제 개요 · `ch03` 프로세스 · `ch07` 메모리 관리 · `ch08` 가상 메모리 | `ch01` 개요 · `ch02` 물리 계층 ([`dc-source-analysis.md`](./dc-source-analysis.md) §1) |
| `minQuestions` | 50 / 80 / 80 / 120 (원본 md) | 57 / 106 (소주제 목표 합계, 사용자 확정) |
| ⭐ 근거(`examBasis`) | `handwritten` (교수님 필기) | `printed-emphasis` (슬라이드에 인쇄된 "very important", Ch02 s.33·s.48) |
| `slideRef` 표기 | `Ch08 p.48` (PDF 쪽) | `Ch02 s.38` (인쇄된 슬라이드 번호 — PDF 한 쪽에 슬라이드 2장) |

- `SubjectId`는 레지스트리에서 **유도**한다(별도 유니온을 손으로 관리하지 않음). 과목 `index.ts`는 `import type`으로만 참조해 런타임 순환 참조를 만들지 않는다.
- **번들 크기**: 홈·과목 홈·챕터 시작 화면은 서버 컴포넌트에서 빌드 시점에 문항 수/⭐ 수를 계산해 정적 HTML로 내보낸다(문제 본문이 클라이언트 번들에 들어가지 않음). 문제 본문은 퀴즈 화면에서 `chapter.load()`로 필요한 챕터만 받는다.
- 과목에 **챕터가 하나도 없으면** 홈 카드를 "준비 중"으로 비활성화한다. 챕터는 있지만 문제가 0개면(콘텐츠 스프린트 전의 `os`·`data-comm`) 카드는 링크로 두고 "문제 준비 중"이라고 표시한다 — Sprint 1의 OS 챕터 카드와 같은 동작이며, 이렇게 해야 홈 → 챕터 경로(OS 회귀 기준)가 끊기지 않는다(Sprint 2 구현 중 조정, 2026-10-04). 빌드는 깨지지 않아야 한다.

### 1-3. 대표 색상 (라이트/다크 대비 보장)

| 과목 | light | dark | 대비율 (배경 / 카드 surface) |
|---|---|---|---|
| os | `#4f46e5` (indigo) | `#818cf8` | 라이트 6.29 / 5.97 · 다크 6.43 / 5.84 |
| data-comm | `#0f766e` (teal) | `#2dd4bf` | 라이트 5.47 / 5.20 · 다크 10.30 / 9.36 |

(대비율은 현재 `globals.css`의 `--background`/`--surface` 기준으로 계산한 값. 색상 자체는 제안값이며 바꿔도 아래 테스트만 통과하면 된다.)

- 정답/오답 색(`--correct` 녹색, `--incorrect` 빨강)과 헷갈리지 않도록 **빨강·녹색 계열은 과목 색으로 쓰지 않는다.**
- 적용 방식: 과목 영역 래퍼에 `data-subject` 속성과 인라인 CSS 변수(`--subject-l`, `--subject-d`)를 넣고, `globals.css`에 과목과 무관한 **공통 규칙 한 번만** 둔다:
  ```css
  [data-subject] { --subject: var(--subject-l); }
  .dark [data-subject], [data-subject].dark { --subject: var(--subject-d); }
  /* @theme inline 에 --color-subject: var(--subject) → text-subject, border-subject, bg-subject/10 */
  ```
  → 새 과목이 생겨도 CSS를 고칠 필요가 없다.
- **Vitest 대비 테스트**: 레지스트리의 모든 과목 색에 대해 WCAG 대비율을 계산해 light 색 vs `--background`(라이트), dark 색 vs `--background`(다크)가 각각 **4.5:1 이상**인지 검사한다. 색은 장식이고, 과목은 항상 이름 텍스트와 함께 표시한다(색 단독 정보 전달 금지).

## 2. 챕터 id · 문제 id · 데이터 모델

### 2-1. id 규칙

- **챕터 id**: 과목 안에서만 유일. 패턴 `^[a-z0-9]+$` (예: `ch08`, `w03`). `os`와 `data-comm`이 둘 다 `ch01`을 가져도 된다.
- **문제 id**: `{subjectId}-{chapterId}-{topicSlug}-{nnn}` — 전역 유일.
  - 예: `os-ch08-clock-001`, `os-ch07-buddy-trace-003`, `data-comm-ch02-shannon-001`
  - 전체 패턴 `^[a-z0-9]+(-[a-z0-9]+)*$`, `nnn`은 3자리 0 채움.
  - **파싱 주의**: 과목 id에 하이픈이 들어갈 수 있으므로(`data-comm`) `split('-')`로 과목을 꺼내면 안 된다. 레지스트리의 과목 id와 **가장 긴 접두사 일치**로 판별한다. 무결성 테스트에서 "어떤 과목 id + `-`도 다른 과목 id의 접두사가 아니다"를 검사해 모호성을 원천 차단한다.
- **생성기 문제 id**: `{subjectId}-{chapterId}-gen-{generatorName}-{seed}` (예: `os-ch08-gen-replacement-48213`). 같은 seed면 같은 문제가 나오므로 id만으로 재생성 가능하다.

### 2-2. 문제 데이터 모델 (`types/question.ts`)

원본 §5의 `BaseQ`에 `subject`를 추가하고 `chapter`를 과목 내 id(string)로 바꾼다.

```ts
export interface BaseQ<T extends string> {
  id: string;              // §2-1 규칙. 전역 유일
  subject: SubjectId;      // ★ 추가: 'os' | 'data-comm'
  chapter: string;         // 과목 내 챕터 id (subject와 함께 써야 유일)
  topic: string;           // 세부 주제 (필터용)
  type: T;                 // 문제 유형 레지스트리 키 (§3)
  exam: boolean;           // ⭐ 시험 출제 포인트
  examBasis?: "handwritten" | "printed-emphasis";
                           // ⭐ 근거 — exam이 true면 필수. handwritten = 교수님 필기(OS),
                           // printed-emphasis = 슬라이드 본문에 인쇄된 강조(데이터 통신 "very important")
  difficulty: 1 | 2 | 3;
  slideRef: string;        // 과목 내 표기. 'Ch08 p.48'
  prompt: string;          // 마크다운 일부(굵게/인라인 코드) 허용
  explanation: string;     // (1) 정답 근거 (2) 오답이 틀린 이유 — slideRef는 UI가 함께 표시
  summary?: string;        // 핵심 개념 한 줄 요약 (§3 해설 표시용)
  generator?: { name: string; params: Record<string, unknown>; seed: number };
}

// 유형별 payload는 각 유형 모듈(lib/qtypes/{type}.ts)이 정의하고,
// 전체 유니온은 문제 유형 레지스트리에서 유도한다 (§3-2).
export type Question = /* QTYPE_CORE에서 유도 */;
export type QType = Question["type"];
```

### 2-3. 기존 OS 문제 id 마이그레이션 규칙

원본 §5와 `01-architecture.md`의 기존 형식은 `{chapter}-{topic}-...`(예: `ch08-clock-trace-001`)이었다.

| 기존(v1) | 신규(v2) | 규칙 |
|---|---|---|
| `ch08-clock-trace-001` | `os-ch08-clock-trace-001` | `^ch(02\|03\|07\|08)-`로 시작하면 앞에 `os-`를 붙인다 |
| `os-ch08-clock-001` | (그대로) | 이미 등록된 과목 접두사로 시작하면 변경 없음 (멱등) |
| 그 외 | (그대로, 고아 id로 보관) | 지우지 않는다. UI에서는 "삭제된 문제"로 숨김 처리 |

- 구현: `lib/storage/migrateId.ts`의 순수 함수 `migrateLegacyQuestionId(id: string): string`. 멱등(두 번 적용해도 결과 동일)을 테스트로 보장한다.
- OS 정적 문제는 Sprint 5·6에서 **처음부터 `os-` 접두사로 작성**하므로 데이터 파일 자체를 변환할 일은 없다. 이 규칙은 localStorage 마이그레이션(§5-3)과 구버전 백업 가져오기(§5-4)에서만 쓰인다.
- 생성기 문제의 기존 형식(`{generator, params, seed}`)은 그대로 유지하고 `subject: 'os'`만 채운다.

### 2-4. 데이터 무결성 테스트 (`data/subjects/integrity.test.ts`)

모든 과목·모든 챕터의 문제를 로드해 다음을 검사한다. 과목이 추가되면 자동으로 검사 대상이 된다.

- 문제 id 전역 유일, §2-1 패턴 일치, `{subject}-{chapter}-`로 시작
- `subject`가 레지스트리에 있음, `chapter`가 그 과목의 챕터 목록에 있음
- `exam: true`이면 `examBasis`가 있음, `exam: false`이면 `examBasis` 없음
- `type`이 문제 유형 레지스트리에 등록됨 (서술형 유형 없음 — 레지스트리에 없으면 실패)
- 유형별 `validate(q)` 통과 (예: `answerIndex`가 보기 범위 안, `blank` 빈칸 수 = `accept` 배열 수)
- `slideRef`, `explanation` 비어 있지 않음
- 과목 색 대비 4.5:1 이상 (§1-3)
- 챕터별 `minQuestions` 충족 여부는 콘텐츠 스프린트 전까지 **경고만 출력**하고, QA 스프린트(Sprint 11)에서 실패 조건으로 전환한다.

## 3. 문제 유형 레지스트리

목표: **새 문제 유형은 "유형 모듈 작성 + 레지스트리 등록"만 하면 렌더러·채점기·필터·뱃지가 모두 붙는다.** 기존 10종(mcq, multi, ox, blank, order, match, classify, calc, trace, graph)도 처음부터 이 레지스트리로 구현한다(Sprint 3).

### 3-1. 두 개의 레지스트리 (순수 로직 / UI 분리)

채점·검증은 Node(Vitest)에서 React 없이 돌아야 하므로 둘로 나눈다.

```
lib/qtypes/                   # 순수 로직 — React import 금지
  registry.ts                 # QTYPE_CORE (★ 유형 등록 지점 1)
  mcq.ts multi.ts ox.ts blank.ts order.ts match.ts classify.ts calc.ts trace.ts graph.ts
  _shared/orderScore.ts       # order 부분점수 (순서형 유형이 늘면 공용)
  _shared/textMatch.ts        # blank 정답 매칭 (공백·대소문자 정규화, 한/영 accept)
  *.test.ts                   # 유형별 채점 테스트
components/qtypes/            # UI — 클라이언트 컴포넌트
  registry.ts                 # QTYPE_UI (★ 유형 등록 지점 2)
  Mcq.tsx … Graph.tsx
  QuestionRenderer.tsx        # 레지스트리 조회만 함 (switch 문 없음)
```

```ts
// lib/qtypes/registry.ts
export interface GradeResult {
  correct: boolean;     // score === 1
  score: number;        // 0..1 부분점수
  detail: unknown;      // 유형별 칸/항목별 정오 (비교 UI가 사용)
}

export interface QTypeCore<Q extends BaseQ<string>, A> {
  type: Q["type"];
  label: string;                         // 뱃지/필터 이름: '객관식', '표 채우기'
  emptyAnswer(q: Q): A;
  isComplete(q: Q, a: A): boolean;       // 제출 버튼 활성화 조건
  grade(q: Q, a: A): GradeResult;        // 순수 함수
  validate(q: Q): string[];              // 데이터 오류 메시지 (무결성 테스트용)
  choiceCount?(q: Q): number;            // 1~5 숫자키 단축키 대상 개수 (선택형만)
  applyChoice?(q: Q, a: A, i: number): A; // 숫자키 i의 새 답 (mcq 선택, multi 토글, ox 1=O·2=X, graph 선택)
}

export const QTYPE_CORE = {
  mcq: mcqCore, multi: multiCore, ox: oxCore, blank: blankCore, order: orderCore,
  match: matchCore, classify: classifyCore, calc: calcCore, trace: traceCore, graph: graphCore,
} as const;

// 전체 문제 유니온과 답안 타입은 레지스트리에서 유도 → 유니온을 따로 관리하지 않음
export type QType = keyof typeof QTYPE_CORE;
export type QuestionOf<K extends QType> = Parameters<(typeof QTYPE_CORE)[K]["grade"]>[0];
export type AnswerOf<K extends QType> = Parameters<(typeof QTYPE_CORE)[K]["grade"]>[1];
export type Question = QuestionOf<QType>;
```

```ts
// components/qtypes/registry.ts
export interface QTypeUI<K extends QType> {
  Input: ComponentType<{ question: QuestionOf<K>; answer: AnswerOf<K>;
                         onChange(a: AnswerOf<K>): void; disabled: boolean }>;
  Review: ComponentType<{ question: QuestionOf<K>; answer: AnswerOf<K>; result: GradeResult }>;
  // Review = "내가 낸 답 vs 정답" 나란히 비교 (아이콘+텍스트, 색 단독 금지)
}

export const QTYPE_UI = { mcq: McqUI, /* … */ } satisfies { [K in QType]: QTypeUI<K> };
```

- `satisfies { [K in QType]: … }` 때문에 **core에 등록하고 UI 등록을 빠뜨리면 `tsc`/`next build`가 실패**한다. 등록 누락이 런타임까지 가지 않는다.
- `QuestionRenderer`, 결과 화면, 챕터 필터(유형 목록), 뱃지는 전부 레지스트리를 조회한다. 챕터 시작 화면의 유형 필터에는 **그 챕터 데이터에 실제로 있는 유형만** 표시한다.
- 키보드 단축키(1~5, Enter, ←/→)는 전역 훅 하나가 담당하고, `choiceCount`가 있는 유형에만 숫자키를 연결한다. 입력 필드/코드 빈칸 포커스 중에는 비활성화.

### 3-2. 새 유형 추가 절차 (예: 가상의 `new-type`)

1. `lib/qtypes/new-type.ts` — payload 타입 + `QTypeCore` 구현 + `new-type.test.ts`
2. `lib/qtypes/registry.ts`에 `"new-type": newTypeCore` 한 줄
3. `components/qtypes/NewType.tsx` — `Input`/`Review`
4. `components/qtypes/registry.ts`에 한 줄 (빠뜨리면 빌드 실패)

데이터 통신은 PDF 분석 결과 **새 유형이 필요 없다**(기본 10종 + `calc` 입력 보강) — [`dc-question-types.md`](./dc-question-types.md).

## 4. 라우팅

홈에서 **과목 → 챕터** 순으로 고른다. 모든 경로는 `generateStaticParams`로 빌드 시 정적 생성하고 `dynamicParams = false`로 등록되지 않은 과목/챕터는 404.

| 경로 | 화면 |
|---|---|
| `/` | 과목 카드 목록: 과목명, 대표 색, 챕터 수, 문제 수, 진행률, 정답률, ⭐ 문제 수. 상단에 "전체 오답노트", "전체 통계" 바로가기, 테마 토글 |
| `/s/[subject]` | 과목 홈: 챕터 카드(원본 §3의 기존 홈 카드와 동일 항목), "이 과목 ⭐ 시험 포인트만 풀기", "이 과목 오답노트" |
| `/s/[subject]/chapter/[id]` | 챕터 시작 화면: 유형(복수)/⭐/문항 수(10·20·30·전체)/섞기/토픽 필터, 모드(즉시 채점·시험) |
| `/quiz` | 풀이. 문제 id가 전역 유일하므로 과목에 묶이지 않는 공용 경로. 조건은 쿼리로 전달(Sprint 7 구현): `?subject=os&chapter=ch08&types=mcq,trace&star=1&topics=A|B&count=20&shuffle=1&mode=instant|exam&timer=600`(`chapter`를 빼면 과목 전체, `timer`는 초·시험 모드만). 이 조건으로 세션을 만들어 `examapp:session`에 저장한 뒤 주소를 `?session={세션 id}`로 바꾼다(새로고침해도 같은 문제·순서). "틀린 문제만 다시 풀기"·오답노트 다시 풀기는 세션을 직접 만들어 `?session={id}`로 들어간다 |
| `/result?session={id}` | 결과(점수, 유형별/토픽별 정답률, 틀린 문제, 틀린 문제만 다시 풀기). 여러 과목이 섞인 세션이면 과목별 소계도 표시 |
| `/review?subject=all\|os\|data-comm` | 오답노트 + 북마크. 상단 과목 탭 `[전체] [운영체제] [데이터 통신]`. 과목 홈에서 들어오면 그 과목 탭, 홈에서 들어오면 `전체`. `전체`는 과목별로 그룹핑하고 과목 이름 뱃지를 붙임 |
| `/stats?subject=…` | 진행률/정답률/⭐ 달성도 대시보드 (원본 §9). 같은 과목 탭 + `전체` |

- 헤더(`SiteHeader`)에 현재 과목 이름(과목 색 점 + 텍스트)과 과목 홈 링크를 브레드크럼으로 표시: `홈 › 운영체제 › Ch08`.
- Sprint 1의 `/chapter/[id]`는 제거하고, `next.config.ts`의 `redirects()`로 `/chapter/:id → /s/os/chapter/:id`를 둔다(Vercel이 별도 설정 없이 지원 — 배포 조건 유지).
- `/review`, `/stats`, `/quiz`는 쿼리를 읽으므로 클라이언트에서 `useSearchParams`를 쓰는 부분을 `<Suspense>`로 감싸 정적 프리렌더링을 유지한다(구현 시 `node_modules/next/dist/docs/`의 해당 버전 문서로 확인).

## 5. localStorage (과목별 키 + 자동 마이그레이션)

### 5-1. 키 체계 (스키마 v2)

| 키 | 범위 | 값 |
|---|---|---|
| `theme` | 전역 | `'system' \| 'light' \| 'dark'` — **이름 유지**. FOUC 방지 인라인 스크립트가 읽는 키라 바꾸지 않는다 |
| `examapp:schema` | 전역 | 스키마 버전 숫자 (`2`) |
| `examapp:settings` | 전역 | 모드 기본값, 타이머 등 |
| `examapp:session` | 전역 | 진행 중 퀴즈 세션 하나 — `{ v: 1, id, mode, timerSec, deadline, label, backHref, items: [{ id, subject, chapter }], answers, results, index, finished }`(`lib/quiz/session.ts`). 문제 본문은 저장하지 않고 id로 다시 불러온다. 저장소가 막혀 있으면 메모리 사본으로 동작 |
| `examapp:{subject}:progress` | 과목별 | `{ [questionId]: { attempts, correctCount, lastScore, lastAt } }` — `correctCount`는 **완전히 맞은 횟수만**, `lastScore`는 마지막 부분 점수(0..1, 저장만 하고 판정·통계에 쓰지 않음) |
| `examapp:{subject}:wrong` | 과목별 | `{ [questionId]: { wrongCount, attempts, lastWrongAt, resolved, gen? } }` — `gen`은 생성기 문제 재생성 정보 |
| `examapp:{subject}:bookmarks` | 과목별 | `string[]` (문제 id) |

- **정답/오답은 완전히 맞았을 때만 정답**(부분 점수가 있어도 하나라도 틀리면 오답). 정답 수·정답률·오답노트는 이 기준으로만 세고, 기록 반영은 `lib/storage/records.ts`의 `recordAttempt`, 요약은 `summarize`로만 한다(규칙 상세: Sprint 3 문서 "구현 중 확정한 설계").
- 챕터·토픽별 진행률은 저장하지 않고 문제별 기록 + 문제 데이터(id→chapter/topic)에서 **계산**한다. 저장 중복을 없애 마이그레이션 대상을 줄인다.
- 키 문자열은 `lib/storage/keys.ts`의 함수로만 만든다(`progressKey(subject)` 등). 문자열 직접 조립 금지.
- 모든 접근은 기존 `safeStorage`(`try/catch`, `useEffect`/이벤트 핸들러 안에서만) 경유.
- 화면은 과목별 기록을 `lib/storage/recordsStore.ts`(`useSyncExternalStore` 스토어)로만 읽고 쓴다: 첫 구독 때 마이그레이션(`ensureStorageMigrated`) 후 읽기, 서버 스냅샷은 빈 기록(하이드레이션 일치), 쓰기는 `recordResult`(내부에서 `recordAttempt`)·`toggleBookmark`, 다른 탭의 변경은 `storage` 이벤트로 다시 읽기. 저장소가 막혀 있으면 메모리에만 남는다(새로고침하면 사라짐 — Sprint 7에서 확인).

### 5-2. v1 (기존 OS 단일 과목 형식)

`01-architecture.md`에 계획돼 있던 형식. 실제로 기록된 적은 없지만, 이 형식을 v1로 확정하고 fixture로 테스트한다.

| v1 키 | v2로 |
|---|---|
| `progress:{chapter}` (ch02/ch03/ch07/ch08) | `examapp:os:progress` (문제 id에 §2-3 규칙 적용) |
| `wrongNotes` | `examapp:os:wrong` |
| `bookmarks` | `examapp:os:bookmarks` |
| `settings` | `examapp:settings` |
| `theme` | 그대로 |

v1의 값 형식은 확정 문서가 없으므로, 변환기는 **배열(id 목록)과 객체(id → 기록)를 모두 받아들이고, 해석 못 하는 항목은 건너뛴다(예외를 던지지 않음).**

### 5-3. 첫 실행 자동 마이그레이션

`lib/storage/migrate.ts` — 클라이언트 최초 마운트 시 한 번 실행(학습 기록 스토어 초기화 시점, `useEffect` 안).

```
version = safeGetJSON('examapp:schema')
if version 없음:
    v1 키가 하나라도 있으면 version = 1, 없으면 → 신규 사용자: schema=2 기록하고 끝
if version == 1:
    1) v1 키 읽기 → upgradeV1toV2(data)  (순수 함수, 문제 id 변환 포함)
    2) 이미 존재하는 v2 키가 있으면 병합 (부분 실패 후 재시도 대비)
       - progress/wrong: 같은 id면 attempts·wrongCount는 큰 값, 날짜는 최신 값
       - bookmarks: 합집합
    3) v2 키 전부 safeSetJSON → 하나라도 false면 중단:
         v1 키는 그대로 두고 schema도 쓰지 않음 → 다음 실행 때 재시도
         이번 세션은 메모리에 변환된 데이터로 동작 (기록이 안 사라짐)
    4) 전부 성공했을 때만 schema=2 기록 → 그 다음 v1 키 삭제
if version > 현재 앱 버전:  아무것도 쓰지 않고 읽기 전용으로 동작 (데이터 보호)
```

- **순서가 핵심**: 새 키 쓰기 → 버전 기록 → 옛 키 삭제. 어느 단계에서 중단돼도 데이터가 사라지지 않고, 재실행해도 결과가 같다(멱등). 탭 두 개가 동시에 실행해도 병합 규칙 때문에 안전하다.
- 테스트(`migrate.test.ts`, 메모리 Storage 목): 신규 사용자 / v1 전체 / v1 일부 / v1+v2 공존(중단 후 재시도) / 쓰기 실패(quota) / 저장소 완전 차단 / 이미 v2 / 미래 버전 / 깨진 JSON — 각각에서 데이터 손실 없음과 멱등성을 확인한다.
- 앞으로 스키마가 바뀌면 `upgradeV2toV3`를 추가하고 같은 실행기에 체인으로 연결한다.

### 5-4. 학습 기록 내보내기 / 가져오기 (JSON)

```json
{
  "app": "os-exam-app",
  "version": 2,
  "exportedAt": "2026-10-04T12:00:00.000Z",
  "settings": { },
  "subjects": {
    "os":        { "progress": { }, "wrong": { }, "bookmarks": [ ] },
    "data-comm": { "progress": { }, "wrong": { }, "bookmarks": [ ] }
  }
}
```

- **내보내기**: 전체 또는 과목 선택. `version`은 항상 현재 스키마 버전.
- **가져오기 버전 판별**:
  - `version`이 숫자 → 그 버전으로 처리
  - `version`이 없고 v1 형태(`wrongNotes`, `bookmarks`, `progress:*` 키) → v1로 간주
  - 그 외 → "이 앱의 백업 파일이 아닙니다" 오류
- **구버전 업그레이드**: localStorage 마이그레이션과 **같은 순수 함수**(`upgradeV1toV2`)를 사용 → 두 경로의 결과가 항상 같다.
- **미래 버전**(`version` > 현재) → "더 새로운 앱에서 만든 파일" 오류, 아무것도 쓰지 않음.
- 검증: 손으로 쓴 타입 가드(외부 라이브러리 없이)로 구조를 확인하고, 파일 크기 상한(5MB)을 둔다. 오류는 메시지로만 표시하고 앱은 절대 죽지 않는다.
- 적용: 파일에 들어 있는 과목만 대상으로 "덮어쓰기 / 합치기" 중 선택(확인 다이얼로그). 레지스트리에 없는 과목은 건너뛰고 알린다. 모르는 문제 id는 지우지 않고 보관.
- 테스트(`backup.test.ts`): v2 왕복(내보내기→초기화→가져오기 = 원상 복구), v1 파일 가져오기, 버전 없는 임의 JSON, 미래 버전, 깨진 JSON, 모르는 과목.

## 6. 생성기 · 시뮬레이터 (`lib/sim/{과목}/`)

```
lib/sim/
  _shared/rng.ts            # seed 기반 PRNG (예: mulberry32). 과목 공용
  _shared/types.ts          # Generator 인터페이스
  os/
    paging.ts segmentation.ts buddy.ts placement.ts cpuTime.ts
    replacement.ts processScenario.ts memoryCapacity.ts baseBounds.ts workingSet.ts
    generators.ts           # os 생성기 맵 → data/subjects/os/index.ts에서 연결
    *.test.ts               # 원본 §6 기준값 고정 테스트 (source-diff.md 보강값 포함)
  data-comm/
    signal.ts digital.ts decibel.ts capacity.ts performance.ts
    pcm.ts modulation.ts multiplexing.ts linkFill.ts tdmFrame.ts   # dc-question-types.md §3
    generators.ts
    *.test.ts
```

```ts
// lib/sim/_shared/types.ts
export interface Generator<P extends Record<string, unknown> = Record<string, unknown>> {
  name: string;                 // 과목 안에서 유일, 문제 id에 들어가므로 소문자·숫자·하이픈: 'buddy', 'cpu-time'
  chapter: string; topic: string;
  description: string;
  generate(seed: number, params?: Partial<P>): Question;   // 결정적: 같은 seed·params → 같은 문제
}
export type GeneratorMap = Record<string, Generator>;
```

- 계산 함수(시뮬레이터)와 문제 생성기는 분리한다. 시뮬레이터는 seed와 무관한 순수 계산, 생성기는 seed로 파라미터를 뽑고 시뮬레이터로 정답을 계산해 `Question`을 만든다. **정답을 손으로 쓰지 않는다.**
- 생성기는 과목 정의의 `loadGenerators()`로 **동적 import**한다(과목 레지스트리는 헤더 등 모든 화면이 쓰므로 시뮬레이터 코드가 전 페이지 번들에 실리지 않게). 빌드 결과 OS 생성기는 별도 청크(약 25KB)로 분리됨을 확인(Sprint 4).
- "비슷한 문제 새로 생성"은 `(await subject.loadGenerators())[q.generator.name].generate(newSeed, q.generator.params)` — `params`에는 변형 선택(예: `{ variant: "p2l", pageSize: 4096 }`)이 저장되어 같은 종류의 문제가 다시 나온다.
- **OS 테스트 계속 통과**: 현재 OS 테스트는 `lib/storage/safeStorage.test.ts`(4건)뿐이고 시뮬레이터 테스트는 아직 없다. 시뮬레이터는 Sprint 4에서 처음부터 `lib/sim/os/`에 작성하므로 경로 이동으로 깨질 테스트는 없다. Sprint 2에서는 기존 테스트 + 새 구조 회귀 테스트(§7)를 통과 기준으로 삼는다. Vitest `include: ["**/*.test.ts"]`는 하위 폴더를 이미 포함하므로 설정 변경 불필요.
- 공용 테스트(`lib/sim/generators.test.ts`): 모든 과목의 모든 생성기에 대해 seed 20개로 생성한 문제가 무결성 검사(§2-4)와 유형 `validate`를 통과하고, 같은 seed 두 번 호출 결과가 같고, **`answerKey(q)`(정답 답안)로 채점하면 정답**이며, params가 유지되고, 생성기 이름이 id 규칙을 따르는지 확인한다.

## 7. OS 회귀 기준 (Sprint 2 DoD에 사용)

다과목 전환 후에도 OS가 그대로 동작한다는 것을 아래로 확인한다.

1. `npm run lint && npm test && npm run build` 통과 (기존 safeStorage 4건 포함)
2. 빌드 산출물에 `/s/os`, `/s/os/chapter/ch02|ch03|ch07|ch08`이 정적 생성되고, 존재하지 않는 과목/챕터는 404
3. `/chapter/ch08` → `/s/os/chapter/ch08` 리다이렉트
4. OS 챕터 목록(id·제목·순서·최소 문항 수 50/80/80/120)이 기존 `lib/chapters.ts`와 같음 — 레지스트리 스냅샷 테스트
5. 테마 키 `theme` 유지 → 기존 사용자의 테마 설정이 그대로 적용됨, FOUC 없음
6. 마이그레이션·id 변환·백업 테스트 전부 통과 (§5-3, §5-4)
7. data-comm 챕터(ch01, ch02)에 문제가 0개여도 빌드 성공 + 홈 카드 "문제 준비 중" (챕터 0개 과목만 비활성)

## 8. 바뀌는 기존 문서

- `01-architecture.md`: 폴더 구조·데이터 모델·localStorage 절은 이 문서로 대체(링크)
- `00-overview.md`: 과목 구성, 완료 조건 과목별로 확장
- 스프린트 문서: [`02-roadmap.md`](./02-roadmap.md) 참고 (Sprint 2 신설, 이후 번호 밀림)

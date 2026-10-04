# 아키텍처 / 데이터 모델 설계

> **2026-10-04 갱신**: 다과목 구조로 바뀌면서 이 문서의 **폴더 구조, 데이터 모델의 `chapter`/id 형식, localStorage 스키마** 절은 [`multi-subject-design.md`](./multi-subject-design.md)로 대체되었다(이 문서의 해당 절은 마이그레이션 규칙이 참조하는 **v1 형식 기록**으로 남겨 둔다). 경로는 `data/` → `data/subjects/{과목}/`, `lib/sim/` → `lib/sim/{과목}/`, `lib/grading/` → `lib/qtypes/`(문제 유형 레지스트리)로 읽는다. 유형별 payload, 채점 원칙, 시뮬레이터 원칙, 다크모드, 접근성 절은 그대로 유효하다.

## 폴더 구조 (제안)

```
app/
  layout.tsx                 # 루트 레이아웃, FOUC 방지 인라인 스크립트, 폰트 적용
  page.tsx                   # 홈
  chapter/[id]/page.tsx      # 챕터 시작 화면(필터)
  quiz/page.tsx               # 문제 풀이 화면
  result/page.tsx             # 결과 화면
  review/page.tsx             # 오답노트 + 북마크
components/
  theme/ThemeToggle.tsx
  quiz/QuestionRenderer.tsx   # type → 전용 컴포넌트로 분기
  quiz/types/Mcq.tsx, Multi.tsx, Ox.tsx, Blank.tsx, Order.tsx,
             Match.tsx, Classify.tsx, Calc.tsx, Trace.tsx, Graph.tsx
  quiz/ProgressBar.tsx, Badge.tsx, BookmarkButton.tsx
  dashboard/ChapterCard.tsx, StatPanel.tsx
data/
  ch02.ts, ch03.ts, ch07.ts, ch08.ts   # 챕터별 정적 문제 배열
  index.ts                              # 전체 취합 + 조회 헬퍼
lib/
  sim/
    paging.ts
    segmentation.ts
    buddy.ts
    placement.ts
    cpuTime.ts
    replacement.ts          # FIFO/LRU/OPT/Clock/Enhanced Clock
    processScenario.ts      # 인터럽트/상태전이 시나리오 생성
    memoryCapacity.ts        # n비트 주소공간/페이지테이블 크기 계산
  grading/
    index.ts                 # type → grade 함수 디스패치
    mcq.ts, multi.ts, ox.ts, blank.ts, order.ts, match.ts,
    classify.ts, calc.ts, trace.ts, graph.ts
  storage/
    safeStorage.ts           # try/catch 래핑된 localStorage 접근
    progress.ts               # 진행률/오답노트/북마크 스키마 + CRUD
  theme/
    noFlashScript.ts          # <head>에 주입할 인라인 스크립트 문자열
types/
  question.ts                 # discriminated union 정의 (원본 §5)
  progress.ts                  # 학습 기록 타입
__tests__/ 또는 각 lib 옆 *.test.ts
  sim/*.test.ts, grading/*.test.ts
```

## 데이터 모델 원칙

- 원본 §5의 `BaseQ` + `QType` discriminated union을 그대로 채택한다.
- 유형별 payload 필드:
  - `mcq`: `choices: string[]`, `answerIndex: number`
  - `multi`: `choices: string[]`, `answerIndexes: number[]` (부분점수 = max(0, (맞게 고른 수 − 잘못 고른 수) / 정답 수) — Sprint 3 확정)
  - `ox`: `answer: boolean`, `falseReason?: string` (거짓 진술이면 틀린 이유 필수)
  - `blank`: `text`(빈칸 자리 `{{0}}`…), `blanks: { accept: string[] }[]`, 비교 시 NFKC + 소문자화 + 모든 공백 제거 후 `accept` 배열과 매칭. 단어 은행 모드는 `bank?: string[]` 추가
  - `order`: `items: string[]`(**정답 순서로 저장**, 화면은 문제 id로 고정 셔플), 부분점수 = 상대 순서가 맞는 쌍의 비율 — Sprint 3 확정
  - `match`: `pairs: { left: string; right: string }[]`, `distractors?: string[]`, 셀렉트/드롭다운 UI
  - `classify`: `buckets: string[]`, `items: { label: string; bucket: string }[]`
  - `calc`: `answer: number`, `tolerance: number`, `unit?: string`, `steps?: string[]`(풀이 단계)
  - `trace`: `columns: string[]`, `rows: { label, cells: { value, blank?, options? }[] }[]` — `blank: true` 칸을 입력(또는 `options`면 드롭다운)으로, 칸별 채점
  - `graph`: `xLabel`, `yLabel`, `options: { key, label, figure: { kind: "curve", points: [x, y][] (0..1) } }[]`, `answerKey: string` — 이미지 대신 좌표 데이터를 인라인 SVG로 (Sprint 3 확정)
- 생성기 기반 문제: `{ generator: 'buddy' | 'replacement' | ..., params: Record<string, unknown>, seed: number }` 형태로 저장. 런타임에 `lib/sim/*`를 호출해 정답/표를 계산 — **정답을 손으로 하드코딩하지 않는다.**
- 모든 채점 함수는 `(question, userAnswer) => { correct: boolean; score: number; detail: ... }` 형태의 순수 함수로 작성해 유닛 테스트 가능하게 한다.

## 시뮬레이터 설계 원칙 (lib/sim)

- 순수 함수, 부수효과 없음, 입력 파라미터만으로 결정적 결과를 반환 (seed는 문제 랜덤 생성에만 사용, 계산 자체는 결정적).
- 원본 §6에 명시된 **검증 기준값은 그대로 테스트 케이스로 고정**한다 (예: 버디 시스템 1MB 트레이스, Clock 알고리즘 규칙, N=10/T=1/s=0.01/q=0.1 응답시간 등).
- `replacement.ts`는 알고리즘별로 단계별 상태 표(프레임 내용, 폴트 여부, use bit, next pointer 위치)를 함께 반환해 `trace` 문제 렌더링에 그대로 사용할 수 있게 한다.
- 생성기(`generateXxxQuestion(seed, params)`)는 "새 문제 생성" 버튼에서 재사용 — 같은 시뮬레이터 함수를 호출해 정답을 계산하므로 오답키가 생길 수 없다.

## localStorage 스키마 (safeStorage)

- 모든 읽기/쓰기는 `lib/storage/safeStorage.ts`의 `safeGet`/`safeSet`을 통해서만 수행하며 내부적으로 `try/catch`로 감싸고 실패 시 `null`/no-op 반환.
- 접근은 반드시 `useEffect` 내부에서만 수행 (SSR/프리렌더링 시 `window` 참조 금지).
- 저장 키 예시: `theme`, `progress:{chapter}`, `wrongNotes`, `bookmarks`, `settings`.
- JSON 내보내기/가져오기는 위 키들을 하나의 객체로 합쳐 직렬화.

## 다크모드 FOUC 방지

- `app/layout.tsx`의 `<head>`에 `dangerouslySetInnerHTML`로 테마 판별 스크립트를 가장 먼저 삽입 (localStorage 읽기 → `system`이면 `prefers-color-scheme` 사용 → `<html class="dark">` 즉시 적용).
- Tailwind `darkMode: 'class'` 설정과 쌍을 이룬다.

## 접근성/반응형 공통 규칙

- 정답/오답 표시는 색상 단독 사용 금지 — 아이콘(✓/✗) + 텍스트 병기.
- 키보드 단축키(1~5, Enter, ←/→)는 전역 키 핸들러 하나로 관리하고 포커스된 입력 필드에서는 비활성화.
- `order`, `trace` 유형은 드래그&드롭 외에 모바일용 ↑↓ 버튼/셀렉트 대체 입력을 항상 제공.

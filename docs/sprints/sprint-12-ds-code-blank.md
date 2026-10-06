# Sprint 12 — 데이터과학 과목 등록 · 코드 블록 · 코드 빈칸형

## 목표

세 번째 과목 데이터과학(`data-science`)을 문제 0개 상태로 등록하고, 코드 문제의 공통 기반인 **코드 블록**과 **코드 빈칸형(`code-blank`)** 문제 유형을 만든다. 실행 엔진(Pyodide·sql.js)과 전체 작성형(`code-write`)은 Sprint 13.

## 선행 조건

- Sprint 11 완료(두 과목 QA·배포)
- [`ds-source-analysis.md`](../ds-source-analysis.md) 분석 완료, [`ds-question-types.md`](../ds-question-types.md) §10 결정 14개(2026-10-06, 커밋 `13d317d`)

## 작업 항목

### 과목 등록

- [x] `data/subjects/data-science/` — 과목 정의(`index.ts`) + 강의별 문제 파일 `lec1.ts`~`lec6.ts`(지금은 빈 배열), 레지스트리 `SUBJECTS`에 한 줄. 챕터 id `lec1`~`lec6`, 최소 문항 수 20·56·27·32·66·78(결정 1·5)
- [x] 문제 0개 상태에서는 홈 카드·과목 홈·챕터 화면이 기존 과목과 같은 구조로 **"준비 중"** 표시(빈 퀴즈가 열리지 않음)
- [x] 콘텐츠 작성 전 과목(`status: "preparing"`)은 문제 0개인 챕터에 한해 최소 문항 수 검사를 건너뛴다 — 문제가 1개라도 들어간 챕터는 바로 실패 조건 적용
- [x] `slideRef` 형식 검사를 과목별로: 데이터과학은 `Lec2 s.25` / `Lec2 p.46`(결정 2)
- [x] ⭐ 없음(결정 3): 데이터과학 화면에서 "⭐만 풀기"와 ⭐ 개수·달성도를 숨기거나 "⭐ 해당 없음"으로 표시. ⭐ 문항이 0개인 곳에서는 "시험 포인트만" 선택지를 숨겨 빈 퀴즈를 막는다
- [x] 채점(결정 6): 데이터과학 `multi`는 0/1 — 부분 점수를 화면에 표시하지 않는다. 복수 선택 정답 2개 이상을 전 과목 데이터 검증으로 강제

### 공통 코드 블록

- [x] `CodeBlock`: 여러 줄, 고정폭, 들여쓰기 보존, 언어 표시(Python/SQL), 줄 번호(선택), `bg-surface`·`text-foreground`(라이트·다크 대비 테스트 범위 안). 375px에서 코드 블록 안에서만 가로 스크롤, 페이지 가로 넘침 없음
- [x] 지문·보기·해설 어디서든 쓸 수 있게: 문제 데이터의 `code` 필드(지문 아래 코드) + 글 안의 ```` ```python ```` 펜스 블록(`RichText`). `<p>`·`<button>` 안에서도 올바른 HTML이 되도록 구문 요소(`span`·`code`)만 사용
- [x] 기존 문항(인라인 코드 포함) 렌더링 결과가 바뀌지 않는다 — 변경 전후 전 문항 렌더링 해시 비교

### 코드 빈칸형 `code-blank`

- [x] `ds-question-types.md` §2 설계대로: 빈칸별 허용 답안, 토큰 단위 비교(토큰 사이 공백 무시, Python 대소문자 구별, SQL 키워드만 대소문자 무시, `'`·`"` 같은 값), 모든 빈칸이 맞아야 1점(0/1), 굽은 따옴표 자동 변환 + 결과 화면 알림(결정 13), 입력칸 `autocorrect`·`autocapitalize`·`spellcheck` 끔
- [x] 데이터 검증: 빈칸 자리 ↔ `blanks` 수, `accept` 앞뒤 공백 금지(결정 12), 토큰화 오류·굽은 따옴표 금지
- [x] 문제 유형 레지스트리 두 곳(`lib/qtypes/registry.ts`, `components/qtypes/registry.ts`)에 등록, 단위 테스트
- [x] 키보드 단축키(숫자·Enter·화살표)가 코드 입력 중에는 동작하지 않는지 확인
- [x] `/playground`에 코드 블록과 코드 빈칸형 예시(Python 1, SQL 1) — 예시 코드는 PDF 코드를 그대로 쓰고 출처 표기

## 완료 기준 (DoD)

- `npm run lint && npm test && npm run build` 통과, OS 회귀 14/14
- 기존 두 과목 테스트 전부 통과, 기존 문항 렌더링 변화 0
- 프로덕션 빌드(`build && start`)에서 375px·1280px × 라이트·다크로 코드 블록·코드 빈칸형 풀기·채점 화면 확인

## 다음 스프린트와의 연결

- Sprint 13: 실행 엔진(sql.js, Pyodide)과 `code-write`. `CodeBlock`·코드 입력칸 속성·굽은 따옴표 변환을 그대로 쓴다.

## 결과 (2026-10-06, DONE — 커밋 전)

- 과목 등록: `data/subjects/data-science/`(lec1~lec6 빈 배열), 홈·과목 홈·챕터 화면 "준비 중", `/quiz?subject=data-science…`는 빈 퀴즈 대신 안내 문구. `SubjectDef`에 `status`·`examPoints`·`allOrNothing` 추가
- ⭐: 데이터과학은 "⭐ 해당 없음", ⭐ 0개인 챕터(모든 과목)는 "시험 포인트만" 선택지 숨김, 통계 ⭐ 달성도는 ⭐ 0개면 "해당 없음"
- 채점: 데이터과학 `multi` 0/1(`gradeQuestion`), `multi` 정답 2개 이상 검증(전 과목 — 기존 33문항 모두 통과), `code-blank` 0/1
- `CodeBlock`·RichText 펜스·`BaseQ.code`, `code-blank`(토큰 비교·굽은 따옴표 변환·입력칸 속성), 레지스트리 2곳, /playground 데이터과학 미리보기(PDF 코드 그대로: Lec2 p.46, Lec5 s.45 [코드 5-4], Lec2 p.48, Lec2 s.21 [코드 2-13], Lec5 s.55 [코드 5-12])
- 기존 문항 렌더링: 변경 전후 586문항(551 + 유형 예시 10 + 데이터 통신 미리보기 25) 렌더링 해시 586/586 같음
- 고친 문제: (1) 지문 아래 코드 자리를 새로 끼워 형제 순서가 바뀌면서 그래프 SVG의 `useId` id가 달라지던 것 → 코드가 없는 문항은 예전 트리 그대로 (2) 375px 채점 화면에서 코드 블록 안 sr-only(절대 위치) 글자가 스크롤 영역을 벗어나 페이지가 124px 넘치던 것 → `code`에 `relative`
- lint 통과, vitest 43파일 1569건, build 통과(28쪽), OS 회귀 14/14

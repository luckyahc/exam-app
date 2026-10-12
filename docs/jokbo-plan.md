# 족보 계획 — 알고리즘 과목 · 족보 분류 · OS 9장 (Sprint 18~22)

작성: 2026-10-12 (Sprint 18). 문항 목록·판정: [`jokbo/algorithm/inventory.md`](./jokbo/algorithm/inventory.md), [`jokbo/os/inventory.md`](./jokbo/os/inventory.md).

## 1. 목표

1. 알고리즘 과목(id `algorithm`) 추가 — 문제는 **오직 족보 자료**에서 만든다.
2. 문제 분류 "족보" 신설 — 알고리즘과 운영체제에 족보 문제를 넣는다.
3. 운영체제 시험 범위에 9장 추가 — 9장 PDF로 다른 장과 같은 방식으로 문제를 만든다.

## 2. 자료 위치

- 알고리즘 족보: `source/algorithm/jokbo/` (강의 자료: `source/algorithm/` — 자료 2~5 PDF, 자료 1 PDF 없음)
- 운영체제 족보: `source/os/jokbo/`
- 운영체제 9장 PDF: `source/os/Ch09 Uniprocessor Scheduling.pdf`
- 판독 텍스트: `docs/jokbo/<과목>/extracted/` — 이후 스프린트는 원본 대신 이것만 쓴다.

## 3. 토큰 절약 규칙 (모든 스프린트)

- 원본 자료는 한 번만 읽는다. 읽은 내용은 `docs/jokbo/<과목>/extracted/<파일명>.md`에 텍스트로 저장하고, 이후에는 이 파일만 사용한다. 텍스트 추출이 안 되는 쪽만 이미지로 판독하고, 판독 결과를 같은 파일에 저장한다.
- 작업 중 테스트는 관련 파일만 돌린다(`npx vitest run <경로>`). 전체 검사(lint / `npm test -- --maxWorkers=1` / `verify:ds` / build / OS 회귀)는 스프린트 끝에 한 번만 돌린다.
- 브라우저 확인은 하지 않는다. 대신 build 후 새 라우트를 HTTP로 열어 200인지만 확인한다.
- 이미 읽은 기존 코드·문서를 다시 통째로 읽지 않는다. 필요한 부분만 검색해서 읽는다.
- 문서 갱신은 `docs/progress/sprint-NN.md` 하나와 로드맵 변경 이력 한 줄로 한다.
- (9장 PDF는 텍스트 층이 있다 — Sprint 19에서 `docs/verification/os-ch09.md` 작성용으로 한 번 추출해 `docs/jokbo/os/extracted/Ch09.md`에 저장하고, 필기·그림 쪽만 이미지로 판독한다.)

## 4. 공통 규칙 (모든 스프린트)

- 앱 기존 원칙 유지: 서술형 금지(허용 유형: mcq, multi, ox, blank, order, match, classify, calc, trace, graph, 코드 유형), 정답이 하나로 확정되는 문장만, 기존 문항 id 변경 금지, 계산·시뮬레이션 정답은 코드로 계산하고 Vitest로 고정.
- **족보 문항은 원문 그대로 출제한다(2026-10-13, 알고리즘·운영체제).** 문제 문장·보기·보기 순서(`shuffle: false`)·숫자·표·묻는 형식(객관식·OX·빈칸·순서·짝짓기·계산 등)을 원문과 같게 하고, 명백한 오타만 고친 뒤 해설에 "원문 오타: … → …"로 적는다. (이전 규칙 "서술형은 허용 유형으로 변환"은 삭제 — 서술형 위주의 옛 족보 파일 E19는 제외했고, 남은 파일에는 서술형이 없다.)
  - 같은 문제가 여러 시험에 나오면 대표 문항은 **가장 완전한 원문**(보기가 잘리지 않은 것, 같으면 최근 시험)의 문장·보기 순서를 쓰고 나머지는 occurrences에 적는다.
  - 원문 그대로 출제가 기존 데이터 규칙(OS mcq 보기 4~5개, multi 정답 2개 이상, 보기·항목 중복 금지, 섞이는 mcq의 위치 참조 금지 등)과 충돌하면, 족보 문항(`origin: "jokbo"`)만 그 규칙에서 예외로 하고 스프린트 보고에 예외 목록을 적는다.
  - `jokbo.original`은 원문을 바꿀 수밖에 없을 때(오타 수정 외)만 쓴다.
- 그림·그래프가 필요한 문항은 원본 스캔에서 해당 부분만 잘라 이미지로 넣는다: `public/jokbo/<과목>/<문항id>.png`, 가로 최대 1200px, 문항당 300KB 이하, 다크모드에서는 흰 배경 카드 위에 표시, alt에 그림 설명. 표·배열·코드는 이미지 대신 텍스트로 옮긴다.
- 중복 판정:
  - 같은 문제 = 문장 표현·보기 순서·숫자 표기만 다르고 묻는 대상과 정답이 같은 것 → 문항 하나로 합치고 출현 목록(`occurrences`: 파일·문항 번호·연도/학기가 있으면)에 모두 기록한다.
  - 비슷하지만 다른 문제 = 숫자·조건·묻는 대상·"옳은/옳지 않은"이 다른 것 → 별도 문항으로 두고 같은 `variantGroup`으로 묶는다.
  - 판정이 애매하면 별도 문항으로 두고 판정 표에 "애매"로 표시한다.
- 해설:
  - 족보에 해설이 있으면 그것을 바탕으로 쓴다. `explanationSource`는 `"jokbo"`다.
  - 해설이 없으면 직접 생성한다. `explanationSource`는 `"generated"`다. OS는 `source/os/`의 2·3·7·8·9장 PDF(교수님 필기 포함)에만 근거하고 `slideRef`를 붙인다. 알고리즘은 강의 자료가 있으면 그것을 근거로 쓰고, 없으면 일반 알고리즘 지식으로 쓰되 계산·추적이 가능한 문제는 코드로 검증한다.
  - 족보의 답이 슬라이드나 코드 검증 결과와 다르면 검증된 답을 정답으로 하고, 해설에 "족보 답(…)과 다름: 이유"를 적고, 충돌 목록에 기록한다.
  - OS 족보 중 현재 시험 범위(2·3·7·8·9장) 밖의 문제는 넣지 않고 범위 밖 목록에만 기록한다.
- 족보 문항 필드: `origin: "jokbo"`, `jokbo { occurrences[], original?, variantGroup?, explanationSource }`. 챕터·토픽은 기존 체계에 맞추고, 알고리즘은 Sprint 18에서 정한 챕터 체계를 따른다.
  - **이름 변경**: 요청 문서의 `source: "jokbo"`는 `origin: "jokbo"`로 구현했다 — `source`는 기존 코드 빈칸(code-blank) 유형의 코드 본문 필드라 공통 필드로 쓸 수 없다.
  - id: `<과목>-<챕터>-jokbo-NNN`. variantGroup: `<과목>-vg-<slug>`. occurrences 항목: `{ file, number, term? }`.
  - LMS 정답만 있고 해설이 없는 족보(OS 2022)는 해설 없음 → `generated`. 정답은 대조용.
  - 남이 만든 족보 풀이(알고리즘 zip의 상세해설)는 원본 해설이 아니다 → 참고만 하고 `generated`로 쓴다.

## 5. 구현된 족보 기능 (Sprint 18)

- 데이터 모델: `lib/qtypes/base.ts` `origin?`, `jokbo?`(선택 필드), `validateJokbo` — occurrences ≥ 1, explanationSource 필수, variantGroup 형식, 족보 id 형식, 일반 문항의 `-jokbo-` id 금지.
- 로직: `lib/quiz/jokbo.ts`(분류 필터·뱃지·해설 출처), `QuizFilter.source`, `ListFilter.source`, `ChapterMeta.jokboIds`·`rows[].jokbo`.
- 화면: 과목 홈 "족보만 풀기 (N)"(`/quiz?subject=…&source=jokbo`), 챕터 시작·문제 목록 "분류: 전체 / 족보 / 일반", 문항 뱃지 "족보"/"족보 N회"(툴팁에 출현 목록), 해설 머리 "족보 해설"/"생성 해설". 족보 문항이 0개인 과목·챕터에서는 버튼·필터를 숨긴다(⭐와 같은 규칙 — 빈 퀴즈 방지).
- 원문 블록(Sprint 20): 지문·보기의 ```text 펜스 → 고정폭 CodeBlock("원문") — 메모리 상태 그림·표·순서 항목을 원문 줄 그대로 보인다.
- 그림(Sprint 21): 문항 `figure { src, alt, width, height }` — `src = /jokbo/<과목>/<문항id>.png`(validateBase), 크기·용량은 과목 족보 테스트가 검사, 화면은 지문 아래 흰 카드(QuestionFigureView).
- 족보 예외(Sprint 21): mcq 보기 수(2개 이상만), multi 정답 수(1개 이상) — `origin: "jokbo"`일 때만.
- 과목: `algorithm`(준비 중, 챕터 5개 0문항), OS `ch09`(챕터 단위 `status: "preparing"`, 0문항, minQuestions 자리값 1).

## 6. 문항 수 목표

| 과목 | 구분 | 목표 |
|---|---|---|
| 알고리즘 | 족보 대표 문항 | **53** — analysis 9 · recurrence 11 · sorting 12 · dc 6 · dp 15 (= 챕터 minQuestions, E19 제외 후) |
| OS | 족보 대표 문항 | **56** — ch02 10 · ch03 13 · ch07 14 · ch08 13 · ch09 6 (minQuestions에 더하지 않음 — 기존 최소는 일반 문항 기준) |
| OS | Ch09 일반 문항 | Sprint 19에서 확정: ⭐ 소주제 × 8 + 일반 소주제 × 2~4의 합(기존 OS 규칙). ⭐ 6~10문항·유형 3종 이상 |
| OS | Ch09 용어 단답형 | 용어 사전에 Ch09 용어를 넣으면 자동 생성(terms.ts) |

**알고리즘 시험 범위는 강의 1~5다(2026-10-12 사용자 결정).** 2019 예상문제(E19, docx) 파일은 서술형 위주의 옛 족보라 제외한다(2026-10-12 사용자 결정 — inventory에 "제외(옛 서술형 파일)", 대표 4문항 제외, 남은 대표 번호는 앞으로 당김). 범위 밖 24문항(그리디, B-트리·레드블랙 트리, 그래프 탐색, NP 등)은 넣지 않고 inventory §5 범위 밖 목록에만 둔다.

## 7. 시뮬레이터 후보 (실제로 필요한 것만)

| 과목 | 시뮬레이터 | 쓰는 대표 문항 |
|---|---|---|
| OS | 단일 프로세서 스케줄링(슬라이드에 나온 알고리즘만 — FCFS·RR·SPN·SRT·HRRN·Feedback 중 Ch09 PDF에 있는 것) 시각별 실행 프로세스·종료·반환·정규화 반환 시간 | ch09-jokbo-001·002 + Ch09 일반 계산 문항 |
| OS | 기존 `lib/sim/os` 교체 알고리즘(Clock·Enhanced Clock·Optimal·LRU)·버디·배치·주소 변환 — 족보 상태에서 시작하는 입력이 되는지 Sprint 20에서 확인, 안 되면 초기 상태 인자 추가 | ch07·ch08 족보 계산 문항 |
| 알고리즘 | 계수 정렬(C1·C2·B) | sorting-001·002 |
| 알고리즘 | partition(마지막 원소 피벗, 1부터) · select 재귀 추적(k·호출 방향·순위) | sorting-006~008, dc-004~006 |
| 알고리즘 | 힙 검사 · buildHeap 단계(최소 힙, heapify 순서) | sorting-005·010 |
| 알고리즘 | 기수 정렬 단계별 위치 | sorting-009 |
| 알고리즘 | linearSelect 그룹 크기별 보장 분할 비율 | dc-002·003 |
| 알고리즘 | DP 표: 행렬 경로 최대 합, 조약돌 놓기(패턴), 장학금(상태 DP), 계단 친구, 연쇄 행렬 곱 m, LCS | dp-001~009 |
| 알고리즘 | 최단 경로: Floyd-Warshall D(k), 간선 수 제한 L(m), 벨만 포드 | dp-010~015 |
| 알고리즘 | 재귀 호출 수 세기(하노이 2ⁿ−1, 피보나치 호출 수), 점화식 수치 비교(선택) | recurrence-007·011 |

## 8. Sprint 19~22

### Sprint 19 — OS 9장

- 할 일: 9장 PDF 분석(소주제·⭐ 필기 표시·예제 값) → 스케줄링 시뮬레이터(슬라이드에 나온 알고리즘만, 슬라이드 예제 표를 기준값 테스트로 고정) → 일반 문항(소주제 목표 합계, ⭐ 6~10문항·유형 3종 이상, 기존 OS 규칙과 비중) → 용어 사전 추가와 용어 단답형 → 대조 기록 `docs/verification/os-ch09.md`. 9장 최소 문항 수는 분석 후 기존 규칙(⭐ 8, 일반 2~4의 합)으로 정한다.
- 완료 조건: ch09 `minQuestions` 확정·`status` 제거·OS 회귀 스냅샷과 `scripts/os-regression.mjs`의 OS_CHAPTERS에 ch09 반영, 시뮬레이터 기준값 테스트 통과, 대조 기록 표와 문항 id 일치(verification.test), 전체 검사 통과 후 커밋·푸시.
- 보고 형식: 1) 9장 소주제·⭐ 수 2) 시뮬레이터(알고리즘·기준값 테스트 수) 3) 문항 수(유형별·⭐) 4) 용어 수 5) 검사 결과·커밋 해시.

### Sprint 20 — OS 족보 문항

- 할 일: 대표 문항 56개 전부(범위 밖 제외, 9장 포함)를 `os-chNN-jokbo-NNN`으로 작성(챕터 파일 옆 `chNN-jokbo.ts`), 2022 LMS 정답·슬라이드·시뮬레이터로 정답 확정, 충돌 목록, 대조 기록 `docs/verification/os-jokbo.md`.
- 완료 조건: inventory의 대표 id가 모두 데이터에 있음(테스트로 검사), occurrences 수 = inventory 합친 수 + 1, 계산 문항은 시뮬레이터로 고정, 전체 검사 통과 후 커밋·푸시.
- 보고 형식: 1) 챕터별 족보 문항 수·유형 2) 출현 2회 이상 문항 수 3) 충돌(족보 답 ≠ 검증 답) 목록 4) 검사 결과·커밋 해시.

### Sprint 21 — 알고리즘 족보 문항

- 원본 대조 규칙(2026-10-12 추가): 알고리즘 족보는 zip 안의 옮겨 적은 텍스트(전사본)를 원본으로 썼다. 숫자·배열·표·그래프·코드가 들어간 대표 문항은 문항을 만들 때 원본 스캔 이미지(zip `원본참조/`)와 대조해 옮겨 적은 오류가 없는지 확인하고, 확인 결과(일치 / 고친 내용)를 대조 기록에 남긴다. 숫자 없는 개념 문항은 대조를 생략해도 된다(대조 기록에 "생략(개념)"으로 표시).
- 할 일: 대표 문항 53개를 `algorithm-{챕터}-jokbo-NNN`으로 작성, §7 알고리즘 시뮬레이터와 기준값 테스트(전사본 풀이·교수 해설 값으로 고정), inventory §6 충돌 후보 정리, 대조 기록 `docs/verification/algorithm-{챕터}.md`, 과목 `status` 제거.
- 완료 조건: 챕터 minQuestions(9·11·12·6·15) 충족, 계산·추적 정답 전부 코드 검증, 전체 검사 통과 후 커밋·푸시.
- 보고 형식: 1) 챕터별 문항 수·유형 2) 시뮬레이터·기준값 테스트 수 3) 충돌 목록 4) 검사 결과·커밋 해시.

### Sprint 22 — 마무리

- 할 일: 전체 검사, 족보 필터 동작 점검(HTTP 200 + 단위 테스트), README·`docs/known-limitations.md` 갱신(알고리즘 범위 밖 25문항, 잘린 원본, 해설 출처), 배포 후 확인 항목.
- 완료 조건: 전체 검사 통과, `/s/algorithm`·`/s/algorithm/questions`·`/s/os/chapter/ch09`·`/quiz?subject=os&source=jokbo` 200, 커밋·푸시.
- 보고 형식: 1) 검사 결과 2) 과목별 족보·일반 문항 수 3) 문서 변경 4) 배포 후 확인 항목 5) 커밋 해시.

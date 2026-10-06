# Sprint 13 — 코드 실행 엔진 · 전체 작성형(`code-write`)

## 목표

브라우저 안에서 Python(Pyodide)과 SQL(sql.js)을 실행해 채점하는 엔진을 만들고, 그 엔진으로 채점하는 **전체 작성형 `code-write`** 유형을 추가한다. 근거: [`ds-question-types.md`](../ds-question-types.md) §3·§4, 결정 7·8·12·13(§10).

## 선행 조건

- Sprint 12 완료(커밋 `b0c1274`): `CodeBlock`, 코드 입력칸 속성, 굽은 따옴표 변환(`straightenQuotes`), 0/1 채점 구조

## 작업 항목

### 실행 엔진

- [x] **포함 방식**: 엔진 파일은 빌드할 때 npm 패키지(`pyodide`, `sql.js`)에서 `public/engine/{이름}-{버전}/`으로 복사(`scripts/prepare-engine.mjs`, `prebuild`·`predev`·`pretest`). 바이너리는 저장소에 커밋하지 않는다(`.gitignore`). 외부 CDN을 실행 중에 쓰지 않는다
- [x] Python: Web Worker에서 **코드 문제를 열 때만** 불러온다. 기본 = Python + openpyxl, 넘파이는 그 문제에 필요할 때만 함께
- [x] 판다스: 문제 화면의 **"실행 엔진 불러오기"** 버튼을 눌렀을 때만 내려받는다. 버튼 옆에 용량·예상 시간(데스크톱/휴대폰). 불러오기 전 동작 두 안(제출 불가 안내 vs 대체 유형) 비교 후 하나 구현
- [x] SQL: sql.js를 같은 방식으로 포함, 문제마다 스키마·초기 데이터를 넣고 실행. 답안의 `#` 주석은 **문자열 밖에서만** `--`로(결정 8)
- [x] Vercel 배포 용량을 공식 문서 기준으로 확인, 한 번 내려받은 엔진이 브라우저 캐시로 재사용되는지 확인(버전 경로 + `Cache-Control: immutable`)

### 안전장치

- [x] 실행 시간 제한 5초 — 넘으면 Worker 종료 + "시간 초과" 오답. 출력 길이 제한
- [x] `input()`: 표준 입력 정의 vs 금지 중 하나로 정한다
- [x] 사용자 코드의 네트워크 접근·앱 화면 조작 차단

### 전체 작성형 `code-write`

- [x] Python: 테스트 케이스(표준 출력 비교 + 필요하면 변수 값 검사) 0/1. 출력 비교는 줄 끝 공백과 마지막 줄바꿈만 무시
- [x] SQL: SELECT는 ORDER BY를 요구하지 않는 한 행 순서 무시(결과 표 비교), INSERT·UPDATE·DELETE는 실행 후 테이블 상태 비교
- [x] 오답이면 내 출력/결과와 기대 결과를 나란히, 오류 메시지(SyntaxError 등)도 표시
- [x] 엔진을 불러오지 못하면 "채점할 수 없음 — 모범 답안 보기", 기록에 넣지 않음
- [x] 코드 입력칸: 고정폭, autocorrect·autocapitalize·spellcheck 끔, 굽은 따옴표 자동 변환(결정 13), Tab 키는 접근성을 해치지 않는 방식, 입력 중 단축키 무시
- [x] 레지스트리 두 곳 등록, 단위 테스트

### 테스트 · 예시

- [x] Node에서 Pyodide·sql.js를 띄운 Vitest: 정상 실행, 시간 초과, 오류 메시지, SQL 결과 비교, `#` 주석 변환
- [x] `/playground`에 전체 작성형 예시 Python 1 · 넘파이 1 · 판다스 1 · SQL 1(PDF 코드 기반)
- [x] 기존 과목 회귀: OS 회귀 14/14, 기존 테스트 전부, 기존 문항 렌더링 해시 비교

## 완료 기준 (DoD)

- `npm run lint && npm test && npm run build` 통과, OS 회귀 14/14, 기존 문항 렌더링 변화 0
- 프로덕션 빌드에서 375px·1280px × 라이트·다크로 전체 작성형 풀기·채점, 엔진 첫 로딩·두 번째 로딩(캐시) 시간 측정, 판다스 버튼 흐름 확인

## 결과 (2026-10-06, 커밋 전)

- 엔진 파일(원래 크기): Python 기본 13.8 MB(wasm 9.6 MB·표준 라이브러리 포함, openpyxl 포함) · 넘파이 +3.0 MB · 판다스 +4.9 MB(dateutil·pytz·six 포함) · SQL 0.7 MB. 서버가 gzip으로 보냄
- 로딩 시간(프로덕션 서버, localhost, 데스크톱 Chrome — 내려받기 시간은 거의 0이라 실제 망에서는 더 걸림): 첫 로딩 Python 7.4초 · 넘파이 +2.7초 · 판다스 +12.2초 / 두 번째(새로고침 후, 캐시) Python 5.0초 · 넘파이 +2.5초 · 판다스 +9.0초. 대부분 wasm 컴파일·패키지 풀기·import 시간
- 캐시: 새로고침 후 `cache: "only-if-cached"`로 wasm·stdlib·넘파이·판다스 휠·sql-wasm·Worker 파일 모두 브라우저 HTTP 캐시에서 응답(Cache-Control `public, max-age=31536000, immutable`)
- 판다스 불러오기 전: **제출 불가 안내(건너뛰기 가능)** 를 택함 — 같은 문항 id는 한 가지 방식으로만 채점돼야 하고, 대체 유형은 문항을 따로 만들고 검증해야 하며, 내려받기는 학생이 고르는 것이 맞다고 봄
- `input()`: **금지** — 강의 코드에 표준 입력이 없다. 부르면 "input()은 쓸 수 없습니다" 오류
- Tab: 편집기 안에서 Tab = 4칸 들여쓰기(선택 영역은 줄마다), Shift+Tab = 내어쓰기, **Esc 다음 Tab** = 다음 항목으로 이동(WCAG 2.1.2 키보드 함정 없음). 안내 문구를 `aria-describedby`로 연결
- 브라우저: 375/1280 × 라이트/다크 16조합에서 Python·넘파이·판다스·SQL 채점 화면 가로 넘침 0. 정답·오답(나란히 비교, SyntaxError 줄 번호), 시간 초과 5초 후 엔진 다시 띄워 정상 채점, 출력 길이 초과, 네트워크 차단(`js.fetch` → "이 실행 환경에서는 네트워크에 접근할 수 없습니다") 확인
- 회귀: 렌더링 해시 586/586 같음, OS 회귀 14/14, vitest 46파일 1599건

- 휠 내려받기 점검(마무리): 보관 위치 `node_modules/.cache/engine-wheels/`(저장소 밖, Vercel 빌드 캐시 대상 `node_modules/**`). 3회 재시도 후에도 실패하거나 SHA-256이 다르면 "실행 엔진 준비 실패 — 빌드를 중단합니다"로 종료 코드 1(`npm run build`가 next build 전에 멈춤), 검증을 통과한 파일만 캐시에 쓴다. 마지막에 `public/engine` 파일 존재·휠 해시를 다시 확인

## 문서와 다르게 한 부분

- 넘파이·판다스·openpyxl 휠은 npm 패키지에서 복사하지 못한다(npm `pyodide`에는 기본 파일만 있음) → 빌드 때 공식 배포처(Pyodide 배포 jsdelivr 미러·PyPI)에서 내려받아 SHA-256 검증·캐시. 실행 중(브라우저)에는 외부 주소를 쓰지 않는다
- Worker는 번들러(Turbopack)를 거치지 않은 **정적 모듈 Worker**(`lib/engine/runtime/browserWorker.js` → `public/engine/app-{내용 해시}/`)로 바꿨다. Turbopack이 만드는 Worker는 classic이라 Pyodide 314가 거부했다("Classic web workers are not supported")

## 다음 스프린트와의 연결

- Sprint 14: 같은 엔진(`lib/engine/runtime/*`)으로 문제 데이터를 작성 시 검증한다.

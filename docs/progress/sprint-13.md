# 진행 기록 — Sprint 13 코드 실행 엔진 · 전체 작성형

중단 대비 기록. 항목을 끝낼 때마다 갱신한다. Sprint 13은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-06 (Sprint 12 커밋 `b0c1274` 이후)
- 기준 문서: `docs/sprints/sprint-13-ds-engine.md`, `docs/ds-question-types.md` §3·§4·§10(결정 7·8·12·13)

## 확인한 사실

- npm에는 이 Pyodide 버전(314.0.7)용 numpy·pandas·openpyxl 휠을 담은 공식 패키지가 없다(`pyodide` npm 패키지는 기본 파일만). → 휠은 빌드 때 공식 배포처(Pyodide 배포 jsdelivr 미러, PyPI)에서 내려받고 SHA-256으로 검증해 `public/engine/`에 둔다(저장소 커밋 없음)
- Vercel 공식 문서(docs/limits, 2026-09-16 갱신): CLI 업로드 소스 100 MB(Hobby)/1 GB(Pro), 빌드 출력 파일 수 상한 없음, 빌드 45분, 빌드 디스크 32 GB, 빌드 캐시 1.5 GB(Standard). CDN 캐시 문서: 정적 파일은 배포 기간 동안 자동 캐시, 캐시 가능 응답 10 MB 이하
- Turbopack은 `new Worker(new URL(...))`와 `webpackIgnore` 매직 주석을 지원(node_modules/next/dist/docs 08-turbopack.md)

## 끝낸 항목

- 스프린트 문서 작성, `pyodide@314.0.7`·`sql.js@1.14.2` 고정 설치
- `scripts/prepare-engine.mjs`(predev·prebuild·pretest): npm 패키지에서 Pyodide 기본·sql.js 복사, 넘파이·판다스(+dateutil·pytz·six)·openpyxl·et_xmlfile 휠은 빌드 때 내려받아 SHA-256 검증·캐시(node_modules/.cache/engine-wheels), `public/engine/{pyodide-314.0.7,sqljs-1.14.2}/` + `manifest.json`(용량). `.gitignore`·eslint 제외
- 런타임(순수 JS): `lib/engine/runtime/pyRuntime.js`(이름 공간 매번 새로, input() 금지, 작업 폴더 매번 새로, 출력 20,000자 제한, 오류 마지막 줄+줄 번호, openpyxl 휠을 site-packages에), `sqlRuntime.js`(# → -- 문자열 밖만, PRAGMA foreign_keys, 테이블 상태)
- Worker(처음엔 `lib/engine/engine.worker.ts` → 브라우저에서 "Classic web workers are not supported" — Turbopack Worker가 classic이라 Pyodide가 거부 → 정적 모듈 Worker `lib/engine/runtime/browserWorker.js`를 `public/engine/app-{내용 해시}/`로 복사, manifest.worker로 생성)(같은 출처 /engine/만 fetch, 사용자 코드 실행 중 fetch 차단, XHR·WebSocket·EventSource 제거), 클라이언트 `client.ts`(started부터 5초, 넘으면 Worker 종료→timeout, 불러오기 상한 180초), `browser.ts`, Node 어댑터 `nodeClient.ts` + `runtime/nodeEngineWorker.mjs`
- 비교 `compare.ts`(줄 끝 공백·마지막 줄바꿈만 무시, 표 다중집합 비교), 판정 `codeWriteRun.ts`(모범 답안과 같은 엔진에서 실행·비교)
- 유형 `code-write`(lib/qtypes/codeWrite.ts, components/qtypes/CodeWrite.tsx·CodeEditor.tsx), 레지스트리 2곳·answerKey, `dsSchemas.ts`(firstDB SQLite판)
- playground 예시: Python [코드 2-26~2-28], 넘파이 [코드 6-10], 판다스 [코드 6-27·6-29], SQL [코드 5-9]
- 테스트: engine.test.ts, engine.pandas.test.ts, codeWrite.engine.test.ts — 전체 46파일 1599건 약 23초(판다스 파일은 병렬로 약 20초, 나눌 필요 없음)
- next.config: /engine/{pyodide,sqljs,app}-버전·해시/ 1년 immutable 캐시(manifest.json은 제외), 전 경로 CSP `connect-src 'self'`

- 브라우저(프로덕션 build && start, 3123): 4문항 정답·오답·오류·시간 초과·출력 초과·네트워크 차단, 375/1280 × 라이트/다크 16조합 넘침 0, 판다스 버튼 흐름, Tab·Shift+Tab·Esc→Tab, 로딩 시간 첫/캐시(스프린트 문서 결과), 캐시 확인(only-if-cached)
- 렌더링 해시 586/586 같음, OS 회귀 14/14, lint·build 통과, 서버 종료

## 진행 중

- 없음(보고 대기, 커밋하지 않음)

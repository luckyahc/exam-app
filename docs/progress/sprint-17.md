# 진행 기록 — Sprint 17 QA · 배포 확인

중단 대비 기록. 항목 단위로 저장하고 갱신한다. Sprint 17은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-07 (Sprint 16 커밋 `f507ab0` 이후)
- 기준 문서: `docs/sprints/sprint-17-qa-deploy.md`

## 확인한 사실

- 엔진은 이미 재사용 구조다: `lib/engine/browser.ts`의 `getEngine`이 모듈 수준 싱글턴(Worker 1개), Worker의 `ensurePython`은 불러온 패키지를 건너뛴다, `CodeWrite`는 판다스를 이미 불러왔으면 버튼 없이 자동 준비. Worker를 다시 띄우는 것은 `reset()`(시간 초과·Worker 오류·불러오기 180초 초과)뿐
- Sprint 16에서 잰 "두 번째에도 17초"는 확인 방법 탓 — 매번 iframe으로 페이지를 새로 불러와 앱(모듈)이 처음부터 다시 시작됐다

## 끝낸 항목

- 0번(Sprint 16 마무리): 커밋 `f507ab0` 푸시
- 스프린트 문서, 진행 기록
- 엔진 재사용 단위 테스트 `lib/engine/client.reuse.test.ts`(Worker 1개·판다스 한 번, 시간 초과 때만 새 Worker, 불러오기 실패 때 Worker 버림)
- 엔진 브라우저 확인(build && start + 로컬 프록시 3124·3125로 차단·속도 제한 재현 — 확장 프로그램으로는 개발자 도구를 열 수 없어서):
  - 재사용: 같은 퀴즈에서 넘파이(1/2) 자동 준비 10.6초 → 판다스(2/2) 버튼 → 판다스만 8.9초 → ← 이전·다음 → 다시 와도 버튼 없이 "엔진 준비 완료 (0.0초)". 결과 화면 → 클라이언트 이동으로 새 퀴즈 세션·플레이그라운드의 다른 판다스 문제(lec6-demo-code-write-002)도 0.0초 → 버튼 한 번
  - 고친 것 1: 엔진 실패 화면에 "다시 시도" 버튼이 없었다 → 추가(CodeWrite.tsx)
  - 고친 것 2: wasm 503이면 Pyodide가 오류 없이 멈춰 실패 화면이 180초(불러오기 상한) 뒤에 떴다 → Worker의 fetch가 엔진 파일 응답 실패를 바로 알려 5초 안에 "엔진 파일을 내려받지 못했습니다(HTTP 503)", 실패한 Worker는 버리고 다시 시도는 새 Worker(browserWorker.js·client.ts)
  - 고친 것 3: 휠 내려받기가 실패해도 py가 이미 설정돼 다시 시도 때 openpyxl 설치를 건너뛰던 문제 → 휠 설치 뒤에 py 기록
  - 실패 → 속도 제한(wasm 800 KB/s)에서 다시 시도: 진행 표시 "Python 불러오는 중"(1.4초) → "numpy 불러오는 중"(14.4초) → "엔진 준비 완료 (17.9초)". 실패 화면에서는 제출 버튼이 꺼져 기록에 남지 않음
  - 중간에 메모리 부족으로 시스템이 프록시·서버 백그라운드 작업을 종료(PC 8 GB 중 여유 약 0.4 GB) — 사용자 지시로 이어서 진행

- 배포 점검: 로컬 next start 응답 헤더 — wasm `application/wasm`, Worker·mjs JS, whl octet-stream, 엔진 폴더 1년 immutable, manifest.json max-age=0, 전 경로 CSP `connect-src self`. Vercel 문서: next.config headers는 Vercel에서 사용자 지정 응답 헤더로 적용, 기본 cache-control `public, max-age=0, must-revalidate`, 빌드 상한 45분, 출력 파일 수 상한 없음, CLI 소스 업로드 100 MB(Hobby) — public/engine은 빌드 산출물이라 해당 없음, 빌드 캐시 1.5 GB. 로컬 빌드 약 19초, public/engine 22 MB(파일 23개)
- docs/deploy-checklist.md, docs/known-limitations.md, README 데이터과학 절, ds-question-types §11에서 한계 목록 링크
- 전 과목 자동 검사: contentQa·integrity는 SUBJECTS 전체, records.test는 데이터과학 강의만. 대조 기록에 없는 id: os 0/381, data-comm 0/170, data-science 0/356. 데이터과학 형식 문제 0, 해설 근거 형식 위반 0, 짧은 해설(본문 40자 미만 기준) 2(lec2-variable-005·lec2-arith-005, 44자 — 내용 정확, 보고만), 중복 후보 2(lec2-tuple-003~dict-006, lec6-query-004~stat-001 — 같은 지문 틀·다른 내용, 오탐)
- 기록 왕복 단위 테스트(세 과목·데이터과학만 초기화·합치기)
- 화면 점검·키보드 풀이: 메모리 부족으로 중단(84조합 중 4, 문제 0) — 사용자 확인 필요
- 로드맵: Sprint 17 문서 링크·IN PROGRESS. 1~16 모두 DONE

- 최종(2026-10-07): lint 0건, npm test 2086건(메모리 부족으로 기본 병렬 실행에서 엔진 테스트 Worker가 비정상 종료 → --maxWorkers=2로 통과), verify:ds 40건(--maxWorkers=1), build, OS 회귀 14/14, 렌더링 해시 586/586, 서버·프록시·탭 종료

## 진행 중

- 없음 — 보고 후 대기(화면 점검·키보드 풀이는 메모리 확보 후)

## 남은 작업

- (메모리 확보 후) 화면 점검 84조합·키보드 풀이 → 결과·오답노트, 브라우저 내보내기·가져오기
- 사용자 확인 후 커밋, 로드맵 Sprint 17 → DONE. 준비해 둔 기록(아직 넣지 않음):
  - 표: `| 17 | … | DONE |`
  - 기록: "2026-10-07: **Sprint 17 완료 — 전체 완료.** 실행 엔진 사용성: Worker 재사용 확인(같은 탭에서 판다스 한 번만 불러옴, 단위 테스트 추가), 불러오기 실패 화면에 \"다시 시도\", 엔진 파일 내려받기 실패를 바로 감지(180초 → 수 초)하고 실패한 Worker는 버림. 배포: 엔진 파일 Content-Type·1년 immutable 캐시·CSP를 로컬에서 확인, Vercel 제한(빌드 45분·출력 파일 수 무제한) 안, 배포 후 확인은 docs/deploy-checklist.md. 세 과목 자동 검사(대조 기록 누락 0·형식 문제 0), 세 과목 기록 내보내기→초기화→가져오기 왕복 테스트. README에 데이터과학·실행 엔진·verify:ds·문항 추가 방법, 알려진 한계 docs/known-limitations.md."

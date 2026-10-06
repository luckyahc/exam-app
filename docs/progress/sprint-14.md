# 진행 기록 — Sprint 14 데이터과학 문제 검증 파이프라인

중단 대비 기록. 항목을 끝낼 때마다 갱신한다. Sprint 14는 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-06 (Sprint 13 커밋 `22d2c7e` 이후)
- 기준 문서: `docs/sprints/sprint-14-ds-verification.md`

## 확인한 사실

- Pyodide `loadPyodide({ env: { PYTHONHASHSEED } })`가 적용된다: 시드 1·2는 세트 순서가 다르고 같은 시드는 같다(시드 없으면 무작위)
- 코드 빈칸 채점은 토큰 비교라 따옴표 종류·공백·SQL 키워드 대소문자 차이는 이미 같은 답이다 → 이 변형은 `accept`에 넣지 않는다(중복 금지)

## 끝낸 항목

- 스프린트 문서 정식화
- 데이터 필드 `verify`(base.ts)·`wrong`/`candidates`(codeBlank.ts)·`expect`(codeWrite.ts), Node 엔진 해시 시드 옵션
- `lib/verify/`: rules(실행 없는 규칙)·candidates(규칙 12개)·errata(8건)·run(실행 검증)·records(대조 기록)·collect
- 대조 기록 `docs/verification/data-science-lec1~6.md`(문항 0개) + records.test.ts
- playground 예시에 verify·expect·wrong 추가, 새 예시 [코드 2-12] while 코드 빈칸 — 처음엔 accept 1개로 두고 파이프라인 메시지("accept에 추가하세요" 7건, "wrong에 기록하세요" 2건)대로 채움
- 테스트: rules(12)·records(10)·dsVerify(2) = `npm test`, + dsVerify.full·dsVerify.pandas.full·broken.full = `npm run verify:ds`(34건)
- 시간: 한 번에 93.8초(엔진 테스트 시간 초과 3건) → 분리 후 `npm test` 약 23초 1623건, `verify:ds` 26.4초
- 회귀: 렌더링 해시 586/586, lint·build 통과, OS 회귀 14/14, 서버 종료

## 진행 중

- 없음(보고 대기, 커밋하지 않음)

# 진행 기록 — Sprint 18 족보 자료 목록화 · 족보 분류 기능

- 시작: 2026-10-12 (커밋 `45bf0e1` 이후)
- 계획·규칙: [`docs/jokbo-plan.md`](../jokbo-plan.md)

## 자료

- 알고리즘: `jokbo/` 파일 3개(zip 1 + PDF 2). zip 안 전사본 md(범위 안 111문항)·대조표·상세 풀이와 E19 docx를 `docs/jokbo/algorithm/extracted/`에 저장. 최상위 PDF 2개는 zip 안 M22·M23과 같은 시험(중복 파일). 스캔 원본 이미지는 전사본으로 갈음(토큰 절약) — 범위 밖 문항은 번호·주제만 있음.
- OS: 족보 PDF 2개 모두 텍스트 층 없음 → 100쪽 이미지 판독 → `docs/jokbo/os/extracted/`. 2022는 LMS 채점 화면(정답 있음, 해설 칸 비어 있음), 2023은 정답 표시 없음. 잘린 캡처 3문항은 2022 같은 문제로 보완.
- 읽지 못한 파일 없음(hwp 없음).

## 판정 결과 (상세: `docs/jokbo/*/inventory.md`)

| 과목 | 원문 | 범위 밖 | 대표 | 같은 문제로 합침 | variantGroup | 애매 |
|---|---|---|---|---|---|---|
| 알고리즘 | 136 | 25 | 57 | 54 | 13 | 0 |
| OS | 100 | 9 | 56 | 35 | 8 | 0 |

## 코드

- `lib/qtypes/base.ts`: `origin?: "jokbo"`, `jokbo?: JokboInfo`, `validateJokbo`(validateBase에서 호출)
- `lib/quiz/jokbo.ts`(+ test): 분류 필터·뱃지·해설 출처. `session.ts`·`questionList.ts`·`chapterMeta.ts`에 분류 조건
- 화면: 과목 홈 "족보만 풀기", ChapterStart·QuestionList 분류 필터, QuestionList 행 뱃지, QuestionRenderer 뱃지·해설 출처, ResultView(미응답 해설) 출처
- 과목: `data/subjects/algorithm/`(5챕터 0문항, preparing, ⭐ 없음, 색 #be123c/#fb7185), OS `ch09`(챕터 status preparing, minQuestions 자리값 1)
- 테스트: `ChapterDef.status`를 반영한 integrity 최소 문항 검사·준비 중 챕터 검사, OS 레지스트리 스냅샷에 ch09, `scripts/os-regression.mjs`에 ch09 화면 확인

## 문서와 다르게 한 부분

- 족보 표시 필드 `source: "jokbo"` → `origin: "jokbo"` (code-blank의 `source`와 이름 충돌)
- 분류 필터·"족보만 풀기"는 족보 문항이 있을 때만 보인다(⭐ 버튼과 같은 규칙) — 지금은 족보 문항이 0개라 화면에 아직 안 보인다
- OS Ch09는 문제 0개로 넣기 위해 챕터 단위 `status: "preparing"`을 새로 두었다(과목 단위만 있었다)
- 알고리즘 범위: 강의자료 1~5 밖 25문항을 범위 밖으로 둠(요청 문서는 OS만 범위 밖 규칙을 둠) — 사용자 확인 필요

## 검사

- 작업 중: `npx vitest run lib/quiz/jokbo.test.ts data/subjects/integrity.test.ts data/subjects/os/os-registry.test.ts lib/stats.test.ts lib/quiz` 97 통과
- 스프린트 끝 전체 검사: lint 통과 · `npm test -- --maxWorkers=1` 55파일 2341 통과(처음 1건 실패 — `recordsStore.test.ts`가 과목 3개를 고정 → 등록 과목 전체로 고침) · `verify:ds` 40 통과 · build 통과 · OS 회귀 15/15 · HTTP 200: `/s/algorithm`, `/s/algorithm/questions`, `/s/algorithm/chapter/analysis`·`dp`, `/s/os/chapter/ch09`, `/quiz?subject=os&source=jokbo`

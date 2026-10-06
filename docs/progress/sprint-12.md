# 진행 기록 — Sprint 12 데이터과학 과목 등록 · 코드 블록 · 코드 빈칸형

중단 대비 기록. 항목을 끝낼 때마다 갱신한다. Sprint 12는 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-06 (결정 문서 커밋 `13d317d` 이후)
- 기준 문서: `docs/sprints/sprint-12-ds-code-blank.md`, `docs/ds-question-types.md` §2·§10
- 렌더링 기준선: 변경 전 전 문항(551 + 유형 예시 10 + 데이터 통신 미리보기 25 = 586) 렌더링 해시를 저장소 밖 임시 폴더에 저장 — 변경 후 같은 방법으로 비교

## 끝낸 항목

- 스프린트 문서 작성
- 과목 등록: `data/subjects/data-science/`(index + lec1~lec6 빈 배열), 레지스트리 3번째 과목, 색 #b45309/#fbbf24(대비 테스트 통과). `SubjectDef`에 `status: "preparing"`(문제 0개 챕터만 최소 문항 수 검사 건너뜀 + "준비 중 표시는 빈 챕터가 있을 때만" 테스트), `examPoints: false`, `allOrNothing: ["multi"]`
- slideRef 과목별 규칙(`Lec2 s.25`/`Lec2 p.46`) + 규칙 테스트
- ⭐: `starLabel`·`usesExamPoints`(lib/subjects.ts) → 홈 카드·과목 홈 챕터 카드·챕터 화면 "⭐ 해당 없음", ChapterStart "시험 포인트만"은 ⭐ 0개면 숨김(모든 과목), 통계 ⭐ 달성도 카드는 ⭐ 0개면 "해당 없음"
- 0/1 채점: `gradeQuestion`이 과목의 `allOrNothing` 유형을 0/1로(점수만, detail 유지) → 부분 점수 표시 자동으로 사라짐. `multi` 정답 2개 이상 검증(전 과목, 기존 데이터 통과)
- 코드 블록 `components/qtypes/CodeBlock.tsx`(구문 요소만, whitespace-pre, 줄 번호, 언어 표시, overflow-x-auto), RichText ```python/```sql 펜스(펜스 없는 글은 예전 경로 그대로), `BaseQ.code` 필드(지문 아래 코드)
- code-blank: `lib/qtypes/_shared/codeTokens.ts`(토큰화·굽은 따옴표 변환), `lib/qtypes/codeBlank.ts`(core·검증), `components/qtypes/CodeBlank.tsx`(입력·결과), 레지스트리 2곳·answerKey 등록, 유형 예시(fixtures) + /playground 데이터과학 미리보기(코드 블록 2 + mcq(code 필드·해설 펜스) + code-blank Python·SQL, 모두 PDF 코드 그대로)
- 테스트: codeBlank.test.ts(토큰화·채점·검증), codeBlock.test.ts(코드 블록·RichText·코드 빈칸 화면), scoringPolicy.test.ts(0/1·multi 2개 이상·⭐ 표시), contentQa 펜스 제외
- 전체 vitest 43파일 1569건 통과(이 시점)

- 렌더링 해시 비교: 586/586 같음 — 처음엔 데이터 통신 graph 25문항이 달랐다(지문 아래 코드 자리가 형제 순서를 바꿔 `useId` SVG id가 바뀜) → 코드가 없는 문항은 예전 트리 그대로 두도록 고침
- 브라우저(프로덕션, build && start): 데이터과학 화면·퀴즈 진입·/playground 8화면 × 375/1280 × 라이트/다크 32조합 가로 넘침 0·테마 정상·⭐ 버튼 없음·빈 퀴즈 대신 안내. /playground 데이터과학 3문항 × 4조합 입력·채점 화면 가로 넘침 0. 375px에서 실제 클릭·입력으로 Python 코드 빈칸 정답(라이트), SQL 코드 빈칸 오답(다크, count ✓·groupby ✗, Tab으로 다음 칸 이동 시 코드 블록이 가로로 따라감)
- 찾아서 고친 문제: 375px SQL 채점 화면에서 페이지가 124px 넘침(코드 블록 안 sr-only 절대 위치 글자) → `code`에 `relative` + 테스트
- 키보드: 코드 입력칸에서 1·Enter·←/→ 무시(값 "1"이 입력됨, 답이 완성돼 제출 가능해도 Enter로 제출 안 됨), 입력칸 밖에서는 Enter 제출·← 이전 문제 동작
- 사이트 설명(layout·manifest)에 데이터과학 추가
- 최종: lint 통과, vitest 43파일 1569건, build 통과(28쪽), OS 회귀 14/14, 서버 3123 종료

## 남은 작업

- 없음(사용자 확인 후 커밋)

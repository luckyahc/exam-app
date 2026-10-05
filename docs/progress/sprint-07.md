# 진행 기록 — Sprint 7 화면/UX

중단 대비 기록. 화면 하나를 끝낼 때마다 갱신한다. Sprint 7 작업은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-05
- 기준 문서: [`../sprints/sprint-07-screens-ux.md`](../sprints/sprint-07-screens-ux.md)
- 확인 방법: `npm run build && npm start`(프로덕션) — dev 서버는 메모리 부족으로 중지된 적이 있어 쓰지 않는다.

## 끝낸 화면 (코드 작성·타입 검사·lint·단위 테스트 통과)

| 화면 | 파일 |
|---|---|
| 공통 기반 | lib/storage/recordsStore.ts, lib/quiz/session.ts(+테스트), lib/quiz/loadQuestions.ts, lib/chapterMeta.ts |
| / 홈 | app/page.tsx, components/progress/ProgressStats.tsx |
| /s/[subject] 과목 홈 | app/s/[subject]/page.tsx |
| 챕터 시작 | app/s/[subject]/chapter/[id]/page.tsx, components/quiz/ChapterStart.tsx |
| /quiz | app/quiz/page.tsx, components/quiz/QuizEntry.tsx, QuizRunner.tsx, BookmarkButton.tsx |
| /result | app/result/page.tsx, components/quiz/ResultView.tsx |
| /review | app/review/page.tsx, components/review/ReviewView.tsx |
| 공통 | trace 모바일 카드 레이아웃(components/qtypes/Trace.tsx), 핵심 한 줄 요약 대체(keyLine) |

## 브라우저 확인 (2026-10-05, 프로덕션 빌드 `next start -p 3123`)

- 방법: 확장 탭은 백그라운드라 클릭·스크린샷이 불안정해, 로컬 Chrome 헤드리스 + CDP(Node 내장 WebSocket) 스크립트로 진행. 375px·1280px × 라이트·다크(prefers-color-scheme) 4조합에서 같은 19단계 흐름: 홈 → 과목 → 챕터 시작(유형 2개 연속 선택·10문제) → 즉시 채점(숫자키·Enter 실제 키 이벤트) → 결과 → 틀린 문제만 다시 풀기 → 북마크 → 오답노트(전체)·북마크 탭 → 다시 풀기 → 시험 모드(Ch07 표·순서·짝짓기, 타이머 10분) → 제출 확인 → 결과 → trace 입력 화면 → 데이터 통신 과목·챕터·퀴즈.
- 결과: 4조합 모두 끝까지 진행, 페이지 가로 넘침 0, 콘솔 오류·경고·예외 0(수집 동작은 일부러 낸 console.error로 확인). 375px에서 Ch08 표·순서·짝짓기·그래프·분류 37문제를 한 문제씩 넘기며 넘침 0.
- 저장소 차단(localStorage 접근 시 예외 주입): 퀴즈·결과·다시 풀기까지 오류 없이 동작. 전체 새로고침 후에는 기록이 남지 않음(메모리 보관만 — 예상 동작).
- OS 회귀 14/14.

### 확인 중 고친 문제

1. 진행률 막대 바탕이 카드 배경과 같아 보이지 않음 → `bg-border`
2. 과목 홈 "⭐ 이 챕터 ⭐만 풀기" 별 중복 → "이 챕터 ⭐만 풀기"
3. 페이지에 `<main>`이 없음 → 레이아웃에 추가
4. 챕터 시작의 유형·토픽 칩을 빠르게 연달아 누르면 앞 선택이 사라짐(이전 렌더 값으로 갱신) → 함수형 갱신
5. 해설이 한 문장이면 "핵심:" 줄이 해설과 똑같이 두 번 보임 → 같으면 숨김

## 상태

- 모든 화면 구현·확인 완료, 문서 반영 완료(sprint-07 결과 절·로드맵·multi-subject-design), 커밋 대기

## dev 서버 오류 조사 (2026-10-05)

- 증상: `localhost:3000/s/os`에서 "Jest worker encountered 2 child process exceptions, exceeding retry limit".
- 원인: 고아가 된 `next dev`(PID 40080/29052, 10/04 22:11 시작)의 `/s/[subject]` 정적 경로 작업자가 연속으로 죽음(로그 40회) → 이후 `write EPIPE` 2,124줄. 시스템 메모리 부족(남은 0.1~0.3GB) + dev가 켜진 채 build 반복. `.next/dev`(dev)와 `.next`(build)는 분리되어 있어 직접 충돌은 아님.
- 조치: dev 서버 종료 → `.next` 삭제 → `build && start -p 3000` → `/s/os` 200×5, 전체 흐름 오류 0으로 재현 안 됨. 코드 수정 없음.
- 규칙: 브라우저 확인은 dev 서버를 끈 상태에서 `build && start`로만.

## 마무리 (2026-10-05)

- 미응답: "틀린 문제만 다시 풀기"에는 이미 포함(summarizeSession.wrongIds, session.test.ts). 오답노트 추가는 판정 규칙과 충돌해 보류(sprint-07 문서 3번).
- Sprint 7 DONE, 커밋.

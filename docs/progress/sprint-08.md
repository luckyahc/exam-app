# 진행 기록 — Sprint 8 학습 기능 고도화

중단 대비 기록. 기능 하나를 끝낼 때마다 갱신한다. Sprint 8 작업은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-05 (Sprint 7 커밋 `d6cbb98` 이후)
- 기준 문서: [`../sprints/sprint-08-learning-features.md`](../sprints/sprint-08-learning-features.md), [`../multi-subject-design.md`](../multi-subject-design.md) §5-4
- 확인 방법: dev 서버를 끈 상태에서 `build && start`(한 번에 하나), 끝나면 서버·브라우저 프로세스 종료

## 끝낸 기능

- 백업 JSON 순수 로직 `lib/storage/backup.ts` — `exportBackup`(전체/과목별), `parseBackup`(5MB 상한·JSON·app·version 검사, v1 → `upgradeV1toV2`, 미래 버전 거부, 모르는 과목 건너뜀), `applyBackup`(덮어쓰기/합치기) + `backup.test.ts` 15건
- 스토어 반영·초기화 `recordsStore.ts` — `currentStore`, `writeStore`, `resetData("all" | 과목, {theme})` + `recordsStore.test.ts` 4건(내보내기 → 전체 초기화 → 가져오기 후 새로 읽은 저장소 = 원래, 과목별 초기화, 테마 옵션, 저장소 차단)
- 비슷한 문제 생성 로직 `lib/quiz/similar.ts` — 같은 생성기·params, seed ≥ 1,000,000(데이터 문항 id와 겹치지 않음) + `similar.test.ts` 13건(생성기 문항 전부: 유효성·정답 키 1점·매번 다른 id)
- 대시보드 집계 `lib/stats.ts`(진행률·정답률·⭐ 달성도 = ⭐ 문제 중 마지막 풀이가 완전히 맞음, 생성 문제는 따로) + `stats.test.ts` 3건(수동 시나리오 3개)
- `/stats` 화면: `StatsDashboard`(전체 = 과목 카드, 과목 = 요약 4칸 + 챕터 → 토픽 표), `DataManager`(내보내기 범위 선택 · 가져오기 파일 → `<dialog>`에서 합치기/덮어쓰기 · 초기화 `<dialog>`에서 전체/과목, 전체일 때 테마 옵션)
- 비슷한 문제 버튼(`QuizRunner`, 즉시 채점에서 채점한 생성기 문제만) — 다음 위치에 끼워 넣음, `SessionItem.gen`으로 새로고침해도 다시 만듦
- 오답노트: "틀린 횟수 N / 시도 M" 표시, 생성기 오답(데이터에 없는 id)을 기록의 gen으로 다시 만들어 목록에 표시

- 브라우저 확인(build && start, dev 서버 꺼짐): 375/1280 × 라이트/다크 4조합 — 대시보드·비슷한 문제·내보내기→초기화→가져오기·잘못된 파일 3종·과목별 초기화 다이얼로그·오답노트 시도 횟수. 가로 넘침 0, 콘솔 오류 0. 고친 것: 챕터 펼침 ▸ 아이콘 회전
- lint 통과 · test 686건 통과 · build 통과

- 마무리: 헤더 통계 링크(375px 아이콘 + aria-label "통계"), 오답노트 생성 문제 다시 풀기 재생성 확인 + `loadQuestions.test.ts` 3건, 로드맵 Sprint 8 DONE

## 진행 중

(없음 — Sprint 8 완료)

## 남은 기능

(없음)

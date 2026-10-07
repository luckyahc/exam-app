# 진행 기록 — Sprint 16 데이터과학 콘텐츠 Lec4~Lec6 (전반: Lec4·Lec5)

중단 대비 기록. 소주제 단위로 저장하고 갱신한다. Sprint 16은 보고 전까지 커밋하지 않는다. Lec6은 사용자 확인 후.

- 시작: 2026-10-07 (Sprint 15 커밋 `9a22aab` 이후)
- 기준 문서: `docs/sprints/sprint-16-ds-content-lec4-6.md`

## 확인한 사실

- Lec5 PDF에 ORDER BY·HAVING·ASC/DESC가 없다 → ORDER BY 빈칸·순서 비교 문제는 출제하지 않는다(PDF 범위만)
- 셀레니움 함수 표(s.31): back 뒤로·forward 앞으로·refresh 새로고침·close 탭 닫기·quit 창 닫기·maximize_window·minimize_window·print(driver.page_source) 브라우저 HTML 정보 출력

## 끝낸 항목

- 스프린트 문서, 파이프라인 보강: SQL 준비 스크립트 studentCourse·empty, SQL mcq 결과 표 고르기(check output, 행 순서 무시), verify.sql.compareColumns(별칭 AS), MySQL 전용 감지(VALUES 안의 DEFAULT·VERSION())

- Lec4 36문항 작성(코드 13 = 빈칸 11·코드 보기 mcq 2, 전부 실행 제외(셀레니움), multi 3·mcq 7), rules·data 테스트 통과

- Lec4 대조 기록(36: 실행 제외 13·개념 23), 비중 규칙 통과
- Lec5 68문항(코드 36 = 빈칸 25·작성 5·결과 표 고르기 6, multi 6, mcq 17), 대조 기록(실행 34·실행 제외 2·개념 32), 검증이 찾은 wrong 2건(JOIN WHERE·쉼표 조인 ON) 수정
- Lec1~3 비중 보강: Lec2 코드 빈칸 +18 완료(검증 통과)

- Lec3 +5·Lec1 +4 코드 빈칸 완료, ratio.test.ts를 전 강의에 적용(복수 선택 8%는 Lec4~ — Lec2 6.6%), Lec1~3 대조 기록 다시 생성
- 비중(코드 문제 중 빈칸/작성/결과 고르기, mcq): Lec1 33/33/33·19% → 71/14/14·17%, Lec2 44/13/33·33% → 60/10/24·26%, Lec3 56/19/25·33% → 67/14/19·30%

- 최종: lint 0건, npm test 1979건, verify:ds 40건, build, OS 회귀 14/14, 렌더링 해시 586/586, 브라우저(Lec5·Lec4 코드 빈칸 4조합 채점, 전 문항 375px 넘침 0), 서버·탭 종료

- 전반 마무리(2026-10-07): Lec2 복수 선택 +2(set-006·scope-007 → 8/93 = 8.6%), ratio.test.ts가 복수 선택 8%도 전 강의에 강제. SQL 전체 작성형 결과 화면에 "MySQL과 문법 차이가 있을 수 있음" 안내, ds-question-types.md §11 알려진 한계. 테스트 안정화: 검증 실행 제한 30초(VERIFY_TIMEOUT_MS), vitest testTimeout 30초(엔진 Worker 동시 실행 부하로 5초 초과 간헐 실패) — 이후 전체 실행 12번 중 11번 통과, 1번은 다시 나오지 않아 원인 미확인
- 전반 커밋 후 후반: Lec6

- 후반 Lec6(2026-10-07): 82문항(코드 47 = 빈칸 31·작성 2·결과 고르기 14, 실행 47 = 넘파이 22·판다스 25, 개념 35), 복수 선택 7(8.5%)·mcq 15(18.3%), 소주제 25개 모두 목표 이상, p.62~63 실습 제외(사용자 지시). 대조 기록 docs/verification/data-science-lec6.md, PDF 대조로 고친 것: 해설 표기 2건((보충) 위치), 이중 공백 1건. 과목 status: "preparing" 제거(integrity.test)
- 최종: lint 0건, npm test 2082건, verify:ds 40건, build, OS 회귀 14/14, 렌더링 해시 586/586, 브라우저(넘파이 빈칸·판다스 빈칸·판다스 작성형 × 4조합 채점, 판다스 엔진 16.4~17.0초, Lec6 전 문항 375px 넘침 0), 서버·탭 종료

- 마무리(2026-10-07): group-001~004 지문·해설에 데이터 상태 명시(group-003 지문 "[코드 6-33]으로 인덱스 4번 행의 키를 5 늘린 뒤", 해설 "슬라이드 결과(평균 162.8, 표준편차 5.630275)는 6-33 수정 전 원래 데이터 기준"). 6-33 이후 데이터를 전제로 하는 다른 문항 없음(struct-*는 나이·열 이름만, stat-*는 6-32). 로드맵 Sprint 16 DONE

## 진행 중

- 없음 — Sprint 16 완료

## 남은 작업

- 없음

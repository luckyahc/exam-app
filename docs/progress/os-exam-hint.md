# 진행 기록 — OS 시험 힌트 반영 · 용어 사전 · 풀이 상태별 문제 보기

중단 대비 기록. 단계를 마칠 때마다 갱신한다. 커밋하지 않고 보고 후 멈춘다.

- 시작: 2026-10-07 (커밋 `93abd4c` 이후)
- 기준 문서: `docs/os-exam-hint.md`(힌트 원문·세부 항목표)
- 작업 순서: 1 현황 분석 → 2 ⭐ 반영 → 3·4 형식·영어 보강(Ch02 → Ch03 → Ch07 → Ch08) → 5 용어 사전(데이터 → 화면 → 단답형) → 6 풀이 상태별 문제 보기

## 도구(작업 폴더 밖)

- PDF 텍스트(인쇄 + 필기): `C:\Users\USER\.claude\jobs\4e6fd3b3\tmp\os\Ch0N\pNN.txt`(pdftotext -layout, 쪽마다 파일)
- 보강 전 표: `…\tmp\os\table_before.md`, 표 생성 임시 테스트 `lib/verify/_hint_table.test.ts`(OUT=경로 환경변수 — 끝나면 지운다)

## 끝낸 항목

- 1 현황 분석: 세부 항목 40개(`data/subjects/os/hints.ts`), 집계·규칙(`hintStats.ts`), 보강 전 표(`docs/os-exam-hint.md`). 미달 24/40, mcq 보기 수 문제 0
- 2 ⭐ 반영(데이터 모델): `ExamBasis`에 "exam-hint", `BaseQ.hintIds`(lib/qtypes/base.ts, 검증 2줄), 챕터 load에서 `applyHints`(index.ts), ⭐ 뱃지 "시험 힌트" + 툴팁에 항목 번호(QuestionRenderer). contentQa의 ⭐ 요약 필수 규칙은 exam-hint 제외

- 3·4 Ch02: `data/subjects/os/ch02-hint.ts` 26문항(2-2 match 2·blank 1, 2-3 mcq·match·blank, 2-4 blank 2·order·mcq, 2-5 match 3·mcq, 2-6 match 2·mcq, 2-7·2-9 match 2·blank·calc 2·mcq, 2-8·2-10 match·calc·mcq). 기존 계산 문항 7개(time-calc-001~007)와 생성기 지문에 response time·processor utilization 병기. 챕터 load = 본 파일 + chNN-hint.ts → applyHints(index.ts의 withHints, 반환 타입 명시로 레지스트리 타입 순환 방지)
- 3·4 Ch03: `ch03-hint.ts` 18문항(3-5·3-6 match 3·mcq, 3-7 match·blank 2·mcq, 3-8·3-9 match 3·order·blank, 3-10·3-11 match 2·blank·mcq·order)
- 3·4 Ch07: `ch07-hint.ts` 11문항(7-1 match 2, 7-2 blank(MMU), 7-4·7-5 match·blank·mcq 2, 7-6 match, 7-7·7-8 order 2·match)
- 3·4 Ch08: `ch08-hint.ts` 8문항(8-1·8-2 match 3·blank 2·mcq, 8-6 order, 8-8 mcq). **힌트 40항목 모두 기준 충족(미달 0/40)**, integrity·contentQa 통과. 영어 문항(자동 집계) Ch02 14→26, Ch03 48→66, Ch07 21→28, Ch08 40→45
- 5-1 용어 데이터: `data/subjects/glossary.ts`(공용 타입·termAccept·defLeaksTerm), `os/glossary.ts` 170개(정의 167·정의 없음 3), `os/terms.ts`(용어 단답형 120개 생성, 기존 blank 40개에 47개 연결), SubjectDef.loadGlossary, `docs/os-glossary.md`. 검사 `os/hints.test.ts`(힌트 규칙·mcq·영어·용어 연결·accept·slideRef·정의 누출). 연결하며 accept에 영어 추가: ch08 page-fault-004·locality-001·pte-003
- 5-2·5-3 화면: `/s/[subject]/glossary`(GlossaryView — 검색·챕터·힌트 범위·가나다/챕터 정렬·관련 문제 풀기, 375px 카드·넓은 화면 표), 과목 화면에 용어 정리·용어 퀴즈(전체·챕터별, topics=용어)
- 6 문제 목록: `lib/quiz/status.ts`(풀이 상태), `lib/quiz/questionList.ts`, `components/questions/QuestionList.tsx`, `/s/[subject]/questions`, 퀴즈 필터에 statuses·ids, 챕터 시작 풀이 상태 옵션, /review에 과목별 문제 목록 링크, 테스트 `lib/quiz/questionList.test.ts` 8개
- OS 대조 기록: 시험 힌트 보강 63·용어 단답형 120행 추가, 수정 10(지문 영어 병기 7·accept 3), ⭐ 칸 갱신(스크립트 tmp/os/update_records.js). PDF 대조로 고친 것: ch08-hint-virtual-002(p.4에 명시되지 않은 "메모리 보호" 공통점 짝 → "Paging·Segmentation 그대로 사용"으로 교체)
- docs/os-exam-hint.md 보강 후 표, docs/question-list.md(상태 정의)

- 최종(2026-10-07): lint 0, npm test 2304(--maxWorkers=1, 임시 표 생성 파일 삭제 후), verify:ds 40, build(/s/os/glossary, /s/{os,data-comm,data-science}/questions 생성, 데이터 통신 용어 정리 404), OS 회귀 14/14, 렌더링 해시 기준 586 중 274 동일·312 변경(모두 OS, 내용 수정 10 + 힌트로 ⭐ 135 + 필기 ⭐에 힌트 툴팁 167 — docs/os-exam-hint.md 끝 목록)
- 브라우저 확인: 건너뜀 — 여유 메모리 308~390 MB(기준 1 GB 미만). 서버 종료, 포트 3000·3123~3125 비어 있음

- 후속(2026-10-07, 사용자 지시):
  - ⭐ 근거별 선택: `lib/quiz/starBasis.ts`(전체 ⭐ / 교수님 필기만 = examBasis handwritten / 시험 힌트만 = hintIds 있음, 필기+힌트 문항은 양쪽). 챕터 시작(근거가 둘인 챕터만 4지 선택, 아니면 기존 "시험 포인트만")·문제 목록(OS만 근거 선택, 데이터 통신은 "시험 포인트만" 체크, 데이터과학은 숨김)·퀴즈 주소 star=1|handwritten|hint·ChapterMeta(starHwIds·starHintIds, rows.hw·hint)·통계(⭐ 달성도에 "필기 x/y · 힌트 a/b" — 두 근거가 다 있을 때만). 테스트 `lib/quiz/starBasis.test.ts` 5개
  - 정의 없음 3개(프로세스 이미지·시스템 콜 인터페이스·세마포어)를 슬라이드 근거로 정의하고 용어 단답형 3개 추가(os-ch02-term-025, os-ch03-term-037·038 — 사전의 챕터 끝으로 옮겨 기존 번호 유지). 정의 없음 0개, 용어 단답형 123개
  - 대조 기록에 새 3행, 기록 스크립트를 다시 실행해도 수정 메모가 겹치지 않게 고침(겹친 메모 정리)
  - 로드맵 변경 이력에 이번 작업 1줄(`docs/02-roadmap.md`)
- 중단 후 재개(2026-10-07 18:23): 최종 검사(npm test) 도중 사용자가 중단. 백업 `C:\test-archive-backup\backup-20261007-182345\`(tracked.patch·untracked.tar.gz). 남은 vitest 프로세스 종료, `.next` 삭제. 점검 결과 후속 1~4는 모두 끝나 있었고 깨진 파일 없음(문법·괄호·문서 details 짝 정상). PDF 재대조로 시스템 콜 인터페이스 정의의 예시를 슬라이드 표현(Ch03 p.36 필기 "print, scanf 등")에 맞춤. lint 0, npm test 2312 통과

## 브라우저 확인 — 하지 못함

이 작업(시험 힌트 반영·용어 사전·풀이 상태별 문제 보기·⭐ 근거 선택)은 **브라우저에서 확인하지 못했다.** 확인 시점마다 PC의 여유 메모리가 308~390 MB로 기준(1 GB)보다 적었다. 대신 단위 테스트(문제 목록·풀이 상태·⭐ 근거·정답·해설 보기가 기록을 바꾸지 않음), 프로덕션 빌드, 라우트 응답(OS 용어 정리·세 과목 문제 목록 200, 데이터 통신 용어 정리 404)으로 확인했다.

### 배포 후 사용자가 확인할 항목

- [ ] 용어 정리(/s/os/glossary): 검색(한국어·영어·약자 — 예: 스래싱, TLB, page fault), 챕터 필터, "시험 힌트 범위만", 가나다/챕터 순 정렬, "관련 문제 풀기"
- [ ] 용어 퀴즈(OS 과목 화면): 전체 챕터·챕터별로 시작해 한국어/영어 답이 모두 정답 처리되는지
- [ ] 세 과목 문제 목록(/s/os·data-comm·data-science/questions): 탭 전환(전체·안 푼·맞힌·틀린·북마크, 개수), "정답·해설 보기"(풀이 기록이 늘지 않는지), "이 목록으로 풀기"(섞기·문제 수)
- [ ] 챕터 시작 화면: 풀이 상태(전체·안 푼·틀린·맞힌) 옵션과 ⭐ 근거(OS: 전체 ⭐·교수님 필기만·시험 힌트만) 옵션의 문제 수가 맞는지, 시작한 퀴즈 제목에 조건이 표시되는지
- [ ] 375px(휴대폰): 위 화면 모두 가로 넘침(옆으로 밀림)이 없는지, 용어 정리가 카드 목록으로 보이는지 — 라이트·다크

- 최종(후속, 2026-10-07): lint 0, npm test 2312(--maxWorkers=1), verify:ds 40(--maxWorkers=1, 첫 실행은 메모리 부족으로 Worker 비정상 종료 → 다시 실행 통과), build(첫 시도 메모리 부족 → 다시 시도 통과), OS 회귀 14/14, 라우트 확인(챕터 시작 HTML에 "교수님 필기만 63·시험 힌트만 151", 데이터 통신은 근거 선택 없음). 서버 종료

## 진행 중

- 없음 — 커밋·푸시

## 남은 작업

- 배포 후 위 확인 항목

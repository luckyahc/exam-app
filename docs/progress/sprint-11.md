# 진행 기록 — Sprint 11 QA·접근성·배포 준비

중단 대비 기록. 항목을 끝낼 때마다 갱신한다. Sprint 11 작업은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-05 (Sprint 10 커밋 `6c7f353` 이후)
- 기준 문서: `docs/sprints/sprint-11-qa-release.md`

## 끝낸 항목

- ⭐ summary: 정적 176문항(데이터에 직접) + 생성기 ⭐ 문항(OS buddy·replacement, 데이터 통신 capacity·대역폭-지연 곱·link-fill — 생성기가 만듦) → ⭐ 210문항 전부 summary
- 콘텐츠 자동 점검(두 과목 551문항): 빈 해설 0 · slideRef 누락/형식 오류 0 · 마크다운 짝 0 · 이중/앞뒤 공백 0 · 반복 단어 0 · 괄호 짝 4(모두 의도된 표기: 반개구간 `[128K, 256K)`, 번호 목록 `1) 2)`) — 고친 오타 0. 보고만: 같은 지식 포인트·같은 형식 후보 4쌍(데이터 통신 정적↔고정 seed 생성기), 짧은 해설 4, 해설에 쪽 표기 없는 정적 문항 19
- 상시 테스트 `data/subjects/contentQa.test.ts`(해설·slideRef·⭐ summary·마크다운·공백), `data/subjects/os/verification.test.ts`(OS 대조 기록 3개 ↔ 데이터)
- 대조 기록 4개 재확인: os-ch02-ch03(154 = 일치 126·수정 15·신규 13, 필기 31), os-ch07(89 = 일치 80·수정 9, 필기 14), os-ch08(138 = 일치 121·수정 16·추가 1, 필기 24), data-comm-ch01-ch02(Ch01 58 = 일치 38·수정 20, Ch02 112 = 일치 112) — 모두 데이터와 일치
- 챕터 최소 문항 수 검사: 경고 → 실패 조건(`integrity.test.ts`, 6챕터 모두 통과)

- 보기 순서 섞기(`lib/qtypes/choiceOrder.ts`): mcq·multi 보기를 문제 id 고정 seed로 섞어 표시(정답이 앞쪽에 몰린 데이터 편향 보정), 답·채점은 원래 번호. 숫자키 i = 화면 i번째 보기. 위치를 가리키던 해설 4곳("마지막 보기"·"두 번째 보기"·"나머지 두 보기") → 보기 내용으로 고침(os ch02 ×3, ch03 ×1). qtypes 테스트 갱신
- 대비: `lib/color/themeContrast.test.ts` — 라이트/다크 글자·상태색 4.5:1, 채운 버튼 글자 `text-background`(ThemeToggle의 `text-white` 고침), 과목 색 3:1(그래픽), `:focus-visible` outline 규칙(globals.css) + `outline-none` 금지. 컴포넌트에 팔레트 색 직접 사용 없음(전부 테마 토큰)
- 정답/오답 표시: Mark(✓/✗+텍스트)·Tag·Trace(sr-only 텍스트)·Graph(태그) — 색 단독 표시 없음
- README: 로컬 실행·문제 추가(스키마 표 + 예시)·과목 추가·문제 유형 추가(등록 지점 2곳)·Vercel 배포 추가
- 배포 점검: `process.env`·외부 fetch/CDN 없음, vercel.json/.env 없음, 폰트 로컬(next/font/local), 전 경로 정적 — 설정 없이 Import 가능
- OS 회귀(`test:os-regression`, 프로덕션 서버) 14/14 통과
- 키보드: `useQuizShortcuts` 1~9/Enter/←→, 입력칸에서는 꺼짐 — 코드 점검 이상 없음
- lint 통과, build 통과(전 경로 정적)

- 보기 섞기 보강: `shuffle: false` 옵션(OS 배치 생성기 "블록 1~N"에 적용), `choiceOrder.test.ts`(순열·고정 순서·풀이/결과 화면 같은 순서·저장 답 채점 불변·숫자키), `contentQa.test.ts`에 "섞이는 문항의 보기·해설이 다른 보기 위치를 가리키지 않음" 추가. 다른 보기를 가리키는 보기: 전 과목 171문항·731보기 중 0. 문서 근거 없음 → sprint-11 문서 "이 문서와 다르게 한 부분"에 기록
- /playground: 메뉴 링크 없음, `robots: { index: false }` — Sprint 3 문서("검색 노출 안 함")와 같음, 변경 없음
- 브라우저(프로덕션): 15화면 × 320/375/768/1280 × 라이트/다크 = 120조합, 가로 넘침·테마 불일치·빈 화면 0. 375px iframe에서 order ↑↓ 실제 클릭·제출(부분 점수 73%), trace 드롭다운 키보드 조작·제출(부분 점수 50%), 단축키 1·3 토글·Enter 채점·→/← 이동, 1번 키 = 화면 첫 보기(데이터 첫 보기와 다름) 확인. 서버 3123 종료
- 로드맵 Sprint 11 DONE·변경 이력 기록. sprint-11 문서 체크(공통 콘텐츠 검수 5개는 미체크로 남김)
- 최종: lint 통과 · test 40파일 1,520건 통과(3회 연속) · build 통과 · OS 회귀 14/14

## 남은 작업

- 없음(커밋·푸시 후 종료)

## 마무리(사용자 지시)

- 정적↔생성기 같은 형식 4쌍: 생성기 seed만 변경(정적 그대로) — `gen-signal-14`→`gen-signal-30`(1/3→3/4 주기, 정적 phase-001은 1/6 주기·라디안), `gen-digital-14`→`gen-digital-2`(100 Mbps→56 kbps, 정적 digital-004는 1.536 Mbps), `gen-performance-24`→`gen-performance-2`(6 bps·3 s→9 bps·7 s, 정적 bdp-003은 5 bps·5 s), `gen-multiplexing-20`→`gen-multiplexing-1`(20 kHz×7·보호 5→4 kHz×6·보호 2, 정적 fdm-004는 100 kHz×5·보호 10). 대조 기록 `data-comm-ch01-ch02.md` 4줄 갱신, Ch02 112문항 유지. 문장 형식은 생성기 variant가 정하므로 seed로는 숫자·정답만 달라진다
- content-checklist 공통 검수 5개: "자동 검사 + 문항별 PDF 대조 기록으로 갈음, 사용 중 발견 시 수정"으로 체크, 근거 검사·파일 기재, 데이터 통신 Ch02 calc 34% = 의도된 편차

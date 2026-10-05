# 진행 기록 — Sprint 10 데이터 통신 콘텐츠 (Ch01만)

중단 대비 기록. 소주제를 끝낼 때마다 갱신한다. Ch01 작업은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-05 (Sprint 9 커밋 `666fa73` 이후)
- 기준 문서: [`../sprints/sprint-10-dc-content.md`](../sprints/sprint-10-dc-content.md), [`../dc-source-analysis.md`](../dc-source-analysis.md), [`../coverage-matrix.md`](../coverage-matrix.md) 데이터 통신 Ch01
- 근거 PDF: `source/data-communication/DC-1-Introduction.pdf` (한 쪽에 슬라이드 2장, PDF 쪽 = ⌈슬라이드 ÷ 2⌉) — 44장 전부 이미지로 확인
- 파일: `data/subjects/data-comm/ch01.ts`, 대조 기록 `docs/verification/data-comm-ch01-ch02.md`(Ch01 절)
- 결과: 58문항 — mcq 16 · ox 10 · blank 12 · multi 5 · match 7 · classify 4 · order 2 · graph 2 (⭐ 0 — Ch01은 인쇄 강조 0건)

## 끝낸 소주제

- 1~6 (s.2~7): 정의·4특성 3, 구성 요소 3, 데이터 표현 3, 데이터 흐름 3(graph 1), 네트워크 2, 연결 유형 2 — 17문항, 무결성 통과
- 7~12 (s.8~28): 토폴로지 4(graph 1), LAN 3, WAN 4, 인터네트워크·인터넷 3, 인터넷 접속 4, 계층화 3 — 21문항, 무결성 통과
- 13~18 (s.29~44): 2원칙·논리 연결 3, TCP/IP 4, 동일 객체 3, 계층 역할·헤더 4, OSI 4, TCP/IP vs OSI 3 — 21문항
- `ch01.test.ts` 11건(문항 수·소주제 목표·비율·⭐ 없음·slideRef·해설 "s.N (p.P)" 쪽 번호 검사·blank 표기 변형·대조 기록 일치)
- PDF 대조: 58문항 전부 원문·그림과 대조 → 일치 56 · 수정 2(wan-002 원문 인용, lan-001 accept 추가) — `docs/verification/data-comm-ch01-ch02.md`
- `content-checklist.md` Ch01 체크·실제 문항 수
- 브라우저 확인(build && start, dev 서버 꺼짐): 375/1280 × 라이트/다크 — 홈 카드 활성(챕터 2개·문제 58개), 과목 홈(CH02는 "문제 준비 중"), 챕터 시작 → 퀴즈 → 결과 → 오답노트(데이터 통신·전체) → 통계, graph 문제 렌더·채점. 375px에서 58문항 전부 풀기·채점 화면 가로 넘침 0, 콘솔 오류 0
- 고친 것: ① 결과 화면 크래시(순서 배치를 손대지 않고 제출하면 답이 세션에 저장되지 않아 결과 화면의 답 다시 그리기에서 오류 — Sprint 7부터 있던 버그, OS에도 해당) — QuizRunner가 채점한 답을 저장 + ResultView는 답이 없으면 빈 답으로 ② "핵심" 줄이 데이터 통신 출처 표기 "s.N (p.P):"를 떼지 못함 — keyLine 확장 + 테스트, 첫 문장이 그림 라벨인 3문항에 summary 추가
- lint 통과 · test 982건 통과 · build 통과

- 마무리(2차): 화면에 없는 그림을 가리키던 18문항 수정 + `noFigureRefs.test.ts`, 순서 배치 제출 회귀 테스트 `orderSubmit.test.ts`(`gradeInSession`·`answerForReview`로 분리), content-checklist·coverage-matrix·로드맵 갱신 → 커밋

## 진행 중

(없음 — Ch01 완료)

## 남은 작업

- Ch02는 `sprint-10-ch02.md`에서 추적

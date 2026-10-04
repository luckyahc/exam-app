# Sprint 10 — 데이터 통신 콘텐츠 제작 (Ch01 · Ch02)

## 목표

`data/subjects/data-comm/ch01.ts`, `ch02.ts`를 작성해 [`coverage-matrix.md`](../coverage-matrix.md) 데이터 통신 섹션의 소주제별 목표 문항 수를 채운다. 세부 추적은 [`content-checklist.md`](../content-checklist.md)의 데이터 통신 섹션을 사용한다.

## 선행 조건

- Sprint 9 완료 (생성기·`calc` 보강·SVG)
- [`dc-source-analysis.md`](../dc-source-analysis.md) 확인 필요 전 항목 결정 완료(2026-10-04): 필기본 없음, ⭐ 3개(`printed-emphasis`), 목표 Ch01 ≥57 / Ch02 ≥106

## 작업 항목

- [ ] Ch01 18개 소주제, Ch02 27개 소주제 전부 커버 — `subject: 'data-comm'`, id `data-comm-{chapter}-{topicSlug}-{nnn}`
- [ ] Ch01은 개념 문제만(계산 공식 없음). 메시 링크 수는 "5개 스테이션 → 10개 링크" 사실만 출제, 공식 출제 금지
- [ ] Ch02 계산 문제는 전부 `lib/sim/data-comm/` 생성기로 정답 산출 (손으로 쓴 계산 정답 금지)
- [ ] ⭐ 소주제 3개(Ch02 12. 전송률 한계·Nyquist, 13. Shannon·두 한계, 16. 대역폭-지연 곱·지터)는 각 6~10문항(목표 8), 유형 혼합 — 모든 ⭐ 문제에 `exam: true, examBasis: 'printed-emphasis'`
- [ ] 모든 문제에 `slideRef`(`Ch02 s.38` 형식), `topic`, `exam`, `difficulty` + 해설 3요소(근거/오답 이유/출처), 슬라이드에 없는 보충은 "(보충)"
- [ ] 확인 필요 항목 처리 방침 준수: 비트 길이는 문제에 답 단위 명시 + 해설에 "교재 정의는 거리, 슬라이드 예제는 시간" 한 줄(4), 위상·peak·dB 근사값 허용 오차(5~7), 델타 변조 비트열 생성 금지(8), PM β는 문제에서 제시(9)
- [ ] 출제 금지: CDMA(3장), 핸드셰이크 절차, 헤더 필드 구조 — 슬라이드에 없음
- [ ] 객관식 오답 보기는 슬라이드 안의 혼동 쌍으로(대역폭 vs 처리량, 비트율 vs 보오율, Nyquist vs Shannon, 기저대역 vs 광대역, 유도 vs 비유도, LAN vs WAN, 다이얼업 vs DSL, ISO vs OSI)
- [ ] 빈칸 `accept`에 한/영 표기 변형(지터/Jitter, 보호 대역/guard band, 클래딩/피복/cladding, 꼬임쌍선/twisted-pair …)
- [ ] 유형 비율(원본 §8) 점검, 중복 문제 검수

## 완료 기준 (DoD)

- 챕터별 목표 문항 수 충족, `data/subjects/integrity.test.ts` 통과
- `content-checklist.md` 데이터 통신 체크박스 완료 + 실제 문항 수 기록
- 홈의 데이터 통신 카드가 "준비 중"에서 활성으로 바뀌고, 과목 홈 → 챕터 → 퀴즈 → 결과 → 오답노트(과목 탭/전체) 전체 흐름이 데이터 통신에서도 동작 (화면 코드 수정 없이)
- 생성기 문제(`calc`·`trace`)와 `graph` 문제 각각 최소 1개를 실제 렌더링해 정답·비교 UI 확인

## 다음 스프린트와의 연결

- Sprint 11(QA & 배포)에서 두 과목 전체를 최종 점검한다.

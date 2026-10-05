# Sprint 10 — 데이터 통신 콘텐츠 제작 (Ch01 · Ch02)

## 목표

`data/subjects/data-comm/ch01.ts`, `ch02.ts`를 작성해 [`coverage-matrix.md`](../coverage-matrix.md) 데이터 통신 섹션의 소주제별 목표 문항 수를 채운다. 세부 추적은 [`content-checklist.md`](../content-checklist.md)의 데이터 통신 섹션을 사용한다.

## 선행 조건

- Sprint 9 완료 (생성기·`calc` 보강·SVG)
- [`dc-source-analysis.md`](../dc-source-analysis.md) 확인 필요 전 항목 결정 완료(2026-10-04): 필기본 없음, ⭐ 3개(`printed-emphasis`), 목표 Ch01 ≥57 / Ch02 ≥106

## 작업 항목

- [x] Ch01 18개 소주제, Ch02 27개 소주제 전부 커버 — `subject: 'data-comm'`, id `data-comm-{chapter}-{topicSlug}-{nnn}`
- [x] Ch01은 개념 문제만(계산 공식 없음). 메시 링크 수는 "5개 스테이션 → 10개 링크" 사실만 출제, 공식 출제 금지
- [x] Ch02 계산 문제는 전부 `lib/sim/data-comm/` 생성기로 정답 산출 (손으로 쓴 계산 정답 금지)
- [x] ⭐ 소주제 3개(Ch02 12. 전송률 한계·Nyquist, 13. Shannon·두 한계, 16. 대역폭-지연 곱·지터)는 각 6~10문항(목표 8), 유형 혼합 — 모든 ⭐ 문제에 `exam: true, examBasis: 'printed-emphasis'`
- [x] 모든 문제에 `slideRef`(`Ch02 s.38` 형식), `topic`, `exam`, `difficulty` + 해설 3요소(근거/오답 이유/출처), 슬라이드에 없는 보충은 "(보충)"
- [x] 확인 필요 항목 처리 방침 준수: 비트 길이는 문제에 답 단위 명시 + 해설에 "교재 정의는 거리, 슬라이드 예제는 시간" 한 줄(4), 위상·peak·dB 근사값 허용 오차(5~7), 델타 변조 비트열 생성 금지(8), PM β는 문제에서 제시(9)
- [x] 출제 금지: CDMA(3장), 핸드셰이크 절차, 헤더 필드 구조 — 슬라이드에 없음
- [x] 객관식 오답 보기는 슬라이드 안의 혼동 쌍으로(대역폭 vs 처리량, 비트율 vs 보오율, Nyquist vs Shannon, 기저대역 vs 광대역, 유도 vs 비유도, LAN vs WAN, 다이얼업 vs DSL, ISO vs OSI)
- [x] 빈칸 `accept`에 한/영 표기 변형(지터/Jitter, 보호 대역/guard band, 클래딩/피복/cladding, 꼬임쌍선/twisted-pair …)
- [x] 유형 비율(원본 §8) 점검, 중복 문제 검수
- [x] **문항별 PDF 대조 기록** `docs/verification/data-comm-ch01-ch02.md`을 작성한다 — [`os-ch02-ch03.md`](../verification/os-ch02-ch03.md)와 같은 형식(문항 한 줄: id / slideRef / ⭐ / 근거(인쇄·필기) / 대조 결과(일치·수정·신규) / 수정 내용, 맨 위에 개수 요약). 챕터 전 문항을 빠짐없이 기록하고, 요약 숫자는 표에서 센 값과 같아야 한다

## 완료 기준 (DoD)

- 챕터별 목표 문항 수 충족, `data/subjects/integrity.test.ts` 통과
- `content-checklist.md` 데이터 통신 체크박스 완료 + 실제 문항 수 기록
- `docs/verification/data-comm-ch01-ch02.md`에 전 문항 대조 기록(과목-챕터별 파일 규칙)
- 홈의 데이터 통신 카드가 "준비 중"에서 활성으로 바뀌고, 과목 홈 → 챕터 → 퀴즈 → 결과 → 오답노트(과목 탭/전체) 전체 흐름이 데이터 통신에서도 동작 (화면 코드 수정 없이)
- 생성기 문제(`calc`·`trace`)와 `graph` 문제 각각 최소 1개를 실제 렌더링해 정답·비교 UI 확인

## 다음 스프린트와의 연결

- Sprint 11(QA & 배포)에서 두 과목 전체를 최종 점검한다.

## 결과 (2026-10-05, DONE)

- Ch01 58문항(커밋 `6d871de`), Ch02 112문항(정적 90 + 고정 seed 생성기 22). ⭐ 24(Ch02 소주제 3개 × 8, 모두 `printed-emphasis`).
- 대조 기록 `docs/verification/data-comm-ch01-ch02.md`(Ch01 일치 38·수정 20, Ch02 일치 112), 테스트 `ch01.test.ts`·`ch02.test.ts`·`noFigureRefs.test.ts`·`components/quiz/orderSubmit.test.ts`.
- 375/1280 × 라이트/다크 브라우저 확인(데이터 통신 흐름, Ch02 calc·trace·graph, 지수 입력), 가로 넘침·콘솔 오류 0.

## 이 문서와 다르게 한 부분

1. **문항 수 판정 기준**: 로드맵의 "정적 문제 ≥163문항"과 Sprint 10 지시("Ch02 정적 ≥106")와 달리, Ch02는 **고정 seed 생성기 문항을 포함**해 판정했다 — 정적 90 + 고정 seed 생성기 22 = 112. 처음 보고에서 이 차이를 밝히지 않았고, 2026-10-05에 사용자가 포함 기준을 승인했다. OS는 같은 방식으로 '실제'를 적었지만 정적 문항만으로도 최소 문항 수를 넘는다(coverage-matrix 데이터 통신 절).
2. **id 접두사**: 지시는 `dc-`였지만 이 문서·무결성 규칙대로 `data-comm-{chapter}-…`.
3. **slideRef 필드**: `Ch0N s.N` 형식(이 문서 규칙). 해설 첫머리와 대조 기록은 "s.N (p.P)" 표기.
4. **graph·match 권장 유형**: SVG가 없는 소주제(연결 유형·WAN·왜곡·Nyquist·대역폭-지연 곱)는 graph 대신, 정답이 하나로 정해지지 않는 짝(BASK·BPSK 구현·공식, FM·PM 공식)은 match 대신 다른 유형.
5. **⭐ 유형 수**: coverage-matrix "6가지 유형 혼합" 대신 각 5종(지시 기준 3종 이상은 충족).
6. **화면 코드 수정**: DoD는 "화면 코드 수정 없이"지만, 결과 화면 크래시(순서 배치를 그대로 제출하면 답이 저장되지 않음)와 핵심 한 줄의 출처 표기 문제를 고쳤다.


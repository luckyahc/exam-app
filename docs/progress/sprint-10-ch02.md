# 진행 기록 — Sprint 10 데이터 통신 콘텐츠 (Ch02)

중단 대비 기록. 소주제를 끝낼 때마다 갱신한다. Ch02 작업은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-05 (Ch01 커밋 `6d871de` 이후)
- 기준 문서: `docs/sprints/sprint-10-dc-content.md`, `docs/dc-source-analysis.md`, `docs/coverage-matrix.md` 데이터 통신 Ch02(소주제 27개, 목표 106)
- 근거 PDF: `source/data-communication/DC-2-PhyLayer.pdf` (한 쪽에 슬라이드 2장, PDF 쪽 = ⌈슬라이드 ÷ 2⌉)
- 파일: `data/subjects/data-comm/ch02.ts`, 테스트 `ch02.test.ts`, 대조 기록 `docs/verification/data-comm-ch01-ch02.md`(Ch02 절)

## 끝낸 소주제

- 생성기 보강: 허용 오차·반올림 규칙이 적용되는 calc, 두 한계에서 고르는 비트율, link-fill(t ≤ 지연) 해설에 "(보충)" 자동 표시 / capacity의 Shannon·두 한계 문항에 "⭐ 근거: s.33 인쇄 강조의 범위 확장" 자동 표시 / tdm-frame 문장에서 "슬라이드 그림처럼" 제거
- 1~11 (s.2~32): 33문항 — 무결성·그림 참조 검사 통과
- 12~18 (s.33~62, ⭐ 3개 중 3개 포함): 39문항
- 19~27 (s.63~101): 40문항
- 합계 112(정적 90 + 생성기 22): calc 38 · blank 18(16.1%) · mcq 17(15.2%) · graph 11 · ox 10(8.9%) · classify 5 · multi 4 · trace 4 · match 3 · order 2, ⭐ 24
- `ch02.test.ts`: 문항 수·소주제 목표·⭐ 규칙·비율·FM/PM 금지·슬라이드 예제 기준값 20문항·생성기 재현·(보충) 표시·비트 길이 규칙·대조 기록 일치
- 대조 기록 Ch02 절(일치 112), content-checklist·coverage-matrix 갱신

- 브라우저 확인(build && start, dev 서버 꺼짐): 375/1280 × 라이트/다크 — calc 5(지수 입력 7.5x10^-7·10^-3, 슬라이드 근사값 34,881·−3·98.7 모두 정답 처리), trace 3(capacity 두 한계·link-fill·tdm-frame — 오답 비교 화면), graph 3(성상도·AM vs FM·스펙트럼) 풀기·채점 → 결과 화면. 375px에서 112문항 전부 가로 넘침 0, 콘솔 오류 0
- lint 통과 · test 1324건 통과 · build 통과

## 진행 중

(없음 — 보고 대기, 커밋하지 않음)

## 남은 작업

- (완료) 문항 수 판정 기준(고정 seed 생성기 포함) 문서화, 로드맵 Sprint 10 DONE → 커밋

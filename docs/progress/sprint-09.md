# 진행 기록 — Sprint 9 데이터 통신: 계산 생성기 + calc 보강 + graph SVG

중단 대비 기록. 생성기·기능 하나를 끝낼 때마다 갱신한다. Sprint 9 작업은 보고 전까지 커밋하지 않는다.

- 시작: 2026-10-05 (Sprint 8 커밋 `fd871c8` 이후)
- 기준 문서: [`../sprints/sprint-09-dc-calc-generators.md`](../sprints/sprint-09-dc-calc-generators.md), [`../dc-source-analysis.md`](../dc-source-analysis.md), [`../dc-question-types.md`](../dc-question-types.md)
- 근거 PDF: `source/data-communication/DC-2-PhyLayer.pdf` (한 쪽에 슬라이드 2장, PDF 쪽 = ⌈슬라이드 ÷ 2⌉)
- 확인 방법: dev 서버를 끈 상태에서 `build && start`(한 번에 하나), 끝나면 서버·브라우저 프로세스 종료

## 끝낸 생성기

- `calc` 보강: 지수 표기 파서(`3e8`·`3×10^8`·`3*10^8`·`0.75e-6`·쉼표), `relTolerance`, 형식 오류 안내 + `calc.test.ts`(경계값·OS 회귀)
- 순수 계산 함수 10개(`lib/sim/data-comm/*.ts`) + 슬라이드 기준값 `slides.test.ts` 41건(테스트 이름에 s.번호·PDF 쪽)
- 생성기 10개 `generators.ts`: signal / digital / decibel / capacity(⭐) / performance(대역폭-지연 곱 ⭐) / pcm / modulation / multiplexing / link-fill(⭐ trace) / tdm-frame(trace), `data/subjects/data-comm/index.ts`에 연결 + `generators.test.ts`(변형마다 seed 300개, 재계산 대조, 비트 길이 규칙, 슬라이드 근사값 정답 처리). 전 과목 스모크 테스트 통과

- graph 그림 12종(`dcFigure.ts`·`DcFigureSvg.tsx`) + `dcFigure.test.ts` 65건, `/playground` 데이터 통신 미리보기 25문제
- 브라우저 확인(build && start, dev 서버 꺼짐): 375/1280 × 라이트/다크 — 넘침·콘솔 오류 0. 고친 것: link-fill 해설 문장, 버스 그림 라벨 겹침, 감쇠 그래프 라벨·곡선 겹침
- lint 통과 · test 892건 통과 · build 통과

- 마무리: 영문 x/X·가수 없는 10^n 입력 추가(`-10^6` 거부) + OS 회귀 재확인, SNR 무차원 답에 "(단위 없음)" 표시 + 전 변형 단위 렌더 테스트, 플레이그라운드 데이터 통신 섹션 안내를 "이 섹션은 단축키 없음"으로, 로드맵 Sprint 9 DONE

## 진행 중

(없음 — Sprint 9 완료)

## 남은 작업

(없음)

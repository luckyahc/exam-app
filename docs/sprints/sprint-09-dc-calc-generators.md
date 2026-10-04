# Sprint 9 — 데이터 통신: 계산 생성기 + `calc` 입력 보강 + 그래프 SVG

## 목표

[`dc-source-analysis.md`](../dc-source-analysis.md)에서 확인한 Ch02 공식으로 `lib/sim/data-comm/` 생성기를 만들고 슬라이드 기준값을 Vitest로 고정한다. 데이터 통신 계산에 필요한 `calc` 입력 보강(지수 표기·상대 오차)과 `graph`용 SVG를 함께 만든다. 새 문제 유형은 추가하지 않는다. 설계: [`dc-question-types.md`](../dc-question-types.md).

## 선행 조건

- OS 핵심 스프린트(2~8) 완료
- [`dc-source-analysis.md`](../dc-source-analysis.md) "확인 필요" 전 항목 결정 완료(2026-10-04)

## 작업 항목

### `calc` 보강 (문제 유형 엔진, 하위 호환)

- [ ] 숫자 입력 파서: `34,881` / `3e8` / `3×10^8` / `3*10^8` / `0.75e-6` 인식, 해석 불가 입력은 "형식 오류" 안내 + 제출 막음
- [ ] `relTolerance`(상대 오차) 옵션 — 기존 `tolerance`(절대 오차)와 공존
- [ ] 생성기가 만든 단계별 풀이(공식 → 대입 → 결과)를 해설에 표시
- [ ] 테스트: 파서 경계값(음수 지수, 쉼표, 공백, 잘못된 입력), OS `calc` 문제 회귀 없음

### 생성기 (`lib/sim/data-comm/`) — 각각 계산 함수 + 생성기 + 기준값 테스트

- [ ] `signal` — f/T, 위상(도·라디안), 파장, 대역폭, peak/실효
- [ ] `digital` — 비트율, 비트 길이(문제에 답 단위 명시, 해설에 "교재 정의는 거리, 슬라이드 예제는 시간" 한 줄 — 확인 필요 4 답변), r, 보오율
- [ ] `decibel` — 감쇠·증폭 dB, SNR, SNR_dB
- [ ] `capacity` — Nyquist(비트율·L 역산), Shannon, 두 한계 함께
- [ ] `performance` — 처리량, 전파·전송 시간, 지연 합, 대역폭-지연 곱
- [ ] `pcm` — 표본화율, PCM 비트율
- [ ] `modulation` — BASK/BPSK/BFSK 대역폭, AM/FM/PM 대역폭 (β: FM 기본 4, PM은 문제에서 제시)
- [ ] `multiplexing` — FDM 보호 대역 포함 대역폭, 동기식 TDM 링크율·슬롯
- [ ] `linkFill` (trace) — 링크 채우기 표 (s.49~50 기준값)
- [ ] `tdmFrame` (trace) — TDM 프레임 슬롯 (s.90 기준값)
- [ ] `lib/sim/data-comm/generators.ts` → `data/subjects/data-comm/index.ts`의 `generators`에 연결
- [ ] Sprint 4의 전 과목 생성기 스모크 테스트가 데이터 통신 생성기도 통과하는지 확인

### `graph` SVG ([`dc-question-types.md`](../dc-question-types.md) §4의 12종)

- [ ] 데이터 흐름, 토폴로지, 아날로그/디지털 신호, 사인파 3요소, 시간/주파수 영역, 2·4레벨 신호, SNR, BASK/BFSK/BPSK, 성상도, AM/FM/PM, 주파수-감쇠 경향, 임계각
- [ ] 모든 SVG 색은 CSS 변수 토큰 사용, 라이트/다크 대비 확인

## 완료 기준 (DoD)

- 생성기 10개의 슬라이드 기준값 테스트 통과, 같은 seed → 같은 문제
- `calc` 보강 후 OS 테스트 포함 기존 테스트 전부 통과 (회귀 없음)
- SVG 12종이 라이트/다크 모두에서 구분 가능 (색 + 선 모양/라벨 병기)
- `npm run lint && npm test && npm run build` 통과

## 다음 스프린트와의 연결

- Sprint 10(데이터 통신 콘텐츠)이 이 생성기와 SVG로 문제를 작성한다.

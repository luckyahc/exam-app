# Sprint 9 — 데이터 통신: 계산 생성기 + `calc` 입력 보강 + 그래프 SVG

## 목표

[`dc-source-analysis.md`](../dc-source-analysis.md)에서 확인한 Ch02 공식으로 `lib/sim/data-comm/` 생성기를 만들고 슬라이드 기준값을 Vitest로 고정한다. 데이터 통신 계산에 필요한 `calc` 입력 보강(지수 표기·상대 오차)과 `graph`용 SVG를 함께 만든다. 새 문제 유형은 추가하지 않는다. 설계: [`dc-question-types.md`](../dc-question-types.md).

## 선행 조건

- OS 핵심 스프린트(2~8) 완료
- [`dc-source-analysis.md`](../dc-source-analysis.md) "확인 필요" 전 항목 결정 완료(2026-10-04)

## 작업 항목

### `calc` 보강 (문제 유형 엔진, 하위 호환)

- [x] 숫자 입력 파서: `34,881` / `3e8` / `3×10^8` / `3*10^8` / `0.75e-6` 인식, 해석 불가 입력은 "형식 오류" 안내 + 제출 막음
- [x] `relTolerance`(상대 오차) 옵션 — 기존 `tolerance`(절대 오차)와 공존
- [x] 생성기가 만든 단계별 풀이(공식 → 대입 → 결과)를 해설에 표시
- [x] 테스트: 파서 경계값(음수 지수, 쉼표, 공백, 잘못된 입력), OS `calc` 문제 회귀 없음

### 생성기 (`lib/sim/data-comm/`) — 각각 계산 함수 + 생성기 + 기준값 테스트

- [x] `signal` — f/T, 위상(도·라디안), 파장, 대역폭, peak/실효
- [x] `digital` — 비트율, 비트 길이(문제에 답 단위 명시, 해설에 "교재 정의는 거리, 슬라이드 예제는 시간" 한 줄 — 확인 필요 4 답변), r, 보오율
- [x] `decibel` — 감쇠·증폭 dB, SNR, SNR_dB
- [x] `capacity` — Nyquist(비트율·L 역산), Shannon, 두 한계 함께
- [x] `performance` — 처리량, 전파·전송 시간, 지연 합, 대역폭-지연 곱
- [x] `pcm` — 표본화율, PCM 비트율
- [x] `modulation` — BASK/BPSK/BFSK 대역폭, AM/FM/PM 대역폭 (β: FM 기본 4, PM은 문제에서 제시)
- [x] `multiplexing` — FDM 보호 대역 포함 대역폭, 동기식 TDM 링크율·슬롯
- [x] `linkFill` (trace) — 링크 채우기 표 (s.49~50 기준값)
- [x] `tdmFrame` (trace) — TDM 프레임 슬롯 (s.90 기준값)
- [x] `lib/sim/data-comm/generators.ts` → `data/subjects/data-comm/index.ts`의 `generators`에 연결
- [x] Sprint 4의 전 과목 생성기 스모크 테스트가 데이터 통신 생성기도 통과하는지 확인

### `graph` SVG ([`dc-question-types.md`](../dc-question-types.md) §4의 12종)

- [x] 데이터 흐름, 토폴로지, 아날로그/디지털 신호, 사인파 3요소, 시간/주파수 영역, 2·4레벨 신호, SNR, BASK/BFSK/BPSK, 성상도, AM/FM/PM, 주파수-감쇠 경향, 임계각
- [x] 모든 SVG 색은 CSS 변수 토큰 사용, 라이트/다크 대비 확인

## 완료 기준 (DoD)

- 생성기 10개의 슬라이드 기준값 테스트 통과, 같은 seed → 같은 문제
- `calc` 보강 후 OS 테스트 포함 기존 테스트 전부 통과 (회귀 없음)
- SVG 12종이 라이트/다크 모두에서 구분 가능 (색 + 선 모양/라벨 병기)
- `npm run lint && npm test && npm run build` 통과

## 다음 스프린트와의 연결

- Sprint 10(데이터 통신 콘텐츠)이 이 생성기와 SVG로 문제를 작성한다.

## 결과 (2026-10-05, DONE)

- `calc` 보강: `lib/qtypes/calc.ts` 파서(`34,881`·`3e8`·`3×10^8`·`3*10^8`·`0.75e-6`, 형식 오류는 제출 막음), `relTolerance`(절대 오차와 넓은 쪽), 화면 안내 문구·허용 오차 표시. 쉼표 처리는 예전 규칙 그대로라 기존 입력의 해석이 바뀌지 않는다. `calc.test.ts` 41건 — OS calc 문제(정적 + 생성기 seed 60개) 전부에 대해 보강 전 구현과 채점 결과가 같음을 확인
- 계산 함수 `lib/sim/data-comm/` 10개 + 슬라이드 기준값 `slides.test.ts` 41건(테스트 이름에 s.번호·PDF 쪽, ⭐ 주제 예제 전부)
- 생성기 10개 `generators.ts`(+ `format.ts`의 입력 가드) → `data/subjects/data-comm/index.ts`의 `loadGenerators`. `generators.test.ts` 56건(변형마다 seed 300개, 문장에서 입력을 다시 읽어 재계산 대조, 비트 길이 규칙, 슬라이드 근사값 정답 처리). 전 과목 스모크 테스트 통과
- graph 그림 12종: `lib/qtypes/dcFigure.ts`(데이터·검증·근거 슬라이드 `DC_FIGURE_SOURCES`) + `components/qtypes/DcFigureSvg.tsx`, `GraphFigure`에 `kind: "dc"` 추가. `dcFigure.test.ts` 65건(렌더·검증·라이트/다크 대비)
- `/playground`에 데이터 통신 미리보기 25문제(생성기 13 + 그림 12)
- 브라우저: 375/1280 × 라이트/다크, 가로 넘침·콘솔 오류 0. 전체 테스트 892건

## 이 문서와 다르게 한 부분

1. **trace 생성기 이름**: `linkFill`·`tdmFrame` → `link-fill`·`tdm-frame`. 생성기 이름은 문제 id에 들어가 id 규칙(소문자·숫자·하이픈)을 따라야 한다(전 과목 스모크 테스트가 검사).
2. **calc 단위 접두어**: `dc-source-analysis.md` §8은 "단위 접두어 처리"를 말하지만, 더 구체적인 `dc-question-types.md` §2("문제마다 정답 단위를 하나로 고정, 입력칸 옆에 표시")를 따랐다. 입력에서 `kbps`·`μs` 같은 접두어는 해석하지 않는다.
3. **지수 표기 형식**: 처음에는 문서 목록(`3e8`·`3×10^8`·`3*10^8`·`0.75e-6`·쉼표)만 받았다. 마무리 단계에서 사용자 요청으로 영문 x/X(`3x10^8`)와 가수 없는 `10^6`을 추가하고 `dc-question-types.md` §2 목록을 갱신했다. 부호 붙은 `-10^6`은 두 가지로 읽혀 받지 않는다.
4. **graph 데이터 모델**: 기존 `graph`는 곡선(`curve`)만 있어 그림 12종을 위해 `kind: "dc"`(그림 이름 + 매개변수)를 추가했다. 새 문제 유형은 아니다.
5. **FM·PM 그림**: 두 파형은 모양이 거의 같아(슬라이드 s.79·s.80도 마찬가지) 그림만으로 FM과 PM을 가르는 문제는 정답이 하나로 정해지지 않는다. 그림은 둘 다 그릴 수 있지만 미리보기 문제는 AM vs FM만 냈다. Sprint 10에서도 FM vs PM은 그림 문제로 내지 않는다.


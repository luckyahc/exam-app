# 데이터 통신 — 강의자료 예제 목록과 문항 대조

작성: 2026-10-16. 원본: `source/data-communication/DC-1-Introduction.pdf`(22쪽)·`DC-2-PhyLayer.pdf`(51쪽). 쪽 하나에 슬라이드 2장이 있다(쪽 = ⌈슬라이드 ÷ 2⌉).

## 찾은 방법

- pdftotext로 장마다 한 번 추출했다. 그런 다음 "Example"·"Examples"·"Another Example"·"Solution"·"For example"·"What is"·"How many"·"calculate"를 grep으로 찾았다.
- 글자가 적은 쪽(DC-1 p.4·5·6·9·17, DC-2 p.25·33·37·43)은 pdftoppm으로 렌더링해 보았다. 그림 속 수치 예시는 DC-1 s.9(메시 n = 5, 10 links)와 DC-2 s.49~50(Filling the Link)이다.
- 수식이 그림인 예제(s.27 Another Example)도 렌더링해 원본 수식을 옮겼다.
- 제외: 개념 설명 속 "For example" 문장. 예로 DC-1 s.~22의 "see the tasks at each layer", DC-2 s.18의 "a 1 can be encoded as a positive voltage"가 있다. 풀이나 수치가 없는 예시는 넣지 않았다.
- 중복 판정: 기존 데이터 통신 문항(Ch01 58 + Ch02 112 = 170) 중 같은 조건·수치로 이미 출제된 것은 그 문항 id를 적고 새로 만들지 않았다.
- 정답 검증: 계산 문항은 `lib/sim/data-comm` 함수로 계산하고, `data/subjects/data-comm/ch02.test.ts`의 "슬라이드 예제 기준값" 표가 슬라이드 값과 대조한다.
- 출처: 예제 문항(중복 22 + 새 문항 6 = 28)에 `sourceRef: { lecture, page, label }`을 붙였다. 계획의 `source`는 코드 빈칸 필드 이름과 겹쳐 `sourceRef`로 했다.
- 강의 예제 분류: `sourceRef`가 있는 문항은 앱에서 "강의 예제" 분류로 따로 모인다 — 과목 홈 "강의 예제만 풀기", 챕터 시작·문제 목록의 분류 필터, 문항 뱃지(`예제 · Example 2.1 (Ch02 p.5)`). 족보·일반 분류와 겹칠 수 있다(예제 문항도 일반 문항이다).
- ⭐: 기존 Ch02 규칙(⭐는 인쇄 강조 근거가 있는 3개 소주제만, `ch02.test.ts`)과 충돌해 그 규칙을 따랐다. 그래서 Shannon 소주제 문항만 ⭐ printed-emphasis이고, 나머지는 `exam: false`다.

## 목록

| 강의 | 페이지 | 예제 번호·제목 | 유형 | 기존 문항과 중복 | 새 문항 ID | 상태 |
|---|---|---|---|---|---|---|
| Ch01 | s.9 (p.5) | 완전 연결 메시 그림(n = 5, 10 links) | 그림 해석 | `data-comm-ch01-topology-003` | — | 중복 |
| Ch02 | s.10 (p.5) | Example 2.1 배터리 전압(주파수 0, 주기 무한대) | 개념 | — | `data-comm-ch02-sine-005` | 신규 |
| Ch02 | s.11 (p.6) | 위상 1/6 주기 → 60° = π/3 rad(슬라이드 1.046) | 계산 | `data-comm-ch02-phase-001` | — | 중복 |
| Ch02 | s.13 (p.7) | 빨간빛 파장(f = 4×10¹⁴) → 0.75 μm | 계산 | `data-comm-ch02-wavelength-003` | — | 중복 |
| Ch02 | s.17 (p.9) | 1000~5000 Hz 복합 신호 대역폭 → 4000 Hz | 계산 | `data-comm-ch02-bandwidth-003` | — | 중복 |
| Ch02 | s.20 (p.10) | Example 2.3 문서 다운로드 비트율 → 1.536 Mbps | 계산 | `data-comm-ch02-digital-003` | — | 중복 |
| Ch02 | s.21 (p.11) | Example 2.4 비트 길이 → 0.651 μs | 계산 | `data-comm-ch02-digital-004` | — | 중복 |
| Ch02 | s.26 (p.13) | Example 2.5 전력 절반 → −3 dB | 계산 | `data-comm-ch02-impairment-003` | — | 중복 |
| Ch02 | s.27 (p.14) | Another Example 증폭 10배 → 10 dB(Also 100배 → 20 dB) | 계산 | — | `data-comm-ch02-impairment-004`, `data-comm-ch02-impairment-005` | 신규 |
| Ch02 | s.30 (p.15) | SNR: 10 mW / 1 μW → SNR 10,000, 40 dB | 계산 | `data-comm-ch02-snr-001` | — | 중복 |
| Ch02 | s.35 (p.18) | Examples 2.6 265 kbps·20 kHz → L ≈ 98.7, 128레벨 280 kbps | 계산 | `data-comm-ch02-nyquist-005`, `data-comm-ch02-nyquist-006` | — | 중복 |
| Ch02 | s.37 (p.19) | Example 2.7 SNR ≈ 0 → C = 0 | 계산 | `data-comm-ch02-shannon-002` | — | 중복 |
| Ch02 | s.38 (p.19) | Example 2.8 전화선 3000 Hz·SNR 3162 → 34,881 bps | 계산 | `data-comm-ch02-shannon-003` | — | 중복 |
| Ch02 | s.40 (p.20) | Example 2.9 1 MHz·SNR 63 → 상한 6 Mbps, 4 Mbps면 L = 4 | 계산 | `data-comm-ch02-shannon-006`(상한 6 Mbps만) | `data-comm-ch02-shannon-007`(L = 4) | 일부 중복 + 신규 |
| Ch02 | s.43 (p.22) | Examples 2.10 and 2.11 가입자 회선 4 kHz → 56 kbps, 8 kHz → 112 kbps / fast Ethernet 100 Mbps | 계산 + 개념 | — | `data-comm-ch02-perf-005`, `data-comm-ch02-perf-006` | 신규 |
| Ch02 | s.45 (p.23) | Example 처리량(12,000 프레임/분 × 10,000비트) → 2 Mbps | 계산 | `data-comm-ch02-perf-004` | — | 중복 |
| Ch02 | s.47 (p.24) | Example 전파·전송 시간(2.5 kbyte, 1 Gbps, 12,000 km) → 50 ms, 0.020 ms | 계산 | `data-comm-ch02-delay-003`, `data-comm-ch02-delay-004` | — | 중복 |
| Ch02 | s.49~50 (p.25) | Filling the Link Case 1·2(1 bps × 5 s = 5비트, 5 bps × 5 s = 25비트) | 그림 해석·계산 | `data-comm-ch02-bdp-003` | — | 중복 |
| Ch02 | s.51 (p.26) | Example 2.12 파이프(단면 = 대역폭, 길이 = 지연) | 개념 | `data-comm-ch02-bdp-002` | — | 중복 |
| Ch02 | s.52 (p.26) | 지터 예시(20 ms, 45 ms, 40 ms) | 개념 | `data-comm-ch02-bdp-004` | — | 중복 |
| Ch02 | s.61 (p.31) | Example 2.13 사람 목소리 8비트 표본 → 64 kbps | 계산 | `data-comm-ch02-pcm-003` | — | 중복 |
| Ch02 | s.87 (p.44) | Guard Band: Example 5채널 × 100 kHz + 보호 대역 4 × 10 kHz → 540 kHz | 계산 | `data-comm-ch02-fdm-004` | — | 중복 |
| Ch02 | s.101 (p.51) | 적외선 λ = (3×10⁸) / (3×10¹¹) = 10⁻³ m | 계산 | `data-comm-ch02-wireless-004` | — | 중복 |

## 요약

| 강의 | 찾은 예제 | 기존 중복 | 새로 만든 문항 |
|---|---|---|---|
| Ch01 | 1 | 1 | 0 |
| Ch02 | 22 | 19(Example 2.9는 일부 중복) | 6(예제 4개: 2.1, Another Example, 2.9 후반, 2.10·2.11) |

- 계산 예제 검증: 새 calc 4개(10 dB, 20 dB, L = 4, 112 kbps)를 `lib/sim/data-comm`(decibel, nyquistLevels)과 슬라이드 수치로 대조했고, 모두 슬라이드 값과 일치했다(불일치 0).
- 112 kbps는 슬라이드 수치(4 kHz → 56 kbps)에 대역폭 비율 8/4를 곱해 확인했다. 비례 관계는 해설에 "(보충)"으로 적었다.

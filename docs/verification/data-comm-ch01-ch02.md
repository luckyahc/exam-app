# 문항별 PDF 대조 기록 — 데이터 통신 Ch01·Ch02

작성: 2026-10-05. 각 문항의 정답·해설을 `slideRef` 슬라이드의 PDF 원문과 대조한 결과다. 데이터 통신 PDF에는 필기가 없어(잉크 주석 0개, `dc-source-analysis.md` §2-1) 근거는 인쇄 본문과 인쇄된 그림뿐이다. 그림·도표는 pdftoppm으로 렌더링한 이미지로 확인했다.

- **표기**: 슬라이드 번호와 PDF 쪽을 `s.번호 (p.쪽)`으로 적는다(한 쪽에 슬라이드 2장 → PDF 쪽 = ⌈슬라이드 ÷ 2⌉). 문제 데이터의 `slideRef` 필드는 문서 규칙대로 `Ch01 s.N` 형식이다.
- **근거**: `인쇄` = 슬라이드 본문 글자만으로 정답이 정해짐 / `그림: …` = 정답 판정에 슬라이드 그림(도형·라벨·캡션)이 필요함
- **⭐**: Ch01은 인쇄 강조가 0건이라 ⭐ 문항이 없다(열은 `—`).
- **대조 결과**: Ch01은 이번에 처음 작성해 모두 `신규`. `신규·일치` = 대조 후 수정 없음 / `신규·수정` = 대조 후 고침(정답 변경 없음)
- **[1차]** = 작성 직후 PDF 대조(수정 2), **[2차]** = 같은 날 "화면에 없는 그림을 가리키는 문장" 점검(앱 화면에는 graph 보기 그림 말고는 슬라이드 그림이 없음 — 수정 18). 그림이 정답의 근거일 뿐 문장만으로 풀리는 문항은 그대로 두었다.
- Ch02는 아래 절에 이어 적었다(요약 숫자는 각 절에 따로).

## 요약 — Ch01 (Ch02 요약은 아래 Ch02 절)

| 구분 | 문항 수 |
|---|---|
| 전체 | 58 |
| 신규 문항 일치 | 38 |
| 신규 문항 수정 | 20 |
| 그림 근거 | 28 |
| ⭐ | 0 |

유형별: mcq 16 · blank 12 · ox 10 · match 7 · multi 5 · classify 4 · graph 2 · order 2

## 출제 보류·처리 방침

- 메시 토폴로지 링크 수: 슬라이드에 공식이 없어(s.9 (p.5) 그림의 "n = 5, 10 links"만 있음) 공식 문제는 내지 않고 사실만 OX로 냈다(`topology-003`) — `dc-source-analysis.md` 확인 필요 3.
- s.37 (p.19) 그림 위의 파란 글자 `H2`는 사용자가 입력한 텍스트 주석이라 출제 근거로 쓰지 않았다(확인 필요 10). 같은 그림의 `110` 칸(물리 계층에 붙은 헤더처럼 보이는 칸)은 본문에 설명이 없어 출제하지 않았다.
- s.19 (p.10) 이질적 네트워크(WAN·LAN 혼합) 그림은 라우터·모뎀·점대점 WAN이 여러 곳에 섞여 있어 정답이 하나로 정해지는 문장을 만들기 어려워 출제하지 않았다.
- s.42 (p.21)의 "1947년"(ISO 설립)과 "1970년대 후반"(OSI 소개)은 혼동하기 쉬워 따로 냈다(`osi-003`·`osi-004`). 서로를 오답 보기와 해설에서 구분해 준다.
- 네트워크 계층 객체는 s.36 (p.18)에서 "datagram", s.39 (p.20) 그림에서 단위 이름 "Packet"이다. 두 표기가 한 문제의 보기에 함께 나오지 않게 했다(`object-001` 짝짓기는 datagram, `role-004` 객관식은 Packet이고 보기에 datagram 없음).
- coverage-matrix가 graph를 권장한 "연결 유형(s.7)"과 "WAN(s.15~17)"은 Sprint 9 그림 12종에 해당 SVG가 없어 graph 대신 mcq·ox·match·blank로 냈다.

## Ch01 (source/data-communication/DC-1-Introduction.pdf) — 58문항

| # | id | 유형 | slideRef | ⭐ | 근거 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|---|
| 1 | `data-comm-ch01-definition-001` | mcq | s.2 (p.1) | — | 인쇄 | 신규·일치 |  |
| 2 | `data-comm-ch01-definition-002` | multi | s.2 (p.1) | — | 인쇄 | 신규·일치 |  |
| 3 | `data-comm-ch01-definition-003` | blank | s.2 (p.1) | — | 인쇄 | 신규·일치 |  |
| 4 | `data-comm-ch01-component-001` | multi | s.3 (p.2) | — | 인쇄 | 신규·일치 |  |
| 5 | `data-comm-ch01-component-002` | blank | s.3 (p.2) | — | 인쇄 | 신규·일치 |  |
| 6 | `data-comm-ch01-component-003` | mcq | s.3 (p.2) | — | 인쇄 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 7 | `data-comm-ch01-representation-001` | match | s.4 (p.2) | — | 인쇄 | 신규·일치 |  |
| 8 | `data-comm-ch01-representation-002` | mcq | s.4 (p.2) | — | 인쇄 | 신규·일치 |  |
| 9 | `data-comm-ch01-representation-003` | blank | s.4 (p.2) | — | 인쇄 | 신규·일치 |  |
| 10 | `data-comm-ch01-flow-001` | graph | s.5 (p.3) | — | 그림: s.5 그림 a | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 11 | `data-comm-ch01-flow-002` | match | s.5 (p.3) | — | 그림: s.5 그림 a~c 캡션 | 신규·일치 |  |
| 12 | `data-comm-ch01-flow-003` | mcq | s.5 (p.3) | — | 그림: s.5 그림 b | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] — 보기 '시각 1과 시각 2의 데이터 방향이 서로 다르다'도 그림 없이 읽히는 문장으로 |
| 13 | `data-comm-ch01-network-001` | multi | s.6 (p.3) | — | 인쇄 | 신규·일치 |  |
| 14 | `data-comm-ch01-network-002` | mcq | s.6 (p.3) | — | 인쇄 | 신규·일치 |  |
| 15 | `data-comm-ch01-connection-001` | mcq | s.7 (p.4) | — | 그림: s.7 그림 b | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 16 | `data-comm-ch01-connection-002` | ox | s.7 (p.4) | — | 그림: s.7 그림 a | 신규·일치 |  |
| 17 | `data-comm-ch01-topology-001` | graph | s.8~12 (p.4~6) | — | 그림: s.9~12 그림 | 신규·일치 |  |
| 18 | `data-comm-ch01-topology-002` | match | s.9~12 (p.5~6) | — | 그림: s.9~12 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 19 | `data-comm-ch01-topology-003` | ox | s.9 (p.5) | — | 그림: s.9 그림 라벨 'n = 5, 10 links' | 신규·일치 |  |
| 20 | `data-comm-ch01-topology-004` | mcq | s.7~8 (p.4) | — | 그림: s.8 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 21 | `data-comm-ch01-lan-001` | blank | s.13 (p.7) | — | 인쇄 | 신규·수정 | 빈칸 accept에 'IP 주소'·'IP address'·'IP주소' 추가(문장에 예로 든 IP 주소로 답해도 s.13 근거상 맞음) |
| 22 | `data-comm-ch01-lan-002` | ox | s.13 (p.7) | — | 인쇄 | 신규·일치 |  |
| 23 | `data-comm-ch01-lan-003` | mcq | s.14 (p.7) | — | 그림: s.14 그림 a·b | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 24 | `data-comm-ch01-wan-001` | classify | s.15 (p.8) | — | 인쇄 | 신규·일치 |  |
| 25 | `data-comm-ch01-wan-002` | ox | s.15 (p.8) | — | 인쇄 | 신규·수정 | 해설의 원문 인용을 'an interconnection'에서 원문 그대로 'a interconnection'으로 |
| 26 | `data-comm-ch01-wan-003` | match | s.16~17 (p.8~9) | — | 그림: s.16~17 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 27 | `data-comm-ch01-wan-004` | blank | s.17 (p.9) | — | 그림: s.17 그림 범례 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 28 | `data-comm-ch01-internet-001` | ox | s.20 (p.10) | — | 인쇄 | 신규·일치 |  |
| 29 | `data-comm-ch01-internet-002` | blank | s.21 (p.11) | — | 그림: s.21 그림 주석 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 30 | `data-comm-ch01-internet-003` | mcq | s.21 (p.11) | — | 그림: s.21 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 31 | `data-comm-ch01-access-001` | multi | s.22 (p.11) | — | 인쇄 | 신규·일치 |  |
| 32 | `data-comm-ch01-access-002` | classify | s.23 (p.12) | — | 인쇄 | 신규·일치 |  |
| 33 | `data-comm-ch01-access-003` | ox | s.25 (p.13) | — | 인쇄 | 신규·일치 |  |
| 34 | `data-comm-ch01-access-004` | mcq | s.22 (p.11) | — | 인쇄 | 신규·일치 |  |
| 35 | `data-comm-ch01-layering-001` | ox | s.26 (p.13) | — | 인쇄 | 신규·일치 |  |
| 36 | `data-comm-ch01-layering-002` | match | s.28 (p.14) | — | 그림: s.28 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 37 | `data-comm-ch01-layering-003` | mcq | s.27 (p.14) | — | 그림: s.27 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 38 | `data-comm-ch01-principle-001` | ox | s.29 (p.15) | — | 인쇄 | 신규·일치 |  |
| 39 | `data-comm-ch01-principle-002` | blank | s.30~31 (p.15~16) | — | 인쇄 s.30 + s.31 그림 | 신규·일치 |  |
| 40 | `data-comm-ch01-principle-003` | mcq | s.28~29 (p.14~15) | — | 그림: s.28 그림 + s.29 인쇄 | 신규·일치 |  |
| 41 | `data-comm-ch01-tcpip-001` | order | s.33 (p.17) | — | 그림: s.33 그림 | 신규·일치 |  |
| 42 | `data-comm-ch01-tcpip-002` | blank | s.32 (p.16) | — | 인쇄 | 신규·일치 |  |
| 43 | `data-comm-ch01-tcpip-003` | classify | s.34 (p.17) | — | 그림: s.34 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 44 | `data-comm-ch01-tcpip-004` | mcq | s.32 (p.16) | — | 인쇄 | 신규·일치 |  |
| 45 | `data-comm-ch01-object-001` | match | s.36 (p.18) | — | 그림: s.36 그림 | 신규·일치 |  |
| 46 | `data-comm-ch01-object-002` | blank | s.36 (p.18) | — | 그림: s.36 그림 | 신규·일치 |  |
| 47 | `data-comm-ch01-object-003` | multi | s.36 (p.18) | — | 그림: s.36 그림·주석 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 48 | `data-comm-ch01-role-001` | match | s.37~41 (p.19~21) | — | 인쇄 s.37~41 | 신규·일치 |  |
| 49 | `data-comm-ch01-role-002` | blank | s.38 (p.19) | — | 그림: s.38 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 50 | `data-comm-ch01-role-003` | ox | s.39~40 (p.20) | — | 그림: s.39·40 그림 | 신규·일치 |  |
| 51 | `data-comm-ch01-role-004` | mcq | s.39 (p.20) | — | 그림: s.39 그림 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |
| 52 | `data-comm-ch01-osi-001` | order | s.43 (p.22) | — | 그림: s.43 그림 | 신규·일치 |  |
| 53 | `data-comm-ch01-osi-002` | ox | s.42 (p.21) | — | 인쇄 | 신규·일치 |  |
| 54 | `data-comm-ch01-osi-003` | mcq | s.42 (p.21) | — | 인쇄 | 신규·일치 |  |
| 55 | `data-comm-ch01-osi-004` | blank | s.42 (p.21) | — | 인쇄 | 신규·일치 |  |
| 56 | `data-comm-ch01-tcpip-osi-001` | blank | s.43~44 (p.22) | — | 인쇄 s.43 + s.44 그림 | 신규·일치 |  |
| 57 | `data-comm-ch01-tcpip-osi-002` | classify | s.44 (p.22) | — | 그림: s.44 그림 | 신규·일치 |  |
| 58 | `data-comm-ch01-tcpip-osi-003` | mcq | s.44 (p.22) | — | 그림: s.44 그림 설명 | 신규·수정 | 문제 문장이 화면에 없는 슬라이드 그림을 가리켜(“s.N 그림에서” 등) 필요한 정보를 문장에 넣어 그림 없이 풀 수 있게 고침[2차] |

## Ch02 (source/data-communication/DC-2-PhyLayer.pdf) — 112문항

작성: 2026-10-05. 정적 문항은 슬라이드 원문·그림과, 생성기 문항은 공식의 근거 슬라이드와 대조했다. 계산 문항의 정답은 모두 `lib/sim/data-comm` 함수가 계산하고, 슬라이드 예제를 쓴 정적 calc 20문항은 `ch02.test.ts`가 슬라이드 값과 대조한다(슬라이드 기준값 `lib/sim/data-comm/slides.test.ts`와 같은 값).

| 구분(Ch02) | 문항 수 |
|---|---|
| Ch02 전체 | 112 |
| Ch02 신규 문항 일치 | 112 |
| Ch02 신규 문항 수정 | 0 |
| Ch02 그림 근거(정적) | 24 |
| Ch02 생성기 문항 | 22 |
| Ch02 ⭐ (printed-emphasis) | 24 |

### Ch02 출제 보류·처리 방침

- CDMA(s.83): 3장의 접근 방법으로 다룬다고 되어 있어 출제하지 않음(다중화 분류 문항 해설에만 언급).
- 델타 변조 비트열(s.64): 비트 결정 규칙이 글로 없어 비트열 생성 문제를 내지 않음 — 구성요소(s.65~66)와 PCM 비교(s.63)만(확인 필요 8).
- s.43 "4 kHz → 56 kbps, 8 kHz → 112 kbps"와 s.78·79 대역 할당(AM 530~1700 kHz·10 kHz 간격, FM 88~108 MHz·200 kHz 간격): 공식이 아니라 사례라 계산 문제로 내지 않음.
- s.94·s.96 감쇠 곡선 수치: 판독 오차가 커서 경향(graph 1문항)만 출제.
- s.97 세 번째 그림: 캡션은 refraction이지만 화살표는 반사 — s.98 "Optical fibers use reflection"을 근거로 반사로 출제·해설에 기록(`fiber-002`).
- FM·PM 파형은 비슷해 그림만으로 구별하는 문제를 내지 않음(`a2a-002`는 AM vs FM만).
- s.3(과학자의 온라인 서점 주문 그림)은 물리 계층 통신의 예시 장면뿐이라 출제하지 않음.
- 전파/마이크로파 경계(1 GHz 근처)는 슬라이드도 경계가 뚜렷하지 않다고 해 분류 문항에 넣지 않음.

| # | id | 유형 | slideRef | ⭐ | 근거 | 대조 결과 | 수정 내용 |
|---|---|---|---|---|---|---|---|
| 1 | `data-comm-ch02-role-001` | mcq | s.2 (p.1) | — | 인쇄 | 신규·일치 |  |
| 2 | `data-comm-ch02-role-002` | blank | s.2 (p.1) | — | 인쇄 | 신규·일치 |  |
| 3 | `data-comm-ch02-analog-digital-001` | blank | s.4 (p.2) | — | 인쇄 | 신규·일치 |  |
| 4 | `data-comm-ch02-analog-digital-002` | classify | s.4~5 (p.2~3) | — | 인쇄 | 신규·일치 |  |
| 5 | `data-comm-ch02-analog-digital-003` | graph | s.6 (p.3) | — | 그림: s.6 그림 | 신규·일치 |  |
| 6 | `data-comm-ch02-sine-001` | mcq | s.7 (p.4) | — | 인쇄 | 신규·일치 |  |
| 7 | `data-comm-ch02-sine-002` | blank | s.8 (p.4) | — | 인쇄 | 신규·일치 |  |
| 8 | `data-comm-ch02-sine-003` | calc | s.8 (p.4) | — | 인쇄 | 신규·일치 |  |
| 9 | `data-comm-ch02-sine-004` | graph | s.9 (p.5) | — | 그림: s.9 그림 | 신규·일치 |  |
| 10 | `data-comm-ch02-gen-signal-11` | calc | s.8 (p.4) | — | 생성기 signal/frequency#11 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 11 | `data-comm-ch02-phase-001` | calc | s.11 (p.6) | — | 그림: s.11 수식 그림 | 신규·일치 |  |
| 12 | `data-comm-ch02-gen-signal-30` | calc | s.11 (p.6) | — | 생성기 signal/phaseDeg#30 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 13 | `data-comm-ch02-phase-002` | graph | s.12 (p.6) | — | 그림: s.12 그림 | 신규·일치 |  |
| 14 | `data-comm-ch02-wavelength-001` | mcq | s.13 (p.7) | — | 인쇄 | 신규·일치 |  |
| 15 | `data-comm-ch02-wavelength-002` | blank | s.13 (p.7) | — | 인쇄 | 신규·일치 |  |
| 16 | `data-comm-ch02-wavelength-003` | calc | s.13 (p.7) | — | 인쇄 | 신규·일치 |  |
| 17 | `data-comm-ch02-gen-signal-13` | calc | s.13 (p.7) | — | 생성기 signal/wavelength#13 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 18 | `data-comm-ch02-bandwidth-001` | ox | s.14 (p.7) | — | 인쇄 | 신규·일치 |  |
| 19 | `data-comm-ch02-bandwidth-002` | graph | s.15 (p.8) | — | 그림: s.15 그림 | 신규·일치 |  |
| 20 | `data-comm-ch02-bandwidth-003` | calc | s.17 (p.9) | — | 인쇄 | 신규·일치 |  |
| 21 | `data-comm-ch02-bandwidth-004` | mcq | s.16 (p.8) | — | 인쇄 | 신규·일치 |  |
| 22 | `data-comm-ch02-digital-001` | mcq | s.19 (p.10) | — | 인쇄 | 신규·일치 |  |
| 23 | `data-comm-ch02-digital-002` | graph | s.19 (p.10) | — | 그림: s.19 그림 | 신규·일치 |  |
| 24 | `data-comm-ch02-digital-003` | calc | s.20 (p.10) | — | 인쇄 | 신규·일치 |  |
| 25 | `data-comm-ch02-digital-004` | calc | s.21 (p.11) | — | 인쇄 | 신규·일치 |  |
| 26 | `data-comm-ch02-gen-digital-2` | calc | s.21 (p.11) | — | 생성기 digital/bitLength#2 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 27 | `data-comm-ch02-baseband-001` | blank | s.23 (p.12) | — | 인쇄 | 신규·일치 |  |
| 28 | `data-comm-ch02-baseband-002` | mcq | s.22~23 (p.11~12) | — | 인쇄 | 신규·일치 |  |
| 29 | `data-comm-ch02-impairment-001` | multi | s.24 (p.12) | — | 인쇄 | 신규·일치 |  |
| 30 | `data-comm-ch02-impairment-002` | blank | s.25 (p.13) | — | 인쇄 | 신규·일치 |  |
| 31 | `data-comm-ch02-impairment-003` | calc | s.26 (p.13) | — | 그림: s.26 수식 그림 | 신규·일치 |  |
| 32 | `data-comm-ch02-gen-decibel-15` | calc | s.27 (p.14) | — | 생성기 decibel/gain#15 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 33 | `data-comm-ch02-noise-001` | match | s.29 (p.15) | — | 인쇄 | 신규·일치 |  |
| 34 | `data-comm-ch02-noise-002` | mcq | s.28 (p.14) | — | 인쇄 s.28 + 그림 | 신규·일치 |  |
| 35 | `data-comm-ch02-noise-003` | ox | s.28 (p.14) | — | 인쇄 | 신규·일치 |  |
| 36 | `data-comm-ch02-snr-001` | calc | s.30 (p.15) | — | 그림: s.30 수식 그림 | 신규·일치 |  |
| 37 | `data-comm-ch02-snr-002` | ox | s.31 (p.16) | — | 인쇄 | 신규·일치 |  |
| 38 | `data-comm-ch02-snr-003` | graph | s.32 (p.16) | — | 그림: s.32 그림 | 신규·일치 |  |
| 39 | `data-comm-ch02-nyquist-001` | multi | s.33 (p.17) | ⭐ P | 인쇄 | 신규·일치 |  |
| 40 | `data-comm-ch02-nyquist-002` | mcq | s.33~34 (p.17) | ⭐ P | 인쇄 | 신규·일치 |  |
| 41 | `data-comm-ch02-nyquist-003` | blank | s.34 (p.17) | ⭐ P | 인쇄 | 신규·일치 |  |
| 42 | `data-comm-ch02-nyquist-004` | ox | s.34 (p.17) | ⭐ P | 인쇄 | 신규·일치 |  |
| 43 | `data-comm-ch02-nyquist-005` | calc | s.35 (p.18) | ⭐ P | 인쇄 | 신규·일치 |  |
| 44 | `data-comm-ch02-nyquist-006` | calc | s.35 (p.18) | ⭐ P | 인쇄 | 신규·일치 |  |
| 45 | `data-comm-ch02-gen-capacity-21` | calc | s.34~35 (p.17~18) | ⭐ P | 생성기 capacity/nyquistRate#21 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 46 | `data-comm-ch02-gen-capacity-23` | calc | s.34~35 (p.17~18) | ⭐ P | 생성기 capacity/nyquistPow2#23 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 47 | `data-comm-ch02-shannon-001` | blank | s.36 (p.18) | ⭐ P | 인쇄 | 신규·일치 |  |
| 48 | `data-comm-ch02-shannon-002` | calc | s.37 (p.19) | ⭐ P | 그림: s.37 수식 그림 | 신규·일치 |  |
| 49 | `data-comm-ch02-shannon-003` | calc | s.38 (p.19) | ⭐ P | 그림: s.38 수식 | 신규·일치 |  |
| 50 | `data-comm-ch02-shannon-004` | ox | s.37 (p.19) | ⭐ P | 인쇄 | 신규·일치 |  |
| 51 | `data-comm-ch02-shannon-005` | mcq | s.39 (p.20) | ⭐ P | 인쇄 | 신규·일치 |  |
| 52 | `data-comm-ch02-shannon-006` | calc | s.40 (p.20) | ⭐ P | 인쇄 | 신규·일치 |  |
| 53 | `data-comm-ch02-gen-capacity-25` | calc | s.39~40 (p.20) | ⭐ P | 생성기 capacity/bothLevels#25 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 54 | `data-comm-ch02-gen-capacity-24` | trace | s.39~40 (p.20) | ⭐ P | 생성기 capacity/bothTrace#24 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 55 | `data-comm-ch02-perf-001` | multi | s.41 (p.21) | — | 인쇄 | 신규·일치 |  |
| 56 | `data-comm-ch02-perf-002` | blank | s.41 (p.21) | — | 인쇄 | 신규·일치 |  |
| 57 | `data-comm-ch02-perf-003` | ox | s.44 (p.22) | — | 인쇄 | 신규·일치 |  |
| 58 | `data-comm-ch02-perf-004` | calc | s.45 (p.23) | — | 그림: s.45 수식 그림 | 신규·일치 |  |
| 59 | `data-comm-ch02-delay-001` | multi | s.46 (p.23) | — | 인쇄 | 신규·일치 |  |
| 60 | `data-comm-ch02-delay-002` | blank | s.46 (p.23) | — | 인쇄 | 신규·일치 |  |
| 61 | `data-comm-ch02-delay-003` | calc | s.47 (p.24) | — | 그림: s.47 수식 그림 | 신규·일치 |  |
| 62 | `data-comm-ch02-delay-004` | calc | s.47 (p.24) | — | 그림: s.47 수식 그림 | 신규·일치 |  |
| 63 | `data-comm-ch02-bdp-001` | mcq | s.48 (p.24) | ⭐ P | 인쇄 | 신규·일치 |  |
| 64 | `data-comm-ch02-bdp-002` | blank | s.51 (p.26) | ⭐ P | 인쇄 | 신규·일치 |  |
| 65 | `data-comm-ch02-bdp-003` | calc | s.50 (p.25) | ⭐ P | 그림: s.50 그림 | 신규·일치 |  |
| 66 | `data-comm-ch02-bdp-004` | ox | s.52 (p.26) | ⭐ P | 인쇄 | 신규·일치 |  |
| 67 | `data-comm-ch02-gen-link-fill-21` | trace | s.49~50 (p.25) | ⭐ P | 생성기 link-fill/table#21 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 68 | `data-comm-ch02-gen-link-fill-24` | trace | s.49~50 (p.25) | ⭐ P | 생성기 link-fill/table#24 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 69 | `data-comm-ch02-gen-performance-25` | calc | s.48~51 (p.24~26) | ⭐ P | 생성기 performance/bdp#25 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 70 | `data-comm-ch02-gen-performance-2` | calc | s.48~51 (p.24~26) | ⭐ P | 생성기 performance/bdpSmall#2 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 71 | `data-comm-ch02-d2d-001` | mcq | s.54 (p.27) | — | 인쇄 | 신규·일치 |  |
| 72 | `data-comm-ch02-d2d-002` | blank | s.56 (p.28) | — | 인쇄 | 신규·일치 |  |
| 73 | `data-comm-ch02-d2d-003` | order | s.56~57 (p.28~29) | — | 인쇄 s.56 + s.57 그림 | 신규·일치 |  |
| 74 | `data-comm-ch02-pcm-001` | order | s.59~60 (p.30) | — | 인쇄 s.59 + s.60 그림 | 신규·일치 |  |
| 75 | `data-comm-ch02-pcm-002` | blank | s.60 (p.30) | — | 그림: s.60 그림 | 신규·일치 |  |
| 76 | `data-comm-ch02-pcm-003` | calc | s.61 (p.31) | — | 인쇄 | 신규·일치 |  |
| 77 | `data-comm-ch02-pcm-004` | mcq | s.58~59 (p.29~30) | — | 인쇄 | 신규·일치 |  |
| 78 | `data-comm-ch02-dm-001` | mcq | s.63 (p.32) | — | 인쇄 | 신규·일치 |  |
| 79 | `data-comm-ch02-dm-002` | match | s.65~66 (p.33) | — | 그림: s.65~66 그림 | 신규·일치 |  |
| 80 | `data-comm-ch02-d2a-001` | mcq | s.68 (p.34) | — | 인쇄 | 신규·일치 |  |
| 81 | `data-comm-ch02-d2a-002` | classify | s.68 (p.34) | — | 인쇄 | 신규·일치 |  |
| 82 | `data-comm-ch02-gen-digital-22` | calc | s.68 (p.34) | — | 생성기 digital/baud#22 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 83 | `data-comm-ch02-keying-001` | graph | s.69~73 (p.35~37) | — | 그림: s.69·71·73 파형 | 신규·일치 |  |
| 84 | `data-comm-ch02-keying-002` | graph | s.75~76 (p.38) | — | 그림: s.75~76 성상도 | 신규·일치 |  |
| 85 | `data-comm-ch02-keying-003` | blank | s.72 (p.36) | — | 그림: s.72 그림 | 신규·일치 |  |
| 86 | `data-comm-ch02-gen-modulation-21` | calc | s.71 (p.36) | — | 생성기 modulation/fsk#21 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 87 | `data-comm-ch02-gen-modulation-22` | calc | s.69 (p.35) | — | 생성기 modulation/ask#22 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 88 | `data-comm-ch02-a2a-001` | mcq | s.77 (p.39) | — | 인쇄 | 신규·일치 |  |
| 89 | `data-comm-ch02-a2a-002` | graph | s.78~79 (p.39~40) | — | 그림: s.78~79 파형 | 신규·일치 |  |
| 90 | `data-comm-ch02-gen-modulation-23` | calc | s.78 (p.39) | — | 생성기 modulation/am#23 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 91 | `data-comm-ch02-gen-modulation-25` | calc | s.79 (p.40) | — | 생성기 modulation/fm#25 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 92 | `data-comm-ch02-gen-modulation-20` | calc | s.80 (p.40) | — | 생성기 modulation/pm#20 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 93 | `data-comm-ch02-fdm-001` | mcq | s.81~82 (p.41) | — | 인쇄 | 신규·일치 |  |
| 94 | `data-comm-ch02-fdm-002` | classify | s.83 (p.42) | — | 그림: s.83 그림 | 신규·일치 |  |
| 95 | `data-comm-ch02-fdm-003` | blank | s.87 (p.44) | — | 인쇄 | 신규·일치 |  |
| 96 | `data-comm-ch02-fdm-004` | calc | s.87 (p.44) | — | 인쇄 | 신규·일치 |  |
| 97 | `data-comm-ch02-gen-multiplexing-1` | calc | s.87 (p.44) | — | 생성기 multiplexing/fdm#1 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 98 | `data-comm-ch02-tdm-001` | blank | s.88 (p.44) | — | 인쇄 | 신규·일치 |  |
| 99 | `data-comm-ch02-gen-tdm-frame-25` | trace | s.89~90 (p.45) | — | 생성기 tdm-frame/table#25 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 100 | `data-comm-ch02-gen-multiplexing-22` | calc | s.90 (p.45) | — | 생성기 multiplexing/tdmSlot#22 — 공식 근거 슬라이드, 정답은 lib/sim/data-comm 계산 | 신규·일치 |  |
| 101 | `data-comm-ch02-media-001` | classify | s.91~92 (p.46) | — | 인쇄 | 신규·일치 |  |
| 102 | `data-comm-ch02-media-002` | ox | s.93 (p.47) | — | 인쇄 | 신규·일치 |  |
| 103 | `data-comm-ch02-media-003` | graph | s.94 (p.47) | — | 그림: s.94 그래프 | 신규·일치 |  |
| 104 | `data-comm-ch02-media-004` | blank | s.94 (p.47) | — | 인쇄 | 신규·일치 |  |
| 105 | `data-comm-ch02-fiber-001` | ox | s.96 (p.48) | — | 인쇄 | 신규·일치 |  |
| 106 | `data-comm-ch02-fiber-002` | graph | s.97 (p.49) | — | 그림: s.97 그림 | 신규·일치 |  |
| 107 | `data-comm-ch02-fiber-003` | blank | s.98 (p.49) | — | 인쇄 | 신규·일치 |  |
| 108 | `data-comm-ch02-fiber-004` | mcq | s.97~98 (p.49) | — | 인쇄 | 신규·일치 |  |
| 109 | `data-comm-ch02-wireless-001` | classify | s.99~101 (p.50~51) | — | 인쇄 | 신규·일치 |  |
| 110 | `data-comm-ch02-wireless-002` | match | s.99~101 (p.50~51) | — | 인쇄 | 신규·일치 |  |
| 111 | `data-comm-ch02-wireless-003` | ox | s.101 (p.51) | — | 인쇄 | 신규·일치 |  |
| 112 | `data-comm-ch02-wireless-004` | calc | s.101 (p.51) | — | 인쇄 | 신규·일치 |  |

# 대조 기록 — 데이터과학 Lec1. 인공지능과 빅데이터 · 파이썬 · Colab

검증 파이프라인(`lib/verify/`, Sprint 14)으로 문항 데이터를 실행해 검사한 결과를 문항마다 남긴다. 표·요약 숫자는 `lib/verify/records.test.ts`가 문항 데이터(`data/subjects/data-science/lec1.ts`)와 같은지 확인한다.

- **검증 방식**: 실행(Node에서 Pyodide·sql.js로 실행해 검사) / 실행 제외(셀레니움·Colab 명령·MySQL 서버 전용처럼 실행할 수 없는 코드) / 개념(코드 없음)
- **결과**: 실행 → `통과`, 실행 제외 → `제외(이유)`, 개념 → `—`
- **수정 내용**: 검증으로 고친 것(허용 답안 추가, 슬라이드 오류 "(보충)" 등). 없으면 `—`
- 코드 빈칸의 첫 번째 정답은 슬라이드 표기다. 슬라이드 실행결과와 실제 실행이 다른 코드는 `lib/verify/errata.ts` 목록을 따른다

요약: 문항 26 · 실행 3 · 실행 제외 0 · 개념 23 · 수정 2

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec1-bigdata-001` | Lec1 s.3 | 개념 | — | — |
| `data-science-lec1-bigdata-002` | Lec1 s.3 | 개념 | — | — |
| `data-science-lec1-bigdata-003` | Lec1 s.3 | 개념 | — | — |
| `data-science-lec1-history-001` | Lec1 s.4-6 | 개념 | — | PDF 대조: 베이즈 접근법 항목을 s.5 흐름대로(1980년대 재확산과 함께) 수정 |
| `data-science-lec1-history-002` | Lec1 s.4-6 | 개념 | — | PDF 대조: 베이즈 짝의 '1980년대 등장' 단정 표현을 s.5 문장대로 수정 |
| `data-science-lec1-history-003` | Lec1 s.4 | 개념 | — | — |
| `data-science-lec1-history-004` | Lec1 s.5 | 개념 | — | — |
| `data-science-lec1-relation-001` | Lec1 s.7 | 개념 | — | — |
| `data-science-lec1-relation-002` | Lec1 s.8 | 개념 | — | — |
| `data-science-lec1-relation-003` | Lec1 s.8 | 개념 | — | — |
| `data-science-lec1-language-001` | Lec1 s.10 | 개념 | — | — |
| `data-science-lec1-language-002` | Lec1 s.10 | 개념 | — | — |
| `data-science-lec1-language-003` | Lec1 s.10 | 개념 | — | — |
| `data-science-lec1-feature-001` | Lec1 s.11 | 개념 | — | — |
| `data-science-lec1-feature-002` | Lec1 s.11 | 개념 | — | — |
| `data-science-lec1-feature-003` | Lec1 s.11 | 개념 | — | — |
| `data-science-lec1-install-001` | Lec1 s.12-15 | 개념 | — | — |
| `data-science-lec1-install-002` | Lec1 s.13 | 개념 | — | — |
| `data-science-lec1-install-003` | Lec1 s.17 | 실행 | 통과 | — |
| `data-science-lec1-colab-001` | Lec1 s.20 | 실행 | 통과 | — |
| `data-science-lec1-colab-002` | Lec1 s.19 | 개념 | — | — |
| `data-science-lec1-colab-003` | Lec1 s.22-23 | 개념 | — | — |
| `data-science-lec1-colab-004` | Lec1 s.22 | 개념 | — | — |
| `data-science-lec1-colab-005` | Lec1 s.24 | 개념 | — | — |
| `data-science-lec1-colab-006` | Lec1 s.24-25 | 개념 | — | — |
| `data-science-lec1-colab-007` | Lec1 s.20 | 실행 | 통과 | — |

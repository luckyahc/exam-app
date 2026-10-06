# 대조 기록 — 데이터과학 Lec4. 셀레니움 · 웹 크롤링

검증 파이프라인(`lib/verify/`, Sprint 14)으로 문항 데이터를 실행해 검사한 결과를 문항마다 남긴다. 표·요약 숫자는 `lib/verify/records.test.ts`가 문항 데이터(`data/subjects/data-science/lec4.ts`)와 같은지 확인한다.

- **검증 방식**: 실행(Node에서 Pyodide·sql.js로 실행해 검사) / 실행 제외(셀레니움·Colab 명령·MySQL 서버 전용처럼 실행할 수 없는 코드) / 개념(코드 없음)
- **결과**: 실행 → `통과`, 실행 제외 → `제외(이유)`, 개념 → `—`
- **수정 내용**: 검증으로 고친 것(허용 답안 추가, 슬라이드 오류 "(보충)" 등). 없으면 `—`
- 코드 빈칸의 첫 번째 정답은 슬라이드 표기다. 슬라이드 실행결과와 실제 실행이 다른 코드는 `lib/verify/errata.ts` 목록을 따른다

요약: 문항 36 · 실행 0 · 실행 제외 13 · 개념 23 · 수정 1

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec4-auto-001` | Lec4 s.3 | 개념 | — | — |
| `data-science-lec4-auto-002` | Lec4 s.3 | 개념 | — | — |
| `data-science-lec4-page-001` | Lec4 s.4-5 | 개념 | — | — |
| `data-science-lec4-page-002` | Lec4 s.5 | 개념 | — | — |
| `data-science-lec4-page-003` | Lec4 s.4-5 | 개념 | — | — |
| `data-science-lec4-cmd-001` | Lec4 s.6-9 | 개념 | — | — |
| `data-science-lec4-cmd-002` | Lec4 s.6-8 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-cmd-003` | Lec4 s.9 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-cmd-004` | Lec4 s.7 | 개념 | — | — |
| `data-science-lec4-crawl-001` | Lec4 s.11 | 개념 | — | — |
| `data-science-lec4-crawl-002` | Lec4 s.11 | 개념 | — | — |
| `data-science-lec4-lib-001` | Lec4 s.14 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-lib-002` | Lec4 s.14 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-lib-003` | Lec4 s.14 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-get-001` | Lec4 s.16 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-get-002` | Lec4 s.6 | 개념 | — | — |
| `data-science-lec4-xpath-001` | Lec4 s.17-21 | 개념 | — | — |
| `data-science-lec4-xpath-002` | Lec4 s.17 | 개념 | — | — |
| `data-science-lec4-xpath-003` | Lec4 s.20-21 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-xpath-004` | Lec4 s.17-21 | 개념 | — | — |
| `data-science-lec4-many-001` | Lec4 s.22-23 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-many-002` | Lec4 s.22 | 개념 | — | — |
| `data-science-lec4-many-003` | Lec4 s.21-23 | 개념 | — | — |
| `data-science-lec4-many-004` | Lec4 s.23 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | 검증 규칙: 실행 제외 코드인데 지문이 '출력'을 물어 규칙 위반 → 변수에 담기는 것을 묻는 개념 질문으로 수정 |
| `data-science-lec4-button-001` | Lec4 s.26 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-button-002` | Lec4 s.24 | 개념 | — | — |
| `data-science-lec4-button-003` | Lec4 s.25-26 | 개념 | — | — |
| `data-science-lec4-input-001` | Lec4 s.28 | 개념 | — | — |
| `data-science-lec4-input-002` | Lec4 s.29 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-input-003` | Lec4 s.28 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-input-004` | Lec4 s.28 | 개념 | — | — |
| `data-science-lec4-input-005` | Lec4 s.29 | 개념 | — | — |
| `data-science-lec4-func-001` | Lec4 s.31 | 개념 | — | — |
| `data-science-lec4-func-002` | Lec4 s.30 | 실행 제외 | 제외(셀레니움 — 실제 웹 브라우저와 웹사이트 접속이 필요해 실행 검증할 수 없음) | — |
| `data-science-lec4-func-003` | Lec4 s.31 | 개념 | — | — |
| `data-science-lec4-func-004` | Lec4 s.30 | 개념 | — | — |

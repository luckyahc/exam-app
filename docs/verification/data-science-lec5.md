# 대조 기록 — 데이터과학 Lec5. 데이터베이스 · MySQL

검증 파이프라인(`lib/verify/`, Sprint 14)으로 문항 데이터를 실행해 검사한 결과를 문항마다 남긴다. 표·요약 숫자는 `lib/verify/records.test.ts`가 문항 데이터(`data/subjects/data-science/lec5.ts`)와 같은지 확인한다.

- **검증 방식**: 실행(Node에서 Pyodide·sql.js로 실행해 검사) / 실행 제외(셀레니움·Colab 명령·MySQL 서버 전용처럼 실행할 수 없는 코드) / 개념(코드 없음)
- **결과**: 실행 → `통과`, 실행 제외 → `제외(이유)`, 개념 → `—`
- **수정 내용**: 검증으로 고친 것(허용 답안 추가, 슬라이드 오류 "(보충)" 등). 없으면 `—`
- 코드 빈칸의 첫 번째 정답은 슬라이드 표기다. 슬라이드 실행결과와 실제 실행이 다른 코드는 `lib/verify/errata.ts` 목록을 따른다

요약: 문항 68 · 실행 34 · 실행 제외 2 · 개념 32 · 수정 2

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec5-datainfo-001` | Lec5 s.3 | 개념 | — | — |
| `data-science-lec5-datainfo-002` | Lec5 s.3 | 개념 | — | — |
| `data-science-lec5-db-001` | Lec5 s.4 | 개념 | — | — |
| `data-science-lec5-db-002` | Lec5 s.4 | 개념 | — | — |
| `data-science-lec5-table-001` | Lec5 s.5 | 개념 | — | — |
| `data-science-lec5-table-002` | Lec5 s.5 | 개념 | — | — |
| `data-science-lec5-table-003` | Lec5 s.5 | 개념 | — | — |
| `data-science-lec5-sql-001` | Lec5 s.6 | 개념 | — | — |
| `data-science-lec5-sql-002` | Lec5 s.6 | 개념 | — | — |
| `data-science-lec5-install-001` | Lec5 s.21 | 개념 | — | — |
| `data-science-lec5-install-002` | Lec5 s.8 | 개념 | — | — |
| `data-science-lec5-rule-001` | Lec5 s.40 | 개념 | — | — |
| `data-science-lec5-rule-002` | Lec5 s.40 | 개념 | — | — |
| `data-science-lec5-rule-003` | Lec5 s.40 | 개념 | — | — |
| `data-science-lec5-createdb-001` | Lec5 s.41 | 실행 제외 | 제외(MySQL 서버 전용 문법(CREATE DATABASE·USE) — sql.js(SQLite)에서 실행되지 않음) | — |
| `data-science-lec5-createdb-002` | Lec5 s.41 | 개념 | — | — |
| `data-science-lec5-schema-001` | Lec5 s.42 | 개념 | — | — |
| `data-science-lec5-schema-002` | Lec5 s.42 | 개념 | — | — |
| `data-science-lec5-schema-003` | Lec5 s.45 | 개념 | — | — |
| `data-science-lec5-schema-004` | Lec5 s.42-45 | 개념 | — | — |
| `data-science-lec5-createtable-001` | Lec5 s.43 | 실행 | 통과 | — |
| `data-science-lec5-createtable-002` | Lec5 s.45 | 실행 | 통과 | — |
| `data-science-lec5-createtable-003` | Lec5 s.44 | 실행 | 통과 | — |
| `data-science-lec5-createtable-004` | Lec5 s.43 | 개념 | — | — |
| `data-science-lec5-insert-001` | Lec5 s.46 | 실행 | 통과 | — |
| `data-science-lec5-insert-002` | Lec5 s.46 | 실행 제외 | 제외(MySQL 서버 전용 문법(VALUES 안의 DEFAULT) — sql.js(SQLite)에서 실행되지 않음) | — |
| `data-science-lec5-insert-003` | Lec5 s.46-47 | 실행 | 통과 | — |
| `data-science-lec5-insert-004` | Lec5 s.47 | 개념 | — | — |
| `data-science-lec5-select-001` | Lec5 s.48-49 | 실행 | 통과 | — |
| `data-science-lec5-select-002` | Lec5 s.51 | 실행 | 통과 | — |
| `data-science-lec5-select-003` | Lec5 s.50-51 | 실행 | 통과 | — |
| `data-science-lec5-select-004` | Lec5 s.50 | 실행 | 통과 | — |
| `data-science-lec5-select-005` | Lec5 s.48-51 | 개념 | — | — |
| `data-science-lec5-where-001` | Lec5 s.52 | 실행 | 통과 | — |
| `data-science-lec5-where-002` | Lec5 s.52 | 실행 | 통과 | — |
| `data-science-lec5-where-003` | Lec5 s.52 | 개념 | — | — |
| `data-science-lec5-like-001` | Lec5 s.53 | 실행 | 통과 | — |
| `data-science-lec5-like-002` | Lec5 s.53 | 실행 | 통과 | — |
| `data-science-lec5-like-003` | Lec5 s.53 | 개념 | — | — |
| `data-science-lec5-between-001` | Lec5 s.54 | 실행 | 통과 | — |
| `data-science-lec5-between-002` | Lec5 s.54 | 실행 | 통과 | — |
| `data-science-lec5-group-001` | Lec5 s.55 | 실행 | 통과 | — |
| `data-science-lec5-group-002` | Lec5 s.55 | 실행 | 통과 | — |
| `data-science-lec5-group-003` | Lec5 s.55 | 실행 | 통과 | — |
| `data-science-lec5-group-004` | Lec5 s.55 | 개념 | — | — |
| `data-science-lec5-join-001` | Lec5 s.56 | 실행 | 통과 | 검증: wrong 'WHERE'(INNER JOIN 뒤 WHERE)가 같은 결과 → wrong에서 빼고 'AND'로 |
| `data-science-lec5-join-002` | Lec5 s.57 | 실행 | 통과 | 검증: wrong 'ON'(쉼표 조인 + ON)이 sql.js에서 같은 결과(MySQL은 오류 — 엔진 차이) → wrong에서 빼고 'AND'로 |
| `data-science-lec5-join-003` | Lec5 s.58 | 실행 | 통과 | — |
| `data-science-lec5-join-004` | Lec5 s.56-57 | 개념 | — | — |
| `data-science-lec5-outer-001` | Lec5 s.59-60 | 실행 | 통과 | — |
| `data-science-lec5-outer-002` | Lec5 s.61 | 실행 | 통과 | — |
| `data-science-lec5-outer-003` | Lec5 s.59-60 | 개념 | — | — |
| `data-science-lec5-outer-004` | Lec5 s.59-60 | 실행 | 통과 | — |
| `data-science-lec5-sub-001` | Lec5 s.63 | 실행 | 통과 | — |
| `data-science-lec5-sub-002` | Lec5 s.64 | 실행 | 통과 | — |
| `data-science-lec5-sub-003` | Lec5 s.62 | 실행 | 통과 | — |
| `data-science-lec5-sub-004` | Lec5 s.64 | 개념 | — | — |
| `data-science-lec5-isnull-001` | Lec5 s.65 | 실행 | 통과 | — |
| `data-science-lec5-isnull-002` | Lec5 s.65 | 실행 | 통과 | — |
| `data-science-lec5-union-001` | Lec5 s.66 | 실행 | 통과 | — |
| `data-science-lec5-union-002` | Lec5 s.66 | 개념 | — | — |
| `data-science-lec5-update-001` | Lec5 s.67 | 실행 | 통과 | — |
| `data-science-lec5-update-002` | Lec5 s.67 | 실행 | 통과 | — |
| `data-science-lec5-update-003` | Lec5 s.67 | 개념 | — | — |
| `data-science-lec5-del-001` | Lec5 s.68 | 실행 | 통과 | — |
| `data-science-lec5-del-002` | Lec5 s.69 | 실행 | 통과 | — |
| `data-science-lec5-del-003` | Lec5 s.69 | 개념 | — | — |
| `data-science-lec5-del-004` | Lec5 s.68-69 | 개념 | — | — |

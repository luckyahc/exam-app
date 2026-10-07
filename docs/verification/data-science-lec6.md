# 대조 기록 — 데이터과학 Lec6. 넘파이 · 판다스

검증 파이프라인(`lib/verify/`, Sprint 14)으로 문항 데이터를 실행해 검사한 결과를 문항마다 남긴다. 표·요약 숫자는 `lib/verify/records.test.ts`가 문항 데이터(`data/subjects/data-science/lec6.ts`)와 같은지 확인한다.

- **검증 방식**: 실행(Node에서 Pyodide·sql.js로 실행해 검사) / 실행 제외(셀레니움·Colab 명령·MySQL 서버 전용처럼 실행할 수 없는 코드) / 개념(코드 없음)
- **결과**: 실행 → `통과`, 실행 제외 → `제외(이유)`, 개념 → `—`
- **수정 내용**: 검증으로 고친 것(허용 답안 추가, 슬라이드 오류 "(보충)" 등). 없으면 `—`
- 코드 빈칸의 첫 번째 정답은 슬라이드 표기다. 슬라이드 실행결과와 실제 실행이 다른 코드는 `lib/verify/errata.ts` 목록을 따른다

요약: 문항 82 · 실행 47 · 실행 제외 0 · 개념 35 · 수정 0

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec6-numpy-001` | Lec6 s.3 | 개념 | — | — |
| `data-science-lec6-numpy-002` | Lec6 s.3 | 개념 | — | — |
| `data-science-lec6-dim-001` | Lec6 s.4 | 개념 | — | — |
| `data-science-lec6-dim-002` | Lec6 s.5 | 개념 | — | — |
| `data-science-lec6-dim-003` | Lec6 s.5 | 개념 | — | — |
| `data-science-lec6-axis-001` | Lec6 s.6 | 개념 | — | — |
| `data-science-lec6-axis-002` | Lec6 s.6·s.14 | 실행 | 통과 | — |
| `data-science-lec6-axis-003` | Lec6 s.6 | 개념 | — | — |
| `data-science-lec6-slice-001` | Lec6 s.7-8 | 실행 | 통과 | — |
| `data-science-lec6-slice-002` | Lec6 s.7-8 | 개념 | — | — |
| `data-science-lec6-slice-003` | Lec6 s.8 | 실행 | 통과 | — |
| `data-science-lec6-slice-004` | Lec6 s.8 | 실행 | 통과 | — |
| `data-science-lec6-pandas-001` | Lec6 s.9 | 개념 | — | — |
| `data-science-lec6-pandas-002` | Lec6 s.10 | 개념 | — | — |
| `data-science-lec6-pandas-003` | Lec6 s.9 | 개념 | — | — |
| `data-science-lec6-feature-001` | Lec6 s.11-12 | 개념 | — | — |
| `data-science-lec6-feature-002` | Lec6 s.11-12 | 개념 | — | — |
| `data-science-lec6-array-001` | Lec6 s.14 | 실행 | 통과 | — |
| `data-science-lec6-array-002` | Lec6 s.14 | 실행 | 통과 | — |
| `data-science-lec6-array-003` | Lec6 s.14 | 실행 | 통과 | — |
| `data-science-lec6-create-001` | Lec6 s.15 | 개념 | — | — |
| `data-science-lec6-create-002` | Lec6 s.16 | 실행 | 통과 | — |
| `data-science-lec6-create-003` | Lec6 s.16 | 실행 | 통과 | — |
| `data-science-lec6-dtype-001` | Lec6 s.17 | 실행 | 통과 | — |
| `data-science-lec6-dtype-002` | Lec6 s.17 | 개념 | — | — |
| `data-science-lec6-attr-001` | Lec6 s.19 | 개념 | — | — |
| `data-science-lec6-attr-002` | Lec6 s.19-20 | 실행 | 통과 | — |
| `data-science-lec6-attr-003` | Lec6 s.19-20 | 실행 | 통과 | — |
| `data-science-lec6-attr-004` | Lec6 s.19-20 | 개념 | — | — |
| `data-science-lec6-shape-001` | Lec6 s.21-22 | 실행 | 통과 | — |
| `data-science-lec6-shape-002` | Lec6 s.23 | 실행 | 통과 | — |
| `data-science-lec6-shape-003` | Lec6 s.22 | 실행 | 통과 | — |
| `data-science-lec6-shape-004` | Lec6 s.21 | 개념 | — | — |
| `data-science-lec6-mask-001` | Lec6 s.24 | 실행 | 통과 | — |
| `data-science-lec6-mask-002` | Lec6 s.25 | 실행 | 통과 | — |
| `data-science-lec6-mask-003` | Lec6 s.24 | 개념 | — | — |
| `data-science-lec6-ufunc-001` | Lec6 s.26 | 개념 | — | — |
| `data-science-lec6-ufunc-002` | Lec6 s.27 | 개념 | — | — |
| `data-science-lec6-ufunc-003` | Lec6 s.26-27 | 실행 | 통과 | — |
| `data-science-lec6-copy-001` | Lec6 s.28-29 | 실행 | 통과 | — |
| `data-science-lec6-copy-002` | Lec6 s.30-31 | 실행 | 통과 | — |
| `data-science-lec6-copy-003` | Lec6 s.29 | 개념 | — | — |
| `data-science-lec6-copy-004` | Lec6 s.28-31 | 개념 | — | — |
| `data-science-lec6-sort-001` | Lec6 s.32 | 실행 | 통과 | — |
| `data-science-lec6-sort-002` | Lec6 s.32 | 실행 | 통과 | — |
| `data-science-lec6-sort-003` | Lec6 s.32 | 개념 | — | — |
| `data-science-lec6-series-001` | Lec6 s.34 | 실행 | 통과 | — |
| `data-science-lec6-series-002` | Lec6 s.34 | 실행 | 통과 | — |
| `data-science-lec6-series-003` | Lec6 s.34 | 실행 | 통과 | — |
| `data-science-lec6-frame-001` | Lec6 s.35 | 실행 | 통과 | — |
| `data-science-lec6-frame-002` | Lec6 s.35-37 | 개념 | — | — |
| `data-science-lec6-frame-003` | Lec6 s.35 | 실행 | 통과 | — |
| `data-science-lec6-csv-001` | Lec6 s.39 | 실행 | 통과 | — |
| `data-science-lec6-csv-002` | Lec6 s.39 | 개념 | — | — |
| `data-science-lec6-csv-003` | Lec6 s.38-39 | 개념 | — | — |
| `data-science-lec6-view-001` | Lec6 s.42-43 | 실행 | 통과 | — |
| `data-science-lec6-view-002` | Lec6 s.41 | 개념 | — | — |
| `data-science-lec6-view-003` | Lec6 s.40 | 실행 | 통과 | — |
| `data-science-lec6-order-001` | Lec6 s.45 | 실행 | 통과 | — |
| `data-science-lec6-order-002` | Lec6 s.45 | 실행 | 통과 | — |
| `data-science-lec6-order-003` | Lec6 s.44 | 개념 | — | — |
| `data-science-lec6-query-001` | Lec6 s.47 | 실행 | 통과 | — |
| `data-science-lec6-query-002` | Lec6 s.51-52 | 실행 | 통과 | — |
| `data-science-lec6-query-003` | Lec6 s.50·s.53 | 실행 | 통과 | — |
| `data-science-lec6-query-004` | Lec6 s.49 | 실행 | 통과 | — |
| `data-science-lec6-query-005` | Lec6 s.48 | 실행 | 통과 | — |
| `data-science-lec6-query-006` | Lec6 s.46-53 | 개념 | — | — |
| `data-science-lec6-query-007` | Lec6 s.46 | 실행 | 통과 | — |
| `data-science-lec6-stat-001` | Lec6 s.54 | 실행 | 통과 | — |
| `data-science-lec6-stat-002` | Lec6 s.41·s.54 | 개념 | — | — |
| `data-science-lec6-stat-003` | Lec6 s.54 | 실행 | 통과 | — |
| `data-science-lec6-loc-001` | Lec6 s.55 | 실행 | 통과 | — |
| `data-science-lec6-loc-002` | Lec6 s.55 | 개념 | — | — |
| `data-science-lec6-struct-001` | Lec6 s.56·s.58 | 실행 | 통과 | — |
| `data-science-lec6-struct-002` | Lec6 s.57 | 실행 | 통과 | — |
| `data-science-lec6-struct-003` | Lec6 s.56 | 개념 | — | — |
| `data-science-lec6-struct-004` | Lec6 s.56-59 | 개념 | — | — |
| `data-science-lec6-struct-005` | Lec6 s.57 | 실행 | 통과 | — |
| `data-science-lec6-group-001` | Lec6 s.60-61 | 실행 | 통과 | — |
| `data-science-lec6-group-002` | Lec6 s.60-61 | 실행 | 통과 | — |
| `data-science-lec6-group-003` | Lec6 s.55·s.60 | 실행 | 통과 | — |
| `data-science-lec6-group-004` | Lec6 s.60-61 | 개념 | — | — |

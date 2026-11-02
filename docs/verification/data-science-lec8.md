# 대조 기록 — 데이터과학 Lec8. 데이터 전처리 (s.1~72, 기말)

범위: `source/data-science/Lec8.pdf` 전체([코드 8-1]~[코드 8-46], 실습 문제 s.42~43은 지하수 파일 내려받기 과제라 제외)(2026-11-03, 형식: docs/final/data-science-format.md).

- **실행**: [코드 8-1]의 df는 슬라이드 그대로, 지하수 데이터는 지문에 밝힌 작은 예시로 바꿔 실행한다. 2026-11-03 작성 PC는 메모리 부족으로 Pyodide(`verify:ds`)가 뜨지 않아 같은 규칙으로 로컬 CPython(판다스 3.0)에서 확인했다 — 메모리가 되는 PC에서 `npm run verify:ds`로 다시 확인할 것.
- **슬라이드와 다른 점**(해설 "(보충)"): [코드 8-4] dropna 설명 '세 행이 남음' → 실제 두 행(lib/verify/errata.ts 8-4). [코드 8-13] 빈 DataFrame과의 concat 경고를 피해 첫 데이터에서 시작. [코드 8-16] 열 이름 ' 날짜'의 앞 공백 제거.
- **계산**: outlier-002(IQR 하한값 692 — s.55 EC 결과와 같음), zscore-002(Z = -1.5)는 손 계산 후 해설의 steps로 확인.

요약: 문항 28 · 실행 15 · 실행 제외 0 · 개념 13 · 수정 1

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec8-missing-001` | Lec8 s.3-4 | 개념 | — | — |
| `data-science-lec8-missing-002` | Lec8 s.4-5 | 실행 | 통과 | — |
| `data-science-lec8-drop-001` | Lec8 s.6 | 실행 | 통과 | 슬라이드 설명(세 행)과 다름 — 실제 두 행, 해설 (보충) |
| `data-science-lec8-fill-001` | Lec8 s.7 | 실행 | 통과 | — |
| `data-science-lec8-fill-002` | Lec8 s.9 | 실행 | 통과 | — |
| `data-science-lec8-fill-003` | Lec8 s.10 | 실행 | 통과 | — |
| `data-science-lec8-fill-005` | Lec8 s.11 | 실행 | 통과 | — |
| `data-science-lec8-fill-006` | Lec8 s.6-11 | 개념 | — | — |
| `data-science-lec8-outlier-001` | Lec8 s.13 | 개념 | — | — |
| `data-science-lec8-outlier-002` | Lec8 s.14·s.49 | 개념 | — | — |
| `data-science-lec8-outlier-003` | Lec8 s.13 | 개념 | — | — |
| `data-science-lec8-zscore-001` | Lec8 s.21 | 개념 | — | — |
| `data-science-lec8-zscore-002` | Lec8 s.19-22 | 개념 | — | — |
| `data-science-lec8-zscore-003` | Lec8 s.18-23 | 개념 | — | — |
| `data-science-lec8-gather-001` | Lec8 s.26-32 | 개념 | — | — |
| `data-science-lec8-gather-002` | Lec8 s.34 | 실행 | 통과 | — |
| `data-science-lec8-gather-003` | Lec8 s.35-36 | 실행 | 통과 | — |
| `data-science-lec8-gather-004` | Lec8 s.38-39 | 실행 | 통과 | — |
| `data-science-lec8-check-001` | Lec8 s.44-49 | 개념 | — | — |
| `data-science-lec8-check-002` | Lec8 s.46-47 | 개념 | — | — |
| `data-science-lec8-iqr-001` | Lec8 s.50-51 | 실행 | 통과 | — |
| `data-science-lec8-iqr-002` | Lec8 s.49-51 | 실행 | 통과 | — |
| `data-science-lec8-iqr-003` | Lec8 s.52 | 실행 | 통과 | — |
| `data-science-lec8-iqr-004` | Lec8 s.56 | 개념 | — | — |
| `data-science-lec8-scale-001` | Lec8 s.65-66 | 실행 | 통과 | — |
| `data-science-lec8-scale-002` | Lec8 s.70 | 실행 | 통과 | — |
| `data-science-lec8-scale-003` | Lec8 s.69-70 | 실행 | 통과 | — |
| `data-science-lec8-scale-004` | Lec8 s.63-72 | 개념 | — | — |

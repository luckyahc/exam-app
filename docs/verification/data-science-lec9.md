# 대조 기록 — 데이터과학 Lec9. 상관관계 분석 (s.1~32, 기말)

범위: `source/data-science/Lec9.pdf` 전체([코드 9-1]~[코드 9-10], s.26~32 GDP 성장률과 인구수)(2026-11-05, 형식: docs/final/data-science-format.md, 주제 표: docs/final/data-science-coverage.md).

- **실행**: 슬라이드 데이터 그대로 Pyodide(`npm run verify:ds`)로 실행한다. 맷플롯립([코드 9-2]·[코드 9-7])과 켄달(`corr(method='kendall')`은 scipy 필요 — 슬라이드 주석도 'scipy install 후 실행')은 앱 엔진에 없어 빈칸으로만 내고 로컬 CPython(`lib/verify/matplotlib.test.ts`)으로 확인한다. s.31 켄달 값 -0.137568도 로컬 CPython 실행과 같다.
- **슬라이드와 다른 점**(해설 "(보충)", lib/verify/errata.ts): [코드 9-7]~[코드 9-9]는 슬라이드 코드에 [표 9-3]의 앞뒤 10개 값만 적혀 있어 실행 결과가 다르다 — [코드 9-8] -0.497677 → -0.154356, [코드 9-9] -0.854603 → -0.601115(슬라이드 값은 월별 전체 데이터, 전체 데이터는 강의자료에 없어 재현 불가). [코드 9-9]의 `'부동산’:`와 s.28 줄 끝에는 굽은 따옴표가 섞여 그대로면 SyntaxError.
- **슬라이드 그대로 둔 것**: [코드 9-5]의 키 'endClass'(engClass 오타로 보임, 실행 결과도 endClass).
- **계산**: spearman-002(Σd² = 30 → 0.818, [코드 9-10] 실행 결과 0.818182와 일치), kendall-002(C = 5, D = 1 → 0.667)는 손 계산 후 해설의 steps로 확인.

요약: 문항 32 · 실행 12 · 실행 제외 5 · 개념 15 · 수정 6

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec9-concept-001` | Lec9 s.3 | 개념 | — | — |
| `data-science-lec9-concept-002` | Lec9 s.3 | 개념 | — | — |
| `data-science-lec9-concept-003` | Lec9 s.4 | 개념 | — | — |
| `data-science-lec9-pearson-001` | Lec9 s.5-6 | 개념 | — | — |
| `data-science-lec9-pearson-002` | Lec9 s.5 | 개념 | — | — |
| `data-science-lec9-pearson-003` | Lec9 s.5-7 | 개념 | — | — |
| `data-science-lec9-spearman-001` | Lec9 s.8 | 개념 | — | — |
| `data-science-lec9-spearman-002` | Lec9 s.8·s.25 | 개념 | — | — |
| `data-science-lec9-kendall-001` | Lec9 s.9 | 개념 | — | — |
| `data-science-lec9-kendall-002` | Lec9 s.9 | 개념 | — | — |
| `data-science-lec9-method-001` | Lec9 s.5-9 | 개념 | — | — |
| `data-science-lec9-corr-001` | Lec9 s.10 | 실행 | 통과 | — |
| `data-science-lec9-corr-002` | Lec9 s.11-12 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 확인) | — |
| `data-science-lec9-corr-003` | Lec9 s.13 | 실행 | 통과 | — |
| `data-science-lec9-corr-004` | Lec9 s.14 | 실행 제외 | 제외(켄달 scipy — 로컬 CPython 확인) | — |
| `data-science-lec9-corr-005` | Lec9 s.10-14 | 개념 | — | — |
| `data-science-lec9-many-001` | Lec9 s.15-16 | 실행 | 통과 | — |
| `data-science-lec9-many-002` | Lec9 s.17 | 실행 제외 | 제외(켄달 scipy — 로컬 CPython 확인) | — |
| `data-science-lec9-many-003` | Lec9 s.18 | 개념 | — | — |
| `data-science-lec9-rate-001` | Lec9 s.20-21 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 확인) | 슬라이드 그림과 다름 — 코드의 10개 값만 찍힘, 해설 (보충) |
| `data-science-lec9-rate-002` | Lec9 s.22 | 실행 | 통과 | 슬라이드 결과와 다름 — 실제 -0.154356, 해설 (보충) |
| `data-science-lec9-rate-003` | Lec9 s.23 | 실행 | 통과 | 굽은 따옴표 → 곧은 따옴표, 해설 (보충) |
| `data-science-lec9-rate-004` | Lec9 s.23-24 | 실행 | 통과 | 슬라이드 결과와 다름 — 실제 -0.601115, 해설 (보충) |
| `data-science-lec9-rate-005` | Lec9 s.24 | 실행 | 통과 | 슬라이드 결과와 다름 — 실제 -0.601115, 해설 (보충) |
| `data-science-lec9-rate-006` | Lec9 s.21-24 | 개념 | — | — |
| `data-science-lec9-rank-001` | Lec9 s.25 | 실행 | 통과 | — |
| `data-science-lec9-rank-002` | Lec9 s.25 | 실행 | 통과 | — |
| `data-science-lec9-gdp-001` | Lec9 s.26-29 | 실행 | 통과 | 굽은 따옴표 → 곧은 따옴표, 해설 (보충) |
| `data-science-lec9-gdp-002` | Lec9 s.30 | 실행 | 통과 | — |
| `data-science-lec9-gdp-003` | Lec9 s.30 | 실행 제외 | 제외(켄달 scipy — 로컬 CPython 확인) | — |
| `data-science-lec9-gdp-004` | Lec9 s.31 | 실행 | 통과 | — |
| `data-science-lec9-gdp-005` | Lec9 s.32 | 개념 | — | — |

# 대조 기록 — 데이터과학 Lec7 후반. 기온 데이터 · 워드클라우드 · 네트워크X (s.26~59, 기말)

범위: `source/data-science/Lec7.pdf` 슬라이드 26~59([코드 7-20]~[코드 7-37]). s.21~25는 중간고사 lec7(csv-001~004)에 이미 있어 새로 내지 않았다(2026-11-03, 형식: docs/final/data-science-format.md).

- **실행**: 기온.csv·apriori 결과 대신 숨긴 준비 코드(작은 예시 df)로 판다스·Counter·re.sub 코드를 실행한다. 2026-11-03 작성 PC는 메모리 부족으로 Pyodide(`verify:ds`)가 뜨지 않아(V8 'out of memory: Zone') 같은 규칙(허용 답안 = 같은 출력, wrong = 다른 출력, 정답 보기 = 출력)으로 로컬 CPython(판다스 3.0)에서 확인했다 — 메모리가 되는 PC에서 `npm run verify:ds`로 다시 확인할 것.
- **맷플롯립**: line-001·line-003(코드 빈칸)·line-002(검사 코드, lib/verify/matplotlibChecks.ts)는 scripts/verify-matplotlib.py로 확인(wrong은 다른 그래프, x 좌표 1~365).
- **실행 제외**: KoNLPy·wordcloud·networkx·apyori는 실행 엔진에 없어 wc-003·net-001은 빈칸형으로만.
- **슬라이드와 다른 점**(해설 "(보충)"): s.30 실행 결과의 2022년 날짜(내려받은 자료는 2023년), [코드 7-35] 정규식의 '\s'를 r'…'로, 굽은 따옴표는 곧은 따옴표로.

요약: 문항 22 · 실행 9 · 실행 제외 4 · 개념 9 · 수정 0

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec7b-missing-001` | Lec7 s.26-27 | 개념 | — | — |
| `data-science-lec7b-missing-002` | Lec7 s.27 | 실행 | 통과 | — |
| `data-science-lec7b-rename-001` | Lec7 s.28 | 실행 | 통과 | — |
| `data-science-lec7b-line-001` | Lec7 s.29 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7b-line-002` | Lec7 s.29 | 개념 | — | — |
| `data-science-lec7b-line-003` | Lec7 s.33 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7b-date-001` | Lec7 s.30-32 | 실행 | 통과 | — |
| `data-science-lec7b-date-002` | Lec7 s.31-32 | 실행 | 통과 | — |
| `data-science-lec7b-date-003` | Lec7 s.30 | 개념 | — | — |
| `data-science-lec7b-wc-001` | Lec7 s.36-42 | 개념 | — | — |
| `data-science-lec7b-wc-002` | Lec7 s.40 | 개념 | — | — |
| `data-science-lec7b-wc-003` | Lec7 s.42 | 실행 제외 | 제외(KoNLPy·wordcloud 패키지와 '대한민국헌법.txt' 파일, 나눔 폰트가 필요해 실행 제외) | — |
| `data-science-lec7b-wc-004` | Lec7 s.42 | 실행 | 통과 | — |
| `data-science-lec7b-wc-005` | Lec7 s.42 | 실행 | 통과 | — |
| `data-science-lec7b-token-001` | Lec7 s.35·s.44 | 개념 | — | — |
| `data-science-lec7b-token-002` | Lec7 s.54 | 실행 | 통과 | — |
| `data-science-lec7b-token-003` | Lec7 s.54 | 실행 | 통과 | — |
| `data-science-lec7b-assoc-001` | Lec7 s.55 | 개념 | — | — |
| `data-science-lec7b-assoc-002` | Lec7 s.56 | 개념 | — | — |
| `data-science-lec7b-assoc-003` | Lec7 s.57 | 실행 | 통과 | — |
| `data-science-lec7b-net-001` | Lec7 s.58 | 실행 제외 | 제외(networkx는 앱 실행 엔진에 없고 df는 apyori 연관규칙 결과가 필요해 실행 제외) | — |
| `data-science-lec7b-net-002` | Lec7 s.59 | 개념 | — | — |

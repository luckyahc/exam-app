# 대조 기록 — 데이터과학 Lec7. 데이터 시각화 · 맷플롯립 (s.1~25)

범위: `source/data-science/Lec7.pdf` 슬라이드 1~25(맷플롯립 기초 [코드 7-1]~[코드 7-11], 기온 CSV 내려받기·업로드, [코드 7-18]·[코드 7-19]). s.26(결측치 처리)부터는 출제하지 않는다(2026-10-17).

- **검증 방식**: 앱 실행 엔진(Pyodide)에 맷플롯립 휠이 없어(`scripts/prepare-engine.mjs`는 넘파이·판다스·openpyxl만 준비) 맷플롯립 코드는 앱·`verify:ds` 엔진으로 실행하지 않는다 — `verify: { mode: "skip", local: "matplotlib" }`(표의 "실행 제외").
- **로컬 검증**: `lib/verify/matplotlib.test.ts`가 문항 코드를 `scripts/verify-matplotlib.py`(로컬 CPython + matplotlib, Agg 백엔드)로 실행한다.
  - 코드 빈칸: 모든 허용 답안이 같은 그래프(축 위치·선 색/마커/스타일·막대·점·글자·축 범위·범례), wrong은 오류이거나 다른 그래프.
  - 결과를 묻는 문항: 백분율(autopct 글자), 구간별 개수(막대 높이), 상자그림 통계(`matplotlib.cbook.boxplot_stats` — 사분위·수염·이상치), 축 수·격자 위치·선 속성·ylim·text 위치를 객체 속성으로 확인한다. 정답 보기만 참이어야 한다.
  - 코드 블록이 없는 문항(지문에 짧은 코드만, 표의 "개념") 중 결과·성질을 묻는 것도 `lib/verify/matplotlibChecks.ts`의 검사 코드로 같이 확인한다: fmt-002·fmt-003·axis-003·subplot-001·subplot-003·scatter-002·hist-003·box-003·pie-001·pie-002·font-002·csv-004·axis-004.
  - 확인한 맷플롯립 버전은 로컬 3.11.2(Colab과 버전이 다를 수 있다 — 묻는 성질은 버전에 따라 바뀌지 않는 기본 동작만).
- **슬라이드와 다른 점**(해설에 "(보충)"):
  - 굽은 따옴표: [코드 7-4] `'rs:’`, [코드 7-5] `label='one’` 등, [코드 7-10] `'Grade’`, [코드 7-11] `‘%.1f%%'`, [코드 7-19] `'cp949’` — 문항에서는 곧은 따옴표로 고쳤다. 슬라이드 그대로 실행하면 SyntaxError인 것은 axis-004가 묻는다(앱 데이터는 코드 블록에 굽은 따옴표를 넣지 않으므로 지문에 그 한 줄만 적었다).
  - s.11 형식 설명 `plt.axis(x 최솟값, x 최댓값, y 최솟값, y 최댓값)`: 실제 API는 리스트(또는 튜플) 하나 — 값 4개를 따로 넘기면 TypeError(axis-001·axis-003).
- 설치 명령([코드 7-2]·[코드 7-18]의 `!sudo apt-get …`)은 문항에 넣지 않았다(결정 9) — 설치 → 런타임 재시작 → 폰트 지정 순서만 order로 묻는다.
- 그림: 새 그림 없음. 그래프는 코드·글자로만 묻는다.

요약: 문항 44 · 실행 0 · 실행 제외 21 · 개념 23 · 수정 0

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec7-types-001` | Lec7 s.3-6 | 개념 | — | — |
| `data-science-lec7-types-002` | Lec7 s.7 | 개념 | — | — |
| `data-science-lec7-types-003` | Lec7 s.7·s.14-19 | 개념 | — | — |
| `data-science-lec7-types-004` | Lec7 s.14-19 | 개념 | — | — |
| `data-science-lec7-plot-001` | Lec7 s.8 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-plot-002` | Lec7 s.8 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-plot-003` | Lec7 s.8 | 개념 | — | — |
| `data-science-lec7-font-001` | Lec7 s.8 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-font-002` | Lec7 s.8·s.10 | 개념 | — | — |
| `data-science-lec7-font-003` | Lec7 s.10 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-font-004` | Lec7 s.9-10 | 개념 | — | — |
| `data-science-lec7-fmt-001` | Lec7 s.11-13 | 개념 | — | — |
| `data-science-lec7-fmt-002` | Lec7 s.11 | 개념 | — | — |
| `data-science-lec7-fmt-003` | Lec7 s.12-13 | 개념 | — | — |
| `data-science-lec7-fmt-004` | Lec7 s.11-12 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-axis-001` | Lec7 s.11 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-axis-002` | Lec7 s.11 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-axis-003` | Lec7 s.11 | 개념 | — | — |
| `data-science-lec7-axis-004` | Lec7 s.11 | 개념 | — | — |
| `data-science-lec7-legend-001` | Lec7 s.12 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-legend-002` | Lec7 s.12 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-subplot-001` | Lec7 s.13 | 개념 | — | — |
| `data-science-lec7-subplot-002` | Lec7 s.13 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-subplot-003` | Lec7 s.13 | 개념 | — | — |
| `data-science-lec7-subplot-004` | Lec7 s.13 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-scatter-001` | Lec7 s.14 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-scatter-002` | Lec7 s.14 | 개념 | — | — |
| `data-science-lec7-hist-001` | Lec7 s.15 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-hist-002` | Lec7 s.15 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-hist-003` | Lec7 s.15 | 개념 | — | — |
| `data-science-lec7-box-001` | Lec7 s.16 | 개념 | — | — |
| `data-science-lec7-box-002` | Lec7 s.16-17 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-box-003` | Lec7 s.16-17 | 개념 | — | — |
| `data-science-lec7-box-004` | Lec7 s.17 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-bar-001` | Lec7 s.18 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-bar-002` | Lec7 s.18 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-pie-001` | Lec7 s.19 | 개념 | — | — |
| `data-science-lec7-pie-002` | Lec7 s.19 | 개념 | — | — |
| `data-science-lec7-pie-003` | Lec7 s.19 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-pie-004` | Lec7 s.19 | 실행 제외 | 제외(맷플롯립 — 로컬 CPython 검증 통과) | — |
| `data-science-lec7-csv-001` | Lec7 s.21-23 | 개념 | — | — |
| `data-science-lec7-csv-002` | Lec7 s.24-25 | 개념 | — | — |
| `data-science-lec7-csv-003` | Lec7 s.25 | 실행 제외 | 제외(기온.csv 파일 없음) | — |
| `data-science-lec7-csv-004` | Lec7 s.25 | 개념 | — | — |

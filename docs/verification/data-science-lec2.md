# 대조 기록 — 데이터과학 Lec2. 파이썬 기초

검증 파이프라인(`lib/verify/`, Sprint 14)으로 문항 데이터를 실행해 검사한 결과를 문항마다 남긴다. 표·요약 숫자는 `lib/verify/records.test.ts`가 문항 데이터(`data/subjects/data-science/lec2.ts`)와 같은지 확인한다.

- **검증 방식**: 실행(Node에서 Pyodide·sql.js로 실행해 검사) / 실행 제외(셀레니움·Colab 명령·MySQL 서버 전용처럼 실행할 수 없는 코드) / 개념(코드 없음)
- **결과**: 실행 → `통과`, 실행 제외 → `제외(이유)`, 개념 → `—`
- **수정 내용**: 검증으로 고친 것(허용 답안 추가, 슬라이드 오류 "(보충)" 등). 없으면 `—`
- 코드 빈칸의 첫 번째 정답은 슬라이드 표기다. 슬라이드 실행결과와 실제 실행이 다른 코드는 `lib/verify/errata.ts` 목록을 따른다

요약: 문항 93 · 실행 63 · 실행 제외 0 · 개념 30 · 수정 9

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec2-variable-001` | Lec2 s.3 | 실행 | 통과 | — |
| `data-science-lec2-variable-002` | Lec2 s.4 | 실행 | 통과 | — |
| `data-science-lec2-variable-003` | Lec2 s.5 | 실행 | 통과 | — |
| `data-science-lec2-variable-004` | Lec2 s.5 | 개념 | — | — |
| `data-science-lec2-variable-005` | Lec2 s.5 | 개념 | — | — |
| `data-science-lec2-variable-006` | Lec2 s.6 | 개념 | — | — |
| `data-science-lec2-constant-001` | Lec2 s.7 | 개념 | — | — |
| `data-science-lec2-constant-003` | Lec2 s.7 | 개념 | — | (보충)(a) 대체: constant-002(상수 재대입이 오류 없이 실행 — 슬라이드 밖 지식) → s.7 이름 관례로 출제 |
| `data-science-lec2-arith-001` | Lec2 s.9 | 개념 | — | — |
| `data-science-lec2-arith-002` | Lec2 s.9 | 실행 | 통과 | — |
| `data-science-lec2-arith-003` | Lec2 s.9 | 실행 | 통과 | — |
| `data-science-lec2-arith-004` | Lec2 s.9 | 실행 | 통과 | — |
| `data-science-lec2-relational-001` | Lec2 s.10 | 실행 | 통과 | — |
| `data-science-lec2-relational-002` | Lec2 s.10 | 개념 | — | — |
| `data-science-lec2-relational-003` | Lec2 s.10 | 개념 | — | — |
| `data-science-lec2-logical-001` | Lec2 s.12 | 실행 | 통과 | — |
| `data-science-lec2-logical-002` | Lec2 s.11 | 개념 | — | — |
| `data-science-lec2-logical-003` | Lec2 s.11 | 개념 | — | — |
| `data-science-lec2-member-001` | Lec2 s.13 | 실행 | 통과 | — |
| `data-science-lec2-member-002` | Lec2 s.13 | 개념 | — | — |
| `data-science-lec2-cond-001` | Lec2 s.16 | 실행 | 통과 | — |
| `data-science-lec2-cond-002` | Lec2 s.17 | 실행 | 통과 | (보충)(a) 수정: 정답 보기의 '아무것도 출력되지 않는다'(슬라이드 밖 지식) 삭제, 해설 정리 |
| `data-science-lec2-cond-003` | Lec2 s.18 | 실행 | 통과 | 검증: wrong 'if'가 a = 5에서 정답과 같은 결과 → wrong에서 빼고 해설 수정 |
| `data-science-lec2-cond-004` | Lec2 s.18 | 실행 | 통과 | — |
| `data-science-lec2-cond-005` | Lec2 s.15 | 개념 | — | — |
| `data-science-lec2-loop-001` | Lec2 s.19 | 실행 | 통과 | 검증: 후보 규칙·작성자 후보 실행 결과로 accept 7개(0번 칸 5·1번 칸 2)·wrong 3개 기록 |
| `data-science-lec2-loop-002` | Lec2 s.21 | 실행 | 통과 | — |
| `data-science-lec2-loop-003` | Lec2 s.21 | 실행 | 통과 | — |
| `data-science-lec2-loop-004` | Lec2 s.19-20 | 개념 | — | — |
| `data-science-lec2-number-001` | Lec2 s.23 | 실행 | 통과 | — |
| `data-science-lec2-number-002` | Lec2 s.23 | 실행 | 통과 | — |
| `data-science-lec2-number-003` | Lec2 s.23 | 개념 | — | — |
| `data-science-lec2-string-001` | Lec2 s.24 | 실행 | 통과 | — |
| `data-science-lec2-string-002` | Lec2 s.24 | 개념 | — | — |
| `data-science-lec2-tuple-001` | Lec2 s.25-26 | 실행 | 통과 | — |
| `data-science-lec2-tuple-002` | Lec2 s.27 | 실행 | 통과 | — |
| `data-science-lec2-tuple-003` | Lec2 s.25-27 | 개념 | — | — |
| `data-science-lec2-set-001` | Lec2 s.28 | 실행 | 통과 | — |
| `data-science-lec2-set-002` | Lec2 s.28-29 | 개념 | — | — |
| `data-science-lec2-set-003` | Lec2 s.29 | 실행 | 통과 | 검증: 작성자 후보 discard가 같은 결과 → accept 추가, pop은 다른 결과 → wrong |
| `data-science-lec2-list-001` | Lec2 s.31 | 실행 | 통과 | — |
| `data-science-lec2-list-002` | Lec2 s.32 | 실행 | 통과 | — |
| `data-science-lec2-list-003` | Lec2 s.32 | 실행 | 통과 | — |
| `data-science-lec2-list-004` | Lec2 s.32 | 개념 | — | — |
| `data-science-lec2-dict-001` | Lec2 s.33-34 | 실행 | 통과 | — |
| `data-science-lec2-dict-002` | Lec2 s.34-35 | 실행 | 통과 | — |
| `data-science-lec2-dict-003` | Lec2 s.34-35 | 실행 | 통과 | — |
| `data-science-lec2-dict-004` | Lec2 s.34-35 | 실행 | 통과 | — |
| `data-science-lec2-func-001` | Lec2 s.39 | 실행 | 통과 | — |
| `data-science-lec2-func-002` | Lec2 s.40 | 실행 | 통과 | — |
| `data-science-lec2-func-005` | Lec2 s.39-40 | 개념 | — | (보충)(a) 대체: func-003(반환값 None — 슬라이드 밖) → s.40 출력·반환 차이로 출제 |
| `data-science-lec2-func-004` | Lec2 s.37-39 | 개념 | — | — |
| `data-science-lec2-funcparts-001` | Lec2 p.41 | 실행 | 통과 | — |
| `data-science-lec2-funcparts-002` | Lec2 p.43 | 개념 | — | — |
| `data-science-lec2-funcparts-003` | Lec2 p.42 | 개념 | — | — |
| `data-science-lec2-funcparts-004` | Lec2 p.43 | 개념 | — | — |
| `data-science-lec2-scope-001` | Lec2 p.46 | 실행 | 통과 | — |
| `data-science-lec2-scope-002` | Lec2 p.49 | 실행 | 통과 | — |
| `data-science-lec2-scope-003` | Lec2 p.49 | 실행 | 통과 | — |
| `data-science-lec2-scope-004` | Lec2 p.44 | 개념 | — | — |
| `data-science-lec2-scope-005` | Lec2 p.48 | 개념 | — | — |
| `data-science-lec2-cond-006` | Lec2 s.16 | 실행 | 통과 | 검증: 후보 규칙 paren이 연산자만 있는 빈칸을 감싸는 버그 발견 → 규칙 수정(데이터 변경 없음) |
| `data-science-lec2-cond-007` | Lec2 s.18 | 실행 | 통과 | 검증: 후보 규칙 int-bound·mirror·paren이 같은 결과 → accept 3개 추가, 작성자 후보 a <= 5 → wrong |
| `data-science-lec2-loop-005` | Lec2 s.21 | 실행 | 통과 | 검증: 작성자 후보 '1, 6'은 토큰 같음, '1,5'·'0,5'는 다른 결과 → wrong |
| `data-science-lec2-member-003` | Lec2 s.13 | 실행 | 통과 | — |
| `data-science-lec2-tuple-004` | Lec2 s.25 | 실행 | 통과 | — |
| `data-science-lec2-set-004` | Lec2 s.28 | 실행 | 통과 | — |
| `data-science-lec2-list-005` | Lec2 s.30-31 | 실행 | 통과 | — |
| `data-science-lec2-dict-005` | Lec2 s.33-34 | 실행 | 통과 | — |
| `data-science-lec2-func-006` | Lec2 s.39 | 실행 | 통과 | — |
| `data-science-lec2-list-006` | Lec2 s.31-32 | 개념 | — | — |
| `data-science-lec2-relational-004` | Lec2 s.10 | 개념 | — | — |
| `data-science-lec2-dict-006` | Lec2 s.33-35 | 개념 | — | — |
| `data-science-lec2-variable-007` | Lec2 s.3 | 실행 | 통과 | — |
| `data-science-lec2-arith-005` | Lec2 s.9 | 실행 | 통과 | — |
| `data-science-lec2-relational-005` | Lec2 s.10 | 실행 | 통과 | — |
| `data-science-lec2-logical-004` | Lec2 s.11-12 | 실행 | 통과 | — |
| `data-science-lec2-number-004` | Lec2 s.23 | 실행 | 통과 | — |
| `data-science-lec2-tuple-005` | Lec2 s.25·s.32 | 실행 | 통과 | — |
| `data-science-lec2-list-007` | Lec2 s.31 | 실행 | 통과 | — |
| `data-science-lec2-list-008` | Lec2 s.31 | 실행 | 통과 | — |
| `data-science-lec2-dict-007` | Lec2 s.34 | 실행 | 통과 | — |
| `data-science-lec2-dict-008` | Lec2 s.35 | 실행 | 통과 | — |
| `data-science-lec2-loop-006` | Lec2 s.21 | 실행 | 통과 | — |
| `data-science-lec2-loop-007` | Lec2 s.19 | 실행 | 통과 | — |
| `data-science-lec2-cond-008` | Lec2 s.17 | 실행 | 통과 | — |
| `data-science-lec2-func-007` | Lec2 s.39 | 실행 | 통과 | — |
| `data-science-lec2-func-008` | Lec2 s.40 | 실행 | 통과 | — |
| `data-science-lec2-scope-006` | Lec2 p.46 | 실행 | 통과 | — |
| `data-science-lec2-funcparts-005` | Lec2 p.41 | 실행 | 통과 | — |
| `data-science-lec2-member-004` | Lec2 s.13 | 실행 | 통과 | — |
| `data-science-lec2-set-006` | Lec2 s.28-29 | 개념 | — | — |
| `data-science-lec2-scope-007` | Lec2 p.44-49 | 개념 | — | — |

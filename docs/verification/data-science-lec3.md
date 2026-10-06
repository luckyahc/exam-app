# 대조 기록 — 데이터과학 Lec3. CSV 파일 · 엑셀 파일

검증 파이프라인(`lib/verify/`, Sprint 14)으로 문항 데이터를 실행해 검사한 결과를 문항마다 남긴다. 표·요약 숫자는 `lib/verify/records.test.ts`가 문항 데이터(`data/subjects/data-science/lec3.ts`)와 같은지 확인한다.

- **검증 방식**: 실행(Node에서 Pyodide·sql.js로 실행해 검사) / 실행 제외(셀레니움·Colab 명령·MySQL 서버 전용처럼 실행할 수 없는 코드) / 개념(코드 없음)
- **결과**: 실행 → `통과`, 실행 제외 → `제외(이유)`, 개념 → `—`
- **수정 내용**: 검증으로 고친 것(허용 답안 추가, 슬라이드 오류 "(보충)" 등). 없으면 `—`
- 코드 빈칸의 첫 번째 정답은 슬라이드 표기다. 슬라이드 실행결과와 실제 실행이 다른 코드는 `lib/verify/errata.ts` 목록을 따른다

요약: 문항 47 · 실행 20 · 실행 제외 1 · 개념 26 · 수정 7

| 문항 id | slideRef | 검증 방식 | 결과 | 수정 내용 |
|---|---|---|---|---|
| `data-science-lec3-csv-001` | Lec3 s.4 | 개념 | — | — |
| `data-science-lec3-csv-002` | Lec3 s.3 | 개념 | — | — |
| `data-science-lec3-csv-003` | Lec3 s.4 | 개념 | — | — |
| `data-science-lec3-encoding-001` | Lec3 s.6 | 개념 | — | — |
| `data-science-lec3-encoding-002` | Lec3 s.7-8 | 개념 | — | — |
| `data-science-lec3-encoding-003` | Lec3 s.6 | 개념 | — | — |
| `data-science-lec3-comma-001` | Lec3 s.9-10 | 개념 | — | 브라우저 표시: text 코드 펜스(지원 안 함) 대신 인라인 코드로 CSV 세 행 표시 / PDF 대조: 엑셀에 000이 0으로 보이는 점(s.10 그림) 반영 |
| `data-science-lec3-comma-004` | Lec3 s.10 | 개념 | — | (보충)(a) 대체: comma-002(csv.reader의 따옴표 처리 — 슬라이드 밖) → s.10 따옴표 빈칸 |
| `data-science-lec3-comma-005` | Lec3 s.11 | 개념 | — | (보충)(a) 대체: comma-003(csv.reader 행별 값 개수 — 슬라이드 밖) → s.11 그림 OX |
| `data-science-lec3-upload-001` | Lec3 s.12 | 실행 제외 | 제외(Colab 전용 — google.colab 모듈과 [파일 선택] 창은 Colab에서만 동작한다) | — |
| `data-science-lec3-upload-002` | Lec3 s.13 | 개념 | — | — |
| `data-science-lec3-read-001` | Lec3 s.14-15 | 실행 | 통과 | 검증: 작성자 후보 'CP949' 같은 결과 → accept, 'utf-8' 다른 결과 → wrong |
| `data-science-lec3-read-002` | Lec3 s.17 | 실행 | 통과 | — |
| `data-science-lec3-read-003` | Lec3 s.17-18 | 실행 | 통과 | — |
| `data-science-lec3-read-007` | Lec3 s.14 | 개념 | — | (보충)(a) 대체: read-005(UnicodeDecodeError — 슬라이드 밖) → s.14 cp949 |
| `data-science-lec3-read-006` | Lec3 s.14-22 | 개념 | — | — |
| `data-science-lec3-read-004` | Lec3 s.18 | 개념 | — | — |
| `data-science-lec3-write-001` | Lec3 s.19 | 실행 | 통과 | — |
| `data-science-lec3-write-002` | Lec3 s.22 | 실행 | 통과 | — |
| `data-science-lec3-write-003` | Lec3 s.22 | 개념 | — | — |
| `data-science-lec3-write-006` | Lec3 s.14-22 | 개념 | — | (보충)(a) 대체: write-004('w'가 기존 내용을 지움 — 슬라이드 밖) → s.14~22 인자 분류 |
| `data-science-lec3-write-005` | Lec3 s.20 | 개념 | — | — |
| `data-science-lec3-workbook-001` | Lec3 s.25 | 개념 | — | — |
| `data-science-lec3-workbook-002` | Lec3 s.25 | 개념 | — | — |
| `data-science-lec3-workbook-003` | Lec3 s.26 | 개념 | — | — |
| `data-science-lec3-xlread-001` | Lec3 s.27-29 | 실행 | 통과 | — |
| `data-science-lec3-xlread-002` | Lec3 s.28 | 실행 | 통과 | — |
| `data-science-lec3-xlread-003` | Lec3 s.26-29 | 실행 | 통과 | — |
| `data-science-lec3-xlread-004` | Lec3 s.27 | 개념 | — | — |
| `data-science-lec3-xlwrite-001` | Lec3 s.30-31 | 실행 | 통과 | — |
| `data-science-lec3-xlwrite-002` | Lec3 s.30-36 | 실행 | 통과 | — |
| `data-science-lec3-xlwrite-003` | Lec3 s.33-35 | 실행 | 통과 | — |
| `data-science-lec3-xlwrite-004` | Lec3 s.30-37 | 개념 | — | — |
| `data-science-lec3-xlwrite-005` | Lec3 s.30 | 개념 | — | — |
| `data-science-lec3-xlwrite-007` | Lec3 s.30-36 | 개념 | — | — |
| `data-science-lec3-xlwrite-006` | Lec3 s.37 | 개념 | — | — |
| `data-science-lec3-read-008` | Lec3 s.15-17 | 실행 | 통과 | — |
| `data-science-lec3-write-007` | Lec3 s.19 | 실행 | 통과 | 검증: 작성자 후보 'a'가 같은 결과(파일이 없을 때) → accept 추가, 'r' → wrong |
| `data-science-lec3-xlread-005` | Lec3 s.26-29 | 실행 | 통과 | — |
| `data-science-lec3-xlwrite-008` | Lec3 s.34-37 | 실행 | 통과 | — |
| `data-science-lec3-workbook-004` | Lec3 s.25 | 개념 | — | — |
| `data-science-lec3-encoding-004` | Lec3 s.6-10 | 개념 | — | — |
| `data-science-lec3-read-009` | Lec3 s.15 | 실행 | 통과 | — |
| `data-science-lec3-read-010` | Lec3 s.18 | 실행 | 통과 | — |
| `data-science-lec3-write-008` | Lec3 s.19·s.22 | 실행 | 통과 | — |
| `data-science-lec3-xlread-006` | Lec3 s.27-29 | 실행 | 통과 | — |
| `data-science-lec3-xlwrite-009` | Lec3 s.31-32 | 실행 | 통과 | — |

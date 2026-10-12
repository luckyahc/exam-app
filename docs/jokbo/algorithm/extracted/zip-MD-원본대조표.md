# 시험범위 대응 및 원본 문항 대조표

강의자료 1~5의 실제 내용을 기준으로 족보에서 선별했다. 문제의 조건·수치·보기 순서는 원문을 따르며, 화면 문구와 띄어쓰기는 정리했다. 새로 만든 모의문제는 포함하지 않았다. 같은 주제라도 값·보기·원본 시험이 다르면 별도 문항으로 남겼다.

선별 범위에는 설계·복잡도 분석·정렬·힙·선택·동적 계획법과 그 응용이 포함된다. 자료 5의 모든 쌍 최단경로는 3·123쪽에 있으므로 기말 문제도 포함했다. 단일 시작점 거리 DP는 133~138쪽의 optional 내용이므로 해당 문항에 표시했다. B-트리·레드블랙 트리·해시·분리 집합·NP·위상 정렬·최소 신장 트리는 이 다섯 자료의 직접 학습 내용으로 확인되지 않아 제외했다.

자료 1의 DFS는 사이클 판단 방법의 이름과 미로의 되돌아가기 설명 수준이다. 상세 DFS/BFS 방문 순서·DFS span·강연결요소 문제는 같은 “그래프”라는 이유만으로 포함하지 않았다. 활동 선택·도시락 스케줄링도 일반 그리디 도입만으로 직접 대응한다고 판단하지 않았다.

페이지는 PDF 파일의 물리적 페이지 번호이다. 포함 여부는 업로드된 자료의 내용에 따른 대응이며 실제 시험 출제를 보장한다는 뜻은 아니다.

원본 파일 링크는 이 모음의 ‘원본참조’ 폴더에 보관한 변경 없는 사본을 연다. 업로드된 원본 자료는 수정하지 않았다.


## 강의자료 기준

| 자료 | 주요 범위 |
|---|---|
| 1 | 탐색·그리디 도입·한붓그리기·미로·가짜 동전·독이 든 술단지 |
| 2 | 설계와 분석·점근 표기·재귀·점화식·마스터 정리 |
| 3 | 기본 자료구조·정렬·힙·계수·기수 정렬 |
| 4 | 분할 정복·선택·최근접 점·거듭제곱 |
| 5 | 피보나치·행렬 경로·돌 놓기·행렬 곱·LCS·편집 거리·배낭·거스름돈·거리 DP |

## 원본별 포함 문항

| 자료 약어 | 원본 자료 | 포함 원본 번호 | 문항 수 |
|---|---|---|---|
| E19 | 2019 예상문제 (본문 표제: 알고리즘 중간고사 02분반) | 1, 3, 4, 5 | 4 |
| M21 | 2021 중간고사 기출 | 1, 2, 3, 4, 5, 7, 8, 9, 10, 13, 14, 15, 16, 17, 19, 20 | 16 |
| M22 | 2022 중간고사 (교수 직접 해설 PDF) | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 번호 미표기, 12, 13, 14, 15 | 16 |
| M23 | 2023 중간 족보 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25 | 25 |
| T22 | 2022 중간고사 대비 테스트 시험 | 1, 2, 3, 4, 5, 6, 8, 11, 12, 13, 14, 15, 16, 17, 18, 20 | 16 |
| S22 | 2022 중간 대비 특별 시험·변형 문제 | 3, 7, 9, 10, 13, 14 | 6 |
| T23 | 2023 중간고사 대비 테스트 시험 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 | 14 |
| F22 | 2022 기말고사 대비 테스트 시험 | 2, 3, 4, 5, 7, 11, 12, 13, 14 | 9 |
| F23 | 2023 알고리즘 기말기출 PDF | 4, 6, 7, 8, 9 | 5 |

## 주요 제외 문항과 이유

| 원본 자료 | 원본 번호 | 제외 이유 |
|---|---|---|
| 2021 중간 | 6,11,12,18 | B-트리·레드블랙 트리 |
| 2022 중간 | 16~19 | 레드블랙 트리·B-트리 |
| 2022 대비 테스트 | 7,9,10,19 | 레드블랙 트리·B-트리 |
| 2022 기말 대비 | 1,6,8~10,15~20 | NP·다익스트라·위상정렬·MST·상세 DFS/BFS·분리집합·해시 |
| 2023 기말 PDF | 1,3,5,10~17,19,20 | B-트리·분리집합·레드블랙 트리·위상정렬·해시·NP·BFS·SCC·프림·DFS span |
| 2023 기말 PDF | 2,18 | 활동 선택·도시락 스케줄링: 그리디 응용이나 강의자료 1~5에 직접 설명된 주제는 아님 |
| 2019 예상문제 | 2 | 활동 선택 그리디 설계 |

## 원문 상태와 답 검토

| 자료·원본 번호 | 확인한 점 |
|---|---|
| 2021 중간 15 | 보기 3은 원문에서 5:2이다. 그룹 7개 보장량 2n/7로 계산하면 일치한다. |
| 2021 중간 16 | 본문 목표 8과 실제 호출의 i=3이 충돌한다. 목표 8 기준 첨부 답 1; 호출 기준 정답 보기 없음. |
| 2023 중간 8,19 | 표 오른쪽이 잘림. 다른 첨부 원문의 같은 표로 보완한 계산을 조건부로 제시. |
| 2023 중간 16 | 본문 문자열과 번호를 붙인 표의 길이 불일치. 표 기준 풀이와 전체 LCS를 구분. |
| 2022 중간 2 / 2023 중간 23 | move(1)를 같은 함수 호출로 실행하면 종료하지 않는 원문 코드 오류. 한 원반 이동이라는 출제 의도와 구분. |
| 2023 기말 4,6,7,8,9 | 원문 직접 풀이 결과 6,34,12,−1,2000. 이 다섯 문항에는 판독 가능한 첨부 답 표시가 없으므로 일치한다고 단정하지 않음. |
| 마스터 정리 적용 문항 | 기본 3사례 정리와 로그 인자를 허용하는 확장형을 구분. |
| 선택·기수 정렬 문항 | 보기 순서가 바뀌어도 원본별 번호와 답을 각각 유지. |

## 전체 문항 대응

| 새 번호 | 자료 약어 | 원본 번호 | 원본 파일 | 강의 주제 |
|---|---|---|---|---|
| 1 | E19 | 1 | [알고리즘 예상문제(2019).docx](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/E19/알고리즘 예상문제(2019).docx>) | 순차 탐색의 평균 비교 횟수 |
| 2 | E19 | 3 | [알고리즘 예상문제(2019).docx](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/E19/알고리즘 예상문제(2019).docx>) | 0-1 배낭 문제 |
| 3 | E19 | 4 | [알고리즘 예상문제(2019).docx](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/E19/알고리즘 예상문제(2019).docx>) | 분할 정복의 재귀 구조·정수 곱셈 응용 |
| 4 | E19 | 5 | [알고리즘 예상문제(2019).docx](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/E19/알고리즘 예상문제(2019).docx>) | 부분 문제·저장·1차원 DP 설계 |
| 5 | M21 | 1 | [1,2,3.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/1,2,3.jpg>) | 점근 표기·상한과 하한 |
| 6 | M21 | 2 | [1,2,3.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/1,2,3.jpg>) | 점근 표기·상한과 하한 |
| 7 | M21 | 3 | [1,2,3.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/1,2,3.jpg>) | 정렬·힙·선형 시간 정렬 |
| 8 | M21 | 4 | [4,5.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/4,5.jpg>) | 평균 선형 선택·최악 선형 선택 |
| 9 | M21 | 5 | [4,5.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/4,5.jpg>) | 정렬·힙·선형 시간 정렬 |
| 10 | M21 | 7 | [6,7.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/6,7.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 11 | M21 | 8 | [8,9.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/8,9.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 12 | M21 | 9 | [8,9.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/8,9.jpg>) | 정렬·힙·선형 시간 정렬 |
| 13 | M21 | 10 | [10.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/10.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 14 | M21 | 13 | [12,13.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/12,13.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 15 | M21 | 14 | [14,15,16.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/14,15,16.jpg>) | 정렬·힙·선형 시간 정렬 |
| 16 | M21 | 15 | [14,15,16.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/14,15,16.jpg>) | 평균 선형 선택·최악 선형 선택 |
| 17 | M21 | 16 | [14,15,16.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/14,15,16.jpg>) | 평균 선형 선택·최악 선형 선택 |
| 18 | M21 | 17 | [17.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/17.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 19 | M21 | 19 | [19,20.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/19,20.jpg>) | 점근 표기·상한과 하한 |
| 20 | M21 | 20 | [19,20.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M21/19,20.jpg>) | 정렬·힙·선형 시간 정렬 |
| 21 | M22 | 1 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 재귀 비용·점화식·마스터 정리 |
| 22 | M22 | 2 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 재귀 비용·점화식·마스터 정리 |
| 23 | M22 | 3 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 점근 표기·상한과 하한 |
| 24 | M22 | 4 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 점근 표기·상한과 하한 |
| 25 | M22 | 5 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 점근 표기·상한과 하한 |
| 26 | M22 | 6 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 재귀 비용·점화식·마스터 정리 |
| 27 | M22 | 7 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 재귀 비용·점화식·마스터 정리 |
| 28 | M22 | 8 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 재귀 비용·점화식·마스터 정리 |
| 29 | M22 | 9 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 정렬·힙·선형 시간 정렬 |
| 30 | M22 | 10 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 정렬·힙·선형 시간 정렬 |
| 31 | M22 | 11 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 정렬·힙·선형 시간 정렬 |
| 32 | M22 | 번호 미표기 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 정렬·힙·선형 시간 정렬 |
| 33 | M22 | 12 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 정렬·힙·선형 시간 정렬 |
| 34 | M22 | 13 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 평균 선형 선택·최악 선형 선택 |
| 35 | M22 | 14 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 평균 선형 선택·최악 선형 선택 |
| 36 | M22 | 15 | [2022 알고리즘 중간고사 해설(교수 직접) 1.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M22/2022 알고리즘 중간고사 해설(교수 직접) 1.pdf>) | 평균 선형 선택·최악 선형 선택 |
| 37 | M23 | 1 | [1.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/1.jpg>) | 정렬·힙·선형 시간 정렬 |
| 38 | M23 | 2 | [2.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/2.jpg>) | 정렬·힙·선형 시간 정렬 |
| 39 | M23 | 3 | [3.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/3.png>) | 상태를 나누는 DP·돌 놓기 응용 |
| 40 | M23 | 4 | [4.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/4.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 41 | M23 | 5 | [5.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/5.jpg>) | 연쇄 행렬 곱셈 |
| 42 | M23 | 6 | [6.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/6.jpg>) | 정렬·힙·선형 시간 정렬 |
| 43 | M23 | 7 | [7.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/7.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 44 | M23 | 8 | [8.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/8.png>) | 행렬 최대 합 경로와 응용 |
| 45 | M23 | 9 | [9.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/9.jpg>) | 점근 표기·상한과 하한 |
| 46 | M23 | 10 | [10.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/10.png>) | 행렬 최대 합 경로와 응용 |
| 47 | M23 | 11 | [11.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/11.jpg>) | 정렬·힙·선형 시간 정렬 |
| 48 | M23 | 12 | [12.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/12.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 49 | M23 | 13 | [13.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/13.jpg>) | 점근 표기·상한과 하한 |
| 50 | M23 | 14 | [14.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/14.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 51 | M23 | 15 | [15.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/15.jpg>) | 평균 선형 선택·최악 선형 선택 |
| 52 | M23 | 16 | [16.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/16.jpg>) | 최장 공통 부분순서 LCS |
| 53 | M23 | 17 | [17.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/17.jpg>) | 평균 선형 선택·최악 선형 선택 |
| 54 | M23 | 18 | [18.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/18.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 55 | M23 | 19 | [19.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/19.jpg>) | 돌 놓기·패턴 상태 |
| 56 | M23 | 20 | [20.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/20.jpg>) | 정렬·힙·선형 시간 정렬 |
| 57 | M23 | 21 | [21.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/21.jpg>) | 정렬·힙·선형 시간 정렬 |
| 58 | M23 | 22 | [22.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/22.jpg>) | 정렬·힙·선형 시간 정렬 |
| 59 | M23 | 23 | [23.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/23.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 60 | M23 | 24 | [24.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/24.jpg>) | 점근 표기·상한과 하한 |
| 61 | M23 | 25 | [25.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/M23/25.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 62 | T22 | 1 | [1,2.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/1,2.png>) | 점근 표기·상한과 하한 |
| 63 | T22 | 2 | [1,2.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/1,2.png>) | 점근 표기·상한과 하한 |
| 64 | T22 | 3 | [3.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/3.png>) | 정렬·힙·선형 시간 정렬 |
| 65 | T22 | 4 | [4,5.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/4,5.png>) | 재귀 비용·점화식·마스터 정리 |
| 66 | T22 | 5 | [4,5.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/4,5.png>) | 재귀 비용·점화식·마스터 정리 |
| 67 | T22 | 6 | [6.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/6.png>) | 정렬·힙·선형 시간 정렬 |
| 68 | T22 | 8 | [8.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/8.png>) | 평균 선형 선택·최악 선형 선택 |
| 69 | T22 | 11 | [11,12.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/11,12.png>) | 정렬·힙·선형 시간 정렬 |
| 70 | T22 | 12 | [11,12.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/11,12.png>) | 재귀 비용·점화식·마스터 정리 |
| 71 | T22 | 13 | [13,14.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/13,14.png>) | 재귀 비용·점화식·마스터 정리 |
| 72 | T22 | 14 | [13,14.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/13,14.png>) | 점근 표기·상한과 하한 |
| 73 | T22 | 15 | [15,16.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/15,16.png>) | 재귀 비용·점화식·마스터 정리 |
| 74 | T22 | 16 | [15,16.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/15,16.png>) | 정렬·힙·선형 시간 정렬 |
| 75 | T22 | 17 | [17,18.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/17,18.png>) | 평균 선형 선택·최악 선형 선택 |
| 76 | T22 | 18 | [17,18.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/17,18.png>) | 정렬·힙·선형 시간 정렬 |
| 77 | T22 | 20 | [20.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T22/20.png>) | 평균 선형 선택·최악 선형 선택 |
| 78 | S22 | 3 | [중간 대비 특별 시험 - 디테일이 바뀐 문제2.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/S22/중간 대비 특별 시험 - 디테일이 바뀐 문제2.png>) | 정렬·힙·선형 시간 정렬 |
| 79 | S22 | 7 | [중간 대비 특별 시험 - 처음보는 문제.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/S22/중간 대비 특별 시험 - 처음보는 문제.png>) | 재귀 비용·점화식·마스터 정리 |
| 80 | S22 | 9 | [중간 대비 특별 시험 - 보기가 바뀐 문제.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/S22/중간 대비 특별 시험 - 보기가 바뀐 문제.png>) | 평균 선형 선택·최악 선형 선택 |
| 81 | S22 | 10 | [중간 대비 특별 시험 - 처음보는 문제2 - 잘 모르겠어요.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/S22/중간 대비 특별 시험 - 처음보는 문제2 - 잘 모르겠어요.png>) | 점근 표기·상한과 하한 |
| 82 | S22 | 13 | [중간 대비 특별 시험 - 처음보는 문제3 - 피보나치.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/S22/중간 대비 특별 시험 - 처음보는 문제3 - 피보나치.png>) | 재귀 비용·점화식·마스터 정리 |
| 83 | S22 | 14 | [중간 대비 특별 시험 - 디테일이 바뀐 문제.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/S22/중간 대비 특별 시험 - 디테일이 바뀐 문제.png>) | 점근 표기·상한과 하한 |
| 84 | T23 | 1 | [1.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/1.jpg>) | 점근 표기·상한과 하한 |
| 85 | T23 | 2 | [2.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/2.jpg>) | 점근 표기·상한과 하한 |
| 86 | T23 | 3 | [3.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/3.jpg>) | 정렬·힙·선형 시간 정렬 |
| 87 | T23 | 4 | [4.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/4.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 88 | T23 | 5 | [5.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/5.jpg>) | 점근 표기·상한과 하한 |
| 89 | T23 | 6 | [6.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/6.jpg>) | 정렬·힙·선형 시간 정렬 |
| 90 | T23 | 7 | [7.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/7.jpg>) | 평균 선형 선택·최악 선형 선택 |
| 91 | T23 | 8 | [8.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/8.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 92 | T23 | 9 | [9.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/9.jpg>) | 정렬·힙·선형 시간 정렬 |
| 93 | T23 | 10 | [10.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/10.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 94 | T23 | 11 | [11.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/11.jpg>) | 정렬·힙·선형 시간 정렬 |
| 95 | T23 | 12 | [12.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/12.jpg>) | 재귀 비용·점화식·마스터 정리 |
| 96 | T23 | 13 | [13.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/13.jpg>) | 돌 놓기·패턴 상태 |
| 97 | T23 | 14 | [14.jpg](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/T23/14.jpg>) | 행렬 최대 합 경로와 응용 |
| 98 | F22 | 2 | [2.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/2.png>) | 모든 쌍 최단경로·거리 DP |
| 99 | F22 | 3 | [3.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/3.png>) | 모든 쌍 최단경로·거리 DP |
| 100 | F22 | 4 | [4.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/4.png>) | 모든 쌍 최단경로·거리 DP |
| 101 | F22 | 5 | [5.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/5.png>) | 모든 쌍 최단경로·거리 DP |
| 102 | F22 | 7 | [6,7.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/6,7.png>) | 간선 수 제한 단일 시작점 최단경로 |
| 103 | F22 | 11 | [10, 11.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/10, 11.png>) | 돌 놓기·패턴 상태 |
| 104 | F22 | 12 | [12, 13.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/12, 13.png>) | 돌 놓기·패턴 상태 |
| 105 | F22 | 13 | [12, 13.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/12, 13.png>) | 행렬 최대 합 경로와 응용 |
| 106 | F22 | 14 | [14, 15.png](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/F22/14, 15.png>) | 행렬 최대 합 경로와 응용 |
| 107 | F23 | 4 | [2023 알고리즘 기말기출.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/2023 알고리즘 기말기출.pdf>) | 모든 쌍 최단경로·거리 DP |
| 108 | F23 | 6 | [2023 알고리즘 기말기출.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/2023 알고리즘 기말기출.pdf>) | 연쇄 행렬 곱셈 |
| 109 | F23 | 7 | [2023 알고리즘 기말기출.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/2023 알고리즘 기말기출.pdf>) | 행렬 최대 합 경로와 응용 |
| 110 | F23 | 8 | [2023 알고리즘 기말기출.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/2023 알고리즘 기말기출.pdf>) | 모든 쌍 최단경로·거리 DP |
| 111 | F23 | 9 | [2023 알고리즘 기말기출.pdf](<C:/Users/hoeiy/.codex/.chatgpt-projects/g-p-6ac466f964b88191a39221c9a09e2e0f/output/시험범위_1~5_족보/원본참조/2023 알고리즘 기말기출.pdf>) | 상태를 나누는 DP·돌 놓기 응용 |

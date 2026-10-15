import type { Question } from "@/types/question";
import { block, jokboOf } from "./jokboSource";

// 분할 정복 · 선택 — 족보 문항만(원문 그대로). 대조: docs/verification/algorithm-dc.md
const base = { subject: "algorithm", chapter: "dc", shuffle: false } as const;

const SELECT_CODE = block(
  "select(A, p, r, i)",
  "{",
  "    if (p = r) then return A[p];",
  "",
  "    q = partition(A, p, r);",
  "",
  "    k = q - p + 1;   ===> (1)",
  "",
  "    if (i < k) then return select(A, p, q-1, (4)) ===> (2)",
  "    else if (i = k) then return A[q];",
  "    else return select(A, q+1, r, (4)) ===> (3)",
  "}",
);
const LINEAR = (intro: string, g: number) =>
  `${intro} 선택 알고리즘인 linearSelect(A, p, r, i)는 입력 배열의 원소를 5개씩 묶어 그룹화한다. 이를 통해, 입력 배열이 항상 7:3의 비율로 분할이 되게 보장함으로써 최악의 경우에도 Θ(n)의 수행시간이 소요된다. 이 알고리즘을 ${g}개씩 묶어 그룹화하도록 바꾸는 경우에는 수행시간은 Θ(n)이 보장된다. ${g}개씩 묶어 그룹화 하는 경우, 입력 배열이 어떤 비율로 분할되게 보장해 주는가?`;
const TYPO = "원문 오타: linearSeletc → linearSelect.";

const questions: Question[] = [
  {
    ...base,
    ...jokboOf(["T22-17", "M21-4", "M22-15", "T23-7"], "jokbo"),
    id: "algorithm-dc-jokbo-001",
    topic: "평균 선형 선택",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec4 p.19-25",
    prompt: "우리 교재의 i번째 원소를 찾는 select(A, p, r, i) 알고리즘은 평균 Θ(n)의 수행 속도로 원하는 원소를 찾을 수 있다. 이 알고리즘의 입력으로 정렬이 되어 있는 배열이 주어지고 i번째 원소를 찾는 경우, 수행 속도는 어떻게 되는가?",
    choices: ["Θ(√n)", "Θ(√n logn)", "Θ(n)", "Θ(nlogn)", "Θ(n²)"],
    answerIndex: 4,
    explanation:
      "LMS 해설·교수 해설: 퀵정렬의 최악의 경우와 동일하므로, Θ(n²). select는 퀵 정렬과 같은 partition(마지막 원소가 피벗)을 쓰므로, 정렬된 입력에서는 매번 한쪽에 n−1개가 남아 Θ(n) + Θ(n−1) + … = Θ(n²)이 된다(Lec4 평균 선형 선택의 최악의 경우).",
  },
  {
    ...base,
    ...jokboOf(["T22-8", "M21-15"], "jokbo", "linear-select-group"),
    id: "algorithm-dc-jokbo-002",
    topic: "최악 선형 선택",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec4 p.26-38",
    prompt: LINEAR("우리 교재의 최악의 경우에도 선형시간을 보장하는", 7),
    choices: ["7: 3", "9: 1", "5: 2", "5: 5", "6: 4"],
    answerIndex: 2,
    explanation: `LMS 해설: 7개씩 그룹화를 할 경우, 입력 배열의 중간 값보다 큰 원소의 개수는 대략 4n/14, 즉, 10:4의 비율로 나누어짐(= 5:2). 중앙값들의 중앙값 M보다 작은 쪽에 반드시 남는 원소는 그룹의 절반 × 그룹당 4개 = 4n/14 = 2n/7이므로 큰 쪽은 많아야 5n/7 — 5:2(lib/sim/algorithm/sorting.ts linearSelectRatio). ${TYPO}`,
  },
  {
    ...base,
    ...jokboOf(["M23-15", "M22-14"], "jokbo", "linear-select-group"),
    id: "algorithm-dc-jokbo-003",
    topic: "최악 선형 선택",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec4 p.26-38",
    prompt: LINEAR("우리 수업의 최악의 경우에도 선형시간을 보장하는", 9),
    choices: ["9: 1", "9: 6", "13: 5", "5: 2", "7: 3"],
    answerIndex: 2,
    explanation: `교수 해설(2022 중간): 9개씩 그룹화를 할 경우, 입력 배열의 중간 값보다 큰 원소의 개수는 대략 5n/18, 즉, 13: 5의 비율로 나누어짐 — 그룹 n/9개 중 절반(n/18)이 M 이상의 중앙값을 갖고 각 그룹에서 5개씩이 M 이상이다. ${TYPO}`,
  },
  {
    ...base,
    ...jokboOf(["M21-16"], "jokbo", "select-rank"),
    id: "algorithm-dc-jokbo-004",
    topic: "평균 선형 선택",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec4 p.19-21",
    prompt: `아래의 코드는 우리 교재의 평균 선형 시간 선택 알고리즘이다. A = [12, 70, 50, 20, 55, 25, 40, 30, 65, 29] 에서 8번째 작은 원소를 찾는다고 가정하자. select(A, 1, 10, 8)이 호출되었을 때, (1)의 k값은 무엇이며, (2)와 (3) 번 중 어떤 것이 호출되며, 그 때, (4)의 값은 무엇인가? (주어진 배열의 인덱스는 1부터 시작이다.)\n${SELECT_CODE}`,
    choices: ["(1)은 4, (3) 호출, (4)는 4", "(1)은 4, (2) 호출, (4)는 4", "(1)은 4, (3) 호출, (4)는 8", "(1)은 4, (2) 호출, (4)는 8", "(1)은 5, (3) 호출, (4)는 4"],
    answerIndex: 0,
    explanation:
      "LMS 해설(정답 1): 29는 4번째로 큰 수이며, 8번째 수를 찾기 때문에 분할된 배열의 오른편을 찾아야 함. 그러므로 (3)를 호출하고, i는 4. 마지막 원소 29가 피벗이고 29 이하는 12·20·25라 q = 4, k = 4, i = 8 > k이므로 (3) select(A, 5, 10, 8 − 4 = 4). 원문 오타: select(A, 1, 10, 3) → select(A, 1, 10, 8)(\"8번째 작은 원소\"를 찾는 호출 — i = 3이면 (2) 호출·(4) = 3이라 맞는 보기가 없다).",
  },
  {
    ...base,
    ...jokboOf(["T22-20", "S22-9"], "jokbo", "select-rank"),
    id: "algorithm-dc-jokbo-005",
    topic: "평균 선형 선택",
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec4 p.19-21",
    prompt: `아래의 코드는 우리 교재의 평균 선형 시간 선택 알고리즘이다. A = [12, 70, 50, 20, 55, 25, 40, 30, 29, 65] 에서 3번째 작은 원소를 찾는다고 가정하자. select(A, 1, 10, 3)이 호출되었을 때, (1)의 k값은 무엇이며, (2)와 (3) 번 중 어떤 것이 호출되며, 그 때, (4)의 값은 무엇인가? (주어진 배열의 인덱스는 1부터 시작이다.)\n${SELECT_CODE}`,
    choices: ["(1)은 9, (2) 호출, (4)는 6", "(1)은 9, (2) 호출, (4)는 3", "(1)은 9, (3) 호출, (4)는 3", "(1)은 9, (3) 호출, (4)는 6", "(1)은 8, (2) 호출, (4)는 3"],
    answerIndex: 1,
    explanation: "LMS 해설(2022 중간 대비 테스트): 65는 9번째로 큰 수이며, 3번째 수를 찾기 때문에 분할된 배열의 왼편을 찾아야 함. 그러므로 (2)를 호출하고, i는 여전히 3. 피벗 65 이하가 8개라 q = 9, k = 9이고 i = 3 < k — 왼쪽으로 갈 때는 순위가 그대로다.",
  },
  {
    ...base,
    ...jokboOf(["M23-17", "M22-13"], "jokbo"),
    id: "algorithm-dc-jokbo-006",
    topic: "평균 선형 선택",
    type: "blank",
    difficulty: 3,
    slideRef: "Lec4 p.19-21",
    prompt: `배열 A[1, ..., 10]이 [12, 70, 50, 20, 55, 25, 40, 30, 65, 29] 로 되어 있을 경우, 아래의 그림은 select() 알고리즘을 이용하여, 8번째 작은 수를 찾는 과정을 순서대로 나열한 것이다. 각 단계의 빈칸에 들어갈 수를 차례대로 입력하라.\n${block(
      "[주의 사항]",
      "1. partition된 결과는 아래의 경우를 따른다.",
      "2. 숫자만 입력하고, 숫자사이에는 공백을 입력하지 마시오.",
      "",
      "[12, 70, 50, 20, 55, 25, 40, 30, 65, 29]",
      "select(A, 1, 10, 8)",
      "[12, 20, 25], 29, [70, 55, 50, 40, 30, 65]",
      "select(A, 5, 10, __)",
      "[55, 50, 40, 30], 65, [70]",
      "select(A, 5, 8, __)",
      "30, [55, 50, 40]",
      "select(A, 6, 8, __)",
      "40, [55, 50]",
      "select(A, 7, 8, __)",
      "50, [55]",
      "select(A, 8, 8, __)",
      "[55]",
      "return 55",
    )}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["44321"] }],
    explanation:
      "교수 해설(2022 중간, 정답 44321): 오른쪽으로 갈 때는 피벗을 포함해 버린 원소 수 k를 빼고, 왼쪽으로 갈 때는 순위를 그대로 둔다 — 8 − 4 = 4, (65가 5..10의 5번째라 왼쪽) 4, (30이 1번째라 오른쪽) 3, (40이 1번째) 2, (50이 1번째) 1. 2022 시험은 그림의 partition 결과가 실제 교재 partition과 달라 \"문제 오류: 모두 정답으로 인정\"됐고, 2023 시험은 [주의 사항] 1번으로 그림의 결과를 따르게 했다.",
  },
];

export default questions;

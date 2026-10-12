import type { Question } from "@/types/question";
import { block, jokboOf, N_HEAD, N_INPUTS } from "./jokboSource";

// 알고리즘 분석 · 점근 표기 — 족보 문항만(원문 그대로). 목록: docs/jokbo/algorithm/inventory.md, 대조: docs/verification/algorithm-analysis.md
const base = { subject: "algorithm", chapter: "analysis", shuffle: false } as const;
const YN = "이 물음에 대해 예(1) 또는 아니오(2)로 답하라.";

const questions: Question[] = [
  {
    ...base,
    ...jokboOf(["M21-1"], "jokbo", "nfact-bounds"),
    id: "algorithm-analysis-jokbo-001",
    topic: "상한·하한",
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec2 p.33-34",
    prompt: `${N_HEAD}\n${N_INPUTS}\n- 이 알고리즘의 수행 시간은 **Ω(logn)**이다 라고 말할 수 있는가? ${YN}`,
    choices: ["예", "아니오"],
    answerIndex: 0,
    explanation:
      "LMS 해설: 1, 2, 3은 Ω(logn)의 집합에 속한다. Lec2 p.33: Ω(g(n))은 적어도 g(n)의 비율로 증가하는 함수들의 집합(하한)이다. n log n, log n, n 모두 log n보다 느리게 증가하지 않으므로 모든 입력에 공통인 하한 Ω(log n)이 성립한다.",
  },
  {
    ...base,
    ...jokboOf(["M23-9", "M22-3"], "jokbo", "nfact-bounds"),
    id: "algorithm-analysis-jokbo-002",
    topic: "상한·하한",
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec2 p.33-34",
    prompt: `${N_HEAD}\n${N_INPUTS}\n- 이 알고리즘의 수행 시간은 **Ω(n)**이다 라고 말할 수 있는가? ${YN}`,
    choices: ["아니오", "예"],
    answerIndex: 0,
    explanation:
      "교수 해설(2022 중간): 2는 Ω(n)의 집합에 속하지 않는다. Lec2 p.33: f(n) = Ω(g(n))이려면 충분히 큰 모든 n에서 f(n) ≥ c·g(n)이어야 한다. 100개의 입력은 log n 시간이라 n보다 느리게 증가하므로, 모든 입력에 공통인 하한 Ω(n)은 성립하지 않는다.",
  },
  {
    ...base,
    ...jokboOf(["T23-2", "T22-1", "S22-14"], "jokbo", "nfact-bounds"),
    id: "algorithm-analysis-jokbo-003",
    topic: "상한·하한",
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec2 p.27-29",
    prompt: `${N_HEAD}\n${N_INPUTS}\n- 이 알고리즘의 수행 시간은 **O(n²)**이다 라고 말할 수 있는가? ${YN}`,
    choices: ["예", "아니오"],
    answerIndex: 0,
    explanation:
      "LMS 해설(2022 중간 대비 테스트): 1, 2, 3, 모두 O(n²) 집합에 속한다. Lec2 p.27-29: O(g(n))은 기껏해야 g(n)의 비율로 증가하는 함수들의 집합(상한) — n log n, log n, n은 모두 n²보다 빠르게 증가하지 않는다.",
  },
  {
    ...base,
    ...jokboOf(["M21-2"], "jokbo", "ten-inputs"),
    id: "algorithm-analysis-jokbo-004",
    topic: "상한·하한",
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec2 p.38-39",
    prompt:
      "어떤 알고리즘이 10개의 입력에 대해 n에 비례하는 시간이 소요되고, 나머지 모든 케이스에 대해서는 n log n에 비례하는 시간이 소요된다. 다음 질문에 예(1) 또는 아니오(2) 로 답하라.\n- \"이 알고리즘의 수행 시간이 **Θ(nlogn)** 이다\" 라고 말할 수 있는가?",
    choices: ["예", "아니오"],
    answerIndex: 1,
    explanation:
      "LMS 해설: 10개의 입력에 대해 n에 비례하는 함수는 Θ(nlogn)의 집합에 속하지 않음. Lec2 p.38: Θ(g(n)) = O(g(n)) ∩ Ω(g(n)) — n은 O(n log n)이지만 Ω(n log n)이 아니므로, 모든 입력에 공통인 Θ(n log n)은 말할 수 없다(상한 O(n log n)과 하한 Ω(n)은 성립).",
  },
  {
    ...base,
    ...jokboOf(["T23-1", "T22-2"], "jokbo", "ten-inputs"),
    id: "algorithm-analysis-jokbo-005",
    topic: "상한·하한",
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec2 p.33-34",
    prompt:
      "어떤 알고리즘이 10 개의 입력에 대해 n 에 비례하는 시간이 소요되고, 나머지 모든 케이스에 대해서는 n log n 에 비례하는 시간이 소요된다. 다음 질문에 예(1) 또는 아니오(2) 로 답하라.\n- \"이 알고리즘의 점근적 수행시간은 **Ω(n)**이다\" 라고 말할 수 있는가?",
    choices: ["예", "아니오"],
    answerIndex: 0,
    explanation: "LMS 해설(2022 중간 대비 테스트): c(n log n) 은 Ω(n)의 집합에 속함. 10개 입력의 n도 Ω(n)이므로 모든 입력에 공통인 하한 Ω(n)이 성립한다(Lec2 p.33).",
  },
  {
    ...base,
    ...jokboOf(["M23-24", "M22-4"], "jokbo"),
    id: "algorithm-analysis-jokbo-006",
    topic: "최악 시간과 O",
    type: "multi",
    difficulty: 2,
    slideRef: "Lec2 p.21·p.38",
    prompt: "어떤 알고리즘이 단 두 개의 입력에 대해서만 n²에 비례하는 시간이 소요되고, 나머지 모든 케이스에 대해서는 nlogn에 비례하는 시간이 소요된다. 다음 중 틀린 것을 모두 고르시오.",
    choices: [
      "이 알고리즘의 점근적인 수행 시간은 Θ(n²)이다.",
      "이 알고리즘의 점근적 수행 시간은 O(n²)이다.",
      "이 알고리즘의 최악의 경우 수행 시간은 O(n²)이다.",
      "\"알고리즘의 수행 시간이 최악의 경우 Θ(n²)이다\" 라는 말과 \"알고리즘의 수행 시간이 O(n²)이다\"라는 말은 같은 뜻이다.",
    ],
    answerIndexes: [0, 3],
    explanation:
      "교수 해설(2022 중간): 과제 1의 2장 연습 문제 1번 참조 — 정답 1, 4. 대부분의 입력은 n log n이므로 모든 입력에 공통인 Θ(n²)은 아니다(1 틀림). 모든 입력이 n² 이하이므로 O(n²)과 최악의 경우 O(n²)은 맞다(2·3). \"최악의 경우 Θ(n²)\"은 최악 입력에서 정확히 n² 정도라는 뜻이고 \"O(n²)\"은 상한만 말하므로 같은 뜻이 아니다(4 틀림, Lec2 p.21·p.38).",
  },
  {
    ...base,
    ...jokboOf(["M21-19"], "jokbo", "asym-relation"),
    id: "algorithm-analysis-jokbo-007",
    topic: "O·Ω·Θ 관계",
    type: "multi",
    difficulty: 2,
    slideRef: "Lec2 p.27-39",
    prompt: "n³(log n)² + 2n(log n)³ 과 관계 있는 것들을 선택하시오(중복 선택 가능).",
    choices: ["Ω(n²)", "Θ(n²)", "O(n⁴)", "Ω(n⁴)", "Θ(n⁴)"],
    answerIndexes: [0, 2],
    explanation:
      "LMS 해설: 충분히 큰 n에 대해, n³(log n)² + 2n(log n)³ < n⁴ 이므로, 1번, 3번의 집합에 속함. 최고차항 n³(log n)²은 n²보다 빨리, n⁴보다 느리게 증가하므로 Ω(n²)·O(n⁴)는 맞고 Θ(n²)·Ω(n⁴)·Θ(n⁴)는 아니다.",
  },
  {
    ...base,
    ...jokboOf(["T23-5", "T22-14", "S22-10"], "jokbo", "asym-relation"),
    id: "algorithm-analysis-jokbo-008",
    topic: "O·Ω·Θ 관계",
    type: "multi",
    difficulty: 2,
    slideRef: "Lec2 p.27-39",
    prompt: "(log n)²과 관계 있는 것들을 선택하시오(중복 선택 가능).",
    choices: ["Ω(n)", "Θ(n)", "O(n²)", "Ω(n²)", "Θ(n²)"],
    answerIndexes: [2],
    explanation:
      "LMS 해설(2022 중간 대비 테스트, 정답 3): 충분히 큰 n에 대해 (log n)² 은 n 보다 작으므로 O(n²)의 집합에 속함. (log n)²은 n보다도 느리게 증가하므로 Ω(n)·Θ(n)·Ω(n²)·Θ(n²)는 모두 아니다. 원문은 \"모두 선택\"형이지만 정답은 하나뿐이다.",
  },
  {
    ...base,
    ...jokboOf(["M23-13", "M22-5"], "jokbo"),
    id: "algorithm-analysis-jokbo-009",
    topic: "Big-O 포함 관계",
    type: "blank",
    difficulty: 1,
    slideRef: "Lec2 p.47",
    prompt: `다음의 리스트는 시간 복잡도의 대표적인 Big-Oh 함수들이다. 이 함수들의 포함 관계를 가장 작은 집합부터 큰 집합의 순서로 나열하라. (알파벳 문자만 나열하고, 문자와 문자 사이에 공백을 넣지 마시오.)\n${block("A) O(nlogn)", "B) O(n)", "C) O(logn)", "D) O(1)", "E) O(2ⁿ)", "F) O(n²)", "G) O(nᵏ)")}`,
    text: "답: {{0}}",
    blanks: [{ accept: ["DCBAFGE"] }],
    explanation:
      "교수 해설(2022 중간, 정답 DCBAFGE): 2장 수업자료의 O-표기의 포함 관계 그림 참조(Lec2 p.47) — O(1) ⊂ O(logn) ⊂ O(n) ⊂ O(nlogn) ⊂ O(n²) ⊂ O(nᵏ) ⊂ O(2ⁿ). nᵏ는 k가 2보다 큰 상수일 때 n²과 2ⁿ 사이에 놓인다.",
  },
];

export default questions;

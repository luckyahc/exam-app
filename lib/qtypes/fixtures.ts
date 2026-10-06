import type { Question } from "./registry";

/**
 * 데이터과학 코드 빈칸 예시(Sprint 12) — 코드는 source/data-science/Lec2.pdf s.21 [코드 2-13] 그대로(1칸 들여쓰기 포함).
 * 유형 예시 목록과 /playground 데이터과학 미리보기가 함께 쓴다.
 */
export const DS_CODE_BLANK_PYTHON: Question = {
  id: "data-science-lec2-demo-code-blank-001",
  subject: "data-science",
  chapter: "lec2",
  topic: "반복문 while·for·range",
  type: "code-blank",
  exam: false,
  difficulty: 1,
  slideRef: "Lec2 s.21",
  prompt: "**for 반복문으로 구구단 5단을 출력**하는 코드다. 빈칸을 채우시오.",
  language: "python",
  source: [
    "a = 5",
    "for i in {{0}}(1,10){{1}}",
    " print(str(a) + ' X ' + str(i) + ' = ' + str(i*a))",
    "print('while 조건문을 for 조건문으로 바꾸어 사용할 수 있다!')",
  ].join("\n"),
  blanks: [{ accept: ["range"], wrong: ["list"] }, { accept: [":"], wrong: [";"] }],
  verify: { mode: "run" },
  explanation:
    "s.21 [코드 2-13]: `range(1,10)`은 1부터 9까지를 차례로 꺼내고, for 줄 끝에는 콜론(`:`)이 있어야 한다. 콜론이 빠지면 SyntaxError로 실행되지 않는다(시험 채점 기준과 같음). 들여쓰기는 슬라이드처럼 1칸이어도 블록 안에서 일정하면 실행된다.",
  summary: "for 변수 in range(시작, 끝): — 끝 값은 포함하지 않고, 줄 끝 콜론 필수",
};

/**
 * 데이터과학 전체 작성형 예시(Sprint 13) — Lec2.pdf s.39~40 [코드 2-26]~[코드 2-28](합을 출력하는 함수 → 반환하는 함수).
 * 기대 출력은 모범 답안을 같은 엔진에서 실행해 얻고, checks로 반환값까지 확인한다.
 */
export const DS_CODE_WRITE_PYTHON: Question = {
  id: "data-science-lec2-demo-code-write-001",
  subject: "data-science",
  chapter: "lec2",
  topic: "함수(def·print vs return·매개변수·len)",
  type: "code-write",
  exam: false,
  difficulty: 2,
  slideRef: "Lec2 s.39-40",
  prompt: "리스트 `a`의 모든 수를 더한 값을 **반환**하는 함수 `sum_list_r(a)`를 정의하고, `list_a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`의 합을 출력하시오.",
  language: "python",
  starter: ["def sum_list_r(a):", "    "].join("\n"),
  solution: [
    "def sum_list_r(a):",
    "    j = 0",
    "    for i in a:",
    "        j = j + i",
    "    return j",
    "",
    "list_a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
    "print(sum_list_r(list_a))",
  ].join("\n"),
  python: { checks: ["sum_list_r([3, 4]) == 7", "sum_list_r([]) == 0"] },
  expect: { stdout: "55" },
  explanation:
    "s.39~40 [코드 2-26]~[코드 2-28]: `sum_list()`는 결과를 출력만 하고 끝나지만, `sum_list_r()`처럼 `return j`로 돌려주면 호출한 곳에서 값을 쓸 수 있다. 출력(55)과 함께 다른 리스트에서의 반환값도 검사한다.",
  summary: "함수 결과를 호출한 곳에서 쓰려면 return",
};

/**
 * 유형별 더미 문제 1개씩(대부분 subject: 'os', 코드 빈칸은 데이터과학). 실제 챕터 데이터가 아니라 문제 유형 엔진의 렌더링·채점
 * 확인용이며 /playground(유형 미리보기)와 테스트에서 쓴다. 내용은 원본 md §6·§7의 사실만 사용.
 */
export const QTYPE_FIXTURES: Question[] = [
  {
    id: "os-ch08-demo-mcq-001",
    subject: "os",
    chapter: "ch08",
    topic: "교체 알고리즘",
    type: "mcq",
    exam: true,
    examBasis: "handwritten",
    difficulty: 1,
    slideRef: "Ch08 p.42-49",
    prompt: "페이지 교체 알고리즘 중 **성능이 가장 좋지만 구현이 불가능한** 것은?",
    choices: ["FIFO", "LRU", "Optimal(OPT)", "Clock"],
    answerIndex: 2,
    explanation:
      "Optimal은 앞으로 가장 오랫동안 참조되지 않을 페이지를 교체하므로 폴트가 가장 적지만, 미래 참조를 알 수 없어 구현할 수 없다. LRU가 그다음이고 실무에서는 LRU 근사인 Clock을 쓴다. FIFO는 구현이 가장 단순하지만 성능이 좋지 않다.",
    summary: "OPT > LRU > Clock(LRU 근사) > FIFO",
  },
  {
    id: "os-ch03-demo-multi-001",
    subject: "os",
    chapter: "ch03",
    topic: "스택",
    type: "multi",
    exam: true,
    examBasis: "handwritten",
    difficulty: 2,
    slideRef: "Ch03 p.25",
    prompt: "프로세스의 **스택에 저장되는 것**을 모두 고르시오.",
    choices: [
      "함수 복귀 주소",
      "호출자가 넘긴 매개변수",
      "지역(자동)변수",
      "전역변수",
      "힙에 동적 할당된 메모리",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "스택에는 함수 복귀 주소, 매개변수, 지역(자동)변수가 저장된다. 전역변수는 data/bss 영역, 동적 할당 메모리는 힙에 있다.",
  },
  {
    id: "os-ch08-demo-ox-001",
    subject: "os",
    chapter: "ch08",
    topic: "Clock 알고리즘",
    type: "ox",
    exam: true,
    examBasis: "handwritten",
    difficulty: 2,
    slideRef: "Ch08 p.49",
    prompt:
      "Clock 알고리즘에서 페이지가 **참조(히트)될 때마다** next frame pointer가 다음 프레임으로 이동한다.",
    answer: false,
    falseReason:
      "히트 때는 use bit만 1로 바뀌고 pointer는 움직이지 않는다. pointer는 교체가 일어날 때만 이동한다.",
    explanation:
      "Clock 규칙: 참조 시 use=1, 교체 시 pointer부터 use=0인 페이지를 찾아 교체하고(지나치는 use=1은 0으로), 교체 후 pointer는 다음 프레임으로 간다.",
  },
  {
    id: "os-ch08-demo-blank-001",
    subject: "os",
    chapter: "ch08",
    topic: "스래싱",
    type: "blank",
    exam: false,
    difficulty: 1,
    slideRef: "Ch08 p.28-29",
    prompt: "빈칸에 알맞은 용어를 쓰시오.",
    text: "프로세스가 실제 실행보다 페이지 교체(스와핑)에 더 많은 시간을 쓰는 현상을 {{0}}이라 하고, 가상 메모리가 효율적으로 동작하는 근거인 ‘참조가 일부 영역에 몰리는’ 성질을 {{1}}이라 한다.",
    blanks: [
      { accept: ["스래싱", "쓰래싱", "Thrashing"] },
      { accept: ["지역성", "지역성의 원리", "Locality", "Principle of Locality"] },
    ],
    explanation:
      "스래싱(Thrashing)은 페이지 교체에 시간을 대부분 쓰는 상태다. 지역성(Locality)은 참조가 시간·공간적으로 일부 영역에 몰리는 성질로, 가상 메모리가 효율적으로 동작하는 근거다.",
  },
  {
    id: "os-ch03-demo-order-001",
    subject: "os",
    chapter: "ch03",
    topic: "프로세스 상태",
    type: "order",
    exam: false,
    difficulty: 1,
    slideRef: "Ch03 p.12-13",
    prompt:
      "새 프로그램이 실행되어 끝날 때까지 거치는 상태를 순서대로 배치하시오(중간에 I/O 대기 없음).",
    items: ["New", "Ready", "Running", "Exit"],
    explanation:
      "New(메모리로 옮겨 준비) → Ready(CPU만 주어지면 실행 가능) → Running(dispatch) → Exit(정상 종료).",
  },
  {
    id: "os-ch07-demo-match-001",
    subject: "os",
    chapter: "ch07",
    topic: "배치 알고리즘",
    type: "match",
    exam: true,
    examBasis: "handwritten",
    difficulty: 2,
    slideRef: "Ch07 p.15-19",
    prompt: "동적 분할 배치 알고리즘과 특징을 짝지으시오.",
    pairs: [
      { left: "First-fit", right: "처음부터 훑어 충분히 큰 첫 블록, 가장 단순·빠름" },
      { left: "Best-fit", right: "요청 크기에 가장 가까운 블록, 미세 조각을 가장 많이 양산" },
      { left: "Next-fit", right: "마지막 배치 위치부터 훑고 끝까지 가면 처음으로 돌아감" },
      { left: "Worst-fit", right: "가장 큰 블록 할당, 큰 요청 실패가 늘어 권장 안 됨" },
    ],
    explanation:
      "슬라이드 기준 속도는 first ≈ next > best ≥ worst이며, Best-fit이 성능이 가장 좋다는 것은 오개념이다.",
  },
  {
    id: "os-ch03-demo-classify-001",
    subject: "os",
    chapter: "ch03",
    topic: "상태 전이",
    type: "classify",
    exam: true,
    examBasis: "handwritten",
    difficulty: 2,
    slideRef: "Ch03 p.12-13",
    prompt: "각 사건이 일으키는 상태 전이를 고르시오.",
    buckets: ["Running→Ready", "Running→Blocked", "Blocked→Ready"],
    items: [
      { label: "타임슬라이스 소진(Clock interrupt)", bucket: "Running→Ready" },
      { label: "scanf 같은 I/O 함수 호출", bucket: "Running→Blocked" },
      { label: "기다리던 데이터 도착(I/O interrupt)", bucket: "Blocked→Ready" },
      { label: "Memory fault", bucket: "Running→Blocked" },
    ],
    explanation:
      "Clock interrupt는 Running→Ready, I/O 호출·Memory fault는 Running→Blocked, I/O interrupt는 Blocked→Ready로 전이시킨다.",
  },
  {
    id: "os-ch02-demo-calc-001",
    subject: "os",
    chapter: "ch02",
    topic: "응답시간",
    type: "calc",
    exam: true,
    examBasis: "handwritten",
    difficulty: 2,
    slideRef: "Ch02 p.21",
    prompt:
      "프로그램 10개(각 1초, I/O 없음), 내 프로그램은 마지막, 스위칭 0.01초, 0.1초마다 출력할 때 **시분할(타임슬라이스 0.1초)**의 첫 응답시간은?",
    answer: 1.1,
    tolerance: 0.005,
    unit: "초",
    steps: ["(N−1)×(q+s) + s + 0.1", "= 9 × (0.1 + 0.01) + 0.01 + 0.1", "= 0.99 + 0.11 = 1.1초"],
    explanation:
      "시분할 첫 응답 = (N−1)(q+s) + s + 0.1. 같은 조건의 다중프로그램 일괄처리는 9.2초로 훨씬 길다.",
  },
  {
    id: "os-ch08-demo-trace-001",
    subject: "os",
    chapter: "ch08",
    topic: "FIFO",
    type: "trace",
    exam: true,
    examBasis: "handwritten",
    difficulty: 3,
    slideRef: "Ch08 p.48",
    prompt:
      "프레임 3개, 참조열 2 3 2 1 5 에 대한 **FIFO** 진행 표의 빈칸을 채우시오. (F = 프레임이 처음 다 채워진 뒤의 페이지 폴트, F가 아니면 -)",
    columns: ["2", "3", "2", "1", "5"],
    rows: [
      {
        label: "프레임 1",
        cells: [
          { value: "2" },
          { value: "2" },
          { value: "2" },
          { value: "2" },
          { value: "5", blank: true },
        ],
      },
      {
        label: "프레임 2",
        cells: [
          { value: "" },
          { value: "3" },
          { value: "3" },
          { value: "3", blank: true },
          { value: "3" },
        ],
      },
      {
        label: "프레임 3",
        cells: [{ value: "" }, { value: "" }, { value: "" }, { value: "1" }, { value: "1" }],
      },
      {
        label: "F",
        cells: [
          { value: "-" },
          { value: "-" },
          { value: "-", blank: true, options: ["F", "-"] },
          { value: "-" },
          { value: "F", blank: true, options: ["F", "-"] },
        ],
      },
    ],
    explanation:
      "2·3 적재 후 2는 히트, 1은 빈 프레임에 적재 — 여기까지는 프레임을 처음 채우는 중이라 F가 아니다. 5는 프레임이 가득 찬 뒤의 폴트(F)이며 가장 먼저 들어온 2를 교체한다(Figure 8.15 집계 규칙).",
  },
  {
    id: "os-ch08-demo-graph-001",
    subject: "os",
    chapter: "ch08",
    topic: "스래싱",
    type: "graph",
    exam: true,
    examBasis: "handwritten",
    difficulty: 2,
    slideRef: "Ch08 p.60-62",
    prompt: "멀티프로그래밍 수준(프로세스 수)에 따른 **CPU 이용률**을 바르게 나타낸 그래프는?",
    xLabel: "멀티프로그래밍 수준",
    yLabel: "CPU 이용률",
    options: [
      {
        key: "a",
        label: "계속 증가",
        figure: {
          kind: "curve",
          points: [
            [0, 0.05],
            [0.5, 0.5],
            [1, 0.95],
          ],
        },
      },
      {
        key: "b",
        label: "증가하다 어느 지점부터 급락",
        figure: {
          kind: "curve",
          points: [
            [0, 0.05],
            [0.3, 0.6],
            [0.55, 0.85],
            [0.7, 0.7],
            [1, 0.1],
          ],
        },
      },
      {
        key: "c",
        label: "계속 감소",
        figure: {
          kind: "curve",
          points: [
            [0, 0.9],
            [0.5, 0.5],
            [1, 0.1],
          ],
        },
      },
    ],
    answerKey: "b",
    explanation:
      "프로세스 수가 늘면 처음엔 CPU 이용률이 오르지만, 너무 많아지면 스래싱으로 페이지 교체에 시간을 쓰느라 급락한다.",
  },
  DS_CODE_BLANK_PYTHON,
  DS_CODE_WRITE_PYTHON,
];

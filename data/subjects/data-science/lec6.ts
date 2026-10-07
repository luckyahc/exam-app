import type { Question } from "@/types/question";
import type { VerifySpec } from "@/lib/qtypes/base";

// Lec6 넘파이 · 판다스 — 근거: source/data-science/Lec6.pdf(s.1~61, 실습·과제 안내 p.62~63과 빠진 s.64~71은 출제하지 않음)
// docs/ds-source-analysis.md §2 Lec6·부록 A·§4-3, docs/coverage-matrix.md 데이터과학 Lec6. ⭐ 없음. 해설은 "s.번호:"로 시작한다.
// 정답 기준은 슬라이드(Colab) — Pyodide와 다를 수 있는 출력(dtype·itemsize·nbytes 등)은 출력 문제로 내지 않는다(결정 15).
// 판다스 DataFrame·Series 통째 출력은 환경·화면 폭에 따라 표시가 달라질 수 있어 결과 고르기는 shape·len·셀 값·tolist()·평균 같은 값으로만.
// 판다스 df는 검증 때 python.setup(숨긴 준비 코드)으로 만든다 — 지문에 [코드 6-27](숫자형)·[코드 6-16](문자형) 데이터임을 밝힌다.
// 대조 기록 docs/verification/data-science-lec6.md

const base = { subject: "data-science", chapter: "lec6" } as const;
const plain = { exam: false } as const;
const py = (...lines: string[]) => lines.join("\n");

const ROWS = [
  "['허준호', '남자', 30, 183]",
  "['이가원', '여자', 24, 162]",
  "['배규민', '남자', 23, 179]",
  "['고고림', '남자', 21, 182]",
  "['이새봄', '여자', 28, 160]",
  "['이보람', '여자', 26, 163]",
  "['이루리', '여자', 24, 157]",
  "['오다현', '여자', 24, 172]",
];
/** [코드 6-27] 나이·키가 숫자인 df */
const DF_NUM = py(
  "import pandas as pd",
  `list1 = list([${ROWS.join(", ")}])`,
  "col_names = ['이름', '성별', '나이', '키']",
  "df = pd.DataFrame(list1, columns=col_names)",
);
/** [코드 6-16] 나이·키가 문자열인 df */
const DF_STR = py(
  "import pandas as pd",
  `list1 = list([${ROWS.map((r) => r.replace(/, (\d+), (\d+)\]/, ", '$1', '$2']")).join(", ")}])`,
  "col_names = ['이름', '성별', '나이', '키']",
  "df = pd.DataFrame(list1, columns=col_names)",
);

const NP: VerifySpec = { mode: "run", python: { packages: ["numpy"] } };
const NP_OUT: VerifySpec = {
  mode: "run",
  python: { packages: ["numpy"] },
  check: { kind: "output", lineSep: " → " },
};
const PD = (setup = DF_NUM): VerifySpec => ({
  mode: "run",
  python: { packages: ["numpy", "pandas"], setup },
});
const PD_OUT = (setup = DF_NUM): VerifySpec => ({
  mode: "run",
  python: { packages: ["numpy", "pandas"], setup },
  check: { kind: "output", lineSep: " → " },
});
const DF_NOTE = "(df는 [코드 6-27]의 데이터프레임: 8명의 이름·성별·나이·키, 나이와 키는 숫자)";
/** [코드 6-40] 문항 — [코드 6-33]으로 키를 고치기 전 원래 데이터임을 밝힌다(슬라이드 6-40 결과가 이 기준) */
const DF_ORIG_NOTE = "(df는 [코드 6-27]의 원래 데이터프레임 — [코드 6-33]으로 키를 고치기 전: 8명의 이름·성별·나이·키, 나이와 키는 숫자)";
const DF_STR_NOTE =
  "(df는 [코드 6-16]의 데이터프레임: 8명의 이름·성별·나이·키, 나이와 키는 문자열)";

const T = {
  numpy: "넘파이 정의·배열",
  dim: "차원(스칼라·벡터·행렬·텐서)·랭크·shape·ndarray",
  axis: "인덱싱과 축",
  slice: "슬라이싱",
  pandas: "판다스 정의·시리즈·데이터프레임 구성",
  feature: "넘파이·판다스 특징 비교",
  array: "array()·shape·인덱싱",
  create: "배열 생성 함수(zeros·ones·full·eye 등)",
  dtype: "dtype·astype",
  attr: "배열 속성(ndim·dtype·itemsize·size·nbytes·T·shape)",
  shape: "모양 변경(shape·flatten·resize·transpose/T)",
  mask: "마스킹·조건식 마스킹·randn",
  ufunc: "유니버설 함수·브로드캐스팅",
  copy: "얕은 복사 vs 깊은 복사",
  sort: "np.sort·sort()·argsort",
  series: "Series 생성",
  frame: "DataFrame 생성(리스트·딕셔너리·배열)",
  csv: "CSV 저장·읽기(to_csv·read_csv)",
  view: "columns·describe(문자열)·head·tail",
  order: "sort_index·sort_values",
  query: "조회([[ ]]·iloc·조건식·isin·&·|·str.contains)",
  stat: "describe(숫자 열)",
  loc: "loc로 갱신",
  struct: "set_index·열 생성·drop·reset_index·inplace",
  group: "groupby·mean·std·rename·merge",
} as const;

const questions: Question[] = [
  // ───────────────────────────── 1. 넘파이 정의·배열 (s.3)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-numpy-001",
    topic: T.numpy,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.3",
    prompt:
      "넘파이(NumPy)는 C 언어로 구현된 파이썬 라이브러리이며, 숫자 데이터를 포함한 벡터와 행렬 연산에 유용하다.",
    answer: true,
    explanation:
      "s.3: 넘파이는 **C 언어로 구현된 파이썬 라이브러리**이며 숫자 데이터를 포함한 벡터와 행렬 연산에 유용하다. 설치되어 있지 않으면 pip로 설치한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-numpy-002",
    topic: T.numpy,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.3",
    prompt:
      "넘파이의 핵심 객체인 배열은 같은 자료형인 데이터를 메모리에 물리적으로 연속 할당하여 인덱스로 데이터에 접근하기 편리하다.",
    answer: true,
    explanation:
      's.3: 배열은 넘파이의 핵심 객체로, **같은 자료형**인 데이터를 메모리에 **물리적으로 연속 할당**하여 인덱스로 접근하기 편리하다. 같은 문장 끝의 필기 "리스트 vs 배열"은 이 점에서 리스트와 배열을 비교한 것이다(수업 필기 기준).',
  },

  // ───────────────────────────── 2. 차원·랭크·shape·ndarray (s.4~5)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-dim-001",
    topic: T.dim,
    type: "match",
    difficulty: 1,
    slideRef: "Lec6 s.4",
    prompt: "넘파이 배열의 차원과 이름을 바르게 짝지으시오.",
    pairs: [
      { left: "스칼라(Scalar)", right: "0차원 배열 — 하나의 실수를 담는 가장 기본 단위" },
      { left: "벡터(Vector)", right: "1차원 배열 — 스칼라 여러 개를 나열한 튜플" },
      { left: "행렬(Matrix)", right: "2차원 배열 — 1차원 배열을 여러 개 묶은 배열" },
      { left: "텐서(Tensor)", right: "벡터의 집합 — 3차원 이상의 배열" },
    ],
    explanation:
      "s.4: 스칼라는 0차원, 벡터는 1차원(스칼라 여러 개를 나열한 튜플), 행렬은 2차원(1차원 배열 여러 개), 텐서는 벡터의 집합으로 3차원 이상의 배열은 모두 텐서다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-dim-002",
    topic: T.dim,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec6 s.5",
    prompt: "빈칸에 들어갈 말을 쓰시오.",
    text: "배열의 {{0}}(Rank)는 차원(Dimension)의 수이고, {{1}}(Shape)은 배열의 차원과 크기를 나타낸다.",
    blanks: [{ accept: ["랭크", "Rank", "rank"] }, { accept: ["모양", "Shape", "shape"] }],
    explanation:
      "s.5: 배열의 **랭크(Rank)**는 차원의 수, **모양(Shape)**은 배열의 차원과 크기를 나타낸다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-dim-003",
    topic: T.dim,
    type: "multi",
    difficulty: 1,
    slideRef: "Lec6 s.5",
    prompt: "넘파이의 다차원 배열 객체 **ndarray**에 대한 설명으로 옳은 것을 모두 고르시오.",
    choices: [
      "자료형이 모두 같은 데이터를 담은 다차원 배열이다",
      "정수 또는 실수(부동 소수점 수)를 저장한다",
      "배열 데이터에도 순서가 있으므로 인덱싱과 슬라이싱이 가능하다",
      "서로 다른 자료형의 데이터를 섞어 담는다",
      "1차원 데이터만 담을 수 있다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.5: ndarray(N-dimensional array)는 ① 자료형이 모두 같은 데이터를 담은 다차원 배열 ② 정수 또는 실수를 저장 ③ 순서가 있어 인덱싱·슬라이싱이 가능하다.",
  },

  // ───────────────────────────── 3. 인덱싱과 축 (s.6)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-axis-001",
    topic: T.axis,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec6 s.6",
    prompt: "빈칸에 들어갈 말을 쓰시오.",
    text: "배열이 2차원이면 대괄호 안에서 {{0}} 다음에 콤마(,)를 찍고 {{1}}의 인덱스를 붙인다.",
    blanks: [{ accept: ["행"] }, { accept: ["열"] }],
    explanation:
      "s.6: 2차원 배열은 대괄호 안에서 **행** 다음에 콤마를 찍고 **열**의 인덱스를 붙인다(예: a[1,0]). 3차원이면 면, 행, 열 순으로 붙인다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-axis-002",
    topic: T.axis,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.6·s.14",
    prompt:
      "2차원 배열 b에서 **2행 3열(인덱스 1행 2열)**의 값 6을 출력하도록 빈칸에 인덱스를 채우시오.",
    language: "python",
    source: py("import numpy as np", "b = np.array([[1, 2, 3], [4, 5, 6]])", "print(b[{{0}}])"),
    blanks: [{ accept: ["1, 2"], wrong: ["2, 3", "2, 1"] }],
    verify: NP,
    explanation:
      "s.6: 2차원 배열은 대괄호 안에 행 인덱스, 콤마, 열 인덱스 순으로 쓰고 인덱스는 0부터다. 값 6은 1행 2열이라 `b[1, 2]`다(띄어쓰기는 상관없음). b[2, 3]은 범위를 벗어나 IndexError, b[2, 1]도 행 범위 밖이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-axis-003",
    topic: T.axis,
    type: "classify",
    difficulty: 2,
    slideRef: "Lec6 s.6",
    prompt: "s.6 그림 (b) 3차원 배열에서 각 축 방향으로 증가하는 인덱스를 분류하시오.",
    buckets: ["0번 축", "1번 축", "2번 축"],
    items: [
      { label: "면 인덱스", bucket: "0번 축" },
      { label: "행 인덱스", bucket: "1번 축" },
      { label: "열 인덱스", bucket: "2번 축" },
    ],
    explanation:
      "s.6: 배열의 축은 인덱스가 증가하는 방향이다. (a) 2차원에서는 0번 축 방향으로 행 인덱스가 증가하고, (b) 3차원에서는 0번 축 방향으로 면, 1번 축 방향으로 행, 2번 축 방향으로 열 인덱스가 증가한다.",
  },

  // ───────────────────────────── 4. 슬라이싱 (s.7~8)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-slice-001",
    topic: T.slice,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.7-8",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py(
        "import numpy as np",
        "a = np.array([[0, 1, 2], [3, 4, 5], [6, 7, 8]])",
        "print(a[:2, :2].tolist())",
      ),
    },
    choices: [
      "[[0, 1], [3, 4]]",
      "[[0, 1, 2], [3, 4, 5], [6, 7, 8]]",
      "[[4, 5], [7, 8]]",
      "[[0, 1, 2], [3, 4, 5]]",
    ],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.8 그림 (a): `a[:2, :2]`는 콜론과 숫자로 처음과 끝 지점을 정해 0~1행, 0~1열을 잘라 낸다(끝 인덱스 2는 포함하지 않음). (보충) tolist( )는 배열을 리스트로 바꿔 출력 모양을 한 줄로 고정하려고 붙였다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-slice-002",
    topic: T.slice,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec6 s.7-8",
    prompt: "3행 3열 배열 a에 대한 s.8 그림의 슬라이싱 설명으로 **옳은 것**을 모두 고르시오.",
    choices: [
      "a[:2, :2]는 0~1행의 0~1열을 선택한다",
      "a[:, 1:]는 모든 행의 1열부터 끝까지를 선택한다",
      "a[0]은 a[0, :] 또는 a[:1, :]로도 표현할 수 있다",
      "a[:2, :2]는 끝 인덱스 2까지 포함해 3행 3열을 선택한다",
      "행이나 열 전체를 선택할 때도 반드시 숫자를 써야 한다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      's.8: 콜론과 숫자를 함께 써서 처음과 끝 지점을 정하고(끝은 포함하지 않음), 열이나 행 전체를 선택하려면 숫자 대신 콜론을 쓴다. 그림 (c)처럼 a[0]은 a[0, :], a[:1, :]로도 표현 가능하다. s.7: 2차원 이상이면 행의 인덱스인지 열의 인덱스인지 주의해야 한다(필기 "행,열" — 수업 필기 기준).',
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-slice-003",
    topic: T.slice,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.8",
    prompt: "s.8 그림 (b)처럼 **모든 행의 1열부터 끝까지**를 선택하도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "a = np.array([[0, 1, 2], [3, 4, 5], [6, 7, 8]])",
      "print(a[{{0}}, 1:])",
    ),
    blanks: [{ accept: [":"], wrong: ["0"] }],
    verify: NP,
    explanation:
      "s.8: 열이나 행 전체를 선택하려면 숫자 대신 **콜론(:)**을 쓴다 — 그림 (b) `a[:, 1:]`. 0을 쓰면 0행 하나만 선택된다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-slice-004",
    topic: T.slice,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.8",
    prompt: "s.8 그림 (a)처럼 **0~1행의 0~1열**을 선택하도록 빈칸에 슬라이스를 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "a = np.array([[0, 1, 2], [3, 4, 5], [6, 7, 8]])",
      "print(a[{{0}}])",
    ),
    blanks: [
      {
        accept: [":2, :2", "0:2, 0:2"],
        wrong: [":3, :3", "2, 2"],
        candidates: ["0:2, 0:2", ":3, :3"],
      },
    ],
    verify: NP,
    explanation:
      "s.8 그림 (a): `a[:2, :2]` — 콜론 앞이 비면 처음부터, 2는 끝 지점(포함하지 않음)이다. (보충) 시작 0을 적은 0:2도 같은 슬라이스라 허용 답안에 넣었다(검증 파이프라인). a[2, 2]는 값 하나(8)다.",
  },

  // ───────────────────────────── 5. 판다스·시리즈·데이터프레임 (s.9~10)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-pandas-001",
    topic: T.pandas,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec6 s.9",
    prompt: "빈칸에 들어갈 말을 쓰시오.",
    text: "{{0}}(Series)는 인덱스와 값이 한 쌍을 이루는 1차원 자료구조 객체다.",
    blanks: [{ accept: ["시리즈", "Series"] }],
    explanation:
      "s.9: **시리즈(Series)**는 인덱스와 값이 한 쌍을 이루는 1차원 자료구조 객체다. 판다스는 데이터프레임 자료구조를 제공하는 파이썬의 핵심 패키지다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-pandas-002",
    topic: T.pandas,
    type: "match",
    difficulty: 1,
    slideRef: "Lec6 s.10",
    prompt: "데이터프레임의 구성 요소와 뜻을 바르게 짝지으시오.",
    pairs: [
      { left: "행 인덱스", right: "가로줄인 행(Row)을 구분하는 고유한 인덱스" },
      { left: "열 이름", right: "세로줄인 열(Column)을 구분하는 이름" },
      { left: "값(Value)", right: "행과 열이 교차하는 곳에 저장되는 데이터" },
    ],
    explanation:
      "s.10: 데이터프레임은 판다스의 기본 자료구조로 시리즈 여러 개를 묶어 만들며, 행 인덱스·열 이름(또는 열 인덱스)·값으로 구성된다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-pandas-003",
    topic: T.pandas,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.9",
    prompt:
      "리스트는 값만 있고 인덱스가 0부터 자동 생성되지만, 시리즈는 사용자가 직접 인덱스를 정할 수 있다.",
    answer: true,
    explanation:
      "s.9: 리스트는 값만 있고 인덱스가 0부터 자동 생성되는 반면, 시리즈는 사용자가 **직접 인덱스를 정할 수 있다**([코드 6-12]의 index=['a', 'b', 'c']).",
  },

  // ───────────────────────────── 6. 넘파이·판다스 특징 (s.11~12)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-feature-001",
    topic: T.feature,
    type: "classify",
    difficulty: 2,
    slideRef: "Lec6 s.11-12",
    prompt: "강의 자료의 특징을 넘파이와 판다스로 분류하시오.",
    buckets: ["넘파이", "판다스"],
    items: [
      { label: "다차원 배열 객체 ndarray", bucket: "넘파이" },
      { label: "정교한 브로드캐스팅", bucket: "넘파이" },
      { label: "C, C++, 포트란 코드를 통합", bucket: "넘파이" },
      { label: "대용량 데이터 처리", bucket: "판다스" },
      { label: "시각적으로 알아보기 편리한 표 형태", bucket: "판다스" },
    ],
    explanation:
      "s.11 넘파이: 다차원 배열 객체·정교한 브로드캐스팅·C/C++/포트란 코드 통합·수학적 알고리즘 제공. s.12 판다스: 대용량 데이터 처리·표 형태·데이터 분석 도구(결측치 처리·관계 연산·시계열).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-feature-002",
    topic: T.feature,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec6 s.11-12",
    prompt: "강의 자료에서 **판다스**가 제공하는 데이터 분석 도구로 든 것을 모두 고르시오.",
    choices: ["결측치 처리", "관계 연산", "시계열", "푸리에 변환", "선형대수의 함수"],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.12: 판다스 기능 중 데이터 분석에 자주 쓰는 것은 결측치 처리, 관계 연산, 시계열이다. 선형대수의 함수·푸리에 변환·난수 기능은 넘파이의 수학적 알고리즘이다(s.11).",
  },

  // ───────────────────────────── 7. array()·shape·인덱싱 (s.14)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-array-001",
    topic: T.array,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.14",
    prompt:
      "[코드 6-1] 넘파이를 **np라는 별칭으로 가져와** 리스트를 배열로 변환하는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "{{0}} numpy {{1}} np",
      "",
      "#리스트를 생성하고 배열로 변환하기",
      "list1 = [1, 2, 3, 4]",
      "a = np.{{2}}(list1)",
      "print('a.shape: ', a.shape)",
    ),
    blanks: [
      { accept: ["import"], wrong: ["from"] },
      { accept: ["as"], wrong: ["is"] },
      { accept: ["array"], wrong: ["list"] },
    ],
    verify: NP,
    explanation:
      "s.14 [코드 6-1]: `import numpy as np`로 넘파이를 np라는 이름으로 가져오고, `np.array(list1)`로 리스트를 배열로 변환한다(배열 생성 함수 표 — s.15). (보충) 슬라이드 실행결과의 `(2,3)`·`[1, 2, 3]` 표기는 실제 출력 `(2, 3)`·`[1 2 3]`과 다르다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-array-002",
    topic: T.array,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.14",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py(
        "import numpy as np",
        "",
        "#2차원 배열 생성하기",
        "b = np.array([[1, 2, 3], [4, 5, 6]])",
        "print('b.shape: ', b.shape)",
      ),
    },
    choices: ["b.shape:  (2, 3)", "b.shape:  (3, 2)", "b.shape:  6", "b.shape:  (2,)"],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.14 [코드 6-1]: b는 2행 3열 배열이라 shape는 (2, 3)이다. (보충) 슬라이드 실행결과에는 `b.shape: (2,3)`처럼 쉼표 뒤 공백이 없지만 실제 출력은 `(2, 3)`이다(표기 차이). print에 두 값을 넘겨 콜론 뒤 공백이 두 칸이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-array-003",
    topic: T.array,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.14",
    prompt: "[코드 6-1] 배열 a의 **모양**과 **첫 번째 요소**를 출력하도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "list1 = [1, 2, 3, 4]",
      "a = np.array(list1)",
      "print('a.shape: ', a.{{0}})",
      "print('a[0]: ', a[{{1}}])",
    ),
    blanks: [
      { accept: ["shape"], wrong: ["size"] },
      { accept: ["0"], wrong: ["1"] },
    ],
    verify: NP,
    explanation:
      "s.14 [코드 6-1]: `a.shape`는 (4,), `a[0]`은 첫 번째 요소 1이다. size는 요소 개수(4)라 출력이 다르다(s.19). (보충) 슬라이드 실행결과의 `b.shape: (2,3)` 표기는 실제 `(2, 3)`과 다르다.",
  },

  // ───────────────────────────── 8. 배열 생성 함수 (s.15~16)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-create-001",
    topic: T.create,
    type: "match",
    difficulty: 1,
    slideRef: "Lec6 s.15",
    prompt: "s.15 '넘파이 배열을 생성하는 함수' 표의 함수와 설명을 바르게 짝지으시오.",
    pairs: [
      {
        left: "`arange()`",
        right: "일정한 간격의 수를 ndarray 배열로 반환(파이썬의 range 함수와 유사)",
      },
      { left: "`zeros()`", right: "0으로 채운 n차원 배열을 생성" },
      { left: "`ones()`", right: "1로 채운 n차원 배열을 생성" },
      {
        left: "`eye()`",
        right: "대각선 요소에만 1을 채우고 그 외에는 0으로 채운 2차원 배열을 생성",
      },
      { left: "`full()`", right: "지정한 모양에 지정한 값으로 채운 배열을 생성" },
    ],
    explanation:
      "s.15 표: array 리스트를 배열로 변환, arange 일정한 간격의 수(range와 유사), ones 1로 채움, zeros 0으로 채움, empty 초기화하지 않은 빈 배열, eye(identity) 대각선만 1, linspace 초깃값~최종값을 지정한 간격의 수로, full 지정한 값으로 채움.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-create-002",
    topic: T.create,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.16",
    prompt:
      "[코드 6-2] 0으로 채운 2×2 배열, **5로 채운** 2×3 배열, **대각선만 1인** 3×3 배열을 만드는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "b = np.{{0}}((2,2))",
      "print('b\\n', b)",
      "d = np.{{1}}((2,3), 5)",
      "print('d\\n', d)",
      "e = np.{{2}}(3)",
      "print('e\\n', e)",
    ),
    blanks: [
      { accept: ["zeros"], wrong: ["ones"] },
      { accept: ["full"], wrong: ["ones"] },
      { accept: ["eye", "identity"], wrong: ["zeros"], candidates: ["identity"] },
    ],
    verify: NP,
    explanation:
      "s.16 [코드 6-2]: `np.zeros((2,2))`는 0으로, `np.full((2,3), 5)`는 지정한 값 5로, `np.eye(3)`은 대각선 요소에만 1을 채운 배열을 만든다. s.15 표의 `eye( ) 또는 identity( )`대로 identity(3)도 같은 결과라 허용 답안에 넣었다(검증 파이프라인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-create-003",
    topic: T.create,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec6 s.16",
    prompt: "다음 코드의 **실행 결과**는?",
    code: { language: "python", source: py("import numpy as np", "a = np.zeros(2)", "print(a)") },
    choices: ["[0. 0.]", "[0 0]", "[2. 2.]", "[[0. 0.] [0. 0.]]"],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.16 [코드 6-2]: `np.zeros(2)`는 0으로 채운 요소 2개짜리 1차원 배열이고, 슬라이드 실행결과처럼 실수 0이 `[0. 0.]`로 출력된다. 2×2 배열은 np.zeros((2,2))다.",
  },

  // ───────────────────────────── 9. dtype·astype (s.17)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-dtype-001",
    topic: T.dtype,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.17",
    prompt: "실수형 배열을 만들고 **정수형 배열로 변환**하는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "",
      "#실수형 배열 생성하기",
      "a = np.array([1, 2], {{0}}=np.float64)",
      "print(a.dtype)",
      "",
      "#정수형 배열로 변환하기",
      "a_i8 = a.{{1}}(np.int8)",
      "print(a_i8.dtype)",
    ),
    blanks: [
      { accept: ["dtype"], wrong: ["type"] },
      { accept: ["astype"], wrong: ["dtype"] },
    ],
    verify: NP,
    explanation:
      "s.17: 배열을 만들 때 `dtype=np.float64`로 자료형을 정하고(출력 float64), `astype(np.int8)`로 다른 자료형의 배열로 변환한다(출력 int8). 슬라이드 코드 번호는 [코드 6-2]가 두 번 인쇄되어 있다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-dtype-002",
    topic: T.dtype,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.17",
    prompt: "s.17에서 `a.astype(np.int8)`은 실수형 배열 a를 정수형 배열로 변환한다.",
    answer: true,
    explanation:
      "s.17: 실수형 배열 a(`dtype=np.float64`)를 `astype(np.int8)`로 **정수형 배열로 변환**해 a_i8에 담는다. a_i8.dtype은 int8이다.",
  },

  // ───────────────────────────── 10. 배열 속성 (s.18~20)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-attr-001",
    topic: T.attr,
    type: "match",
    difficulty: 1,
    slideRef: "Lec6 s.19",
    prompt: "ndarray의 속성과 뜻을 바르게 짝지으시오.",
    pairs: [
      { left: "`ndim`", right: "배열의 차원(number of dimensions)" },
      { left: "`itemsize`", right: "요소의 바이트 수" },
      { left: "`size`", right: "요소의 개수" },
      { left: "`nbytes`", right: "배열 전체의 바이트 수" },
      { left: "`T`", right: "2차원 배열의 행과 열을 바꾼 교체 배열" },
    ],
    explanation:
      "s.19: ndim은 'number of dimensions'로 차원, itemsize는 요소의 바이트 수, size는 요소의 개수, nbytes는 배열 전체의 바이트 수, shape는 모양, T는 행과 열을 바꾼 교체 배열이다. 속성은 `객체.속성`으로 호출한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-attr-002",
    topic: T.attr,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.19-20",
    prompt: "[코드 6-4] 배열 arr의 **차원**과 **요소의 개수**를 출력하도록 속성 이름을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "arr = np.array([[0, 1, 2], [3, 4, 5]])",
      "",
      "print('arr.ndim:',arr.{{0}})",
      "print('arr.size:',arr.{{1}})",
    ),
    blanks: [
      { accept: ["ndim"], wrong: ["shape"] },
      { accept: ["size"], wrong: ["ndim"] },
    ],
    verify: NP,
    explanation:
      "s.19~20 [코드 6-4]: `arr.ndim`은 차원 2, `arr.size`는 요소 개수 6이다. (보충) 같은 코드의 dtype·itemsize·nbytes는 슬라이드(64비트 PC)에서 int64·8·48이지만, 이 앱의 실행 엔진(Pyodide, wasm32)에서는 int32·4·24로 나올 수 있어 출력 문제로 내지 않는다(플랫폼 차이 — 결정 15).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-attr-003",
    topic: T.attr,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.19-20",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py(
        "import numpy as np",
        "arr = np.array([[0, 1, 2], [3, 4, 5]])",
        "print(arr.ndim, arr.size, arr.shape)",
      ),
    },
    choices: ["2 6 (2, 3)", "6 2 (2, 3)", "2 6 (3, 2)", "2 3 (2, 3)"],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.19~20 [코드 6-4]: arr은 2행 3열이라 ndim(차원) 2, size(요소 개수) 6, shape(모양) (2, 3)이다. (보충) 같은 코드의 itemsize·nbytes 값은 실행 환경의 정수 크기(int64·int32)에 따라 달라져 이 문제에 넣지 않았다(플랫폼 차이).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-attr-004",
    topic: T.attr,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.19-20",
    prompt:
      "[코드 6-4]의 슬라이드 실행결과에서 arr.itemsize가 8, arr.size가 6일 때 **arr.nbytes**의 값은?",
    choices: ["48", "8", "6", "14"],
    answerIndex: 0,
    explanation:
      "s.19: itemsize는 요소 하나의 바이트 수, size는 요소의 개수, nbytes는 배열 전체의 바이트 수이므로 8 × 6 = 48이다(s.20 실행결과 arr.nbytes: 48). (보충) 슬라이드는 64비트 PC 기준(int64)이고, Pyodide(wasm32)에서는 int32라 itemsize 4·nbytes 24로 나올 수 있다(플랫폼 차이).",
  },

  // ───────────────────────────── 11. 모양 변경 (s.21~23)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-shape-001",
    topic: T.shape,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.21-22",
    prompt:
      "[코드 6-5] 0~7의 1차원 배열을 만들고, **2행 4열로 모양을 바꾼** 뒤 다시 **1차원으로 펼쳐** 출력하는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "#1차원 배열 생성하기",
      "a = np.{{0}}(8)",
      "print('a\\n', a)",
      "",
      "#다차원 배열로 변경하기",
      "a.{{1}} = (2,4)",
      "print('shape\\n', a)",
      "",
      "#1차원 배열로 변경하기",
      "print('flatten\\n', a.{{2}}( ))",
    ),
    blanks: [
      { accept: ["arange"], wrong: ["array"] },
      { accept: ["shape"], wrong: ["size"] },
      { accept: ["flatten"], wrong: ["resize"] },
    ],
    verify: NP,
    explanation:
      "s.21: 전체 요소 개수를 유지하면서 shape 속성에 튜플을 할당해 모양을 바꾼다(`객체.shape = (행 크기, 열 크기)`). s.22 [코드 6-5]: `np.arange(8)`은 0~7, `flatten( )`은 1차원 배열로 바꾼다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-shape-002",
    topic: T.shape,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.23",
    prompt: "[코드 6-6] 행렬의 **행과 열을 바꾸는** 두 가지 방법이다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "a = np.array([[0, 1, 2], [3, 4, 5]])",
      "",
      "b = a.{{0}}( )",
      "print('b\\n', b)",
      "c = a.{{1}}",
      "print('c\\n', c)",
    ),
    blanks: [
      { accept: ["transpose"], wrong: ["flatten"] },
      { accept: ["T"], wrong: ["t"] },
    ],
    verify: NP,
    explanation:
      "s.23 [코드 6-6]: `a.transpose( )`와 `a.T`는 모두 행과 열을 교차한 3행 2열 배열이다(s.19: T 속성은 행과 열을 바꾼 교체 배열). 속성 이름은 대문자 T다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-shape-003",
    topic: T.shape,
    type: "code-write",
    difficulty: 2,
    slideRef: "Lec6 s.22",
    prompt: "`a = np.arange(8)`로 만든 배열을 **resize 함수로 4행 2열**로 바꾼 뒤 a를 출력하시오.",
    language: "python",
    starter: "import numpy as np\na = np.arange(8)\n",
    solution: py("import numpy as np", "a = np.arange(8)", "a.resize((4,2))", "print(a)"),
    python: { packages: ["numpy"], checks: ["a.shape == (4, 2)"] },
    expect: { stdout: py("[[0 1]", " [2 3]", " [4 5]", " [6 7]]") },
    explanation:
      "s.22 [코드 6-5]: `a.resize((4,2))`는 배열 a 자체의 모양을 4행 2열로 바꾼다(실행결과 resize [[0 1] [2 3] [4 5] [6 7]]). a.shape = (4,2)로 써도 같은 결과다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-shape-004",
    topic: T.shape,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.21",
    prompt: "넘파이 배열은 전체 요소 개수를 유지하면서 모양을 변경할 수 있다.",
    answer: true,
    explanation:
      "s.21: 넘파이 배열의 **전체 요소 개수를 유지하면서** 모양을 변경할 수 있고, shape 속성에 튜플을 할당해 모양을 지정한다. 8개 요소는 (2,4)·(4,2)로 바꿀 수 있다([코드 6-5]).",
  },

  // ───────────────────────────── 12. 마스킹 (s.24~25)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-mask-001",
    topic: T.mask,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.24",
    prompt:
      "[코드 6-7]처럼 1과 0으로 **논리값 마스크**를 만들고, 마스킹된 데이터와 **마스킹 역전된** 데이터를 출력하는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "mask = np.array([0, 1, 1, 0], dtype={{0}})",
      "print(mask)",
      "",
      "data = np.array([[1, -2], [3, 4], [-5, 6], [7, -8]])",
      "print('\\n마스킹된 데이터 출력\\n', data[mask])",
      "print('\\n마스킹 역전된 데이터 출력\\n', data[{{1}}mask])",
    ),
    blanks: [
      { accept: ["bool"], wrong: ["int"] },
      { accept: ["~"], wrong: ["-"] },
    ],
    verify: NP,
    explanation:
      "s.24 [코드 6-7]: True·False 대신 1과 0으로 마스크를 만들 때 `dtype=bool`을 지정한다([False True True False]). `data[mask]`는 True인 1·2행, `data[~mask]`는 마스크를 뒤집어 0·3행을 고른다. (보충) 슬라이드는 data를 random.randn(4,2) 난수로 만들어 실행마다 값이 달라지므로 고정한 값으로 바꿨다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-mask-002",
    topic: T.mask,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec6 s.25",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py(
        "import numpy as np",
        "data = np.array([3, -1, 2, -5])",
        "posit = data[data > 0]",
        "print(posit)",
      ),
    },
    choices: ["[3 2]", "[ True False  True False]", "[-1 -5]", "[ 3 -1  2 -5]"],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.25 [코드 6-8]: 조건식 `data > 0`으로 마스킹하면 조건에 맞는 값(양수)만 고른다 — [3 2]. 조건식 결과 자체는 논리값 배열이다(s.24 마스킹 = 논리값 인덱싱).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-mask-003",
    topic: T.mask,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.24",
    prompt: "넘파이의 random.randn( ) 함수는 평균이 0이고 표준편차가 1인 난수를 생성한다.",
    answer: true,
    explanation:
      "s.24: random.randn( )은 평균이 0이고 표준편차가 1인 난수를 생성한다. 그래서 [코드 6-7]의 data는 실행할 때마다(슬라이드 주석: 책과 다르게) 값이 다르다.",
  },

  // ───────────────────────────── 13. 유니버설 함수·브로드캐스팅 (s.26~27)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-ufunc-001",
    topic: T.ufunc,
    type: "match",
    difficulty: 1,
    slideRef: "Lec6 s.26",
    prompt: "s.26 '넘파이 연산 함수' 표의 함수와 설명을 바르게 짝지으시오.",
    pairs: [
      { left: "`sqrt()`", right: "원소의 제곱근을 반환" },
      { left: "`square()`", right: "원소의 제곱을 반환" },
      { left: "`exp()`", right: "원소의 지수를 반환" },
      { left: "`floor_divide()`", right: "나눗셈의 정수 몫을 반환" },
      { left: "`mod()`", right: "두 배열 원소 나눗셈의 정수 나머지를 반환" },
    ],
    explanation:
      "s.26 표: abs/fabs 절댓값, sqrt 제곱근, square 제곱, exp 지수, log 밑이 e인 로그, add 합, subtract 차, multiply 곱, divide 나눗셈 결과, floor_divide 나눗셈의 정수 몫, mod 나눗셈의 정수 나머지.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-ufunc-002",
    topic: T.ufunc,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec6 s.27",
    prompt: "빈칸에 들어갈 말을 쓰시오.",
    text: "{{0}}: 둘 중 작은 차원인 배열을 변형하여 큰 차원의 배열에 맞춘 다음 두 배열을 요소별로 연산하는 동작",
    blanks: [{ accept: ["브로드캐스팅", "Broadcasting", "broadcasting"] }],
    explanation:
      "s.27: 서로 다른 형태의 배열을 유니버설 함수로 연산할 때 일어나는 **브로드캐스팅(Broadcasting)**은 작은 차원의 배열을 큰 차원에 맞춘 다음 요소별로 연산하는 동작이다. s.11: 넘파이의 특징 '정교한 브로드캐스팅'.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-ufunc-003",
    topic: T.ufunc,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.26-27",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py("import numpy as np", "a = np.array([1, 2, 3])", "print(np.add(a, 10))"),
    },
    choices: ["[11 12 13]", "[11  2  3]", "[1 2 3 10]", "16"],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.26: add( )는 두 배열 원소의 합을 반환하는 유니버설 함수다. s.27: 모양이 다른 10(스칼라)과 a를 연산하면 브로드캐스팅으로 10을 a의 모양에 맞춘 뒤 요소별로 더해 [11 12 13]이 된다.",
  },

  // ───────────────────────────── 14. 얕은 복사 vs 깊은 복사 (s.28~31)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-copy-001",
    topic: T.copy,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.28-29",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py(
        "import numpy as np",
        "a = np.arange(6)",
        "b = a",
        "print(a)",
        "print(b is a)",
        "",
        "b[0] = 10",
        "print(a)",
      ),
    },
    choices: [
      "[0 1 2 3 4 5] → True → [10  1  2  3  4  5]",
      "[0 1 2 3 4 5] → True → [0 1 2 3 4 5]",
      "[0 1 2 3 4 5] → False → [10  1  2  3  4  5]",
      "[0 1 2 3 4 5] → False → [0 1 2 3 4 5]",
    ],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.28~29 [코드 6-9]: `b = a`는 얕은 복사라 b도 같은 배열을 가리키므로 `b is a`는 True이고, b[0]에 10을 넣으면 같은 주소를 가리키는 a[0]도 10이 된다. (보충) 넘파이는 요소의 자릿수를 맞춰 출력하므로 10 뒤의 값들 앞에 공백이 한 칸 더 붙는다(슬라이드 실행결과는 한 칸).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-copy-002",
    topic: T.copy,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.30-31",
    prompt: "[코드 6-10] 배열 a를 **깊은 복사**해 c에 담는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "a = np.arange(6)",
      "c = a.{{0}}( )",
      "",
      "c[0] = 20",
      "print('A: ', a)",
      "print('C: ', c)",
    ),
    blanks: [{ accept: ["copy"], wrong: ["sort"] }],
    verify: NP,
    explanation:
      "s.30 [코드 6-10]: `a.copy( )`로 만든 c는 a와 별개의 배열이라, s.31처럼 c[0]에 20을 넣어도 a[0]은 그대로 0이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-copy-003",
    topic: T.copy,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.29",
    prompt: "`b = a`로 얕은 복사를 한 뒤 b[0]에 10을 할당하면 a[0]의 값도 10으로 바뀐다.",
    answer: true,
    explanation:
      "s.29: a의 값을 b에 얕은 복사로 저장했으므로 b도 **같은 배열**을 가리키고, b[0]에 10을 할당하면 같은 주소를 가리키는 a[0]도 10으로 바뀐다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-copy-004",
    topic: T.copy,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec6 s.28-31",
    prompt: "배열 복사에 대한 설명으로 **옳은 것**을 모두 고르시오.",
    choices: [
      "`b = a`로 얕은 복사하면 b와 a는 같은 배열을 가리킨다",
      "`c = a.copy( )`로 깊은 복사하면 c는 a와 별개의 배열이다",
      "깊은 복사한 c[0]을 바꿔도 a[0]은 그대로다",
      "얕은 복사한 b의 값을 바꿔도 a는 바뀌지 않는다",
      "copy( )로 만든 배열은 원본과 같은 주소를 가리킨다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.28~29 [코드 6-9]: 등호로 한 얕은 복사는 같은 배열을 가리켜 b를 바꾸면 a도 바뀐다. s.30~31 [코드 6-10]: copy( )로 만든 깊은 복사는 별개의 배열이라 c[0]을 바꿔도 a[0]은 0이다.",
  },

  // ───────────────────────────── 15. 정렬 (s.32)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-sort-001",
    topic: T.sort,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.32",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py("import numpy as np", "a = np.array([3, 2, 5, 1, 4])", "print(np.argsort(a))"),
    },
    choices: ["[3 1 0 4 2]", "[1 2 3 4 5]", "[0 1 2 3 4]", "[2 4 0 1 3]"],
    answerIndex: 0,
    verify: NP_OUT,
    explanation:
      "s.32 [코드 6-11]: `np.argsort(a)`는 정렬했을 때의 **인덱스**를 돌려준다. 가장 작은 1은 인덱스 3, 다음 2는 1, 3은 0, 4는 4, 5는 2라 [3 1 0 4 2]다(슬라이드 실행결과와 같음). 정렬된 값 자체는 np.sort(a)다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-sort-002",
    topic: T.sort,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.32",
    prompt:
      "[코드 6-11] 원본은 그대로 두고 정렬한 결과만 출력한 뒤, 마지막에 **원본 자체를 정렬**하는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import numpy as np",
      "a = np.array([3, 2, 5, 1, 4])",
      "",
      "print('정렬 후\\n', np.{{0}}(a))",
      "print('원본\\n', a)",
      "",
      "a.{{1}}( )",
      "print('원본\\n', a)",
    ),
    blanks: [
      { accept: ["sort"], wrong: ["argsort"] },
      { accept: ["sort"], wrong: ["copy"] },
    ],
    verify: NP,
    explanation:
      "s.32 [코드 6-11]: `np.sort(a)`는 원본 배열 a의 요소 순서가 유지된 채 정렬한 결과를 돌려주고, `a.sort( )`는 원본을 정렬한다. argsort는 정렬한 인덱스다. 슬라이드 원문 `'원본\\n’`의 닫는 따옴표는 굽은 따옴표 인쇄 오류다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-sort-003",
    topic: T.sort,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.32",
    prompt:
      "np.sort( ) 함수는 원본 배열을 정렬하고, sort( ) 함수는 원본의 요소 순서를 그대로 유지한다.",
    answer: false,
    falseReason:
      "s.32: 반대다. np.sort( )는 원본 배열의 요소 순서가 유지되고, sort( )는 원본을 정렬한다.",
    explanation:
      "s.32: np.sort( ) 함수는 원본 배열 a의 요소 순서가 **유지**되고, sort( ) 함수는 **원본을 정렬**한다([코드 6-11]의 마지막 원본 출력 [1 2 3 4 5]).",
  },

  // ───────────────────────────── 16. Series (s.34)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-series-001",
    topic: T.series,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.34",
    prompt:
      "[코드 6-12] 판다스를 pd로 가져와 값 1, 2, 3에 **인덱스 'a', 'b', 'c'를 지정한 시리즈**를 만드는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "{{0}} pandas as pd",
      "",
      "b = pd.{{1}}([1, 2, 3], {{2}}=['a', 'b', 'c'])",
      "print(b)",
    ),
    blanks: [
      { accept: ["import"], wrong: ["from"] },
      { accept: ["Series"], wrong: ["series"] },
      { accept: ["index"], wrong: ["columns"] },
    ],
    verify: PD(""),
    explanation:
      "s.34 [코드 6-12]: `import pandas as pd`로 가져오고, `pd.Series( )`에 리스트를 넣어 시리즈를 만든다. `index=['a', 'b', 'c']`로 인덱스를 지정하지 않으면 기본 인덱스 0, 1, 2, …가 붙는다. 이름은 대문자로 시작하는 Series다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-series-002",
    topic: T.series,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec6 s.34",
    prompt: "다음 코드의 **실행 결과**는?",
    code: {
      language: "python",
      source: py(
        "import pandas as pd",
        "b = pd.Series([1, 2, 3], index=['a', 'b', 'c'])",
        "print(b['b'])",
      ),
    },
    choices: ["2", "1", "b", "3"],
    answerIndex: 0,
    verify: PD_OUT(""),
    explanation:
      "s.34 [코드 6-12]: 시리즈 b는 값 1, 2, 3에 인덱스 'a', 'b', 'c'를 지정했으므로 `b['b']`는 인덱스 'b'의 값 2다. s.9: 시리즈는 인덱스와 값이 한 쌍을 이룬다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-series-003",
    topic: T.series,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.34",
    prompt: "시리즈 b에서 **인덱스 'c'의 값**(3)을 출력하도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import pandas as pd",
      "b = pd.Series([1, 2, 3], index=['a', 'b', 'c'])",
      "print(b[{{0}}])",
    ),
    blanks: [{ accept: ["'c'"], wrong: ["c", "'3'"] }],
    verify: PD(""),
    explanation:
      "s.34: 시리즈 b의 인덱스는 문자열 'a', 'b', 'c'라 따옴표를 붙여 `b['c']`로 값 3에 접근한다(큰따옴표도 같은 답). 따옴표가 없으면 c라는 변수를 찾아 NameError다.",
  },

  // ───────────────────────────── 17. DataFrame 생성 (s.35~37)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-frame-001",
    topic: T.frame,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.35",
    prompt:
      "[코드 6-13] 리스트로 **데이터프레임**을 만들고 **열 이름**을 지정하는 코드다. 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import pandas as pd",
      "list1 = list([['한빛', '남자', '20', '180'],",
      "              ['한결', '남자', '21', '177'],",
      "              ['한라', '여자', '20', '160']])",
      "col_names = ['이름', '성별', '나이', '키']",
      "df = pd.{{0}}(list1, {{1}}=col_names)",
      "print(df.shape)",
    ),
    blanks: [
      { accept: ["DataFrame"], wrong: ["Series"] },
      { accept: ["columns"], wrong: ["index"] },
    ],
    verify: PD(""),
    explanation:
      "s.35 [코드 6-13]: `pd.DataFrame(값, columns=열 이름 리스트)` 형식으로, 리스트를 한 행씩 데이터로 지정한다. 결과는 3행 4열이다. (보충) 마지막 print(df.shape)는 결과 확인용으로 더했다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-frame-002",
    topic: T.frame,
    type: "multi",
    difficulty: 1,
    slideRef: "Lec6 s.35-37",
    prompt:
      "강의 자료에서 `pd.DataFrame( )`으로 데이터프레임을 만들 때 활용한 데이터를 모두 고르시오.",
    choices: [
      "파이썬의 리스트",
      "파이썬의 딕셔너리",
      "넘파이의 배열",
      "엑셀 워크시트 객체",
      "셀레니움 객체",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.35: 판다스의 DataFrame( ) 함수로 데이터프레임을 만들 때 파이썬의 리스트([코드 6-13]), 파이썬의 딕셔너리([코드 6-14]), 넘파이의 배열([코드 6-15])을 활용한다. 세 코드의 결과는 같은 데이터프레임이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-frame-003",
    topic: T.frame,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.35",
    prompt: "데이터프레임 df의 **모양**(행 수, 열 수)을 출력하도록 속성 이름을 채우시오.",
    language: "python",
    source: py(
      "import pandas as pd",
      "list1 = list([['한빛', '남자', '20', '180'],",
      "              ['한결', '남자', '21', '177'],",
      "              ['한라', '여자', '20', '160']])",
      "col_names = ['이름', '성별', '나이', '키']",
      "df = pd.DataFrame(list1, columns=col_names)",
      "print(df.{{0}})",
    ),
    blanks: [{ accept: ["shape"], wrong: ["size"] }],
    verify: PD(""),
    explanation:
      "s.10: 데이터프레임은 2차원 배열과 비슷하다. (보충) 넘파이 배열처럼 `df.shape`로 (행 수, 열 수)인 (3, 4)를 볼 수 있다(s.19 배열의 shape 속성). size는 값의 개수 12다.",
  },

  // ───────────────────────────── 18. CSV 저장·읽기 (s.38~39)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-csv-001",
    topic: T.csv,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.39",
    prompt: `[코드 6-17] 데이터프레임 df를 **CSV 파일로 저장**하고 다시 **읽어 오는** 코드다. 빈칸을 채우시오. ${DF_STR_NOTE}`,
    language: "python",
    source: py(
      "#디렉토리에 CSV 파일로 저장하기",
      "df.{{0}}('./file.csv', header=True, index=False,",
      "encoding='utf-8')",
      "#CSV 파일 읽기",
      "df2 = pd.{{1}}('./file.csv', sep=',')",
      "print(len(df2))",
    ),
    blanks: [
      { accept: ["to_csv"], wrong: ["read_csv"] },
      { accept: ["read_csv"], wrong: ["to_csv"] },
    ],
    verify: PD(DF_STR),
    explanation:
      "s.38~39 [코드 6-17]: `df.to_csv( )`로 데이터프레임을 CSV 파일로 저장하고, `pd.read_csv( )`로 CSV 파일을 데이터프레임 객체로 읽어 온다. 읽은 df2는 [코드 6-16]의 df와 동일하다(8행). (보충) 마지막 print(len(df2))는 결과 확인용이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-csv-002",
    topic: T.csv,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.39",
    prompt:
      "[코드 6-17]에서 저장한 'file.csv'를 read_csv( )로 읽은 df2는 [코드 6-16]의 데이터프레임 df와 동일하다.",
    answer: true,
    explanation:
      "s.39: Colab 디렉토리를 새로고침하면 'file.csv'가 생성되고, 실행 결과로 나타나는 데이터프레임 df2는 [코드 6-16]의 데이터프레임 df와 **동일**하다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-csv-003",
    topic: T.csv,
    type: "match",
    difficulty: 1,
    slideRef: "Lec6 s.38-39",
    prompt: "판다스 함수와 하는 일을 바르게 짝지으시오.",
    pairs: [
      { left: "`df.to_csv( )`", right: "데이터프레임을 CSV 파일로 저장" },
      { left: "`pd.read_csv( )`", right: "CSV 파일을 데이터프레임 객체로 읽어 오기" },
      { left: "`pd.DataFrame( )`", right: "리스트·딕셔너리·배열로 데이터프레임 만들기" },
    ],
    explanation:
      "s.38: 데이터프레임을 CSV로 저장하거나 CSV 파일을 데이터프레임 객체로 읽어 온다 — to_csv( )와 read_csv( )([코드 6-17]). s.35: DataFrame( )으로 데이터프레임을 만든다.",
  },

  // ───────────────────────────── 19. columns·describe·head·tail (s.40~43)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-view-001",
    topic: T.view,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.42-43",
    prompt: `데이터프레임의 **처음 세 행**과 **마지막 다섯 행**을 꺼내는 코드다. 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py(
      "first = df.{{0}}(3)",
      "last = df.{{1}}( )",
      "print(first['이름'].tolist())",
      "print(last['이름'].tolist())",
    ),
    blanks: [
      { accept: ["head"], wrong: ["tail"] },
      { accept: ["tail"], wrong: ["head"] },
    ],
    verify: PD(),
    explanation:
      "s.42 [코드 6-20]·s.43 [코드 6-21]: `head( )`와 `tail( )`에 정수 n을 넣으면 각각 처음 n개 행, 마지막 n개 행을 반환한다. 인자가 없으면 5개 행이다. (보충) tolist( )로 이름만 출력한 것은 결과 확인용이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-view-002",
    topic: T.view,
    type: "match",
    difficulty: 2,
    slideRef: "Lec6 s.41",
    prompt: "문자열 열에 describe( )를 쓴 결과([코드 6-19])의 항목과 뜻을 바르게 짝지으시오.",
    pairs: [
      { left: "count", right: "값의 개수" },
      { left: "unique", right: "유일한 값의 개수" },
      { left: "top", right: "제일 개수가 많은 값" },
      { left: "freq", right: "그 값의 빈도수(frequency)" },
    ],
    explanation:
      "s.41: describe( )로 열별 값의 개수·빈도 수 같은 통계를 확인한다. count는 값의 개수, unique는 유일한 값의 개수, top은 제일 개수가 많은 값, freq는 빈도수다(성별 열: unique 2, top 여자, freq 5).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-view-003",
    topic: T.view,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.40",
    prompt: `[코드 6-18] 데이터프레임 df의 **모든 열 이름**을 조회하도록 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: "print(df.{{0}}.tolist())",
    blanks: [{ accept: ["columns"], wrong: ["index"] }],
    verify: PD(),
    explanation:
      "s.40 [코드 6-18]: `df.columns`는 모든 열 이름을 담은 Index(['이름', '성별', '나이', '키'])다. (보충) tolist( )로 리스트로 바꿔 출력했다 — Index를 그대로 표시하면 판다스 버전에 따라 뒤에 붙는 dtype 표기가 달라질 수 있다. index는 행 인덱스다.",
  },

  // ───────────────────────────── 20. sort_index·sort_values (s.44~45)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-order-001",
    topic: T.order,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.45",
    prompt: `[코드 6-23] 나이 열과 키 열을 기준으로 행을 **내림차순** 정렬하는 코드다. 빈칸을 채우시오. ${DF_STR_NOTE}`,
    language: "python",
    source: py(
      "#나이 열과 키 열을 기준으로 행을 정렬하기",
      "top5 = df.{{0}}(by=['나이', '키'], {{1}}=False).head( )",
      "print(top5['이름'].tolist())",
    ),
    blanks: [
      { accept: ["sort_values"], wrong: ["sort_index"] },
      { accept: ["ascending"], wrong: ["descending"] },
    ],
    verify: PD(DF_STR),
    explanation:
      "s.44: 기본 정렬 방향은 오름차순(ascending)이며 내림차순은 ascending 인자를 False로 지정한다. s.45 [코드 6-23]: 특정 열을 기준으로 정렬할 때는 `sort_values( )`를 쓴다. sort_index는 인덱스 기준([코드 6-22]), descending이라는 인자는 없다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-order-002",
    topic: T.order,
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec6 s.45",
    prompt: `다음 코드의 **실행 결과**는? ${DF_STR_NOTE}`,
    code: {
      language: "python",
      source: "print(df.sort_values(by=['나이', '키'], ascending=False).head( )['이름'].tolist())",
    },
    choices: [
      "['허준호', '이새봄', '이보람', '오다현', '이가원']",
      "['허준호', '이새봄', '이보람', '이가원', '오다현']",
      "['고고림', '배규민', '이가원', '이루리', '오다현']",
      "['허준호', '고고림', '배규민', '오다현', '이보람']",
    ],
    answerIndex: 0,
    verify: PD_OUT(DF_STR),
    explanation:
      "s.45 [코드 6-23]: 나이 내림차순(30 → 28 → 26 → 24), 나이가 같으면 키 내림차순이라 24세 세 명 중 172(오다현) → 162(이가원) 순이다. 결과 행 인덱스는 슬라이드 실행결과와 같은 0·4·5·7·1이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-order-003",
    topic: T.order,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec6 s.44",
    prompt: "빈칸에 들어갈 말을 쓰시오.",
    text: "행 정렬의 기본 방향은 {{0}}(ascending)이며, 내림차순(descending) 정렬은 ascending 인자를 {{1}}로 지정한다.",
    blanks: [{ accept: ["오름차순"] }, { accept: ["False"] }],
    explanation:
      "s.44: 인덱스나 특정 열의 값을 기준으로 행을 정렬할 수 있고, 기본은 **오름차순**, 내림차순은 `ascending=False`다.",
  },

  // ───────────────────────────── 21. 조회 (s.46~53)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-001",
    topic: T.query,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.47",
    prompt: `[코드 6-25] **인덱스로** 두 번째~네 번째 행의 첫 번째~세 번째 열을 조회하는 코드다. 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py("part = df.{{0}}[1:4, 0:3]", "print(part.shape)"),
    blanks: [{ accept: ["iloc"], wrong: ["loc"] }],
    verify: PD(),
    explanation:
      "s.47 [코드 6-25]: `iloc`으로 인덱스(위치) 기준 조회를 한다 — `df.iloc[1:4, 0:3]`은 두 번째~네 번째 행, 첫 번째~세 번째 열이라 3행 3열이다. (보충) loc은 이름 기준이라 0:3 같은 열 위치 슬라이스로 열을 고를 수 없다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-002",
    topic: T.query,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.51-52",
    prompt: `[코드 6-29]는 두 조건을 **동시에**, [코드 6-30]은 **하나 이상** 만족하는 사람을 조회한다. 빈칸에 알맞은 연산자를 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py(
      "both = df[(df['성별'] == '여자') {{0}} (df['키'] > 160)]",
      "either = df[(df['나이'] >= 28) {{1}} (df['성별'] == '남자')]",
      "print(both['이름'].tolist())",
      "print(either['이름'].tolist())",
    ),
    blanks: [
      { accept: ["&"], wrong: ["|", "and"] },
      { accept: ["|"], wrong: ["&", "or"] },
    ],
    verify: PD(),
    explanation:
      "s.51 [코드 6-29]: 동시에 만족은 `&` → 이가원·이보람·오다현. s.52 [코드 6-30]: 하나 이상 만족은 `|` → 허준호·배규민·고고림·이새봄. 조건마다 괄호로 묶는다. (보충) 판다스 조건식에 파이썬의 and·or를 쓰면 ValueError다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-003",
    topic: T.query,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.50·s.53",
    prompt: `나이가 21 또는 23인 사람([코드 6-28])과 이름에 '봄'이 들어간 사람([코드 6-31])을 조회하는 코드다. 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py(
      "a = df[df['나이'].{{0}}([21, 23])]",
      "b = df[df['이름'].str.{{1}}('봄')]",
      "print(a['이름'].tolist())",
      "print(b['이름'].tolist())",
    ),
    blanks: [
      { accept: ["isin"], wrong: ["contains"] },
      { accept: ["contains"], wrong: ["isin"] },
    ],
    verify: PD(),
    explanation:
      "s.50 [코드 6-28]: `isin([21, 23])`은 리스트 요소와 일치하는 데이터를 고른다 → 배규민·고고림. s.53 [코드 6-31]: `str.contains('봄')`은 특정 문자열을 포함하는 문자열 데이터를 고른다 → 이새봄.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-004",
    topic: T.query,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec6 s.49",
    prompt: `다음 코드의 **실행 결과**는? ${DF_NOTE}`,
    code: { language: "python", source: "print(len(df[df['키'] > 180]))" },
    choices: ["2", "3", "1", "8"],
    answerIndex: 0,
    verify: PD_OUT(),
    explanation:
      "s.49 [코드 6-27]: 키가 숫자형인 df에서 `df[df['키'] > 180]`은 허준호(183)·고고림(182) 두 명이다. len( )은 행의 개수다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-005",
    topic: T.query,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec6 s.48",
    prompt: `다음 코드를 실행하면 오류가 난다. 그 **원인**은? ${DF_STR_NOTE}`,
    code: { language: "python", source: "df[df['키'] > 180].head( )" },
    choices: [
      "키 열의 데이터 자료형이 문자열이기 때문",
      "키라는 열이 없기 때문",
      "head( )에 숫자를 넣지 않았기 때문",
      "조건식을 괄호로 묶지 않았기 때문",
    ],
    answerIndex: 0,
    verify: {
      mode: "run",
      python: { packages: ["numpy", "pandas"], setup: DF_STR },
      check: { kind: "error", errorType: "TypeError" },
    },
    explanation:
      "s.48 [코드 6-26]: 실행하면 `TypeError: '>' not supported between instances of 'str' and 'int'`가 난다 — **키 열의 데이터 자료형이 문자열**이기 때문이다([코드 6-16]에서 '183'처럼 따옴표로 입력). s.49 [코드 6-27]처럼 숫자로 입력하면 조회된다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-006",
    topic: T.query,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec6 s.46-53",
    prompt: "데이터프레임 조회 방법으로 **옳은 것**을 모두 고르시오.",
    choices: [
      "df[['이름', '키']]처럼 대괄호를 두 겹으로 쓰면 데이터프레임으로 출력한다",
      "iloc으로 행·열의 인덱스를 지정해 조회한다",
      "isin( )은 리스트 요소와 일치하는 데이터를 조회한다",
      "&는 두 조건식 중 하나 이상을 만족하는 데이터를 조회한다",
      "str.contains( )는 숫자 열에서 특정 숫자보다 큰 값을 조회한다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.46: `데이터프레임[조건식]`은 시리즈로, `데이터프레임[[조건식]]`은 데이터프레임으로 출력한다. s.47: iloc은 인덱스로 조회. s.50: isin( )은 리스트 요소와 일치. s.51~52: &는 동시에, |는 하나 이상. s.53: str.contains( )는 특정 문자열을 포함하는 문자열 데이터를 조회한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-query-007",
    topic: T.query,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.46",
    prompt: `[코드 6-24] **열 이름으로** 이름 열과 키 열을 데이터프레임으로 조회하도록 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py("two = df[[{{0}}, '키']].head( )", "print(two.columns.tolist())"),
    blanks: [{ accept: ["'이름'"], wrong: ["이름"] }],
    verify: PD(),
    explanation:
      "s.46 [코드 6-24]: 조건식 자리에 리스트 형식으로 원하는 열 이름을 적는다 — `df[['이름', '키']]`. 열 이름은 문자열이라 따옴표가 필요하다(큰따옴표도 같은 답). s.9 필기 \"이름으로 column접근\"도 열을 이름으로 꺼낸다는 뜻이다(수업 필기 기준).",
  },

  // ───────────────────────────── 22. describe(숫자 열) (s.54)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-stat-001",
    topic: T.stat,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec6 s.54",
    prompt: `다음 코드의 **실행 결과**는? ${DF_NOTE}`,
    code: { language: "python", source: "print(df['키'].mean())" },
    choices: ["169.75", "169", "172.0", "25.0"],
    answerIndex: 0,
    verify: PD_OUT(),
    explanation:
      "s.54 [코드 6-32]: 숫자형 df에 describe( )를 쓰면 키 열의 mean(평균)은 169.75다(나이 평균은 25). 8명 키의 합 1358 ÷ 8 = 169.75.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-stat-002",
    topic: T.stat,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.41·s.54",
    prompt:
      "describe( )는 문자열 열에는 count·unique·top·freq를, 숫자 열에는 평균(mean)·표준편차(std) 같은 통계를 보여 준다.",
    answer: true,
    explanation:
      "s.41 [코드 6-19]: 문자열 df의 describe( )는 count·unique·top·freq. s.54 [코드 6-32]: 나이·키가 숫자인 df의 describe( )는 count·mean·std·min·사분위·max 같은 통계다(키 mean 169.75, std 10.552589).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-stat-003",
    topic: T.stat,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.54",
    prompt: `[코드 6-32] 숫자 열의 통계표에서 **키의 평균**(169.75)을 꺼내도록 함수 이름을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: "print(df.{{0}}( ).loc['mean', '키'])",
    blanks: [{ accept: ["describe"], wrong: ["head"] }],
    verify: PD(),
    explanation:
      "s.54 [코드 6-32]: `df.describe( )`의 결과도 데이터프레임이라, 행 이름 'mean'과 열 이름 '키'로 평균 169.75를 꺼낼 수 있다(s.55 loc). head( )에는 'mean' 행이 없다.",
  },

  // ───────────────────────────── 23. loc로 갱신 (s.55)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-loc-001",
    topic: T.loc,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.55",
    prompt: `[코드 6-33] 인덱스 4번 행(이새봄)의 키를 5만큼 늘리는 코드다. 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py("df.{{0}}[4,'키'] = df.loc[4,'키'] + 5", "print(df.loc[4,'키'])"),
    blanks: [{ accept: ["loc"], wrong: ["iloc"] }],
    verify: PD(),
    explanation:
      "s.55 [코드 6-33]: 행 인덱스나 열 이름으로 데이터를 조회하고 수정할 때 `loc`을 쓴다 — 이새봄의 키 160이 165가 된다. (보충) iloc은 위치(정수)만 받아 열 이름 '키'를 쓸 수 없다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-loc-002",
    topic: T.loc,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.55",
    prompt: "`df.loc[4,'키'] = df.loc[4,'키'] + 5`는 인덱스 4번 행의 키 열 값을 5만큼 증가시킨다.",
    answer: true,
    explanation:
      "s.55 [코드 6-33]: 인덱스 4번 행의 키 열 값을 5만큼 증가시킨다(이새봄 160 → 165, 실행결과 `df.loc[[4]]`).",
  },

  // ───────────────────────────── 24. 구조 수정 (s.56~59)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-struct-001",
    topic: T.struct,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.56·s.58",
    prompt: `이름 열을 **행 인덱스로 지정**하고, 보너스 열을 **열 방향으로 삭제**하는 코드다. 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py(
      "df.{{0}}('이름', inplace=True)",
      "df['보너스'] = df['나이'] * 10000",
      "df.drop('보너스', {{1}}=1, inplace=True)",
      "print(df.columns.tolist())",
    ),
    blanks: [
      { accept: ["set_index"], wrong: ["reset_index"] },
      { accept: ["axis"], wrong: ["index"] },
    ],
    verify: PD(),
    explanation:
      "s.56 [코드 6-35]: `set_index( )`로 중복 데이터가 없는 이름 열을 행 인덱스로 지정한다. s.58 [코드 6-37]: `drop('보너스', axis=1, …)`로 열을 삭제한다(axis=1은 열 방향). 남은 열은 성별·나이·키다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-struct-002",
    topic: T.struct,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec6 s.57",
    prompt: `[코드 6-36] 나이에 10000을 **곱한** 만큼의 보너스 열을 만드는 코드다. 빈칸을 채우시오. ${DF_NOTE}`,
    language: "python",
    source: py("df['보너스'] = df['나이'] {{0}} 10000", "print(df['보너스'].head(3).tolist())"),
    blanks: [{ accept: ["*"], wrong: ["+"] }],
    verify: PD(),
    explanation:
      "s.57 [코드 6-36]: `df['보너스'] = df['나이'] * 10000`처럼 새 열 이름에 값을 대입하면 열이 생긴다. 처음 세 명의 보너스는 300000·240000·230000이다(슬라이드 실행결과).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-struct-003",
    topic: T.struct,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec6 s.56",
    prompt:
      "set_index( )나 drop( ) 같은 함수에 inplace=True를 지정하면 작업을 데이터프레임 원본에 적용한다.",
    answer: true,
    explanation:
      "s.56: `inplace=True`를 지정하면 작업을 **데이터프레임 원본에 적용**한다([코드 6-35]~[코드 6-38]).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-struct-004",
    topic: T.struct,
    type: "order",
    difficulty: 2,
    slideRef: "Lec6 s.56-59",
    prompt: "강의 자료에서 데이터프레임 구조를 수정한 순서([코드 6-35]~[코드 6-38])대로 놓으시오.",
    items: [
      "set_index( )로 이름 열을 행 인덱스로 지정",
      "보너스 열 생성(나이 × 10000)",
      "drop( )으로 보너스 열 삭제",
      "reset_index( )로 기본 인덱스로 복구",
    ],
    explanation:
      "s.56 [코드 6-35] set_index → s.57 [코드 6-36] 보너스 열 생성 → s.58 [코드 6-37] drop(axis=1) → s.59 [코드 6-38] reset_index로 기본 인덱스 복구.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-struct-005",
    topic: T.struct,
    type: "code-write",
    difficulty: 2,
    slideRef: "Lec6 s.57",
    prompt: `데이터프레임 df에 나이에 10000을 곱한 **'보너스' 열**을 만들고, **처음 세 행의 보너스** 열을 print로 출력하시오. ${DF_NOTE}`,
    language: "python",
    starter: "",
    solution: py("df['보너스'] = df['나이'] * 10000", "print(df['보너스'].head(3))"),
    python: {
      packages: ["numpy", "pandas"],
      setup: DF_NUM,
      checks: [
        "df['보너스'].tolist() == [300000, 240000, 230000, 210000, 280000, 260000, 240000, 240000]",
      ],
    },
    expect: {
      stdout: py("0    300000", "1    240000", "2    230000", "Name: 보너스, dtype: int64"),
    },
    explanation:
      "s.57 [코드 6-36]: `df['보너스'] = df['나이'] * 10000`으로 열을 만들고, s.42처럼 `head(3)`으로 처음 세 행을 본다(300000·240000·230000). 열 하나를 꺼내면 시리즈라 이름(Name)과 자료형이 함께 출력된다. 채점은 같은 엔진에서 모범 답안 출력과 비교하고, 값 검사로 보너스 열 전체를 확인한다.",
  },

  // ───────────────────────────── 25. groupby·rename·merge (s.60~61)
  {
    ...base,
    ...plain,
    id: "data-science-lec6-group-001",
    topic: T.group,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.60-61",
    prompt: `[코드 6-40] 성별을 기준으로 **그룹화**하고 그룹별 키의 **평균**을 계산하는 코드다. 빈칸을 채우시오. ${DF_ORIG_NOTE}`,
    language: "python",
    source: py(
      "#성별 평균 키",
      "mean_by_gender = df.{{0}}(by=['성별'], as_index=False)['키'].{{1}}( )",
      "mean_by_gender.rename(columns={'키':'평균 키'}, inplace=True)",
      "print(mean_by_gender['평균 키'].tolist())",
    ),
    blanks: [
      { accept: ["groupby"], wrong: ["sort_values"] },
      { accept: ["mean"], wrong: ["std"] },
    ],
    verify: PD(),
    explanation:
      "s.61: 성별을 기준으로 `groupby( )`로 그룹화하고 그룹별 키의 `mean( )`(평균)을 계산해 mean_by_gender에 담는다. 표준편차는 std( )다. (보충) 이 df는 [코드 6-33] 수정 전 원래 데이터라 여자 평균이 162.8이다 — 슬라이드 결과(평균 162.8, 표준편차 5.630275)도 6-33 수정 전 원래 데이터 기준이며, 슬라이드 순서대로 6-33까지 실행했다면 163.8이 된다(group-003).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-group-002",
    topic: T.group,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec6 s.60-61",
    prompt: `[코드 6-40] 키 열의 이름을 **'평균 키'로 바꾸고**, 평균표와 표준편차표를 **병합**하는 코드다. 빈칸을 채우시오. ${DF_ORIG_NOTE}`,
    language: "python",
    source: py(
      "mean_by_gender = df.groupby(by=['성별'], as_index=False)['키'].mean( )",
      "mean_by_gender.{{0}}(columns={'키':'평균 키'}, inplace=True)",
      "std_by_gender = df.groupby(by=['성별'], as_index=False)['키'].std( )",
      "std_by_gender.rename(columns = {'키':'키의 표준편차'}, inplace=True)",
      "",
      "new_df = pd.{{1}}(mean_by_gender, std_by_gender)",
      "print(new_df.columns.tolist())",
    ),
    blanks: [
      { accept: ["rename"], wrong: ["drop"] },
      { accept: ["merge"], wrong: ["concat"] },
    ],
    verify: PD(),
    explanation:
      "s.61: `rename( )`으로 키 열의 이름을 '평균 키'(표준편차표는 '키의 표준편차')로 바꾸고, `pd.merge( )`로 두 데이터프레임을 성별 열을 기준으로 병합한다 → 열 성별·평균 키·키의 표준편차. (보충) 슬라이드 결과(평균 162.8, 표준편차 5.630275)는 6-33 수정 전 원래 데이터 기준이다 — 6-33 이후 데이터로 실행하면 값이 다르다(group-003).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-group-003",
    topic: T.group,
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec6 s.55·s.60",
    prompt: `[코드 6-33]으로 인덱스 4번 행(이새봄)의 키를 5 늘린 뒤 성별 평균 키를 구하는 코드다(첫 줄이 [코드 6-33]). **실행 결과**는? ${DF_ORIG_NOTE}`,
    code: {
      language: "python",
      source: py(
        "df.loc[4,'키'] = df.loc[4,'키'] + 5",
        "",
        "mean_by_gender = df.groupby(by=['성별'], as_index=False)['키'].mean( )",
        "print(mean_by_gender['키'].tolist())",
      ),
    },
    choices: [
      "[181.33333333333334, 163.8]",
      "[181.33333333333334, 162.8]",
      "[162.8, 181.33333333333334]",
      "[181.33333333333334, 165.0]",
    ],
    answerIndex: 0,
    verify: PD_OUT(),
    explanation:
      "s.55 [코드 6-33]으로 이새봄의 키가 160 → 165가 되면 여자 키는 162·165·163·157·172이고 평균은 163.8이다. 남자는 183·179·182의 평균 181.333…이다. (보충) 슬라이드 결과(평균 162.8, 표준편차 5.630275)는 **6-33 수정 전 원래 데이터 기준**이다 — 슬라이드 순서대로 6-33 이후 데이터로 실행하면 163.8(표준편차 5.449771). 정답은 실제 실행 결과로 한다(결정 11).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec6-group-004",
    topic: T.group,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec6 s.60-61",
    prompt: "[코드 6-40]에 대한 설명으로 **옳은 것**을 모두 고르시오.",
    choices: [
      "groupby(by=['성별'])로 성별을 기준으로 그룹화한다",
      "그룹별 키의 표준편차는 std( )로 계산한다",
      "pd.merge( )로 평균표와 표준편차표를 병합한다",
      "rename( )은 그룹을 다시 나눈다",
      "mean( )은 그룹별 키의 최댓값을 계산한다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.61: 성별 기준 groupby → 그룹별 키의 mean( )(평균)·std( )(표준편차) → rename( )으로 열 이름 변경 → pd.merge( )로 두 데이터프레임 병합. (보충) 슬라이드 결과(평균 162.8, 표준편차 5.630275)는 6-33 수정 전 원래 데이터 기준이다.",
  },
];

export default questions;

import type { Question } from "@/types/question";
import type { VerifySpec } from "@/lib/qtypes/base";

// Lec7 데이터 시각화(맷플롯립) — 근거: source/data-science/Lec7.pdf s.1~25만(2026-10-17). s.26(결측치 처리)부터는 출제하지 않는다.
// ⭐ 없음(결정 3). 해설은 "s.번호:"로 시작한다. 슬라이드 코드의 굽은 따옴표(’ ‘)는 곧은 따옴표로 고쳐 옮겼다(quote-001만 슬라이드 그대로).
// 앱 실행 엔진(Pyodide)에 맷플롯립이 없어 코드 문항은 verify: skip + local: "matplotlib" — 로컬 CPython(Agg)으로 그래프 객체·통계를 검사한다
// (scripts/verify-matplotlib.py, lib/verify/matplotlib.test.ts, 코드 없는 문항의 검사 코드는 lib/verify/matplotlibChecks.ts).
// 대조 기록 docs/verification/data-science-lec7.md

const base = { subject: "data-science", chapter: "lec7" } as const;
const plain = { exam: false } as const;
const py = (...lines: string[]) => lines.join("\n");

const MPL: VerifySpec = { mode: "skip", reason: "맷플롯립 — 앱 실행 엔진(Pyodide)에 없어 로컬 CPython(Agg 백엔드)으로 검증", local: "matplotlib" };

/** [코드 7-1] 차트 생성 */
const C71 = (title = "title", show = "show") =>
  py(
    "import matplotlib.pyplot as plt",
    "",
    "plt.rcParams['font.family'] = 'Malgun Gothic'",
    "plt.rcParams['axes.unicode_minus'] = False",
    "",
    `plt.${title}('대한민국')`,
    "plt.plot([-1, 2, 3, 4])",
    `plt.${show}()`,
  );
/** [코드 7-4] 축 범위를 지정하여 차트 생성 */
const C74 = (axis = "plt.axis([2013, 2024, 20000, 70000])", fmt = "'rs:')           #빨간색, 사각형 마커, 점선") =>
  py("year = [2014, 2017, 2020, 2023]", "price = [25000, 31000, 53000, 63000]", `plt.plot(year, price, ${fmt}`, "", axis, "plt.show()");
/** [코드 7-5] 차트 하나에 그래프 세 개 생성 */
const C75 = (label = "label", legend = "legend") =>
  py(
    "import numpy as np",
    "",
    `plt.plot(np.random.randn(10), 'k', ${label}='one')         #검은색 실선`,
    "plt.plot(np.random.randn(10)*3, 'r--', label='two')     #빨간색 파선",
    "plt.plot(np.random.randn(10)*10, 'g.', label='three')   #선 없이 초록색 점 마커로 표시",
    `plt.${legend}()`,
    "plt.show()",
  );
/** [코드 7-6] 다중 그래프 */
const C76 = (fourth = "2, 2, 4") =>
  py(
    "plt.subplot(2, 2, 1)              # 2행 2열 중 첫 번째 그래프",
    "plt.plot(np.random.randn(10), 'b--')",
    "plt.subplot(2, 2, 2)              # 2행 2열 중 두 번째 그래프",
    "plt.plot(np.random.randn(100), 'r', alpha=0.7)",
    "plt.subplot(2, 2, 3)              # 2행 2열 중 세 번째 그래프",
    "plt.plot(np.random.randn(10), 'y^')",
    `plt.subplot(${fourth})              # 2행 2열 중 네 번째 그래프`,
    "plt.plot(np.random.randn(10), 'g.')",
    "plt.show()",
  );
const NUMBERS_79 = "numbers = [0, 1.4, 1.6, 1.8, 1.85, 1.9, 2.2, 2.5, 5.7, 9]";
/** [코드 7-10] 과목별 성적 막대 그래프 */
const C710 = (x = "xlabel", y = "ylabel", lim = "ylim") =>
  py(
    "subject = ['KOR', 'ENG', 'MATH']",
    "grade = [85, 76, 55]",
    "",
    "plt.title('Report')",
    `plt.${x}('Subject')`,
    `plt.${y}('Grade')`,
    "",
    "plt.bar(subject, grade)",
    `plt.${lim}(0,100)         #y축 범위`,
    "plt.text(0,90, 'Good!')",
    "plt.show()",
  );
/** [코드 7-11] 과일 소비량 파이 차트 */
const C711 = (pieArgs = "labels=example_series.index, autopct='%.1f%%'") =>
  py(
    "import pandas as pd",
    "example_series = pd.Series([20, 15, 5, 5, 10],\\",
    "                index=['Apple', 'Banana', 'Cherry', 'Kiwi', 'Grape'])",
    `plt.pie(example_series, ${pieArgs})`,
    "plt.show()",
  );

const T = {
  types: "맷플롯립·그래프 유형",
  plot: "plot·title·show(꺾은선 그래프)",
  font: "한글 폰트·rcParams·rc",
  fmt: "포맷 문자열(색·마커·선 스타일)",
  axis: "axis(축 범위)",
  legend: "그래프 여러 개·legend",
  subplot: "subplot(다중 그래프)",
  scatter: "scatter(산점도)",
  hist: "hist(히스토그램)",
  box: "boxplot(상자 그래프)",
  bar: "bar·xlabel·ylabel·ylim·text(막대 그래프)",
  pie: "pie·autopct(파이 차트)",
  csv: "기온 CSV 내려받기·업로드·read_csv",
} as const;

const questions: Question[] = [
  // ───────────────────────────── 1. 맷플롯립·그래프 유형 (s.3~7)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-types-001",
    topic: T.types,
    type: "match",
    difficulty: 1,
    slideRef: "Lec7 s.3-6",
    prompt: "s.3~6의 맷플롯립 그래프 유형과 설명을 바르게 짝지으시오.",
    pairs: [
      { left: "기본 플롯", right: "데이터를 (x, y) 쌍으로 표현" },
      { left: "배열과 필드 플롯", right: "데이터 Z(x, y)와 필드 U(x, y), V(x, y)의 배열을 표현" },
      { left: "통계 플롯", right: "데이터 분포를 시각화하여 통계 분석에 적합" },
      { left: "비정형 좌표", right: "좌표(x, y)에서의 값 z를 등고선으로 시각화" },
    ],
    explanation:
      "s.3: 맷플롯립(Matplotlib)은 파이썬 데이터 과학 분야에서 가장 널리 쓰는 시각화 라이브러리이고, 기본 플롯은 데이터를 (x, y) 쌍으로 표현한다. s.4: 배열과 필드 플롯은 Z(x, y)와 U(x, y)·V(x, y) 배열을, s.5: 통계 플롯은 데이터 분포를 시각화해 통계 분석에 알맞고, s.6: 비정형 좌표는 좌표 (x, y)의 값 z를 등고선으로 나타낸다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-types-002",
    topic: T.types,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec7 s.7",
    prompt: "s.7 기본 차트 설명의 빈칸을 채우시오.",
    text: "기본 차트는 맷플롯립의 하위 패키지인 {{0}}을(를) 사용한다. 그 안의 plot( ) 함수는 시간 데이터를 x축에 두고 연속형 변수의 추세를 살펴볼 때 쓰는 {{1}} 그래프를 작성한다.",
    blanks: [{ accept: ["파이플롯", "Pyplot", "pyplot"] }, { accept: ["꺾은선", "Line chart", "line chart", "라인"] }],
    explanation:
      "s.7: 맷플롯립의 하위 패키지인 **파이플롯(Pyplot)**을 사용하고(`import matplotlib.pyplot as plt`), 파이플롯의 plot( ) 함수는 **꺾은선 그래프(Line chart)**를 작성한다. 꺾은선 그래프는 시간 데이터를 x축에 두고 연속형 변수의 추세를 살펴볼 때 쓴다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-types-003",
    topic: T.types,
    type: "classify",
    difficulty: 2,
    slideRef: "Lec7 s.7·s.14-19",
    prompt: "보고 싶은 것에 알맞은 그래프를 분류하시오.",
    buckets: ["꺾은선 그래프", "산점도", "히스토그램", "상자 그래프", "막대 그래프", "파이 차트"],
    items: [
      { label: "시간 데이터를 x축에 두고 연속형 변수의 추세", bucket: "꺾은선 그래프" },
      { label: "두 연속형 변수 값의 분포 또는 상관관계", bucket: "산점도" },
      { label: "연속형 변수의 구간별 분포", bucket: "히스토그램" },
      { label: "최댓값·최솟값·중앙값·사분위수로 본 분포와 이상치", bucket: "상자 그래프" },
      { label: "범주형 변수끼리 연속형 값 비교", bucket: "막대 그래프" },
      { label: "범주형 변수끼리 연속형 값의 비율 비교", bucket: "파이 차트" },
    ],
    explanation:
      "s.7: 꺾은선 그래프는 시간 데이터를 x축에 두고 연속형 변수의 추세를 본다. s.14: 산점도는 두 연속형 변수 값의 분포 또는 상관관계, s.15: 히스토그램은 연속형 변수의 구간별 분포, s.16: 상자 그래프는 최댓값·최솟값·중앙값·사분위수로 분포를 보고 수염 바깥 값을 이상치로 표시한다. s.18: 막대 그래프는 범주형 변수끼리 연속형 값을 비교하고, s.19: 파이 차트는 그 **비율**을 비교한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-types-004",
    topic: T.types,
    type: "multi",
    difficulty: 1,
    slideRef: "Lec7 s.14-19",
    prompt: "**범주형 변수**(과목 이름·과일 이름처럼 종류를 나타내는 값)끼리 연속형 값을 비교하는 그래프 함수를 모두 고르시오.",
    choices: ["plt.bar( )", "plt.pie( )", "plt.hist( )", "plt.scatter( )", "plt.boxplot( )"],
    answerIndexes: [0, 1],
    explanation:
      "s.18: 막대 그래프 plt.bar( )는 범주형 변수끼리 연속형 값을 비교하고(과목별 성적), s.19: 파이 차트 plt.pie( )는 범주형 변수끼리 연속형 값의 비율을 비교한다(과일 소비량). hist( )(구간별 분포)·scatter( )(두 연속형 변수)·boxplot( )(분포)은 연속형 변수를 다룬다.",
  },

  // ───────────────────────────── 2. plot·title·show (s.7~8)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-plot-001",
    topic: T.plot,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.8",
    prompt: "[코드 7-1]을 실행하면 꺾은선의 네 점이 놓이는 **x 좌표**는?",
    code: { language: "python", source: C71() },
    choices: ["0, 1, 2, 3", "-1, 2, 3, 4", "1, 2, 3, 4", "x 값 리스트가 없어서 오류가 난다"],
    answerIndex: 0,
    verify: MPL,
    explanation:
      "s.7: plot( )의 형식은 `plt.plot([x값 리스트], y값 리스트, ['포맷 스타일'])`로, 대괄호로 묶인 x값 리스트와 포맷 스타일은 생략할 수 있다. [코드 7-1]은 리스트 하나만 넘겼으므로 [-1, 2, 3, 4]가 **y값**이 된다. (보충) x값을 생략하면 0부터 시작하는 인덱스 0, 1, 2, 3을 x 좌표로 쓴다(로컬 맷플롯립 실행으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-plot-002",
    topic: T.plot,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.8",
    prompt: "[코드 7-1]에서 그래프에 제목 '대한민국'을 붙이고, 속성 메시지 없이 그래프만 깔끔하게 보여 주도록 빈칸을 채우시오.",
    language: "python",
    source: C71("{{0}}", "{{1}}"),
    blanks: [{ accept: ["title"], wrong: ["xlabel"] }, { accept: ["show"] }],
    verify: MPL,
    explanation:
      "s.8: `plt.title('대한민국')`이 그래프 제목을 붙인다. 파이플롯의 **show( )** 함수를 마지막에 적으면 속성 관련 메시지는 생략되고 그래프만 깔끔하게 출력된다. xlabel( )은 x축 이름이라 제목 자리에 쓰이지 않는다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-plot-003",
    topic: T.plot,
    type: "ox",
    difficulty: 1,
    slideRef: "Lec7 s.8",
    prompt: "plt.show( ) 함수를 코드 마지막에 적으면 속성 관련 메시지는 생략되고 그래프만 깔끔하게 출력된다.",
    answer: true,
    explanation: "s.8: 파이플롯의 show() 함수를 마지막에 적으면 속성 관련 메시지는 생략되고 그래프만 깔끔하게 출력된다.",
  },

  // ───────────────────────────── 3. 한글 폰트 (s.8~10)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-font-001",
    topic: T.font,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.8",
    prompt: "[코드 7-1]에서 글꼴을 맑은 고딕으로 정하고, 축의 음수 기호가 제대로 보이게 설정하도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import matplotlib.pyplot as plt",
      "",
      "plt.{{0}}['font.family'] = 'Malgun Gothic'",
      "plt.rcParams['axes.{{1}}'] = False",
      "",
      "plt.title('대한민국')",
      "plt.plot([-1, 2, 3, 4])",
      "plt.show()",
    ),
    blanks: [{ accept: ["rcParams"], wrong: ["rc"] }, { accept: ["unicode_minus"] }],
    verify: MPL,
    explanation:
      "s.8 [코드 7-1]: `plt.rcParams['font.family'] = 'Malgun Gothic'`으로 글꼴을, `plt.rcParams['axes.unicode_minus'] = False`로 축의 음수 기호 표시를 설정한다. rcParams는 대괄호로 설정값을 바꾸는 사전이고, rc는 `plt.rc('font', family=…)`처럼 괄호로 부르는 함수라 `plt.rc['font.family']`는 TypeError다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-font-002",
    topic: T.font,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.8·s.10",
    prompt: "한글 폰트를 지정할 때 `plt.rcParams['axes.unicode_minus'] = False`를 함께 적는 이유로 가장 알맞은 것은?",
    choices: [
      "한글 폰트에는 유니코드 마이너스 기호(−)가 없어 축의 음수 기호가 깨질 수 있으므로, 일반 하이픈(-)으로 표시하게 하려고",
      "음수 값을 그래프에서 빼고 양수만 그리려고",
      "y축이 항상 0부터 시작하게 하려고",
      "한글 제목을 굵은 글씨로 표시하려고",
    ],
    answerIndex: 0,
    explanation:
      "s.10 [코드 7-3] 주석: `plt.rcParams['axes.unicode_minus'] = False` 줄의 주석은 '#축의 음수 기호 표시'다. [코드 7-1]·[코드 7-3] 모두 y값에 -1이 있어 축에 음수 눈금이 나온다. (보충) 기본값 True면 눈금의 음수 기호를 유니코드 마이너스(U+2212)로 쓰는데, 맑은 고딕·나눔고딕 같은 한글 폰트에는 이 글자가 없어 네모로 깨질 수 있다. False로 두면 일반 하이픈(-)을 쓴다(로컬 맷플롯립의 눈금 표시 함수로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-font-003",
    topic: T.font,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.10",
    prompt: "[코드 7-3]처럼 설치한 나눔고딕 폰트를 **함수 호출**로 지정하도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "import matplotlib.pyplot as plt",
      "",
      "plt.{{0}}('font', family='NanumGothic')",
      "plt.rcParams['axes.unicode_minus'] = False   #축의 음수 기호 표시",
      "",
      "plt.plot([-1, 2, 3, 4])",
      "plt.title('대한민국')",
      "plt.show()",
    ),
    blanks: [{ accept: ["rc"], wrong: ["rcParams"] }],
    verify: MPL,
    explanation:
      "s.10 [코드 7-3]: `plt.rc('font', family='NanumGothic')`. rc( )는 설정 묶음 이름('font')과 키워드 인자로 값을 바꾸는 함수다. rcParams는 사전이라 괄호로 부를 수 없다(TypeError) — [코드 7-1]처럼 `plt.rcParams['font.family'] = …`로 써야 한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-font-004",
    topic: T.font,
    type: "order",
    difficulty: 1,
    slideRef: "Lec7 s.9-10",
    prompt: "Colab에서 한글 폰트를 설치해 그래프에 적용하는 과정을 순서대로 놓으시오.",
    items: [
      "나눔 폰트 설치 코드([코드 7-2])를 실행한다",
      "런타임을 재시작한다",
      "plt.rc('font', family='NanumGothic')로 폰트를 지정한다",
      "같은 그래프를 다시 출력해 폰트가 적용되었는지 확인한다",
    ],
    explanation:
      "s.9: [코드 7-2]로 폰트를 설치한 뒤 **런타임을 재시작해야** 설치한 폰트가 적용된다. s.10: [코드 7-3]에서 `plt.rc('font', family='NanumGothic')`로 폰트를 지정하고, 같은 그래프를 다시 출력해 폰트가 적용되었는지 확인한다.",
  },

  // ───────────────────────────── 4. 포맷 문자열 (s.11~13)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-fmt-001",
    topic: T.fmt,
    type: "match",
    difficulty: 1,
    slideRef: "Lec7 s.11-13",
    prompt: "plot( )의 포맷 문자열에 쓰는 글자와 뜻을 바르게 짝지으시오.",
    pairs: [
      { left: "'r'", right: "빨간색" },
      { left: "'k'", right: "검은색" },
      { left: "'s'", right: "사각형 마커" },
      { left: "'.'", right: "점 마커" },
      { left: "':'", right: "점선" },
      { left: "'--'", right: "파선" },
    ],
    explanation:
      "s.11 [코드 7-4] 주석: 'rs:' = 빨간색(r), 사각형 마커(s), 점선(:). s.12 [코드 7-5]: 'k' = 검은색 실선, 'r--' = 빨간색 파선, 'g.' = 선 없이 초록색 점 마커. s.13 [코드 7-6]의 'y^'는 노란색 삼각형 마커다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-fmt-002",
    topic: T.fmt,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec7 s.11",
    prompt: "`plt.plot(year, price, 'rs:')`가 그리는 그래프의 모양은?",
    choices: ["빨간색 · 사각형 마커 · 점선", "빨간색 · 사각형 마커 · 실선", "빨간색 · 삼각형 마커 · 파선", "초록색 · 점 마커 · 점선"],
    answerIndex: 0,
    explanation:
      "s.11 [코드 7-4] 주석 '#빨간색, 사각형 마커, 점선': r은 빨간색, s는 사각형(square) 마커, :는 점선이다. 실선은 -, 파선은 --, 삼각형 마커는 ^다(로컬 맷플롯립으로 선의 색·마커·스타일 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-fmt-003",
    topic: T.fmt,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec7 s.12-13",
    prompt: "plt.plot(값, 포맷)에서 **선 없이 마커만** 찍는 포맷 문자열을 모두 고르시오.",
    choices: ["'g.'", "'y^'", "'rs'", "'k'", "'r--'", "'rs:'"],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.12 [코드 7-5] 주석: 'g.'는 '선 없이 초록색 점 마커로 표시'다. 포맷 문자열에 선 스타일(-·--·:)이 없고 마커만 있으면 선을 긋지 않는다 — s.13의 'y^'(노란색 삼각형 마커), 'rs'(빨간색 사각형 마커)도 같다. 'k'는 검은색 실선(마커도 선 스타일도 없으면 실선), 'r--'는 빨간색 파선, 'rs:'는 사각형 마커를 점선으로 잇는다(로컬 맷플롯립으로 선 스타일 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-fmt-004",
    topic: T.fmt,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.11-12",
    prompt: "[코드 7-4]를 바꿔 **초록색, 원(o) 마커, 파선**으로 그리도록 포맷 문자열을 채우시오.",
    language: "python",
    source: C74(undefined, "'{{0}}')"),
    blanks: [{ accept: ["go--", "g--o", "og--", "o--g", "--go", "--og"], wrong: ["g-o", "go:"] }],
    verify: MPL,
    explanation:
      "s.11·s.12: 포맷 문자열은 색(g = 초록색)·마커(o = 원)·선 스타일(-- = 파선)을 이어 쓴다. 'go--'처럼 쓰며, 세 부분의 순서는 바뀌어도 같은 그래프다(로컬 맷플롯립으로 6가지 순서 모두 확인). 'g-o'는 실선, 'go:'는 점선이다.",
  },

  // ───────────────────────────── 5. axis (s.11)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-axis-001",
    topic: T.axis,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.11",
    prompt: "[코드 7-4]에서 x축을 2013~2024, y축을 20000~70000으로 지정하도록 axis( )의 인자를 채우시오.",
    language: "python",
    source: C74("plt.axis({{0}})"),
    blanks: [
      { accept: ["[2013, 2024, 20000, 70000]", "(2013, 2024, 20000, 70000)"], wrong: ["2013, 2024, 20000, 70000", "[2013, 20000, 2024, 70000]"] },
    ],
    verify: MPL,
    explanation:
      "s.11 [코드 7-4]: `plt.axis([2013, 2024, 20000, 70000])` — x 최솟값, x 최댓값, y 최솟값, y 최댓값 순서의 값 4개를 **리스트 하나로** 넘긴다(튜플도 같음). (보충) 슬라이드 형식 설명은 `plt.axis(x 최솟값, x 최댓값, y 최솟값, y 최댓값)`으로 괄호 없이 적혀 있지만, 실제 axis( )에 값 4개를 따로 넘기면 TypeError다(로컬 맷플롯립 실행으로 확인). [2013, 20000, 2024, 70000]은 x 범위가 2013~20000이 된다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-axis-002",
    topic: T.axis,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec7 s.11",
    prompt: "[코드 7-4]를 실행한 그래프의 축 범위는?",
    code: { language: "python", source: C74() },
    choices: ["x축 2013~2024, y축 20000~70000", "x축 2013~20000, y축 2024~70000", "x축 20000~70000, y축 2013~2024", "x축 2014~2023, y축 25000~63000"],
    answerIndex: 0,
    verify: MPL,
    explanation:
      "s.11: axis( )의 리스트는 x 최솟값, x 최댓값, y 최솟값, y 최댓값 순서다. 그래서 x축은 2013~2024, y축은 20000~70000이다. 2014~2023·25000~63000은 데이터의 최솟값·최댓값일 뿐, axis( )로 범위를 지정하면 그 값을 따른다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-axis-003",
    topic: T.axis,
    type: "ox",
    difficulty: 2,
    slideRef: "Lec7 s.11",
    prompt: "`plt.axis(2013, 2024, 20000, 70000)`처럼 값 4개를 리스트로 묶지 않고 따로 넘겨도 축 범위가 지정된다.",
    answer: false,
    falseReason: "실제 axis( )는 값 4개를 리스트(또는 튜플) 하나로 받는다 — 따로 넘기면 TypeError다.",
    explanation:
      "s.11: 슬라이드 형식 설명은 `plt.axis(x 최솟값, x 최댓값, y 최솟값, y 최댓값)`이지만 [코드 7-4]는 `plt.axis([2013, 2024, 20000, 70000])`처럼 리스트로 넘긴다. (보충) 값 4개를 따로 넘기면 'axis() takes from 0 to 1 positional arguments but 4 were given' TypeError가 난다(로컬 맷플롯립 실행으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-axis-004",
    topic: T.axis,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.11",
    prompt: "슬라이드 [코드 7-4]의 3번째 줄 `plt.plot(year, price, 'rs:’)`는 곧은 따옴표(')로 열고 **굽은 따옴표(’)**로 닫혀 있다. 이 줄을 슬라이드에서 그대로 복사해 실행하면 어떻게 되는가?",
    choices: [
      "SyntaxError — 'rs:로 시작한 문자열이 곧은 따옴표로 닫히지 않는다",
      "TypeError — 포맷 문자열 'rs:'를 해석할 수 없다",
      "NameError — year가 정의되지 않았다",
      "오류 없이 빨간색 사각형 마커 점선이 그려진다",
    ],
    answerIndex: 0,
    explanation:
      "s.11 [코드 7-4]의 3번째 줄은 곧은 따옴표(')로 열고 굽은 따옴표(’)로 닫혀 있다. 파이썬은 굽은 따옴표를 문자열 끝으로 보지 않으므로 문자열이 닫히지 않아 SyntaxError(unterminated string literal)가 난다(로컬 실행으로 확인). (보충) 슬라이드·문서 프로그램에서 복사한 코드는 굽은 따옴표를 곧은 따옴표로 고쳐야 한다 — s.12 [코드 7-5]의 label='one’, s.18 [코드 7-10]의 'Grade’도 같다.",
  },

  // ───────────────────────────── 6. 그래프 여러 개·legend (s.12)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-legend-001",
    topic: T.legend,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.12",
    prompt: "[코드 7-5]에서 첫 번째 그래프에 범례 이름 'one'을 붙이고 범례를 표시하도록 빈칸을 채우시오.",
    language: "python",
    source: C75("{{0}}", "{{1}}"),
    blanks: [{ accept: ["label"] }, { accept: ["legend"] }],
    verify: MPL,
    explanation:
      "s.12 [코드 7-5]: 각 plot( )에 `label='이름'`을 주고 `plt.legend()`를 부르면 그 이름으로 범례가 표시된다(legend( ) 함수로 범례를 표시). x축을 공동으로 사용해 한 차트에 그래프 세 개가 그려진다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-legend-002",
    topic: T.legend,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.12",
    prompt: "[코드 7-5]로 그린 그래프에 대한 설명으로 옳은 것은?",
    code: { language: "python", source: C75() },
    choices: [
      "축 하나에 그래프 세 개가 그려지고, 범례에 one·two·three가 표시된다",
      "축이 세 개인 다중 그래프가 된다",
      "세 번째 그래프('g.')는 초록색 실선으로 그려진다",
      "두 번째 그래프('r--')는 빨간색 점선으로 그려진다",
    ],
    answerIndex: 0,
    verify: MPL,
    explanation:
      "s.12: x축을 공동으로 사용해 한 차트에 그래프 여러 개를 나타낸다 — 축은 하나다(축이 여러 개인 다중 그래프는 s.13 subplot). label을 준 세 그래프가 legend( )로 범례에 표시된다. 'g.'는 선 없이 초록색 점 마커, 'r--'는 빨간색 **파선**이다(로컬 맷플롯립으로 축 수·선 스타일·범례 확인).",
  },

  // ───────────────────────────── 7. subplot (s.13)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-subplot-001",
    topic: T.subplot,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec7 s.13",
    prompt: "`plt.subplot(2, 2, 3)` 다음에 그린 그래프는 2행 2열 격자의 어디에 놓이는가?",
    choices: ["왼쪽 아래(2행 1열)", "오른쪽 위(1행 2열)", "오른쪽 아래(2행 2열)", "왼쪽 위(1행 1열)"],
    answerIndex: 0,
    explanation:
      "s.13 [코드 7-6] 주석 '2행 2열 중 세 번째 그래프': subplot(행 수, 열 수, 번호)이고 번호는 1부터 왼쪽 위에서 오른쪽으로, 다음 행으로 센다. 1 = 왼쪽 위, 2 = 오른쪽 위, 3 = 왼쪽 아래, 4 = 오른쪽 아래다(로컬 맷플롯립으로 격자 위치 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-subplot-002",
    topic: T.subplot,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.13",
    prompt: "[코드 7-6]에서 마지막 그래프가 **2행 2열 중 네 번째** 칸에 그려지도록 subplot( )의 인자를 채우시오.",
    language: "python",
    source: C76("{{0}}"),
    blanks: [{ accept: ["2, 2, 4", "224"], wrong: ["2, 2, 3"] }],
    verify: MPL,
    explanation:
      "s.13: `plt.subplot(2, 2, 4)` — 2행 2열 중 네 번째 그래프(오른쪽 아래). (보충) 세 숫자가 모두 한 자리면 `plt.subplot(224)`처럼 붙여 써도 같다(로컬 맷플롯립으로 확인). 2, 2, 3을 다시 쓰면 세 번째 칸에 겹쳐 그려져 축이 3개가 된다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-subplot-003",
    topic: T.subplot,
    type: "ox",
    difficulty: 2,
    slideRef: "Lec7 s.13",
    prompt: "파이썬 인덱스처럼 subplot의 번호도 0부터 시작하므로, `plt.subplot(2, 2, 0)`이 첫 번째 칸이다.",
    answer: false,
    falseReason: "subplot의 번호는 1부터 시작한다 — plt.subplot(2, 2, 1)이 첫 번째 칸이고, 0을 쓰면 ValueError다.",
    explanation:
      "s.13: '인덱스는 파이썬의 기본적인 인덱싱과 조금 다르니 주의' — [코드 7-6]은 subplot(2, 2, 1)~(2, 2, 4)로 네 칸을 쓴다. 번호는 1부터다. (보충) 0을 넘기면 ValueError가 난다(로컬 맷플롯립 실행으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-subplot-004",
    topic: T.subplot,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.13",
    prompt: "[코드 7-6]으로 만든 그래프에 대한 설명으로 옳은 것은?",
    code: { language: "python", source: C76() },
    choices: [
      "축이 4개이고, 세 번째 칸(왼쪽 아래)에는 선 없이 노란색 삼각형 마커가 찍힌다",
      "축이 1개이고 그래프 4개가 겹쳐 그려진다",
      "두 번째 칸 그래프는 alpha=0.7 때문에 점선으로 그려진다",
      "네 번째 칸에는 초록색 실선이 그려진다",
    ],
    answerIndex: 0,
    verify: MPL,
    explanation:
      "s.13: 다중 그래프(Multi graph)는 축이 여러 개다 — subplot(2, 2, n)으로 축 4개를 만든다. 세 번째 칸 'y^'는 노란색 삼각형 마커만, 네 번째 칸 'g.'는 선 없이 초록색 점 마커다. alpha=0.7은 선의 투명도라 선 스타일(빨간색 실선)은 그대로다(로컬 맷플롯립으로 축 수·위치·선 스타일 확인).",
  },

  // ───────────────────────────── 8. scatter (s.14)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-scatter-001",
    topic: T.scatter,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.14",
    prompt: "[코드 7-7] 연도별 상품가격 산점도를 **초록색, 크기 50, 삼각형 마커**로 그리도록 빈칸을 채우시오.",
    language: "python",
    source: py("year = [2014, 2017, 2020, 2023]", "price = [25000, 31000, 53000, 63000]", "plt.scatter(year, price, {{0}}='g', {{1}}=50, marker='^')", "plt.show()"),
    blanks: [{ accept: ["c"] }, { accept: ["s"], wrong: ["size"] }],
    verify: MPL,
    explanation:
      "s.14 형식: `plt.scatter(x값 리스트, y값 리스트, c='색상', s=크기, marker='모양')`. [코드 7-7]은 c='g', s=50, marker='^'다. size라는 인자는 없어 오류가 난다(로컬 맷플롯립 실행으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-scatter-002",
    topic: T.scatter,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec7 s.14",
    prompt: "`plt.scatter(year, price, c='g', s=50, marker='^')`의 인자 뜻을 채우시오.",
    text: "s=50은 마커의 {{0}}, c='g'는 마커의 {{1}}, marker='^'는 마커의 모양을 정한다.",
    blanks: [{ accept: ["크기", "사이즈"] }, { accept: ["색상", "색", "색깔"] }],
    explanation:
      "s.14: 산점도(Scatter Plot)는 두 연속형 변수 값의 분포 또는 상관관계를 나타내며, 형식은 `plt.scatter(x값 리스트, y값 리스트, c='색상', s=크기, marker='모양')`이다(로컬 맷플롯립으로 크기 50·초록색 확인).",
  },

  // ───────────────────────────── 9. hist (s.15)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-hist-001",
    topic: T.hist,
    type: "mcq",
    difficulty: 3,
    slideRef: "Lec7 s.15",
    prompt: "[코드 7-8] 주사위 결과 히스토그램에서 **왼쪽 구간부터** 막대 높이(도수)를 차례로 쓴 것은?",
    code: { language: "python", source: py("numbers = [5, 4, 4, 1, 6, 3, 4, 1, 2, 2]", "plt.hist(numbers, bins=6)", "plt.show()") },
    choices: ["2, 2, 1, 3, 1, 1", "2, 0, 2, 0, 1, 0, 3, 0, 1, 1", "1, 2, 3, 4, 5, 6", "2, 2, 1, 3, 1, 1, 0"],
    answerIndex: 0,
    verify: MPL,
    explanation:
      "s.15: `plt.hist(값 리스트, bins=구간의 수)` — 주사위를 10번 던져 1~6이 몇 번씩 나왔는지 본다. bins=6이라 막대는 6개이고, 1·2는 2번, 3은 1번, 4는 3번, 5·6은 1번이다. (보충) 구간은 최솟값 1~최댓값 6을 6등분(폭 약 0.83)해 눈 하나가 구간 하나에 들어간다. bins를 생략하면 기본 10구간이라 빈 구간이 섞인 2, 0, 2, 0, 1, 0, 3, 0, 1, 1이 된다(로컬 맷플롯립으로 막대 높이 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-hist-002",
    topic: T.hist,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.15",
    prompt: "[코드 7-8]에서 구간의 수를 6개로 정하도록 빈칸을 채우시오.",
    language: "python",
    source: py("numbers = [5, 4, 4, 1, 6, 3, 4, 1, 2, 2]", "plt.hist(numbers, {{0}}=6)", "plt.show()"),
    blanks: [{ accept: ["bins"], wrong: ["bin"] }],
    verify: MPL,
    explanation: "s.15: `plt.hist(값 리스트, bins=구간의 수)` — 인자 이름은 복수형 **bins**다. bin은 없는 인자라 오류가 난다(로컬 맷플롯립 실행으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-hist-003",
    topic: T.hist,
    type: "ox",
    difficulty: 2,
    slideRef: "Lec7 s.15",
    prompt: "[코드 7-8]에서 bins=6을 빼고 `plt.hist(numbers)`만 쓰면 주사위 눈 수에 맞춰 구간이 6개로 자동 설정된다.",
    answer: false,
    falseReason: "bins를 생략하면 데이터와 상관없이 기본 10구간으로 나눈다.",
    explanation:
      "s.15: 구간의 수는 bins로 정한다. (보충) bins를 생략하면 맷플롯립 기본값 10구간이 쓰여, [코드 7-8] 데이터는 막대 10개 중 4개가 빈 구간이 된다(로컬 맷플롯립 실행으로 확인).",
  },

  // ───────────────────────────── 10. boxplot (s.16~17)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-box-001",
    topic: T.box,
    type: "multi",
    difficulty: 1,
    slideRef: "Lec7 s.16",
    prompt: "s.16 상자 그래프(Box plot) 설명으로 옳은 것을 모두 고르시오.",
    choices: [
      "제1사분위수(Q1)와 제3사분위수(Q3)를 양 끝으로 하는 상자를 그린다",
      "상자 안의 수평선은 중앙값이다",
      "상자 길이(IQR)의 1.5배 안에 있는 데이터를 기준으로 수염을 표시한다",
      "수염 바깥의 데이터는 작은 원으로 표시하고 이상치로 본다",
      "상자 안의 수평선은 평균이다",
      "수염의 끝은 언제나 데이터의 최솟값과 최댓값이다",
    ],
    answerIndexes: [0, 1, 2, 3],
    explanation:
      "s.16: ① Q1과 Q3을 양 끝으로 하는 상자를 그리고 ② 상자 안에 중앙값을 수평선으로 표시한다. ③ Q1~Q3 범위를 사분범위(IQR)라 하며 상자 길이의 1.5배 안에 있는 데이터를 기준으로 수염을 표시하고, ④ 수염 바깥 데이터는 작은 원(이상치, Outliers)이다. 그래서 이상치가 있으면 수염 끝은 최솟값·최댓값이 아니다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-box-002",
    topic: T.box,
    type: "multi",
    difficulty: 3,
    slideRef: "Lec7 s.16-17",
    prompt: "[코드 7-9]의 상자 그래프에서 수염 바깥의 **작은 원(이상치)**으로 표시되는 값을 모두 고르시오.",
    code: { language: "python", source: py(NUMBERS_79, "plt.boxplot(numbers)", "plt.show()") },
    choices: ["0", "1.4", "2.5", "5.7", "9"],
    answerIndexes: [0, 3, 4],
    verify: MPL,
    explanation:
      "s.16 ③④: IQR = Q3 − Q1이고 1.5 × IQR 안의 데이터를 기준으로 수염을 그린다. (보충) 맷플롯립(boxplot_stats)은 Q1 = 1.65, Q3 = 2.425(선형 보간 사분위수), IQR = 0.775로 계산한다. 수염 범위는 1.65 − 1.1625 = 0.4875 ~ 2.425 + 1.1625 = 3.5875라 0, 5.7, 9가 이상치이고, 수염 끝은 그 안의 최솟값 1.4·최댓값 2.5다(로컬 맷플롯립으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-box-003",
    topic: T.box,
    type: "calc",
    difficulty: 3,
    slideRef: "Lec7 s.16-17",
    prompt:
      "[코드 7-9]의 `numbers = [0, 1.4, 1.6, 1.8, 1.85, 1.9, 2.2, 2.5, 5.7, 9]`를 상자 그래프로 그리면 Q1 = 1.65, Q3 = 2.425다. **위쪽 수염의 끝** 값은?",
    answer: 2.5,
    tolerance: 0,
    steps: ["IQR = 2.425 − 1.65 = 0.775", "위쪽 한계 = Q3 + 1.5 × IQR = 2.425 + 1.1625 = 3.5875", "3.5875 이하인 가장 큰 데이터 = 2.5 (5.7·9는 이상치)"],
    explanation:
      "s.16 ③: 상자 길이(IQR)의 1.5배 안에 있는 데이터를 기준으로 수염을 표시한다. Q3 + 1.5 × IQR = 3.5875 안의 가장 큰 값 2.5가 위쪽 수염 끝이고, 5.7·9는 ④ 수염 바깥의 이상치(작은 원)다. (보충) Q1·Q3은 맷플롯립 boxplot_stats 기준(선형 보간)이고, 수염 끝은 한계값 3.5875가 아니라 실제 데이터 값이다(로컬 맷플롯립으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-box-004",
    topic: T.box,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.17",
    prompt: "[코드 7-9]에서 numbers의 분포를 **상자 그래프**로 그리도록 빈칸을 채우시오.",
    language: "python",
    source: py(NUMBERS_79, "plt.{{0}}(numbers)", "plt.show()"),
    blanks: [{ accept: ["boxplot"], wrong: ["hist"] }],
    verify: MPL,
    explanation: "s.17 [코드 7-9]: `plt.boxplot(numbers)`. hist( )는 구간별 분포를 막대로 그리는 히스토그램이다.",
  },

  // ───────────────────────────── 11. bar·xlabel·ylabel·ylim·text (s.18)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-bar-001",
    topic: T.bar,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.18",
    prompt: "[코드 7-10]에서 x축 이름 'Subject', y축 이름 'Grade'를 붙이고 y축 범위를 0~100으로 정하도록 빈칸을 채우시오.",
    language: "python",
    source: C710("{{0}}", "{{1}}", "{{2}}"),
    blanks: [{ accept: ["xlabel"] }, { accept: ["ylabel"] }, { accept: ["ylim"], wrong: ["xlim"] }],
    verify: MPL,
    explanation:
      "s.18 [코드 7-10]: `plt.xlabel('Subject')`·`plt.ylabel('Grade')`가 축 이름을, `plt.ylim(0,100)`이 y축 범위를 정한다. xlim은 x축 범위라 막대 그래프의 y축은 그대로다. (보충) 슬라이드의 `plt.ylabel('Grade’)`는 닫는 따옴표가 굽은 따옴표라 곧은 따옴표로 고쳤다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-bar-002",
    topic: T.bar,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.18",
    prompt: "[코드 7-10]에서 `plt.text(0,90, 'Good!')`이 글자를 쓰는 곳은?",
    code: { language: "python", source: C710() },
    choices: ["KOR 막대 위쪽, 높이 90인 곳", "MATH 막대 위쪽, 높이 90인 곳", "x = 90, y = 0인 곳", "그래프 제목(Report) 자리"],
    answerIndex: 0,
    verify: MPL,
    explanation:
      "s.18: text(x, y, 글자)는 데이터 좌표 (x, y)에 글자를 쓴다. 막대 그래프의 범주 'KOR', 'ENG', 'MATH'는 x = 0, 1, 2 자리에 놓이므로 x = 0은 KOR 막대, y = 90은 KOR 성적 85보다 조금 위다(ylim(0,100) 안). (보충) 범주 이름이 0부터 차례로 x 좌표를 갖는 것은 로컬 맷플롯립으로 확인했다.",
  },

  // ───────────────────────────── 12. pie·autopct (s.19)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-pie-001",
    topic: T.pie,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.19",
    prompt:
      "[코드 7-11]은 소비량 Apple 20, Banana 15, Cherry 5, Kiwi 5, Grape 10을 `autopct='%.1f%%'`로 그린 파이 차트다. **Apple** 조각에 표시되는 글자는?",
    choices: ["36.4%", "36.36%", "36%", "20.0%"],
    answerIndex: 0,
    explanation:
      "s.19: 파이 차트는 범주형 변수끼리 연속형 값의 비율을 비교한다. 전체 55 중 Apple 20은 20 ÷ 55 × 100 = 36.36…%이고, '%.1f%%'는 소수점 아래 한 자리까지 쓰고 % 기호를 붙이므로 36.4%다. 나머지는 Banana 27.3%, Cherry 9.1%, Kiwi 9.1%, Grape 18.2%다(로컬 맷플롯립으로 조각 글자 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-pie-002",
    topic: T.pie,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.19",
    prompt: "`plt.pie(…, autopct='%.1f%%')`의 `'%.1f%%'`가 뜻하는 것은?",
    choices: [
      "각 조각의 비율을 소수점 아래 한 자리까지의 백분율로 쓰고 뒤에 % 기호를 붙인다",
      "각 조각의 실제 값(20, 15 …)을 소수점 아래 한 자리까지 쓴다",
      "%%는 백분율을 한 번 더 계산하라는 뜻이라 비율의 비율을 표시한다",
      "백분율을 정수로 반올림해 36%처럼 표시한다",
    ],
    answerIndex: 0,
    explanation:
      "s.19 형식: `autopct='%.숫자f%%'`. %.1f는 비율(백분율 값)을 소수점 아래 한 자리까지 쓰라는 서식이고, %%는 % 기호 글자 하나를 뜻한다(서식 문자열에서 %는 서식 시작이라 두 번 써야 글자 %가 된다). [코드 7-11]의 Apple은 36.4%로 표시된다(로컬 맷플롯립으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-pie-003",
    topic: T.pie,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.19",
    prompt: "[코드 7-11]에서 조각마다 과일 이름을 붙이고, 비율을 소수점 아래 한 자리 백분율로 표시하도록 빈칸을 채우시오.",
    language: "python",
    source: C711("{{0}}=example_series.index, {{1}}='%.1f%%'"),
    blanks: [{ accept: ["labels"] }, { accept: ["autopct"] }],
    verify: MPL,
    explanation:
      "s.19 형식: `plt.pie(값 리스트, labels=레이블 리스트, autopct='%.숫자f%%', colors=색상, explode=띄우는 값 리스트)`. [코드 7-11]은 시리즈 값을 값 리스트로, `example_series.index`를 labels로 쓴다. (보충) 슬라이드의 `autopct=‘%.1f%%'`는 여는 따옴표가 굽은 따옴표라 곧은 따옴표로 고쳤다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-pie-004",
    topic: T.pie,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.19",
    prompt: "[코드 7-11]을 바꿔 비율을 **소수점 아래 두 자리** 백분율(예: 36.36%)로 표시하도록 autopct 값을 채우시오.",
    language: "python",
    source: C711("labels=example_series.index, autopct='{{0}}'"),
    blanks: [{ accept: ["%.2f%%"], wrong: ["%.1f%%", "%.2f%"] }],
    verify: MPL,
    explanation:
      "s.19: `autopct='%.숫자f%%'`의 숫자가 소수점 아래 자릿수다 — 두 자리면 '%.2f%%'. %를 하나만 쓴 '%.2f%'는 서식이 끝나지 않아 오류가 나고, '%.1f%%'는 한 자리(36.4%)다(로컬 맷플롯립 실행으로 확인).",
  },

  // ───────────────────────────── 13. 기온 CSV (s.21~25)
  {
    ...base,
    ...plain,
    id: "data-science-lec7-csv-001",
    topic: T.csv,
    type: "order",
    difficulty: 1,
    slideRef: "Lec7 s.21-23",
    prompt: "기상자료개방포털에서 서울의 2023년 기온 CSV를 내려받는 과정을 순서대로 놓으시오.",
    items: [
      "기상자료개방포털(data.kma.go.kr)에 접속해 회원가입 후 로그인한다",
      "[데이터 전체보기]-[기상관측]-[지상]을 차례로 선택한다",
      "[검색조건]에서 [자료형태]는 [일 자료], [기간]은 2023년 1월 1일~12월 31일로 설정한다",
      "[지점]은 [서울특별시], 데이터 종류는 [기온]을 선택하고 [조회]를 클릭한다",
      "[CSV]를 클릭해 '기온.csv' 파일로 저장한다",
    ],
    explanation:
      "s.21: 기상자료개방포털에 접속·로그인하고 [데이터 전체보기]-[기상관측]-[지상]을 선택해 지상 기상관측 데이터 조회 화면으로 간다. s.22: [검색조건]에서 [일 자료]와 2023년 1월 1일~12월 31일, [지점] [서울특별시]와 [기온]을 고르고 [조회]를 클릭한다. s.23: [CSV]를 클릭해 '기온.csv'로 저장한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-csv-002",
    topic: T.csv,
    type: "order",
    difficulty: 2,
    slideRef: "Lec7 s.24-25",
    prompt: "내려받은 '기온.csv'를 Colab에서 그래프로 그리기 전에 확인하는 과정을 순서대로 놓으시오.",
    items: [
      "Colab 왼쪽 도구 목록에서 폴더 모양 아이콘을 클릭해 디렉토리를 표시한다",
      "'기온.csv'를 디렉토리에 업로드하고 파일이 나타난 것을 확인한다",
      "한글 폰트 설치 코드([코드 7-18])를 실행하고 마지막 줄의 fc-cache: succeeded를 확인한다",
      "[런타임 다시 시작] 메뉴를 실행한다",
      "pd.read_csv('기온.csv', encoding='cp949')로 읽고 head(3)으로 확인한다",
    ],
    explanation:
      "s.24: Colab 왼쪽 도구 목록의 폴더 모양 아이콘으로 디렉토리를 표시하고 '기온.csv'를 업로드해 나타난 것을 확인한다. s.25: 시각화 전에 한글 폰트를 설치하고([코드 7-18]) 실행 결과 마지막 줄의 fc-cache: succeeded를 확인한 뒤 [런타임 다시 시작]을 실행한다. 그다음 [코드 7-19]로 데이터를 데이터프레임으로 읽어 확인한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-csv-003",
    topic: T.csv,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.25",
    prompt: "[코드 7-19]에서 cp949로 저장된 '기온.csv'를 읽고 앞의 3개 행을 확인하도록 빈칸을 채우시오.",
    language: "python",
    source: py("import matplotlib.pyplot as plt", "import pandas as pd", "", "#데이터를 데이터프레임 형태로 읽어오기", "df = pd.read_csv('기온.csv', {{0}}='cp949')", "df.{{1}}(3)"),
    blanks: [{ accept: ["encoding"] }, { accept: ["head"] }],
    verify: { mode: "skip", reason: "기온.csv(기상자료개방포털에서 내려받은 파일)가 있어야 실행된다 — 파일이 없어 실행 제외" },
    explanation:
      "s.25 [코드 7-19]: `pd.read_csv('기온.csv', encoding='cp949')`로 데이터프레임을 만들고 `df.head(3)`으로 앞 3개 행을 본다. (보충) 슬라이드의 `encoding='cp949’`는 닫는 따옴표가 굽은 따옴표라 곧은 따옴표로 고쳤다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7-csv-004",
    topic: T.csv,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.25",
    prompt: "[코드 7-19]에서 '기온.csv'를 읽을 때 `encoding='cp949'`를 주는 이유로 가장 알맞은 것은?",
    choices: [
      "파일의 한글이 cp949(한국어 윈도 인코딩)로 저장돼 있어, 기본값 utf-8로 읽으면 UnicodeDecodeError가 나기 때문",
      "cp949로 읽어야 숫자 열이 실수형으로 바뀌기 때문",
      "encoding을 주지 않으면 첫 줄이 열 이름으로 쓰이지 않기 때문",
      "Colab은 utf-8 파일을 읽을 수 없기 때문",
    ],
    answerIndex: 0,
    explanation:
      "s.25 [코드 7-19]: `df = pd.read_csv('기온.csv', encoding='cp949')`. Lec3에서처럼 한국어 윈도 프로그램이 만든 CSV는 한글을 cp949로 저장한다. (보충) 기상자료개방포털 CSV도 cp949로 내려받아지며, read_csv의 기본 인코딩 utf-8로 읽으면 한글 바이트를 해석하지 못해 UnicodeDecodeError가 난다(cp949로 저장한 한글 CSV로 로컬 실행해 확인). 숫자 변환·열 이름 줄은 인코딩과 관계없다.",
  },
];

export default questions;

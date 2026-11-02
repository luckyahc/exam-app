import type { Question } from "@/types/question";
import type { VerifySpec } from "@/lib/qtypes/base";

// Lec7 후반(기말, 2026-11-03) — 근거: source/data-science/Lec7.pdf s.26~59(기온 CSV 결측치·그래프, 워드클라우드, 네트워크X).
// s.21~25(기온 CSV 내려받기·업로드·read_csv)는 중간고사 lec7.ts의 csv-001~004가 이미 다뤄 여기서는 내지 않는다.
// 형식: docs/final/data-science-format.md. ⭐ 없음. 해설은 "s.번호:"로 시작한다.
// 판다스 코드는 기온.csv 대신 숨긴 준비 코드(작은 예시 df)로 Pyodide에서 실행 검증, 맷플롯립 코드는 로컬 CPython(lib/verify/matplotlib.test.ts),
// KoNLPy·wordcloud·networkx·apyori는 실행 엔진에 없어 실행 제외 — 그 안의 Counter·re.sub·데이터프레임 처리만 떼어 실행한다.

const base = { subject: "data-science", chapter: "lec7b" } as const;
const plain = { exam: false } as const;
const py = (...lines: string[]) => lines.join("\n");

const MPL: VerifySpec = { mode: "skip", reason: "맷플롯립 — 앱 실행 엔진(Pyodide)에 없어 로컬 CPython(Agg 백엔드)으로 검증", local: "matplotlib" };

/** 기온.csv 대신 쓰는 작은 예시: 최저기온 하나가 비어 있다 */
const TEMP = py(
  "import pandas as pd",
  "import numpy as np",
  "df = pd.DataFrame({'일시': ['2023-02-27', '2023-02-28', '2023-03-01', '2023-03-02', '2023-03-03'],",
  "                   '평균기온(°C)': [3.1, 4.0, 5.2, 6.8, 7.5],",
  "                   '최저기온(°C)': [-1.5, np.nan, 1.0, 2.2, 3.0],",
  "                   '최고기온(°C)': [8.0, 9.1, 10.4, 12.0, 13.3]})",
);
const TEMP_NOTE = "(df는 '기온.csv' 대신 쓰는 5일치 예시: 일시 2023-02-27~03-03, 2023-02-28의 최저기온만 결측치)";
/** 2023년 1년치 날짜(365행) */
const YEAR = py("import pandas as pd", "df2 = pd.DataFrame({'일시': pd.date_range('2023-01-01', '2023-12-31').strftime('%Y-%m-%d'), 'max_temp': 0.0})", "df2['일시'] = pd.to_datetime(df2['일시'], format='%Y-%m-%d')");
const PD = (setup: string): VerifySpec => ({ mode: "run", python: { packages: ["numpy", "pandas"], setup } });
const PD_OUT = (setup: string): VerifySpec => ({ mode: "run", python: { packages: ["numpy", "pandas"], setup }, check: { kind: "output" } });
const PY_RUN: VerifySpec = { mode: "run" };
const PY_OUT: VerifySpec = { mode: "run", check: { kind: "output" } };

/** [코드 7-36]의 apriori 결과 대신 쓰는 예시 데이터프레임 */
const RULES = py(
  "import pandas as pd",
  "df = pd.DataFrame({'items': [frozenset({'지진'}), frozenset({'지진', '튀르키예'}), frozenset({'구호', '지진'}),",
  "                             frozenset({'튀르키예', '구호', '지진'}), frozenset({'강진', '튀르키예'})],",
  "                   'support': [0.30, 0.05, 0.02, 0.015, 0.08]})",
);

const T = {
  missing: "기온 데이터 결측치(info·ffill)",
  rename: "열 이름 변경(rename)",
  line: "기온 꺾은선 그래프",
  date: "날짜형 변환·3월 추출",
  wc: "워드클라우드(KoNLPy·Counter)",
  token: "뉴스 제목 명사 추출(re.sub·nouns)",
  assoc: "연관규칙(지지도·신뢰도·향상도·apriori)",
  net: "네트워크 그래프(networkx·pagerank)",
} as const;

const questions: Question[] = [
  // ───────────────────────────── 1. 결측치 (s.26~27)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-missing-001",
    topic: T.missing,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec7 s.26-27",
    prompt: "[코드 7-20]의 `df.info()` 결과 365행 중 최저기온(°C)·최저기온 시각(hhmi) 열만 Non-Null Count가 364였다. [코드 7-21] `df2 = df.ffill()` 실행 뒤에 대한 설명으로 옳은 것을 모두 고르시오.",
    choices: [
      "결측치가 바로 위 행의 값으로 채워진다",
      "df2.info()에서 모든 열의 Non-Null Count가 365가 된다",
      "결측치가 있던 행이 지워져 df2는 364행이 된다",
      "결측치가 바로 아래 행의 값으로 채워진다",
      "원본 df의 결측치도 함께 채워진다",
    ],
    answerIndexes: [0, 1],
    explanation:
      "s.26: info( )로 개요를 출력해 결측치가 있는지 간단히 확인한다 — 최저기온(°C)·최저기온 시각(hhmi)이 364 non-null. s.27 [코드 7-21]: `df.ffill()`은 결측치를 바로 위 행의 값으로 채우고, df2.info()에서 모든 열이 365 non-null이 된다. 행을 지우는 것은 dropna, 아래 값으로 채우는 것은 bfill이다. (보충) ffill()은 새 데이터프레임을 돌려주므로 결과를 받은 df2만 바뀌고 df는 그대로다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-missing-002",
    topic: T.missing,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.27",
    prompt: `[코드 7-21] 결측치를 바로 위 행의 값으로 채운 df2를 만들도록 빈칸 #1을 채우시오. ${TEMP_NOTE}`,
    language: "python",
    source: py("df2 = df.{{0}}()", "print(df2['최저기온(°C)'].tolist())"),
    blanks: [{ accept: ["ffill"], wrong: ["bfill", "dropna"] }],
    verify: PD(TEMP),
    explanation:
      "s.27 [코드 7-21]: `df2 = df.ffill()` — 2023-02-28의 최저기온 결측치가 바로 위(02-27)의 -1.5로 채워진다. bfill( )은 바로 아래 값(1.0)으로 채우고, dropna( )는 그 행을 지운다.",
  },
  // ───────────────────────────── 2. 열 이름 변경 (s.28)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-rename-001",
    topic: T.rename,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.28",
    prompt: `[코드 7-22] 특수 문자가 들어 있는 열 이름 '최저기온(°C)'을 'min_temp'로 바꾸고, df2 자체를 바꾸도록 빈칸을 채우시오. ${TEMP_NOTE}`,
    language: "python",
    source: py("df2 = df.ffill()", "df2.rename({{0}}={'최저기온(°C)':'min_temp'}, {{1}}=True)", "print(df2.columns.tolist())"),
    blanks: [{ accept: ["columns"], wrong: ["index"] }, { accept: ["inplace"] }],
    verify: PD(TEMP),
    explanation:
      "s.28 [코드 7-22]: 열 이름을 영문 알파벳과 밑줄 기호(_)의 조합으로 바꾼다 — `df2.rename(columns={'최저기온(°C)':'min_temp'}, inplace=True)`. columns에 {기존 이름: 새 이름} 사전을 주고, inplace=True면 df2 자체가 바뀐다. index=를 주면 행 이름을 바꾸려 해 열 이름은 그대로다.",
  },
  // ───────────────────────────── 3. 꺾은선 그래프 (s.29, s.33)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-line-001",
    topic: T.line,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.29",
    prompt: "[코드 7-23] 세 선에 이름표를 달고 범례를 표시하도록 빈칸을 채우시오. (단, df2는 3일치 예시 데이터로 바꿨다)",
    language: "python",
    source: py(
      "import pandas as pd",
      "df2 = pd.DataFrame({'max_temp': [5.0, 7.5, 6.0], 'avg_temp': [1.0, 2.5, 2.0], 'min_temp': [-3.0, -1.0, -2.0]})",
      "plt.rcParams['axes.unicode_minus'] = False",
      "plt.title('서울시 2023년도 기온 변화')",
      "plt.plot(range(1,len(df2)+1), df2['max_temp'], {{0}}='최고기온', c='r')",
      "plt.plot(range(1,len(df2)+1), df2['avg_temp'], label='평균기온', c='y')",
      "plt.plot(range(1,len(df2)+1), df2['min_temp'], label='최저기온', c='b')",
      "plt.xlabel('일')",
      "plt.ylabel('기온')",
      "plt.{{1}}()",
      "plt.show()",
    ),
    blanks: [{ accept: ["label"] }, { accept: ["legend"], wrong: ["grid"] }],
    verify: MPL,
    explanation:
      "s.29 [코드 7-23]: 각 plot( )에 `label='최고기온'`처럼 이름표를 주고 `plt.legend()`로 범례를 표시한다. c='r'·'y'·'b'는 빨간색·노란색·파란색 선이다. x값 `range(1,len(df2)+1)`은 1일부터 마지막 날까지의 번호다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-line-002",
    topic: T.line,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.29",
    prompt: "[코드 7-23] `plt.plot(range(1,len(df2)+1), df2['max_temp'], label='최고기온', c='r')`에서 df2가 2023년 1년치(365행)일 때 x 좌표의 처음과 끝은?",
    choices: ["1, 365", "0, 364", "1, 366", "0, 365"],
    answerIndex: 0,
    explanation:
      "s.29 [코드 7-23]: x값은 `range(1, len(df2)+1)` = range(1, 366)이라 1부터 365까지다(range의 끝 값은 포함하지 않는다). x값을 주지 않았다면 0부터 시작하는 인덱스가 x 좌표가 된다(로컬 맷플롯립 실행으로 확인).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-line-003",
    topic: T.line,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.33",
    prompt: "[코드 7-27] 3월 기온 그래프의 x축 범위를 1~31, y축 범위를 -7~22로 정하도록 빈칸을 채우시오. (단, df_Mar는 31일치 예시 데이터로 바꿨다)",
    language: "python",
    source: py(
      "import pandas as pd",
      "df_Mar = pd.DataFrame({'max_temp': [10.0] * 31, 'min_temp': [0.0] * 31})",
      "plt.title('서울시 2023년도 3월 기온 변화')",
      "plt.plot(range(1,32), df_Mar['max_temp'], label='최고기온', c='r')",
      "plt.plot(range(1,32), df_Mar['min_temp'], label='최저기온', c='b')",
      "plt.xlabel('3월')",
      "plt.ylabel('기온')",
      "plt.{{0}}(1,31)",
      "plt.{{1}}(-7, 22)",
      "plt.legend()",
      "plt.show()",
    ),
    blanks: [{ accept: ["xlim"], wrong: ["ylim"] }, { accept: ["ylim"], wrong: ["xlim"] }],
    verify: MPL,
    explanation:
      "s.33 [코드 7-27]: `plt.xlim(1,31)`은 x축(3월 1일~31일), `plt.ylim(-7, 22)`는 y축(기온) 범위를 정한다. 둘을 바꿔 쓰면 x축이 -7~22, y축이 1~31인 다른 그래프가 된다.",
  },
  // ───────────────────────────── 4. 날짜형·3월 추출 (s.30~32)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-date-001",
    topic: T.date,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.30-32",
    prompt: `[코드 7-24]~[코드 7-26] 일시 열을 날짜형으로 바꿔 인덱스로 지정하고 3월 데이터만 추출하도록 빈칸을 채우시오. ${TEMP_NOTE}`,
    language: "python",
    source: py(
      "df2 = df.ffill()",
      "df2['일시'] = pd.{{0}}(df2['일시'], format='%Y-%m-%d')",
      "df3 = df2.{{1}}('일시')",
      "df_Mar = df3[pd.DatetimeIndex(df3.index).{{2}} == 3]",
      "print(len(df_Mar))",
    ),
    blanks: [{ accept: ["to_datetime"] }, { accept: ["set_index"], wrong: ["reset_index"] }, { accept: ["month"], wrong: ["day"] }],
    verify: PD(TEMP),
    explanation:
      "s.30 [코드 7-24]: `pd.to_datetime(df2['일시'], format='%Y-%m-%d')`로 연-월-일 날짜형으로 바꾼다. s.31 [코드 7-25]: 일시 열은 행마다 고유하고 순서대로 늘어나므로 `set_index('일시')`로 인덱스로 지정한다. s.32 [코드 7-26]: 날짜형 인덱스라 `pd.DatetimeIndex(df3.index).month == 3`으로 3월만 간편하게 추출한다(예시 데이터에서는 3월 1~3일의 3행). day == 3은 '3일'인 행만 고른다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-date-002",
    topic: T.date,
    type: "mcq",
    difficulty: 1,
    slideRef: "Lec7 s.31-32",
    prompt: "다음 코드의 실행 결과를 선택하세요. (단, df2는 2023년 1월 1일~12월 31일의 하루 한 행(365행)이고 일시 열은 [코드 7-24]로 날짜형이 되었다)",
    code: { language: "python", source: py("df3 = df2.set_index('일시')", "df_Mar = df3[pd.DatetimeIndex(df3.index).month == 3]", "print(len(df_Mar))") },
    choices: ["31", "30", "3", "365"],
    answerIndex: 0,
    verify: PD_OUT(YEAR),
    explanation: "s.31~32 [코드 7-25]·[코드 7-26]: 월이 3인 날짜만 남으므로 3월 1일~31일의 31행이다. s.33 [코드 7-27]도 그래서 x값으로 range(1,32)를 쓴다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-date-003",
    topic: T.date,
    type: "ox",
    difficulty: 2,
    slideRef: "Lec7 s.30",
    prompt: "[코드 7-24]에서 일시 열을 날짜형으로 바꾸는 이유는 3월 데이터를 추출할 수 있도록 연-월-일이 구분되는 값으로 만들기 위해서다.",
    answer: true,
    explanation:
      "s.30: 3월 데이터를 추출할 수 있도록 연-월-일의 날짜형 데이터로 변경한다. s.32: 일시 열이 연월일이 구분되는 날짜형이라서 간편하게 추출할 수 있다. (보충) s.30 실행 결과에는 2022-01-01~2022-12-31이 찍혀 있지만 내려받은 자료는 2023년이다 — 날짜만 다를 뿐 형식(datetime64[ns], 365행)은 같다.",
  },
  // ───────────────────────────── 5. 워드클라우드 (s.35~42)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-wc-001",
    topic: T.wc,
    type: "order",
    difficulty: 2,
    slideRef: "Lec7 s.36-42",
    prompt: "헌법 워드클라우드를 만드는 과정을 순서대로 놓으시오.",
    items: [
      "국가법률정보센터에서 대한민국헌법을 HWP 또는 DOC 파일로 저장한다",
      "문서를 텍스트 문서(*.txt), 유니코드(UTF-8)로 다시 저장한다",
      "!pip install konlpy로 한국어 자연어 처리 패키지를 설치한다",
      "'대한민국헌법.txt'를 Colab 디렉토리에 업로드한다",
      "Okt의 nouns( )로 명사를 뽑아 Counter로 빈도수를 센다",
      "WordCloud의 generate_from_frequencies( )로 워드클라우드를 만든다",
    ],
    explanation:
      "s.36~37: 국가법률정보센터에서 [저장] → HWP 또는 DOC 파일. s.38~39: [다른 이름으로 저장]에서 텍스트 문서(*.txt), 문자 코드 유니코드(UTF-8). s.40 [코드 7-28]: !pip install konlpy, [코드 7-29] 라이브러리 불러오기. s.41: 파일 업로드. s.42 [코드 7-30]: okt.nouns(text) → Counter(words) → wc.generate_from_frequencies(c).",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-wc-002",
    topic: T.wc,
    type: "match",
    difficulty: 1,
    slideRef: "Lec7 s.40",
    prompt: "[코드 7-29]에서 불러오는 라이브러리와 쓰임을 바르게 짝지으시오.",
    pairs: [
      { left: "WordCloud", right: "워드클라우드 객체를 생성" },
      { left: "Counter", right: "빈도수를 셈" },
      { left: "Okt(KoNLPy)", right: "한국어 형태소를 분석" },
      { left: "numpy", right: "빈도수 등 수치 계산" },
    ],
    explanation:
      "s.40: WordCloud는 워드클라우드 객체를 생성하는 라이브러리, Counter는 빈도수를 세는 라이브러리, KoNLPy(from konlpy.tag import Okt)로 한국어 형태소를 분석하고, numpy는 빈도수 등 수치 계산에 필요하다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-wc-003",
    topic: T.wc,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.42",
    prompt: "[코드 7-30] 텍스트에서 명사를 뽑고, 빈도수로 워드클라우드를 만들도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "with open('대한민국헌법.txt', 'r', encoding='utf-8') as f: text = f.read()",
      "okt = Okt()",
      "nouns = okt.{{0}}(text)",
      "words = [n for n in nouns if len(n)>1]",
      "c = Counter(words)",
      "wc = WordCloud(font_path='/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf',\\",
      "               width=400, height=400, scale=2.0, max_font_size=250)",
      "gen = wc.{{1}}(c)",
      "plt.figure()",
      "plt.imshow(gen)",
      "wc.{{2}}('헌법_워드클라우드.png')",
    ),
    blanks: [{ accept: ["nouns"] }, { accept: ["generate_from_frequencies"] }, { accept: ["to_file"] }],
    verify: { mode: "skip", reason: "KoNLPy·wordcloud 패키지와 '대한민국헌법.txt' 파일, 나눔 폰트가 필요해 실행 제외" },
    explanation:
      "s.42 [코드 7-30]: `okt.nouns(text)`로 명사만 뽑고, 두 글자 이상인 명사만 남겨 `Counter(words)`로 센 다음 `wc.generate_from_frequencies(c)`로 빈도수에 따라 워드클라우드를 만든다. `plt.imshow(gen)`으로 보여 주고 `wc.to_file('헌법_워드클라우드.png')`로 그림 파일에 저장한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-wc-004",
    topic: T.wc,
    type: "code-blank",
    difficulty: 1,
    slideRef: "Lec7 s.42",
    prompt: "[코드 7-30]처럼 **두 글자 이상**인 명사만 남겨 빈도수를 세도록 빈칸을 채우시오. (단, nouns는 okt.nouns( )의 결과 대신 쓰는 예시 리스트다)",
    language: "python",
    source: py(
      "from collections import Counter",
      "nouns = ['국민', '법', '헌법', '국민', '권리', '법', '국민', '수']",
      "words = [n for n in nouns if {{0}}(n)>1]",
      "c = {{1}}(words)",
      "print(c.most_common(2))",
    ),
    blanks: [{ accept: ["len"] }, { accept: ["Counter"] }],
    verify: PY_RUN,
    explanation:
      "s.42 [코드 7-30]: `words = [n for n in nouns if len(n)>1]`로 한 글자 명사('법'·'수')를 빼고 `Counter(words)`로 빈도수를 센다. s.40: Counter는 빈도수를 세는 라이브러리다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-wc-005",
    topic: T.wc,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.42",
    prompt: "다음 코드의 실행 결과를 선택하세요.",
    code: {
      language: "python",
      source: py(
        "from collections import Counter",
        "nouns = ['국민', '법', '헌법', '국민', '권리', '법', '국민', '수']",
        "words = [n for n in nouns if len(n)>1]",
        "c = Counter(words)",
        "print(len(words), c['국민'], c['법'])",
      ),
    },
    choices: ["5 3 0", "8 3 2", "5 3 2", "6 3 0"],
    answerIndex: 0,
    verify: PY_OUT,
    explanation:
      "s.42 [코드 7-30]의 거르기와 같다: len(n)>1이라 '법'(2번)·'수'(1번)가 빠져 words는 5개('국민' 3, '헌법' 1, '권리' 1). Counter는 없는 키를 물으면 오류 대신 0을 돌려준다(보충) — c['법']은 0.",
  },
  // ───────────────────────────── 6. 뉴스 제목 명사 추출 (s.44~54)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-token-001",
    topic: T.token,
    type: "blank",
    difficulty: 1,
    slideRef: "Lec7 s.35·s.44",
    prompt: "강의자료 설명의 빈칸을 채우시오.",
    text: "한국어 텍스트는 한국어 형태소를 분석하는 패키지를 추가로 써야 하며, 강의에서는 파이썬 패키지 {{0}}을(를) 사용한다. 텍스트 데이터를 단어별로 나누는 것을 {{1}}(Tokenization)라 하고, 이렇게 품사를 분류한 뒤 명사만 추출한다.",
    blanks: [{ accept: ["KoNLPy", "konlpy", "코엔엘파이"] }, { accept: ["토큰화"] }],
    explanation:
      "s.35: 한국어 텍스트는 한국어 형태소를 분석하는 패키지를 추가로 사용해야 하며, 한국어 자연어 처리 파이썬 패키지인 KoNLPy를 사용한다. s.44: 텍스트 데이터를 단어별로 나누는 토큰화(Tokenization)로 품사를 분류하고, 명사만 추출해 네트워크 그래프로 시각화한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-token-002",
    topic: T.token,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.54",
    prompt: "[코드 7-35] 뉴스 제목에서 한글·영문자·공백이 아닌 글자를 지우도록 빈칸을 채우시오.",
    language: "python",
    source: py("import re", "line = '(약수터) 봄이 오는 길\\n'", "print(re.{{0}}(r'[^가-힣a-zA-Z\\s]', '', line))"),
    blanks: [{ accept: ["sub"], wrong: ["findall"] }],
    verify: PY_RUN,
    explanation:
      "s.54: re.sub( ) 함수는 문자열 중 정규표현식에 일치하는 텍스트를 다른 텍스트로 치환한다. `[^가-힣a-zA-Z\\s]`는 한글·영문자·공백이 **아닌** 글자이고, 이를 ''로 바꾸므로 괄호가 지워진다. (보충) 슬라이드는 '[^가-힣a-zA-Z\\s]'처럼 r 없이 썼는데, 최신 파이썬은 '\\s'에 경고(SyntaxWarning)를 내므로 r'…'(raw 문자열)로 적었다 — 결과는 같다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-token-003",
    topic: T.token,
    type: "mcq",
    difficulty: 2,
    slideRef: "Lec7 s.54",
    prompt: "다음 코드의 실행 결과를 선택하세요.",
    code: { language: "python", source: py("import re", "print(re.sub(r'[^가-힣a-zA-Z\\s]', '', '[속보](약수터) 봄이 오는 길!'))") },
    choices: ["속보약수터 봄이 오는 길", "[속보](약수터) 봄이 오는 길!", "속보 약수터 봄이 오는 길", "속보약수터봄이오는길"],
    answerIndex: 0,
    verify: PY_OUT,
    explanation:
      "s.54: 한글·영문자·공백이 아닌 것(대괄호·괄호·!)을 찾아 ''로 바꿔 삭제한다. 원래 있던 공백은 그대로 남고, 지운 자리에 공백이 생기지는 않으므로 '속보약수터 봄이 오는 길'이 된다.",
  },
  // ───────────────────────────── 7. 연관규칙 (s.55~57)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-assoc-001",
    topic: T.assoc,
    type: "match",
    difficulty: 1,
    slideRef: "Lec7 s.55",
    prompt: "연관규칙의 지표와 뜻을 바르게 짝지으시오.",
    pairs: [
      { left: "지지도(Support)", right: "모든 사건 중에서 특정 사건이 발생한 빈도" },
      { left: "신뢰도(Confidence)", right: "사건 하나가 일어났을 때 다른 사건도 일어날 확률" },
      { left: "향상도(Lift)", right: "신뢰도와 지지도의 비" },
    ],
    explanation:
      "s.55: 특정 사건이 발생했을 때 동시에 발생하는 다른 사건과의 관계에 대한 규칙을 연관규칙(Association rules)이라 한다. 지지도는 모든 사건 중 특정 사건이 발생한 빈도, 신뢰도는 사건 하나가 일어났을 때 다른 사건도 일어날 확률, 향상도는 신뢰도와 지지도의 비다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-assoc-002",
    topic: T.assoc,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec7 s.56",
    prompt: "apyori 라이브러리의 apriori( ) 함수에 규칙의 조건으로 줄 수 있는 인자를 모두 고르시오.",
    choices: ["최소 지지도", "최소 신뢰도", "최소 향상도", "최소 규칙 크기", "최대 노드 수", "최소 페이지랭크"],
    answerIndexes: [0, 1, 2, 3],
    explanation:
      "s.56: `apriori(transaction data, [최소 지지도], [최소 신뢰도], [최소 향상도], [최소 규칙 크기])` — 인자로 규칙의 조건을 입력하면 가능성이 높은 연관규칙만 계산하도록 제한하므로 효율적이다. 노드·페이지랭크는 네트워크 그래프(s.58)의 개념이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-assoc-003",
    topic: T.assoc,
    type: "code-blank",
    difficulty: 3,
    slideRef: "Lec7 s.57",
    prompt: "[코드 7-36] 연관규칙 데이터프레임에서 항목 수가 2인 규칙만 남기고 지지도가 큰 순으로 정렬하도록 빈칸을 채우시오. (단, df는 apriori( ) 결과 대신 쓰는 예시: items 열은 단어 묶음, support 열은 지지도)",
    language: "python",
    source: py(
      "df['length'] = df['items'].apply(lambda x: {{0}}(x))",
      "df = df[(df['length']==2)&(df['support']>=0.01)].{{1}}(by='support',\\",
      "        ascending={{2}})",
      "print(df['items'].apply(sorted).tolist())",
    ),
    blanks: [{ accept: ["len"] }, { accept: ["sort_values"] }, { accept: ["False"], wrong: ["True"] }],
    verify: PD(RULES),
    explanation:
      "s.57 [코드 7-36]: `df['items'].apply(lambda x: len(x))`로 규칙의 항목 수를 length 열에 넣고, 항목 수가 2이면서 지지도 0.01 이상인 행만 남겨 `sort_values(by='support', ascending=False)`로 지지도 내림차순 정렬한다. ascending=True면 오름차순이 된다.",
  },
  // ───────────────────────────── 8. 네트워크 그래프 (s.58~59)
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-net-001",
    topic: T.net,
    type: "code-blank",
    difficulty: 2,
    slideRef: "Lec7 s.58",
    prompt: "[코드 7-37] 연관규칙의 단어 쌍으로 네트워크 그래프를 만들고 노드 순위를 구하도록 빈칸을 채우시오.",
    language: "python",
    source: py(
      "G = nx.{{0}}()",
      "ar = (df['items']); G.{{1}}(ar)",
      "pr = nx.{{2}}(G)",
      "nsize = np.array([v for v in pr.values()])",
      "nsize = 2000 * (nsize-min(nsize)) / (max(nsize)-min(nsize))",
      "pos = nx.circular_layout(G)",
    ),
    blanks: [{ accept: ["Graph"] }, { accept: ["add_edges_from"] }, { accept: ["pagerank"] }],
    verify: { mode: "skip", reason: "networkx는 앱 실행 엔진에 없고 df는 apyori 연관규칙 결과가 필요해 실행 제외" },
    explanation:
      "s.58 [코드 7-37]: `G = nx.Graph()`로 그래프를 만들고 `G.add_edges_from(ar)`로 단어 쌍을 간선으로 넣는다. pagerank( ) 함수로 노드 순위를 구해 변수 pr에 할당하고, 순위를 0~2000 범위로 바꾼 nsize를 노드 크기로 쓴다. circular_layout은 노드를 원 모양으로 배치한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-science-lec7b-net-002",
    topic: T.net,
    type: "multi",
    difficulty: 2,
    slideRef: "Lec7 s.59",
    prompt: "네트워크X 코드 실행 중 `module 'scipy.sparse' has no attribute 'coo_array'` 오류가 났을 때 강의자료가 안내하는 해결 방법에 해당하는 것을 모두 고르시오.",
    choices: [
      "!pip install scipy==1.8.0",
      "!pip install networkx==2.7.1",
      "!pip install pyg-nightly",
      "명령을 모두 실행한 뒤 런타임을 다시 시작한다",
      "!sudo apt-get install -y fonts-nanum",
      "!pip install konlpy",
    ],
    answerIndexes: [0, 1, 2, 3],
    explanation:
      "s.59: 흔히 scipy 라이브러리의 버전 문제일 수 있으며, `!pip install scipy==1.8.0`, `!pip install networkx==2.7.1`, `!pip install pyg-nightly`를 모두 실행한 후 런타임을 다시 시작하여 해결할 수 있다. 나눔 폰트 설치(s.51)와 konlpy 설치는 다른 준비 단계다.",
  },
];

export default questions;

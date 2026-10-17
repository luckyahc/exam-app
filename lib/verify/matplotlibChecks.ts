/**
 * 데이터과학 Lec7(맷플롯립) 로컬 검증의 문항별 검사(2026-10-17). 실행은 scripts/verify-matplotlib.py(로컬 CPython, Agg 백엔드),
 * 비교는 lib/verify/matplotlib.test.ts가 한다.
 * - code: 문항에 코드 블록이 없을 때(지문에 짧은 코드만 있는 문항) 검사에 쓸 코드. 코드 블록이 있으면 문항 코드를 그대로 실행한다
 * - after: 문항 코드 뒤에 실행할 검사 준비 코드
 * - truths: 보기마다 참/거짓 식(mcq·multi: 보기 수만큼, ox: 1개). null은 실행으로 확인할 수 없는 보기(개념 오답)
 * - value: 정답과 비교할 값 식 — mcq: 정답 보기 글자, blank: 빈칸별 첫 정답, calc: 정답 수
 * - error: 이 오류 종류가 나야 한다
 * 이름 공간에는 plt·np·pd·cbook과 desc(선) → '빨간색 · 사각형 마커 · 점선'(슬라이드 주석 낱말), fig·ax(현재 그림·축)가 있다.
 */
export interface MplCheck {
  code?: string;
  after?: string;
  truths?: (string | null)[];
  value?: string;
  error?: string;
}

const lines = (...l: string[]) => l.join("\n");
const PIE = "w, t, a = plt.pie([20, 15, 5, 5, 10], labels=['Apple', 'Banana', 'Cherry', 'Kiwi', 'Grape'], autopct='%.1f%%')";
const pos = (r: number, c: number) => `(sp.rowspan.start, sp.colspan.start) == (${r}, ${c})`;
const noLine = (f: string) => `plt.plot([1, 2], ${f})[0].get_linestyle() == 'None'`;

export const MPL_CHECKS: Record<string, MplCheck> = {
  "data-science-lec7-plot-001": { value: "', '.join(str(int(v)) for v in ax.lines[0].get_xdata())" },
  "data-science-lec7-font-002": {
    code: lines(
      "import matplotlib.ticker as mt",
      "plt.rcParams['axes.unicode_minus'] = True",
      "on = mt.ScalarFormatter().fix_minus('-1')",
      "plt.rcParams['axes.unicode_minus'] = False",
      "off = mt.ScalarFormatter().fix_minus('-1')",
    ),
    truths: ["on == chr(0x2212) + '1' and off == '-1'", null, null, null],
  },
  "data-science-lec7-fmt-002": {
    code: "l, = plt.plot([2014, 2017, 2020, 2023], [25000, 31000, 53000, 63000], 'rs:')",
    value: "desc(l)",
  },
  "data-science-lec7-fmt-003": { code: "", truths: ["'g.'", "'y^'", "'rs'", "'k'", "'r--'", "'rs:'"].map(noLine) },
  "data-science-lec7-axis-002": { value: "f'x축 {ax.get_xlim()[0]:.0f}~{ax.get_xlim()[1]:.0f}, y축 {ax.get_ylim()[0]:.0f}~{ax.get_ylim()[1]:.0f}'" },
  "data-science-lec7-axis-003": {
    code: lines("try:", "    plt.axis(2013, 2024, 20000, 70000)", "    ok = True", "except TypeError:", "    ok = False"),
    truths: ["ok"],
  },
  "data-science-lec7-axis-004": {
    code: ["year = [2014, 2017, 2020, 2023]", "price = [25000, 31000, 53000, 63000]", "plt.plot(year, price, 'rs:’)"].join(String.fromCharCode(10)),
    error: "SyntaxError",
  },
  "data-science-lec7-legend-002": {
    truths: [
      "len(fig.axes) == 1 and len(ax.lines) == 3 and [t.get_text() for t in ax.get_legend().get_texts()] == ['one', 'two', 'three']",
      "len(fig.axes) == 3",
      "ax.lines[2].get_linestyle() == '-' and desc(ax.lines[2]).startswith('초록색')",
      "ax.lines[1].get_linestyle() == ':'",
    ],
  },
  "data-science-lec7-subplot-001": {
    code: lines("plt.subplot(2, 2, 3)", "sp = plt.gca().get_subplotspec()"),
    truths: [pos(1, 0), pos(0, 1), pos(1, 1), pos(0, 0)],
  },
  "data-science-lec7-subplot-003": {
    code: lines("try:", "    plt.subplot(2, 2, 0)", "    ok = True", "except ValueError:", "    ok = False"),
    truths: ["ok"],
  },
  "data-science-lec7-subplot-004": {
    after: "sp = fig.axes[2].get_subplotspec()",
    truths: [
      `len(fig.axes) == 4 and ${pos(1, 0)} and desc(fig.axes[2].lines[0]) == '노란색 · 삼각형 마커 · 선 없음'`,
      "len(fig.axes) == 1",
      "fig.axes[1].lines[0].get_linestyle() == ':'",
      "fig.axes[3].lines[0].get_linestyle() == '-'",
    ],
  },
  "data-science-lec7-scatter-002": {
    code: lines("from matplotlib import colors", "sc = plt.scatter([2014, 2017, 2020, 2023], [25000, 31000, 53000, 63000], c='g', s=50, marker='^')"),
    value: "['크기' if list(sc.get_sizes()) == [50] else '?', '색상' if colors.to_hex(sc.get_facecolors()[0]) == '#008000' else '?']",
  },
  "data-science-lec7-hist-001": { value: "', '.join(str(int(p.get_height())) for p in ax.patches)" },
  "data-science-lec7-hist-003": { code: "n, b, _ = plt.hist([5, 4, 4, 1, 6, 3, 4, 1, 2, 2])", truths: ["len(n) == 6"] },
  "data-science-lec7-box-002": {
    after: "st = cbook.boxplot_stats(numbers)[0]",
    truths: [0, 1.4, 2.5, 5.7, 9].map((v) => `${v} in [float(x) for x in st['fliers']]`),
  },
  "data-science-lec7-box-003": {
    code: lines("numbers = [0, 1.4, 1.6, 1.8, 1.85, 1.9, 2.2, 2.5, 5.7, 9]", "st = cbook.boxplot_stats(numbers)[0]", "assert (round(st['q1'], 6), round(st['q3'], 6)) == (1.65, 2.425)"),
    value: "st['whishi']",
  },
  "data-science-lec7-bar-002": {
    after: "x, y = ax.texts[0].get_position()\nticks = [t.get_text() for t in ax.get_xticklabels()]",
    truths: ["(x, y) == (0, 90) and ticks[int(x)] == 'KOR'", "ticks[int(x)] == 'MATH'", "(x, y) == (90, 0)", "ax.texts[0].get_text() == ax.get_title()"],
  },
  "data-science-lec7-pie-001": { code: PIE, value: "a[0].get_text()" },
  "data-science-lec7-pie-002": {
    code: PIE,
    truths: ["a[0].get_text() == '36.4%'", "a[0].get_text() == '20.0'", null, "a[0].get_text() == '36%'"],
  },
  "data-science-lec7-csv-004": {
    code: lines(
      "open('t.csv', 'w', encoding='cp949').write('날짜,평균기온' + chr(10) + '2023-01-01,-1.0' + chr(10))",
      "try:",
      "    pd.read_csv('t.csv')",
      "    utf8_ok = True",
      "except UnicodeDecodeError:",
      "    utf8_ok = False",
      "df = pd.read_csv('t.csv', encoding='cp949')",
    ),
    truths: [
      "not utf8_ok and list(df.columns) == ['날짜', '평균기온']",
      "str(pd.read_csv('t.csv', encoding='cp949')['평균기온'].dtype) != str(df['평균기온'].dtype)",
      "list(df.columns) != ['날짜', '평균기온']",
      null,
    ],
  },
};

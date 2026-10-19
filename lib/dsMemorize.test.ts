import { describe, expect, it } from "vitest";
import { DS_FUNCTIONS, DS_LECTURES, filterFunctions } from "@/lib/dsFunctions";
import {
  checkName,
  emptyMemo,
  filterMemo,
  markMemo,
  maskedFields,
  maskName,
  MASK,
  memoSummary,
  nameTokens,
  parseMemo,
  resetMemo,
  shuffled,
} from "@/lib/dsMemorize";

const byName = (n: string) => DS_FUNCTIONS.find((f) => f.name === n)!;
/** 영문 낱말 경계·SQL 띄어쓰기 여러 칸. 파이썬은 대소문자 무시, SQL은 대문자 표기 그대로 */
const word = (t: string, sql = false) =>
  new RegExp(
    `(^|[^A-Za-z0-9_])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")}([^A-Za-z0-9_]|$)`,
    sql ? "" : "i",
  );
const now = new Date("2026-10-20T03:04:05Z");

describe("방향 A — 보이는 글자에 함수 이름이 남지 않는다", () => {
  it.each(DS_FUNCTIONS.map((f) => [f.name, f] as const))("%s", (_, f) => {
    const m = maskedFields(f);
    const visible = [
      m.signature,
      m.description,
      m.usage,
      m.pitfall,
      m.example,
      m.exampleOutput,
      m.setup,
      m.noRun,
      f.category,
    ]
      .filter((s): s is string => !!s)
      .join("\n");
    const sql = f.lang === "sql";
    // 가린 구현과 따로: 이름 조각을 영문 낱말 경계로 다시 찾는다
    for (const t of nameTokens(f)) expect(visible, t).not.toMatch(word(t, sql));
    // 전체 이름(df.groupby)도 낱말로 남지 않는다 — set_3·f.closed·plt.rcParams처럼 더 긴 낱말의 일부는 이름이 아니다
    expect(visible).not.toMatch(word(f.name, sql));
    // 점으로 이은 이름은 마지막 부분(정답)이 대소문자 무관하게 남지 않는다
    if (!sql) expect(visible).not.toMatch(word(f.name.split(".").pop()!));
  });

  it("SQL 키워드는 대문자 표기만 가린다", () => {
    expect(maskName("SELECT 이름 AS 별칭 — as는 소문자", byName("AS"))).toBe(
      `SELECT 이름 ${MASK} 별칭 — as는 소문자`,
    );
    expect(maskName("WHERE 학번 IN ('s2'); in, In", byName("IN"))).toBe(
      `WHERE 학번 ${MASK} ('s2'); in, In`,
    );
    expect(maskName("USE firstDB; use", byName("USE"))).toBe(`${MASK} firstDB; use`);
    expect(maskName("GROUP  BY 반; group by", byName("GROUP BY"))).toBe(`${MASK} 반; group by`);
  });

  it("파이썬 일반 단어 이름은 대소문자 무시·낱말 경계 그대로", () => {
    expect(maskName("set(), Set, set_3, s.set", byName("set"))).toBe(
      `${MASK}(), ${MASK}, set_3, s.${MASK}`,
    );
    expect(maskName("list(x); List; mylist", byName("list"))).toBe(`${MASK}(x); ${MASK}; mylist`);
    expect(maskName("type(1); <class 'str'>", byName("type"))).toBe(`${MASK}(1); <class 'str'>`);
    expect(maskName("str(1); <class 'str'>", byName("str"))).toBe(`${MASK}(1); <class '${MASK}'>`);
    expect(maskName("print(x); Print", byName("print"))).toBe(`${MASK}(x); ${MASK}`);
  });

  it("점으로 이은 이름은 마지막 부분만 — 중간 부분은 그대로", () => {
    expect(maskName("sys.path.insert(0, p); path·insert", byName("sys.path.insert"))).toBe(
      `sys.path.${MASK}(0, p); path·${MASK}`,
    );
    expect(maskName("df.groupby('반'); df", byName("df.groupby"))).toBe(`df.${MASK}('반'); df`);
    expect(maskName("np.random.randn(3); random", byName("np.random.randn"))).toBe(
      `np.random.${MASK}(3); random`,
    );
    expect(nameTokens(byName("Series.str.contains"))).toEqual(["contains"]);
  });

  it("전 항목을 검사한다", () => expect(DS_FUNCTIONS.length).toBeGreaterThanOrEqual(120));

  it("앞의 객체 이름은 남기고 함수 이름만 가린다", () => {
    expect(maskName("g = df.groupby('반')['점수'].mean()", byName("df.groupby"))).toBe(
      `g = df.${MASK}('반')['점수'].mean()`,
    );
    expect(maskName("groupby로 묶는다", byName("df.groupby"))).toBe(`${MASK}로 묶는다`);
    expect(maskName("SELECT 이름\nFROM 학생", byName("SELECT … FROM"))).toBe(
      `${MASK} 이름\n${MASK} 학생`,
    );
    expect(maskName("s.str.contains('a')", byName("Series.str.contains"))).toBe(
      `s.str.${MASK}('a')`,
    );
    // 다른 낱말 속 조각(sort_values·argsort)은 그대로
    expect(maskName("np.argsort(a); df.sort_values('x'); np.sort(a)", byName("np.sort"))).toBe(
      `np.argsort(a); df.sort_values('x'); np.${MASK}(a)`,
    );
  });
});

describe("이름 입력 비교", () => {
  it("접두어 생략", () => {
    expect(checkName("groupby", byName("df.groupby"))).toBe(true);
    expect(checkName("df.groupby", byName("df.groupby"))).toBe(true);
    expect(checkName("pd.read_csv", byName("pd.read_csv"))).toBe(true);
    expect(checkName("read_csv", byName("pd.read_csv"))).toBe(true);
    expect(checkName("np.zeros", byName("np.zeros"))).toBe(true);
    expect(checkName("zeros", byName("np.zeros"))).toBe(true);
    expect(checkName("plt.plot", byName("plt.plot"))).toBe(true);
    expect(checkName("np.sort", byName("a.sort"))).toBe(true);
    expect(checkName("append", byName("list.append"))).toBe(true);
    expect(checkName("list.append", byName("list.append"))).toBe(true);
    expect(checkName("str.contains", byName("Series.str.contains"))).toBe(true);
  });
  it("대소문자·공백·괄호 무시", () => {
    expect(checkName("  GroupBy ", byName("df.groupby"))).toBe(true);
    expect(checkName("groupby()", byName("df.groupby"))).toBe(true);
    expect(checkName("select from", byName("SELECT … FROM"))).toBe(true);
    expect(checkName("GROUPBY", byName("GROUP BY"))).toBe(true);
    expect(checkName("is null", byName("IS NULL"))).toBe(true);
    expect(checkName("Print", byName("print"))).toBe(true);
  });
  it("틀린 이름·빈 입력", () => {
    expect(checkName("", byName("df.groupby"))).toBe(false);
    expect(checkName("group", byName("df.groupby"))).toBe(false);
    expect(checkName("np.argsort", byName("np.sort"))).toBe(false);
    expect(checkName("sort_values", byName("df.sort_index"))).toBe(false);
  });
});

describe("기록·필터", () => {
  const [a, b, c] = DS_FUNCTIONS;
  it("방향별로 따로 저장하고 시각을 남긴다", () => {
    let r = markMemo(emptyMemo(), "A", a.id, true, now);
    r = markMemo(r, "B", a.id, false, now);
    expect(r.A[a.id]).toEqual({ known: true, at: now.toISOString() });
    expect(r.B[a.id].known).toBe(false);
    // 저장소 왕복(JSON) 뒤 같은 값, 깨진 값은 버린다
    expect(parseMemo(JSON.parse(JSON.stringify(r)))).toEqual(r);
    expect(parseMemo({ A: { x: { known: "y" } }, B: 3 })).toEqual(emptyMemo());
    expect(parseMemo(null)).toEqual(emptyMemo());
  });
  it("몰랐음만·아직 안 본 것만", () => {
    let r = markMemo(emptyMemo(), "A", a.id, true, now);
    r = markMemo(r, "A", b.id, false, now);
    expect(filterMemo([a, b, c], r, "A", "unknown").map((f) => f.id)).toEqual([b.id]);
    expect(filterMemo([a, b, c], r, "A", "unseen").map((f) => f.id)).toEqual([c.id]);
    expect(filterMemo([a, b, c], r, "A", "")).toHaveLength(3);
    expect(filterMemo([a, b, c], r, "B", "unseen")).toHaveLength(3);
  });
  it("장·카테고리·검색 필터와 함께", () => {
    const pandas = filterFunctions(DS_FUNCTIONS, {
      lecture: "lec6",
      category: "pandas",
      query: "sort",
    });
    expect(pandas.length).toBeGreaterThan(0);
    const r = markMemo(emptyMemo(), "A", pandas[0].id, false, now);
    expect(filterMemo(pandas, r, "A", "unknown").map((f) => f.id)).toEqual([pandas[0].id]);
    expect(filterMemo(pandas, r, "A", "unseen")).toHaveLength(pandas.length - 1);
  });
  it("장별 요약과 장 단위 초기화", () => {
    const lec2 = filterFunctions(DS_FUNCTIONS, { lecture: "lec2" });
    const lec5 = filterFunctions(DS_FUNCTIONS, { lecture: "lec5" }).filter(
      (f) => !lec2.includes(f),
    );
    let r = emptyMemo();
    for (const f of [...lec2, lec5[0]]) r = markMemo(r, "A", f.id, true, now);
    r = markMemo(r, "B", lec2[0].id, true, now);
    const sum = memoSummary(DS_FUNCTIONS, r, "A", DS_LECTURES);
    expect(sum.find((s) => s.lecture === "lec2")).toEqual({
      lecture: "lec2",
      known: lec2.length,
      total: lec2.length,
    });
    const cleared = resetMemo(r, "A", DS_FUNCTIONS, "lec2");
    expect(lec2.some((f) => cleared.A[f.id])).toBe(false);
    expect(cleared.A[lec5[0].id]).toBeTruthy();
    expect(cleared.B[lec2[0].id]).toBeTruthy(); // 다른 방향은 그대로
    expect(Object.keys(resetMemo(r, "A", DS_FUNCTIONS, "").A)).toHaveLength(0);
  });
  it("순서 섞기는 같은 항목을 다시 늘어놓는다", () => {
    const ids = DS_FUNCTIONS.map((f) => f.id);
    let seed = 1;
    const out = shuffled(ids, () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646);
    expect([...out].sort()).toEqual([...ids].sort());
    expect(out).not.toEqual(ids);
  });
});

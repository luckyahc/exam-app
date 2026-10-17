import { describe, expect, it } from "vitest";
import { categoriesOf, DS_FUNCTIONS, filterFunctions, questionPattern } from "./dsFunctions";

// 데이터과학 함수 정리 페이지의 필터·관련 문항 찾기 규칙(실행 결과 검증은 lib/verify/dsFunctions.test.ts)

describe("함수 정리 필터", () => {
  it("장 탭은 처음 나온 장 + 다시 나온 장(alsoIn), 카테고리·이름 검색(공백·대소문자 무시)", () => {
    const lec6 = filterFunctions(DS_FUNCTIONS, { lecture: "lec6" });
    expect(lec6.map((f) => f.name)).toContain("print"); // lec1에서 처음, lec6에 다시 나옴
    expect(lec6.every((f) => f.lecture === "lec6" || f.alsoIn?.includes("lec6"))).toBe(true);
    // 공백을 무시하므로 "group by"·"GROUPBY"는 SQL GROUP BY와 판다스 groupby를 함께 찾는다
    expect(filterFunctions(DS_FUNCTIONS, { query: "GROUPBY" }).map((f) => f.name)).toEqual(["GROUP BY", "df.groupby"]);
    expect(filterFunctions(DS_FUNCTIONS, { query: "group by" }).map((f) => f.name)).toEqual(["GROUP BY", "df.groupby"]);
    expect(filterFunctions(DS_FUNCTIONS, { category: "SQL" }).every((f) => f.lang === "sql")).toBe(true);
    expect(categoriesOf(DS_FUNCTIONS)).toEqual(["Python 기본", "파일(CSV·엑셀)", "셀레니움", "SQL", "NumPy", "pandas", "맷플롯립"]);
  });

  it("관련 문항 찾기: 메서드는 낱말(빈칸 정답 'iloc'도), 같은 장에 같은 이름이 있으면 좁힌다(np.sort ↔ a.sort), 내장 함수는 호출 모양", () => {
    const p = (name: string, lecture = "lec6", lang: "python" | "sql" = "python") => questionPattern({ name, lecture, lang });
    expect(p("df.iloc").test("iloc")).toBe(true);
    expect(p("df.loc").test("df.iloc[1:4]")).toBe(false);
    expect(p("np.sort").test("np.sort(a)")).toBe(true);
    expect(p("np.sort").test("a.sort()")).toBe(false);
    expect(p("a.sort").test("a.sort()")).toBe(true);
    expect(p("print", "lec1").test("print( )")).toBe(true);
    expect(p("type", "lec2").test('"type": "mcq"')).toBe(false);
    expect(p("GROUP BY", "lec5", "sql").test("GROUP  BY 학번")).toBe(true);
    expect(p("IN", "lec5", "sql").test("JOIN 수강")).toBe(false);
  });
});

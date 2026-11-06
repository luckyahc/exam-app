import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data/subjects/registry";
import { choiceOrder } from "./choiceOrder";
import { QTYPE_FIXTURES } from "./fixtures";
import { questionMarkdown } from "./questionMarkdown";
import type { Question } from "./registry";

const base = { id: "x-y-z-001", subject: "x", chapter: "y", topic: "t", difficulty: 1, exam: false, slideRef: "", explanation: "비밀 해설" };
const q = (p: object) => ({ ...base, ...p }) as unknown as Question;

describe("문제 Markdown", () => {
  it("객관식: 지문·코드 블록·화면 순서 보기, 정답·해설 없음", () => {
    const m = q({ type: "mcq", prompt: "고르세요", code: { language: "python", source: "print(1)" }, choices: ["가", "나", "다", "라"], answerIndex: 0 });
    const md = questionMarkdown(m);
    expect(md).toContain("고르세요");
    expect(md).toContain("```python\nprint(1)\n```");
    const order = choiceOrder(m as never).map((i, n) => `${n + 1}. ${["가", "나", "다", "라"][i]}`);
    expect(md).toContain(order.join("\n"));
    expect(md).not.toContain("비밀 해설");
  });

  it("코드 빈칸은 #번호, 정답을 끼우지 않는다", () => {
    const md = questionMarkdown(q({ type: "code-blank", prompt: "채우세요", language: "python", source: "df.{{0}}()", blanks: [{ accept: ["corr"] }] }));
    expect(md).toContain("df.#1()");
    expect(md).not.toContain("corr");
  });

  it("짝 짓기는 왼쪽과 오른쪽을 나눠 적는다", () => {
    const md = questionMarkdown(q({ type: "match", prompt: "짝", pairs: [{ left: "A", right: "1" }, { left: "B", right: "2" }] }));
    expect(md).toContain("**항목**\n\n- A\n- B");
    expect(md).toContain("**보기**");
  });

  it("모든 유형 예시가 비어 있지 않고 {{n}}을 남기지 않는다", () => {
    for (const [type, fixture] of Object.entries(QTYPE_FIXTURES)) {
      const md = questionMarkdown(fixture as Question);
      expect(md.trim(), type).not.toBe("");
      expect(md, type).not.toMatch(/\{\{\d+\}\}/);
      expect(md, type).not.toContain("undefined");
    }
  });

  it("실제 문항 전체가 오류 없이 만들어지고 해설이 섞이지 않는다", async () => {
    let n = 0;
    for (const s of SUBJECTS)
      for (const c of s.chapters)
        for (const item of await c.load()) {
          const md = questionMarkdown(item);
          n++;
          expect(md, item.id).not.toMatch(/\{\{\d+\}\}/);
          expect(md, item.id).not.toContain("undefined");
          if (item.explanation.length > 30) expect(md, item.id).not.toContain(item.explanation);
        }
    expect(n).toBeGreaterThan(1000);
  });
});

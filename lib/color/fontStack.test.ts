import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// 궁서체 재발 방지: 앱 글꼴 스택에 명조·궁서 계열이 없어야 한다(Windows는 serif 대체로 바탕·궁서 계열이 나온다)
const css = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");

describe("글꼴 토큰", () => {
  it("제목 토큰은 본문 글꼴과 같고, 글꼴 선언에 명조·궁서 계열이 없다", () => {
    expect(css).toMatch(/--font-display:\s*var\(--font-sans\);/);
    const stacks = [...css.matchAll(/--font-[a-z]+:([^;]+);/g)].map((m) => m[1]);
    expect(stacks.length).toBeGreaterThan(2);
    for (const s of stacks) {
      expect(s).not.toMatch(/gungsuh|궁서|batang|바탕|myungjo|명조|gowun/i);
      expect(s.replace(/sans-serif/g, "")).not.toMatch(/\bserif\b/);
    }
  });

  it("고정폭 스택은 한글을 본문 글꼴로 받는다(코드 안 한글이 궁서 계열로 대체되지 않게)", () => {
    for (const m of css.matchAll(/--font-mono:([^;]+);/g)) expect(m[1]).toContain("var(--font-pretendard)");
  });
});

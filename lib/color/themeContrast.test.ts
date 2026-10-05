import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

/**
 * 테마 색 대비(Sprint 11 접근성 점검): globals.css의 라이트(:root)·다크(.dark) 토큰을 읽어
 * 글자색·상태색(정답/오답)·채운 버튼의 글자-배경 쌍이 WCAG AA 4.5:1 이상인지 확인한다.
 */
const css = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");
function tokens(selector: ":root" | ".dark") {
  const block = new RegExp(`(?:^|\\n)${selector.replace(".", "\\.")} \\{([^}]*)\\}`).exec(css)![1];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
}

describe.each([
  ["라이트", tokens(":root")],
  ["다크", tokens(".dark")],
])("%s 테마", (_, t) => {
  it("본문·보조 글자와 정답/오답 상태색: 배경·surface 대비 4.5:1 이상", () => {
    for (const bg of [t.background, t.surface])
      for (const fg of [t.foreground, t.muted, t.correct, t.incorrect, t.primary]) expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });
  it("채운 버튼(bg-primary·bg-incorrect 위의 text-background 글자): 4.5:1 이상", () => {
    expect(contrastRatio(t.background, t.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.background, t.incorrect)).toBeGreaterThanOrEqual(4.5);
  });
});

it("채운 영역의 글자는 text-white가 아니라 text-background를 쓴다(다크에서 밝은 primary 위 흰 글자는 대비 부족)", async () => {
  const { globSync } = await import("node:fs");
  const files = globSync("{components,app}/**/*.tsx", { cwd: path.resolve(import.meta.dirname, "../..") });
  expect(files.length).toBeGreaterThan(20);
  const bad = files.filter((f) => /bg-(primary|incorrect|correct)[^"`]*text-white|text-white[^"`]*bg-(primary|incorrect|correct)/.test(readFileSync(path.resolve(import.meta.dirname, "../..", f), "utf8")));
  expect(bad).toEqual([]);
});


it("키보드 포커스 표시: globals.css에 :focus-visible outline 규칙이 있고, outline-none으로 지우는 컴포넌트가 없다", async () => {
  expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--primary\)/);
  const { globSync } = await import("node:fs");
  const root = path.resolve(import.meta.dirname, "../..");
  const bad = globSync("{components,app}/**/*.tsx", { cwd: root }).filter((f) => /\boutline-none\b/.test(readFileSync(path.resolve(root, f), "utf8")));
  expect(bad).toEqual([]);
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

/**
 * 테마 색 대비(Sprint 11 접근성 점검, 디자인 개편 토큰): globals.css의 라이트(:root)·다크(.dark) 토큰을 읽어
 * 글자색·상태색(정답/오답)·채운 버튼·형광펜의 글자-배경 쌍이 WCAG AA 4.5:1 이상인지 확인한다.
 */
const css = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");
function tokens(selector: ":root" | ".dark") {
  const block = new RegExp(`(?:^|\\n)${selector.replace(".", "\\.")} \\{([^}]*)\\}`).exec(css)![1];
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );
}

describe.each([
  ["라이트", tokens(":root")],
  ["다크", tokens(".dark")],
])("%s 테마", (_, t) => {
  it("토큰 8개를 모두 읽었다", () => {
    for (const k of ["paper", "paper-deep", "sumi", "muted", "shu", "ok", "marker", "marker-ink"])
      expect(t[k], k).toMatch(/^#/);
  });
  it("본문·보조 글자와 정답/오답 상태색: paper·paper-deep 대비 4.5:1 이상", () => {
    for (const bg of [t.paper, t["paper-deep"]])
      for (const fg of [t.sumi, t.muted, t.ok, t.shu])
        expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });
  it("채운 버튼(bg-sumi·bg-shu 위의 text-paper 글자)과 형광펜 글자: 4.5:1 이상", () => {
    expect(contrastRatio(t.paper, t.sumi)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.paper, t.shu)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t["marker-ink"], t.marker)).toBeGreaterThanOrEqual(4.5);
  });
  it("다크 배경에 순수 검정(#000000)을 쓰지 않는다", () => {
    expect(t.paper.toLowerCase()).not.toBe("#000000");
    expect(t["paper-deep"].toLowerCase()).not.toBe("#000000");
  });
});

it("채운 영역의 글자는 text-white가 아니라 text-paper를 쓴다(다크에서 밝은 먹 위 흰 글자는 대비 부족)", async () => {
  const { globSync } = await import("node:fs");
  const files = globSync("{components,app}/**/*.tsx", {
    cwd: path.resolve(import.meta.dirname, "../.."),
  });
  expect(files.length).toBeGreaterThan(20);
  const bad = files.filter((f) =>
    /bg-(sumi|shu|ok|exam-accent)[^"`]*text-white|text-white[^"`]*bg-(sumi|shu|ok|exam-accent)/.test(
      readFileSync(path.resolve(import.meta.dirname, "../..", f), "utf8"),
    ),
  );
  expect(bad).toEqual([]);
});

it("키보드 포커스 표시: globals.css에 :focus-visible outline 규칙이 있고, outline-none으로 지우는 컴포넌트가 없다", async () => {
  // 먹색 테두리(시험 화면 안에서는 개편 전 파랑 exam-accent)
  expect(css).toMatch(
    /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--exam-accent, var\(--sumi\)\)/,
  );
  const { globSync } = await import("node:fs");
  const root = path.resolve(import.meta.dirname, "../..");
  const bad = globSync("{components,app}/**/*.tsx", { cwd: root }).filter((f) =>
    /\boutline-none\b/.test(readFileSync(path.resolve(root, f), "utf8")),
  );
  expect(bad).toEqual([]);
});

it("이전 토큰 별칭(background·foreground·surface·border·primary·correct·incorrect·subject)을 쓰지 않는다", async () => {
  const { globSync } = await import("node:fs");
  const root = path.resolve(import.meta.dirname, "../..");
  const legacy =
    /\b(bg|text|border|ring|outline|divide|fill|stroke|placeholder)(-[trblxy])?-(background|foreground|surface|border|primary|correct|incorrect|subject)\b(?![-\w])|var\(--(background|foreground|surface|border|primary|correct|incorrect|subject)\)/;
  const bad = globSync("{components,app,lib}/**/*.{ts,tsx,css}", { cwd: root }).filter(
    (f) => !f.includes(".test.") && legacy.test(readFileSync(path.resolve(root, f), "utf8")),
  );
  expect(bad).toEqual([]);
});

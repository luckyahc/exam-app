import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { answerKey } from "@/lib/qtypes/answerKey";
import { validateBase } from "@/lib/qtypes/base";
import { DC_FIGURE_SOURCES, type DcFigure, validateDcFigure } from "@/lib/qtypes/dcFigure";
import { DC_GRAPH_SAMPLES, dcPlaygroundQuestions } from "@/lib/qtypes/dcSamples";
import { graphCore } from "@/lib/qtypes/graph";
import { coreFor, gradeQuestion } from "@/lib/qtypes/registry";
import { DC_GENERATORS, DC_VARIANTS } from "@/lib/sim/data-comm/generators";
import { DcFigureSvg } from "./DcFigureSvg";
import { QuestionRenderer } from "./QuestionRenderer";

const NAMES = Object.keys(DC_FIGURE_SOURCES);
const figures = DC_GRAPH_SAMPLES.flatMap((q) => q.options.map((o) => (o.figure.kind === "dc" ? o.figure.figure : null))).filter(
  (f): f is DcFigure => f !== null,
);

describe("데이터 통신 graph 그림 12종 (docs/dc-question-types.md §4)", () => {
  it("12종이고, 종류마다 근거 슬라이드가 적혀 있다", () => {
    expect(NAMES).toHaveLength(12);
    for (const n of NAMES) expect(DC_FIGURE_SOURCES[n as DcFigure["name"]]).toMatch(/Ch0[12] s\.\d+/);
  });

  it("미리 보기 graph 문제가 12종을 모두 쓴다", () => {
    expect(new Set(figures.map((f) => f.name))).toEqual(new Set(NAMES));
  });

  it.each(figures.map((f) => [JSON.stringify(f), f] as const))("%s: 검증 통과·SVG 렌더(NaN 없음)", (_, f) => {
    expect(validateDcFigure(f)).toEqual([]);
    const svg = renderToStaticMarkup(createElement(DcFigureSvg, { figure: f, title: "t" }));
    expect(svg).toMatch(/^<svg[^>]*role="img"/);
    expect(svg).toContain(`data-figure="${f.name}"`);
    expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    // 색은 테마 토큰만(고정 색 금지 — 다크모드 대비)
    expect(svg).not.toMatch(/#[0-9a-f]{3,6}\b|rgb\(/i);
  });

  it("같은 문제 안의 보기 그림은 서로 다르다(SVG가 다름)", () => {
    for (const q of DC_GRAPH_SAMPLES) {
      const svgs = q.options.map((o) =>
        renderToStaticMarkup(createElement(DcFigureSvg, { figure: (o.figure as { figure: DcFigure }).figure, title: "t" })).replace(/dc-arrow-[\w-]+/g, ""),
      );
      expect(new Set(svgs).size, q.id).toBe(svgs.length);
    }
  });

  it("잘못된 그림 데이터는 검증에서 걸린다", () => {
    expect(validateDcFigure({ name: "sine", amplitude: "high", cycles: 0, phase: 90 })).not.toEqual([]);
    expect(validateDcFigure({ name: "levels", levels: 4, bits: "101" })).not.toEqual([]);
    expect(validateDcFigure({ name: "keying", scheme: "qam" as never, bits: "10" })).not.toEqual([]);
    expect(validateDcFigure({ name: "spectrum", spikes: [{ freq: 30, amp: 1 }] })).not.toEqual([]);
    const q = DC_GRAPH_SAMPLES[0];
    expect(graphCore.validate({ ...q, options: [q.options[0], { ...q.options[0], key: "z" }] })).toContain("같은 그림이 두 번 나옴");
  });
});

describe("플레이그라운드 데이터 통신 문제", () => {
  const qs = dcPlaygroundQuestions();
  it.each(qs.map((q) => [q.id, q] as const))("%s: 유효·정답 키 = 정답·렌더", (_, q) => {
    expect([...validateBase(q), ...coreFor(q).validate(q as never)]).toEqual([]);
    const r = gradeQuestion(q, answerKey(q));
    expect(r.correct).toBe(true);
    const html = renderToStaticMarkup(createElement(QuestionRenderer, { question: q, answer: answerKey(q) as never, onAnswer: () => {}, result: r }));
    expect(html).toContain("정답");
  });
});

describe("데이터 통신 calc — 입력칸 옆에 정답 단위가 보인다", () => {
  it("모든 생성기·변형(seed 1~5)의 풀기 화면에 단위가 렌더링된다", () => {
    const missing: string[] = [];
    let count = 0;
    for (const [name, variants] of Object.entries(DC_VARIANTS))
      for (const variant of variants)
        for (let seed = 1; seed <= 5; seed++) {
          const q = DC_GENERATORS[name as keyof typeof DC_GENERATORS].generate(seed, { variant } as never);
          if (q.type !== "calc") continue;
          count++;
          const html = renderToStaticMarkup(createElement(QuestionRenderer, { question: q, answer: "" as never, onAnswer: () => {}, result: null }));
          const escaped = (q.unit ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
          if (!q.unit?.trim() || !html.includes(`<span class="text-sm">${escaped}</span>`)) missing.push(`${q.id} (${variant})`);
        }
    expect(count).toBeGreaterThan(150);
    expect(missing).toEqual([]);
  });
});

// ------------------------------------------------------------------ 라이트/다크 대비: 그림에 쓰는 토큰

function tokens(css: string, selector: string) {
  const block = new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`).exec(css)![1];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}
function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("그림 색 대비 — 라이트·다크 모두(배경·surface 대비)", () => {
  const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8");
  const themes = { light: tokens(css, ":root"), dark: tokens(css, ".dark") };
  it.each(Object.entries(themes))("%s: 글자(foreground) ≥ 4.5:1, 선(primary·muted) ≥ 3:1", (_, t) => {
    for (const bg of [t.background, t.surface]) {
      expect(contrast(t.foreground, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.primary, bg)).toBeGreaterThanOrEqual(3);
      expect(contrast(t.muted, bg)).toBeGreaterThanOrEqual(3);
    }
  });
});

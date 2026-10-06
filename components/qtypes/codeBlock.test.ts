import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DS_CODE_BLOCK_SAMPLES, dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import { DS_CODE_BLANK_PYTHON } from "@/lib/qtypes/fixtures";
import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion, type Question } from "@/lib/qtypes/registry";
import { CodeBlock } from "./CodeBlock";
import { QuestionRenderer } from "./QuestionRenderer";
import { RichText } from "./ui";

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
// <p>·<button> 안에 넣을 수 없는 블록 요소
const BLOCK_TAGS = /<(div|pre|p|section|article|ul|ol|li|table|figure|h\d)[\s>]/;

describe("CodeBlock (공통 코드 블록)", () => {
  const sample = DS_CODE_BLOCK_SAMPLES[0];
  const out = html(createElement(CodeBlock, { code: sample.source, language: sample.language, lineNumbers: true }));

  it("들여쓰기를 보존하고(whitespace-pre) 줄마다 한 줄로 그린다", () => {
    expect(out).toContain("whitespace-pre");
    expect(out).toContain("    a = 10    # 지역변수"); // 앞 공백 4칸이 그대로
    expect((out.match(/class="block min-h-6"/g) ?? []).length).toBe(sample.source.split("\n").length);
  });
  it("언어 표시·줄 번호·고정폭, 테마 토큰 색만 사용", () => {
    expect(out).toContain(">Python<");
    expect(out).toContain('aria-label="Python 코드"');
    expect(out).toContain(">14<"); // 14줄
    expect(out).toContain("font-mono");
    expect(out).toMatch(/bg-surface/);
    expect(out).toMatch(/text-foreground/);
    expect(out).not.toMatch(/(text|bg)-(red|green|blue|gray|slate|zinc|amber)-\d/);
  });
  it("가로 스크롤은 코드 블록 안에서만(overflow-x-auto), 바깥은 max-w-full", () => {
    expect(out).toContain("overflow-x-auto");
    expect(out).toContain("max-w-full");
    // 안쪽 sr-only(position:absolute)가 스크롤 영역을 벗어나 페이지를 넓히지 않도록 code가 기준 위치(relative)
    expect(out).toMatch(/<code class="relative block overflow-x-auto/);
  });
  it("구문 요소만 써서 <p>·<button> 안에서도 올바른 HTML", () => {
    expect(out).not.toMatch(BLOCK_TAGS);
  });
  it("SQL 표시", () => {
    const s = DS_CODE_BLOCK_SAMPLES[1];
    expect(html(createElement(CodeBlock, { code: s.source, language: s.language }))).toContain(">SQL<");
  });
});

describe("RichText", () => {
  it("펜스가 없는 글은 예전과 같은 마크업(굵게·인라인 코드)", () => {
    expect(html(createElement(RichText, { text: "가 **나** `다` 라" }))).toBe(
      '<span>가 </span><strong class="font-semibold">나</strong><span> </span><code class="rounded bg-surface px-1 py-0.5 font-mono text-[0.9em]">다</code><span> 라</span>',
    );
  });
  it("```python / ```sql 펜스는 코드 블록으로, 앞뒤 글은 그대로", () => {
    const out = html(createElement(RichText, { text: "앞 글:\n```python\nif a == 5:\n    print('x')\n```\n뒤 **글**" }));
    expect(out).toContain('data-code-block="python"');
    expect(out).toContain("    print(&#x27;x&#x27;)");
    expect(out).toContain("<span>앞 글:</span>");
    expect(out).toContain('<strong class="font-semibold">글</strong>');
    expect(out).not.toMatch(BLOCK_TAGS);
  });
});

describe("문제 화면의 코드", () => {
  const render = (q: Question, answer: unknown, graded: boolean) =>
    html(createElement(QuestionRenderer, { question: q, answer: answer as never, onAnswer: () => {}, result: graded ? gradeQuestion(q, answer as never) : null }));

  it("code 필드는 지문 아래 코드 블록, 해설 안 펜스도 코드 블록", () => {
    const q = dsPlaygroundQuestions()[0];
    const out = render(q, answerKey(q), true);
    expect((out.match(/data-code-block="python"/g) ?? []).length).toBe(2);
  });

  it("코드 빈칸 입력칸: 자동 수정·대문자·맞춤법 검사를 끄고 칸마다 aria-label", () => {
    const out = render(DS_CODE_BLANK_PYTHON, ["", ""], false);
    expect((out.match(/<input /g) ?? []).length).toBe(2);
    for (const attr of ['autoComplete="off"', 'autoCorrect="off"', 'autoCapitalize="off"', 'spellCheck="false"', 'aria-label="빈칸 1"', 'aria-label="빈칸 2"'])
      expect(out).toContain(attr);
    expect(out).toContain(" print(str(a)"); // 슬라이드의 1칸 들여쓰기 그대로
  });

  it("채점 화면: 0/1 — 하나라도 틀리면 '오답'만, 부분 점수 문구 없음, 칸별 ✓/✗", () => {
    const out = render(DS_CODE_BLANK_PYTHON, ["range", ";"], true);
    expect(out).toContain("오답");
    expect(out).not.toMatch(/부분 점수 \d/); // ResultBanner의 "부분 점수 N%" 없음(입력 안내의 "부분 점수 없음"은 제외)
    expect(out).toContain("✓");
    expect(out).toContain("✗");
  });

  it("굽은 따옴표를 바꿔 채점했으면 결과 화면에 작게 알린다", () => {
    const q = { ...DS_CODE_BLANK_PYTHON, source: "f = open('a.csv', 'r', encoding = {{0}})", blanks: [{ accept: ["'cp949'"] }] } as Question;
    expect(render(q, ["‘cp949’"], true)).toContain("곧은 따옴표");
    expect(render(q, ["'cp949'"], true)).not.toContain("곧은 따옴표");
  });
});

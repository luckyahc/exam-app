import type { ReactNode } from "react";
import { CODE_LANG_LABEL, type CodeLang } from "@/lib/qtypes/_shared/codeTokens";

/**
 * 공통 코드 블록(Sprint 12): 여러 줄, 고정폭, 들여쓰기 보존(`whitespace-pre`), 언어 표시, 줄 번호(선택).
 * 지문·보기·해설 어디서든 쓰도록 **구문 요소(span·code)만** 쓴다 — `<p>`나 `<button>` 안에 들어가도 올바른 HTML이다.
 * 색은 테마 토큰(bg-surface · text-foreground · text-muted)만 써서 라이트/다크 대비 테스트(themeContrast.test.ts) 범위 안에 있다.
 * 가로로 긴 줄은 코드 블록 안에서만 스크롤되고(overflow-x-auto) 페이지는 넘치지 않는다. `relative`는 안쪽의 sr-only(절대 위치)
 * 글자가 스크롤 영역 밖으로 빠져나가 페이지를 넓히지 않게 한다(375px 채점 화면에서 찾은 문제).
 */
export function CodeBlock({
  code,
  language,
  lineNumbers = false,
  renderLine,
}: {
  code: string;
  language: CodeLang;
  lineNumbers?: boolean;
  /** 줄 내용을 바꿔 그릴 때(코드 빈칸 입력칸 등). 기본은 글자 그대로 */
  renderLine?: (line: string, index: number) => ReactNode;
}) {
  const lines = code.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
  const label = CODE_LANG_LABEL[language];
  const width = String(lines.length).length;
  return (
    <span
      role="group"
      aria-label={`${label} 코드`}
      data-code-block={language}
      className="my-1 block w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-surface text-left text-foreground"
    >
      <span className="block border-b border-border px-3 py-1 font-sans text-xs font-medium text-muted">{label}</span>
      <code className="relative block overflow-x-auto px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre sm:text-sm">
        {lines.map((line, i) => (
          <span key={i} className="block min-h-6">
            {lineNumbers && (
              <span aria-hidden className="mr-3 inline-block select-none text-right text-muted" style={{ width: `${width}ch` }}>
                {i + 1}
              </span>
            )}
            {renderLine ? renderLine(line, i) : line}
          </span>
        ))}
      </code>
    </span>
  );
}

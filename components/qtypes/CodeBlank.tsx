"use client";

import { splitBlankText } from "@/lib/qtypes/blank";
import { normalizeCodeInput } from "@/lib/qtypes/codeBlank";
import { CodeBlock } from "./CodeBlock";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark, ReviewList, ReviewRow, Tag } from "./ui";

/** 줄 하나를 글자 조각과 빈칸 번호로 나눈다 */
const lineParts = (line: string) => splitBlankText(line);

// 휴대폰 키보드의 자동 수정·대문자·맞춤법 검사를 끈다(결정 13) — 굽은 따옴표가 들어와도 채점 전에 바뀐다
const CODE_INPUT_ATTRS = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  enterKeyHint: "done",
  inputMode: "text",
} as const;

function Input({ question, answer, onChange, disabled }: InputProps<"code-blank">) {
  const set = (i: number, v: string) => onChange(answer.map((x, j) => (j === i ? v : x)));
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">빈칸에 들어갈 코드를 입력하세요. 모든 빈칸이 맞아야 정답입니다(부분 점수 없음).</p>
      <CodeBlock
        code={question.source}
        language={question.language}
        renderLine={(line) =>
          lineParts(line).map((part, k) =>
            typeof part === "string" ? (
              <span key={k}>{part}</span>
            ) : (
              <input
                key={k}
                {...CODE_INPUT_ATTRS}
                aria-label={`빈칸 ${part + 1}`}
                value={answer[part] ?? ""}
                disabled={disabled}
                onChange={(e) => set(part, e.target.value)}
                placeholder={`(${part + 1})`}
                size={Math.max(6, (answer[part] ?? "").length + 1)}
                className="mx-0.5 rounded border border-primary/60 bg-background px-1 font-mono text-foreground placeholder:text-muted disabled:opacity-80"
              />
            ),
          )
        }
      />
    </div>
  );
}

function Review({ question, answer, result }: ReviewProps<"code-blank">) {
  const { blanks, quotesFixed } = result.detail;
  return (
    <div className="flex flex-col gap-2">
      {/* 내 답을 끼운 코드 — 칸마다 ✓/✗ */}
      <CodeBlock
        code={question.source}
        language={question.language}
        renderLine={(line) =>
          lineParts(line).map((part, k) =>
            typeof part === "string" ? (
              <span key={k}>{part}</span>
            ) : (
              <span key={k} className={`rounded px-0.5 font-semibold ${blanks[part] ? "text-correct" : "text-incorrect"}`}>
                <span aria-hidden>{blanks[part] ? "✓" : "✗"}</span>
                {normalizeCodeInput(answer[part] ?? "").text || "(빈칸)"}
                <span className="sr-only">{blanks[part] ? " 정답" : " 오답"}</span>
              </span>
            ),
          )
        }
      />
      <ReviewList>
        {question.blanks.map((b, i) => (
          <ReviewRow key={i} tone={blanks[i] ? "correct" : "incorrect"} aside={<Mark ok={blanks[i]} />}>
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="font-semibold">빈칸 {i + 1}</span>
              <Tag tone="primary">내 답</Tag>
              <code className="font-mono">{normalizeCodeInput(answer[i] ?? "").text || "(빈칸)"}</code>
              {!blanks[i] && (
                <>
                  <Tag tone="correct">정답</Tag>
                  <code className="font-mono">{b.accept[0]}</code>
                  {b.accept.length > 1 && <span className="text-xs text-muted">(같은 답: {b.accept.slice(1).join(", ")})</span>}
                </>
              )}
            </div>
          </ReviewRow>
        ))}
      </ReviewList>
      {quotesFixed && (
        <p className="text-xs text-muted">
          <span aria-hidden>ⓘ </span>굽은 따옴표(‘ ’ “ ”)를 곧은 따옴표(&apos; &quot;)로 바꿔 채점했습니다.
        </p>
      )}
    </div>
  );
}

export const CodeBlankUI: QTypeUI<"code-blank"> = { Input, Review };

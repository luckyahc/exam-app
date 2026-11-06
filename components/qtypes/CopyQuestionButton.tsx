"use client";

import { useState } from "react";
import { questionMarkdown } from "@/lib/qtypes/questionMarkdown";
import type { Question } from "@/lib/qtypes/registry";

/** 문제를 Markdown으로 클립보드에 복사한다(정답·해설 제외). 결과는 버튼 글자로 알린다 */
export function CopyQuestionButton({ question, className }: { question: Question; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(questionMarkdown(question));
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button type="button" onClick={copy} aria-live="polite" className={className}>
      {state === "copied" ? "복사됨" : state === "failed" ? "복사 실패" : "문제 복사하기"}
    </button>
  );
}

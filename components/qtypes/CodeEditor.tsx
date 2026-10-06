"use client";

import { useId, useRef, useState } from "react";
import { CODE_LANG_LABEL, type CodeLang } from "@/lib/qtypes/_shared/codeTokens";

const INDENT = "    ";

/**
 * 코드 입력칸(Sprint 13). 고정폭·줄바꿈 안 함·자동 수정/대문자/맞춤법 검사 끔(결정 13).
 * Tab 키(접근성): Tab = 들여쓰기 4칸, Shift+Tab = 내어쓰기. **Esc를 누른 다음 Tab**은 들여쓰기 대신 다음 항목으로 포커스를 옮긴다
 * (키보드만 쓰는 사용자가 입력칸에 갇히지 않게 — WCAG 2.1.2). 사용 방법은 입력칸 아래 안내 문구로 알린다(aria-describedby).
 * Enter는 윗줄의 들여쓰기를 이어 준다. 입력 중에는 퀴즈 단축키가 동작하지 않는다(useQuizShortcuts가 TEXTAREA를 건너뜀).
 */
export function CodeEditor({
  value,
  onChange,
  language,
  disabled,
  label,
}: {
  value: string;
  onChange(v: string): void;
  language: CodeLang;
  disabled?: boolean;
  label: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [escaped, setEscaped] = useState(false);
  const hintId = useId();
  const rows = Math.min(18, Math.max(6, value.split("\n").length + 1));

  /** 선택 영역을 바꾼 뒤 커서 위치를 맞춘다(React 상태 갱신 뒤) */
  const apply = (next: string, start: number, end: number) => {
    onChange(next);
    requestAnimationFrame(() => ref.current?.setSelectionRange(start, end));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: t, value: v } = el;
    if (e.key === "Escape") {
      setEscaped(true);
      return;
    }
    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (escaped) {
        setEscaped(false);
        return; // 기본 동작: 다음/이전 항목으로 포커스 이동
      }
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      if (e.shiftKey) {
        // 내어쓰기: 선택한 줄들의 앞 공백 최대 4칸 제거
        const block = v.slice(lineStart, t);
        const lines = block.split("\n");
        let removedFirst = 0;
        let removed = 0;
        const out = lines.map((l, i) => {
          const n = l.match(/^ {1,4}/)?.[0].length ?? 0;
          if (i === 0) removedFirst = n;
          removed += n;
          return l.slice(n);
        });
        apply(v.slice(0, lineStart) + out.join("\n") + v.slice(t), Math.max(lineStart, s - removedFirst), Math.max(lineStart, t - removed));
      } else if (s !== t && v.slice(s, t).includes("\n")) {
        // 여러 줄 선택: 각 줄 앞에 4칸
        const block = v.slice(lineStart, t);
        const lines = block.split("\n");
        apply(v.slice(0, lineStart) + lines.map((l) => INDENT + l).join("\n") + v.slice(t), s + INDENT.length, t + INDENT.length * lines.length);
      } else {
        apply(v.slice(0, s) + INDENT + v.slice(t), s + INDENT.length, s + INDENT.length);
      }
      return;
    }
    if (escaped) setEscaped(false);
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.nativeEvent.isComposing) {
      // 자동 들여쓰기: 윗줄과 같은 들여쓰기(+ 콜론으로 끝나면 4칸 더 — 파이썬)
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const line = v.slice(lineStart, s);
      let indent = line.match(/^[ \t]*/)?.[0] ?? "";
      if (language === "python" && /:\s*$/.test(line)) indent += INDENT;
      const ins = "\n" + indent;
      apply(v.slice(0, s) + ins + v.slice(t), s + ins.length, s + ins.length);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-xs text-muted">
        <span className="font-medium">{CODE_LANG_LABEL[language]} 코드 입력</span>
      </span>
      <textarea
        ref={ref}
        aria-label={label}
        aria-describedby={hintId}
        value={value}
        readOnly={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => setEscaped(false)}
        rows={rows}
        wrap="off"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-gramm="false"
        className="w-full min-w-0 resize-y overflow-x-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre text-foreground read-only:opacity-80 sm:text-sm"
      />
      <span id={hintId} className="text-xs text-muted">
        Tab: 들여쓰기 4칸 · Shift+Tab: 내어쓰기 · Esc 다음 Tab: 다음 항목으로 이동{escaped && " — 지금 Tab을 누르면 이동합니다"}
      </span>
    </div>
  );
}

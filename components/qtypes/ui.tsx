import type { ReactNode } from "react";

/** prompt·해설의 제한된 마크다운: **굵게**, `인라인 코드`만 해석한다(HTML 주입 없음). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="rounded bg-surface px-1 py-0.5 font-mono text-[0.9em]">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** 정오 표시 — 색 단독 금지: 아이콘 + 텍스트를 함께 쓴다. */
export function Mark({
  ok,
  okText = "정답",
  noText = "오답",
}: {
  ok: boolean;
  okText?: string;
  noText?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold ${ok ? "text-correct" : "text-incorrect"}`}
    >
      <span aria-hidden>{ok ? "✓" : "✗"}</span>
      {ok ? okText : noText}
    </span>
  );
}

/** 작은 꼬리표: "내 답", "정답" */
export function Tag({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "correct" | "incorrect" | "primary";
}) {
  const color = {
    muted: "border-border text-muted",
    correct: "border-correct text-correct",
    incorrect: "border-incorrect text-incorrect",
    primary: "border-primary text-primary",
  }[tone];
  return (
    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

/** 선택형 보기 버튼(mcq·multi·ox·graph 공용). 키보드 번호를 함께 보여 준다. */
export function ChoiceButton({
  index,
  selected,
  disabled,
  onClick,
  children,
  role = "radio",
}: {
  index: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
  role?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={
        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-default " +
        (selected
          ? "border-primary bg-primary/10"
          : "border-border bg-surface hover:border-primary/60")
      }
    >
      <span
        aria-hidden
        className={
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-xs font-semibold " +
          (selected ? "bg-primary text-background" : "border border-border text-muted")
        }
      >
        {index + 1}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

/** 비교 화면의 한 줄: 왼쪽 내용 + 오른쪽 꼬리표/정오 */
export function ReviewRow({
  tone,
  children,
  aside,
}: {
  tone: "correct" | "incorrect" | "neutral";
  children: ReactNode;
  aside?: ReactNode;
}) {
  const border = {
    correct: "border-correct",
    incorrect: "border-incorrect",
    neutral: "border-border",
  }[tone];
  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border-l-4 ${border} bg-surface px-3 py-2`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {aside && <div className="flex flex-wrap items-center gap-1.5">{aside}</div>}
    </li>
  );
}

export function ReviewList({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}

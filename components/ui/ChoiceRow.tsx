import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 채점 결과. 값이 있으면 채점된 행이다 — 누를 수 없고, 반전 채움 대신 테두리 색으로 보인다.
 * correct 정답 보기 / incorrect 고른 오답 / missed 복수 선택에서 안 고른 정답 / neutral 나머지
 */
export type ChoiceResult = "correct" | "incorrect" | "missed" | "neutral";

const RESULT_CLASS: Record<ChoiceResult, string> = {
  correct: "border-ok text-sumi",
  incorrect: "border-shu text-sumi",
  missed: "border-dashed border-ok text-sumi",
  neutral: "border-sumi/15 text-muted",
};

/**
 * 객관식·복수 선택의 보기 한 줄. 1.5px 먹선 상자, 고르면 먹 배경 + 종이색 글씨로 반전.
 * 복수 선택은 왼쪽에 체크 칸, 단일 선택은 보기 번호. 묶음(radiogroup/group)은 쓰는 쪽이 감싼다.
 */
export function ChoiceRow({
  marker,
  children,
  selected,
  multiple = false,
  result,
  onSelect,
  disabled,
}: {
  /** 단일 선택에서 왼쪽 번호(“1”) */
  marker?: ReactNode;
  children: ReactNode;
  selected: boolean;
  multiple?: boolean;
  result?: ChoiceResult;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  const graded = result !== undefined;
  const inactive = graded || disabled;
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-disabled={inactive || undefined}
      onClick={inactive ? undefined : onSelect}
      className={cn(
        "flex min-h-12 w-full items-start gap-3 border-[1.5px] px-3.5 py-3 text-left text-base transition-colors",
        graded
          ? RESULT_CLASS[result]
          : selected
            ? "border-sumi bg-sumi text-paper"
            : "border-sumi bg-paper text-sumi active:bg-paper-deep",
        disabled && !graded && "opacity-40",
      )}
    >
      {multiple ? (
        <span
          aria-hidden
          className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center border-[1.5px] border-current"
        >
          {selected && <Check className="size-4" strokeWidth={2.5} />}
        </span>
      ) : (
        marker != null && (
          <span aria-hidden className="w-5 shrink-0 text-center font-mono font-semibold">
            {marker}
          </span>
        )
      )}
      <span className="min-w-0 flex-1">{children}</span>
      {(result === "correct" || result === "missed") && (
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ok">
          <Check aria-hidden className="size-4" strokeWidth={2.5} />
          {result === "correct" ? "정답" : "놓친 정답"}
        </span>
      )}
      {result === "incorrect" && (
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-shu">
          <X aria-hidden className="size-4" strokeWidth={2.5} />
          오답
        </span>
      )}
    </button>
  );
}

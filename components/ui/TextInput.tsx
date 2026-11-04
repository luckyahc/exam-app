"use client";

import { Check } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";
import { FieldStatusNote } from "./FieldStatusNote";
import { FIELD_BASE, type FieldStatus, fieldBorder } from "./fieldStatus";

/**
 * 단답형·빈칸·용어 퀴즈 입력. 글자 16px(iOS 포커스 확대 방지), 자동 대문자·자동 수정·맞춤법 검사 끔,
 * Enter(한글 조합 중 제외)면 onEnter. 채점 후: 정답이면 ok 테두리 + ✓, 오답이면 shu 테두리 + 아래에 정답.
 */
export function TextInput({
  label,
  hideLabel,
  status,
  answer,
  onEnter,
  className,
  id,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"input">, "className" | "size"> & {
  /** 짧게: “답”, “Q3”, “빈칸 1” */
  label: ReactNode;
  hideLabel?: boolean;
  status?: FieldStatus;
  /** 오답일 때 아래에 보여 줄 정답 */
  answer?: ReactNode;
  onEnter?: () => void;
  className?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const statusId = `${inputId}-status`;

  return (
    <div className={className ?? "w-full"}>
      <label
        htmlFor={inputId}
        className={cn("mb-1.5 block text-sm font-semibold", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-invalid={status === "incorrect" || undefined}
          aria-describedby={status ? statusId : undefined}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (e.defaultPrevented || !onEnter) return;
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onEnter();
            }
          }}
          className={cn(
            FIELD_BASE,
            fieldBorder(status),
            "placeholder:text-muted",
            status === "correct" && "pr-11",
          )}
          {...props}
        />
        {status === "correct" && (
          <Check
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-ok"
            strokeWidth={2.25}
          />
        )}
      </div>
      <FieldStatusNote id={statusId} status={status} answer={answer} />
    </div>
  );
}

"use client";

import { Check, ChevronDown } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";
import { FieldStatusNote } from "./FieldStatusNote";
import { FIELD_BASE, type FieldStatus, fieldBorder } from "./fieldStatus";

export type SelectOption = { value: string; label: string };

/** 짝짓기 항목마다 하나. 채점 표시는 TextInput과 같다(정답 ✓ / 오답이면 아래에 정답). */
export function SelectInput({
  label,
  hideLabel,
  options,
  placeholder = "선택",
  status,
  answer,
  className,
  id,
  ...props
}: Omit<ComponentProps<"select">, "className" | "children"> & {
  /** 짧게: “Q3”, “①” */
  label: ReactNode;
  hideLabel?: boolean;
  options: readonly SelectOption[];
  /** 아무것도 고르지 않았을 때 보이는 글자(value=""). null이면 넣지 않는다 */
  placeholder?: string | null;
  status?: FieldStatus;
  answer?: ReactNode;
  className?: string;
}) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const statusId = `${selectId}-status`;
  const Icon = status === "correct" ? Check : ChevronDown;

  return (
    <div className={className ?? "w-full"}>
      <label
        htmlFor={selectId}
        className={cn("mb-1.5 block text-sm font-semibold", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={status === "incorrect" || undefined}
          aria-describedby={status ? statusId : undefined}
          className={cn(FIELD_BASE, fieldBorder(status), "appearance-none pr-11")}
          {...props}
        >
          {placeholder !== null && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2",
            status === "correct" ? "text-ok" : "text-sumi",
          )}
          strokeWidth={status === "correct" ? 2.25 : 1.75}
        />
      </div>
      <FieldStatusNote id={statusId} status={status} answer={answer} />
    </div>
  );
}

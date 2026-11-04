import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 필터 전용 토글. 선택 표시는 배경 채움 하나뿐(체크·테두리 강조를 겹쳐 쓰지 않는다). */
export function Chip({
  selected,
  count,
  children,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  selected: boolean;
  /** 이름 뒤 작은 숫자(해당 문제 수 등) */
  count?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 px-3.5 text-sm font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        selected ? "bg-sumi text-paper" : "bg-paper-deep text-sumi",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn("font-mono text-xs tabular-nums", !selected && "text-muted")}>
          {count}
        </span>
      )}
    </button>
  );
}

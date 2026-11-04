import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 켜고 끄는 스위치. 행 전체가 하나의 버튼이라 글자를 눌러도 바뀐다(터치 영역 확보).
 * 켜짐: 먹으로 채운 칸 오른쪽에 종이색 네모 / 꺼짐: 빈 칸 왼쪽에 먹색 네모.
 */
export function SwitchInk({
  checked,
  onCheckedChange,
  children,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-4 px-3 py-2.5 text-left transition-colors active:bg-paper-deep",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      <span className="text-base font-semibold">{children}</span>
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 border-[1.5px] border-sumi transition-colors",
          checked ? "bg-sumi" : "bg-paper",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0.5 size-4 -translate-y-1/2 transition-[translate,background-color] motion-reduce:transition-none",
            checked ? "translate-x-[21px] bg-paper" : "bg-sumi",
          )}
        />
      </span>
    </button>
  );
}

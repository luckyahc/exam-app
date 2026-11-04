"use client";

import { type KeyboardEvent, useRef } from "react";
import { cn } from "@/lib/cn";

type Item<T extends string> = { value: T; label: string };

/**
 * 탭처럼 쓰는 세그먼트(챕터 | 용어 | 문제 목록, 틀린 문제 | 북마크).
 * 키보드: ←/→로 옮기며 바로 선택, Home/End. 패널에는 segmentPanelProps를 붙인다.
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  label,
  idPrefix,
  className,
}: {
  items: readonly Item<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 스크린리더용 이름 */
  label: string;
  /** 패널과 연결할 id 앞부분(segmentPanelProps와 같은 값) */
  idPrefix?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(items[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("grid auto-cols-fr grid-flow-col border-[1.5px] border-sumi", className)}
    >
      {items.map((item, i) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${item.value}` : undefined}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "min-h-11 px-2 text-sm font-semibold transition-colors",
              selected ? "bg-sumi text-paper" : "text-sumi active:bg-paper-deep",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** SegmentedControl의 선택 항목과 짝이 되는 패널 속성 */
export function segmentPanelProps(idPrefix: string, value: string) {
  return {
    role: "tabpanel" as const,
    id: `${idPrefix}-panel-${value}`,
    "aria-labelledby": `${idPrefix}-tab-${value}`,
  };
}

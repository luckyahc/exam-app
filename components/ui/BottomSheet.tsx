"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

/**
 * 아래에서 올라오는 시트. 네이티브 <dialog>(showModal)라 포커스 가두기·Esc 닫기·배경 비활성이 기본으로 된다.
 * 배경(어두운 막)을 눌러도 닫힌다. footer는 스크롤 영역 밖 하단에 고정된다(예: “조건에 맞는 문제 18개 풀기”).
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // 열려 있는 동안 뒤 페이지가 스크롤되지 않게
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 top-auto bottom-0 m-0 hidden max-h-[85dvh] w-full max-w-none flex-col border-t-[1.5px] border-sumi bg-paper p-0 text-sumi backdrop:bg-black/50 open:flex motion-safe:animate-[sheet-up_180ms_ease-out]"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 pt-1 pr-1 pl-4">
        <h2 id={titleId} className="font-display text-lg font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="inline-flex size-11 items-center justify-center text-muted"
        >
          <X aria-hidden className="size-5" strokeWidth={1.75} />
        </button>
      </div>
      <div
        className={
          "min-h-0 flex-1 overflow-y-auto px-4 " +
          (footer ? "pb-4" : "pb-[max(1rem,env(safe-area-inset-bottom))]")
        }
      >
        {children}
      </div>
      {footer && (
        <div className="shrink-0 border-t-[1.5px] border-sumi px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </dialog>
  );
}

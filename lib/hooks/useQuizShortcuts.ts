"use client";

import { useEffect, useEffectEvent } from "react";

export interface QuizShortcutHandlers {
  /** 숫자키 1~9 → 0부터 시작하는 보기 번호 */
  onChoice?(index: number): void;
  /** Enter: 제출 또는 다음 문제 */
  onEnter?(): void;
  onPrev?(): void;
  onNext?(): void;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * 퀴즈 전역 키보드 단축키(원본 §2): 1~5 선택지, Enter 제출/다음, ←/→ 이전/다음.
 * 입력칸·드롭다운에 포커스가 있으면 끈다. 포커스된 버튼·링크 위의 Enter는 브라우저 기본 동작(클릭)에 맡긴다.
 */
export function useQuizShortcuts(handlers: QuizShortcutHandlers) {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
    if (/^[1-9]$/.test(e.key) && handlers.onChoice) {
      e.preventDefault();
      handlers.onChoice(Number(e.key) - 1);
    } else if (e.key === "Enter" && handlers.onEnter) {
      const el = e.target instanceof HTMLElement ? e.target : null;
      if (el && (el.tagName === "BUTTON" || el.tagName === "A")) return;
      e.preventDefault();
      handlers.onEnter();
    } else if (e.key === "ArrowLeft" && handlers.onPrev) {
      e.preventDefault();
      handlers.onPrev();
    } else if (e.key === "ArrowRight" && handlers.onNext) {
      e.preventDefault();
      handlers.onNext();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

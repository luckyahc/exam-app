"use client";

import { isBookmarked, toggleBookmark, useRecords } from "@/lib/storage/recordsStore";

/** 북마크 토글. 상태를 아이콘(★/☆)과 텍스트로 함께 보여 준다(색 단독 금지). */
export function BookmarkButton({ subjectId, questionId }: { subjectId: string; questionId: string }) {
  const records = useRecords();
  const on = isBookmarked(records, subjectId, questionId);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggleBookmark(subjectId, questionId)}
      className={
        "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium " +
        (on ? "border-primary text-foreground" : "border-border text-muted hover:text-foreground")
      }
    >
      <span aria-hidden>{on ? "★" : "☆"}</span>
      {on ? "북마크됨" : "북마크"}
    </button>
  );
}

"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { isBookmarked, toggleBookmark, useRecords } from "@/lib/storage/recordsStore";

/** 북마크 켜고 끄기: lucide 아이콘(켜지면 채움) + 스크린리더용 이름, 터치 영역 44px. 저장은 recordsStore.toggleBookmark 그대로 */
export function BookmarkIcon({ subjectId, questionId }: { subjectId: string; questionId: string }) {
  const records = useRecords();
  const on = isBookmarked(records, subjectId, questionId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label="북마크"
      onClick={() => toggleBookmark(subjectId, questionId)}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center",
        on ? "text-sumi" : "text-muted",
      )}
    >
      <Bookmark
        aria-hidden
        className="size-5"
        strokeWidth={1.75}
        fill={on ? "currentColor" : "none"}
      />
    </button>
  );
}

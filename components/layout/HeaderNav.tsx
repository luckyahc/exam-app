"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getChapter, getSubject, subjectStyle } from "@/lib/subjects";

/** 경로(/s/{과목}/chapter/{챕터})에서 브레드크럼과 과목별 오답노트·통계 링크를 만든다. */
export function HeaderNav({ trailing }: { trailing?: ReactNode }) {
  const pathname = usePathname();
  const [, s, subjectId, c, chapterId] = pathname.split("/");
  const subject = s === "s" ? getSubject(subjectId) : undefined;
  const chapter = subject && c === "chapter" ? getChapter(subject.id, chapterId) : undefined;
  const reviewHref = subject ? `/review?subject=${subject.id}` : "/review?subject=all";
  const statsHref = subject ? `/stats?subject=${subject.id}` : "/stats?subject=all";

  return (
    <>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm">
        <li>
          <Link href="/" className="text-base font-bold sm:text-lg">
            시험
          </Link>
        </li>
        {subject && (
          <li
            className="flex items-center gap-1.5"
            data-subject={subject.id}
            style={subjectStyle(subject)}
          >
            <span aria-hidden className="text-muted">
              ›
            </span>
            <Link href={`/s/${subject.id}`} className="flex items-center gap-1.5 font-medium">
              <span aria-hidden className="inline-block size-2.5 rounded-full bg-subject" />
              {subject.name}
            </Link>
          </li>
        )}
        {chapter && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-muted">
              ›
            </span>
            <span aria-current="page" className="text-muted">
              {chapter.id.toUpperCase()}
            </span>
          </li>
        )}
      </ol>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href={reviewHref} className="text-sm text-muted hover:text-foreground">
          오답노트
        </Link>
        {/* 좁은 화면에서는 아이콘만(이름은 aria-label), sm 이상에서는 글자도 보인다 */}
        <Link href={statsHref} aria-label="통계" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5 sm:hidden" fill="currentColor">
            <rect x="3" y="10" width="3" height="7" rx="0.5" />
            <rect x="8.5" y="6" width="3" height="11" rx="0.5" />
            <rect x="14" y="3" width="3" height="14" rx="0.5" />
          </svg>
          <span className="hidden sm:inline">통계</span>
        </Link>
        {trailing}
      </div>
    </>
  );
}

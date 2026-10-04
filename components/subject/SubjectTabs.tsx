"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SUBJECTS } from "@/data/subjects/registry";
import { getSubject, subjectStyle } from "@/lib/subjects";

/** `?subject=all|{과목 id}` 탭. 알 수 없는 값은 `all`로 본다. */
export function useSelectedSubject(): string {
  const value = useSearchParams().get("subject") ?? "all";
  return getSubject(value) ? value : "all";
}

export function SubjectTabs() {
  const pathname = usePathname();
  const selected = useSelectedSubject();
  const tabs = [
    { id: "all", label: "전체" },
    ...SUBJECTS.map((s) => ({ id: s.id, label: s.name })),
  ];

  return (
    <nav aria-label="과목" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const subject = getSubject(tab.id);
        const active = tab.id === selected;
        return (
          <Link
            key={tab.id}
            href={`${pathname}?subject=${tab.id}`}
            aria-current={active ? "page" : undefined}
            data-subject={subject?.id}
            style={subject ? subjectStyle(subject) : undefined}
            className={
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors " +
              (active
                ? "border-foreground font-semibold"
                : "border-border text-muted hover:text-foreground")
            }
          >
            {subject && (
              <span aria-hidden className="inline-block size-2 rounded-full bg-subject" />
            )}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** 선택된 과목 이름(전체면 "전체 과목"). */
export function SelectedSubjectName() {
  const selected = useSelectedSubject();
  return <>{getSubject(selected)?.name ?? "전체 과목"}</>;
}

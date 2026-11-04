"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { SUBJECTS } from "@/data/subjects/registry";
import { getSubject } from "@/lib/subjects";

/** `?subject=all|{과목 id}` 필터. 알 수 없는 값은 `all`로 본다. */
export function useSelectedSubject(): string {
  const value = useSearchParams().get("subject") ?? "all";
  return getSubject(value) ? value : "all";
}

/** 복습·통계 탭의 과목 필터(Chip). 고르면 주소의 ?subject=만 바꾼다(기존 링크 /review?subject=os 그대로 동작) */
export function SubjectTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const selected = useSelectedSubject();
  const tabs = [
    { id: "all", label: "전체" },
    ...SUBJECTS.map((s) => ({ id: s.id, label: s.name })),
  ];

  return (
    <div role="group" aria-label="과목" className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Chip
          key={tab.id}
          selected={tab.id === selected}
          onClick={() => router.replace(`${pathname}?subject=${tab.id}`, { scroll: false })}
        >
          {tab.label}
        </Chip>
      ))}
    </div>
  );
}

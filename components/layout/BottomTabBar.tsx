"use client";

import { BookOpen, ChartColumn, NotebookPen, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Tab = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

const TABS: Tab[] = [
  { href: "/", label: "과목", icon: BookOpen, match: (p) => p === "/" || p.startsWith("/s/") },
  { href: "/review", label: "복습", icon: NotebookPen, match: (p) => p.startsWith("/review") },
  { href: "/stats", label: "통계", icon: ChartColumn, match: (p) => p.startsWith("/stats") },
  { href: "/settings", label: "설정", icon: Settings, match: (p) => p.startsWith("/settings") },
];

/** 탭바를 숨기는 화면: 문제 풀이(연습·시험 모드 모두 /quiz) */
const HIDDEN = (path: string) => path.startsWith("/quiz");

/** 탭바 높이(아이콘 + 라벨). 아이폰 홈 바 영역(safe-area-inset-bottom)은 이 위에 더한다 */
const BAR = "h-14";

/**
 * 하단 탭바 4개. 탭은 항상 그 탭의 루트로 간다 — 하위 화면(과목 → 챕터)에서 지금 탭을 다시 누르면 루트로 돌아온다.
 * 고정 막대에 가려지지 않도록 같은 높이의 빈 칸을 문서 흐름에 함께 둔다.
 */
export function BottomTabBar() {
  const pathname = usePathname();
  if (HIDDEN(pathname)) return null;

  return (
    <>
      <div
        aria-hidden
        className={cn(BAR, "shrink-0 box-content pb-[env(safe-area-inset-bottom)]")}
      />
      <nav
        aria-label="주 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-sumi bg-paper pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      >
        <ul className={cn(BAR, "mx-auto grid max-w-3xl grid-cols-4")}>
          {TABS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-0.5 text-[11px]",
                    active ? "font-bold text-sumi" : "text-muted",
                  )}
                >
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

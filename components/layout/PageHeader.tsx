import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 화면 머리. 탭 루트는 큰 제목만, 하위 화면은 뒤로가기(← 상위 이름)와 제목. 브레드크럼은 쓰지 않는다.
 * trailing: 오른쪽 끝(과목 상세의 시험 범위 드롭다운 등).
 */
export function PageHeader({
  title,
  back,
  trailing,
}: {
  title: ReactNode;
  back?: { href: string; label: string };
  trailing?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1 pt-2">
      {back && <BackLink {...back} />}
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 font-display text-2xl font-bold">{title}</h1>
        {trailing}
      </div>
    </header>
  );
}

/** ← 상위 화면 링크(터치 높이 44px) */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-0.5 self-start pr-2 text-sm text-muted"
    >
      <ChevronLeft aria-hidden className="size-5" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

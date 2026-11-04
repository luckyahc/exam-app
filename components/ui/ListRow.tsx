import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 행 목록. 위아래는 굵은 먹선, 행 사이는 옅은 먹선 — 시험지 표처럼. */
export function List({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn("divide-y divide-sumi/15 border-y-[1.5px] border-sumi", className)}
    >
      {children}
    </ul>
  );
}

type ListRowProps = {
  title: ReactNode;
  /** 제목 아래 한 줄(작고 흐리게) */
  description?: ReactNode;
  /** 오른쪽 값(예: 진행 “12/40”) */
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** 오른쪽 › 표시. 기본: 누를 수 있는 행이면 보인다 */
  chevron?: boolean;
};

/** List 안에 넣는 한 행. href면 링크, onClick이면 버튼, 둘 다 없으면 정보 행. */
export function ListRow({
  title,
  description,
  trailing,
  href,
  onClick,
  disabled,
  chevron,
}: ListRowProps) {
  const interactive = !!(href || onClick) && !disabled;
  const body = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-semibold">{title}</span>
        {description != null && <span className="text-sm text-muted">{description}</span>}
      </span>
      {trailing != null && (
        <span
          className={cn(
            "shrink-0 text-sm text-muted tabular-nums",
            isNumeric(trailing) && "font-mono",
          )}
        >
          {trailing}
        </span>
      )}
      {(chevron ?? interactive) && (
        <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" strokeWidth={1.75} />
      )}
    </>
  );
  const rowClass = cn(
    "flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left",
    interactive && "transition-colors active:bg-paper-deep",
    disabled && "opacity-40",
  );

  return (
    <li>
      {href && !disabled ? (
        <Link href={href} className={rowClass}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} disabled={disabled} className={rowClass}>
          {body}
        </button>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}

/** 숫자만 있는 값(“12/40”, “30%”)은 숫자 글꼴, 한글이 섞이면(“아직 안 풂”) 본문 글꼴 — 고정폭 글꼴에는 한글이 없어 띄어쓰기가 벌어진다 */
function isNumeric(v: ReactNode) {
  return typeof v === "string" && /^[\d\s/%.,:+-]+$/.test(v);
}

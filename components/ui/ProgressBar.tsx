import { cn } from "@/lib/cn";

/** 진행 막대. 채움은 먹, 바탕은 면 색(paper-deep 면 위에 놓을 때는 track="paper"). 모서리 없음 */
export function ProgressBar({
  value,
  max,
  label,
  track = "deep",
  className,
}: {
  value: number;
  max: number;
  label: string;
  track?: "deep" | "paper";
  className?: string;
}) {
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "block h-1.5 overflow-hidden",
        track === "paper" ? "bg-paper" : "bg-paper-deep",
        className,
      )}
    >
      <span
        className="block h-full bg-sumi transition-[width]"
        style={{ width: `${max ? (value / max) * 100 : 0}%` }}
      />
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 형광펜으로 표시하는 시험 포인트 문구 */
export const EXAM_MARK = "시험/필기/중요";

/** 형광펜. 시험 포인트에만 쓴다(이전 ⭐ 자리). */
export function Marker({ children, className }: { children: ReactNode; className?: string }) {
  return <mark className={cn("bg-marker px-1 text-marker-ink", className)}>{children}</mark>;
}

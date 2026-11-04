import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 형광펜. “시험 포인트”에만 쓴다(이전 ⭐ 자리). */
export function Marker({ children, className }: { children: ReactNode; className?: string }) {
  return <mark className={cn("bg-marker px-1 text-marker-ink", className)}>{children}</mark>;
}

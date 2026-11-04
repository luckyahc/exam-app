"use client";

import { SwitchInk } from "@/components/ui/SwitchInk";
import { useDarkMode } from "@/lib/theme/useTheme";

/** 설정 탭의 테마 토글. 처음엔 시스템 설정을 따르고, 바꾸면 그 값이 저장되어 우선한다. */
export function DarkModeSwitch({ className }: { className?: string }) {
  const { isDark, setDark } = useDarkMode();
  return (
    <SwitchInk checked={isDark} onCheckedChange={setDark} className={className}>
      다크 모드
    </SwitchInk>
  );
}

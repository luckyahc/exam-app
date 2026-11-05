"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { type ProgressScope, updateSettings, useAppSettings } from "@/lib/settings/appSettings";

const ITEMS = [
  { value: "final", label: "기말" },
  { value: "all", label: "전체" },
] as const;

/** 진행상황 범위 전환 [기말 | 전체]. 기본 기말, 고른 값은 설정(localStorage)에 저장되어 홈·과목·통계가 함께 따른다 */
export function ProgressScopeToggle({ className }: { className?: string }) {
  const { settings } = useAppSettings();
  return (
    <SegmentedControl<ProgressScope>
      label="진행 범위"
      items={ITEMS}
      value={settings.progressScope}
      onChange={(progressScope) => updateSettings({ progressScope })}
      className={className}
    />
  );
}

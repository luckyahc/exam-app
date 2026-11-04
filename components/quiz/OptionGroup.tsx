"use client";

import { type ReactNode, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { TextInput } from "@/components/ui/TextInput";

/** 바텀시트 안의 선택 묶음: 짧은 제목 + Chip 줄 */
export function OptionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const TIMERS = [0, 10, 20, 30, 60] as const; // 분, 0 = 없음
export const MAX_TIMER_MIN = 300;

/** 직접 입력: 1~300분만, 그 밖이나 빈 칸은 0(제한 없음) */
export function customMinutes(text: string): number {
  const n = Number(text);
  return n >= 1 && n <= MAX_TIMER_MIN ? n : 0;
}

/** 제한 시간(분). 미리 정한 값 + 직접 입력. value 0 = 제한 없음 */
export function TimerChips({
  value,
  onChange,
}: {
  value: number;
  onChange: (min: number) => void;
}) {
  const [custom, setCustom] = useState<string | null>(
    (TIMERS as readonly number[]).includes(value) ? null : String(value),
  );
  return (
    <>
      <OptionGroup label="제한 시간">
        {TIMERS.map((m) => (
          <Chip
            key={m}
            selected={custom === null && value === m}
            onClick={() => {
              setCustom(null);
              onChange(m);
            }}
          >
            {m ? `${m}분` : "없음"}
          </Chip>
        ))}
        <Chip
          selected={custom !== null}
          onClick={() => {
            setCustom((v) => v ?? "");
            if (custom === null) onChange(0);
          }}
        >
          직접
        </Chip>
      </OptionGroup>
      {custom !== null && (
        <TextInput
          label={`분 (1~${MAX_TIMER_MIN})`}
          inputMode="numeric"
          autoFocus
          value={custom}
          onChange={(e) => {
            const t = e.target.value.replace(/\D/g, "").slice(0, 3);
            setCustom(t);
            onChange(customMinutes(t));
          }}
        />
      )}
    </>
  );
}

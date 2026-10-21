"use client";

import type { ExamView } from "@/lib/quiz/session";

const VIEWS: { value: ExamView; label: string; help: string }[] = [
  { value: "eclass", label: "실제 시험 화면", help: "학교 e-Class 시험처럼 왼쪽 답안지 표와 번호 보기로 풉니다." },
  { value: "app", label: "기본 화면", help: "앱의 기존 풀이 화면으로 풉니다." },
];

/** 시험 모드 화면 고르기(실제 시험 화면 / 기본 화면) — 챕터 시작·과목 홈 시작 상자에서 시험 모드일 때만 보인다 */
export function ExamViewPicker({ value, onChange }: { value: ExamView; onChange(v: ExamView): void }) {
  const chip = (on: boolean) =>
    "rounded-full border px-3 py-1.5 text-sm transition-colors " +
    (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground");
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">화면</span>
      <div role="radiogroup" aria-label="시험 화면" className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button key={v.value} type="button" role="radio" aria-checked={value === v.value} onClick={() => onChange(v.value)} className={chip(value === v.value)}>
            {value === v.value && <span aria-hidden>✓ </span>}
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{VIEWS.find((v) => v.value === value)?.help} 푸는 중에도 바꿀 수 있습니다.</p>
    </div>
  );
}

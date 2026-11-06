"use client";

import type { ReactNode } from "react";
import { DarkModeSwitch } from "@/components/theme/DarkModeSwitch";
import { List } from "@/components/ui/ListRow";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextInput } from "@/components/ui/TextInput";
import { CURRENT_EXAM, getExam } from "@/data/subjects/exams";
import { SUBJECTS } from "@/data/subjects/registry";
import {
  ddayLabel,
  QUIZ_COUNTS,
  type QuizCount,
  type QuizModeSetting,
  type QuizOrder,
  updateSettings,
  useAppSettings,
} from "@/lib/settings/appSettings";
import { DataManager } from "./DataManager";

/** 설정 탭: 다크 모드, 문제 풀기 기본값, 과목별 시험 날짜(D-day), 기록 관리 */
export function SettingsView() {
  const { loaded, settings } = useAppSettings();
  const exam = getExam(CURRENT_EXAM)!;

  return (
    <div className="flex flex-col gap-8">
      <List aria-label="화면">
        <li>
          <DarkModeSwitch />
        </li>
      </List>

      <Section title="문제 풀기 기본값">
        <SelectInput
          label="문제 수"
          placeholder={null}
          disabled={!loaded}
          value={String(settings.quizCount)}
          onChange={(e) => updateSettings({ quizCount: Number(e.target.value) as QuizCount })}
          options={QUIZ_COUNTS.map((n) => ({ value: String(n), label: `${n}문제` }))}
        />
        <SelectInput
          label="순서"
          placeholder={null}
          disabled={!loaded}
          value={settings.quizOrder}
          onChange={(e) => updateSettings({ quizOrder: e.target.value as QuizOrder })}
          options={[
            { value: "ordered", label: "순서대로" },
            { value: "shuffle", label: "섞어서" },
          ]}
        />
        <SelectInput
          label="모드"
          placeholder={null}
          disabled={!loaded}
          value={settings.quizMode}
          onChange={(e) => updateSettings({ quizMode: e.target.value as QuizModeSetting })}
          options={[
            { value: "instant", label: "연습 모드" },
            { value: "exam", label: "시험 모드" },
          ]}
        />
      </Section>

      <Section title={`${exam.shortName} 날짜`}>
        {SUBJECTS.map((s) => {
          const date = settings.examDates[s.id] ?? "";
          const dday = ddayLabel(date || undefined);
          return (
            <TextInput
              key={s.id}
              type="date"
              label={
                <span className="flex justify-between gap-2">
                  {s.name}
                  {dday && <span className="font-mono text-muted">{dday}</span>}
                </span>
              }
              disabled={!loaded}
              value={date}
              onChange={(e) => {
                // 날짜를 지우면 그 과목 키를 뺀다
                const rest = Object.fromEntries(
                  Object.entries(settings.examDates).filter(([id]) => id !== s.id),
                );
                updateSettings({
                  examDates: e.target.value ? { ...rest, [s.id]: e.target.value } : rest,
                });
              }}
            />
          );
        })}
      </Section>

      <Section title="기록 관리">
        <p className="text-sm text-muted">
          방문자 통계를 위해 이 브라우저에 무작위 기기 번호를 저장해 서버로 보냅니다. 이름이나 IP는
          저장하지 않습니다.
        </p>
        <DataManager />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

"use client";

import { ButtonLink } from "@/components/ui/Button";
import { List, ListRow } from "@/components/ui/ListRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressScopeToggle } from "@/components/ui/ProgressScopeToggle";
import { CURRENT_EXAM, getExam } from "@/data/subjects/exams";
import { continueLink } from "@/lib/quiz/startLinks";
import { type AppSettings, daysUntil, ddayLabel, useAppSettings } from "@/lib/settings/appSettings";
import { type RecordsState, useRecords } from "@/lib/storage/recordsStore";

export interface HomeSubject {
  id: string;
  name: string;
  ready: boolean;
  /** 준비 중인 시험(CURRENT_EXAM) 범위 문제 id(alsoExam 포함) */
  ids: string[];
  /** 과목 전체 문제 id — 진행 범위 [전체]일 때 과목 행에 쓴다 */
  allIds?: string[];
}

/**
 * 과목 탭(홈). 맨 위에 다가오는 시험 하나와 주 버튼 하나, 아래는 과목 행(이름 + 진행률).
 * 기록·설정은 브라우저에만 있으므로 읽기 전(프리렌더)에는 같은 크기의 빈 자리만 그려 둔다.
 */
export function HomeView({ subjects }: { subjects: HomeSubject[] }) {
  const records = useRecords();
  const { loaded, settings } = useAppSettings();
  const ready = records.loaded && loaded;
  const exam = getExam(CURRENT_EXAM)!;
  const solvedIn = (s: HomeSubject, ids: readonly string[]) => {
    const rec = records.subjects[s.id];
    return rec ? ids.filter((id) => rec.progress[id]).length : 0;
  };
  const solvedOf = (s: HomeSubject) => solvedIn(s, s.ids);
  const hero = ready ? pickHero(subjects, records, settings) : undefined;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">과목</h1>

      {hero ? (
        <HeroCard
          subject={hero}
          solved={solvedOf(hero)}
          examName={exam.shortName}
          settings={settings}
        />
      ) : (
        <div aria-hidden className="h-48 bg-paper-deep" />
      )}

      <section aria-labelledby="subjects-heading" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 id="subjects-heading" className="font-display text-lg font-bold">
            과목
          </h2>
          <ProgressScopeToggle className="w-32 shrink-0" />
        </div>
        <List>
          {subjects.map((s) => {
            const ids = settings.progressScope === "all" ? (s.allIds ?? s.ids) : s.ids;
            const n = solvedIn(s, ids);
            return (
              <ListRow
                key={s.id}
                href={s.ready ? `/s/${s.id}` : undefined}
                disabled={!s.ready}
                title={s.name}
                trailing={
                  !s.ready
                    ? "준비 중"
                    : !ready || !ids.length
                      ? undefined
                      : n > 0
                        ? `${Math.round((n / ids.length) * 100)}%`
                        : "아직 안 풂"
                }
              />
            );
          })}
        </List>
      </section>
    </div>
  );
}

function HeroCard({
  subject,
  solved,
  examName,
  settings,
}: {
  subject: HomeSubject;
  solved: number;
  examName: string;
  settings: AppSettings;
}) {
  const dday = ddayLabel(settings.examDates[subject.id]);
  const cont = continueLink(subject.id, CURRENT_EXAM, solved, subject.ids.length, settings);
  return (
    <section aria-labelledby="hero-heading" className="flex flex-col gap-5 bg-paper-deep p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="hero-heading" className="font-display text-2xl font-bold">
          {subject.name} <span className="text-lg">{examName}</span>
        </h2>
        {dday && <span className="shrink-0 font-mono text-xl font-bold">{dday}</span>}
      </div>
      {solved > 0 && (
        <ProgressBar
          value={solved}
          max={subject.ids.length}
          label={`${subject.name} ${examName} 진행`}
          track="paper"
        />
      )}
      <ButtonLink href={cont.href} block>
        {cont.label}
      </ButtonLink>
    </section>
  );
}

/**
 * 맨 위에 보일 과목: ① 설정 탭에 시험 날짜를 넣은 과목 중 가장 가까운 시험(지난 날짜 제외)
 * ② 날짜가 없으면 가장 최근에 푼 과목 ③ 기록도 없으면 문제가 있는 첫 과목.
 */
export function pickHero(
  subjects: HomeSubject[],
  records: RecordsState,
  settings: AppSettings,
): HomeSubject | undefined {
  const candidates = subjects.filter((s) => s.ready && s.ids.length > 0);
  const dated = candidates
    .map((s) => ({ s, d: settings.examDates[s.id] ? daysUntil(settings.examDates[s.id]) : -1 }))
    .filter((x) => x.d >= 0)
    .sort((a, b) => a.d - b.d);
  if (dated.length) return dated[0].s;
  const lastAt = (s: HomeSubject) =>
    Object.values(records.subjects[s.id]?.progress ?? {}).reduce(
      (m, p) => (p.lastAt && p.lastAt > m ? p.lastAt : m),
      "",
    );
  const recent = candidates
    .map((s) => ({ s, at: lastAt(s) }))
    .filter((x) => x.at)
    .sort((a, b) => b.at.localeCompare(a.at));
  return recent[0]?.s ?? candidates[0];
}

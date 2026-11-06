"use client";

import { List, ListRow } from "@/components/ui/ListRow";
import { ProgressScopeToggle } from "@/components/ui/ProgressScopeToggle";
import { useAppSettings } from "@/lib/settings/appSettings";
import { useRecords } from "@/lib/storage/recordsStore";

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
 * 과목 탭(홈): 과목 행(이름 + 진행률)과 진행 범위 전환. 이어 풀기는 과목마다 과목 상세에 있다.
 * 기록·설정은 브라우저에만 있으므로 읽기 전(프리렌더)에는 진행률을 비워 둔다.
 */
export function HomeView({ subjects }: { subjects: HomeSubject[] }) {
  const records = useRecords();
  const { loaded, settings } = useAppSettings();
  const ready = records.loaded && loaded;
  const solvedIn = (s: HomeSubject, ids: readonly string[]) => {
    const rec = records.subjects[s.id];
    return rec ? ids.filter((id) => rec.progress[id]).length : 0;
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">과목</h1>

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

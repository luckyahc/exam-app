"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSelectedSubject } from "@/components/subject/SubjectTabs";
import { ButtonLink } from "@/components/ui/Button";
import { List, ListRow } from "@/components/ui/ListRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SelectInput } from "@/components/ui/SelectInput";
import { SUBJECTS } from "@/data/subjects/registry";
import type { ChapterMeta } from "@/lib/chapterMeta";
import { chapterStats, type StatLine, subjectStats, sumLines } from "@/lib/stats";
import { type RecordsState, useRecords } from "@/lib/storage/recordsStore";
import { getSubject } from "@/lib/subjects";

const pct = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const ratio = (a: number, b: number) => (b ? a / b : null);

/**
 * `/stats?subject=all|id`. 숫자는 위에 크게 몇 개만, 아래는 "약한 챕터 TOP 3 → 바로 풀기"처럼 다음 할 일로 잇는다.
 * 수치 계산은 lib/stats.ts 그대로(완전히 맞음 기준). 기록을 읽기 전에는 아무 수치도 보이지 않는다.
 */
export function StatsDashboard({ metas }: { metas: Record<string, ChapterMeta[]> }) {
  const selected = useSelectedSubject();
  const records = useRecords();
  if (!records.loaded) return <p className="text-sm text-muted">불러오는 중…</p>;

  const subjectIds = selected === "all" ? SUBJECTS.map((s) => s.id) : [selected];
  const lines = subjectIds.map((id) => ({
    id,
    line: subjectStats(records.subjects[id], metas[id] ?? []),
  }));
  const line = sumLines(lines.map((l) => l.line));
  const weak = weakChapters(records, subjectIds, metas);

  if (line.total === 0)
    return <p className="py-6 text-center text-sm text-muted">아직 문제가 없습니다.</p>;

  return (
    <div className="flex flex-col gap-8">
      {line.solved === 0 ? (
        <p className="py-2 text-sm text-muted">아직 안 풂</p>
      ) : (
        <Summary line={line} reviewHref={`/review?subject=${selected}`} />
      )}

      {weak.length > 0 && (
        <section aria-labelledby="weak-heading" className="flex flex-col gap-2">
          <h2 id="weak-heading" className="font-display text-lg font-bold">
            약한 챕터
          </h2>
          <List>
            {weak.map((w) => (
              <ListRow
                key={`${w.subjectId}/${w.meta.chapterId}`}
                href={
                  w.line.openWrong > 0
                    ? `/quiz?subject=${w.subjectId}&chapter=${w.meta.chapterId}&status=wrong&mode=instant`
                    : `/s/${w.subjectId}/chapter/${w.meta.chapterId}`
                }
                title={`${selected === "all" ? `${getSubject(w.subjectId)?.name} ` : ""}${w.meta.chapterId.toUpperCase()} ${w.meta.shortTitle}`}
                description={
                  w.line.openWrong > 0 ? `틀린 문제 ${w.line.openWrong}개 풀기` : undefined
                }
                trailing={pct(w.line.rate)}
              />
            ))}
          </List>
        </section>
      )}

      {selected === "all" ? (
        <SubjectList lines={lines} />
      ) : (
        <SubjectDetail
          key={selected}
          subjectId={selected}
          chapters={metas[selected] ?? []}
          records={records}
        />
      )}
    </div>
  );
}

/** 약한 챕터: 푼 기록이 있고 다 맞히지는 않은 챕터를 정답률 낮은 순(같으면 남은 오답 많은 순)으로 3개 */
function weakChapters(
  records: RecordsState,
  subjectIds: readonly string[],
  metas: Record<string, ChapterMeta[]>,
) {
  return subjectIds
    .flatMap((subjectId) =>
      (metas[subjectId] ?? []).map((meta) => ({
        subjectId,
        meta,
        line: chapterStats(records.subjects[subjectId], meta).line,
      })),
    )
    .filter(
      (c) =>
        c.line.attempts > 0 && c.line.rate !== null && (c.line.rate < 1 || c.line.openWrong > 0),
    )
    .sort((a, b) => a.line.rate! - b.line.rate! || b.line.openWrong - a.line.openWrong)
    .slice(0, 3);
}

/** 큰 숫자 2~3개 + 남은 오답이 있으면 복습으로 가는 한 줄. 시험 포인트는 마지막 풀이가 완전히 맞은 비율(lib/stats.ts) */
function Summary({ line, reviewHref }: { line: StatLine; reviewHref: string }) {
  const items = [
    {
      label: "진행",
      value: pct(ratio(line.solved, line.total)),
      sub: `${line.solved}/${line.total}`,
    },
    { label: "정답률", value: pct(line.rate), sub: `${line.correct}/${line.attempts}회` },
    ...(line.star > 0
      ? [
          {
            label: "시험 포인트",
            value: pct(ratio(line.starDone, line.star)),
            sub: `${line.starDone}/${line.star}`,
          },
        ]
      : []),
  ];
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col">
            <dt className="text-sm text-muted">{it.label}</dt>
            <dd className="font-mono text-3xl font-bold tabular-nums">{it.value}</dd>
            <dd className="font-mono text-xs text-muted tabular-nums">{it.sub}</dd>
          </div>
        ))}
      </dl>
      {line.openWrong > 0 && (
        <ButtonLink href={reviewHref} variant="text" className="self-start">
          남은 오답 {line.openWrong}개 →
        </ButtonLink>
      )}
    </div>
  );
}

function SubjectList({ lines }: { lines: { id: string; line: StatLine }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <section aria-labelledby="subjects-heading" className="flex flex-col gap-2">
      <h2 id="subjects-heading" className="font-display text-lg font-bold">
        과목별
      </h2>
      <List>
        {lines.map(({ id, line }) => (
          <ListRow
            key={id}
            title={getSubject(id)?.name}
            trailing={
              line.total === 0
                ? "준비 중"
                : line.solved === 0
                  ? "아직 안 풂"
                  : pct(ratio(line.solved, line.total))
            }
            onClick={
              line.total
                ? () => router.replace(`${pathname}?subject=${id}`, { scroll: false })
                : undefined
            }
            disabled={line.total === 0}
          />
        ))}
      </List>
    </section>
  );
}

function SubjectDetail({
  subjectId,
  chapters,
  records,
}: {
  subjectId: string;
  chapters: ChapterMeta[];
  records: RecordsState;
}) {
  const rec = records.subjects[subjectId];
  const ready = chapters.filter((c) => c.ids.length > 0);
  const [topicChapter, setTopicChapter] = useState(ready[0]?.chapterId ?? "");
  const picked = ready.find((c) => c.chapterId === topicChapter) ?? ready[0];
  const topics = picked ? chapterStats(rec, picked).topics : [];

  return (
    <>
      <section aria-labelledby="chapters-heading" className="flex flex-col gap-2">
        <h2 id="chapters-heading" className="font-display text-lg font-bold">
          챕터별
        </h2>
        <List>
          {ready.map((c) => {
            const l = chapterStats(rec, c).line;
            return (
              <ListRow
                key={c.chapterId}
                href={`/s/${subjectId}/chapter/${c.chapterId}`}
                title={`${c.chapterId.toUpperCase()} ${c.shortTitle}`}
                description={l.solved > 0 ? `정답률 ${pct(l.rate)}` : "아직 안 풂"}
                trailing={`${l.solved}/${l.total}`}
              />
            );
          })}
        </List>
      </section>

      {picked && (
        <section aria-labelledby="topics-heading" className="flex flex-col gap-3">
          <h2 id="topics-heading" className="font-display text-lg font-bold">
            토픽별
          </h2>
          <SelectInput
            label="챕터"
            hideLabel
            placeholder={null}
            value={picked.chapterId}
            onChange={(e) => setTopicChapter(e.target.value)}
            options={ready.map((c) => ({
              value: c.chapterId,
              label: `${c.chapterId.toUpperCase()} ${c.shortTitle}`,
            }))}
          />
          <ul className="flex flex-col gap-3">
            {topics.map((t) => (
              <li key={t.topic} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0">{t.topic}</span>
                  <span className="shrink-0 font-mono text-muted tabular-nums">
                    {t.solved > 0 ? `${pct(t.rate)} · ` : ""}
                    {t.solved}/{t.total}
                  </span>
                </div>
                <ProgressBar value={t.solved} max={t.total} label={`${t.topic} 진행`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

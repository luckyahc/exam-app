"use client";

import Link from "next/link";
import { useSelectedSubject } from "@/components/subject/SubjectTabs";
import { SUBJECTS } from "@/data/subjects/registry";
import type { ChapterMeta } from "@/lib/chapterMeta";
import { chapterStats, generatedAttempts, type StatLine, subjectStats, sumLines } from "@/lib/stats";
import { type RecordsState, useRecords } from "@/lib/storage/recordsStore";
import { getSubject, subjectStyle } from "@/lib/subjects";

const pct = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const ratio = (a: number, b: number) => (b ? a / b : null);

/**
 * `/stats?subject=all|id` 대시보드. 과목 → 챕터 → 토픽 단계로 진행률·정답률·⭐ 달성도를 보여 준다.
 * 수치 계산은 lib/stats.ts(완전히 맞음 기준). 기록을 읽기 전에는 "—"를 보여 준다.
 */
export function StatsDashboard({ metas }: { metas: Record<string, ChapterMeta[]> }) {
  const selected = useSelectedSubject();
  const records = useRecords();
  if (!records.loaded) return <p className="text-sm text-muted">기록을 불러오는 중…</p>;

  if (selected !== "all") return <SubjectDetail subjectId={selected} chapters={metas[selected] ?? []} records={records} />;

  const lines = SUBJECTS.map((s) => ({ s, line: subjectStats(records.subjects[s.id], metas[s.id] ?? []) }));
  return (
    <div className="flex flex-col gap-5">
      <Summary line={sumLines(lines.map((l) => l.line))} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {lines.map(({ s, line }) => (
          <li key={s.id} data-subject={s.id} style={subjectStyle(s)} className="flex flex-col gap-2 rounded-lg border border-border border-l-4 border-l-subject bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{s.name}</h2>
              <Link href={`/stats?subject=${s.id}`} className="text-sm text-primary hover:underline">
                자세히 →
              </Link>
            </div>
            {line.total === 0 ? <p className="text-sm text-muted">준비 중 — 아직 문제가 없습니다.</p> : <LineText line={line} />}
            {line.total > 0 && <Bar value={line.solved} max={line.total} label={`${s.name} 진행률`} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubjectDetail({ subjectId, chapters, records }: { subjectId: string; chapters: ChapterMeta[]; records: RecordsState }) {
  const subject = getSubject(subjectId)!;
  const rec = records.subjects[subjectId];
  const line = subjectStats(rec, chapters);
  const gen = generatedAttempts(rec, new Set(chapters.flatMap((c) => c.ids)));

  if (line.total === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        {subject.name}: 준비 중 — 아직 문제가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5" data-subject={subjectId} style={subjectStyle(subject)}>
      <Summary line={line} />
      {gen.attempts > 0 && (
        <p className="text-xs text-muted">
          &ldquo;비슷한 문제 새로 생성&rdquo;으로 푼 문제 {gen.attempts}회(완전히 맞음 {gen.correct}회)는 위 수치와 따로 셉니다.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {chapters.map((c) => {
          const { line: cl, topics } = chapterStats(rec, c);
          return (
            <li key={c.chapterId} className="rounded-lg border border-border border-l-4 border-l-subject bg-surface">
              <details className="group">
                <summary className="flex cursor-pointer flex-col gap-2 p-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-semibold">
                      <span aria-hidden className="mr-1 inline-block text-muted transition-transform group-open:rotate-90">▸</span>
                      {c.title}
                    </span>
                    <Link href={`/s/${subjectId}/chapter/${c.chapterId}`} className="text-xs text-primary hover:underline">
                      풀러 가기
                    </Link>
                  </span>
                  <LineText line={cl} />
                  <Bar value={cl.solved} max={cl.total} label={`${c.shortTitle} 진행률`} />
                </summary>
                <div className="overflow-x-auto border-t border-border px-3 pb-3">
                  <table className="w-full min-w-[20rem] text-sm">
                    <thead className="text-left text-xs text-muted">
                      <tr>
                        <th className="py-2 pr-2 font-medium">토픽</th>
                        <th className="py-2 pr-2 text-right font-medium">진행</th>
                        <th className="py-2 pr-2 text-right font-medium">정답률</th>
                        <th className="py-2 text-right font-medium">⭐</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topics.map((t) => (
                        <tr key={t.topic} className="border-t border-border">
                          <td className="py-1.5 pr-2">{t.topic}</td>
                          <td className="py-1.5 pr-2 text-right tabular-nums">
                            {t.solved}/{t.total}
                          </td>
                          <td className="py-1.5 pr-2 text-right tabular-nums">{pct(t.rate)}</td>
                          <td className="py-1.5 text-right tabular-nums">{t.star ? `${t.starDone}/${t.star}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 상단 요약 카드 4개 */
function Summary({ line }: { line: StatLine }) {
  const cards = [
    { label: "진행률", value: pct(ratio(line.solved, line.total)), sub: `${line.solved}/${line.total}문제` },
    { label: "정답률", value: pct(line.rate), sub: `완전히 맞음 ${line.correct}/${line.attempts}회` },
    { label: "⭐ 달성도", value: pct(ratio(line.starDone, line.star)), sub: `${line.starDone}/${line.star}문제` },
    { label: "남은 오답", value: String(line.openWrong), sub: "아직 못 맞힌 문제" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-muted">{c.label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{c.value}</dd>
            <dd className="text-xs text-muted">{c.sub}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted">
        정답률·⭐ 달성도는 완전히 맞힌 경우만 셉니다(부분 점수 제외). ⭐ 달성도 = ⭐ 문제 중 마지막 풀이가 완전히 맞은 문제의 비율.
      </p>
    </div>
  );
}

function LineText({ line }: { line: StatLine }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
      <span>
        진행 <b>{pct(ratio(line.solved, line.total))}</b> <span className="text-muted">({line.solved}/{line.total})</span>
      </span>
      <span>
        정답률 <b>{pct(line.rate)}</b>
      </span>
      {line.star > 0 && (
        <span>
          ⭐ <b>{line.starDone}/{line.star}</b>
        </span>
      )}
    </span>
  );
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="block h-1.5 overflow-hidden rounded-full bg-border">
      <span className="block h-full bg-subject" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </span>
  );
}

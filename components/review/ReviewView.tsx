"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookmarkButton } from "@/components/quiz/BookmarkButton";
import { useSelectedSubject } from "@/components/subject/SubjectTabs";
import { RichText } from "@/components/qtypes/ui";
import { SUBJECTS } from "@/data/subjects/registry";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import type { GeneratorMap } from "@/lib/sim/_shared/types";
import { newSession, saveSession } from "@/lib/quiz/session";
import { useRecords } from "@/lib/storage/recordsStore";
import { getSubject, subjectStyle } from "@/lib/subjects";

type Tab = "wrong" | "bookmarks";

/**
 * 오답노트·북마크. 과목 탭(?subject=all|id) + 챕터 필터, 항목별/목록 전체 다시 풀기.
 * `전체` 탭은 과목별로 묶고 과목 뱃지를 붙인다. 항목마다 틀린 횟수 / 시도 횟수를 보여 준다.
 */
export function ReviewView() {
  const selected = useSelectedSubject();
  const router = useRouter();
  const records = useRecords();
  const [tab, setTab] = useState<Tab>("wrong");
  const [chapter, setChapter] = useState<string>("all");
  const [showResolved, setShowResolved] = useState(false);
  const [pool, setPool] = useState<Map<string, Question> | null>(null);
  const [generators, setGenerators] = useState<Record<string, GeneratorMap>>({});

  const subjects = selected === "all" ? SUBJECTS.map((s) => s.id) : [selected];
  const subjectsKey = subjects.join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = subjectsKey.split(",");
    Promise.all([
      Promise.all(ids.map(loadSubject)),
      Promise.all(ids.map(async (id) => [id, (await getSubject(id)?.loadGenerators?.()) ?? {}] as const)),
    ]).then(([lists, gens]) => {
      if (cancelled) return;
      setPool(new Map(lists.flat().map((q) => [q.id, q])));
      setGenerators(Object.fromEntries(gens));
    });
    return () => {
      cancelled = true;
    };
  }, [subjectsKey]);

  if (!records.loaded || !pool) return <p className="text-sm text-muted">목록을 불러오는 중…</p>;

  // 과목별 항목(id 목록) — 문제 데이터에 없는 id(삭제된 문제)는 건너뛴다
  const groups = subjects.map((sid) => {
    const rec = records.subjects[sid];
    const ids =
      tab === "wrong"
        ? Object.entries(rec?.wrong ?? {})
            .filter(([, w]) => showResolved || !w.resolved)
            .sort((a, b) => (b[1].lastWrongAt ?? "").localeCompare(a[1].lastWrongAt ?? ""))
            .map(([id]) => id)
        : [...(rec?.bookmarks ?? [])].reverse();
    // 문제 데이터에 없는 생성기 문제(비슷한 문제 새로 생성 등)는 오답 기록의 생성기 정보로 다시 만든다
    const regen = (id: string) => {
      const gen = rec?.wrong[id]?.gen;
      return gen ? generators[sid]?.[gen.name]?.generate(gen.seed, gen.params) : undefined;
    };
    const items = ids
      .map((id) => pool.get(id) ?? regen(id))
      .filter((q): q is Question => !!q && (chapter === "all" || q.chapter === chapter));
    return { sid, items };
  });
  const all = groups.flatMap((g) => g.items);
  const chapters = selected === "all" ? [] : (getSubject(selected)?.chapters ?? []);

  const retry = (qs: Question[], label: string) => {
    if (!qs.length) return;
    const s = newSession(qs, { mode: "instant", label, backHref: `/review?subject=${selected}` });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  const chip = (on: boolean) =>
    "rounded-full border px-3 py-1 text-sm " + (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground");

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="목록" className="flex gap-2">
        {(["wrong", "bookmarks"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={chip(tab === t)}>
            {t === "wrong" ? "오답노트" : "★ 북마크"}
          </button>
        ))}
      </div>

      {chapters.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="챕터 필터">
          <button type="button" aria-pressed={chapter === "all"} onClick={() => setChapter("all")} className={chip(chapter === "all")}>
            전체 챕터
          </button>
          {chapters.map((c) => (
            <button key={c.id} type="button" aria-pressed={chapter === c.id} onClick={() => setChapter(c.id)} className={chip(chapter === c.id)}>
              {c.id.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {all.length}문제{tab === "wrong" && !showResolved && " (아직 못 맞힌 문제)"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {tab === "wrong" && (
            <label className="flex items-center gap-1.5 text-sm text-muted">
              <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
              해결한 문제도 보기
            </label>
          )}
          <button
            type="button"
            disabled={!all.length}
            onClick={() => retry(all, tab === "wrong" ? "오답노트 다시 풀기" : "북마크 다시 풀기")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-40"
          >
            목록 전체 다시 풀기
          </button>
        </div>
      </div>

      {all.length === 0 && (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          {tab === "wrong" ? "오답노트가 비어 있습니다. 문제를 풀다 틀리면 여기에 쌓입니다." : "북마크한 문제가 없습니다. 문제 화면의 ☆ 북마크 버튼으로 추가하세요."}
        </p>
      )}

      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => {
          const subject = getSubject(g.sid)!;
          return (
            <section key={g.sid} className="flex flex-col gap-2" data-subject={g.sid} style={subjectStyle(subject)}>
              {selected === "all" && (
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden className="inline-block size-2.5 rounded-full bg-subject" />
                  {subject.name} ({g.items.length})
                </h2>
              )}
              <ul className="flex flex-col gap-2">
                {g.items.map((q) => {
                  const w = records.subjects[g.sid]?.wrong[q.id];
                  return (
                    <li key={q.id} className="flex flex-col gap-2 rounded-lg border border-border border-l-4 border-l-subject bg-surface p-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        {selected === "all" && <span className="rounded-full border border-border px-2 py-0.5">{subject.shortName}</span>}
                        <span className="font-semibold text-foreground">{q.chapter.toUpperCase()}</span>
                        <span>{coreFor(q).label}</span>
                        {q.exam && <span>⭐ 시험 포인트</span>}
                        <span>{q.topic}</span>
                        {w && (
                          <span>
                            틀린 횟수 {w.wrongCount} / 시도 {w.attempts}
                            {w.resolved && " · ✓ 해결"}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-3 text-sm">
                        <RichText text={q.prompt} />
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => retry([q], "다시 풀기")} className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:border-primary">
                          이 문제 다시 풀기
                        </button>
                        <BookmarkButton subjectId={g.sid} questionId={q.id} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubjectTabs, useSelectedSubject } from "@/components/subject/SubjectTabs";
import { RichText } from "@/components/qtypes/ui";
import { BookmarkIcon } from "@/components/quiz/BookmarkIcon";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { List } from "@/components/ui/ListRow";
import { Marker } from "@/components/ui/Marker";
import { SegmentedControl, segmentPanelProps } from "@/components/ui/SegmentedControl";
import { SUBJECTS } from "@/data/subjects/registry";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import type { GeneratorMap } from "@/lib/sim/_shared/types";
import { newSession, saveSession } from "@/lib/quiz/session";
import { useRecords } from "@/lib/storage/recordsStore";
import { getSubject } from "@/lib/subjects";

type Tab = "wrong" | "bookmarks";

const TABS = [
  { value: "wrong", label: "틀린 문제" },
  { value: "bookmarks", label: "북마크" },
] as const;

/**
 * 복습 탭: 틀린 문제(오답노트) | 북마크. 과목 필터(?subject=all|id) + 챕터 필터, 항목별/목록 전체 다시 풀기.
 * 목록 만들기(미해결 오답 최신순·북마크 최신순·생성 문제 재생성·삭제된 문제 건너뛰기)는 이전과 같다.
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
      Promise.all(ids.map((id) => loadSubject(id))),
      Promise.all(
        ids.map(async (id) => [id, (await getSubject(id)?.loadGenerators?.()) ?? {}] as const),
      ),
    ]).then(([lists, gens]) => {
      if (cancelled) return;
      setPool(new Map(lists.flat().map((q) => [q.id, q])));
      setGenerators(Object.fromEntries(gens));
    });
    return () => {
      cancelled = true;
    };
  }, [subjectsKey]);

  // 과목을 바꾸면 그 과목에 없는 챕터 필터는 풀어 준다
  const chapters = selected === "all" ? [] : (getSubject(selected)?.chapters ?? []);
  const chapterFilter = chapters.some((c) => c.id === chapter) ? chapter : "all";

  const header = (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="복습 목록"
        idPrefix="review"
        items={TABS}
        value={tab}
        onChange={setTab}
      />
      <SubjectTabs />
    </div>
  );

  if (!records.loaded || !pool)
    return (
      <>
        {header}
        <p className="text-sm text-muted">불러오는 중…</p>
      </>
    );

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
      .filter(
        (q): q is Question => !!q && (chapterFilter === "all" || q.chapter === chapterFilter),
      );
    return { sid, items };
  });
  const all = groups.flatMap((g) => g.items);

  const retry = (qs: Question[], label: string) => {
    if (!qs.length) return;
    const s = newSession(qs, { mode: "instant", label, backHref: `/review?subject=${selected}` });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  return (
    <>
      {header}
      <div {...segmentPanelProps("review", tab)} className="flex flex-col gap-5">
        {(chapters.length > 0 || tab === "wrong") && (
          <div role="group" aria-label="목록 조건" className="flex flex-wrap gap-2">
            {chapters.length > 0 && (
              <>
                <Chip selected={chapterFilter === "all"} onClick={() => setChapter("all")}>
                  전체 챕터
                </Chip>
                {chapters.map((c) => (
                  <Chip
                    key={c.id}
                    selected={chapterFilter === c.id}
                    onClick={() => setChapter(c.id)}
                  >
                    {c.id.toUpperCase()}
                  </Chip>
                ))}
              </>
            )}
            {tab === "wrong" && (
              <Chip selected={showResolved} onClick={() => setShowResolved((v) => !v)}>
                해결한 문제 포함
              </Chip>
            )}
          </div>
        )}

        {all.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            {tab === "wrong" ? "틀린 문제가 없습니다." : "북마크한 문제가 없습니다."}
          </p>
        ) : (
          <Button
            block
            onClick={() => retry(all, tab === "wrong" ? "틀린 문제 다시 풀기" : "북마크 다시 풀기")}
          >
            {all.length}문제 다시 풀기
          </Button>
        )}

        {groups
          .filter((g) => g.items.length > 0)
          .map((g) => {
            const subject = getSubject(g.sid)!;
            return (
              <section key={g.sid} aria-label={subject.name} className="flex flex-col gap-2">
                {selected === "all" && (
                  <h2 className="text-sm font-semibold">
                    {subject.name}{" "}
                    <span className="font-mono font-normal text-muted">{g.items.length}</span>
                  </h2>
                )}
                <List>
                  {g.items.map((q) => {
                    const w = records.subjects[g.sid]?.wrong[q.id];
                    return (
                      <li key={q.id} className="flex flex-col gap-1.5 py-3 pl-3">
                        <p className="line-clamp-2 pr-3 text-base">
                          <RichText text={q.prompt} />
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm text-muted">
                            <span className="font-mono">{q.chapter.toUpperCase()}</span>{" "}
                            {coreFor(q).label}
                            {tab === "wrong" &&
                              w &&
                              w.wrongCount > 1 &&
                              ` · ${w.wrongCount}번 틀림`}
                            {w?.resolved && tab === "wrong" && " · 해결"}
                            {q.exam && (
                              <>
                                {" "}
                                <Marker className="text-xs">시험 포인트</Marker>
                              </>
                            )}
                          </p>
                          <BookmarkIcon subjectId={g.sid} questionId={q.id} />
                          <Button
                            variant="text"
                            className="px-3"
                            onClick={() => retry([q], "다시 풀기")}
                          >
                            다시 풀기
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </List>
              </section>
            );
          })}
      </div>
    </>
  );
}

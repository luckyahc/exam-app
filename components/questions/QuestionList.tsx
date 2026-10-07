"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionRenderer } from "@/components/qtypes/QuestionRenderer";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import { LIST_TABS, type ListFilter, type ListTab, listRows, promptPreview, revealAnswer, sessionFromList, TAB_LABEL, tabCounts, visibleRows } from "@/lib/quiz/questionList";
import { newSession, saveSession } from "@/lib/quiz/session";
import { hasStarChoice, STAR_LABEL, type StarBasis } from "@/lib/quiz/starBasis";
import { useRecords } from "@/lib/storage/recordsStore";

const PAGE = 100; // 한 번에 그리는 줄 수(과목당 수백 문항 — "더 보기"로 늘린다)
const COUNTS = [10, 20, 30, 0] as const;

const MARK = {
  correct: { icon: "✓", text: "맞음", cls: "text-correct" },
  wrong: { icon: "✗", text: "틀림", cls: "text-incorrect" },
  unsolved: { icon: "–", text: "미풀이", cls: "text-muted" },
} as const;

/** 과목별 문제 목록: 풀이 상태 탭 + 필터, 줄을 누르면 바로 풀기 / 정답·해설 보기(기록 안 함), 이 목록으로 풀기 */
/** 서버 페이지에서 넘기는 과목 정보(함수 없는 평범한 값) */
export interface ListSubject {
  id: string;
  name: string;
  shortName: string;
  examPoints?: false;
  chapters: { id: string; shortTitle: string }[];
}

export function QuestionList({ subject }: { subject: ListSubject }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const records = useRecords().subjects[subject.id];
  const [tab, setTab] = useState<ListTab>("all");
  const [filter, setFilter] = useState<ListFilter>({});
  const [open, setOpen] = useState<{ id: string; reveal: boolean } | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [shuffle, setShuffle] = useState(true);
  const [count, setCount] = useState<number>(20);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    loadSubject(subject.id).then((qs) => alive && setQuestions(qs));
    return () => {
      alive = false;
    };
  }, [subject.id]);

  const rows = useMemo(() => listRows(questions ?? [], records), [questions, records]);
  const counts = useMemo(() => tabCounts(rows, filter), [rows, filter]);
  const visible = useMemo(() => visibleRows(rows, tab, filter), [rows, tab, filter]);
  const types = useMemo(() => [...new Set((questions ?? []).map((q) => q.type))], [questions]);
  const topics = useMemo(
    () => [...new Set((questions ?? []).filter((q) => !filter.chapter || q.chapter === filter.chapter).map((q) => q.topic))],
    [questions, filter.chapter],
  );
  const stars = subject.examPoints !== false && (questions ?? []).some((q) => q.exam);
  const starChoice = useMemo(() => hasStarChoice(questions ?? []), [questions]);

  const start = (picked: { shuffle: boolean; count: number | null; label: string; list: typeof visible }) => {
    const s = sessionFromList(picked.list, {
      shuffle: picked.shuffle,
      count: picked.count,
      label: picked.label,
      backHref: `/s/${subject.id}/questions`,
      seed: `${subject.id}-${Date.now()}`,
    });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };
  const solveOne = (q: Question) => {
    const s = newSession([q], { mode: "instant", label: `${subject.shortName} · 문제 목록`, backHref: `/s/${subject.id}/questions` });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  // 탭: ←/→로 이동(WAI-ARIA tabs)
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : LIST_TABS.length - 1)) % LIST_TABS.length;
    setTab(LIST_TABS[next]);
    setLimit(PAGE);
    tabRefs.current[next]?.focus();
  };

  const sel = "min-w-0 rounded-lg border border-border bg-background px-2 py-1.5 text-sm";
  const chip = (on: boolean) =>
    "rounded-full border px-3 py-1.5 text-sm " + (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground");

  if (!questions) return <p className="text-sm text-muted">문제를 불러오는 중…</p>;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div role="tablist" aria-label="풀이 상태" className="flex flex-wrap gap-2">
        {LIST_TABS.map((t, i) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls="question-list"
            tabIndex={tab === t ? 0 : -1}
            onKeyDown={(e) => onTabKey(e, i)}
            onClick={() => {
              setTab(t);
              setLimit(PAGE);
            }}
            className={chip(tab === t)}
          >
            {TAB_LABEL[t]} <span className="tabular-nums">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          챕터
          <select className={sel} value={filter.chapter ?? ""} onChange={(e) => setFilter({ ...filter, chapter: e.target.value || null, topic: null })}>
            <option value="">전체</option>
            {subject.chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id.toUpperCase()} {c.shortTitle}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          유형
          <select className={sel} value={filter.type ?? ""} onChange={(e) => setFilter({ ...filter, type: e.target.value || null })}>
            <option value="">전체</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {coreFor({ type: t } as Question).label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          토픽
          <select className={sel} value={filter.topic ?? ""} onChange={(e) => setFilter({ ...filter, topic: e.target.value || null })}>
            <option value="">전체</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {stars && !starChoice && (
          <label className="flex items-center gap-2 self-end py-1.5 text-sm">
            <input type="checkbox" checked={!!filter.star} onChange={(e) => setFilter({ ...filter, star: e.target.checked ? "all" : null })} />
            <span aria-hidden>⭐</span> 시험 포인트만
          </label>
        )}
        {/* ⭐ 근거가 둘인 과목(OS: 교수님 필기·시험 힌트)만 근거별로 고른다 */}
        {stars && starChoice && (
          <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
            ⭐ 시험 포인트
            <select className={sel} value={filter.star ?? ""} onChange={(e) => setFilter({ ...filter, star: (e.target.value || null) as StarBasis | null })}>
              <option value="">전체 문제</option>
              {(["all", "handwritten", "hint"] as const).map((b) => (
                <option key={b} value={b}>
                  {STAR_LABEL[b]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-3 text-sm">
        <button
          type="button"
          disabled={visible.length === 0}
          onClick={() => start({ shuffle, count: count || null, label: `${subject.shortName} · ${TAB_LABEL[tab]}`, list: visible })}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-background disabled:opacity-40"
        >
          이 목록으로 풀기 ({count ? Math.min(count, visible.length) : visible.length})
        </button>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} /> 섞기
        </label>
        <label className="flex items-center gap-1">
          문제 수
          <select className={sel} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {COUNTS.map((n) => (
              <option key={n} value={n}>
                {n ? `${n}문제` : "전체"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul id="question-list" role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex min-w-0 flex-col gap-2">
        {visible.length === 0 && <li className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">이 조건에 맞는 문제가 없습니다.</li>}
        {visible.slice(0, limit).map((r) => {
          const m = MARK[r.status];
          const isOpen = open?.id === r.q.id;
          return (
            <li key={r.q.id} className="min-w-0 rounded-lg border border-border bg-surface">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : { id: r.q.id, reveal: false })}
                className="flex w-full min-w-0 flex-col gap-1 px-3 py-2 text-left hover:bg-primary/5"
              >
                <span className="min-w-0 text-sm break-words">{promptPreview(r.q)}</span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                  <span>{r.q.chapter.toUpperCase()}</span>
                  <span>{coreFor(r.q).label}</span>
                  {r.q.exam && <span aria-label="시험 포인트">⭐</span>}
                  <span className={m.cls}>
                    <span aria-hidden>{m.icon}</span> {m.text}
                  </span>
                  <span>시도 {r.attempts}회</span>
                  {r.bookmarked && <span>☆ 북마크</span>}
                </span>
              </button>
              {isOpen && (
                <div className="flex min-w-0 flex-col gap-3 border-t border-border p-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => solveOne(r.q)} className="rounded-lg border border-primary px-3 py-1.5 text-sm font-semibold text-primary">
                      바로 풀기
                    </button>
                    <button
                      type="button"
                      aria-pressed={open.reveal}
                      onClick={() => setOpen({ id: r.q.id, reveal: !open.reveal })}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm"
                    >
                      {open.reveal ? "정답·해설 닫기" : "정답·해설 보기"}
                    </button>
                  </div>
                  {open.reveal && <RevealPanel q={r.q} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {visible.length > limit && (
        <button type="button" onClick={() => setLimit(limit + PAGE)} className="self-center rounded-lg border border-border px-4 py-2 text-sm">
          더 보기 ({visible.length - limit}개 남음)
        </button>
      )}
      <p className="text-xs text-muted">
        &quot;정답·해설 보기&quot;는 풀이 기록에 넣지 않습니다. &quot;비슷한 문제&quot;로 새로 만든 문제는 이 목록에 나오지 않습니다(
        <Link href={`/review?subject=${subject.id}`} className="underline">
          오답노트
        </Link>
        에서 볼 수 있음).
      </p>
    </div>
  );
}

/** 정답 키로 채점한 화면만 보여 준다 — 기록하지 않는다 */
export function RevealPanel({ q }: { q: Question }) {
  const { answer, result } = revealAnswer(q);
  return (
    <div className="min-w-0">
      <QuestionRenderer question={q} answer={answer} onAnswer={() => {}} result={result} />
    </div>
  );
}

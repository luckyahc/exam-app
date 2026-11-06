"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PracticeQuestion } from "@/components/practice/PracticeQuestion";
import { OptionGroup } from "@/components/quiz/OptionGroup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { List, ListRow } from "@/components/ui/ListRow";
import { EXAM_MARK, Marker } from "@/components/ui/Marker";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import {
  LIST_TABS,
  type ListFilter,
  type ListTab,
  listRows,
  promptPreview,
  revealAnswer,
  sessionFromList,
  TAB_LABEL,
  tabCounts,
  visibleRows,
} from "@/lib/quiz/questionList";
import { newSession, saveSession } from "@/lib/quiz/session";
import {
  exampleBadge,
  isExample,
  isJokbo,
  isJokboRelated,
  isJokboRelated2,
  isShortAnswer,
  jokboBadge,
  relatedBadge,
  SOURCE_LABEL,
  type SourceFilter,
} from "@/lib/quiz/jokbo";
import { hasStarChoice, STAR_LABEL, type StarBasis } from "@/lib/quiz/starBasis";
import { useRecords } from "@/lib/storage/recordsStore";

const PAGE = 100; // 한 번에 그리는 줄 수(과목당 수백 문항 — "더 보기"로 늘린다)
const COUNTS = [10, 20, 30, 0] as const;

const MARK = {
  correct: { text: "맞음", cls: "text-sumi" },
  wrong: { text: "틀림", cls: "font-semibold text-shu" },
  unsolved: { text: "안 풂", cls: "text-muted" },
  submitted: { text: "제출함", cls: "text-sumi" },
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
  const [sheet, setSheet] = useState<null | "filter" | "solve">(null);

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
    () => [
      ...new Set(
        (questions ?? [])
          .filter((q) => !filter.chapter || q.chapter === filter.chapter)
          .map((q) => q.topic),
      ),
    ],
    [questions, filter.chapter],
  );
  const stars = subject.examPoints !== false && (questions ?? []).some((q) => q.exam);
  const starChoice = useMemo(() => hasStarChoice(questions ?? []), [questions]);
  const hasJokbo = useMemo(() => (questions ?? []).some(isJokbo), [questions]);
  const hasExample = useMemo(() => (questions ?? []).some(isExample), [questions]);
  const hasRelated = useMemo(() => (questions ?? []).some(isJokboRelated), [questions]);
  const hasRelated2 = useMemo(() => (questions ?? []).some(isJokboRelated2), [questions]);
  const hasShort = useMemo(() => (questions ?? []).some(isShortAnswer), [questions]);

  const start = (picked: {
    shuffle: boolean;
    count: number | null;
    label: string;
    list: typeof visible;
  }) => {
    const s = sessionFromList(picked.list, {
      shuffle: picked.shuffle,
      count: picked.count,
      label: picked.label,
      backHref: `/s/${subject.id}?view=questions`,
      seed: `${subject.id}-${Date.now()}`,
    });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };
  const solveOne = (q: Question) => {
    const s = newSession([q], {
      mode: "instant",
      label: `${subject.shortName} · 문제 목록`,
      backHref: `/s/${subject.id}?view=questions`,
    });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  if (!questions) return <p className="text-sm text-muted">불러오는 중…</p>;

  const sources: SourceFilter[] = [
    ...(hasJokbo ? (["jokbo", "general"] as const) : []),
    ...(hasRelated ? (["related"] as const) : []),
    ...(hasRelated2 ? (["related2"] as const) : []),
    ...(hasShort ? (["short"] as const) : []),
    ...(hasExample ? (["example"] as const) : []),
  ];
  const active = [
    filter.chapter,
    filter.type,
    filter.topic,
    filter.source && filter.source !== "all" ? filter.source : null,
    filter.star,
  ].filter(Boolean).length;
  // 한 번 더 누르면 풀린다(단일 선택 필터). 챕터를 바꾸면 토픽은 풀린다(이전과 같음)
  const pick = <K extends keyof ListFilter>(key: K, v: ListFilter[K]) => {
    setFilter({
      ...filter,
      [key]: filter[key] === v ? null : v,
      ...(key === "chapter" ? { topic: null } : {}),
    });
    setLimit(PAGE);
  };
  const willSolve = count ? Math.min(count, visible.length) : visible.length;
  const openRow = open ? visible.find((r) => r.q.id === open.id) : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div role="group" aria-label="풀이 상태" className="flex flex-wrap gap-2">
        {LIST_TABS.map((t) => (
          <Chip
            key={t}
            selected={tab === t}
            count={counts[t]}
            onClick={() => {
              setTab(t);
              setLimit(PAGE);
            }}
          >
            {TAB_LABEL[t]}
          </Chip>
        ))}
      </div>

      <List>
        <ListRow
          title="필터"
          description={active ? `${active}개 적용` : "없음"}
          onClick={() => setSheet("filter")}
        />
        <ListRow
          title="이 목록으로 풀기"
          description={`${willSolve}문제 · ${shuffle ? "섞어서" : "순서대로"}`}
          onClick={() => setSheet("solve")}
          disabled={visible.length === 0}
        />
      </List>

      <p className="text-sm text-muted" aria-live="polite">
        <span className="font-mono">{visible.length}</span>문제
      </p>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">조건에 맞는 문제가 없습니다.</p>
      ) : (
        <List aria-label="문제">
          {visible.slice(0, limit).map((r) => {
            const m = MARK[r.status];
            const badges = [jokboBadge(r.q), relatedBadge(r.q), exampleBadge(r.q)].filter(Boolean);
            const meta = [
              r.q.chapter.toUpperCase(),
              coreFor(r.q).label,
              ...badges,
              r.attempts ? `${r.attempts}회` : "",
              r.bookmarked ? "북마크" : "",
            ];
            return (
              <ListRow
                key={r.q.id}
                onClick={() => setOpen({ id: r.q.id, reveal: false })}
                title={<span className="font-normal break-words">{promptPreview(r.q)}</span>}
                description={
                  <>
                    {r.q.exam && <Marker className="mr-1">{EXAM_MARK}</Marker>}
                    {meta.filter(Boolean).join(" · ")}
                  </>
                }
                trailing={<span className={m.cls}>{m.text}</span>}
              />
            );
          })}
        </List>
      )}
      {visible.length > limit && (
        <Button variant="secondary" onClick={() => setLimit(limit + PAGE)}>
          더 보기 ({visible.length - limit})
        </Button>
      )}

      <BottomSheet open={sheet === "filter"} onClose={() => setSheet(null)} title="필터">
        <div className="flex flex-col gap-6 pt-1">
          <OptionGroup label="챕터">
            {subject.chapters.map((c) => (
              <Chip
                key={c.id}
                selected={filter.chapter === c.id}
                onClick={() => pick("chapter", c.id)}
              >
                {c.id.toUpperCase()}
              </Chip>
            ))}
          </OptionGroup>
          <OptionGroup label="유형">
            {types.map((t) => (
              <Chip key={t} selected={filter.type === t} onClick={() => pick("type", t)}>
                {coreFor({ type: t } as Question).label}
              </Chip>
            ))}
          </OptionGroup>
          {sources.length > 0 && (
            <OptionGroup label="분류">
              {sources.map((v) => (
                <Chip key={v} selected={filter.source === v} onClick={() => pick("source", v)}>
                  {SOURCE_LABEL[v]}
                </Chip>
              ))}
            </OptionGroup>
          )}
          {stars && (
            <OptionGroup label="시험 포인트">
              {(starChoice
                ? (["all", "handwritten", "hint"] as StarBasis[])
                : (["all"] as StarBasis[])
              ).map((b) => (
                <Chip key={b} selected={filter.star === b} onClick={() => pick("star", b)}>
                  {b === "all" ? "시험 포인트" : STAR_LABEL[b]}
                </Chip>
              ))}
            </OptionGroup>
          )}
          <details className="group flex flex-col gap-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <span>
                토픽{" "}
                {filter.topic && <span className="font-normal text-muted">{filter.topic}</span>}
              </span>
              <span aria-hidden className="text-muted group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="flex flex-wrap gap-2 pt-2">
              {topics.map((t) => (
                <Chip key={t} selected={filter.topic === t} onClick={() => pick("topic", t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </details>
          {active > 0 && (
            <Button variant="text" className="self-start" onClick={() => setFilter({})}>
              필터 모두 풀기
            </Button>
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheet === "solve"}
        onClose={() => setSheet(null)}
        title="이 목록으로 풀기"
        footer={
          <Button
            block
            disabled={visible.length === 0}
            onClick={() =>
              start({
                shuffle,
                count: count || null,
                label: `${subject.shortName} · ${TAB_LABEL[tab]}`,
                list: visible,
              })
            }
          >
            {willSolve}문제 풀기
          </Button>
        }
      >
        <div className="flex flex-col gap-6 pt-1">
          <OptionGroup label="문제 수">
            {COUNTS.map((n) => (
              <Chip key={n} selected={count === n} onClick={() => setCount(n)}>
                {n ? `${n}문제` : "전체"}
              </Chip>
            ))}
          </OptionGroup>
          <OptionGroup label="순서">
            <Chip selected={!shuffle} onClick={() => setShuffle(false)}>
              순서대로
            </Chip>
            <Chip selected={shuffle} onClick={() => setShuffle(true)}>
              섞어서
            </Chip>
          </OptionGroup>
        </div>
      </BottomSheet>

      <BottomSheet
        open={!!openRow}
        onClose={() => setOpen(null)}
        title={openRow ? `${openRow.q.chapter.toUpperCase()} · ${coreFor(openRow.q).label}` : ""}
      >
        {openRow && open && (
          <div className="flex flex-col gap-4 pt-1">
            {!open.reveal && (
              <p className="text-lg leading-relaxed break-words">{promptPreview(openRow.q)}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => solveOne(openRow.q)}>바로 풀기</Button>
              <Button
                variant="secondary"
                aria-pressed={open.reveal}
                onClick={() => setOpen({ id: openRow.q.id, reveal: !open.reveal })}
              >
                {open.reveal ? "정답 닫기" : "정답 보기"}
              </Button>
            </div>
            {open.reveal && <RevealPanel q={openRow.q} />}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

/** 정답 키로 채점한 화면만 보여 준다 — 기록하지 않는다(연습 모드 문제 화면과 같은 모양) */
export function RevealPanel({ q }: { q: Question }) {
  const { answer, result } = revealAnswer(q);
  return (
    <div className="min-w-0">
      <PracticeQuestion
        question={q}
        answer={answer}
        onAnswer={() => {}}
        result={result}
        onEnter={() => {}}
      />
    </div>
  );
}

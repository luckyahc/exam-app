"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OptionGroup, TimerChips } from "@/components/quiz/OptionGroup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { List, ListRow } from "@/components/ui/ListRow";
import type { ChapterMeta } from "@/lib/chapterMeta";
import type { Question } from "@/lib/qtypes/registry";
import { SOURCE_LABEL, type SourceFilter } from "@/lib/quiz/jokbo";
import { loadChapter } from "@/lib/quiz/loadQuestions";
import { filterFromParams } from "@/lib/quiz/params";
import { filterQuestions } from "@/lib/quiz/session";
import { STAR_LABEL, type StarBasis } from "@/lib/quiz/starBasis";
import {
  type StartPrefs,
  readPrefs,
  START_COUNTS,
  toParams,
  writePrefs,
} from "@/lib/quiz/startPrefs";
import { questionStatus, type QStatus } from "@/lib/quiz/status";
import { type AppSettings, applyQuizDefaults, useAppSettings } from "@/lib/settings/appSettings";
import { summarize } from "@/lib/storage/records";
import { type RecordsState, useRecords } from "@/lib/storage/recordsStore";

const DIFF_LABEL = { 1: "쉬움", 2: "보통", 3: "어려움" } as const;

/**
 * 챕터 화면: 진행·정답률, 빠른 시작 2×2(탭 한 번에 시작), "직접 고르기"(바텀시트), 하단 고정 주 버튼.
 * 문제 수는 모두 실제 문제 데이터에 /quiz와 같은 조건 함수(filterFromParams → filterQuestions)를 적용해 센다.
 * 기록·설정·문제 데이터는 브라우저에서만 읽으므로, 다 읽기 전에는 자리만 잡아 둔다.
 */
export function ChapterStart({ meta }: { meta: ChapterMeta }) {
  const records = useRecords();
  const { loaded, settings } = useAppSettings();
  const [pool, setPool] = useState<readonly Question[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadChapter(meta.subjectId, meta.chapterId).then((qs) => alive && setPool(qs));
    return () => {
      alive = false;
    };
  }, [meta.subjectId, meta.chapterId]);

  if (!records.loaded || !loaded || !pool)
    return (
      <>
        <div aria-hidden className="h-10" />
        <div aria-hidden className="grid h-44 grid-cols-2 gap-2" />
        <p className="text-sm text-muted">불러오는 중…</p>
      </>
    );
  return <Ready meta={meta} pool={pool} records={records} settings={settings} />;
}

function Ready({
  meta,
  pool,
  records,
  settings,
}: {
  meta: ChapterMeta;
  pool: readonly Question[];
  records: RecordsState;
  settings: AppSettings;
}) {
  const router = useRouter();
  const rec = records.subjects[meta.subjectId];
  const statusOf = (id: string) => questionStatus(rec, id);
  // 실제 필터 로직으로 센 "조건에 맞는 문제 수"(문제 수 제한·섞기 전)
  const matching = (p: URLSearchParams) =>
    filterQuestions(pool, {
      ...filterFromParams(p, statusOf).filter,
      count: null,
      shuffle: false,
      seed: "",
    }).length;

  const starChoice = meta.starHwIds.length > 0 && meta.starHintIds.length > 0;
  const sources: { value: SourceFilter; count: number }[] = [
    { value: "jokbo" as const, count: meta.jokboIds.length },
    ...(meta.jokboIds.length
      ? [{ value: "general" as const, count: meta.ids.length - meta.jokboIds.length }]
      : []),
    { value: "related" as const, count: meta.relatedIds.length },
    { value: "related2" as const, count: meta.related2Ids.length },
    { value: "short" as const, count: meta.shortIds.length },
    { value: "example" as const, count: meta.exampleIds.length },
  ].filter((s) => s.count > 0);

  // 마지막으로 쓴 조건(없으면 설정 탭 기본값). 이 챕터에 없는 유형·토픽·분류는 버린다
  const [prefs, setPrefs] = useState<StartPrefs>(() => {
    const p = readPrefs(meta.subjectId, meta.chapterId, settings);
    return {
      ...p,
      types: p.types.filter((t) => meta.types.some((x) => x.type === t)),
      topics: p.topics.filter((t) => meta.topics.some((x) => x.topic === t)),
      star: meta.starIds.length && (starChoice || p.star === "all") ? p.star : null,
      source: sources.some((s) => s.value === p.source) ? p.source : "all",
    };
  });
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<StartPrefs>) => setPrefs((p) => ({ ...p, ...patch }));
  const toggle = <K extends "types" | "topics" | "difficulties">(
    key: K,
    v: StartPrefs[K][number],
  ) =>
    setPrefs((p) => {
      const list = p[key] as (typeof v)[];
      return { ...p, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });

  const customParams = toParams(meta.subjectId, meta.chapterId, prefs);
  const available = matching(customParams);
  const willSolve = prefs.count ? Math.min(prefs.count, available) : available;
  const start = () => {
    writePrefs(meta.subjectId, meta.chapterId, prefs);
    router.push(`/quiz?${customParams.toString()}`);
  };

  // 빠른 시작: 기존 퀴즈 쿼리만(status=unsolved·wrong, star=1, shuffle=1). 연습 모드, 문제 수·순서는 설정 탭 값
  const preset = (label: string, extra: Record<string, string>, shuffle?: boolean) => {
    const p = new URLSearchParams({ subject: meta.subjectId, chapter: meta.chapterId, ...extra });
    const n = matching(p);
    applyQuizDefaults(p, settings);
    p.set("mode", "instant");
    if (shuffle) p.set("shuffle", "1");
    return { label, n, href: `/quiz?${p.toString()}` };
  };
  const presets = [
    preset("안 푼 문제", { status: "unsolved" }),
    preset("틀린 문제", { status: "wrong" }),
    // 시험 포인트를 쓰지 않는 과목은 해당 문제가 0개라 자연히 흐리게 보인다
    preset("시험 포인트", { star: "1" }),
    preset("랜덤 전체", {}, true),
  ];

  const sum = rec ? summarize(rec, meta.ids) : null;
  const solved = rec ? meta.ids.filter((id) => rec.progress[id]).length : 0;
  const summary = [
    prefs.count ? `${prefs.count}문제` : "전체",
    prefs.shuffle ? "섞어서" : "순서대로",
    prefs.mode === "exam" ? "시험 모드" : "연습 모드",
  ].join(" · ");
  const filters =
    prefs.types.length +
    prefs.difficulties.length +
    prefs.topics.length +
    (prefs.status !== "all" ? 1 : 0) +
    (prefs.star ? 1 : 0) +
    (prefs.source !== "all" ? 1 : 0);

  return (
    <>
      {solved > 0 ? (
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-3xl font-bold tabular-nums">
            {solved}
            <span className="text-lg font-normal text-muted">/{meta.ids.length}</span>
          </span>
          {sum?.rate != null && (
            <span className="text-sm text-muted">정답률 {Math.round(sum.rate * 100)}%</span>
          )}
        </p>
      ) : (
        <p className="text-base">
          아직 안 풂 <span className="text-muted">· {meta.ids.length}문제</span>
        </p>
      )}

      <section aria-label="빠른 시작" className="grid grid-cols-2 gap-2">
        {presets.map((p) =>
          p.n > 0 ? (
            <ButtonLink
              key={p.label}
              href={p.href}
              variant="secondary"
              className="h-20 flex-col items-start justify-center gap-0.5 px-4"
            >
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="font-mono text-2xl font-bold tabular-nums">{p.n}</span>
            </ButtonLink>
          ) : (
            <Button
              key={p.label}
              variant="secondary"
              disabled
              className="h-20 flex-col items-start justify-center gap-0.5 px-4"
            >
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="font-mono text-2xl font-bold tabular-nums">0</span>
            </Button>
          ),
        )}
      </section>

      <List>
        <ListRow
          title="직접 고르기"
          description={filters ? `${summary} · 조건 ${filters}개` : summary}
          onClick={() => setOpen(true)}
        />
      </List>

      {/* 하단 고정 주 버튼(탭바 바로 위). 같은 높이의 빈 칸으로 마지막 내용이 가려지지 않게 한다 */}
      <div aria-hidden className="h-20" />
      <div className="fixed inset-x-0 bottom-(--tabbar-h) z-30 bg-paper px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <Button block onClick={start} disabled={willSolve === 0}>
            {willSolve === 0 ? "조건에 맞는 문제 없음" : `${willSolve}문제 풀기`}
          </Button>
        </div>
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="직접 고르기"
        footer={
          <Button block onClick={start} disabled={available === 0}>
            조건에 맞는 문제 {available}개 · 풀기
          </Button>
        }
      >
        <div className="flex flex-col gap-6 pt-1">
          <OptionGroup label="문제 유형">
            {meta.types.map((t) => (
              <Chip
                key={t.type}
                selected={prefs.types.includes(t.type)}
                count={t.count}
                onClick={() => toggle("types", t.type)}
              >
                {t.label}
              </Chip>
            ))}
          </OptionGroup>

          <OptionGroup label="난이도">
            {meta.difficulties.map(({ difficulty: d, count: n }) => (
              <Chip
                key={d}
                selected={prefs.difficulties.includes(d)}
                count={n}
                disabled={n === 0}
                onClick={() => toggle("difficulties", d)}
              >
                {DIFF_LABEL[d]}
              </Chip>
            ))}
          </OptionGroup>

          <details className="group flex flex-col gap-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <span>
                토픽{" "}
                {prefs.topics.length > 0 && (
                  <span className="font-normal text-muted">{prefs.topics.length}개 선택</span>
                )}
              </span>
              <span aria-hidden className="text-muted group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="flex flex-wrap gap-2 pt-2">
              {meta.topics.map((t) => (
                <Chip
                  key={t.topic}
                  selected={prefs.topics.includes(t.topic)}
                  count={t.count}
                  onClick={() => toggle("topics", t.topic)}
                >
                  {t.topic}
                </Chip>
              ))}
            </div>
          </details>

          <OptionGroup label="풀이 상태">
            {(["all", "unsolved", "wrong", "correct"] as const).map((s) => (
              <Chip key={s} selected={prefs.status === s} onClick={() => set({ status: s })}>
                {STATUS_TEXT[s]}
              </Chip>
            ))}
          </OptionGroup>

          {/* 시험 포인트 문제가 없는 챕터(과목)는 고를 수 없게 한다 — 빈 퀴즈 방지 */}
          {meta.starIds.length > 0 && (
            <OptionGroup label="시험 포인트">
              {starChoice ? (
                ([null, "all", "handwritten", "hint"] as (StarBasis | null)[]).map((b) => (
                  <Chip
                    key={b ?? "none"}
                    selected={prefs.star === b}
                    onClick={() => set({ star: b })}
                  >
                    {b === null ? "전체 문제" : b === "all" ? "시험 포인트" : STAR_LABEL[b]}
                  </Chip>
                ))
              ) : (
                <Chip
                  selected={prefs.star === "all"}
                  count={meta.starIds.length}
                  onClick={() => set({ star: prefs.star ? null : "all" })}
                >
                  시험 포인트만
                </Chip>
              )}
            </OptionGroup>
          )}

          {sources.length > 0 && (
            <OptionGroup label="분류">
              <Chip selected={prefs.source === "all"} onClick={() => set({ source: "all" })}>
                {SOURCE_LABEL.all}
              </Chip>
              {sources.map((s) => (
                <Chip
                  key={s.value}
                  selected={prefs.source === s.value}
                  count={s.count}
                  onClick={() => set({ source: s.value })}
                >
                  {SOURCE_LABEL[s.value]}
                </Chip>
              ))}
            </OptionGroup>
          )}

          <OptionGroup label="문제 수">
            {START_COUNTS.map((n) => (
              <Chip key={n} selected={prefs.count === n} onClick={() => set({ count: n })}>
                {n ? `${n}문제` : "전체"}
              </Chip>
            ))}
          </OptionGroup>

          <OptionGroup label="순서">
            <Chip selected={!prefs.shuffle} onClick={() => set({ shuffle: false })}>
              순서대로
            </Chip>
            <Chip selected={prefs.shuffle} onClick={() => set({ shuffle: true })}>
              섞어서
            </Chip>
          </OptionGroup>

          <OptionGroup label="모드">
            <Chip selected={prefs.mode === "instant"} onClick={() => set({ mode: "instant" })}>
              연습 모드
            </Chip>
            <Chip selected={prefs.mode === "exam"} onClick={() => set({ mode: "exam" })}>
              시험 모드
            </Chip>
          </OptionGroup>
          {prefs.mode === "exam" && (
            <>
              <OptionGroup label="화면">
                <Chip selected={prefs.view === "eclass"} onClick={() => set({ view: "eclass" })}>
                  실제 시험 화면
                </Chip>
                <Chip selected={prefs.view === "app"} onClick={() => set({ view: "app" })}>
                  기본 화면
                </Chip>
              </OptionGroup>
              <TimerChips value={prefs.timer} onChange={(timer) => set({ timer })} />
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
}

const STATUS_TEXT: Record<QStatus | "all", string> = {
  all: "전체",
  unsolved: "안 푼 문제",
  wrong: "틀린 문제",
  correct: "맞힌 문제",
  submitted: "제출함",
};

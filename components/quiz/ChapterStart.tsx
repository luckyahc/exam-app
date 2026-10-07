"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChapterMeta } from "@/lib/chapterMeta";
import { STAR_LABEL, type StarBasis } from "@/lib/quiz/starBasis";
import { questionStatus, type QStatus } from "@/lib/quiz/status";
import { useRecords } from "@/lib/storage/recordsStore";

const COUNTS = [10, 20, 30, 0] as const; // 0 = 전체
const TIMERS = [0, 10, 20, 30, 60] as const; // 분, 0 = 없음
const DIFF_LABEL = { 1: "쉬움", 2: "보통", 3: "어려움" } as const;

function Chip({ on, onClick, children }: { on: boolean; onClick(): void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-sm transition-colors " +
        (on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted hover:text-foreground")
      }
    >
      {on && <span aria-hidden>✓ </span>}
      {children}
    </button>
  );
}

function Radio<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange(v: T): void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={String(o.value)} on={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

/** 챕터 시작 화면의 필터·옵션. "시작"을 누르면 조건을 /quiz 쿼리로 넘긴다(세션은 /quiz가 만든다). */
export function ChapterStart({ meta }: { meta: ChapterMeta }) {
  const router = useRouter();
  const [types, setTypes] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  // ⭐ 조건: null = 전체 문제, 그 밖은 근거(lib/quiz/starBasis.ts). 근거가 둘인 챕터(OS)만 필기·힌트를 따로 고른다
  const [star, setStar] = useState<StarBasis | null>(null);
  const starChoice = meta.starHwIds.length > 0 && meta.starHintIds.length > 0;
  const starRow = (r: ChapterMeta["rows"][number]) => !star || (star === "handwritten" ? r.hw : star === "hint" ? r.hint : r.exam);
  const [diffs, setDiffs] = useState<number[]>([]);
  const [count, setCount] = useState<number>(20);
  const [shuffle, setShuffle] = useState(true);
  const [mode, setMode] = useState<"instant" | "exam">("instant");
  const [timer, setTimer] = useState<number>(0);
  const [status, setStatus] = useState<QStatus | "all">("all");
  const records = useRecords().subjects[meta.subjectId];
  // 풀이 상태는 기기에 저장된 기록으로 정한다(lib/quiz/status.ts) — rows와 ids는 같은 순서
  const statuses = meta.ids.map((id) => questionStatus(records, id));
  const statusCount = (s: QStatus) => statuses.filter((x) => x === s).length;

  // 함수형 갱신: 빠르게 연달아 눌러도 앞의 선택을 잃지 않는다
  const toggle = <T,>(set: React.Dispatch<React.SetStateAction<T[]>>, v: NoInfer<T>) =>
    set((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));

  // 조건에 맞는 문제 수(시작 전 미리 보기) — 메타의 토픽·유형 집계로는 교집합을 알 수 없어 서버에서 받은 행으로 센다
  const available = meta.rows.filter(
    (r, i) => (status === "all" || statuses[i] === status) && (!types.length || types.includes(r.type)) && starRow(r) &&
      (!topics.length || topics.includes(r.topic)) &&
      (!diffs.length || diffs.includes(r.difficulty)),
  ).length;
  const willSolve = count ? Math.min(count, available) : available;

  const start = () => {
    const p = new URLSearchParams({ subject: meta.subjectId, chapter: meta.chapterId, mode });
    if (types.length) p.set("types", types.join(","));
    if (topics.length) p.set("topics", topics.join("|"));
    if (star) p.set("star", star === "all" ? "1" : star);
    if (status !== "all") p.set("status", status);
    if (diffs.length) p.set("diff", [...diffs].sort().join(","));
    if (count) p.set("count", String(count));
    if (shuffle) p.set("shuffle", "1");
    if (mode === "exam" && timer) p.set("timer", String(timer * 60));
    router.push(`/quiz?${p.toString()}`);
  };

  const section = "flex flex-col gap-2";
  const h = "text-sm font-semibold";

  return (
    <div className="flex flex-col gap-6">
      <div className={section}>
        <h2 className={h}>문제 유형 (여러 개 선택, 선택 안 하면 전체)</h2>
        <div className="flex flex-wrap gap-2">
          {meta.types.map((t) => (
            <Chip key={t.type} on={types.includes(t.type)} onClick={() => toggle(setTypes, t.type)}>
              {t.label} {t.count}
            </Chip>
          ))}
        </div>
      </div>

      {/* ⭐ 문제가 없는 챕터(⭐을 쓰지 않는 과목 포함)는 "시험 포인트만"을 고를 수 없게 한다 — 빈 퀴즈 방지 */}
      {meta.starIds.length > 0 && (
        <div className={section}>
          <h2 className={h}>시험 포인트</h2>
          {starChoice ? (
            <Radio<StarBasis | "none">
              name="시험 포인트"
              value={star ?? "none"}
              onChange={(v) => setStar(v === "none" ? null : v)}
              options={[
                { value: "none", label: "전체 문제" },
                { value: "all", label: `⭐ ${STAR_LABEL.all} ${meta.starIds.length}` },
                { value: "handwritten", label: `⭐ ${STAR_LABEL.handwritten} ${meta.starHwIds.length}` },
                { value: "hint", label: `⭐ ${STAR_LABEL.hint} ${meta.starHintIds.length}` },
              ]}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Chip on={!!star} onClick={() => setStar(star ? null : "all")}>
                <span aria-hidden>⭐</span> 시험 포인트만 ({meta.starIds.length})
              </Chip>
            </div>
          )}
          {starChoice && <p className="text-xs text-muted">교수님 필기 ⭐에 시험 힌트가 함께 붙은 문항은 양쪽 모두에 들어갑니다.</p>}
        </div>
      )}

      <div className={section}>
        <h2 className={h}>풀이 상태</h2>
        <Radio<QStatus | "all">
          name="풀이 상태"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "전체" },
            { value: "unsolved", label: `안 푼 문제만 ${statusCount("unsolved")}` },
            { value: "wrong", label: `틀린 문제만 ${statusCount("wrong")}` },
            { value: "correct", label: `맞힌 문제만 ${statusCount("correct")}` },
          ]}
        />
      </div>

      <div className={section}>
        <h2 className={h}>난이도 (여러 개 선택, 선택 안 하면 전체)</h2>
        <div className="flex flex-wrap gap-2">
          {meta.difficulties.map(({ difficulty: d, count: n }) => (
            <Chip key={d} on={diffs.includes(d)} onClick={() => toggle(setDiffs, d)}>
              <span aria-hidden>{"●".repeat(d) + "○".repeat(3 - d)} </span>
              {DIFF_LABEL[d]} {n}
            </Chip>
          ))}
        </div>
      </div>

      <details className={section}>
        <summary className={`${h} cursor-pointer`}>
          토픽(세부 주제) 고르기 {topics.length > 0 && <span className="font-normal text-muted">— {topics.length}개 선택</span>}
        </summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {meta.topics.map((t) => (
            <Chip key={t.topic} on={topics.includes(t.topic)} onClick={() => toggle(setTopics, t.topic)}>
              {t.star && <span aria-label="시험 포인트">⭐ </span>}
              {t.topic} {t.count}
            </Chip>
          ))}
        </div>
      </details>

      <div className={section}>
        <h2 className={h}>문제 수</h2>
        <Radio<number>
          name="문제 수"
          value={count}
          onChange={setCount}
          options={COUNTS.map((n) => ({ value: n, label: n ? `${n}문제` : "전체" }))}
        />
      </div>

      <div className={section}>
        <h2 className={h}>순서</h2>
        <Radio<string>
          name="순서"
          value={shuffle ? "s" : "o"}
          onChange={(v) => setShuffle(v === "s")}
          options={[
            { value: "s", label: "섞기" },
            { value: "o", label: "원래 순서" },
          ]}
        />
      </div>

      <div className={section}>
        <h2 className={h}>모드</h2>
        <Radio<"instant" | "exam">
          name="모드"
          value={mode}
          onChange={setMode}
          options={[
            { value: "instant", label: "즉시 채점" },
            { value: "exam", label: "시험 모드" },
          ]}
        />
        <p className="text-xs text-muted">
          {mode === "instant" ? "문제마다 제출하면 바로 정답과 해설을 보여 줍니다." : "끝까지 푼 뒤 한 번에 채점합니다."}
        </p>
        {mode === "exam" && (
          <Radio<number>
            name="타이머"
            value={timer}
            onChange={setTimer}
            options={TIMERS.map((m) => ({ value: m, label: m ? `${m}분` : "타이머 없음" }))}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={start}
          disabled={willSolve === 0}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-40"
        >
          시작 ({willSolve}문제)
        </button>
        {available === 0 && <span className="text-sm text-muted">조건에 맞는 문제가 없습니다. 필터를 줄여 보세요.</span>}
      </div>
    </div>
  );
}

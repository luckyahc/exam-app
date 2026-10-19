"use client";

import { useMemo, useState } from "react";
import { DS_FUNCTIONS, DS_LECTURES, type DsFunction } from "@/lib/dsFunctions";
import {
  checkName,
  filterMemo,
  maskedFields,
  MASK,
  type MemoDir,
  type MemoEntry,
  type MemoFilter,
  type MemoRecords,
  memoSummary,
  resetMemo,
  shuffled,
} from "@/lib/dsMemorize";
import { markFunction, setMemo, useMemoRecords } from "@/lib/storage/memoStore";

const tabLabel = (t: string) => (t ? t.replace("lec", "Lec") : "전체");
const pre =
  "min-w-0 whitespace-pre-wrap break-words rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-xs leading-5";
const chip = (on: boolean) =>
  "rounded-full border px-3 py-1.5 text-sm " +
  (on
    ? "border-primary bg-primary/10 font-semibold"
    : "border-border text-muted hover:text-foreground");
const btn = "rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary";
/** 가린 칸 — 폰에서도 누르기 쉬운 크기 */
const hidden =
  "flex min-h-12 w-full items-center justify-center rounded-md border border-dashed border-border bg-surface px-3 py-2 text-sm text-muted hover:border-primary";

const when = (e?: MemoEntry) => {
  if (!e) return "";
  const d = new Date(e.at);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

interface ItemProps {
  f: DsFunction;
  dir: MemoDir;
  open: boolean;
  onOpen: () => void;
  entry?: MemoEntry;
  onMark: (known: boolean) => void;
  meta: string;
  related: React.ReactNode;
}

/** 암기 카드 하나. 방향 A는 이름(과 보이는 글자 속 이름)을, B는 설명·쓰임·주의·예시 출력을 가린다. open이면 모두 원래대로 */
function MemoItem({ f, dir, open, onOpen, entry, onMark, meta, related }: ItemProps) {
  const [showEx, setShowEx] = useState(false);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const v = dir === "A" && !open ? { ...f, ...maskedFields(f) } : f;

  const name = <span className="break-words font-mono text-base font-semibold">{f.name}</span>;
  const signature = <span className="break-words font-mono text-xs text-muted">{v.signature}</span>;
  const role = (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm">
      <p className="break-words">{v.description}</p>
      <p className="break-words">
        <span className="text-muted">쓰임: </span>
        {v.usage}
      </p>
      {v.pitfall && <p className="break-words text-xs text-muted">주의: {v.pitfall}</p>}
    </div>
  );
  const reveal = (label: string) => (
    <button type="button" onClick={onOpen} className={hidden} aria-label={`${label} 펼치기`}>
      {MASK} {label} — 눌러서 확인
    </button>
  );
  const outputHidden = dir === "B" && !open;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 flex-col gap-1">
        {dir === "A" && !open ? reveal("이름") : name}
        {signature}
        <span className="text-xs text-muted">
          {f.category}
          {open && meta ? ` · ${meta}` : ""}
        </span>
      </div>

      {dir === "B" && !open ? reveal("설명·쓰임") : role}

      {dir === "A" && !open && (
        <form
          className="flex min-w-0 flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!guess.trim()) return;
            setResult(checkName(guess, f));
            onOpen();
          }}
        >
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="이름 입력(선택)"
            aria-label="함수 이름 입력"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
          />
          <button type="submit" className={btn}>
            확인
          </button>
        </form>
      )}
      {open && result !== null && (
        <p className={"text-sm font-medium " + (result ? "text-primary" : "text-muted")}>
          입력한 이름: {guess} — {result ? "정답과 같음" : `정답과 다름 (정답 ${f.name})`}
        </p>
      )}

      <div className="flex min-w-0 flex-col gap-1">
        <button
          type="button"
          onClick={() => setShowEx((x) => !x)}
          aria-expanded={showEx}
          className="self-start text-xs text-muted underline-offset-2 hover:underline"
        >
          {showEx ? "예시 닫기" : "예시 보기"}
        </button>
        {showEx && (
          <div className="flex min-w-0 flex-col gap-1">
            {f.lang === "python" && v.setup && (
              <details className="text-xs text-muted">
                <summary className="cursor-pointer select-none">준비 코드</summary>
                <pre className={pre + " mt-1"}>{v.setup}</pre>
              </details>
            )}
            <pre className={pre}>
              <code>{v.example}</code>
            </pre>
            {outputHidden ? (
              <p className="text-xs text-muted">실행 결과는 확인한 뒤에 보입니다.</p>
            ) : v.exampleOutput !== null ? (
              <details className="text-xs">
                <summary className="cursor-pointer select-none text-muted">실행 결과</summary>
                <pre className={pre + " mt-1"}>{v.exampleOutput}</pre>
              </details>
            ) : (
              <p className="text-xs text-muted">실행 결과 없음 — {v.noRun}</p>
            )}
          </div>
        )}
      </div>

      {open && related}

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {open && (
          <>
            <button
              type="button"
              onClick={() => onMark(true)}
              className={chip(entry?.known === true) + " min-h-11 px-4"}
            >
              알았음
            </button>
            <button
              type="button"
              onClick={() => onMark(false)}
              className={chip(entry?.known === false) + " min-h-11 px-4"}
            >
              몰랐음
            </button>
          </>
        )}
        {entry && (
          <span className="text-xs text-muted">
            마지막: {entry.known ? "알았음" : "몰랐음"} · {when(entry)}
          </span>
        )}
      </div>
    </div>
  );
}

const FILTERS: { id: MemoFilter; label: string }[] = [
  { id: "", label: "전부" },
  { id: "unknown", label: "몰랐음만" },
  { id: "unseen", label: "아직 안 본 것만" },
];

/**
 * 함수 정리 암기 모드. list = 장·카테고리·검색 필터(FunctionsView)를 거친 목록.
 * 몰랐음만·안 본 것만 필터는 필터를 고를 때의 기록으로 고정한다 — 표시하자마자 목록에서 사라져 순서가 밀리지 않게.
 */
export function MemorizeView({
  subjectId,
  list,
  lecture,
  meta,
  related,
}: {
  subjectId: string;
  list: readonly DsFunction[];
  lecture: string;
  meta: (f: DsFunction) => string;
  related: (f: DsFunction) => React.ReactNode;
}) {
  const { loaded, records } = useMemoRecords(subjectId);
  const [dir, setDir] = useState<MemoDir>("A");
  const [layout, setLayout] = useState<"list" | "card">("list");
  const [filter, setFilter] = useState<MemoFilter>("");
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<string[] | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [undo, setUndo] = useState<{ prev: MemoRecords; label: string } | null>(null);

  // 필터 기준 기록 고정(렌더 중 상태 조정 — 방향·필터·목록·로드 여부가 바뀔 때만 새로 잡는다)
  const sig = `${loaded}|${dir}|${filter}|${list.map((f) => f.id).join(",")}`;
  const [snap, setSnap] = useState({ sig, records });
  if (snap.sig !== sig) setSnap({ sig, records });

  const deck = useMemo(() => {
    const fs = filterMemo(list, snap.records, dir, filter);
    if (!order) return fs;
    const pos = new Map(order.map((id, i) => [id, i]));
    return [...fs].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
  }, [list, snap.records, dir, filter, order]);
  const idx = Math.min(cardIdx, Math.max(deck.length - 1, 0));

  const toggle = (id: string, on?: boolean) =>
    setOpened((s) => {
      const n = new Set(s);
      if (on ?? !n.has(id)) n.add(id);
      else n.delete(id);
      return n;
    });
  const mark = (f: DsFunction, known: boolean) => {
    markFunction(subjectId, dir, f.id, known);
    setUndo(null);
    if (layout === "card" && idx < deck.length - 1) setCardIdx(idx + 1);
  };
  const changeDir = (d: MemoDir) => {
    setDir(d);
    setOpened(new Set());
  };
  const summary = memoSummary(DS_FUNCTIONS, records, dir, DS_LECTURES);
  const resetScope = lecture ? tabLabel(lecture) : "전체 장";
  const doReset = () => {
    setUndo({ prev: records, label: resetScope });
    setMemo(subjectId, resetMemo(records, dir, DS_FUNCTIONS, lecture));
  };

  const item = (f: DsFunction) => (
    <MemoItem
      key={`${dir}-${f.id}`}
      f={f}
      dir={dir}
      open={opened.has(f.id)}
      onOpen={() => toggle(f.id, true)}
      entry={records[dir][f.id]}
      onMark={(k) => mark(f, k)}
      meta={meta(f)}
      related={related(f)}
    />
  );
  const card = deck[idx];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-wrap gap-2" role="group" aria-label="암기 방향">
        <button
          type="button"
          aria-pressed={dir === "A"}
          onClick={() => changeDir("A")}
          className={chip(dir === "A")}
        >
          A. 이름 맞히기
        </button>
        <button
          type="button"
          aria-pressed={dir === "B"}
          onClick={() => changeDir("B")}
          className={chip(dir === "B")}
        >
          B. 역할 맞히기
        </button>
        <span className="mx-1 self-center text-border" aria-hidden>
          |
        </span>
        <button
          type="button"
          aria-pressed={layout === "list"}
          onClick={() => setLayout("list")}
          className={chip(layout === "list")}
        >
          목록
        </button>
        <button
          type="button"
          aria-pressed={layout === "card"}
          onClick={() => setLayout("card")}
          className={chip(layout === "card")}
        >
          카드
        </button>
      </div>

      <div className="flex min-w-0 flex-wrap gap-2" role="group" aria-label="기록 필터">
        {FILTERS.map((x) => (
          <button
            key={x.id || "all"}
            type="button"
            aria-pressed={filter === x.id}
            onClick={() => setFilter(x.id)}
            className={chip(filter === x.id)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-wrap gap-2">
        <button type="button" onClick={() => setOpened(new Set())} className={btn}>
          모두 가리기
        </button>
        <button
          type="button"
          onClick={() => setOpened(new Set(deck.map((f) => f.id)))}
          className={btn}
        >
          모두 펼치기
        </button>
        <button
          type="button"
          onClick={() => {
            setOrder(shuffled(list.map((f) => f.id)));
            setCardIdx(0);
          }}
          className={btn}
        >
          순서 섞기
        </button>
        {order && (
          <button type="button" onClick={() => setOrder(null)} className={btn + " text-muted"}>
            원래 순서
          </button>
        )}
      </div>

      <section
        aria-label="장별 진행"
        className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3"
      >
        <p className="text-xs text-muted">
          장별 진행 ({dir === "A" ? "이름 맞히기" : "역할 맞히기"} · 알았음 / 전체)
        </p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          {summary.map((s) => (
            <li
              key={s.lecture}
              className={"tabular-nums " + (s.lecture === lecture ? "font-semibold" : "")}
            >
              {tabLabel(s.lecture)} {loaded ? `${s.known} / ${s.total}` : "—"}
            </li>
          ))}
        </ul>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button type="button" onClick={doReset} className={btn + " text-xs"}>
            {resetScope} 기록 초기화 ({dir})
          </button>
          {undo && (
            <>
              <span className="text-xs text-muted">{undo.label} 기록을 지웠습니다.</span>
              <button
                type="button"
                onClick={() => {
                  setMemo(subjectId, undo.prev);
                  setUndo(null);
                }}
                className={btn + " text-xs font-semibold"}
              >
                되돌리기
              </button>
            </>
          )}
        </div>
      </section>

      <p className="text-xs text-muted" aria-live="polite">
        {deck.length}개 ·{" "}
        {dir === "A"
          ? "설명을 보고 이름을 떠올린 뒤 ▢▢▢를 누르세요"
          : "이름을 보고 역할을 떠올린 뒤 가린 칸을 누르세요"}
      </p>

      {layout === "list" ? (
        <ul className="flex flex-col gap-3">
          {deck.map((f) => (
            <li key={f.id} className="min-w-0 rounded-lg border border-border p-3">
              {item(f)}
            </li>
          ))}
        </ul>
      ) : card ? (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => setCardIdx(idx - 1)}
              className={btn + " disabled:opacity-40"}
            >
              ← 이전
            </button>
            <span className="tabular-nums text-sm font-semibold" aria-live="polite">
              {idx + 1}/{deck.length}
            </span>
            <button
              type="button"
              disabled={idx >= deck.length - 1}
              onClick={() => setCardIdx(idx + 1)}
              className={btn + " disabled:opacity-40"}
            >
              다음 →
            </button>
          </div>
          <div className="min-w-0 rounded-lg border border-border p-4">{item(card)}</div>
        </div>
      ) : null}

      {deck.length === 0 && <p className="py-6 text-sm text-muted">조건에 맞는 함수가 없습니다.</p>}
    </div>
  );
}

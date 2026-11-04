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
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { List } from "@/components/ui/ListRow";
import { TextInput } from "@/components/ui/TextInput";
import { codePre as pre } from "./codePre";

const tabLabel = (t: string) => (t ? t.replace("lec", "Lec") : "전체");
/** 가린 칸 — 누르면 펼친다(44px 이상, 면 색) */
const hidden =
  "flex min-h-12 w-full items-center justify-center bg-paper-deep px-3 py-2 text-sm text-muted";

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
          className="flex min-w-0 items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!guess.trim()) return;
            setResult(checkName(guess, f));
            onOpen();
          }}
        >
          <TextInput
            label="함수 이름"
            hideLabel
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="이름 입력(선택)"
            className="min-w-0 flex-1 font-mono"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            확인
          </Button>
        </form>
      )}
      {open && result !== null && (
        <p className="text-sm">
          입력한 이름 <span className="font-mono">{guess}</span> ·{" "}
          {result ? (
            <span className="font-semibold text-ok">정답과 같음</span>
          ) : (
            <>
              <span className="font-semibold text-shu">정답과 다름</span> · 정답{" "}
              <span className="font-mono font-semibold">{f.name}</span>
            </>
          )}
        </p>
      )}

      <div className="flex min-w-0 flex-col gap-1">
        <Button
          variant="text"
          onClick={() => setShowEx((x) => !x)}
          aria-expanded={showEx}
          className="self-start text-sm text-muted"
        >
          {showEx ? "예시 닫기" : "예시 보기"}
        </Button>
        {showEx && (
          <div className="flex min-w-0 flex-col gap-1">
            {f.lang === "python" && v.setup && (
              <details className="text-sm text-muted">
                <summary className="flex min-h-11 cursor-pointer items-center select-none">
                  준비 코드
                </summary>
                <pre className={pre}>{v.setup}</pre>
              </details>
            )}
            <pre className={pre}>
              <code>{v.example}</code>
            </pre>
            {outputHidden ? (
              <p className="text-sm text-muted">실행 결과는 확인한 뒤에 보입니다.</p>
            ) : v.exampleOutput !== null ? (
              <details className="text-sm">
                <summary className="flex min-h-11 cursor-pointer items-center text-muted select-none">
                  실행 결과
                </summary>
                <pre className={pre}>{v.exampleOutput}</pre>
              </details>
            ) : (
              <p className="text-sm text-muted">실행 결과 없음 — {v.noRun}</p>
            )}
          </div>
        )}
      </div>

      {open && related}

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {open && (
          <>
            <Chip selected={entry?.known === true} onClick={() => onMark(true)}>
              알았음
            </Chip>
            <Chip selected={entry?.known === false} onClick={() => onMark(false)}>
              몰랐음
            </Chip>
          </>
        )}
        {entry && (
          <span className="text-sm text-muted">
            마지막 {entry.known ? "알았음" : "몰랐음"} ·{" "}
            <span className="font-mono">{when(entry)}</span>
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
      <div className="flex min-w-0 flex-wrap gap-2" role="group" aria-label="암기 방향·보기">
        <Chip selected={dir === "A"} onClick={() => changeDir("A")}>
          A. 이름 맞히기
        </Chip>
        <Chip selected={dir === "B"} onClick={() => changeDir("B")}>
          B. 역할 맞히기
        </Chip>
        <Chip selected={layout === "list"} onClick={() => setLayout("list")}>
          목록
        </Chip>
        <Chip selected={layout === "card"} onClick={() => setLayout("card")}>
          카드
        </Chip>
      </div>

      <div className="flex min-w-0 flex-wrap gap-2" role="group" aria-label="기록 필터">
        {FILTERS.map((x) => (
          <Chip key={x.id || "all"} selected={filter === x.id} onClick={() => setFilter(x.id)}>
            {x.label}
          </Chip>
        ))}
      </div>

      <div className="flex min-w-0 flex-wrap gap-x-4">
        <Button variant="text" onClick={() => setOpened(new Set())}>
          모두 가리기
        </Button>
        <Button variant="text" onClick={() => setOpened(new Set(deck.map((f) => f.id)))}>
          모두 펼치기
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setOrder(shuffled(list.map((f) => f.id)));
            setCardIdx(0);
          }}
        >
          순서 섞기
        </Button>
        {order && (
          <Button variant="text" onClick={() => setOrder(null)} className="text-muted">
            원래 순서
          </Button>
        )}
      </div>

      <section aria-label="장별 진행" className="flex min-w-0 flex-col gap-2 bg-paper-deep p-3">
        <p className="text-sm text-muted">
          장별 진행 · {dir === "A" ? "이름 맞히기" : "역할 맞히기"} · 알았음/전체
        </p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          {summary.map((s) => (
            <li key={s.lecture} className={s.lecture === lecture ? "font-semibold" : ""}>
              {tabLabel(s.lecture)}{" "}
              <span className="font-mono tabular-nums">
                {loaded ? `${s.known}/${s.total}` : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3">
          <Button variant="text" onClick={doReset} className="text-sm">
            {resetScope} 기록 초기화 ({dir})
          </Button>
          {undo && (
            <>
              <span className="text-sm text-muted">{undo.label} 기록을 지웠습니다.</span>
              <Button
                variant="text"
                onClick={() => {
                  setMemo(subjectId, undo.prev);
                  setUndo(null);
                }}
                className="text-sm"
              >
                되돌리기
              </Button>
            </>
          )}
        </div>
      </section>

      <p className="text-sm text-muted" aria-live="polite">
        <span className="font-mono">{deck.length}</span>개 ·{" "}
        {dir === "A"
          ? "설명을 보고 이름을 떠올린 뒤 가린 칸을 누르세요"
          : "이름을 보고 역할을 떠올린 뒤 가린 칸을 누르세요"}
      </p>

      {layout === "list" ? (
        <List aria-label="암기 목록">
          {deck.map((f) => (
            <li key={f.id} className="min-w-0 px-3 py-4">
              {item(f)}
            </li>
          ))}
        </List>
      ) : card ? (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" disabled={idx === 0} onClick={() => setCardIdx(idx - 1)}>
              이전
            </Button>
            <span className="font-mono text-sm font-semibold tabular-nums" aria-live="polite">
              {idx + 1} / {deck.length}
            </span>
            <Button
              variant="secondary"
              disabled={idx >= deck.length - 1}
              onClick={() => setCardIdx(idx + 1)}
            >
              다음
            </Button>
          </div>
          <div className="min-w-0 border-y-[1.5px] border-sumi px-3 py-4">{item(card)}</div>
        </div>
      ) : null}

      {deck.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">조건에 맞는 함수가 없습니다.</p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { CodeBlock } from "@/components/qtypes/CodeBlock";
import { DataTables } from "@/components/qtypes/DataTables";
import { QuestionFigureView } from "@/components/qtypes/QuestionRenderer";
import { uiFor } from "@/components/qtypes/registry";
import { RichText } from "@/components/qtypes/ui";
import { splitBlankText } from "@/lib/qtypes/blank";
import { choiceOrder } from "@/lib/qtypes/choiceOrder";
import { questionData } from "@/lib/qtypes/dataSnapshots";
import { type AnyAnswer, coreFor, type Question } from "@/lib/qtypes/registry";
import type { QuizSession } from "@/lib/quiz/session";

/**
 * 시험 모드 화면 — 학교 e-Class 시험 화면(source/실제 시험 화면/)을 본뜬다. 앱 머리글을 덮는 전체 화면에
 * 상단(제목·남은 시간), 왼쪽 답안지 표(번호 | 답안지, 맨 아래 제출), 오른쪽 문제 상자("N. 지문", ○1) 보기 / #n 빈칸 + 순서·정답 표, 깃발),
 * 그 아래 "< 이전"·"다음 >"을 둔다. 실제 시험처럼 항상 흰 바탕(다크 모드 무시). 채점·기록·타이머는 QuizRunner가 맡는다.
 */
interface Props {
  session: QuizSession;
  getQ(id: string): Question | undefined;
  remaining: number | null;
  now: number;
  answeredCount: number;
  onAnswer(a: AnyAnswer): void;
  goTo(index: number): void;
  onSubmit(): void;
  /** 기본 풀이 화면으로 바꾸기(답안은 그대로) */
  onSwitchView(): void;
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/** 답안지 칸의 검은 동그라미 번호(실제 화면의 ❶ 모양) */
const Dot = ({ n }: { n: ReactNode }) => (
  <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#333] text-xs font-bold text-white">{n}</span>
);

/** 답안지 칸: 객관식은 고른 번호(화면 순서), 빈칸은 쓴 글자("[1] …" 줄), 그 밖은 "답함" */
function SheetCell({ q, a }: { q: Question | undefined; a: AnyAnswer | undefined }) {
  if (!q || a === undefined) return null;
  if (q.type === "mcq") return typeof a === "number" ? <Dot n={choiceOrder(q).indexOf(a) + 1} /> : null;
  if (q.type === "multi") {
    const order = choiceOrder(q);
    const picked = (a as number[]).map((i) => order.indexOf(i) + 1).sort((x, y) => x - y);
    return picked.length ? <span className="flex flex-wrap gap-1">{picked.map((n) => <Dot key={n} n={n} />)}</span> : null;
  }
  if (q.type === "ox") return a === null ? null : <Dot n={a ? "O" : "X"} />;
  if (q.type === "blank") {
    const vals = a as string[];
    if (!vals.some((v) => v?.trim())) return null;
    if (vals.length === 1) return <span className="break-all">{vals[0]}</span>;
    return (
      <span className="flex flex-col leading-tight">
        {vals.map((v, i) => (
          <span key={i} className="break-all">
            [{i + 1}] {v}
          </span>
        ))}
      </span>
    );
  }
  return coreFor(q).isComplete(q as never, a as never) ? <span>답함</span> : null;
}

/** 문제 본문 아래 입력: 객관식 ○1), 복수 □1), OX, 빈칸은 순서·정답 표. 그 밖의 유형은 앱의 입력 컴포넌트 그대로 */
function ExamInput({ q, a, onAnswer }: { q: Question; a: AnyAnswer; onAnswer(a: AnyAnswer): void }) {
  const row = "flex cursor-pointer items-start gap-2 py-2 text-[15px]";
  if (q.type === "mcq" || q.type === "multi") {
    const multi = q.type === "multi";
    return (
      <div role={multi ? "group" : "radiogroup"} aria-label="보기" className="flex flex-col">
        {choiceOrder(q).map((orig, pos) => {
          const checked = multi ? (a as number[]).includes(orig) : a === orig;
          const toggle = () =>
            onAnswer(multi ? (checked ? (a as number[]).filter((x) => x !== orig) : [...(a as number[]), orig].sort((x, y) => x - y)) : orig);
          return (
            <label key={orig} className={row}>
              <input type={multi ? "checkbox" : "radio"} name={q.id} checked={checked} onChange={toggle} className="mt-1 size-3.5 shrink-0" />
              <span className="w-6 shrink-0">{pos + 1})</span>
              <span className="min-w-0 whitespace-pre-wrap">
                <RichText text={q.choices[orig]} />
              </span>
            </label>
          );
        })}
      </div>
    );
  }
  if (q.type === "ox") {
    return (
      <div role="radiogroup" aria-label="보기" className="flex flex-col">
        {[true, false].map((v, i) => (
          <label key={i} className={row}>
            <input type="radio" name={q.id} checked={a === v} onChange={() => onAnswer(v)} className="mt-1 size-3.5 shrink-0" />
            <span className="w-6 shrink-0">{i + 1})</span>
            <span>{v ? "O" : "X"}</span>
          </label>
        ))}
      </div>
    );
  }
  if (q.type === "blank") {
    const vals = a as string[];
    const set = (i: number, v: string) => onAnswer(vals.map((x, j) => (j === i ? v : x)));
    return (
      <table className="w-full border-collapse border border-[#ccc] text-[15px]">
        <thead>
          <tr className="bg-[#f4f4f4]">
            <th className="w-24 border border-[#ccc] py-2 font-semibold sm:w-32">순서</th>
            <th className="border border-[#ccc] py-2 font-semibold">정답</th>
          </tr>
        </thead>
        <tbody>
          {q.blanks.map((_, i) => (
            <tr key={i}>
              <td className="border border-[#ccc] text-center">#{i + 1}</td>
              <td className="border border-[#ccc] p-2.5">
                {q.bank ? (
                  <select
                    aria-label={`#${i + 1} 정답`}
                    value={vals[i] ?? ""}
                    onChange={(e) => set(i, e.target.value)}
                    className="h-9 w-full border border-[#999] bg-white px-2"
                  >
                    <option value="">선택</option>
                    {q.bank.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-label={`#${i + 1} 정답`}
                    value={vals[i] ?? ""}
                    onChange={(e) => set(i, e.target.value)}
                    autoComplete="off"
                    className="h-9 w-full border border-[#999] bg-white px-2 focus:border-[#4a7fd6]"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  const { Input } = uiFor(q.type);
  return <Input question={q as never} answer={a as never} onChange={onAnswer as never} disabled={false} />;
}

/** 빈칸 지문: {{n}} 자리를 실제 화면처럼 회색 "#n" 상자로 보인다(입력은 아래 표) */
function BlankText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap leading-9">
      {splitBlankText(text).map((part, k) =>
        typeof part === "string" ? (
          <span key={k}>{part}</span>
        ) : (
          <span key={k} className="mx-0.5 inline-block min-w-12 border border-[#bbb] bg-white px-3 text-center leading-7 text-[#888]">
            #{part + 1}
          </span>
        ),
      )}
    </p>
  );
}

export function ExamScreen({ session, getQ, remaining, now, answeredCount, onAnswer, goTo, onSubmit, onSwitchView }: Props) {
  const [flags, setFlags] = useState<ReadonlySet<string>>(() => new Set());
  const [confirming, setConfirming] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const total = session.items.length;
  const item = session.items[session.index];
  const q = item ? getQ(item.id) : undefined;
  const answer: AnyAnswer | undefined = q ? (session.answers[q.id] ?? coreFor(q).emptyAnswer(q as never)) : undefined;
  const data = q ? questionData(q) : null;
  const first = session.index === 0;
  const last = session.index === total - 1;
  const elapsed = Math.max(0, Math.floor((now - Date.parse(session.createdAt)) / 1000));

  // 전체 화면 동안 뒤쪽 페이지가 스크롤되지 않게
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toggleFlag = (id: string) =>
    setFlags((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const navBtn = "h-12 w-[106px] border text-[15px] font-semibold";
  const sheet = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 bg-[#f2f2f2]">
            <tr>
              <th className="w-10 border border-[#ccc] py-3 font-bold">번호</th>
              <th className="border border-[#ccc] py-3 font-bold">답안지</th>
            </tr>
          </thead>
          <tbody>
            {session.items.map((it, i) => {
              const qq = getQ(it.id);
              return (
                <tr
                  key={it.id}
                  onClick={() => {
                    goTo(i);
                    setSheetOpen(false);
                  }}
                  className="cursor-pointer hover:bg-[#f7f9fc]"
                  aria-current={i === session.index ? "step" : undefined}
                >
                  <td className={"h-[45px] border border-[#ccc] text-center font-bold " + (i === session.index ? "text-[#1d5fcf]" : "")}>
                    {i + 1}
                    {flags.has(it.id) && (
                      <span aria-label="표시함" className="block text-[11px] leading-none text-[#d33]">
                        ⚑
                      </span>
                    )}
                  </td>
                  <td className="border border-[#ccc] px-1.5 py-1 text-[12px]">
                    <SheetCell q={qq} a={session.answers[it.id]} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => setConfirming(true)} className="m-1.5 h-10 shrink-0 bg-[#3ec8f7] text-[15px] font-semibold text-[#1b1b1b] hover:bg-[#2fbdf0]">
        제출
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col border-t-[3px] border-[#3a9d3a] bg-white text-[#222]" style={{ colorScheme: "light" }}>
      {/* 상단: 시험 제목 · 과목 · 남은 시간 */}
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#ddd] px-4 py-2 sm:px-16">
        <h1 className="text-xl font-bold sm:text-[28px]">모의시험</h1>
        <span className="hidden truncate text-[15px] sm:inline">과목 : {session.label}</span>
        <span className="ml-auto whitespace-nowrap text-[15px] sm:text-[19px]">
          {remaining !== null ? (
            <span className={remaining <= 60 ? "font-semibold text-[#d33]" : ""}>남은 시간 : {mmss(remaining)}</span>
          ) : (
            <>경과 시간 : {mmss(elapsed)}</>
          )}
        </span>
        <button type="button" onClick={onSwitchView} className="text-xs text-[#888] underline" title="답안은 그대로 두고 앱의 기본 풀이 화면으로 바꿉니다">
          기본 화면
        </button>
        <Link href={session.backHref} className="text-xs text-[#888] underline" title="답안은 저장되어 이어서 풀 수 있습니다">
          나가기
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 왼쪽 답안지(넓은 화면) */}
        <aside aria-label="답안지" className="hidden w-[270px] shrink-0 flex-col border-r border-[#ddd] p-1.5 md:flex">
          {sheet}
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-2">
          {/* 좁은 화면: 답안지를 펼쳐 보기 */}
          <div className="mb-2 flex gap-2 md:hidden">
            <button type="button" onClick={() => setSheetOpen((v) => !v)} className="h-9 flex-1 border border-[#ccc] bg-[#f2f2f2] text-sm font-semibold">
              답안지 ({answeredCount}/{total}) {sheetOpen ? "▲" : "▼"}
            </button>
            <button type="button" onClick={() => setConfirming(true)} className="h-9 w-20 bg-[#3ec8f7] text-sm font-semibold">
              제출
            </button>
          </div>
          {sheetOpen && <div className="mb-2 flex h-[50vh] flex-col border border-[#ddd] md:hidden">{sheet}</div>}

          <section className="relative border border-[#ddd] bg-[#fafafa] px-4 py-5 sm:pr-16" aria-labelledby="exam-q">
            {q && (
              <button
                type="button"
                onClick={() => toggleFlag(q.id)}
                aria-pressed={flags.has(q.id)}
                title="나중에 다시 볼 문제로 표시"
                className={"absolute right-4 top-4 flex h-8 w-10 items-center justify-center border border-[#ccc] bg-white text-sm " + (flags.has(q.id) ? "text-[#d33]" : "text-[#aaa]")}
              >
                ⚑<span className="text-[9px]">▾</span>
              </button>
            )}
            {q && answer !== undefined ? (
              <div className="flex flex-col gap-3 text-[15px]">
                <div id="exam-q" className="flex gap-2 pr-12 sm:pr-0">
                  <span className="shrink-0">{session.index + 1}.</span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="whitespace-pre-wrap">
                      <RichText text={q.prompt} />
                    </div>
                    {q.code && <CodeBlock code={q.code.source} language={q.code.language} lineNumbers={q.code.lineNumbers} />}
                    {data && <DataTables data={data} />}
                    <QuestionFigureView question={q} />
                    {q.type === "blank" && <BlankText text={q.text} />}
                    {q.type === "multi" && <span>(복수선택 가능)</span>}
                  </div>
                </div>
                <ExamInput q={q} a={answer} onAnswer={onAnswer} />
              </div>
            ) : (
              <p className="text-sm">이 문제를 불러올 수 없습니다(데이터가 바뀌었을 수 있음). 다음 문제로 넘어가세요.</p>
            )}
          </section>

          <div className="mt-6 flex gap-3 px-4">
            <button
              type="button"
              onClick={() => goTo(session.index - 1)}
              disabled={first}
              className={navBtn + " border-[#ccc] bg-white disabled:border-[#eee] disabled:bg-[#eee] disabled:text-[#bbb]"}
            >
              &lt; 이전
            </button>
            <button
              type="button"
              onClick={() => goTo(session.index + 1)}
              disabled={last}
              className={navBtn + " border-[#e3d98a] bg-[#fff8c5] disabled:border-[#eee] disabled:bg-[#eee] disabled:text-[#bbb]"}
            >
              다음 &gt;
            </button>
          </div>
        </main>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="exam-submit-title" className="flex w-full max-w-sm flex-col gap-4 border border-[#bbb] bg-white p-5 shadow-lg">
            <p id="exam-submit-title" className="text-[15px] font-semibold">
              답안을 제출하시겠습니까?
            </p>
            <p className="text-sm">
              답한 문제 {answeredCount}/{total}
              {answeredCount < total && ` — 답하지 않은 ${total - answeredCount}문제는 미응답(오답)으로 처리됩니다.`}
              {flags.size > 0 && ` 표시(⚑)한 문제 ${flags.size}개.`} 제출하면 수정할 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onSubmit} className="h-9 w-20 bg-[#3ec8f7] text-sm font-semibold">
                확인
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="h-9 w-20 border border-[#ccc] bg-white text-sm">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Check, ChevronLeft, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon } from "@/components/quiz/BookmarkIcon";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";
import type { GradeResult } from "@/lib/qtypes/base";
import { type AnyAnswer, coreFor, type Question } from "@/lib/qtypes/registry";
import type { QuizSession } from "@/lib/quiz/session";
import { storageWritable } from "@/lib/storage/probe";
import { PracticeQuestion } from "./PracticeQuestion";

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export interface PracticeViewProps {
  session: QuizSession;
  q: Question | undefined;
  answer: AnyAnswer | undefined;
  result: GradeResult | null;
  complete: boolean;
  gradedCount: number;
  remaining: number | null;
  generating: boolean;
  setAnswer(a: AnyAnswer): void;
  submit(): void;
  go(delta: number): void;
  goTo(index: number): void;
  finish(): void;
  addSimilar(): void;
}

/**
 * 연습 모드(즉시 채점) 풀이 화면. 상태·채점·기록은 QuizRunner가 그대로 맡고, 여기는 표시만 한다.
 * - 위: ← 나가기 · 7 / 20(누르면 번호 이동·여기까지 결과) · 북마크, 얇은 진행바
 * - 아래 고정: 이전 · 확인/다음/결과 보기(주 버튼) · 건너뛰기. 키보드가 올라오면 그 위로 올라간다
 * 기록 저장: 확인을 누를 때마다 recordResult(과목 기록), 답을 바꿀 때마다 세션(답·위치)이 저장된다.
 * 확인하지 않은 답이 있거나 저장소에 쓸 수 없으면 나가기 전에 한 번 묻는다.
 */
export function PracticeView(p: PracticeViewProps) {
  const { session, q, answer, result, complete, gradedCount, remaining } = p;
  const router = useRouter();
  const inset = useKeyboardInset();
  const [jumpOpen, setJumpOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState<null | "unsaved" | "storage">(null);
  const total = session.items.length;
  const index = session.index;
  const last = index === total - 1;
  const item = session.items[index];

  // 확인(채점)하지 않은 채 입력만 한 답: 세션에는 남지만 과목 기록(진행·오답)에는 들어가지 않는다
  const pending =
    !!q &&
    !result &&
    answer !== undefined &&
    JSON.stringify(answer) !== JSON.stringify(coreFor(q).emptyAnswer(q as never));
  const exit = () => {
    if (!storageWritable()) return setExitOpen("storage");
    if (pending) return setExitOpen("unsaved");
    router.push(session.backHref);
  };

  const primary = result
    ? last
      ? { label: "결과 보기", onClick: p.finish, disabled: false }
      : { label: "다음", onClick: () => p.go(1), disabled: false }
    : { label: "확인", onClick: p.submit, disabled: !complete };

  return (
    <div
      className="flex flex-col gap-6"
      // 입력창에 커서가 가면 키보드와 하단 막대에 가리지 않게 화면 가운데로 옮긴다(아이폰은 키보드가 늦게 올라와 조금 기다린다)
      onFocus={(e) => {
        const el = e.target;
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        )
          setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
      }}
    >
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 bg-paper px-4 pt-1 pb-2 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={exit}
            className="-ml-2 inline-flex min-h-11 items-center gap-0.5 pr-2 text-sm text-muted"
          >
            <ChevronLeft aria-hidden className="size-5" strokeWidth={1.75} />
            나가기
          </button>
          <button
            type="button"
            onClick={() => setJumpOpen(true)}
            aria-label={`${index + 1}번째 문제, 전체 ${total}문제. 번호로 이동`}
            className="inline-flex min-h-11 items-center gap-3 px-2 font-mono text-base font-semibold tabular-nums"
          >
            {index + 1} / {total}
            {remaining !== null && (
              <span
                className={cn("text-sm", remaining <= 60 ? "text-sumi" : "font-normal text-muted")}
              >
                {mmss(remaining)}
              </span>
            )}
          </button>
          {q && item ? (
            <BookmarkIcon subjectId={item.subject} questionId={q.id} />
          ) : (
            <span className="size-11" />
          )}
        </div>
        <ProgressBar value={index + 1} max={total} label="진행" className="h-1" />
      </div>

      {q && answer !== undefined ? (
        <PracticeQuestion
          key={q.id}
          question={q}
          answer={answer}
          onAnswer={p.setAnswer}
          result={result}
          onEnter={() => (result ? primary.onClick() : complete && p.submit())}
        />
      ) : (
        <p className="text-sm text-muted">이 문제를 불러올 수 없습니다. 다음 문제로 넘어가세요.</p>
      )}

      {result && q?.generator && (
        <Button
          variant="text"
          onClick={p.addSimilar}
          disabled={p.generating}
          className="self-start"
        >
          <RotateCcw aria-hidden className="size-4" strokeWidth={2} />
          {p.generating ? "만드는 중…" : "숫자만 바꾼 비슷한 문제 하나 더"}
        </Button>
      )}

      {/* 하단 고정 막대에 마지막 내용이 가리지 않게 같은 높이의 빈 칸 */}
      <div aria-hidden className="h-20" />
      <div
        className={cn(
          "fixed inset-x-0 z-30 border-t-[1.5px] border-sumi bg-paper px-4 pt-3",
          inset > 0 ? "pb-3" : "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
        style={{ bottom: inset }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => p.go(-1)}
            disabled={index === 0}
            aria-label="이전 문제"
            className="w-12 shrink-0 px-0"
          >
            <ChevronLeft aria-hidden className="size-5" strokeWidth={2} />
          </Button>
          <Button onClick={primary.onClick} disabled={primary.disabled} className="min-w-0 flex-1">
            {primary.label}
          </Button>
          {!result && !last && (
            <Button variant="text" onClick={() => p.go(1)} className="shrink-0 px-2 text-muted">
              건너뛰기
            </Button>
          )}
        </div>
      </div>

      <BottomSheet
        open={jumpOpen}
        onClose={() => setJumpOpen(false)}
        title={session.label}
        footer={
          gradedCount > 0 && !(result && last) ? (
            <Button variant="secondary" block onClick={p.finish}>
              여기까지 풀고 결과 보기 ({gradedCount}/{total})
            </Button>
          ) : undefined
        }
      >
        <nav aria-label="문제 번호" className="grid grid-cols-6 gap-2 pt-1">
          {session.items.map((it, i) => {
            const r = session.results[it.id];
            const state = r ? (r.selfCheck ? "풀었음" : r.correct ? "정답" : "오답") : "안 풂";
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  p.goTo(i);
                  setJumpOpen(false);
                }}
                aria-current={i === index ? "step" : undefined}
                aria-label={`${i + 1}번 (${state})`}
                className={cn(
                  "flex h-11 items-center justify-center gap-0.5 font-mono text-sm tabular-nums",
                  i === index ? "bg-sumi text-paper" : "bg-paper-deep",
                )}
              >
                {i + 1}
                {r &&
                  !r.selfCheck &&
                  (r.correct ? (
                    <Check
                      aria-hidden
                      className={cn("size-3", i === index ? "" : "text-ok")}
                      strokeWidth={3}
                    />
                  ) : (
                    <X
                      aria-hidden
                      className={cn("size-3", i === index ? "" : "text-shu")}
                      strokeWidth={3}
                    />
                  ))}
              </button>
            );
          })}
        </nav>
      </BottomSheet>

      <BottomSheet
        open={exitOpen !== null}
        onClose={() => setExitOpen(null)}
        title="나갈까요?"
        footer={
          <div className="flex flex-col gap-2">
            <Button block onClick={() => setExitOpen(null)}>
              계속 풀기
            </Button>
            <Button variant="secondary" block onClick={() => router.push(session.backHref)}>
              나가기
            </Button>
          </div>
        }
      >
        <p className="pt-1 text-base">
          {exitOpen === "storage"
            ? "이 브라우저는 기록을 저장할 수 없습니다. 나가면 이번 풀이 기록이 남지 않습니다."
            : "확인하지 않은 답은 기록되지 않습니다."}
        </p>
      </BottomSheet>
    </div>
  );
}

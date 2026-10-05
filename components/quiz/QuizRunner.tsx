"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { QuestionRenderer } from "@/components/qtypes/QuestionRenderer";
import { useQuizShortcuts } from "@/lib/hooks/useQuizShortcuts";
import type { GradeResult } from "@/lib/qtypes/base";
import { type AnyAnswer, coreFor, gradeQuestion, type Question } from "@/lib/qtypes/registry";
import { gradeInSession, type QuizSession, saveSession } from "@/lib/quiz/session";
import { makeSimilar } from "@/lib/quiz/similar";
import { getSubject } from "@/lib/subjects";
import { recordResult } from "@/lib/storage/recordsStore";
import { BookmarkButton } from "./BookmarkButton";

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/**
 * 문제 풀이 화면. 즉시 채점: 문제마다 제출 → 정답/해설. 시험 모드: 끝까지 풀고 한 번에 채점(선택형 타이머).
 * 판정 규칙(완전히 맞아야 정답, 부분 점수는 보조 표시)은 gradeQuestion·recordResult가 그대로 따른다.
 */
export function QuizRunner({ initial, questions }: { initial: QuizSession; questions: ReadonlyMap<string, Question> }) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  /** "비슷한 문제 새로 생성"으로 이번 세션에 끼워 넣은 문제 */
  const [extra, setExtra] = useState<ReadonlyMap<string, Question>>(() => new Map());
  const [generating, setGenerating] = useState(false);
  const getQ = (id: string) => questions.get(id) ?? extra.get(id);

  const update = (next: QuizSession) => {
    setSession(next);
    saveSession(next);
  };

  const item = session.items[session.index];
  const q = item ? getQ(item.id) : undefined;
  const answer: AnyAnswer | undefined = q ? (session.answers[q.id] ?? coreFor(q).emptyAnswer(q as never)) : undefined;
  const result: GradeResult | null = q && session.mode === "instant" ? (session.results[q.id] ?? null) : null;
  const total = session.items.length;
  const isExam = session.mode === "exam";
  const answeredCount = session.items.filter((it) => {
    const qq = getQ(it.id);
    const a = session.answers[it.id];
    return qq && a !== undefined && coreFor(qq).isComplete(qq as never, a as never);
  }).length;
  const gradedCount = Object.keys(session.results).length;
  const complete = q && answer !== undefined ? coreFor(q).isComplete(q as never, answer as never) : false;

  const go = (delta: number) => {
    const index = Math.min(total - 1, Math.max(0, session.index + delta));
    if (index !== session.index) update({ ...session, index });
  };
  const goTo = (index: number) => update({ ...session, index });
  const setAnswer = (a: AnyAnswer) => q && update({ ...session, answers: { ...session.answers, [q.id]: a } });

  const finish = (s: QuizSession) => {
    update({ ...s, finished: true });
    router.push(`/result?session=${s.id}`);
  };

  /** 즉시 채점: 지금 문제를 채점하고 기록 */
  const submit = () => {
    if (!q || answer === undefined || result || !complete) return;
    // 채점한 답도 세션에 저장한다(순서 배치를 손대지 않고 제출한 경우 포함) — lib/quiz/session.ts gradeInSession
    const { session: next, result: r } = gradeInSession(session, q, answer);
    recordResult(item.subject, q.id, r, q.generator);
    update(next);
  };

  /** 시험 모드: 답한 문제를 모두 채점·기록하고 결과로. 답하지 않은 문제는 미응답(오답으로 집계, 기록은 남기지 않음) */
  const gradeAll = () => {
    const results: Record<string, GradeResult> = {};
    for (const it of session.items) {
      const qq = getQ(it.id);
      const a = session.answers[it.id];
      if (!qq || a === undefined || !coreFor(qq).isComplete(qq as never, a as never)) continue;
      const r = gradeQuestion(qq, a);
      results[it.id] = r;
      recordResult(it.subject, it.id, r, qq.generator);
    }
    finish({ ...session, results });
  };

  /**
   * 즉시 채점에서 채점한 생성기 문제 → 같은 생성기·params, 새 seed로 문제를 만들어 바로 다음에 끼워 넣는다.
   * 새 문제는 id가 달라(seed ≥ 1,000,000) 원래 문제와 기록이 섞이지 않는다. 세션 항목에 생성기 정보를 남겨 새로고침해도 다시 만든다.
   */
  const addSimilar = async () => {
    if (!q?.generator || generating) return;
    const loader = getSubject(item.subject)?.loadGenerators;
    if (!loader) return;
    setGenerating(true);
    const nq = makeSimilar(q, await loader());
    setGenerating(false);
    if (!nq) return;
    setExtra((m) => new Map(m).set(nq.id, nq));
    const items = [...session.items];
    items.splice(session.index + 1, 0, { id: nq.id, subject: item.subject, chapter: nq.chapter, gen: nq.generator });
    update({ ...session, items, index: session.index + 1 });
  };

  // 타이머: 1초마다 남은 시간 갱신, 0이 되면 자동 채점
  const onTick = useEffectEvent(() => {
    setNow(Date.now());
    if (isExam && !session.finished && session.deadline && Date.now() >= session.deadline) gradeAll();
  });
  useEffect(() => {
    if (!session.deadline) return;
    const t = setInterval(onTick, 1000);
    return () => clearInterval(t);
  }, [session.deadline]);
  const remaining = session.deadline ? Math.max(0, Math.ceil((session.deadline - now) / 1000)) : null;

  useQuizShortcuts({
    onChoice: (i) => {
      if (!q || answer === undefined || result) return;
      const core = coreFor(q);
      if (!core.applyChoice || i >= (core.choiceCount?.(q as never) ?? 0)) return;
      setAnswer(core.applyChoice(q as never, answer as never, i) as AnyAnswer);
    },
    onEnter: () => {
      if (isExam) return go(1);
      if (!result) return submit();
      if (session.index < total - 1) go(1);
    },
    onPrev: () => go(-1),
    onNext: () => go(1),
  });

  const btn = "rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40";
  const primary = "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-40";
  const last = session.index === total - 1;

  return (
    <div className="flex flex-col gap-5">
      {/* 상단: 제목·진행 */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold">{session.label}</span>
          <span className="text-muted">
            {isExam ? `시험 모드 · 답한 문제 ${answeredCount}/${total}` : `즉시 채점 · 채점 ${gradedCount}/${total}`}
            {remaining !== null && (
              <span className={remaining <= 60 ? " font-semibold text-foreground" : ""}>
                {" "}
                · <span aria-hidden>⏱</span> 남은 시간 {mmss(remaining)}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-semibold">
            {session.index + 1} / {total}
          </span>
          <div
            role="progressbar"
            aria-label="진행"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={session.index + 1}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"
          >
            <div className="h-full bg-primary transition-all" style={{ width: `${((session.index + 1) / total) * 100}%` }} />
          </div>
          {q && <BookmarkButton subjectId={item.subject} questionId={q.id} />}
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted">문제 번호로 이동</summary>
          <nav aria-label="문제 번호" className="mt-2 flex flex-wrap gap-1.5">
            {session.items.map((it, i) => {
              const r = session.results[it.id];
              const answered = session.answers[it.id] !== undefined;
              const mark = r ? (r.correct ? "✓" : "✗") : answered && isExam ? "•" : "";
              const label = r ? (r.correct ? "정답" : "오답") : answered && isExam ? "답함" : "안 풂";
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === session.index ? "step" : undefined}
                  aria-label={`${i + 1}번 (${label})`}
                  className={
                    "min-w-9 rounded border px-1.5 py-1 " +
                    (i === session.index ? "border-primary font-semibold" : "border-border text-muted hover:text-foreground")
                  }
                >
                  {i + 1}
                  {mark && <span aria-hidden> {mark}</span>}
                </button>
              );
            })}
          </nav>
        </details>
      </div>

      {q && answer !== undefined ? (
        <QuestionRenderer key={q.id} question={q} answer={answer} onAnswer={setAnswer} result={result} />
      ) : (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          이 문제를 불러올 수 없습니다(데이터가 바뀌었을 수 있음). 다음 문제로 넘어가세요.
        </p>
      )}

      {!isExam && result && q?.generator && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-3">
          <button type="button" onClick={addSimilar} disabled={generating} className={btn + " font-medium hover:border-primary"}>
            {generating ? "만드는 중…" : "↻ 비슷한 문제 새로 생성"}
          </button>
          <span className="text-xs text-muted">같은 유형을 숫자만 바꿔 새로 만들어 바로 다음에 넣습니다(정답은 시뮬레이터 계산, 기록은 따로).</span>
        </div>
      )}

      {/* 하단: 이동·제출 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <button type="button" onClick={() => go(-1)} disabled={session.index === 0} className={btn}>
          ← 이전
        </button>
        <div className="flex flex-wrap justify-end gap-2">
          {isExam ? (
            <>
              {!last && (
                <button type="button" onClick={() => go(1)} className={btn}>
                  다음 →
                </button>
              )}
              <button type="button" onClick={() => setConfirming(true)} className={primary}>
                답안 제출(채점)
              </button>
            </>
          ) : result ? (
            last ? (
              <button type="button" onClick={() => finish(session)} className={primary}>
                결과 보기
              </button>
            ) : (
              <button type="button" onClick={() => go(1)} className={primary}>
                다음 →
              </button>
            )
          ) : (
            <>
              <button type="button" onClick={submit} disabled={!complete} className={primary}>
                제출 (Enter)
              </button>
              {!last && (
                <button type="button" onClick={() => go(1)} className={btn}>
                  건너뛰기 →
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!isExam && gradedCount > 0 && !(result && last) && (
        <button type="button" onClick={() => finish(session)} className="self-end text-sm text-muted underline hover:text-foreground">
          여기까지 풀고 결과 보기
        </button>
      )}

      {confirming && (
        <div role="alertdialog" aria-labelledby="confirm-title" className="flex flex-col gap-3 rounded-lg border border-primary bg-surface p-4">
          <p id="confirm-title" className="text-sm font-semibold">
            답안을 제출할까요? 답한 문제 {answeredCount}/{total}
            {answeredCount < total && ` — 답하지 않은 ${total - answeredCount}문제는 미응답(오답)으로 처리됩니다`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={gradeAll} className={primary}>
              제출하고 채점
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={btn}>
              계속 풀기
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        단축키: 1~5 보기 선택 · Enter {isExam ? "다음" : "제출/다음"} · ←/→ 이전/다음 (입력칸에 커서가 있을 때는 꺼짐)
      </p>
    </div>
  );
}

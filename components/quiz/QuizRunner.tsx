"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { PracticeView } from "@/components/practice/PracticeView";
import { useQuizShortcuts } from "@/lib/hooks/useQuizShortcuts";
import type { GradeResult } from "@/lib/qtypes/base";
import { type AnyAnswer, coreFor, gradeQuestion, type Question } from "@/lib/qtypes/registry";
import { setScoreOf } from "@/lib/quiz/setScores";
import { type ExamView, gradeInSession, itemsToGrade, type QuizSession, saveSession, summarizeSession } from "@/lib/quiz/session";
import { makeSimilar } from "@/lib/quiz/similar";
import { getSubject } from "@/lib/subjects";
import { recordResult } from "@/lib/storage/recordsStore";
import { recordSetScore } from "@/lib/storage/setScoresStore";
import { ExamScreen } from "./ExamScreen";

/**
 * 문제 풀이. 화면은 기본 화면(PracticeView)과 시험 화면(ExamScreen) 둘이고 푸는 중에 답안을 그대로 둔 채 서로 바꿀 수 있다(session.view).
 * 채점 방식(session.mode)은 화면과 따로다. 즉시 채점: 문제마다 확인 → 정답/해설. 시험 모드: 끝까지 풀고 한 번에 채점.
 * 시험 화면에는 문제별 확인이 없으므로 어느 방식이든 제출하면 아직 채점하지 않은 답을 한 번에 채점한다.
 * 제한 시간(선택)이 끝나면 시험 모드는 자동 채점, 즉시 채점은 제출한 문제까지로 결과에 넘어간다(나머지는 미응답).
 * 판정 규칙(완전히 맞아야 정답, 부분 점수는 보조 표시)은 gradeQuestion·recordResult가 그대로 따른다.
 */
export function QuizRunner({ initial, questions }: { initial: QuizSession; questions: ReadonlyMap<string, Question> }) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
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
  const eclass = session.view === "eclass";
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
  const setView = (view: ExamView) => update({ ...session, view });
  const setAnswer = (a: AnyAnswer) => q && update({ ...session, answers: { ...session.answers, [q.id]: a } });

  const finish = (s: QuizSession) => {
    update({ ...s, finished: true });
    // 힌트관련 세트를 끝까지 다 풀었으면(미응답 없음) 회차 점수를 남긴다 — 과목 홈 시작 상자에 "N회 맞힌 수/전체"로 보인다
    const qs = new Map(s.items.flatMap((it) => (getQ(it.id) ? [[it.id, getQ(it.id)!] as const] : [])));
    const rec = setScoreOf(s, summarizeSession(s, qs));
    if (rec) recordSetScore(s.items[0].subject, rec.source, rec.score);
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

  /**
   * 한 번에 채점(시험 모드·시험 화면의 제출): 답한 문제를 채점·기록하고 결과로. 답하지 않은 문제는 미응답(오답으로 집계, 기록은 남기지 않음).
   * 즉시 채점으로 이미 확인한 문제는 다시 채점·기록하지 않는다(풀이 횟수가 두 번 세지지 않게)
   */
  const gradeAll = () => {
    const results: Record<string, GradeResult> = { ...session.results };
    for (const it of itemsToGrade(session)) {
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

  // 타이머: 1초마다 남은 시간 갱신, 0이 되면 시험 모드는 자동 채점·즉시 채점은 결과로
  const onTick = useEffectEvent(() => {
    setNow(Date.now());
    if (session.finished || !session.deadline || Date.now() < session.deadline) return;
    if (isExam || eclass) gradeAll();
    else finish(session);
  });
  // 시험 화면은 제한 시간이 없어도 경과 시간을 보이므로 1초마다 갱신한다
  useEffect(() => {
    if (!session.deadline && !eclass) return;
    const t = setInterval(onTick, 1000);
    return () => clearInterval(t);
  }, [session.deadline, eclass]);
  const remaining = session.deadline ? Math.max(0, Math.ceil((session.deadline - now) / 1000)) : null;

  useQuizShortcuts({
    onChoice: (i) => {
      if (!q || answer === undefined || result) return;
      const core = coreFor(q);
      if (!core.applyChoice || i >= (core.choiceCount?.(q as never) ?? 0)) return;
      setAnswer(core.applyChoice(q as never, answer as never, i) as AnyAnswer);
    },
    onEnter: () => {
      if (isExam || eclass) return go(1);
      if (!result) return submit();
      if (session.index < total - 1) go(1);
    },
    onPrev: () => go(-1),
    onNext: () => go(1),
  });

  if (eclass)
    return (
      <ExamScreen
        session={session}
        getQ={getQ}
        remaining={remaining}
        now={now}
        answeredCount={answeredCount}
        onAnswer={setAnswer}
        goTo={(i) => i >= 0 && i < total && goTo(i)}
        onSubmit={gradeAll}
        onSwitchView={() => setView("app")}
      />
    );

  return (
    <PracticeView
      session={session}
      q={q}
      answer={answer}
      result={result}
      complete={complete}
      answeredCount={answeredCount}
      gradedCount={gradedCount}
      remaining={remaining}
      generating={generating}
      setAnswer={setAnswer}
      submit={submit}
      go={go}
      goTo={goTo}
      finish={() => finish(session)}
      submitAll={gradeAll}
      addSimilar={addSimilar}
      onSwitchView={() => setView("eclass")}
    />
  );
}

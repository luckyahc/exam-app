"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getChapter, getSubject } from "@/lib/subjects";
import { isQType, type Question } from "@/lib/qtypes/registry";
import { loadChapter, loadQuestions, loadSubject } from "@/lib/quiz/loadQuestions";
import { filterQuestions, loadSession, newSession, type QuizSession, saveSession } from "@/lib/quiz/session";
import { subjectRecords } from "@/lib/storage/recordsStore";
import { QuizRunner } from "./QuizRunner";

type State =
  | { kind: "loading" }
  | { kind: "empty"; message: string; backHref: string }
  | { kind: "ready"; session: QuizSession; questions: Map<string, Question> };

/**
 * /quiz 진입: `?session=id`면 저장된 세션을 이어서 풀고, 아니면 쿼리(과목·챕터·필터)로 새 세션을 만든 뒤
 * 주소를 `?session=id`로 바꾼다(새로고침해도 같은 문제·순서가 유지되게).
 */
export function QuizEntry() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const key = params.toString();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessionId = params.get("session");
      if (sessionId) {
        const s = loadSession(sessionId);
        if (!s) return { kind: "empty", message: "이어서 풀 세션을 찾을 수 없습니다(다른 퀴즈를 시작했거나 저장소가 비워졌습니다).", backHref: "/" } as State;
        const gens = Object.fromEntries(
          s.items.map((it) => [it.id, subjectRecords(it.subject).wrong[it.id]?.gen]),
        );
        const questions = await loadQuestions(s.items, gens);
        return { kind: "ready", session: s, questions } as State;
      }

      const subjectId = params.get("subject") ?? "";
      const chapterId = params.get("chapter");
      const subject = getSubject(subjectId);
      const chapter = chapterId ? getChapter(subjectId, chapterId) : undefined;
      const backHref = chapter ? `/s/${subjectId}/chapter/${chapterId}` : subject ? `/s/${subjectId}` : "/";
      if (!subject || (chapterId && !chapter))
        return { kind: "empty", message: "과목 또는 챕터를 찾을 수 없습니다.", backHref: "/" } as State;

      const pool = chapter ? await loadChapter(subjectId, chapter.id) : await loadSubject(subjectId);
      const types = (params.get("types") ?? "").split(",").filter(isQType);
      const count = Number(params.get("count")) || null;
      const picked = filterQuestions(pool, {
        types,
        starOnly: params.get("star") === "1",
        topics: (params.get("topics") ?? "").split("|").filter(Boolean),
        difficulties: (params.get("diff") ?? "").split(",").map(Number).filter((d) => d === 1 || d === 2 || d === 3),
        count,
        shuffle: params.get("shuffle") === "1",
        seed: `${key}-${Date.now()}`,
      });
      if (picked.length === 0)
        return { kind: "empty", message: pool.length ? "조건에 맞는 문제가 없습니다." : "문제 준비 중입니다.", backHref } as State;

      const mode = params.get("mode") === "exam" ? "exam" : "instant";
      const star = params.get("star") === "1" ? " · ⭐ 시험 포인트" : "";
      const session = newSession(picked, {
        mode,
        timerSec: Number(params.get("timer")) || null,
        label: `${subject.shortName}${chapter ? ` · ${chapter.id.toUpperCase()} ${chapter.shortTitle}` : " 전체"}${star}`,
        backHref,
      });
      saveSession(session);
      router.replace(`/quiz?session=${session.id}`);
      return { kind: "ready", session, questions: new Map(picked.map((q) => [q.id, q])) } as State;
    })()
      .then((s) => !cancelled && setState(s))
      .catch(() => !cancelled && setState({ kind: "empty", message: "문제를 불러오지 못했습니다.", backHref: "/" }));
    return () => {
      cancelled = true;
    };
    // 쿼리가 바뀔 때만 다시 만든다(replace로 ?session=id가 되면 저장된 세션을 그대로 읽는다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (state.kind === "loading") return <p className="text-sm text-muted">문제를 불러오는 중…</p>;
  if (state.kind === "empty")
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-border bg-surface p-4 text-sm">{state.message}</p>
        <Link href={state.backHref} className="text-sm text-muted underline hover:text-foreground">
          돌아가기
        </Link>
      </div>
    );
  if (state.session.finished)
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-border bg-surface p-4 text-sm">이 퀴즈는 이미 채점을 마쳤습니다.</p>
        <div className="flex gap-3 text-sm">
          <Link href={`/result?session=${state.session.id}`} className="underline">
            결과 보기
          </Link>
          <Link href={state.session.backHref} className="text-muted underline hover:text-foreground">
            처음 화면으로
          </Link>
        </div>
      </div>
    );
  return <QuizRunner key={state.session.id} initial={state.session} questions={state.questions} />;
}

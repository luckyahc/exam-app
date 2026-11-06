"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichText } from "@/components/qtypes/ui";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button, ButtonLink } from "@/components/ui/Button";
import { List, ListRow } from "@/components/ui/ListRow";
import { getSubject } from "@/lib/subjects";
import { Marker } from "@/components/ui/Marker";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import {
  answerForReview,
  newSession,
  type QuizSession,
  saveSession,
  summarizeSession,
} from "@/lib/quiz/session";
import { Explanation, PracticeQuestion } from "./PracticeQuestion";

const pct = (t: { correct: number; total: number }) =>
  t.total ? `${Math.round((t.correct / t.total) * 100)}%` : "—";

/** 돌아갈 곳의 이름(세션의 backHref로) */
function backLabel(href: string) {
  if (/^\/s\/[^/]+\/chapter\//.test(href)) return "챕터로";
  if (href.startsWith("/s/")) return "과목으로";
  if (href.startsWith("/review")) return "복습으로";
  return "돌아가기";
}

/**
 * 결과 화면(연습 모드·시험 모드 공통). 맨 위 점수, 주 버튼 "틀린 문제 다시 풀기" 하나, 문제별 정오 목록(누르면 그 문제를 다시 본다).
 * 집계·다시 풀기 세션은 summarizeSession·newSession을 쓴다.
 */
export function PracticeResult({
  session,
  questions,
}: {
  session: QuizSession;
  questions: Map<string, Question>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const sum = summarizeSession(session, questions);
  const typeLabel = (t: string) => {
    const q = [...questions.values()].find((x) => x.type === t);
    return q ? coreFor(q).label : t;
  };

  const retryWrong = () => {
    const qs = sum.wrongIds.map((id) => questions.get(id)).filter((q): q is Question => !!q);
    const next = newSession(qs, {
      mode: "instant",
      label: "틀린 문제 다시 풀기",
      backHref: session.backHref,
    });
    saveSession(next);
    router.push(`/quiz?session=${next.id}`);
  };

  const extra = [
    sum.unanswered ? `미응답 ${sum.unanswered}` : "",
    sum.partialIds.length ? `부분 점수 ${sum.partialIds.length}` : "",
    sum.selfCheckIds.length ? `서술형 ${sum.selfCheckIds.length} 제외` : "",
  ].filter(Boolean);

  const openItem = open ? session.items.findIndex((it) => it.id === open) : -1;
  const openQ = open ? questions.get(open) : undefined;
  const openR = open ? session.results[open] : undefined;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1 pt-2">
        <p className="text-sm text-muted">
          {session.label}
          {session.mode === "exam" && " · 시험 모드"}
        </p>
        <h1 className="sr-only">결과</h1>
        <p className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">정답</span>
          <span className="font-mono text-5xl font-bold tabular-nums">{sum.correct}</span>
          <span className="font-mono text-2xl text-muted tabular-nums">/ {sum.total}</span>
          <span className="ml-auto font-mono text-lg font-semibold tabular-nums">{pct(sum)}</span>
        </p>
        {extra.length > 0 && <p className="text-sm text-muted">{extra.join(" · ")}</p>}
      </header>

      <div className="flex flex-col gap-2">
        {sum.wrongIds.length > 0 ? (
          <Button block onClick={retryWrong}>
            틀린 문제 다시 풀기 ({sum.wrongIds.length})
          </Button>
        ) : (
          <p className="text-base font-semibold">모두 맞혔습니다.</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <ButtonLink href={session.backHref} variant="secondary">
            {backLabel(session.backHref)}
          </ButtonLink>
          <ButtonLink
            href={`/review?subject=${sum.bySubject.length === 1 ? sum.bySubject[0].key : "all"}`}
            variant="secondary"
          >
            오답노트
          </ButtonLink>
          <ButtonLink href="/" variant="secondary">
            홈으로
          </ButtonLink>
        </div>
      </div>

      <section aria-labelledby="items-heading" className="flex flex-col gap-2">
        <h2 id="items-heading" className="font-display text-lg font-bold">
          문제별
        </h2>
        <List>
          {session.items.map((it, i) => {
            const q = questions.get(it.id);
            const r = session.results[it.id];
            const state = !r ? "미응답" : r.selfCheck ? "제출" : r.correct ? "정답" : "오답";
            return (
              <ListRow
                key={it.id}
                onClick={q ? () => setOpen(it.id) : undefined}
                title={
                  <span className="line-clamp-2 font-normal">
                    <span className="font-mono font-semibold">{i + 1}.</span>{" "}
                    {q ? <RichText text={q.prompt} /> : "문제를 찾을 수 없음"}
                  </span>
                }
                description={
                  q && (
                    <>
                      {q.exam && (
                        <>
                          <Marker>시험 포인트</Marker>{" "}
                        </>
                      )}
                      {q.topic}
                    </>
                  )
                }
                trailing={
                  <span
                    className={
                      state === "오답"
                        ? "font-semibold text-shu"
                        : state === "정답"
                          ? "text-sumi"
                          : undefined
                    }
                  >
                    {state}
                  </span>
                }
              />
            );
          })}
        </List>
      </section>

      <details className="group flex flex-col gap-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold [&::-webkit-details-marker]:hidden">
          {sum.bySubject.length > 1 ? "유형·토픽·과목별 정답률" : "유형·토픽별 정답률"}
        </summary>
        <div className="flex flex-col gap-4 pt-1">
          {[
            { title: "유형", rows: sum.byType, label: typeLabel },
            { title: "토픽", rows: sum.byTopic, label: (k: string) => k },
            ...(sum.bySubject.length > 1
              ? [{ title: "과목", rows: sum.bySubject, label: (k: string) => getSubject(k)?.name ?? k }]
              : []),
          ].map((g) => (
            <List key={g.title} aria-label={`${g.title}별`}>
              {g.rows.map((r) => (
                <ListRow
                  key={r.key}
                  title={<span className="font-normal">{g.label(r.key)}</span>}
                  trailing={`${r.correct}/${r.total}`}
                />
              ))}
            </List>
          ))}
        </div>
      </details>

      <BottomSheet open={open !== null} onClose={() => setOpen(null)} title={`${openItem + 1}번`}>
        {openQ &&
          (openR ? (
            <PracticeQuestion
              question={openQ}
              answer={answerForReview(session, openQ)}
              onAnswer={() => {}}
              result={openR}
              onEnter={() => {}}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-lg leading-relaxed">
                <RichText text={openQ.prompt} />
              </p>
              <p className="text-sm text-muted">답하지 않은 문제입니다.</p>
              <Explanation question={openQ} />
            </div>
          ))}
      </BottomSheet>
    </div>
  );
}

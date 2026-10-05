"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QuestionRenderer } from "@/components/qtypes/QuestionRenderer";
import { RichText } from "@/components/qtypes/ui";
import { coreFor, type Question } from "@/lib/qtypes/registry";
import { loadQuestions } from "@/lib/quiz/loadQuestions";
import { answerForReview, loadSession, newSession, type QuizSession, saveSession, summarizeSession, type Tally } from "@/lib/quiz/session";
import { subjectRecords } from "@/lib/storage/recordsStore";
import { getSubject } from "@/lib/subjects";

const pct = (t: { correct: number; total: number }) => (t.total ? `${Math.round((t.correct / t.total) * 100)}%` : "—");

function TallyTable({ title, rows, label }: { title: string; rows: Tally[]; label(key: string): string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="border-b border-border py-1 font-medium">항목</th>
            <th className="w-20 border-b border-border py-1 text-right font-medium">정답</th>
            <th className="w-16 border-b border-border py-1 text-right font-medium">정답률</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="break-words border-b border-border py-1.5 pr-2">{label(r.key)}</td>
              <td className="border-b border-border py-1.5 text-right">
                {r.correct}/{r.total}
              </td>
              <td className="border-b border-border py-1.5 text-right font-semibold">{pct(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** 결과 화면: 점수(완전히 맞은 문제 수), 유형·토픽·과목별 정답률, 틀린 문제 목록, 틀린 문제만 다시 풀기 */
export function ResultView() {
  const params = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<{ session: QuizSession; questions: Map<string, Question> } | null | "none">(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = loadSession(params.get("session"));
      if (!s) return "none" as const;
      const gens = Object.fromEntries(s.items.map((it) => [it.id, subjectRecords(it.subject).wrong[it.id]?.gen]));
      return { session: s, questions: await loadQuestions(s.items, gens) };
    })().then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (data === null) return <p className="text-sm text-muted">결과를 불러오는 중…</p>;
  if (data === "none")
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-border bg-surface p-4 text-sm">표시할 결과가 없습니다. 퀴즈를 먼저 풀어 주세요.</p>
        <Link href="/" className="text-sm underline">
          홈으로
        </Link>
      </div>
    );

  const { session, questions } = data;
  const sum = summarizeSession(session, questions);
  const typeLabel = (t: string) => {
    const q = [...questions.values()].find((x) => x.type === t);
    return q ? coreFor(q).label : t;
  };

  const retryWrong = () => {
    const qs = sum.wrongIds.map((id) => questions.get(id)).filter((q): q is Question => !!q);
    const next = newSession(qs, { mode: "instant", label: "틀린 문제 다시 풀기", backHref: session.backHref });
    saveSession(next);
    router.push(`/quiz?session=${next.id}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">
          {session.label} · {session.mode === "exam" ? "시험 모드" : "즉시 채점"}
        </p>
        <p className="text-3xl font-bold">
          {sum.correct} / {sum.total}
          <span className="ml-2 text-lg font-semibold text-muted">({pct(sum)})</span>
        </p>
        <p className="text-sm text-muted">
          완전히 맞은 문제만 정답으로 셉니다. 틀림 {sum.total - sum.correct - sum.unanswered}
          {sum.partialIds.length > 0 && ` (그중 부분 점수 ${sum.partialIds.length})`} · 미응답 {sum.unanswered}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sum.wrongIds.length > 0 && (
            <button type="button" onClick={retryWrong} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background">
              틀린 문제만 다시 풀기 ({sum.wrongIds.length})
            </button>
          )}
          <Link href={session.backHref} className="rounded-lg border border-border px-4 py-2 text-sm">
            처음 화면으로
          </Link>
          <Link href={`/review?subject=${sum.bySubject.length === 1 ? sum.bySubject[0].key : "all"}`} className="rounded-lg border border-border px-4 py-2 text-sm">
            오답노트
          </Link>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <TallyTable title="유형별 정답률" rows={sum.byType} label={typeLabel} />
        {sum.bySubject.length > 1 && (
          <TallyTable title="과목별 소계" rows={sum.bySubject} label={(k) => getSubject(k)?.name ?? k} />
        )}
      </div>
      <TallyTable title="토픽별 정답률" rows={sum.byTopic} label={(k) => k} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">틀린 문제 ({sum.wrongIds.length})</h2>
        {sum.wrongIds.length === 0 && <p className="text-sm text-muted">모두 맞혔습니다.</p>}
        <ol className="flex flex-col gap-2">
          {sum.wrongIds.map((id) => {
            const q = questions.get(id);
            const r = session.results[id];
            const n = session.items.findIndex((it) => it.id === id) + 1;
            const status = !r ? "미응답" : r.score > 0 ? `오답 · 부분 점수 ${Math.round(r.score * 100)}%` : "오답";
            return (
              <li key={id} className="rounded-lg border border-border bg-surface">
                <details>
                  <summary className="flex cursor-pointer flex-col gap-1 p-3 text-sm">
                    <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-semibold text-foreground">{n}번</span>
                      <span>
                        <span aria-hidden>✗ </span>
                        {status}
                      </span>
                      {q && <span>{q.topic}</span>}
                    </span>
                    {q ? <span className="line-clamp-2"><RichText text={q.prompt} /></span> : <span>문제를 찾을 수 없음</span>}
                  </summary>
                  {q && (
                    <div className="border-t border-border p-3">
                      {r ? (
                        <QuestionRenderer question={q} answer={answerForReview(session, q)} onAnswer={() => {}} result={r} />
                      ) : (
                        <div className="flex flex-col gap-2 text-sm">
                          <p className="text-muted">답하지 않은 문제입니다. 해설:</p>
                          <p>
                            <RichText text={q.explanation} />
                          </p>
                          <p className="text-xs text-muted">출처: {q.slideRef}</p>
                        </div>
                      )}
                    </div>
                  )}
                </details>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

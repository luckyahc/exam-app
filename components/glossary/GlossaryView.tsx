"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { GlossaryEntry } from "@/data/subjects/glossary";
import { SUBJECTS } from "@/data/subjects/registry";
import type { SubjectDef } from "@/data/subjects/types";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";
import type { Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import { newSession, saveSession } from "@/lib/quiz/session";

type Sort = "ko" | "chapter";

/** 용어와 관련된 문제: 그 용어의 단답형(연결·생성)을 앞에, 지문·보기에 용어(한국어·영어·약자)가 나오는 문제를 뒤에(최대 20개) */
export function relatedQuestions(e: GlossaryEntry, qs: readonly Question[]): Question[] {
  const own = qs.filter((q) => e.linkedQuestionIds?.includes(q.id) || (q.topic === "용어" && (q as { text?: string }).text?.startsWith(`${e.def} → `)));
  const needles = [e.ko, e.en, e.abbr].filter((s): s is string => !!s && normalizeText(s).length >= 2).map(normalizeText);
  const hay = (q: Question) => {
    const x = q as unknown as { text?: string; choices?: string[]; pairs?: { left: string; right: string }[]; items?: unknown[] };
    return normalizeText([q.prompt, x.text ?? "", ...(x.choices ?? []), ...(x.pairs ?? []).flatMap((p) => [p.left, p.right])].join(" "));
  };
  const mention = qs.filter((q) => !own.includes(q) && needles.some((n) => hay(q).includes(n)));
  return [...own, ...mention].slice(0, 20);
}

export function GlossaryView({ subjectId, chapters }: { subjectId: string; chapters: { id: string; shortTitle: string }[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState<readonly GlossaryEntry[] | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("");
  const [hintOnly, setHintOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("chapter");

  useEffect(() => {
    let alive = true;
    const s: SubjectDef | undefined = SUBJECTS.find((x) => x.id === subjectId);
    s?.loadGlossary?.().then((g) => alive && setEntries(g));
    loadSubject(subjectId).then((qs) => alive && setQuestions(qs));
    return () => {
      alive = false;
    };
  }, [subjectId]);

  const shown = useMemo(() => {
    const n = normalizeText(query);
    const order = new Map(chapters.map((c, i) => [c.id, i]));
    const list = (entries ?? []).filter(
      (e) =>
        (!chapter || e.chapter === chapter) &&
        (!hintOnly || !!e.hintIds?.length) &&
        (!n || [e.ko, e.en, e.abbr, e.abbrFull, ...(e.synonyms ?? [])].some((t) => t && normalizeText(t).includes(n))),
    );
    return sort === "ko"
      ? [...list].sort((a, b) => a.ko.localeCompare(b.ko, "ko"))
      : [...list].sort((a, b) => (order.get(a.chapter) ?? 0) - (order.get(b.chapter) ?? 0));
  }, [entries, query, chapter, hintOnly, sort, chapters]);

  const solve = (e: GlossaryEntry) => {
    const qs = relatedQuestions(e, questions);
    if (!qs.length) return;
    const s = newSession(qs, { mode: "instant", label: `용어 · ${e.ko}`, backHref: `/s/${subjectId}/glossary` });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  if (!entries) return <p className="text-sm text-muted">용어를 불러오는 중…</p>;

  const en = (e: GlossaryEntry) => [e.en, e.abbr ? `${e.abbr}${e.abbrFull ? ` (${e.abbrFull})` : ""}` : ""].filter(Boolean).join(" · ");
  const def = (e: GlossaryEntry) => e.def ?? "정의 없음(슬라이드에 이름만 등장)";
  const meta = (e: GlossaryEntry) =>
    `${e.slideRef}${e.basis === "교수님 필기" ? " · 교수님 필기" : ""}${e.seeAlso?.length ? ` · 참고 ${e.seeAlso.join(", ")}` : ""}`;
  const btn = (e: GlossaryEntry) => {
    const n = relatedQuestions(e, questions).length;
    return (
      <button
        type="button"
        disabled={n === 0}
        onClick={() => solve(e)}
        className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:border-primary disabled:opacity-40"
      >
        관련 문제 풀기{n ? ` (${n})` : ""}
      </button>
    );
  };
  const hint = (e: GlossaryEntry) =>
    e.hintIds?.length ? (
      <span className="text-xs text-muted" title={`시험 힌트 ${e.hintIds.join(", ")}`}>
        <span aria-hidden>⭐</span> 힌트 {e.hintIds.join(", ")}
      </span>
    ) : null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          검색(한국어·영어·약자)
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 스래싱, TLB, page fault"
            className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          챕터
          <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="min-w-0 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground">
            <option value="">전체</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id.toUpperCase()} {c.shortTitle}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          정렬
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-w-0 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground">
            <option value="chapter">챕터 순</option>
            <option value="ko">가나다 순</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hintOnly} onChange={(e) => setHintOnly(e.target.checked)} />
        <span aria-hidden>⭐</span> 시험 힌트 범위만
      </label>
      <p className="text-sm text-muted" aria-live="polite">
        {shown.length}개 용어
      </p>

      {/* 375px 등 좁은 화면: 카드 목록 */}
      <ul className="flex min-w-0 flex-col gap-2 sm:hidden">
        {shown.map((e) => (
          <li key={e.id} className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-border bg-surface p-3">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold break-words">{e.ko}</p>
                {en(e) && <p className="text-sm break-words text-muted">{en(e)}</p>}
              </div>
              {btn(e)}
            </div>
            <p className={`text-sm break-words ${e.def ? "" : "text-muted"}`}>{def(e)}</p>
            {e.synonyms?.length ? <p className="text-xs break-words text-muted">같은 뜻: {e.synonyms.join(", ")}</p> : null}
            <p className="flex flex-wrap gap-x-2 text-xs text-muted">
              <span>{meta(e)}</span>
              {hint(e)}
            </p>
          </li>
        ))}
      </ul>

      {/* 넓은 화면: 표 */}
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">용어</th>
              <th scope="col" className="px-3 py-2 font-medium">정의</th>
              <th scope="col" className="px-3 py-2 font-medium">근거</th>
              <th scope="col" className="px-3 py-2 font-medium">
                <span className="sr-only">관련 문제</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id} className="border-t border-border align-top">
                <td className="px-3 py-2">
                  <p className="font-semibold">{e.ko}</p>
                  {en(e) && <p className="text-xs text-muted">{en(e)}</p>}
                </td>
                <td className="px-3 py-2">
                  <p className={e.def ? "" : "text-muted"}>{def(e)}</p>
                  {e.synonyms?.length ? <p className="text-xs text-muted">같은 뜻: {e.synonyms.join(", ")}</p> : null}
                </td>
                <td className="px-3 py-2 text-xs text-muted">
                  <p>{meta(e)}</p>
                  {hint(e)}
                </td>
                <td className="px-3 py-2">{btn(e)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

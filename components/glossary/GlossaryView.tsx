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
import { Chip } from "@/components/ui/Chip";
import { List, ListRow } from "@/components/ui/ListRow";
import { Marker } from "@/components/ui/Marker";
import { TextInput } from "@/components/ui/TextInput";

type Sort = "ko" | "chapter";

/** 용어와 관련된 문제: 그 용어의 단답형(연결·생성)을 앞에, 지문·보기에 용어(한국어·영어·약자)가 나오는 문제를 뒤에(최대 20개) */
export function relatedQuestions(e: GlossaryEntry, qs: readonly Question[]): Question[] {
  const own = qs.filter(
    (q) =>
      e.linkedQuestionIds?.includes(q.id) ||
      (q.topic === "용어" && (q as { text?: string }).text?.startsWith(`${e.def} → `)),
  );
  const needles = [e.ko, e.en, e.abbr]
    .filter((s): s is string => !!s && normalizeText(s).length >= 2)
    .map(normalizeText);
  const hay = (q: Question) => {
    const x = q as unknown as {
      text?: string;
      choices?: string[];
      pairs?: { left: string; right: string }[];
      items?: unknown[];
    };
    return normalizeText(
      [
        q.prompt,
        x.text ?? "",
        ...(x.choices ?? []),
        ...(x.pairs ?? []).flatMap((p) => [p.left, p.right]),
      ].join(" "),
    );
  };
  const mention = qs.filter((q) => !own.includes(q) && needles.some((n) => hay(q).includes(n)));
  return [...own, ...mention].slice(0, 20);
}

export function GlossaryView({
  subjectId,
  chapters,
}: {
  subjectId: string;
  chapters: { id: string; shortTitle: string }[];
}) {
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
        (!n ||
          [e.ko, e.en, e.abbr, e.abbrFull, ...(e.synonyms ?? [])].some(
            (t) => t && normalizeText(t).includes(n),
          )),
    );
    return sort === "ko"
      ? [...list].sort((a, b) => a.ko.localeCompare(b.ko, "ko"))
      : [...list].sort((a, b) => (order.get(a.chapter) ?? 0) - (order.get(b.chapter) ?? 0));
  }, [entries, query, chapter, hintOnly, sort, chapters]);

  const solve = (e: GlossaryEntry) => {
    const qs = relatedQuestions(e, questions);
    if (!qs.length) return;
    const s = newSession(qs, {
      mode: "instant",
      label: `용어 · ${e.ko}`,
      backHref: `/s/${subjectId}?view=glossary`,
    });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  if (!entries) return <p className="text-sm text-muted">불러오는 중…</p>;

  const en = (e: GlossaryEntry) =>
    [e.en, e.abbr ? `${e.abbr}${e.abbrFull ? ` (${e.abbrFull})` : ""}` : ""]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <TextInput
        type="search"
        label="검색"
        hideLabel
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색: 스래싱, TLB, page fault"
      />
      <div role="group" aria-label="챕터" className="flex flex-wrap gap-2">
        <Chip selected={!chapter} onClick={() => setChapter("")}>
          전체
        </Chip>
        {chapters.map((c) => (
          <Chip
            key={c.id}
            selected={chapter === c.id}
            onClick={() => setChapter(chapter === c.id ? "" : c.id)}
          >
            {c.id.toUpperCase()}
          </Chip>
        ))}
      </div>
      <div role="group" aria-label="정렬·범위" className="flex flex-wrap gap-2">
        <Chip selected={sort === "chapter"} onClick={() => setSort("chapter")}>
          챕터 순
        </Chip>
        <Chip selected={sort === "ko"} onClick={() => setSort("ko")}>
          가나다 순
        </Chip>
        <Chip selected={hintOnly} onClick={() => setHintOnly((v) => !v)}>
          시험 힌트 범위만
        </Chip>
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        <span className="font-mono">{shown.length}</span>개
      </p>

      {/* 용어 한 줄: 이름·정의, 아래 근거. 관련 문제가 있으면 줄을 눌러 바로 푼다 */}
      <List aria-label="용어">
        {shown.map((e) => {
          const n = relatedQuestions(e, questions).length;
          return (
            <ListRow
              key={e.id}
              onClick={n ? () => solve(e) : undefined}
              title={
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="break-words">
                    {e.ko}
                    {en(e) && (
                      <span className="ml-1.5 text-sm font-normal text-muted">{en(e)}</span>
                    )}
                  </span>
                  <span
                    className={`text-base font-normal break-words ${e.def ? "" : "text-muted"}`}
                  >
                    {e.def ?? "정의 없음"}
                  </span>
                  {e.synonyms?.length ? (
                    <span className="text-sm font-normal text-muted">
                      같은 뜻: {e.synonyms.join(", ")}
                    </span>
                  ) : null}
                </span>
              }
              description={
                <>
                  {e.hintIds?.length ? (
                    <>
                      <Marker>시험 힌트 {e.hintIds.join(", ")}</Marker>{" "}
                    </>
                  ) : null}
                  {e.slideRef}
                  {e.basis === "교수님 필기" ? " · 교수님 필기" : ""}
                  {e.seeAlso?.length ? ` · 참고 ${e.seeAlso.join(", ")}` : ""}
                </>
              }
              trailing={n ? `${n}문제` : undefined}
            />
          );
        })}
      </List>
    </div>
  );
}

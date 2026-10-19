"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  categoriesOf,
  DS_FUNCTIONS,
  DS_LECTURES,
  type DsFunction,
  filterFunctions,
} from "@/lib/dsFunctions";
import type { Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import { MemorizeView } from "./MemorizeView";
import { newSession, saveSession } from "@/lib/quiz/session";

const TABS = ["", ...DS_LECTURES] as const;
const tabLabel = (t: string) => (t ? t.replace("lec", "Lec") : "전체");

/** 예시 코드(고정폭) + 준비 코드·실행 결과는 접었다 펴기 */
function Example({ f }: { f: DsFunction }) {
  const pre =
    "min-w-0 whitespace-pre-wrap break-words rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-xs leading-5";
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {f.setup && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer select-none">
            {f.lang === "sql"
              ? `준비 데이터: ${f.setup === "firstDB" ? "강의 [코드 5-2]~[코드 5-5]의 학생·과목·수강" : "빈 데이터베이스"}`
              : "준비 코드"}
          </summary>
          {f.lang === "python" && <pre className={pre + " mt-1"}>{f.setup}</pre>}
        </details>
      )}
      <pre className={pre}>
        <code>{f.example}</code>
      </pre>
      {f.exampleOutput !== null ? (
        <details className="text-xs">
          <summary className="cursor-pointer select-none text-muted">
            실행 결과{f.localRun ? " (맷플롯립 — 로컬 실행)" : ""}
          </summary>
          <pre className={pre + " mt-1"}>{f.exampleOutput}</pre>
        </details>
      ) : (
        <p className="text-xs text-muted">실행 결과 없음 — {f.noRun}</p>
      )}
    </div>
  );
}

export function FunctionsView({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tab, setTab] = useState<string>("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"view" | "memo">("view");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    loadSubject(subjectId).then((qs) => alive && setQuestions(qs));
    return () => {
      alive = false;
    };
  }, [subjectId]);

  const categories = useMemo(() => categoriesOf(DS_FUNCTIONS), []);
  const shown = useMemo(
    () => filterFunctions(DS_FUNCTIONS, { lecture: tab, category, query }),
    [tab, category, query],
  );
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

  const solve = (f: DsFunction) => {
    const qs = f.relatedQuestionIds.map((id) => byId.get(id)).filter((q): q is Question => !!q);
    if (!qs.length) return;
    const s = newSession(qs, {
      mode: "instant",
      label: `함수 · ${f.name}`,
      backHref: `/s/${subjectId}/functions`,
    });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next]);
    tabRefs.current[next]?.focus();
  };

  const chip = (on: boolean) =>
    "rounded-full border px-3 py-1.5 text-sm " +
    (on
      ? "border-primary bg-primary/10 font-semibold"
      : "border-border text-muted hover:text-foreground");
  const meta = (f: DsFunction) =>
    [
      tab && f.lecture !== tab ? `처음: ${tabLabel(f.lecture)}` : "",
      f.alsoIn?.length ? `다시 나옴: ${f.alsoIn.map(tabLabel).join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  const related = (f: DsFunction) => {
    const n = f.relatedQuestionIds.filter((id) => byId.has(id)).length;
    return n ? (
      <button
        type="button"
        onClick={() => solve(f)}
        className="self-start rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:border-primary"
      >
        관련 문항 풀기 ({n})
      </button>
    ) : null;
  };
  const head = (f: DsFunction) => (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="break-words font-mono text-sm font-semibold">{f.name}</span>
      <span className="break-words font-mono text-xs text-muted">{f.signature}</span>
      <span className="text-xs text-muted">
        {f.category}
        {meta(f) ? ` · ${meta(f)}` : ""}
      </span>
    </div>
  );
  const pitfall = (f: DsFunction) =>
    f.pitfall ? <p className="text-xs text-muted">주의: {f.pitfall}</p> : null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex gap-2" role="group" aria-label="모드">
        {(["view", "memo"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={chip(mode === m) + " px-4"}
          >
            {m === "view" ? "보기" : "암기"}
          </button>
        ))}
      </div>

      <div role="tablist" aria-label="장" className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button
            key={t || "all"}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls="function-list"
            tabIndex={tab === t ? 0 : -1}
            onKeyDown={(e) => onTabKey(e, i)}
            onClick={() => setTab(t)}
            className={chip(tab === t)}
          >
            {tabLabel(t)}{" "}
            <span className="tabular-nums">
              {filterFunctions(DS_FUNCTIONS, { lecture: t }).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          이름 검색
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: groupby, append, SELECT"
            className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          카테고리
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-w-0 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value="">전체</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === "memo" ? (
        <div id="function-list" role="tabpanel">
          <MemorizeView
            subjectId={subjectId}
            list={shown}
            lecture={tab}
            meta={meta}
            related={related}
          />
        </div>
      ) : (
        <>
          <p className="text-xs text-muted" aria-live="polite">
            {shown.length}개 · 강의자료에 없는 설명은 끝에 (보충) · 실행 결과는 검증 엔진으로 실제로
            실행한 출력
          </p>

          <div id="function-list" role="tabpanel">
            {/* 넓은 화면: 표 */}
            <table className="hidden w-full table-fixed border-collapse text-sm md:table">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="w-[22%] py-2 pr-3 font-medium">함수</th>
                  <th className="w-[24%] py-2 pr-3 font-medium">설명</th>
                  <th className="w-[18%] py-2 pr-3 font-medium">쓰임</th>
                  <th className="py-2 font-medium">예시</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((f) => (
                  <tr key={f.id} className="border-b border-border align-top">
                    <td className="py-3 pr-3">{head(f)}</td>
                    <td className="py-3 pr-3">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <p className="break-words">{f.description}</p>
                        {pitfall(f)}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <p className="break-words">{f.usage}</p>
                        {related(f)}
                      </div>
                    </td>
                    <td className="py-3">
                      <Example f={f} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 좁은 화면(폰): 카드 */}
            <ul className="flex flex-col gap-3 md:hidden">
              {shown.map((f) => (
                <li
                  key={f.id}
                  className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3"
                >
                  {head(f)}
                  <p className="break-words text-sm">{f.description}</p>
                  <p className="break-words text-sm">
                    <span className="text-muted">쓰임: </span>
                    {f.usage}
                  </p>
                  {pitfall(f)}
                  <Example f={f} />
                  {related(f)}
                </li>
              ))}
            </ul>

            {shown.length === 0 && (
              <p className="py-6 text-sm text-muted">조건에 맞는 함수가 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

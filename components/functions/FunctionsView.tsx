"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { List, ListRow } from "@/components/ui/ListRow";
import { SegmentedControl, segmentPanelProps } from "@/components/ui/SegmentedControl";
import { TextInput } from "@/components/ui/TextInput";
import {
  categoriesOf,
  DS_FUNCTIONS,
  DS_LECTURES,
  type DsFunction,
  filterFunctions,
} from "@/lib/dsFunctions";
import type { Question } from "@/lib/qtypes/registry";
import { loadSubject } from "@/lib/quiz/loadQuestions";
import { newSession, saveSession } from "@/lib/quiz/session";
import { codePre } from "./codePre";
import { MemorizeView } from "./MemorizeView";

const TABS = ["", ...DS_LECTURES] as const;
const tabLabel = (t: string) => (t ? t.replace("lec", "Lec").replace(/b$/, " 후반") : "전체");

/** 예시 코드(고정폭) + 준비 코드·실행 결과는 접었다 펴기 */
function Example({ f }: { f: DsFunction }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {f.setup && (
        <details className="text-sm text-muted">
          <summary className="flex min-h-11 cursor-pointer items-center select-none">
            {f.lang === "sql"
              ? `준비 데이터: ${f.setup === "firstDB" ? "강의 [코드 5-2]~[코드 5-5]의 학생·과목·수강" : "빈 데이터베이스"}`
              : "준비 코드"}
          </summary>
          {f.lang === "python" && <pre className={codePre}>{f.setup}</pre>}
        </details>
      )}
      <pre className={codePre}>
        <code>{f.example}</code>
      </pre>
      {f.exampleOutput !== null ? (
        <details className="text-sm">
          <summary className="flex min-h-11 cursor-pointer items-center text-muted select-none">
            실행 결과{f.localRun ? " (맷플롯립 — 로컬 실행)" : ""}
          </summary>
          <pre className={codePre}>{f.exampleOutput}</pre>
        </details>
      ) : (
        <p className="text-sm text-muted">실행 결과 없음 — {f.noRun}</p>
      )}
    </div>
  );
}

/**
 * 데이터과학 함수 정리. 보기: 함수 한 줄씩(누르면 설명·쓰임·예시), 암기: MemorizeView.
 * 장·카테고리·검색 필터와 관련 문항 풀기는 이전과 같은 함수(filterFunctions·newSession)를 쓴다.
 */
export function FunctionsView({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tab, setTab] = useState<string>("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"view" | "memo">("view");
  const [open, setOpen] = useState<DsFunction | null>(null);

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
      backHref: `/s/${subjectId}?view=functions`,
    });
    saveSession(s);
    router.push(`/quiz?session=${s.id}`);
  };

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
      <Button variant="secondary" onClick={() => solve(f)} className="self-start">
        관련 문항 풀기 ({n})
      </Button>
    ) : null;
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SegmentedControl
        label="모드"
        idPrefix="functions"
        value={mode}
        onChange={setMode}
        items={[
          { value: "view", label: "보기" },
          { value: "memo", label: "암기" },
        ]}
      />

      <TextInput
        type="search"
        label="이름 검색"
        hideLabel
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색: groupby, append, SELECT"
      />
      <div role="group" aria-label="장" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Chip
            key={t || "all"}
            selected={tab === t}
            count={filterFunctions(DS_FUNCTIONS, { lecture: t }).length}
            onClick={() => setTab(t)}
          >
            {tabLabel(t)}
          </Chip>
        ))}
      </div>
      <div role="group" aria-label="카테고리" className="flex flex-wrap gap-2">
        <Chip selected={!category} onClick={() => setCategory("")}>
          모든 카테고리
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c}
            selected={category === c}
            onClick={() => setCategory(category === c ? "" : c)}
          >
            {c}
          </Chip>
        ))}
      </div>

      <div {...segmentPanelProps("functions", mode)} className="flex min-w-0 flex-col gap-3">
        {mode === "memo" ? (
          <MemorizeView
            subjectId={subjectId}
            list={shown}
            lecture={tab}
            meta={meta}
            related={related}
          />
        ) : (
          <>
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-mono">{shown.length}</span>개 · (보충)은 강의자료에 없는 설명
            </p>
            {shown.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">조건에 맞는 함수가 없습니다.</p>
            ) : (
              <List aria-label="함수">
                {shown.map((f) => (
                  <ListRow
                    key={f.id}
                    onClick={() => setOpen(f)}
                    title={
                      <span className="flex min-w-0 flex-col">
                        <span className="font-mono break-words">{f.name}</span>
                        <span className="text-sm font-normal break-words">{f.description}</span>
                      </span>
                    }
                    description={[f.category, meta(f)].filter(Boolean).join(" · ")}
                  />
                ))}
              </List>
            )}
          </>
        )}
      </div>

      <BottomSheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""}>
        {open && (
          <div className="flex min-w-0 flex-col gap-4 pt-1">
            <p className="font-mono text-sm break-words text-muted">{open.signature}</p>
            <p className="break-words">{open.description}</p>
            <p className="break-words">
              <span className="text-muted">쓰임 </span>
              {open.usage}
            </p>
            {open.pitfall && <p className="text-sm break-words text-muted">주의: {open.pitfall}</p>}
            <Example f={open} />
            {related(open)}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

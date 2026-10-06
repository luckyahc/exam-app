"use client";

import { useEffect, useState } from "react";
import { getEngine, getManifest, peekEngine } from "@/lib/engine/browser";
import { executeCodeWrite, type EngineManifest } from "@/lib/engine/codeWriteRun";
import type { CodeWriteQ, RunSide } from "@/lib/qtypes/codeWrite";
import { runIsCurrent } from "@/lib/qtypes/codeWrite";
import { CodeBlock } from "./CodeBlock";
import { CodeEditor } from "./CodeEditor";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { Mark } from "./ui";

const mb = (n: number) => `${(n / 1e6).toFixed(1)} MB`;

type EngineState =
  | { state: "idle" }
  | { state: "loading"; stage: string }
  | { state: "ready"; ms: number | null }
  | { state: "failed"; message: string };

const needsPandas = (q: CodeWriteQ) => q.language === "python" && !!q.python?.packages?.includes("pandas");

/** 엔진 준비: Python 기본(+openpyxl)은 화면을 열 때, 넘파이는 필요할 때 함께, 판다스는 버튼을 눌렀을 때만(결정 7) */
function useEngine(q: CodeWriteQ) {
  const [st, setSt] = useState<EngineState>({ state: "idle" });
  const [manifest, setManifest] = useState<EngineManifest | null>(null);
  const packages = q.python?.packages ?? [];

  const prepare = async () => {
    try {
      const m = await getManifest();
      setManifest(m);
      if (q.language === "sql") return setSt({ state: "ready", ms: null });
      setSt({ state: "loading", stage: "실행 엔진 준비 중" });
      const r = await getEngine(m).preparePython(m.pyodide.base, m.openpyxlWheels, packages, (stage) => setSt({ state: "loading", stage }));
      setSt(r.ok ? { state: "ready", ms: r.ms } : { state: "failed", message: r.message });
    } catch (e) {
      setSt({ state: "failed", message: String((e as Error)?.message ?? e) });
    }
  };

  useEffect(() => {
    let alive = true;
    getManifest()
      .then((m) => alive && setManifest(m))
      .catch((e) => alive && setSt({ state: "failed", message: String((e as Error)?.message ?? e) }));
    const eng = peekEngine();
    // 판다스 문제는 이미 불러온 경우에만 자동 준비, 아니면 버튼을 기다린다(준비는 다음 틱에 시작 — 상태 갱신은 비동기로)
    const t = !needsPandas(q) || eng?.loaded.packages.has("pandas") ? setTimeout(() => void prepare(), 0) : undefined;
    return () => {
      alive = false;
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  return { st, setSt, manifest, prepare };
}

function Output({ side, title }: { side: RunSide | undefined; title: string }) {
  if (!side) return null;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-semibold text-muted">{title}</span>
      {side.error && (
        <pre className="overflow-x-auto rounded-lg border border-incorrect bg-surface px-3 py-2 font-mono text-xs whitespace-pre-wrap text-incorrect">{side.error}</pre>
      )}
      {side.stdout !== undefined && (
        <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs leading-5 whitespace-pre text-foreground">
          {side.stdout === "" ? <span className="text-muted">(출력 없음)</span> : side.stdout}
          {side.truncated && <span className="text-muted">{"\n"}… 출력이 너무 길어 잘랐습니다</span>}
        </pre>
      )}
      {side.table !== undefined && <ResultTable table={side.table} />}
      {side.tables &&
        Object.entries(side.tables).map(([name, t]) => (
          <div key={name} className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs text-muted">테이블 {name}</span>
            <ResultTable table={t} />
          </div>
        ))}
    </div>
  );
}

function ResultTable({ table }: { table: { columns: string[]; rows: unknown[][] } | null | undefined }) {
  if (!table) return <p className="text-xs text-muted">(결과 표 없음)</p>;
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-border">
      <table className="w-full min-w-max text-xs">
        <thead className="bg-surface text-left text-muted">
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className="px-2 py-1 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {table.rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((v, j) => (
                <td key={j} className="px-2 py-1">
                  {v === null ? <span className="text-muted">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-2 py-1 text-xs text-muted">{table.rows.length}행</p>
    </div>
  );
}

function Input({ question: q, answer, onChange, disabled }: InputProps<"code-write">) {
  const { st, manifest, prepare } = useEngine(q);
  const [running, setRunning] = useState(false);
  const run = answer.run;
  const pandasWaiting = needsPandas(q) && st.state === "idle";

  const execute = async () => {
    if (!manifest || running) return;
    setRunning(true);
    try {
      const r = await executeCodeWrite(getEngine(manifest), manifest, q, answer.source);
      onChange({ source: answer.source, run: r });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted">
        코드를 작성하고 <b>실행</b>한 뒤 <b>제출</b>하세요. 실행 결과가 모범 답안과 같아야 정답입니다(부분 점수 없음, 시간 제한 5초).
      </p>

      {pandasWaiting && manifest && (
        <div className="flex flex-col gap-2 rounded-lg border border-primary/60 bg-primary/5 p-3 text-sm">
          <p>
            이 문제는 <b>판다스</b>가 필요합니다. 엔진을 불러오기 전에는 실행·제출할 수 없습니다(건너뛰기는 할 수 있어요).
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void prepare()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background">
              실행 엔진 불러오기
            </button>
            <span className="text-xs text-muted">
              약 {mb(manifest.bytes.numpy + manifest.bytes.pandas)} 추가(처음 한 번 내려받고 이후 캐시) · 예상 시간 데스크톱 15~25초 · 휴대폰 30~60초
            </span>
          </div>
        </div>
      )}

      {st.state === "loading" && (
        <p role="status" className="text-sm text-muted">
          <span aria-hidden>⏳ </span>
          {st.stage}… (처음 한 번은 엔진 파일을 내려받습니다)
        </p>
      )}

      {st.state === "failed" && (
        <div role="alert" className="flex flex-col gap-2 rounded-lg border border-incorrect p-3 text-sm">
          <p className="font-semibold text-incorrect">채점할 수 없음 — 실행 엔진을 불러오지 못했습니다</p>
          <p className="text-xs text-muted">{st.message} · 이 문제는 기록에 남지 않습니다.</p>
          <details>
            <summary className="cursor-pointer text-sm font-medium">모범 답안 보기</summary>
            <CodeBlock code={q.solution} language={q.language} />
          </details>
        </div>
      )}

      <CodeEditor value={answer.source} onChange={(v) => onChange({ source: v, run })} language={q.language} disabled={disabled} label="코드 입력" />

      {!disabled && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void execute()}
            disabled={running || st.state !== "ready" || !answer.source.trim()}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40"
          >
            {running ? "실행 중…" : "▶ 실행"}
          </button>
          <span className="text-xs text-muted" aria-live="polite">
            {st.state === "ready" && st.ms !== null && !run && `엔진 준비 완료 (${(st.ms / 1000).toFixed(1)}초)`}
            {run && !runIsCurrent(answer) && run.status !== "unavailable" && "코드를 바꿨습니다 — 다시 실행해야 제출할 수 있어요"}
            {run && runIsCurrent(answer) && "실행 완료 — 제출하면 채점합니다"}
          </span>
        </div>
      )}

      {run && run.status === "unavailable" && (
        <div role="alert" className="flex flex-col gap-2 rounded-lg border border-incorrect p-3 text-sm">
          <p className="font-semibold text-incorrect">채점할 수 없음</p>
          <p className="text-xs text-muted">{run.reason} · 이 문제는 기록에 남지 않습니다.</p>
          <details>
            <summary className="cursor-pointer text-sm font-medium">모범 답안 보기</summary>
            <CodeBlock code={q.solution} language={q.language} />
          </details>
        </div>
      )}
      {run && run.status === "timeout" && !disabled && <p className="text-sm text-incorrect">{run.reason}</p>}
      {run && run.status === "done" && !disabled && <Output side={run.mine} title="내 실행 결과" />}
    </div>
  );
}

function Review({ question: q, result }: ReviewProps<"code-write">) {
  const run = result.detail;
  return (
    <div className="flex flex-col gap-3">
      {run && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Mark ok={result.correct} okText="결과 일치" noText="결과 불일치" />
            {run.reason && <span className="text-incorrect">{run.reason}</span>}
            {run.ms !== undefined && <span className="text-xs text-muted">실행 {Math.round(run.ms)}ms</span>}
          </div>
          {!result.correct && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Output side={run.mine ?? { error: run.reason ?? "실행 결과 없음" }} title="내 결과" />
              <Output side={run.expected} title="기대 결과(모범 답안 실행)" />
            </div>
          )}
          {run.quotesFixed && (
            <p className="text-xs text-muted">
              <span aria-hidden>ⓘ </span>굽은 따옴표(‘ ’ “ ”)를 곧은 따옴표(&apos; &quot;)로 바꿔 실행했습니다.
            </p>
          )}
        </>
      )}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">모범 답안</span>
        <CodeBlock code={q.solution} language={q.language} />
      </div>
    </div>
  );
}

export const CodeWriteUI: QTypeUI<"code-write"> = { Input, Review };

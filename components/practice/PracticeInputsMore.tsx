"use client";

import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { CodeBlock } from "@/components/qtypes/CodeBlock";
import { CodeEditor } from "@/components/qtypes/CodeEditor";
import { FigureSvg } from "@/components/qtypes/Graph";
import { RichText } from "@/components/qtypes/ui";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ChoiceRow } from "@/components/ui/ChoiceRow";
import { TextInput } from "@/components/ui/TextInput";
import { cn } from "@/lib/cn";
import { getEngine, getManifest, peekEngine } from "@/lib/engine/browser";
import { type EngineManifest, executeCodeWrite } from "@/lib/engine/codeWriteRun";
import { splitBlankText } from "@/lib/qtypes/blank";
import { parseNumber } from "@/lib/qtypes/calc";
import { normalizeCodeInput } from "@/lib/qtypes/codeBlank";
import {
  type CodeWriteQ,
  type CodeWriteRun,
  type RunSide,
  runIsCurrent,
} from "@/lib/qtypes/codeWrite";
import { cellKey } from "@/lib/qtypes/trace";
import type { PracticeInputProps } from "./PracticeInputs";

/**
 * 연습 모드 전용 입력 — 순서 배치·분류·계산·표 채우기·그래프·코드 빈칸·코드 작성·서술형(디자인 개편 7-1).
 * 시험 화면이 기존 입력 부품(components/qtypes/*)을 그대로 빌려 쓰므로 그 파일들은 고치지 않고 여기서 따로 그린다.
 * 채점은 하지 않는다 — QuizRunner가 gradeQuestion으로 만든 result를 받아 입력 자리에 정답/오답을 표시만 한다.
 */

/** 맞음/틀림 한 줄(아이콘 + 글자). 틀리면 정답을 함께 */
function GradeNote({ ok, answer }: { ok: boolean; answer?: ReactNode }) {
  return ok ? (
    <p className="flex items-center gap-1 text-sm font-semibold text-ok">
      <Check aria-hidden className="size-4" strokeWidth={2.5} />
      정답
    </p>
  ) : (
    <p className="text-sm">
      <span className="font-semibold text-shu">오답</span>
      {answer != null && (
        <>
          <span className="text-muted"> · 정답 </span>
          <span className="font-semibold">{answer}</span>
        </>
      )}
    </p>
  );
}

/** 칸 하나의 맞음/틀림 아이콘(스크린리더에는 글자로) */
function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex shrink-0 text-ok">
      <Check aria-hidden className="size-5" strokeWidth={2.5} />
      <span className="sr-only">맞음</span>
    </span>
  ) : (
    <span className="inline-flex shrink-0 text-shu">
      <X aria-hidden className="size-5" strokeWidth={2.5} />
      <span className="sr-only">틀림</span>
    </span>
  );
}

// ------------------------------------------------------------------ 순서 배치

function move(list: number[], from: number, to: number): number[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** 위·아래 버튼(탭, 44px)으로 옮긴다. 데스크톱에서는 끌어다 놓기도 된다(휴대폰 브라우저는 HTML 끌어다 놓기를 지원하지 않는다) */
function Order({ question, answer, onChange, result }: PracticeInputProps<"order">) {
  const [dragging, setDragging] = useState<number | null>(null);
  const detail = result?.detail as boolean[] | undefined;
  return (
    <div className="flex flex-col gap-4">
      <ol aria-label="순서 (위가 먼저)" className="flex flex-col gap-2">
        {answer.map((itemIndex, pos) => (
          <li
            key={itemIndex}
            draggable={!result}
            onDragStart={() => setDragging(pos)}
            onDragEnd={() => setDragging(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragging !== null && dragging !== pos) onChange(move(answer, dragging, pos));
              setDragging(null);
            }}
            className={cn(
              "flex min-h-12 items-center gap-2 border-[1.5px] bg-paper py-1 pr-1 pl-3",
              detail ? (detail[pos] ? "border-ok" : "border-shu") : "border-sumi",
              dragging === pos && "opacity-50",
            )}
          >
            <span className="w-5 shrink-0 text-center font-mono font-semibold">{pos + 1}</span>
            <span className="min-w-0 flex-1 py-2">
              <RichText text={question.items[itemIndex]} />
            </span>
            {detail ? (
              <span className="px-3">
                <Mark ok={detail[pos]} />
              </span>
            ) : (
              <span className="flex shrink-0">
                <button
                  type="button"
                  aria-label={`${pos + 1}번째 항목을 위로`}
                  disabled={pos === 0}
                  onClick={() => onChange(move(answer, pos, pos - 1))}
                  className="inline-flex size-11 items-center justify-center disabled:opacity-30"
                >
                  <ChevronUp aria-hidden className="size-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label={`${pos + 1}번째 항목을 아래로`}
                  disabled={pos === answer.length - 1}
                  onClick={() => onChange(move(answer, pos, pos + 1))}
                  className="inline-flex size-11 items-center justify-center disabled:opacity-30"
                >
                  <ChevronDown aria-hidden className="size-5" strokeWidth={2} />
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {result && !result.correct && (
        <section aria-label="정답 순서" className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">정답 순서</h3>
          <ol className="flex flex-col gap-1.5 bg-paper-deep p-3">
            {question.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 shrink-0 text-center font-mono font-semibold">{i + 1}</span>
                <span className="min-w-0">
                  <RichText text={it} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ 분류

/** 항목마다 분류를 탭으로 고른다(끌어다 놓기 없음) */
function Classify({ question, answer, onChange, result }: PracticeInputProps<"classify">) {
  const detail = result?.detail as boolean[] | undefined;
  return (
    <div className="flex flex-col gap-5">
      {question.items.map((it, i) => (
        <div
          key={it.label}
          role="group"
          aria-label={`${it.label}의 분류`}
          className="flex flex-col gap-2"
        >
          <p className="font-semibold">
            <RichText text={it.label} />
          </p>
          <div className="flex flex-wrap gap-2">
            {question.buckets.map((b) => (
              <Chip
                key={b}
                selected={answer[i] === b}
                aria-disabled={!!result || undefined}
                onClick={
                  result ? undefined : () => onChange(answer.map((x, j) => (j === i ? b : x)))
                }
              >
                {b}
              </Chip>
            ))}
          </div>
          {detail && <GradeNote ok={detail[i]} answer={it.bucket} />}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ 계산

/** 34881 → "34,881" (소수는 그대로) */
const num = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 10 });
/** 허용 오차: 절대(±0.005), 상대(±0.1%), 둘 다면 함께 */
const toleranceText = (q: { tolerance: number; relTolerance?: number }) => {
  const parts = [
    q.tolerance > 0 ? `±${q.tolerance}` : "",
    q.relTolerance ? `±${+(q.relTolerance * 100).toPrecision(3)}%` : "",
  ].filter(Boolean);
  return parts.length ? ` (${parts.join(" 또는 ")})` : "";
};

function Calc({ question, answer, onChange, result, onEnter }: PracticeInputProps<"calc">) {
  const invalid = answer.trim() !== "" && parseNumber(answer) === null;
  const unit = question.unit ? ` ${question.unit}` : "";
  return (
    <div className="flex flex-col gap-3">
      <TextInput
        label={`답${question.unit ? ` (${question.unit})` : ""}`}
        inputMode="decimal"
        value={answer}
        readOnly={!!result}
        onChange={(e) => onChange(e.target.value)}
        onEnter={onEnter}
        status={result ? (result.correct ? "correct" : "incorrect") : undefined}
        answer={`${num(question.answer)}${unit}${toleranceText(question)}`}
      />
      {invalid && !result && (
        <p className="text-sm text-muted">숫자로 입력하세요 (예: 1.1, 34,881, 3e8, 3×10^8)</p>
      )}
      {result && question.steps && (
        <ol className="list-decimal space-y-1 bg-paper-deep py-3 pr-3 pl-8 font-mono text-sm">
          {question.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ 표 채우기

const cellField =
  "h-11 w-full min-w-0 border-[1.5px] border-sumi bg-paper px-2 text-base text-sumi focus:outline-2 focus:-outline-offset-2 focus:outline-sumi";

/**
 * 좁은 화면: 열 하나를 묶음 하나로 세로로 쌓는다(가로 스크롤 없음). 넓은 화면(sm 이상): 표.
 * 같은 칸을 두 곳에 그리지만 한쪽은 display:none이라 화면·보조기기에는 하나만 보인다.
 */
function Trace({ question, answer, onChange, result }: PracticeInputProps<"trace">) {
  const detail = result?.detail as Record<string, boolean> | undefined;
  const set = (key: string, v: string) => onChange({ ...answer, [key]: v });
  const cell = (i: number, j: number) => {
    const c = question.rows[i].cells[j];
    if (!c.blank) return <span>{c.value || "·"}</span>;
    const key = cellKey(i, j);
    if (detail)
      return detail[key] ? (
        <span className="inline-flex items-center gap-0.5 font-semibold text-ok">
          <Check aria-hidden className="size-4" strokeWidth={2.5} />
          {c.value}
          <span className="sr-only"> 정답</span>
        </span>
      ) : (
        <span className="inline-flex flex-col leading-tight">
          <span className="inline-flex items-center gap-0.5 font-semibold text-shu">
            <X aria-hidden className="size-4" strokeWidth={2.5} />
            {c.value}
            <span className="sr-only"> 오답, 정답은 {c.value}</span>
          </span>
          <span className="text-xs text-muted line-through">{answer[key] || "빈칸"}</span>
        </span>
      );
    const label = `${question.rows[i].label}, ${question.columns[j]} 열`;
    return c.options ? (
      <select
        aria-label={label}
        value={answer[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        className={cn(cellField, "appearance-none text-center")}
      >
        <option value="">?</option>
        {c.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    ) : (
      <input
        aria-label={label}
        value={answer[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn(cellField, "text-center")}
      />
    );
  };
  return (
    <>
      <ol aria-label="표 (열별)" className="flex flex-col gap-4 sm:hidden">
        {question.columns.map((c, j) => (
          <li key={j} className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              <span className="font-mono">{j + 1}</span> · {c}
            </p>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 bg-paper-deep p-3 text-base">
              {question.rows.map((r, i) => (
                <div key={i} className="contents">
                  <dt className="text-sm text-muted">{r.label}</dt>
                  <dd className="min-w-0">{cell(i, j)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="border-b-[1.5px] border-sumi px-2 py-2" />
              {question.columns.map((c, j) => (
                <th
                  key={j}
                  scope="col"
                  className="border-b-[1.5px] border-sumi px-2 py-2 font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.rows.map((r, i) => (
              <tr key={i} className="border-b border-sumi/15">
                <th scope="row" className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">
                  {r.label}
                </th>
                {r.cells.map((_, j) => (
                  <td key={j} className="min-w-16 px-1 py-1.5">
                    {cell(i, j)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ 그래프

const letter = (i: number) => String.fromCharCode(65 + i);

/** 그래프 보기. 그림이 먹색이라 고른 보기는 칸 전체를 반전하지 않고 머리 띠만 반전한다(반전하면 그림이 안 보인다) */
function Graph({ question, answer, onChange, result }: PracticeInputProps<"graph">) {
  return (
    <div role="radiogroup" aria-label="그래프 보기" className="grid gap-2 sm:grid-cols-2">
      {question.options.map((o, i) => {
        const selected = answer === o.key;
        const state = result
          ? o.key === question.answerKey
            ? "correct"
            : selected
              ? "incorrect"
              : "neutral"
          : null;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={!!result || undefined}
            onClick={result ? undefined : () => onChange(o.key)}
            className={cn(
              "flex flex-col border-[1.5px] bg-paper text-left",
              state === "correct"
                ? "border-ok"
                : state === "incorrect"
                  ? "border-shu"
                  : state === "neutral"
                    ? "border-sumi/15"
                    : "border-sumi",
            )}
          >
            <span
              className={cn(
                "flex min-h-11 items-center justify-between gap-2 px-3 text-sm font-semibold",
                !result && selected && "bg-sumi text-paper",
              )}
            >
              <span>
                그래프 {letter(i)}
                {result && <span className="font-normal">: {o.label}</span>}
              </span>
              {state === "correct" && (
                <span className="flex items-center gap-1 text-ok">
                  <Check aria-hidden className="size-4" strokeWidth={2.5} />
                  정답
                </span>
              )}
              {state === "incorrect" && (
                <span className="flex items-center gap-1 text-shu">
                  <X aria-hidden className="size-4" strokeWidth={2.5} />
                  오답
                </span>
              )}
            </span>
            {/* 채점 전에는 설명(label)을 숨긴다 — 설명을 읽고 고르는 문제가 되지 않게(기존과 같음) */}
            <span className="block p-2 text-sumi">
              <FigureSvg
                figure={o.figure}
                xLabel={question.xLabel}
                yLabel={question.yLabel}
                title={`그래프 ${letter(i)}`}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ 코드 빈칸

function CodeBlankInput({ question, answer, onChange, result }: PracticeInputProps<"code-blank">) {
  const detail = result?.detail as { blanks: boolean[]; quotesFixed: boolean } | undefined;
  const set = (i: number, v: string) => onChange(answer.map((x, j) => (j === i ? v : x)));
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">빈칸을 모두 맞혀야 정답</p>
      <CodeBlock
        code={question.source}
        language={question.language}
        renderLine={(line) =>
          splitBlankText(line).map((part, k) =>
            typeof part === "string" ? (
              <span key={k}>{part}</span>
            ) : detail ? (
              <span
                key={k}
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  detail.blanks[part] ? "text-ok" : "text-shu",
                )}
              >
                {detail.blanks[part] ? (
                  <Check aria-hidden className="size-3.5" strokeWidth={3} />
                ) : (
                  <X aria-hidden className="size-3.5" strokeWidth={3} />
                )}
                {normalizeCodeInput(answer[part] ?? "").text || "(빈칸)"}
                <span className="sr-only">{detail.blanks[part] ? " 정답" : " 오답"}</span>
              </span>
            ) : (
              <input
                key={k}
                aria-label={`빈칸 ${part + 1}`}
                value={answer[part] ?? ""}
                onChange={(e) => set(part, e.target.value)}
                placeholder={`(${part + 1})`}
                size={Math.max(6, (answer[part] ?? "").length + 1)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="done"
                className="mx-0.5 border-[1.5px] border-sumi bg-paper px-1 font-mono text-base text-sumi placeholder:text-muted focus:outline-2 focus:-outline-offset-2 focus:outline-sumi"
              />
            ),
          )
        }
      />
      {detail && (
        <ul className="flex flex-col gap-2">
          {question.blanks.map((b, i) => (
            <li key={i} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">빈칸 {i + 1}</span>
              <GradeNote
                ok={detail.blanks[i]}
                answer={<code className="font-mono">{b.accept[0]}</code>}
              />
            </li>
          ))}
          {detail.quotesFixed && (
            <li className="text-sm text-muted">굽은 따옴표를 곧은 따옴표로 바꿔 채점했습니다.</li>
          )}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ 코드 작성

const mb = (n: number) => `${(n / 1e6).toFixed(1)} MB`;
type EngineState =
  | { state: "idle" }
  | { state: "loading"; stage: string }
  | { state: "ready"; ms: number | null }
  | { state: "failed"; message: string };
const needsPandas = (q: CodeWriteQ) =>
  q.language === "python" && !!q.python?.packages?.includes("pandas");

/**
 * 실행 엔진 준비 — components/qtypes/CodeWrite.tsx의 useEngine과 같은 규칙(시험 화면 파일을 고치지 않으려고 옮겨 적음):
 * Python 기본(+openpyxl)은 화면을 열 때, 넘파이는 필요할 때 함께, 판다스는 버튼을 눌렀을 때만.
 */
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
      const r = await getEngine(m).preparePython(
        m.pyodide.base,
        m.openpyxlWheels,
        packages,
        (stage) => setSt({ state: "loading", stage }),
      );
      setSt(r.ok ? { state: "ready", ms: r.ms } : { state: "failed", message: r.message });
    } catch (e) {
      setSt({ state: "failed", message: String((e as Error)?.message ?? e) });
    }
  };

  useEffect(() => {
    let alive = true;
    getManifest()
      .then((m) => alive && setManifest(m))
      .catch(
        (e) => alive && setSt({ state: "failed", message: String((e as Error)?.message ?? e) }),
      );
    const eng = peekEngine();
    const t =
      !needsPandas(q) || eng?.loaded.packages.has("pandas")
        ? setTimeout(() => void prepare(), 0)
        : undefined;
    return () => {
      alive = false;
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  return { st, manifest, prepare };
}

function RunTable({
  table,
}: {
  table: { columns: string[]; rows: unknown[][] } | null | undefined;
}) {
  if (!table) return <p className="text-sm text-muted">(결과 표 없음)</p>;
  return (
    <div className="max-h-72 overflow-auto border-y-[1.5px] border-sumi">
      <table className="w-full min-w-max text-sm">
        <thead className="text-left text-muted">
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className="px-2 py-1.5 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {table.rows.map((r, i) => (
            <tr key={i} className="border-t border-sumi/15">
              {r.map((v, j) => (
                <td key={j} className="px-2 py-1.5">
                  {v === null ? <span className="text-muted">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RunOutput({ side, title }: { side: RunSide | undefined; title: string }) {
  if (!side) return null;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-sm font-semibold">{title}</span>
      {side.error && (
        <pre className="overflow-x-auto bg-paper-deep px-3 py-2 font-mono text-sm whitespace-pre-wrap text-shu">
          {side.error}
        </pre>
      )}
      {side.stdout !== undefined && (
        <pre className="max-h-72 overflow-auto bg-paper-deep px-3 py-2 font-mono text-sm leading-6 whitespace-pre">
          {side.stdout === "" ? <span className="text-muted">(출력 없음)</span> : side.stdout}
          {side.truncated && <span className="text-muted">{"\n"}… 출력이 길어 잘랐습니다</span>}
        </pre>
      )}
      {side.table !== undefined && <RunTable table={side.table} />}
      {side.tables &&
        Object.entries(side.tables).map(([name, t]) => (
          <div key={name} className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm text-muted">테이블 {name}</span>
            <RunTable table={t} />
          </div>
        ))}
    </div>
  );
}

function CodeWriteInput({
  question: q,
  answer,
  onChange,
  result,
}: PracticeInputProps<"code-write">) {
  const { st, manifest, prepare } = useEngine(q);
  const [running, setRunning] = useState(false);
  const run = answer.run;
  const pandasWaiting = needsPandas(q) && st.state === "idle";
  const graded = result?.detail as CodeWriteRun | null | undefined;

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

  const solution = (
    <details>
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">
        모범 답안 보기
      </summary>
      <CodeBlock code={q.solution} language={q.language} />
    </details>
  );

  return (
    <div className="flex flex-col gap-3">
      {!result && (
        <p className="text-sm text-muted">
          실행한 뒤 확인 · 결과가 모범 답안과 같아야 정답 · 5초 제한
        </p>
      )}

      {pandasWaiting && manifest && !result && (
        <div className="flex flex-col gap-2 bg-paper-deep p-3 text-sm">
          <p>판다스가 필요한 문제입니다. 엔진을 불러와야 실행할 수 있습니다.</p>
          <Button variant="secondary" onClick={() => void prepare()}>
            실행 엔진 불러오기
          </Button>
          <span className="text-muted">
            약 {mb(manifest.bytes.numpy + manifest.bytes.pandas)} · 처음 한 번만 내려받음
          </span>
        </div>
      )}
      {st.state === "loading" && (
        <p role="status" className="text-sm text-muted">
          {st.stage}…
        </p>
      )}
      {st.state === "failed" && (
        <div role="alert" className="flex flex-col gap-2 bg-paper-deep p-3 text-sm">
          <p className="font-semibold">채점할 수 없음 — 실행 엔진을 불러오지 못했습니다</p>
          <p className="text-muted">{st.message} · 이 문제는 기록에 남지 않습니다.</p>
          <Button variant="secondary" onClick={() => void prepare()}>
            다시 시도
          </Button>
          {solution}
        </div>
      )}

      <CodeEditor
        value={answer.source}
        onChange={(v) => onChange({ source: v, run })}
        language={q.language}
        disabled={!!result}
        label="코드 입력"
      />

      {!result && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => void execute()}
            disabled={running || st.state !== "ready" || !answer.source.trim()}
          >
            {running ? "실행 중…" : "실행"}
          </Button>
          <span className="text-sm text-muted" aria-live="polite">
            {run &&
              !runIsCurrent(answer) &&
              run.status !== "unavailable" &&
              "코드를 바꿨습니다 — 다시 실행하세요"}
            {run && runIsCurrent(answer) && "실행 완료 — 확인을 누르세요"}
          </span>
        </div>
      )}
      {!result && run?.status === "unavailable" && (
        <div role="alert" className="flex flex-col gap-1 bg-paper-deep p-3 text-sm">
          <p className="font-semibold">채점할 수 없음</p>
          <p className="text-muted">{run.reason} · 이 문제는 기록에 남지 않습니다.</p>
          {solution}
        </div>
      )}
      {!result && run?.status === "timeout" && (
        <p className="text-sm font-semibold">{run.reason}</p>
      )}
      {!result && run?.status === "done" && <RunOutput side={run.mine} title="내 실행 결과" />}

      {result && (
        <div className="flex flex-col gap-3">
          {graded?.reason && <p className="text-sm text-shu">{graded.reason}</p>}
          {graded && !result.correct && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <RunOutput
                side={graded.mine ?? { error: graded.reason ?? "실행 결과 없음" }}
                title="내 결과"
              />
              <RunOutput side={graded.expected} title="기대 결과" />
            </div>
          )}
          {graded?.quotesFixed && (
            <p className="text-sm text-muted">굽은 따옴표를 곧은 따옴표로 바꿔 실행했습니다.</p>
          )}
          {q.language === "sql" && (
            <p className="text-sm text-muted">
              채점은 SQLite(sql.js)로 실행 — MySQL과 문법 차이가 있을 수 있음
            </p>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">모범 답안</span>
            <CodeBlock code={q.solution} language={q.language} />
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ 서술형

/** 서술형(자기 채점): 쓰고 확인하면 모범답안과 채점 포인트가 나온다. 포인트 체크는 기록하지 않는다(기존과 같음) */
function Essay({ question, answer, onChange, result }: PracticeInputProps<"essay">) {
  const [checked, setChecked] = useState<boolean[]>(() => question.keyPoints.map(() => false));
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">답</span>
        <textarea
          aria-describedby={`${question.id}-prompt`}
          value={answer}
          readOnly={!!result}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full border-[1.5px] border-sumi bg-paper px-3.5 py-2.5 text-base leading-relaxed focus:outline-2 focus:-outline-offset-2 focus:outline-sumi"
        />
        {!result && (
          <span className="text-sm text-muted">
            자기 채점 · 기록에는 &ldquo;풀었음&rdquo;만 남습니다
          </span>
        )}
      </label>
      {result && (
        <>
          <section aria-label="모범답안" className="flex flex-col gap-1 bg-paper-deep p-4">
            <h3 className="text-sm font-semibold">모범답안</h3>
            <p className="leading-relaxed">{question.modelAnswer}</p>
          </section>
          <section aria-label="채점 포인트" className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">
              채점 포인트{" "}
              <span className="font-mono font-normal text-muted">
                {checked.filter(Boolean).length}/{question.keyPoints.length}
              </span>
            </h3>
            <div role="group" aria-label="내 답에 들어간 포인트" className="flex flex-col gap-2">
              {question.keyPoints.map((k, i) => (
                <ChoiceRow
                  key={k}
                  multiple
                  selected={checked[i]}
                  onSelect={() => setChecked((c) => c.map((x, j) => (j === i ? !x : x)))}
                >
                  {k}
                </ChoiceRow>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export { Calc, Classify, CodeBlankInput, CodeWriteInput, Essay, Graph, Order, Trace };

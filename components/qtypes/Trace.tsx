"use client";

import type { ReactNode } from "react";
import { cellKey, type TraceQ } from "@/lib/qtypes/trace";
import type { InputProps, QTypeUI, ReviewProps } from "./types";

const table = "min-w-full border-collapse text-center text-sm";
const th = "border border-border bg-surface px-2 py-1.5 font-semibold";
const td = "border border-border px-1 py-1";

/** 넓은 화면(sm 이상): 표. 표 영역만 가로 스크롤 */
function Scroll({ children }: { children: ReactNode }) {
  return <div className="-mx-1 hidden overflow-x-auto px-1 sm:block">{children}</div>;
}

/**
 * 좁은 화면(375px 등): 표 대신 열 하나를 카드 하나로 세로로 쌓는다 — 페이지·표 어느 쪽도 가로 스크롤이 생기지 않는다.
 * 같은 칸을 표와 카드 두 곳에 그리지만 한쪽은 display:none이라 화면·보조기기에는 하나만 보인다.
 */
function Cards({ question, cell }: { question: TraceQ; cell(i: number, j: number): ReactNode }) {
  return (
    <ol className="flex flex-col gap-2 sm:hidden" aria-label="표 (열별)">
      {question.columns.map((c, j) => (
        <li key={j} className="rounded-lg border border-border p-2">
          <p className="mb-1 text-xs font-semibold text-muted">
            {j + 1}열 · {c}
          </p>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 text-sm">
            {question.rows.map((r, i) => (
              <div key={i} className="contents">
                <dt className="text-muted">{r.label}</dt>
                <dd className="min-w-0">{cell(i, j)}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ol>
  );
}

function Header({ question }: { question: TraceQ }) {
  return (
    <thead>
      <tr>
        <th className={th} />
        {question.columns.map((c, j) => (
          <th key={j} scope="col" className={th}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function Input({ question, answer, onChange, disabled }: InputProps<"trace">) {
  const set = (key: string, v: string) => onChange({ ...answer, [key]: v });
  const field = (i: number, j: number, wide: boolean) => {
    const cell = question.rows[i].cells[j];
    if (!cell.blank) return <span>{cell.value || "·"}</span>;
    const key = cellKey(i, j);
    const label = `${question.rows[i].label}, ${question.columns[j]} 열`;
    const size = wide ? "w-full" : "min-w-14 max-w-56";
    return cell.options ? (
      <select
        aria-label={label}
        value={answer[key] ?? ""}
        disabled={disabled}
        onChange={(e) => set(key, e.target.value)}
        className={`${size} rounded border border-primary/60 bg-background px-1 py-1`}
      >
        <option value="">?</option>
        {cell.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    ) : (
      <input
        aria-label={label}
        value={answer[key] ?? ""}
        disabled={disabled}
        onChange={(e) => set(key, e.target.value)}
        autoComplete="off"
        className={`${wide ? "w-full" : "w-14"} rounded border border-primary/60 bg-background px-1 py-1 text-center`}
      />
    );
  };
  return (
    <>
      <Scroll>
        <table className={table}>
          <Header question={question} />
          <tbody>
            {question.rows.map((r, i) => (
              <tr key={i}>
                <th scope="row" className={`${th} whitespace-nowrap text-left`}>
                  {r.label}
                </th>
                {r.cells.map((cell, j) => (
                  <td key={j} className={`${td} ${cell.blank ? "bg-primary/5" : ""}`}>
                    {field(i, j, false)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Cards question={question} cell={(i, j) => field(i, j, true)} />
    </>
  );
}

function Review({ question, answer, result }: ReviewProps<"trace">) {
  const view = (i: number, j: number) => {
    const cell = question.rows[i].cells[j];
    if (!cell.blank) return <span className="text-muted">{cell.value || "·"}</span>;
    const key = cellKey(i, j);
    const ok = result.detail[key];
    return (
      <span className={`inline-flex flex-col leading-tight ${ok ? "text-correct" : "text-incorrect"}`}>
        <span className="font-semibold">
          <span aria-hidden>{ok ? "✓" : "✗"}</span> {cell.value}
          <span className="sr-only">{ok ? " 정답" : " 오답, 정답은 " + cell.value}</span>
        </span>
        {!ok && <span className="text-xs line-through">{answer[key] || "빈칸"}</span>}
      </span>
    );
  };
  return (
    <>
      <Scroll>
        <table className={table}>
          <Header question={question} />
          <tbody>
            {question.rows.map((r, i) => (
              <tr key={i}>
                <th scope="row" className={`${th} whitespace-nowrap text-left`}>
                  {r.label}
                </th>
                {r.cells.map((_, j) => (
                  <td key={j} className={td}>
                    {view(i, j)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Cards question={question} cell={view} />
      <p className="mt-2 text-xs text-muted">빈칸이었던 칸: ✓ = 맞음, ✗ = 틀림(취소선이 내 답, 위가 정답)</p>
    </>
  );
}

export const TraceUI: QTypeUI<"trace"> = { Input, Review };

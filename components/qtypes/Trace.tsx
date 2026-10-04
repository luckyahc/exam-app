"use client";

import type { ReactNode } from "react";
import { cellKey } from "@/lib/qtypes/trace";
import type { InputProps, QTypeUI, ReviewProps } from "./types";

const table = "min-w-full border-collapse text-center text-sm";
const th = "border border-border bg-surface px-2 py-1.5 font-semibold";
const td = "border border-border px-1 py-1";

/** 표는 좁은 화면에서 가로 스크롤(페이지 전체가 아니라 표 영역만). */
function Scroll({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

function Input({ question, answer, onChange, disabled }: InputProps<"trace">) {
  const set = (key: string, v: string) => onChange({ ...answer, [key]: v });
  return (
    <Scroll>
      <table className={table}>
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
        <tbody>
          {question.rows.map((r, i) => (
            <tr key={i}>
              <th scope="row" className={`${th} whitespace-nowrap text-left`}>
                {r.label}
              </th>
              {r.cells.map((cell, j) => {
                const key = cellKey(i, j);
                if (!cell.blank)
                  return (
                    <td key={j} className={td}>
                      {cell.value}
                    </td>
                  );
                const label = `${r.label}, ${question.columns[j]} 열`;
                return (
                  <td key={j} className={`${td} bg-primary/5`}>
                    {cell.options ? (
                      <select
                        aria-label={label}
                        value={answer[key] ?? ""}
                        disabled={disabled}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-14 rounded border border-primary/60 bg-background px-1 py-0.5"
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
                        className="w-12 rounded border border-primary/60 bg-background px-1 py-0.5 text-center"
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Scroll>
  );
}

function Review({ question, answer, result }: ReviewProps<"trace">) {
  return (
    <Scroll>
      <table className={table}>
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
        <tbody>
          {question.rows.map((r, i) => (
            <tr key={i}>
              <th scope="row" className={`${th} whitespace-nowrap text-left`}>
                {r.label}
              </th>
              {r.cells.map((cell, j) => {
                if (!cell.blank)
                  return (
                    <td key={j} className={`${td} text-muted`}>
                      {cell.value}
                    </td>
                  );
                const key = cellKey(i, j);
                const ok = result.detail[key];
                return (
                  <td key={j} className={`${td} ${ok ? "text-correct" : "text-incorrect"}`}>
                    <span className="flex flex-col items-center leading-tight">
                      <span className="font-semibold">
                        <span aria-hidden>{ok ? "✓" : "✗"}</span> {cell.value}
                        <span className="sr-only">
                          {ok ? " 정답" : " 오답, 정답은 " + cell.value}
                        </span>
                      </span>
                      {!ok && <span className="text-xs line-through">{answer[key] || "빈칸"}</span>}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        빈칸이었던 칸: ✓ = 맞음, ✗ = 틀림(취소선이 내 답, 위가 정답)
      </p>
    </Scroll>
  );
}

export const TraceUI: QTypeUI<"trace"> = { Input, Review };

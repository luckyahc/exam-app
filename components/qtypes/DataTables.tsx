"use client";

import { type ReactNode, useState } from "react";
import type { Cell, PyFile, PyFrame, QuestionData, SnapColumn } from "@/lib/qtypes/dataSnapshots";

/** 이보다 행이 많으면 접고 "모두 보기"로 펼친다 */
export const FOLD_ROWS = 15;

const cellText = (v: Cell) => (v === null ? <span className="text-muted">NULL</span> : String(v));
const excelCol = (i: number): string => (i < 26 ? "" : excelCol(Math.floor(i / 26) - 1)) + String.fromCharCode(65 + (i % 26));

function useFold(total: number) {
  const [open, setOpen] = useState(false);
  const shown = open || total <= FOLD_ROWS ? total : FOLD_ROWS;
  const toggle =
    total > FOLD_ROWS ? (
      <button type="button" onClick={() => setOpen(!open)} className="text-xs font-medium text-primary underline-offset-2 hover:underline" aria-expanded={open}>
        {open ? "접기" : `모두 보기 (${total}행)`}
      </button>
    ) : null;
  return { shown, toggle };
}

/** 표 하나 — 코드 작성 결과 표(CodeWrite ResultTable)와 같은 모양. 표 영역만 가로 스크롤한다 */
function Grid({ head, rows, rowHeads, cornerHead }: { head: ReactNode[]; rows: Cell[][]; rowHeads?: Cell[]; cornerHead?: ReactNode }) {
  const { shown, toggle } = useFold(rows.length);
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <div className="max-w-full overflow-x-auto rounded-lg border border-border">
        <table className="min-w-max text-xs">
          <thead className="bg-surface text-left text-muted">
            <tr>
              {rowHeads && <th className="px-2 py-1 font-medium">{cornerHead}</th>}
              {head.map((h, i) => (
                <th key={i} className="px-2 py-1 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.slice(0, shown).map((r, i) => (
              <tr key={i} className="border-t border-border">
                {rowHeads && <th className="bg-surface px-2 py-1 text-left font-medium text-muted">{cellText(rowHeads[i] ?? null)}</th>}
                {r.map((v, j) => (
                  <td key={j} className="px-2 py-1 whitespace-pre">
                    {cellText(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-border px-2 py-1 text-xs text-muted">
          {rows.length}행{shown < rows.length && ` 중 ${shown}행 표시`}
        </p>
      </div>
      {toggle}
    </div>
  );
}

const colHead = (c: SnapColumn) => (
  <>
    {c.name}
    {c.type && <span className="ml-1 font-mono text-[0.7rem] font-normal opacity-80">{c.type}</span>}
  </>
);

function Titled({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-xs font-medium">{title}</span>
      {children}
    </div>
  );
}

function CsvFile({ file }: { file: Extract<PyFile, { kind: "csv" }> }) {
  const lines = file.text.replace(/\n$/, "").split("\n");
  const { shown, toggle } = useFold(lines.length);
  return (
    <Titled title={<>{file.name} <span className="font-normal text-muted">(파일 내용 · {file.encoding})</span></>}>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <pre className="max-w-full overflow-x-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs leading-5 whitespace-pre text-foreground">
          {lines.slice(0, shown).join("\n")}
        </pre>
        {toggle}
      </div>
    </Titled>
  );
}

function XlsxFile({ file }: { file: Extract<PyFile, { kind: "xlsx" }> }) {
  return (
    <>
      {file.sheets.map((s) => {
        const width = Math.max(0, ...s.rows.map((r) => r.length));
        return (
          <Titled key={s.name} title={<>{file.name} <span className="font-normal text-muted">· 시트 {s.name}</span></>}>
            <Grid head={Array.from({ length: width }, (_, i) => excelCol(i))} rows={s.rows} rowHeads={s.rows.map((_, i) => i + 1)} />
          </Titled>
        );
      })}
    </>
  );
}

function Frame({ frame }: { frame: PyFrame }) {
  return (
    <Titled title={<>{frame.name} <span className="font-normal text-muted">(DataFrame · 준비 코드 실행 후)</span></>}>
      <Grid head={frame.columns.map(colHead)} rows={frame.rows} rowHeads={frame.index} />
    </Titled>
  );
}

/** 지문 아래 "사용 테이블"(SQL)·"사용 데이터"(Python) — 숨긴 준비 데이터를 보여 준다 */
export function DataTables({ data }: { data: QuestionData }) {
  const title = data.kind === "sql" ? (data.before ? "실행 전 테이블" : "사용 테이블") : "사용 데이터";
  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3">
      <h3 className="text-xs font-semibold text-muted">{title}</h3>
      {data.kind === "sql"
        ? data.tables.map(({ name, table }) => (
            <Titled key={name} title={<>테이블 {name}</>}>
              <Grid head={table.columns.map(colHead)} rows={table.rows} />
            </Titled>
          ))
        : (
            <>
              {data.files.map((f) => (f.kind === "csv" ? <CsvFile key={f.name} file={f} /> : <XlsxFile key={f.name} file={f} />))}
              {data.frames.map((f) => (
                <Frame key={f.name} frame={f} />
              ))}
            </>
          )}
    </section>
  );
}

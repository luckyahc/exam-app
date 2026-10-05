"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SUBJECTS } from "@/data/subjects/registry";
import { applyBackup, exportBackup, type ImportMode, MAX_BACKUP_BYTES, parseBackup } from "@/lib/storage/backup";
import { currentStore, resetData, writeStore } from "@/lib/storage/recordsStore";
import type { StoreV2 } from "@/lib/storage/schema";
import { getSubject } from "@/lib/subjects";
import { setThemeMode } from "@/lib/theme/themeStore";

type Notice = { kind: "ok" | "error"; text: string } | null;
type Pending = { store: StoreV2; fromVersion: number; skipped: string[]; fileName: string };

const subjectName = (id: string) => getSubject(id)?.name ?? id;

/**
 * 기록 관리: JSON 내보내기·가져오기·데이터 초기화. 저장은 모두 recordsStore → safeStorage를 거친다.
 * 확인은 브라우저 기본 confirm 대신 페이지 안의 <dialog>로 받는다.
 */
export function DataManager() {
  const [exportScope, setExportScope] = useState("all");
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetScope, setResetScope] = useState("all");
  const [resetTheme, setResetTheme] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const ids = exportScope === "all" ? undefined : [exportScope];
    const data = exportBackup(currentStore(), new Date(), ids);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-app-backup-${exportScope}-${data.exportedAt.slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice({ kind: "ok", text: `${exportScope === "all" ? "전체" : subjectName(exportScope)} 기록을 내보냈습니다(${a.download}).` });
  };

  const onFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = ""; // 같은 파일을 다시 골라도 change가 나게
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setNotice({ kind: "error", text: "파일이 너무 큽니다(5MB 초과). 이 앱의 백업 파일인지 확인해 주세요." });
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setNotice({ kind: "error", text: "파일을 읽지 못했습니다." });
      return;
    }
    const r = parseBackup(text, SUBJECTS.map((s) => s.id));
    if (!r.ok) {
      setNotice({ kind: "error", text: `가져오지 못했습니다: ${r.error}` });
      return;
    }
    if (Object.keys(r.store.subjects).length === 0) {
      setNotice({ kind: "error", text: `가져올 과목 기록이 없습니다${r.skippedSubjects.length ? ` (모르는 과목 건너뜀: ${r.skippedSubjects.join(", ")})` : ""}.` });
      return;
    }
    setNotice(null);
    setMode("merge");
    setPending({ store: r.store, fromVersion: r.fromVersion, skipped: r.skippedSubjects, fileName: file.name });
  };

  const doImport = () => {
    if (!pending) return;
    const ids = Object.keys(pending.store.subjects);
    writeStore(applyBackup(currentStore(), pending.store, mode), ids);
    setNotice({
      kind: "ok",
      text:
        `${ids.map(subjectName).join(", ")} 기록을 ${mode === "merge" ? "합쳐" : "덮어써"} 가져왔습니다.` +
        (pending.skipped.length ? ` 모르는 과목은 건너뛰었습니다: ${pending.skipped.join(", ")}.` : ""),
    });
    setPending(null);
  };

  const doReset = () => {
    if (resetScope === "all" && resetTheme) setThemeMode("system");
    resetData(resetScope, { theme: resetScope === "all" && resetTheme });
    setNotice({ kind: "ok", text: `${resetScope === "all" ? "전체" : subjectName(resetScope)} 기록을 초기화했습니다.` });
    setResetOpen(false);
  };

  const scopeOptions = [{ id: "all", label: "전체 과목" }, ...SUBJECTS.map((s) => ({ id: s.id, label: s.name }))];
  const btn = "rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-primary";

  return (
    <section aria-labelledby="data-heading" className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <h2 id="data-heading" className="font-semibold">
        기록 관리
      </h2>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">내보내기 (JSON)</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            범위
            <select value={exportScope} onChange={(e) => setExportScope(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              {scopeOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={doExport} className={btn}>
            내보내기
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">가져오기</h3>
        <p className="text-xs text-muted">이 앱에서 내보낸 JSON(v2) 또는 예전 형식(v1) 파일. 가져오기 전에 덮어쓰기/합치기를 고릅니다.</p>
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className={btn}>
            파일 선택…
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="백업 파일" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">데이터 초기화</h3>
        <div>
          <button type="button" onClick={() => setResetOpen(true)} className="rounded-lg border border-incorrect px-4 py-2 text-sm font-medium text-incorrect hover:bg-incorrect/10">
            초기화…
          </button>
        </div>
      </div>

      {notice && (
        <p role={notice.kind === "error" ? "alert" : "status"} className={"rounded-md border p-3 text-sm " + (notice.kind === "error" ? "border-incorrect text-incorrect" : "border-correct text-correct")}>
          {notice.text}
        </p>
      )}

      <Dialog open={!!pending} title="기록 가져오기" onClose={() => setPending(null)}>
        {pending && (
          <>
            <p className="text-sm">
              <b className="break-all">{pending.fileName}</b>
              <span className="text-muted"> · 형식 v{pending.fromVersion}</span>
            </p>
            <ul className="list-disc pl-5 text-sm">
              {Object.entries(pending.store.subjects).map(([id, r]) => (
                <li key={id}>
                  {subjectName(id)}: 푼 문제 {Object.keys(r.progress).length} · 오답 {Object.keys(r.wrong).length} · 북마크 {r.bookmarks.length}
                </li>
              ))}
            </ul>
            {pending.skipped.length > 0 && <p className="text-sm text-incorrect">모르는 과목은 건너뜁니다: {pending.skipped.join(", ")}</p>}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">가져오기 방식</legend>
              <Choice name="import-mode" checked={mode === "merge"} onChange={() => setMode("merge")} label="합치기" desc="지금 기록에 더합니다(푼 횟수는 큰 값, 날짜는 최근 값, 북마크는 합집합)." />
              <Choice name="import-mode" checked={mode === "overwrite"} onChange={() => setMode("overwrite")} label="덮어쓰기" desc="파일에 든 과목의 지금 기록을 파일 내용으로 바꿉니다." />
            </fieldset>
            <DialogButtons onCancel={() => setPending(null)} onOk={doImport} okLabel="가져오기" />
          </>
        )}
      </Dialog>

      <Dialog open={resetOpen} title="데이터 초기화" onClose={() => setResetOpen(false)}>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">범위</legend>
          {scopeOptions.map((o) => (
            <Choice
              key={o.id}
              name="reset-scope"
              checked={resetScope === o.id}
              onChange={() => setResetScope(o.id)}
              label={o.id === "all" ? "전체 초기화" : `${o.label}만 초기화`}
              desc={o.id === "all" ? "모든 과목의 기록·오답노트·북마크와 풀던 세션·설정을 지웁니다." : `${o.label}의 기록·오답노트·북마크만 지웁니다.`}
            />
          ))}
        </fieldset>
        <label className={"flex items-center gap-2 text-sm " + (resetScope === "all" ? "" : "opacity-40")}>
          <input type="checkbox" disabled={resetScope !== "all"} checked={resetScope === "all" && resetTheme} onChange={(e) => setResetTheme(e.target.checked)} />
          테마 설정도 초기화(시스템 설정 따르기)
        </label>
        <p className="text-sm text-incorrect">되돌릴 수 없습니다. 필요하면 먼저 내보내기로 백업하세요.</p>
        <DialogButtons onCancel={() => setResetOpen(false)} onOk={doReset} okLabel="초기화" danger />
      </Dialog>
    </section>
  );
}

function Choice({ name, checked, onChange, label, desc }: { name: string; checked: boolean; onChange: () => void; label: string; desc: string }) {
  return (
    <label className={"flex cursor-pointer gap-2 rounded-md border p-2 text-sm " + (checked ? "border-primary bg-primary/10" : "border-border")}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1" />
      <span>
        <b>{label}</b>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </label>
  );
}

function DialogButtons({ onCancel, onOk, okLabel, danger }: { onCancel: () => void; onOk: () => void; okLabel: string; danger?: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm">
        취소
      </button>
      <button type="button" onClick={onOk} className={"rounded-lg px-4 py-2 text-sm font-semibold text-background " + (danger ? "bg-incorrect" : "bg-primary")}>
        {okLabel}
      </button>
    </div>
  );
}

/** 페이지 안 모달(<dialog>.showModal) — Esc·바깥 클릭·취소로 닫힌다 */
function Dialog({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-background p-0 text-foreground backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-3 p-5">
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

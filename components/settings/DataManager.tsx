"use client";

import { useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ChoiceRow } from "@/components/ui/ChoiceRow";
import { SelectInput } from "@/components/ui/SelectInput";
import { SUBJECTS } from "@/data/subjects/registry";
import { reloadSettings } from "@/lib/settings/appSettings";
import {
  applyBackup,
  exportBackup,
  type ImportMode,
  MAX_BACKUP_BYTES,
  parseBackup,
} from "@/lib/storage/backup";
import { currentStore, resetData, writeStore } from "@/lib/storage/recordsStore";
import type { StoreV2 } from "@/lib/storage/schema";
import { getSubject } from "@/lib/subjects";
import { setThemeMode } from "@/lib/theme/themeStore";

type Notice = { kind: "ok" | "error"; text: string } | null;
type Pending = { store: StoreV2; fromVersion: number; skipped: string[]; fileName: string };

const subjectName = (id: string) => getSubject(id)?.name ?? id;

/**
 * 기록 관리: JSON 내보내기·가져오기·풀이 기록 초기화. 저장은 모두 recordsStore → safeStorage를 거친다(이전과 같은 함수).
 * 가져오기·초기화는 바텀시트에서 한 번 더 확인한다.
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
    setNotice({
      kind: "ok",
      text: `${exportScope === "all" ? "전체" : subjectName(exportScope)} 기록을 내보냈습니다(${a.download}).`,
    });
  };

  const onFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = ""; // 같은 파일을 다시 골라도 change가 나게
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setNotice({
        kind: "error",
        text: "파일이 너무 큽니다(5MB 초과). 이 앱의 백업 파일인지 확인해 주세요.",
      });
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setNotice({ kind: "error", text: "파일을 읽지 못했습니다." });
      return;
    }
    const r = parseBackup(
      text,
      SUBJECTS.map((s) => s.id),
    );
    if (!r.ok) {
      setNotice({ kind: "error", text: `가져오지 못했습니다: ${r.error}` });
      return;
    }
    if (Object.keys(r.store.subjects).length === 0) {
      setNotice({
        kind: "error",
        text: `가져올 과목 기록이 없습니다${r.skippedSubjects.length ? ` (모르는 과목 건너뜀: ${r.skippedSubjects.join(", ")})` : ""}.`,
      });
      return;
    }
    setNotice(null);
    setMode("merge");
    setPending({
      store: r.store,
      fromVersion: r.fromVersion,
      skipped: r.skippedSubjects,
      fileName: file.name,
    });
  };

  const doImport = () => {
    if (!pending) return;
    const ids = Object.keys(pending.store.subjects);
    writeStore(applyBackup(currentStore(), pending.store, mode), ids);
    reloadSettings();
    setNotice({
      kind: "ok",
      text:
        `${ids.map(subjectName).join(", ")} 기록을 ${mode === "merge" ? "합쳐" : "덮어써"} 가져왔습니다.` +
        (pending.skipped.length
          ? ` 모르는 과목은 건너뛰었습니다: ${pending.skipped.join(", ")}.`
          : ""),
    });
    setPending(null);
  };

  const doReset = () => {
    if (resetScope === "all" && resetTheme) setThemeMode("system");
    resetData(resetScope, { theme: resetScope === "all" && resetTheme });
    reloadSettings();
    setNotice({
      kind: "ok",
      text: `${resetScope === "all" ? "전체" : subjectName(resetScope)} 기록을 초기화했습니다.`,
    });
    setResetOpen(false);
  };

  const scopeOptions = [
    { id: "all", label: "전체 과목" },
    ...SUBJECTS.map((s) => ({ id: s.id, label: s.name })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-2">
        <SelectInput
          label="내보내기"
          placeholder={null}
          value={exportScope}
          onChange={(e) => setExportScope(e.target.value)}
          options={scopeOptions.map((o) => ({ value: o.id, label: o.label }))}
          className="min-w-0 flex-1"
        />
        <Button variant="secondary" onClick={doExport} className="shrink-0">
          내보내기
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" block onClick={() => fileRef.current?.click()}>
          백업 파일 가져오기
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="백업 파일"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Button variant="secondary" block onClick={() => setResetOpen(true)}>
          풀이 기록 초기화
        </Button>
      </div>

      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={notice.kind === "error" ? "text-sm font-semibold" : "text-sm text-muted"}
        >
          {notice.text}
        </p>
      )}

      <BottomSheet
        open={!!pending}
        title="기록 가져오기"
        onClose={() => setPending(null)}
        footer={
          <Button block onClick={doImport}>
            {mode === "merge" ? "합쳐서 가져오기" : "덮어써서 가져오기"}
          </Button>
        }
      >
        {pending && (
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm break-all">
              <b>{pending.fileName}</b>
              <span className="text-muted"> · v{pending.fromVersion}</span>
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {Object.entries(pending.store.subjects).map(([id, r]) => (
                <li key={id}>
                  {subjectName(id)}{" "}
                  <span className="font-mono text-muted">
                    푼 {Object.keys(r.progress).length} · 오답 {Object.keys(r.wrong).length} ·
                    북마크 {r.bookmarks.length}
                  </span>
                </li>
              ))}
            </ul>
            {pending.skipped.length > 0 && (
              <p className="text-sm">모르는 과목은 건너뜁니다: {pending.skipped.join(", ")}</p>
            )}
            <div role="radiogroup" aria-label="가져오기 방식" className="flex flex-col gap-2">
              <Option
                selected={mode === "merge"}
                onSelect={() => setMode("merge")}
                label="합치기"
                desc="지금 기록에 더합니다."
              />
              <Option
                selected={mode === "overwrite"}
                onSelect={() => setMode("overwrite")}
                label="덮어쓰기"
                desc="파일에 든 과목의 기록을 파일 내용으로 바꿉니다."
              />
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={resetOpen}
        title="풀이 기록 초기화"
        onClose={() => setResetOpen(false)}
        footer={
          <Button block onClick={doReset}>
            {resetScope === "all" ? "전체 초기화" : `${subjectName(resetScope)} 초기화`}
          </Button>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          <p className="text-sm font-semibold">
            되돌릴 수 없습니다. 필요하면 먼저 내보내기로 백업하세요.
          </p>
          <div role="radiogroup" aria-label="범위" className="flex flex-col gap-2">
            {scopeOptions.map((o) => (
              <Option
                key={o.id}
                selected={resetScope === o.id}
                onSelect={() => setResetScope(o.id)}
                label={o.id === "all" ? "전체" : o.label}
                desc={o.id === "all" ? "모든 과목의 기록·오답·북마크와 설정" : undefined}
              />
            ))}
          </div>
          <Chip
            selected={resetScope === "all" && resetTheme}
            disabled={resetScope !== "all"}
            onClick={() => setResetTheme((v) => !v)}
            className="self-start"
          >
            다크 모드 설정도 초기화
          </Chip>
        </div>
      </BottomSheet>
    </div>
  );
}

function Option({
  selected,
  onSelect,
  label,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  desc?: string;
}) {
  return (
    <ChoiceRow selected={selected} onSelect={onSelect}>
      <span className="font-semibold">{label}</span>
      {desc && <span className="block text-sm opacity-75">{desc}</span>}
    </ChoiceRow>
  );
}

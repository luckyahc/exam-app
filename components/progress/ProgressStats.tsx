"use client";

import { summarize } from "@/lib/storage/records";
import { useRecords } from "@/lib/storage/recordsStore";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * 진행률(한 번이라도 푼 문제 / 전체)과 정답률(완전히 맞힌 횟수 / 푼 횟수)을 보여 준다.
 * 기록을 읽기 전(서버 렌더·하이드레이션)에는 "—"를 보여 줘 하이드레이션이 어긋나지 않는다.
 */
export function ProgressStats({ subjectId, ids }: { subjectId: string; ids: readonly string[] }) {
  const records = useRecords();
  const sub = records.subjects[subjectId];
  const solved = sub ? ids.filter((id) => sub.progress[id]).length : 0;
  const acc = sub ? summarize(sub, ids) : null;
  const progress = records.loaded && ids.length ? pct(solved / ids.length) : "—";
  const accuracy = records.loaded && acc?.rate != null ? pct(acc.rate) : "—";

  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex flex-wrap gap-x-3 text-sm">
        <span>
          진행률 <b>{progress}</b>
          {records.loaded && ids.length > 0 && (
            <span className="text-muted">
              {" "}
              ({solved}/{ids.length})
            </span>
          )}
        </span>
        <span>
          정답률 <b>{accuracy}</b>
        </span>
      </span>
      {ids.length > 0 && (
        <span
          role="progressbar"
          aria-label="진행률"
          aria-valuemin={0}
          aria-valuemax={ids.length}
          aria-valuenow={records.loaded ? solved : 0}
          className="h-1.5 overflow-hidden rounded-full bg-border"
        >
          <span className="block h-full bg-subject transition-all" style={{ width: records.loaded ? pct(solved / ids.length) : "0%" }} />
        </span>
      )}
    </span>
  );
}

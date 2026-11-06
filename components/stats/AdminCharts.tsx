"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import type { BarRow, DayPoint } from "@/lib/analytics/report";

type Metric = "visitors" | "pageviews";
const METRICS = [
  { value: "visitors", label: "방문자" },
  { value: "pageviews", label: "페이지뷰" },
] as const;
const METRIC_LABEL: Record<Metric, string> = { visitors: "방문자", pageviews: "페이지뷰" };

const shortDate = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

/** 큰 숫자 하나(방문자·페이지뷰 합계는 그래프가 아니라 숫자로 읽는다) */
export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-3xl font-bold tabular-nums">{value.toLocaleString("ko-KR")}</span>
    </div>
  );
}

/**
 * 일별 추이 막대. 측정값이 달라 축을 둘로 나누지 않고 전환으로 하나씩 본다. 색은 먹색 한 가지.
 * 막대 위에 올리거나 누르면 위쪽 줄에 그날 값이 나온다(기본은 가장 최근 날). 같은 값은 아래 "표로 보기"에도 있다.
 */
export function DailyChart({ data }: { data: readonly DayPoint[] }) {
  const [metric, setMetric] = useState<Metric>("visitors");
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d[metric]));
  const shown = data[active ?? data.length - 1];

  return (
    <section aria-labelledby="daily-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 id="daily-heading" className="font-display text-base font-bold">
          일별 추이
        </h3>
        <SegmentedControl
          label="그래프 값"
          items={METRICS}
          value={metric}
          onChange={setMetric}
          className="w-40 shrink-0"
        />
      </div>
      <p aria-live="polite" className="font-mono text-sm tabular-nums">
        {shown ? `${shortDate(shown.date)} · ${METRIC_LABEL[metric]} ${shown[metric]}` : "데이터 없음"}
      </p>
      <div className="flex gap-2">
        <div aria-hidden className="flex h-40 flex-col justify-between font-mono text-xs text-muted tabular-nums">
          <span>{max}</span>
          <span className="text-right">0</span>
        </div>
        <div className="min-w-0 flex-1">
          <div
            role="img"
            aria-label={`최근 ${data.length}일 ${METRIC_LABEL[metric]} 막대그래프, 최대 ${max}`}
            onPointerLeave={() => setActive(null)}
            className="flex h-40 items-end gap-0.5 border-b border-line"
          >
            {data.map((d, i) => (
              <div
                key={d.date}
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
                className="flex h-full min-w-0 flex-1 items-end"
              >
                <div
                  className={cn("w-full bg-sumi", active !== null && active !== i && "opacity-40")}
                  style={{
                    height: d[metric] ? `${Math.max(2, (d[metric] / max) * 100)}%` : 0,
                  }}
                />
              </div>
            ))}
          </div>
          <div aria-hidden className="flex justify-between pt-1 font-mono text-xs text-muted tabular-nums">
            <span>{data[0] && shortDate(data[0].date)}</span>
            <span>{data.length > 0 && shortDate(data[data.length - 1].date)}</span>
          </div>
        </div>
      </div>
      <details>
        <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold [&::-webkit-details-marker]:hidden">
          표로 보기
        </summary>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="py-1 font-normal">날짜</th>
              <th className="py-1 text-right font-normal">방문자</th>
              <th className="py-1 text-right font-normal">페이지뷰</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {data.map((d) => (
              <tr key={d.date} className="border-t border-line">
                <td className="py-1">{shortDate(d.date)}</td>
                <td className="py-1 text-right">{d.visitors}</td>
                <td className="py-1 text-right">{d.pageviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

/** 항목별 순위 막대(페이지·국가·기기·유입). 값은 글자로 함께 적어 막대 길이만으로 읽지 않게 한다 */
export function BarList({
  title,
  rows,
  label = (s) => s,
}: {
  title: string;
  rows: readonly BarRow[];
  label?: (raw: string) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.pageviews));
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-display text-base font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">아직 데이터가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 break-all">{label(r.label)}</span>
                <span className="shrink-0 font-mono text-muted tabular-nums">{r.pageviews}</span>
              </div>
              <div aria-hidden className="h-1.5 bg-paper-deep">
                <div className="h-full bg-sumi" style={{ width: `${(r.pageviews / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextInput } from "@/components/ui/TextInput";
import type { AnalyticsReport, ReportDays } from "@/lib/analytics/report";
import { BarList, DailyChart, StatTile } from "./AdminCharts";

const DAY_ITEMS = [
  { value: "7", label: "7일" },
  { value: "30", label: "30일" },
] as const;

const DEVICE: Record<string, string> = { desktop: "데스크톱", mobile: "모바일", tablet: "태블릿" };

function countryName(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  return new Intl.DisplayNames(["ko"], { type: "region" }).of(code) ?? code;
}

async function requestReport(password: string, days: ReportDays): Promise<AnalyticsReport> {
  const res = await fetch("/api/admin/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, days }),
  });
  const body = (await res.json().catch(() => null)) as (AnalyticsReport & { error?: string }) | null;
  if (!res.ok || !body) throw new Error(body?.error ?? "분석을 불러오지 못했습니다.");
  return body;
}

/**
 * 통계 탭의 "관리자" 버튼 → 비밀번호 입력 → 사이트 방문 분석(Vercel Web Analytics).
 * 비밀번호는 서버(/api/admin/analytics)가 확인하고, 기간을 바꿀 때 다시 보내려고 이 화면에 있는 동안만 메모리에 둔다(저장하지 않음).
 */
export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (pw: string, days: ReportDays) => {
    setBusy(true);
    setError(null);
    try {
      setReport(await requestReport(pw, days));
      setPassword(pw);
      setOpen(false);
      setInput("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const close = () => {
    setReport(null);
    setPassword(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="text"
          onClick={report ? close : () => setOpen(true)}
          className="text-sm text-muted"
        >
          {report ? "관리자 닫기" : "관리자"}
        </Button>
      </div>

      {report && password && (
        <AdminReport
          report={report}
          busy={busy}
          error={error}
          onDays={(days) => load(password, days)}
        />
      )}

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="관리자"
        footer={
          <Button block disabled={busy || !input} onClick={() => load(input, 7)}>
            {busy ? "확인 중…" : "확인"}
          </Button>
        }
      >
        <div className="flex flex-col gap-2 pt-1">
          <TextInput
            label="비밀번호"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onEnter={() => input && !busy && load(input, 7)}
          />
          {error && (
            <p role="alert" className="text-sm text-shu">
              {error}
            </p>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

/** 분석 화면: 합계 숫자 → 일별 추이 → 페이지·국가·기기·유입 순위 */
export function AdminReport({
  report,
  busy,
  error,
  onDays,
}: {
  report: AnalyticsReport;
  busy: boolean;
  error: string | null;
  onDays(days: ReportDays): void;
}) {
  return (
    <section aria-labelledby="admin-heading" className="flex flex-col gap-6 bg-paper-deep p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="admin-heading" className="font-display text-lg font-bold">
          사이트 분석
        </h2>
        <SegmentedControl
          label="기간"
          items={DAY_ITEMS}
          value={String(report.days) as "7" | "30"}
          onChange={(v) => !busy && onDays(Number(v) as ReportDays)}
          className="w-32 shrink-0"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-shu">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="방문자" value={report.totals.visitors} />
        <StatTile label="페이지뷰" value={report.totals.pageviews} />
      </div>
      <DailyChart data={report.daily} />
      <BarList title="많이 본 페이지" rows={report.pages} />
      <div className="grid gap-6 sm:grid-cols-2">
        <BarList title="국가" rows={report.countries} label={countryName} />
        <BarList title="기기" rows={report.devices} label={(d) => DEVICE[d] ?? d} />
      </div>
      <BarList title="유입 경로" rows={report.referrers} />
      <p className="text-xs text-muted">
        쿠키 없이 익명으로 집계한 수치라 개인은 알 수 없습니다. 날짜는 UTC 기준입니다.
      </p>
    </section>
  );
}

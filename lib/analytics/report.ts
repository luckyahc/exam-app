import type { DeviceReport } from "./devices";

/**
 * Vercel Web Analytics 조회(서버 전용, app/api/admin/analytics/route.ts가 쓴다). 문서: https://vercel.com/docs/analytics/web-analytics-api
 * 방문자는 쿠키 없이 익명으로 집계된 값이라 "누가" 접속했는지는 알 수 없다. 조회 범위는 프로덕션 배포만.
 */
const API = "https://api.vercel.com/v1/query/web-analytics/visits";

/** 이 날짜(UTC)부터의 데이터만 관리자 화면에 보여 준다. Vercel의 이전 데이터는 지울 수 없어 그대로 남아 있고 조회만 하지 않는다 */
export const ANALYTICS_START = "2026-11-07";

export const REPORT_DAYS = [7, 30] as const;
export type ReportDays = (typeof REPORT_DAYS)[number];

export interface DayPoint {
  /** YYYY-MM-DD(UTC) */
  date: string;
  pageviews: number;
  visitors: number;
}
export interface BarRow {
  label: string;
  pageviews: number;
  visitors: number;
}
export interface AnalyticsReport {
  days: ReportDays;
  /** 표시 시작 날짜 */
  start: string;
  totals: { pageviews: number; visitors: number };
  daily: DayPoint[];
  pages: BarRow[];
  countries: BarRow[];
  devices: BarRow[];
  referrers: BarRow[];
  /** 기기 기준 집계(lib/analytics/devices.ts). 저장소가 없거나 읽지 못하면 null */
  deviceStats?: DeviceReport | null;
}
export interface AnalyticsConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

export class AnalyticsApiError extends Error {
  constructor(readonly status: number) {
    super(`Web Analytics API ${status}`);
  }
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * 오늘(UTC)을 포함한 최근 days일(start 이전은 뺀다). queryUntil은 API에 보내는 끝 날짜로 내일이다 —
 * 날짜만 보내면 시간 단위로 맞춰져 그날 01시까지만 조회되어, 항목별 집계에서 오늘 데이터가 빠진다
 */
export function reportRange(days: number, now = new Date(), start = ANALYTICS_START) {
  const first = new Date(now);
  first.setUTCDate(first.getUTCDate() - (days - 1));
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + 1);
  const since = iso(first) < start ? start : iso(first);
  return { since, until: iso(now), queryUntil: iso(next) };
}

/** 방문이 없는 날은 응답에 없으므로 0으로 채워 날짜가 끊기지 않게 한다 */
export function fillDays(
  rows: readonly { timestamp: string; pageviews?: number; visitors?: number }[],
  since: string,
  until: string,
): DayPoint[] {
  const byDay = new Map(rows.map((r) => [r.timestamp.slice(0, 10), r]));
  const out: DayPoint[] = [];
  for (const d = new Date(`${since}T00:00:00Z`); iso(d) <= until; d.setUTCDate(d.getUTCDate() + 1)) {
    const r = byDay.get(iso(d));
    out.push({ date: iso(d), pageviews: r?.pageviews ?? 0, visitors: r?.visitors ?? 0 });
  }
  return out;
}

/** 항목별 행: 많은 순, "Others"는 맨 뒤 "기타"로. 값이 없는 행은 emptyLabel(유입 경로의 직접 접속 등) */
export function toBars(
  rows: readonly Record<string, unknown>[],
  key: string,
  emptyLabel = "(알 수 없음)",
): BarRow[] {
  const bars = rows.map((r) => ({
    label: typeof r[key] === "string" && r[key] ? (r[key] as string) : emptyLabel,
    pageviews: Number(r.pageviews) || 0,
    visitors: Number(r.visitors) || 0,
  }));
  const rest = bars.filter((b) => b.label === "Others").map((b) => ({ ...b, label: "기타" }));
  return [
    ...bars.filter((b) => b.label !== "Others").sort((a, b) => b.pageviews - a.pageviews),
    ...rest,
  ];
}

export async function fetchReport(
  cfg: AnalyticsConfig,
  days: ReportDays,
  fetchFn: typeof fetch = fetch,
  now = new Date(),
  start = ANALYTICS_START,
): Promise<AnalyticsReport> {
  const { since, until, queryUntil } = reportRange(days, now, start);
  // 시작 날짜 전에는 보여 줄 데이터가 없다
  if (since > until)
    return {
      days,
      start,
      totals: { pageviews: 0, visitors: 0 },
      daily: [],
      pages: [],
      countries: [],
      devices: [],
      referrers: [],
    };
  const get = async <T,>(path: "count" | "aggregate", params: Record<string, string>): Promise<T> => {
    const q = new URLSearchParams({
      projectId: cfg.projectId,
      since,
      until: queryUntil,
      ...(cfg.teamId ? { teamId: cfg.teamId } : {}),
      ...params,
    });
    const res = await fetchFn(`${API}/${path}?${q}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new AnalyticsApiError(res.status);
    return ((await res.json()) as { data: T }).data;
  };
  const by = (dimension: string, limit: number) =>
    get<Record<string, unknown>[]>("aggregate", { by: dimension, limit: String(limit) });

  const [totals, daily, pages, countries, devices, referrers] = await Promise.all([
    get<{ pageviews?: number; visitors?: number }>("count", {}),
    get<{ timestamp: string; pageviews?: number; visitors?: number }[]>("aggregate", {
      by: "day",
      limit: "100",
    }),
    by("requestPath", 8),
    by("country", 6),
    by("deviceType", 4),
    by("referrerHostname", 6),
  ]);
  return {
    days,
    start,
    totals: { pageviews: totals.pageviews ?? 0, visitors: totals.visitors ?? 0 },
    daily: fillDays(daily, since, until),
    pages: toBars(pages, "requestPath"),
    countries: toBars(countries, "country"),
    devices: toBars(devices, "deviceType"),
    referrers: toBars(referrers, "referrerHostname", "(직접 접속)"),
  };
}

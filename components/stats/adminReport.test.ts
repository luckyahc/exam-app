import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AnalyticsReport } from "@/lib/analytics/report";
import { AdminPanel, AdminReport } from "./AdminPanel";

const report: AnalyticsReport = {
  days: 7,
  totals: { pageviews: 120, visitors: 34 },
  daily: [
    { date: "2026-11-05", pageviews: 10, visitors: 4 },
    { date: "2026-11-06", pageviews: 20, visitors: 8 },
  ],
  pages: [{ label: "/s/os", pageviews: 20, visitors: 8 }],
  countries: [{ label: "KR", pageviews: 20, visitors: 8 }],
  devices: [{ label: "mobile", pageviews: 20, visitors: 8 }],
  referrers: [],
};

describe("관리자 분석 화면", () => {
  it("처음에는 관리자 버튼만 있고 분석이 없다", () => {
    const h = renderToStaticMarkup(createElement(AdminPanel));
    expect(h).toContain("관리자");
    expect(h).not.toContain("사이트 분석");
  });

  it("합계·그래프·순위를 보여 주고 값이 없는 항목은 안내한다", () => {
    const h = renderToStaticMarkup(createElement(AdminReport, { report, busy: false, error: null, onDays() {} }));
    expect(h).toContain("120");
    expect(h).toContain('role="img"');
    expect(h).toContain("표로 보기");
    expect(h).toContain("/s/os");
    expect(h).toContain("대한민국");
    expect(h).toContain("모바일");
    expect(h).toContain("아직 데이터가 없습니다");
  });
});

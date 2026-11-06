import { describe, expect, it } from "vitest";
import { createLimiter, passwordMatches } from "./guard";
import { AnalyticsApiError, fetchReport, fillDays, reportRange, toBars } from "./report";

const NOW = new Date("2026-11-20T12:00:00Z");

describe("분석 조회", () => {
  it("기간은 오늘을 포함하고, 빈 날은 0으로 채운다", () => {
    expect(reportRange(7, NOW)).toEqual({ since: "2026-11-14", until: "2026-11-20", queryUntil: "2026-11-21" });
    expect(reportRange(30, NOW).since).toBe("2026-11-07"); // 기준 날짜 이전은 조회하지 않는다
    const days = fillDays([{ timestamp: "2026-11-05T00:00:00.000Z", pageviews: 5, visitors: 2 }], "2026-11-04", "2026-11-06");
    expect(days).toEqual([
      { date: "2026-11-04", pageviews: 0, visitors: 0 },
      { date: "2026-11-05", pageviews: 5, visitors: 2 },
      { date: "2026-11-06", pageviews: 0, visitors: 0 },
    ]);
  });

  it("항목은 많은 순, Others는 맨 뒤 기타, 값 없는 행은 대체 이름", () => {
    const rows = [
      { country: "Others", pageviews: 100, visitors: 1 },
      { country: "KR", pageviews: 3, visitors: 1 },
      { country: "US", pageviews: 9, visitors: 2 },
      { country: "", pageviews: 1, visitors: 1 },
    ];
    expect(toBars(rows, "country", "없음").map((r) => r.label)).toEqual(["US", "KR", "없음", "기타"]);
  });

  it("요청에 토큰·프로젝트·기간을 넣고 응답을 합친다", async () => {
    const urls: URL[] = [];
    let auth = "";
    const fake = (async (input: string, init: RequestInit) => {
      const url = new URL(input);
      urls.push(url);
      auth = (init.headers as Record<string, string>).Authorization;
      const by = url.searchParams.get("by");
      const data = !by
        ? { pageviews: 12, visitors: 4 }
        : by === "day"
          ? [{ timestamp: "2026-11-20T00:00:00.000Z", pageviews: 12, visitors: 4 }]
          : [{ [by]: "x", pageviews: 12, visitors: 4 }];
      return Response.json({ data });
    }) as unknown as typeof fetch;

    const r = await fetchReport({ token: "t", projectId: "p", teamId: "team" }, 7, fake, NOW);
    expect(auth).toBe("Bearer t");
    expect(urls[0].pathname).toBe("/v1/query/web-analytics/visits/count");
    expect(urls.every((u) => u.searchParams.get("projectId") === "p" && u.searchParams.get("teamId") === "team")).toBe(true);
    expect(urls.map((u) => u.searchParams.get("by"))).toEqual([null, "day", "requestPath", "country", "deviceType", "referrerHostname"]);
    expect(urls.every((u) => u.searchParams.get("until") === "2026-11-21")).toBe(true); // 오늘 데이터가 빠지지 않게 내일까지
    expect(r.totals).toEqual({ pageviews: 12, visitors: 4 });
    expect(r.daily).toHaveLength(7);
    expect(r.pages[0].label).toBe("x");
  });

  it("기준 날짜 전에는 API를 부르지 않고 빈 결과", async () => {
    let called = 0;
    const fake = (async () => {
      called++;
      return Response.json({ data: [] });
    }) as unknown as typeof fetch;
    const r = await fetchReport({ token: "t", projectId: "p" }, 7, fake, new Date("2026-11-06T12:00:00Z"));
    expect(called).toBe(0);
    expect(r.daily).toEqual([]);
    expect(r.start).toBe("2026-11-07");
  });

  it("API 오류는 상태 코드로 알린다", async () => {
    const fake = (async () => new Response("", { status: 403 })) as unknown as typeof fetch;
    await expect(fetchReport({ token: "t", projectId: "p" }, 7, fake, NOW)).rejects.toBeInstanceOf(AnalyticsApiError);
  });
});

describe("관리자 비밀번호", () => {
  it("같은 문자열만 통과", () => {
    expect(passwordMatches("abcd", "abcd")).toBe(true);
    expect(passwordMatches("abce", "abcd")).toBe(false);
    expect(passwordMatches(undefined, "abcd")).toBe(false);
  });

  it("연달아 틀리면 막고, 시간이 지나거나 맞히면 풀린다", () => {
    let t = 0;
    const l = createLimiter({ max: 2, windowMs: 100 }, () => t);
    l.fail("a");
    expect(l.blocked("a")).toBe(false);
    l.fail("a");
    expect(l.blocked("a")).toBe(true);
    expect(l.blocked("b")).toBe(false);
    t = 200;
    expect(l.blocked("a")).toBe(false);
    l.fail("a");
    l.reset("a");
    l.fail("a");
    expect(l.blocked("a")).toBe(false);
  });
});

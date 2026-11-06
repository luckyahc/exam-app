import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

let ipCount = 0;
const post = (body: unknown, ip = `10.0.0.${++ipCount}`) =>
  POST(
    new Request("http://x/api/admin/analytics", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("관리자 분석 API", () => {
  it("비밀번호 환경 변수가 없으면 503", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect((await post({ password: "x" })).status).toBe(503);
  });

  it("틀린 비밀번호는 401이고 분석을 요청하지 않으며, 여러 번 틀리면 429", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "right");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    for (let i = 0; i < 5; i++) expect((await post({ password: "wrong" }, "1.1.1.1")).status).toBe(401);
    expect((await post({ password: "right" }, "1.1.1.1")).status).toBe(429);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("맞으면 분석을 돌려주고 토큰은 응답에 없다", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "right");
    vi.stubEnv("VERCEL_ANALYTICS_TOKEN", "secret-token");
    vi.stubEnv("ANALYTICS_PROJECT_ID", "prj");
    vi.stubGlobal("fetch", async (url: string) =>
      Response.json({ data: url.includes("/count") ? { pageviews: 3, visitors: 2 } : [] }),
    );
    const res = await post({ password: "right", days: 30 });
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(JSON.parse(text).days).toBe(30);
    expect(JSON.parse(text).daily).toHaveLength(30);
    expect(text).not.toContain("secret-token");
  });

  it("맞아도 토큰이 없으면 503, Vercel 오류는 502", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "right");
    vi.stubEnv("VERCEL_ANALYTICS_TOKEN", "");
    expect((await post({ password: "right" })).status).toBe(503);
    vi.stubEnv("VERCEL_ANALYTICS_TOKEN", "t");
    vi.stubEnv("ANALYTICS_PROJECT_ID", "prj");
    vi.stubGlobal("fetch", async () => new Response("", { status: 403 }));
    expect((await post({ password: "right" })).status).toBe(502);
  });
});

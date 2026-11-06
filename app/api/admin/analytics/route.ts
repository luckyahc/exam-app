import { deviceStore, readDevices } from "@/lib/analytics/devices";
import { createLimiter, passwordMatches } from "@/lib/analytics/guard";
import { AnalyticsApiError, fetchReport, REPORT_DAYS, type ReportDays } from "@/lib/analytics/report";

const limiter = createLimiter({ max: 5, windowMs: 10 * 60_000 });
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Web Analytics API 오류를 관리자에게 보일 문구로(토큰 값은 응답에 넣지 않는다) */
function apiMessage(status: number) {
  if (status === 401 || status === 403) return "Vercel 토큰이 잘못되었거나 이 프로젝트 권한이 없습니다.";
  if (status === 402) return "현재 Vercel 요금제로는 이 조회를 쓸 수 없습니다.";
  if (status === 404) return "프로젝트를 찾을 수 없거나 Web Analytics가 꺼져 있습니다.";
  return "Vercel에서 분석 데이터를 가져오지 못했습니다.";
}

/** 관리자 분석: 본문 { password, days }. 정적 페이지에는 비밀번호·토큰이 들어가지 않고 이 서버 함수에서만 쓴다 */
export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return json({ error: "관리자 비밀번호(ADMIN_PASSWORD)가 설정되지 않았습니다." }, 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (limiter.blocked(ip))
    return json({ error: "비밀번호를 여러 번 틀렸습니다. 10분 뒤에 다시 시도해 주세요." }, 429);

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    days?: unknown;
  } | null;
  if (!passwordMatches(body?.password, expected)) {
    limiter.fail(ip);
    return json({ error: "비밀번호가 틀렸습니다." }, 401);
  }
  limiter.reset(ip);

  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.ANALYTICS_PROJECT_ID ?? process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId)
    return json({ error: "분석 토큰(VERCEL_ANALYTICS_TOKEN)이 설정되지 않았습니다." }, 503);

  const days: ReportDays = REPORT_DAYS.find((d) => d === body?.days) ?? 7;
  try {
    const report = await fetchReport(
      { token, projectId, teamId: process.env.ANALYTICS_TEAM_ID },
      days,
    );
    const redis = deviceStore();
    const deviceStats = redis
      ? await readDevices(redis, report.daily.map((d) => d.date)).catch(() => null)
      : null;
    return json({ ...report, deviceStats });
  } catch (e) {
    const status = e instanceof AnalyticsApiError ? e.status : 0;
    return json({ error: apiMessage(status) }, 502);
  }
}

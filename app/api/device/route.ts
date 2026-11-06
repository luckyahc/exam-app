import { deviceStore, isDeviceId, recordDevice } from "@/lib/analytics/devices";

const NO_CONTENT = { status: 204, headers: { "Cache-Control": "no-store" } };

/** 기기 방문 기록: 본문 { id }. 저장소가 없는 환경(로컬·미리보기)에서는 아무것도 하지 않는다 */
export async function POST(request: Request) {
  const redis = deviceStore();
  if (!redis) return new Response(null, NO_CONTENT);

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  if (!isDeviceId(body?.id)) return new Response(null, { status: 400 });

  try {
    await recordDevice(redis, body.id, new Date().toISOString().slice(0, 10));
    return new Response(null, NO_CONTENT);
  } catch {
    return new Response(null, { status: 502 });
  }
}

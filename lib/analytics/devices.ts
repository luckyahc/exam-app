import { Redis } from "@upstash/redis";

/**
 * 기기 기준 방문 집계(서버 전용). 브라우저가 만든 무작위 기기 번호만 저장한다(이름·IP 없음).
 * 번호는 localStorage에 있어 네트워크가 바뀌거나 다음 날이 되어도 같고, 브라우저가 다르거나 사이트 데이터를 지우면 새 기기로 센다.
 * - devices:all = 지금까지 본 기기 / devices:day:<날짜> = 그날 방문 기기 / devices:new:<날짜> = 그날 처음 본 기기
 * 날짜는 UTC(Web Analytics 그래프와 같은 기준).
 */
const ALL = "devices:all";
const dayKey = (date: string) => `devices:day:${date}`;
const newKey = (date: string) => `devices:new:${date}`;
/** 날짜별 기록은 Hobby 보고 기간보다 넉넉히 두고 지운다 */
const DAY_TTL_SECONDS = 90 * 86_400;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const isDeviceId = (id: unknown): id is string => typeof id === "string" && UUID.test(id);

export type DeviceRedis = Pick<Redis, "sadd" | "expire" | "scard" | "sunion">;

export interface DeviceReport {
  /** 지금까지 본 기기 */
  total: number;
  /** 기간 안에 방문한 고유 기기 */
  inRange: number;
  /** 기간 안에 처음 본 기기 */
  newInRange: number;
  daily: { date: string; devices: number; newDevices: number }[];
}

/** Vercel이 연결한 Upstash 저장소. 환경 변수가 없으면(로컬·미리보기) null */
export function deviceStore(): DeviceRedis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function recordDevice(redis: DeviceRedis, id: string, date: string) {
  const isNew = await redis.sadd(ALL, id);
  await redis.sadd(dayKey(date), id);
  await redis.expire(dayKey(date), DAY_TTL_SECONDS);
  if (isNew) {
    await redis.sadd(newKey(date), id);
    await redis.expire(newKey(date), DAY_TTL_SECONDS);
  }
}

export async function readDevices(redis: DeviceRedis, dates: readonly string[]): Promise<DeviceReport> {
  const [total, daily, members] = await Promise.all([
    redis.scard(ALL),
    Promise.all(
      dates.map(async (date) => ({
        date,
        devices: await redis.scard(dayKey(date)),
        newDevices: await redis.scard(newKey(date)),
      })),
    ),
    dates.length ? redis.sunion(...(dates.map(dayKey) as [string, ...string[]])) : [],
  ]);
  return {
    total,
    inRange: members.length,
    newInRange: daily.reduce((n, d) => n + d.newDevices, 0),
    daily,
  };
}

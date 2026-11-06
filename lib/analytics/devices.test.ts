import { describe, expect, it } from "vitest";
import { deviceVisit } from "./deviceVisit";
import { type DeviceRedis, isDeviceId, readDevices, recordDevice } from "./devices";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

function fakeRedis() {
  const sets = new Map<string, Set<string>>();
  const ttl = new Map<string, number>();
  const redis = {
    sadd: async (key: string, id: string) => {
      const s = sets.get(key) ?? new Set<string>();
      const added = s.has(id) ? 0 : 1;
      sets.set(key, s.add(id));
      return added;
    },
    expire: async (key: string, seconds: number) => {
      ttl.set(key, seconds);
      return 1;
    },
    scard: async (key: string) => sets.get(key)?.size ?? 0,
    sunion: async (...keys: string[]) => [...new Set(keys.flatMap((k) => [...(sets.get(k) ?? [])]))],
  } as unknown as DeviceRedis;
  return { redis, ttl };
}

describe("기기 집계", () => {
  it("같은 기기는 날이 달라도 누적 1대, 날마다는 따로 센다", async () => {
    const { redis, ttl } = fakeRedis();
    await recordDevice(redis, A, "2026-11-07");
    await recordDevice(redis, A, "2026-11-07");
    await recordDevice(redis, A, "2026-11-08");
    await recordDevice(redis, B, "2026-11-08");
    expect(await readDevices(redis, ["2026-11-07", "2026-11-08"])).toEqual({
      total: 2,
      inRange: 2,
      newInRange: 2,
      daily: [
        { date: "2026-11-07", devices: 1, newDevices: 1 },
        { date: "2026-11-08", devices: 2, newDevices: 1 },
      ],
    });
    expect(ttl.has("devices:v2:all")).toBe(false);
    expect(ttl.get("devices:v2:day:2026-11-07")).toBeGreaterThan(0);
  });

  it("기간이 비어 있어도 된다", async () => {
    const { redis } = fakeRedis();
    expect(await readDevices(redis, [])).toEqual({ total: 0, inRange: 0, newInRange: 0, daily: [] });
  });

  it("무작위 UUID만 받는다", () => {
    expect(isDeviceId(A)).toBe(true);
    expect(isDeviceId("x")).toBe(false);
    expect(isDeviceId(undefined)).toBe(false);
  });
});

describe("브라우저 기기 번호", () => {
  const makeId = () => "new";

  it("처음이면 만들어 보내고, 같은 날 다시 오면 보내지 않으며, 다음 날 같은 번호로 보낸다", () => {
    expect(deviceVisit(null, "d1", makeId)).toEqual({ next: { id: "new", sentOn: "2:d1" }, send: true });
    expect(deviceVisit({ id: "x", sentOn: "2:d1" }, "d1", makeId).send).toBe(false);
    expect(deviceVisit({ id: "x", sentOn: "2:d1" }, "d2", makeId)).toEqual({ next: { id: "x", sentOn: "2:d2" }, send: true });
  });

  it("집계를 새로 시작하면 오늘 이미 알린 브라우저도 같은 번호로 다시 알린다", () => {
    expect(deviceVisit({ id: "x", sentOn: "d1" }, "d1", makeId)).toEqual({ next: { id: "x", sentOn: "2:d1" }, send: true });
  });
});

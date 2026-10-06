/** 데이터과학 실행 검증 — 판다스가 필요한 문항(`npm run verify:ds`, Sprint 14). 판다스 불러오기(엔진 3개 병렬)가 길어 파일을 나눴다 */
import { afterAll, describe, expect, it } from "vitest";
import { FULL_SEEDS, createVerifyEnv, engineReady, needsPandas, verifyAll } from "./run";
import { dsQuestions, failures } from "./collect";

describe.skipIf(!engineReady())("데이터과학 문항 실행 검증(판다스)", () => {
  const env = engineReady() ? createVerifyEnv({ hashSeeds: FULL_SEEDS }) : (null as never);
  afterAll(() => env?.close());

  it("모든 문항 통과", async () => {
    const qs = (await dsQuestions()).filter(needsPandas);
    expect(qs.length).toBeGreaterThan(0);
    expect(failures(await verifyAll(env, qs))).toEqual([]);
  }, 180_000);
});

/**
 * 데이터과학 실행 검증 — 전체(`npm run verify:ds`, Sprint 14). 해시 시드를 바꾼 엔진 2개를 더 띄워
 * 세트 순서처럼 실행마다 달라지는 출력까지 잡는다. 판다스 문항은 dsVerify.pandas.full.test.ts.
 */
import { afterAll, describe, expect, it } from "vitest";
import { dsQuestions, failures } from "./collect";
import { FULL_SEEDS, createVerifyEnv, engineReady, needsPandas, verifyAll } from "./run";

describe.skipIf(!engineReady())("데이터과학 문항 실행 검증(전체: 해시 시드 1·2, 판다스 제외)", () => {
  const env = engineReady() ? createVerifyEnv({ hashSeeds: FULL_SEEDS }) : (null as never);
  afterAll(() => env?.close());

  it("모든 문항 통과", async () => {
    const qs = (await dsQuestions()).filter((q) => !needsPandas(q));
    expect(failures(await verifyAll(env, qs))).toEqual([]);
  }, 180_000);
});

/**
 * 데이터과학 실행 검증 — `npm test`의 최소 검증(Sprint 14): 강의 문항 + /playground 예시를 Node Pyodide·sql.js로 실행해
 * 모범 답안·허용 답안·오답 예시·후보·출력 보기를 검사한다. 엔진 하나만 쓴다(같은 엔진 두 번 실행으로 난수·시간만 확인).
 * 해시 시드를 바꾼 엔진(세트 순서), 판다스 문항, 일부러 틀린 데이터 검사는 `npm run verify:ds`(*.full.test.ts).
 */
import { afterAll, describe, expect, it } from "vitest";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import { dsQuestions, failures } from "./collect";
import { createVerifyEnv, engineReady, needsPandas, verifyAll } from "./run";

describe.skipIf(!engineReady())("데이터과학 문항 실행 검증(판다스 제외)", () => {
  const env = engineReady() ? createVerifyEnv() : (null as never);
  afterAll(() => env?.close());

  it("모든 문항 통과", async () => {
    const qs = (await dsQuestions()).filter((q) => !needsPandas(q));
    const reps = await verifyAll(env, qs);
    expect(failures(reps)).toEqual([]);
    expect(reps.length).toBe(qs.length);
  }, 120_000);

  it("허용 답안 후보: [코드 2-12] while 예시는 규칙·작성자 후보가 accept·wrong으로 나뉘어 기록돼 있다", async () => {
    const q = dsPlaygroundQuestions().find((x) => x.id === "data-science-lec2-demo-code-blank-002")!;
    const [r] = await verifyAll(env, [q]);
    expect(r.problems).toEqual([]);
    expect(r.candidates.map((c) => `${c.blank}:${c.source}:${c.text}=${c.outcome}`)).toEqual([
      "0:int-bound:i < 10=same",
      "0:mirror:9 >= i=same",
      "0:paren:(i <= 9)=same",
      "0:spacing:i<=9=token-equal",
      "0:author:i != 10=same",
      "0:author:10 > i=same",
      "0:author:i < 9=different",
      "1:aug-to-plain:i = i + 1=same",
      "1:spacing:i+=1=token-equal",
      "1:author:i = 1 + i=same",
      "1:author:i += 2=different",
    ]);
  }, 60_000);
});

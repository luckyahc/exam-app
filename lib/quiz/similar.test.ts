import { describe, expect, it } from "vitest";
import os from "@/data/subjects/os";
import { validateBase } from "@/lib/qtypes/base";
import { answerKey } from "@/lib/qtypes/answerKey";
import { coreFor, gradeQuestion } from "@/lib/qtypes/registry";
import { mulberry32 } from "@/lib/random";
import { OS_GENERATORS } from "@/lib/sim/os/generators";
import { makeSimilar, SIMILAR_SEED_MIN } from "./similar";

describe("비슷한 문제 새로 생성", async () => {
  const all = (await Promise.all(os.chapters.map((c) => c.load()))).flat();
  const genQs = all.filter((q) => q.generator);
  const staticIds = new Set(all.map((q) => q.id));

  it("문제 데이터에 생성기 문항이 있다", () => expect(genQs.length).toBeGreaterThan(0));

  it("생성기가 없는 문제에는 만들지 않는다", () => {
    expect(makeSimilar(all.find((q) => !q.generator)!, OS_GENERATORS)).toBeNull();
  });

  it.each(genQs.map((q) => [q.id, q] as const))("%s: 같은 생성기·params, 다른 seed·id, 유효한 문제, 정답 키 = 1점", (_, q) => {
    const rand = mulberry32(42);
    const seen = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const s = makeSimilar(q, OS_GENERATORS, rand)!;
      expect(s.generator).toMatchObject({ name: q.generator!.name, params: q.generator!.params });
      expect(s.generator!.seed).toBeGreaterThanOrEqual(SIMILAR_SEED_MIN);
      expect(s.id).not.toBe(q.id);
      expect(staticIds.has(s.id)).toBe(false); // 데이터 문항 기록과 섞이지 않음
      expect(s.type).toBe(q.type);
      expect([...validateBase(s), ...coreFor(s).validate(s as never)]).toEqual([]);
      expect(gradeQuestion(s, answerKey(s)).score).toBe(1);
      seen.add(s.id);
    }
    expect(seen.size).toBe(5); // 누를 때마다 다른 문제
  });
});

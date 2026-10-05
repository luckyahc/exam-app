import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/lib/random";
import { OS_GENERATORS } from "@/lib/sim/os/generators";
import { recordAttempt } from "@/lib/storage/records";
import { emptySubjectRecords } from "@/lib/storage/schema";
import { loadQuestions } from "./loadQuestions";
import { newSession } from "./session";
import { makeSimilar } from "./similar";

describe("오답노트의 생성 문제 다시 풀기 — 저장된 generator·params·seed로 같은 문제", async () => {
  const base = OS_GENERATORS.replacement.generate(3, { variant: "count", algo: "lru" });
  const gen = makeSimilar(base, OS_GENERATORS, mulberry32(7))!;

  it("다시 풀기 세션 항목에 생성기 정보가 남고, 그것만으로 같은 문제가 다시 만들어진다", async () => {
    const s = newSession([gen], { mode: "instant", label: "다시 풀기", backHref: "/review" });
    expect(s.items[0].gen).toEqual(gen.generator);
    // 오답 기록(gens) 없이 세션 항목만으로
    const map = await loadQuestions(s.items);
    expect(map.get(gen.id)).toEqual(gen);
  });

  it("세션 항목에 gen이 없어도(이전 세션) 오답 기록의 gen으로 같은 문제", async () => {
    const rec = recordAttempt(emptySubjectRecords(), gen.id, { correct: false, score: 0 }, "2026-10-05T00:00:00.000Z", gen.generator);
    const map = await loadQuestions([{ id: gen.id, subject: "os", chapter: gen.chapter }], { [gen.id]: rec.wrong[gen.id].gen });
    expect(map.get(gen.id)).toEqual(gen);
  });

  it("JSON으로 저장했다 읽어도(세션 저장소 왕복) 같은 문제", async () => {
    const s = JSON.parse(JSON.stringify(newSession([gen], { mode: "instant", label: "x", backHref: "/" })));
    expect((await loadQuestions(s.items)).get(gen.id)).toEqual(gen);
  });
});

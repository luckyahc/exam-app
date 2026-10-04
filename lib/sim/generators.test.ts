import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data/subjects/registry";
import type { SubjectDef } from "@/data/subjects/types";
import { answerKey } from "@/lib/qtypes/answerKey";
import { validateBase } from "@/lib/qtypes/base";
import { coreFor, gradeQuestion, isQType } from "@/lib/qtypes/registry";
import { genId } from "./_shared/types";

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * 전 과목 생성기 스모크 테스트 — 레지스트리의 모든 과목을 순회하므로 Sprint 9의 데이터 통신 생성기도
 * 추가되는 즉시 같은 검사를 받는다.
 */
describe.each(SUBJECTS.map((s): [string, SubjectDef] => [s.id, s]))("%s 생성기", (_, subject) => {
  it("생성기 목록을 불러올 수 있다(없으면 빈 목록)", async () => {
    const gens = (await subject.loadGenerators?.()) ?? {};
    for (const [key, g] of Object.entries(gens)) {
      expect(g.name).toBe(key);
      // 생성기 이름은 문제 id에 들어가므로 id 규칙(소문자·숫자·하이픈)을 따라야 한다
      expect(g.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("seed 20개: 결정적이고, 무결성 검사를 통과하고, 정답 키로 채점하면 정답", async () => {
    const gens = (await subject.loadGenerators?.()) ?? {};
    const errors: string[] = [];
    for (const g of Object.values(gens)) {
      expect(
        subject.chapters.some((c) => c.id === g.chapter),
        `${g.name}.chapter`,
      ).toBe(true);
      for (const seed of SEEDS) {
        const q = g.generate(seed);
        const where = `${g.name}#${seed}`;
        expect(g.generate(seed), `${where} 결정적`).toEqual(q);
        expect(q.subject).toBe(subject.id);
        expect(q.id).toBe(genId(subject.id, q.chapter, g.name, seed));
        expect(q.generator).toMatchObject({ name: g.name, seed });
        expect(
          subject.chapters.some((c) => c.id === q.chapter),
          `${where} chapter`,
        ).toBe(true);
        expect(isQType(q.type)).toBe(true);
        for (const e of [...validateBase(q), ...coreFor(q).validate(q as never)])
          errors.push(`${where}: ${e}`);
        const r = gradeQuestion(q, answerKey(q));
        if (!r.correct) errors.push(`${where}: 정답 키가 정답으로 채점되지 않음`);
        // 같은 params로 다른 seed를 주면 같은 변형(params)이 유지된다 — "비슷한 문제 새로 생성"
        const again = g.generate(seed + 1000, q.generator!.params);
        expect(again.generator!.params, `${where} params 유지`).toEqual(q.generator!.params);
      }
    }
    expect(errors).toEqual([]);
  });

  it("seed가 다르면 대체로 다른 문제가 나온다", async () => {
    const gens = (await subject.loadGenerators?.()) ?? {};
    for (const g of Object.values(gens)) {
      const prompts = new Set(
        SEEDS.map((s) => JSON.stringify({ ...g.generate(s), id: "", generator: null })),
      );
      expect(prompts.size, g.name).toBeGreaterThanOrEqual(15);
    }
  });
});

describe("OS 생성기 세부 규칙", () => {
  it("Next-fit의 '마지막 배치가 끝난 주소'는 빈 블록 안이 아니다 (seed 200개)", async () => {
    const { OS_GENERATORS } = await import("./os/generators");
    for (let seed = 1; seed <= 200; seed++) {
      const q = OS_GENERATORS.placement.generate(seed, { fit: "next" });
      if (q.type !== "mcq") throw new Error("placement는 mcq");
      const last = Number(/마지막 배치가 끝난 주소: (\d+)K/.exec(q.prompt)?.[1]);
      const holes = [...q.prompt.matchAll(/(\d+)K~(\d+)K/g)].map((m) => [
        Number(m[1]),
        Number(m[2]),
      ]);
      for (const [s, e] of holes)
        expect(last > s && last < e, `seed ${seed}: ${last} in ${s}~${e}`).toBe(false);
    }
  });
});

describe("폴트 수 기준 규칙: 교체 문제 해설에 다른 기준(초기 적재 포함) 값", () => {
  it("F 횟수 문제(calc)는 문장에 슬라이드 F 기준을 밝히고, 해설에 '초기 적재까지 포함하면 N회'가 있다", async () => {
    const { OS_GENERATORS } = await import("./os/generators");
    const { simulateReplacement } = await import("./os/replacement");
    for (const algo of ["opt", "lru", "fifo", "clock"] as const) {
      for (let seed = 1; seed <= 25; seed++) {
        const q = OS_GENERATORS.replacement.generate(seed, { variant: "count", algo });
        if (q.type !== "calc") throw new Error("count 변형은 calc");
        const refs = /참조열 `([\d ]+)`/.exec(q.prompt)![1].split(" ").map(Number);
        const r = simulateReplacement(refs, 3, algo);
        expect(q.prompt).toContain("처음 다 채워진 **뒤**의 페이지 폴트만");
        expect(q.answer).toBe(r.faults);
        expect(q.explanation, `${algo}#${seed}`).toContain(`초기 적재까지 포함하면 ${r.misses}회`);
      }
    }
  });

  it("trace 변형 해설에도 F 수와 초기 적재 포함 값을 함께 적는다", async () => {
    const { OS_GENERATORS } = await import("./os/generators");
    for (let seed = 1; seed <= 10; seed++) {
      const q = OS_GENERATORS.replacement.generate(seed, { variant: "trace", algo: "fifo" });
      expect(q.explanation).toMatch(/F는 총 \d+번\. 초기 적재까지 포함하면 \d+회/);
    }
  });

  it("Figure 8.15 CLOCK 기준 문구: F 5회 → 초기 적재까지 포함하면 8회", async () => {
    const { otherBasis } = await import("./os/generators");
    expect(otherBasis({ faults: 5, misses: 8 })).toBe(
      "초기 적재까지 포함하면 8회(초기 적재 3회 + F 5회).",
    );
  });
});

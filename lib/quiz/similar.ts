import type { Question } from "@/lib/qtypes/registry";
import type { GeneratorMap } from "@/lib/sim/_shared/types";

/**
 * "비슷한 문제 새로 생성": 같은 생성기·같은 params에 seed만 바꿔 새 문제를 만든다. 정답은 생성기가 시뮬레이터로 계산한다.
 * 새 seed는 1,000,000 이상에서 뽑는다 — 문제 데이터에 고정해 둔 생성기 문항(seed가 작은 정수)과 id가 겹치지 않아,
 * 새 문제의 학습 기록(`…-gen-{이름}-{새 seed}`)이 원래 문제 기록과 섞이지 않는다.
 */
export const SIMILAR_SEED_MIN = 1_000_000;

export function similarSeed(rand: () => number, exclude: number): number {
  for (;;) {
    const seed = SIMILAR_SEED_MIN + Math.floor(rand() * 2_000_000_000);
    if (seed !== exclude) return seed;
  }
}

export function makeSimilar(q: Question, generators: GeneratorMap, rand: () => number = Math.random): Question | null {
  if (!q.generator) return null;
  const gen = generators[q.generator.name];
  if (!gen) return null;
  return gen.generate(similarSeed(rand, q.generator.seed), q.generator.params);
}

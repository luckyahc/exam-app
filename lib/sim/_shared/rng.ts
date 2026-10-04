import { mulberry32 } from "@/lib/random";

/** 생성기용 seed 난수. 같은 seed면 항상 같은 순서로 같은 값을 낸다. */
export interface Rng {
  /** [0, 1) */
  next(): number;
  /** [min, max] 정수 */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** 섞은 사본 */
  shuffle<T>(items: readonly T[]): T[];
  /** 서로 다른 k개 */
  sample<T>(items: readonly T[], k: number): T[];
  chance(p: number): boolean;
}

export function createRng(seed: number): Rng {
  const next = mulberry32(seed);
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const shuffle = <T>(items: readonly T[]) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return {
    next,
    int,
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffle,
    sample: (items, k) => shuffle(items).slice(0, k),
    chance: (p) => next() < p,
  };
}

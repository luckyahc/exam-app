/** 결정적 난수 — 같은 seed면 항상 같은 결과(서버 렌더와 클라이언트 렌더가 일치해야 하는 셔플 등). */

/** FNV-1a 32비트 해시. 문자열 seed(문제 id 등)를 숫자로 바꾼다. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG: [0, 1) 실수를 내는 함수를 돌려준다. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 0..n-1을 seed로 섞은 순서. n ≥ 2이면 원래 순서(정답 순서)가 그대로 나오지 않도록 보장한다
 * (순서 배치 문제가 처음부터 정답 상태로 보이면 안 되므로).
 */
export function shuffledIndexes(n: number, seed: string): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(hashString(seed));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (n >= 2 && out.every((v, i) => v === i)) out.push(out.shift()!);
  return out;
}

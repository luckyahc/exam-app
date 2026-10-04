/**
 * Base·Bounds 레지스터 (Ch07 p.7): 한 쌍의 레지스터로 재배치와 보호를 하드웨어가 동시에 처리한다.
 * - 재배치: 절대주소 = 상대주소 + base
 * - 보호: 상대주소 < bounds 이어야 하고, 아니면 보호 위반(트랩)
 */

export type BaseBoundsResult =
  | { trap: false; physical: number }
  | { trap: true; physical: null };

export function baseBounds(base: number, bounds: number, relative: number): BaseBoundsResult {
  if (relative < 0) throw new RangeError("상대주소는 0 이상");
  if (relative >= bounds) return { trap: true, physical: null };
  return { trap: false, physical: base + relative };
}

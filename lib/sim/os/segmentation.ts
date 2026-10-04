/**
 * 세그먼테이션 주소 변환 (Ch07 p.37-41, 원본 §6-2).
 * 세그먼트 최대 크기 S를 가정: seg = floor(L/S), offset = L%S. offset ≥ length면 보호 위반(트랩).
 */

export interface Segment {
  base: number;
  length: number;
}

export type SegResult =
  | { segment: number; offset: number; trap: false; physical: number }
  | { segment: number; offset: number; trap: true; physical: null; length: number };

export function segLogicalToPhysical(
  table: readonly Segment[],
  maxSegmentSize: number,
  logical: number,
): SegResult {
  const segment = Math.floor(logical / maxSegmentSize);
  const offset = logical % maxSegmentSize;
  const seg = table[segment];
  if (!seg) throw new RangeError(`세그먼트 ${segment}가 테이블 범위 밖`);
  if (offset >= seg.length)
    return { segment, offset, trap: true, physical: null, length: seg.length };
  return { segment, offset, trap: false, physical: seg.base + offset };
}

/** 물리 → 논리: base ≤ 물리 < base+length인 세그먼트를 찾는다. 없으면 null. */
export function segPhysicalToLogical(
  table: readonly Segment[],
  maxSegmentSize: number,
  physical: number,
): { segment: number; offset: number; logical: number } | null {
  for (let segment = 0; segment < table.length; segment++) {
    const { base, length } = table[segment];
    if (physical >= base && physical < base + length) {
      const offset = physical - base;
      return { segment, offset, logical: segment * maxSegmentSize + offset };
    }
  }
  return null;
}

/** 세그먼트 테이블 빈칸(base x): 논리·실제주소가 주어지면 x = 실제주소 − offset. */
export function solveBase(logical: number, physical: number, maxSegmentSize: number): number {
  return physical - (logical % maxSegmentSize);
}

/**
 * 페이징 주소 변환 (Ch07 p.32-36, 원본 §6-1). 모두 순수 함수.
 * 페이지 테이블은 "인덱스 = 페이지 번호, 값 = 프레임 번호"(메모리에 없으면 null).
 */

export interface PageSplit {
  page: number;
  offset: number;
}

export function splitAddress(address: number, size: number): PageSplit {
  return { page: Math.floor(address / size), offset: address % size };
}

export type LogicalToPhysical =
  | (PageSplit & { frame: number; physical: number; fault: false })
  | (PageSplit & { frame: null; physical: null; fault: true });

/** 논리 → 물리: 페이지 번호를 인덱스로 바로 접근(빠름). 페이지가 메모리에 없으면 페이지 폴트. */
export function logicalToPhysical(
  table: readonly (number | null)[],
  pageSize: number,
  logical: number,
): LogicalToPhysical {
  const { page, offset } = splitAddress(logical, pageSize);
  const frame = table[page];
  if (frame === undefined) throw new RangeError(`페이지 ${page}가 페이지 테이블 범위 밖`);
  if (frame === null) return { page, offset, frame: null, physical: null, fault: true };
  return { page, offset, frame, physical: frame * pageSize + offset, fault: false };
}

export interface PhysicalToLogical {
  frame: number;
  offset: number;
  page: number;
  logical: number;
  /** 페이지 테이블을 처음부터 훑은 칸 수 — 선형 탐색이라 논리→물리보다 느리다 */
  comparisons: number;
}

/** 물리 → 논리: 프레임 번호를 값으로 가진 페이지를 테이블에서 선형 탐색. 매핑이 없으면 null. */
export function physicalToLogical(
  table: readonly (number | null)[],
  pageSize: number,
  physical: number,
): PhysicalToLogical | null {
  const { page: frame, offset } = splitAddress(physical, pageSize);
  for (let page = 0; page < table.length; page++) {
    if (table[page] === frame) {
      return { frame, offset, page, logical: page * pageSize + offset, comparisons: page + 1 };
    }
  }
  return null;
}

/**
 * 페이지 테이블 빈칸 x 구하기: 논리주소와 실제주소가 주어지면 x = (실제주소 − offset) / 페이지 크기.
 * 두 주소의 offset이 다르면 같은 페이지의 대응이 아니므로 예외.
 */
export function solveFrame(logical: number, physical: number, pageSize: number): number {
  const { offset } = splitAddress(logical, pageSize);
  if (physical % pageSize !== offset) throw new RangeError("논리·실제주소의 offset이 다름");
  return (physical - offset) / pageSize;
}

export interface BitSplit {
  pageBits: number;
  offsetBits: number;
  page: number;
  offset: number;
  /** 주소 전체 비트열 (상위 = 페이지 번호) */
  binary: string;
}

/** 비트 분해: addressBits 비트 주소, 페이지 크기 2^k → 하위 k비트 offset, 상위 비트 page. */
export function bitSplit(address: number, addressBits: number, pageSize: number): BitSplit {
  const offsetBits = Math.log2(pageSize);
  if (!Number.isInteger(offsetBits)) throw new RangeError("페이지 크기는 2의 거듭제곱");
  if (address < 0 || address >= 2 ** addressBits) throw new RangeError("주소가 비트 범위 밖");
  const { page, offset } = splitAddress(address, pageSize);
  return {
    pageBits: addressBits - offsetBits,
    offsetBits,
    page,
    offset,
    binary: address.toString(2).padStart(addressBits, "0"),
  };
}

/**
 * 메모리 용량 계산 (Ch08 p.13-17, 원본 §6-8).
 * 예: 4GB(2^32) 주소공간, 4KB(2^12) 페이지 → 2^20(약 100만) 페이지 → 엔트리 4B면 페이지 테이블 4MB →
 * 그 테이블을 담는 데 4KB 페이지 1024개 필요 → 페이지 테이블도 페이징하는 2단계 구조가 필요.
 */

export interface PageTableInfo {
  /** 가상 주소공간의 페이지 수 = 페이지 테이블 엔트리 수 */
  pages: number;
  /** 페이지 테이블 크기(바이트) */
  tableBytes: number;
  /** 페이지 테이블을 담는 데 필요한 페이지 수 */
  pagesForTable: number;
  /** 페이지 테이블이 한 페이지보다 크면 2단계(이상) 구조 필요 */
  multiLevel: boolean;
  offsetBits: number;
  pageBits: number;
}

export function pageTableInfo(
  addressBits: number,
  pageSize: number,
  entrySize: number,
): PageTableInfo {
  const offsetBits = Math.log2(pageSize);
  if (!Number.isInteger(offsetBits)) throw new RangeError("페이지 크기는 2의 거듭제곱");
  const pages = 2 ** (addressBits - offsetBits);
  const tableBytes = pages * entrySize;
  return {
    pages,
    tableBytes,
    pagesForTable: Math.ceil(tableBytes / pageSize),
    multiLevel: tableBytes > pageSize,
    offsetBits,
    pageBits: addressBits - offsetBits,
  };
}

/** 역 페이지 테이블 엔트리 수 = 실제 메모리 프레임 수(프레임 번호가 인덱스) */
export function invertedEntries(ramBytes: number, frameSize: number): number {
  return ramBytes / frameSize;
}

export const KB = 2 ** 10;
export const MB = 2 ** 20;
export const GB = 2 ** 30;

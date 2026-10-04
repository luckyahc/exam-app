/**
 * 동적 분할 배치 알고리즘 (Ch07 p.15-19, 원본 §6-4): First / Best / Next / Worst-fit.
 * 빈 블록(hole) 목록은 주소 순서. 같은 조건이면 낮은 주소 우선.
 */

export type Fit = "first" | "best" | "next" | "worst";
export const FITS: readonly Fit[] = ["first", "best", "next", "worst"];
export const FIT_LABEL: Record<Fit, string> = {
  first: "First-fit",
  best: "Best-fit",
  next: "Next-fit",
  worst: "Worst-fit",
};

export interface Hole {
  start: number;
  size: number;
}

export interface Choice {
  /** holes 배열의 인덱스. 들어갈 블록이 없으면 null */
  index: number | null;
  /** Next-fit이 메모리 끝까지 가서 처음으로 되돌아가 찾았는가 */
  wrapped: boolean;
}

/**
 * 요청 크기를 넣을 빈 블록을 고른다.
 * - first: 처음부터 훑어 충분히 큰 첫 블록
 * - best: 충분히 큰 블록 중 가장 작은 것(요청 크기에 가장 가까운 것)
 * - worst: 가장 큰 블록
 * - next: 마지막 배치가 끝난 주소(lastEnd)부터 훑고, 끝까지 없으면 처음으로 되돌아감(wrap-around)
 */
export function chooseHole(holes: readonly Hole[], request: number, fit: Fit, lastEnd = 0): Choice {
  const fits = holes.map((h, i) => ({ h, i })).filter(({ h }) => h.size >= request);
  if (fits.length === 0) return { index: null, wrapped: false };
  switch (fit) {
    case "first":
      return { index: fits[0].i, wrapped: false };
    case "best":
      return { index: fits.reduce((a, b) => (b.h.size < a.h.size ? b : a)).i, wrapped: false };
    case "worst":
      return { index: fits.reduce((a, b) => (b.h.size > a.h.size ? b : a)).i, wrapped: false };
    case "next": {
      const after = fits.find(({ h }) => h.start >= lastEnd);
      return after ? { index: after.i, wrapped: false } : { index: fits[0].i, wrapped: true };
    }
  }
}

export interface Region {
  start: number;
  size: number;
  /** 프로세스 이름, 빈 블록이면 null */
  name: string | null;
}

export type PartitionOp =
  { type: "alloc"; name: string; size: number } | { type: "free"; name: string };

export interface PartitionStep {
  op: PartitionOp;
  regions: Region[];
  /** alloc이 들어갈 곳을 못 찾았으면 true */
  failed?: boolean;
  wrapped?: boolean;
}

/**
 * 메모리 전체를 시뮬레이션: alloc은 chooseHole로 고른 빈 블록 앞부분에 배치(나머지는 빈 블록으로 남음),
 * free는 그 영역을 빈 블록으로 바꾸고 바로 이웃한 빈 블록과 합친다(합치기는 슬라이드에 명시는 없음 — 보충).
 * reserved: 맨 앞 OS 영역 크기(Figure 7.4의 8M).
 */
export function simulatePartitions(
  memorySize: number,
  reserved: number,
  ops: readonly PartitionOp[],
  fit: Fit,
): PartitionStep[] {
  let regions: Region[] = [
    ...(reserved > 0 ? [{ start: 0, size: reserved, name: "OS" }] : []),
    { start: reserved, size: memorySize - reserved, name: null },
  ];
  let lastEnd = reserved;
  const steps: PartitionStep[] = [];
  for (const op of ops) {
    if (op.type === "alloc") {
      const holes = regions.filter((r) => r.name === null);
      const { index, wrapped } = chooseHole(holes, op.size, fit, lastEnd);
      if (index === null) {
        steps.push({ op, regions, failed: true });
        continue;
      }
      const hole = holes[index];
      const at = regions.indexOf(hole);
      const placed: Region = { start: hole.start, size: op.size, name: op.name };
      const rest: Region[] =
        hole.size > op.size
          ? [{ start: hole.start + op.size, size: hole.size - op.size, name: null }]
          : [];
      regions = [...regions.slice(0, at), placed, ...rest, ...regions.slice(at + 1)];
      lastEnd = hole.start + op.size;
      steps.push({ op, regions, ...(wrapped ? { wrapped } : {}) });
    } else {
      if (!regions.some((r) => r.name === op.name)) throw new Error(`없는 프로세스: ${op.name}`);
      const freed = regions.map((r) => (r.name === op.name ? { ...r, name: null } : r));
      regions = freed.reduce<Region[]>((acc, r) => {
        const prev = acc[acc.length - 1];
        if (prev && prev.name === null && r.name === null)
          acc[acc.length - 1] = { ...prev, size: prev.size + r.size };
        else acc.push(r);
        return acc;
      }, []);
      steps.push({ op, regions });
    }
  }
  return steps;
}

/** "OS 8 | P2 14 | 6 | P4 8 | …" — 빈 블록은 크기만 */
export function formatRegions(regions: readonly Region[]): string {
  return regions.map((r) => (r.name ? `${r.name} ${r.size}` : `${r.size}`)).join(" | ");
}

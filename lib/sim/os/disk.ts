/**
 * Ch11 I/O 관리와 디스크 스케줄링(2026-11-03, 기말 범위) — 근거: source/os/Ch11 Disk Scheduling.pdf(45쪽).
 * 디스크 스케줄링(FIFO·SSTF·SCAN·C-SCAN·FSCAN·N-step-SCAN), 디스크 접근 시간, RAID 패리티. 슬라이드 기준값은 disk.test.ts.
 *
 * 슬라이드 규칙(p.22, p.26~27, p.34): 트랙 0(바깥) ~ 199(안쪽), "증가 방향" = 헤드가 들어가는 중.
 * SCAN·C-SCAN은 슬라이드 예제처럼 마지막 요청에서 방향을 바꾸는 LOOK·C-LOOK으로 계산한다(p.34 "SCAN (LOOK 기준)").
 */

export type DiskPolicy = "fifo" | "sstf" | "scan" | "cscan";
export type Direction = "up" | "down"; // up = 트랙 번호 증가(들어가는 중)

/** 대기 중인 요청에서 다음 트랙 하나를 고른다(동점이면 먼저 들어온 요청) */
function pickNext(policy: DiskPolicy, head: number, dir: Direction, queue: readonly number[]): { index: number; dir: Direction } {
  if (policy === "fifo") return { index: 0, dir };
  if (policy === "sstf") {
    let best = 0;
    for (let i = 1; i < queue.length; i++) if (Math.abs(queue[i] - head) < Math.abs(queue[best] - head)) best = i;
    return { index: best, dir: queue[best] >= head ? "up" : "down" };
  }
  const ahead = (d: Direction) => queue.map((t, i) => [t, i] as const).filter(([t]) => (d === "up" ? t >= head : t <= head));
  const nearest = (xs: (readonly [number, number])[]) => xs.reduce((a, b) => (Math.abs(b[0] - head) < Math.abs(a[0] - head) ? b : a));
  const fwd = ahead(dir);
  if (fwd.length) return { index: nearest(fwd)[1], dir };
  if (policy === "scan") {
    const back: Direction = dir === "up" ? "down" : "up";
    return { index: nearest(ahead(back))[1], dir: back };
  }
  // C-SCAN(C-LOOK): 반대쪽 끝의 요청으로 돌아가 같은 방향으로 다시 시작
  const far = queue.map((t, i) => [t, i] as const).reduce((a, b) => (dir === "up" ? (b[0] < a[0] ? b : a) : b[0] > a[0] ? b : a));
  return { index: far[1], dir };
}

export interface DiskRun {
  order: number[];
  /** 각 이동 거리 */
  moves: number[];
  total: number;
  /** 평균 탐색 길이 = total / 요청 수 */
  average: number;
  /** 끝났을 때 헤드 위치·방향 */
  head: number;
  dir: Direction;
}

/**
 * 디스크 스케줄링. `later`가 있으면 첫 요청을 고른 직후(그 트랙을 서비스하는 도중) 도착한 것으로 보고 큐에 더한다(p.28, p.33).
 */
export function scheduleDisk(policy: DiskPolicy, start: number, dir: Direction, requests: readonly number[], later: readonly number[] = []): DiskRun {
  const queue = [...requests];
  const order: number[] = [];
  const moves: number[] = [];
  let head = start;
  let d = dir;
  let pending = [...later];
  while (queue.length) {
    const { index, dir: nd } = pickNext(policy, head, d, queue);
    const t = queue.splice(index, 1)[0];
    moves.push(Math.abs(t - head));
    order.push(t);
    head = t;
    d = nd;
    if (pending.length) {
      queue.push(...pending);
      pending = [];
    }
  }
  const total = moves.reduce((a, b) => a + b, 0);
  return { order, moves, total, average: total / order.length, head, dir: d };
}

/** FSCAN(p.29~30): 첫 큐를 SCAN으로 다 서비스하는 동안 도착한 요청은 둘째 큐에 모았다가, 첫 큐가 끝난 위치·방향에서 SCAN */
export function fscan(start: number, dir: Direction, first: readonly number[], second: readonly number[]): { first: DiskRun; second: DiskRun; order: number[] } {
  const a = scheduleDisk("scan", start, dir, first);
  const b = scheduleDisk("scan", a.head, a.dir, second);
  return { first: a, second: b, order: [...a.order, ...b.order] };
}

/**
 * N-step-SCAN(p.31~32): 요청을 도착 순서대로 N개씩 서브 큐로 나누고 하나씩 SCAN. 새 요청은 마지막 서브 큐 뒤에 이어 붙는다
 * (마지막 서브 큐가 덜 찼으면 먼저 그 빈자리를 채운다). `later`는 첫 트랙을 서비스하는 도중 도착.
 */
export function nStepScan(n: number, start: number, dir: Direction, requests: readonly number[], later: readonly number[] = []): { subQueues: number[][]; served: number[][]; order: number[] } {
  const all = [...requests, ...later];
  const subQueues: number[][] = [];
  for (let i = 0; i < all.length; i += n) subQueues.push(all.slice(i, i + n));
  const served: number[][] = [];
  let head = start;
  let d = dir;
  for (const q of subQueues) {
    const r = scheduleDisk("scan", head, d, q);
    served.push(r.order);
    head = r.head;
    d = r.dir;
  }
  return { subQueues, served, order: served.flat() };
}

// ───────────── 디스크 성능 파라미터(p.11~15)

/** 탐색 시간 Ts = m × n + s (p.12) */
export const seekTime = (m: number, n: number, s: number) => m * n + s;
/** 한 바퀴 회전 시간(ms) = 60000 / rpm */
export const rotationMs = (rpm: number) => 60000 / rpm;
/** 평균 회전 지연 Tr = 1/(2r) = 반 바퀴 회전 시간 (p.13) */
export const rotationalDelay = (rotMs: number) => rotMs / 2;
/** 전송 시간 Tt = b/(rN) = 한 바퀴 회전 시간 × (읽는 양 / 한 트랙 용량) (p.14) */
export const transferTime = (rotMs: number, bytes: number, trackBytes: number) => (rotMs * bytes) / trackBytes;
/** 총 접근 시간 Ta = Ts + Tr + Tt (p.15) */
export const accessTime = (ts: number, tr: number, tt: number) => ts + tr + tt;

/**
 * 연속 저장 파일 읽기(p.18, p.20~21): 첫 트랙(또는 실린더)만 탐색 시간, 이후 단위마다 회전 지연 + 한 바퀴 읽기.
 * 실린더 단위(순차 병렬 접근)도 한 실린더를 한 바퀴에 읽으므로 같은 식이다.
 */
export function sequentialRead(p: { seek: number; rotDelay: number; unitRead: number; units: number }): { first: number; rest: number; total: number } {
  const first = p.seek + p.rotDelay + p.unitRead;
  const rest = (p.units - 1) * (p.rotDelay + p.unitRead);
  return { first, rest, total: first + rest };
}
/** 임의 접근(p.19): 섹터마다 탐색 + 회전 지연 + 한 섹터 읽기 */
export const randomRead = (p: { seek: number; rotDelay: number; sectorRead: number; sectors: number }) => p.sectors * (p.seek + p.rotDelay + p.sectorRead);

// ───────────── RAID(p.37~45)

/** 비트별 XOR(같은 길이의 '0'/'1' 문자열) */
export function xorAll(...words: string[]): string {
  if (!words.every((w) => /^[01]+$/.test(w) && w.length === words[0].length)) throw new Error("같은 길이의 비트열이 아님");
  return [...words[0]].map((_, i) => String(words.reduce((s, w) => s ^ Number(w[i]), 0))).join("");
}
/** RAID 3·4 패리티 X4 = X3 ⊕ X2 ⊕ X1 ⊕ X0 (p.41~42) */
export const parityOf = (...data: string[]) => xorAll(...data);
/** 고장 난 디스크 복구 = 나머지 디스크와 패리티의 XOR (p.41 필기) */
export const recover = (...survivors: string[]) => xorAll(...survivors);
/** RAID 4 작은 쓰기: X4' = X4 ⊕ X1 ⊕ X1' (2 read + 2 write, p.42) */
export const parityUpdate = (oldParity: string, oldData: string, newData: string) => xorAll(oldParity, oldData, newData);

/** RAID 레벨 비교(p.45): 중복 방식·견딜 수 있는 고장 디스크 수 */
export const RAID_LEVELS = {
  0: { redundancy: "없음(스트라이핑)", tolerates: 0 },
  1: { redundancy: "미러링", tolerates: 1 },
  2: { redundancy: "해밍 코드", tolerates: 1 },
  3: { redundancy: "비트 패리티(전용)", tolerates: 1 },
  4: { redundancy: "블록 패리티(전용)", tolerates: 1 },
  5: { redundancy: "분산 패리티", tolerates: 1 },
  6: { redundancy: "이중 패리티(P,Q)", tolerates: 2 },
} as const;

/**
 * 페이지 교체 알고리즘 (Ch08 p.42-53, 원본 §6-6): OPT, LRU, FIFO, Clock, Enhanced Clock.
 *
 * 슬라이드 Figure 8.15 규칙:
 * - 빈 프레임은 위(0번)부터 채운다.
 * - F는 "프레임이 처음 다 채워진 **이후**에 일어난 폴트"만 표시한다(처음 채우는 적재는 F가 아님).
 * - OPT에서 앞으로 다시 참조되지 않는 페이지가 여럿이면 **맨 위(번호가 작은) 프레임**을 뺀다
 *   (p.48 필기 "뒤에 정보가 없을 경우에는 맨 앞에 먼저 걸리는 녀석을 빼냄").
 * Clock 규칙(p.47, p.49-50): 적재·참조 때 use=1, 교체는 pointer부터 처음 만나는 use=0 프레임, 지나치는 use=1은 0으로,
 * 교체 후 pointer는 교체된 프레임의 다음. **히트 때는 pointer가 움직이지 않는다.** 모두 use=1이면 한 바퀴 돌며
 * 전부 0으로 만든 뒤 두 바퀴째에 교체.
 */

export type Algo = "opt" | "lru" | "fifo" | "clock";
export const ALGO_LABEL: Record<Algo, string> = {
  opt: "OPT",
  lru: "LRU",
  fifo: "FIFO",
  clock: "Clock",
};

export interface ReplacementStep {
  ref: number;
  /** 이 참조 직후 프레임 내용 (빈 프레임은 null) */
  frames: (number | null)[];
  hit: boolean;
  /** 메모리에 없어 적재했는가(처음 채우는 적재 포함) */
  miss: boolean;
  /** 슬라이드 F: 프레임이 다 찬 뒤 교체가 일어난 폴트 */
  fault: boolean;
  /** 이번에 적재·교체된 프레임 번호 (히트면 null) */
  loadedFrame: number | null;
  /** 교체로 쫓겨난 페이지 */
  evicted: number | null;
  /** Clock: 이 참조 직후 use bit / next frame pointer */
  use?: (0 | 1)[];
  pointer?: number;
}

export interface ReplacementResult {
  algo: Algo;
  steps: ReplacementStep[];
  /** 슬라이드 F 개수(다 찬 뒤의 폴트) */
  faults: number;
  /** 처음 채우는 적재까지 포함한 전체 미스 수 */
  misses: number;
}

export function simulateReplacement(
  refs: readonly number[],
  frameCount: number,
  algo: Algo,
): ReplacementResult {
  if (frameCount < 1) throw new RangeError("프레임은 1개 이상");
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const loadedAt: number[] = Array(frameCount).fill(-1); // FIFO: 적재 시각
  const usedAt: number[] = Array(frameCount).fill(-1); // LRU: 마지막 참조 시각
  const use: (0 | 1)[] = Array(frameCount).fill(0);
  let pointer = 0;
  const steps: ReplacementStep[] = [];

  refs.forEach((ref, t) => {
    const at = frames.indexOf(ref);
    if (at >= 0) {
      usedAt[at] = t;
      use[at] = 1;
      steps.push(snapshot(ref, true, false, false, null, null));
      return;
    }

    let target: number;
    let fault = false;
    if (algo === "clock") {
      // 빈 프레임도 pointer 위치부터 채워진다(Figure 8.15: 2를 0번에 적재 후 pointer→1).
      for (;;) {
        if (frames[pointer] === null || use[pointer] === 0) break;
        use[pointer] = 0;
        pointer = (pointer + 1) % frameCount;
      }
      target = pointer;
      fault = frames[target] !== null;
      pointer = (pointer + 1) % frameCount;
    } else {
      const empty = frames.indexOf(null);
      if (empty >= 0) {
        target = empty;
      } else {
        fault = true;
        target = chooseVictim(algo, frames as number[], refs, t, loadedAt, usedAt);
      }
    }
    const evicted = frames[target];
    frames[target] = ref;
    loadedAt[target] = t;
    usedAt[target] = t;
    use[target] = 1;
    steps.push(snapshot(ref, false, true, fault, target, evicted));
  });

  function snapshot(
    ref: number,
    hit: boolean,
    miss: boolean,
    fault: boolean,
    loadedFrame: number | null,
    evicted: number | null,
  ): ReplacementStep {
    return {
      ref,
      frames: [...frames],
      hit,
      miss,
      fault,
      loadedFrame,
      evicted,
      ...(algo === "clock" ? { use: [...use], pointer } : {}),
    };
  }

  return {
    algo,
    steps,
    faults: steps.filter((s) => s.fault).length,
    misses: steps.filter((s) => s.miss).length,
  };
}

function chooseVictim(
  algo: Exclude<Algo, "clock">,
  frames: number[],
  refs: readonly number[],
  t: number,
  loadedAt: number[],
  usedAt: number[],
): number {
  const argmin = (score: (i: number) => number) => {
    let best = 0;
    for (let i = 1; i < frames.length; i++) if (score(i) < score(best)) best = i;
    return best;
  };
  if (algo === "fifo") return argmin((i) => loadedAt[i]);
  if (algo === "lru") return argmin((i) => usedAt[i]);
  // OPT: 다음 사용이 가장 먼 페이지. 다시 안 쓰이면 무한대, 동점은 번호가 작은 프레임(argmax의 첫 번째).
  const nextUse = (i: number) => {
    const k = refs.indexOf(frames[i], t + 1);
    return k < 0 ? Infinity : k;
  };
  let victim = 0;
  for (let i = 1; i < frames.length; i++) if (nextUse(i) > nextUse(victim)) victim = i;
  return victim;
}

// ---------------------------------------------------------------- Clock 한 번의 교체 (Figure 8.16)

export interface ClockBuffer {
  pages: number[];
  use: (0 | 1)[];
  pointer: number;
}

/** 모든 프레임이 찬 버퍼에 새 페이지를 넣는다(폴트 1회). 새 상태와 교체된 프레임 번호를 돌려준다. */
export function clockReplace(
  buf: ClockBuffer,
  page: number,
): { buffer: ClockBuffer; victim: number } {
  const use = [...buf.use];
  const pages = [...buf.pages];
  let p = buf.pointer;
  while (use[p] === 1) {
    use[p] = 0;
    p = (p + 1) % pages.length;
  }
  pages[p] = page;
  use[p] = 1;
  return { buffer: { pages, use, pointer: (p + 1) % pages.length }, victim: p };
}

// ---------------------------------------------------------------- Enhanced Clock (p.52-53)

export interface EnhancedFrame {
  page: number;
  u: 0 | 1;
  m: 0 | 1;
}

export interface EnhancedScan {
  victim: number;
  /** 몇 번째 단계에서 찾았나: 1 = (0,0) 1차 스캔, 2 = (0,1) 스캔, 3 = 1단계 재시도, 4 = 2단계 재시도 */
  pass: 1 | 2 | 3 | 4;
  /** 스캔 직후 프레임(2단계에서 지나친 u=1은 0으로 바뀜) */
  frames: EnhancedFrame[];
}

/**
 * 교체 대상 찾기(p.53):
 * 1. pointer에서 시작해 (u=0, m=0)을 찾아 한 바퀴 스캔 — 비트는 바꾸지 않는다.
 * 2. 없으면 다시 한 바퀴 (u=0, m=1)을 찾고, 지나치는 u=1 프레임의 u를 0으로 바꾼다.
 * 3. 그래도 없으면(포인터는 원래 위치, 모든 u=0) 1단계를, 필요하면 2단계를 반복 — 이번에는 반드시 찾는다.
 */
export function enhancedClockVictim(
  frames: readonly EnhancedFrame[],
  pointer: number,
): EnhancedScan {
  const f = frames.map((x) => ({ ...x }));
  const n = f.length;
  const scanZeroZero = () => {
    for (let k = 0; k < n; k++) {
      const i = (pointer + k) % n;
      if (f[i].u === 0 && f[i].m === 0) return i;
    }
    return -1;
  };
  const scanZeroOne = () => {
    for (let k = 0; k < n; k++) {
      const i = (pointer + k) % n;
      if (f[i].u === 0 && f[i].m === 1) return i;
      if (f[i].u === 1) f[i].u = 0;
    }
    return -1;
  };
  let i = scanZeroZero();
  if (i >= 0) return { victim: i, pass: 1, frames: f };
  i = scanZeroOne();
  if (i >= 0) return { victim: i, pass: 2, frames: f };
  i = scanZeroZero();
  if (i >= 0) return { victim: i, pass: 3, frames: f };
  i = scanZeroOne();
  if (i >= 0) return { victim: i, pass: 4, frames: f };
  throw new Error("도달 불가: 모든 u=0이면 (0,0) 또는 (0,1)이 반드시 있다");
}

export interface EnhancedRef {
  page: number;
  /** 쓰기 참조면 m=1도 설정(읽기는 u=1만) */
  write?: boolean;
}

/** 참조열 전체 실행. 적재 시 u=1, 쓰기면 m=1. 교체 후 pointer는 교체된 프레임의 다음. */
export function simulateEnhancedClock(refs: readonly EnhancedRef[], frameCount: number) {
  let frames: (EnhancedFrame | null)[] = Array(frameCount).fill(null);
  let pointer = 0;
  const steps: {
    ref: EnhancedRef;
    frames: (EnhancedFrame | null)[];
    pointer: number;
    hit: boolean;
    victim: number | null;
    pass?: number;
  }[] = [];
  for (const ref of refs) {
    const at = frames.findIndex((x) => x?.page === ref.page);
    if (at >= 0) {
      const x = frames[at]!;
      frames[at] = { page: x.page, u: 1, m: ref.write ? 1 : x.m };
      steps.push({
        ref,
        frames: frames.map((x) => (x ? { ...x } : null)),
        pointer,
        hit: true,
        victim: null,
      });
      continue;
    }
    const empty = frames.indexOf(null);
    let victim: number;
    let pass: number | undefined;
    if (empty >= 0) {
      victim = empty;
    } else {
      const scan = enhancedClockVictim(frames as EnhancedFrame[], pointer);
      frames = scan.frames;
      victim = scan.victim;
      pass = scan.pass;
    }
    frames[victim] = { page: ref.page, u: 1, m: ref.write ? 1 : 0 };
    pointer = (victim + 1) % frameCount;
    steps.push({
      ref,
      frames: frames.map((x) => (x ? { ...x } : null)),
      pointer,
      hit: false,
      victim,
      ...(pass ? { pass } : {}),
    });
  }
  return steps;
}

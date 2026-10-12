/**
 * 단일 프로세서 스케줄링 시뮬레이터 (Ch09 p.11-27, Sprint 19). 슬라이드에 나온 알고리즘만 — FCFS·RR·SPN·SRT·HRRN·Feedback.
 * 시간은 정수 단위로 한 칸씩 진행한다. 슬라이드 규칙:
 * - 같은 조건(우선순위 같음)이면 FIFO(먼저 도착한 프로세스) — p.21 필기 "우선순위 같으면 FIFO방식으로"
 * - RR: 새로 도착한 프로세스를 먼저 RQ에 넣고 time quantum을 소진한 프로세스를 그 뒤에 넣는다(p.13 필기). 큐에 자기 혼자면 계속 실행
 * - SRT: 새 프로세스가 도착할 때마다 스케줄링(p.21) — 남은 시간(s−e)이 가장 짧은 것
 * - HRRN: 비선점, R = (대기한 시간 + 예상 서비스 시간) / 예상 서비스 시간(p.22)
 * - Feedback: 새 프로세스는 RQ0, 종료되거나 time quantum을 소진한 후에만 다시 스케줄링(새 작업 도착으로 스케줄링하지 않음),
 *   한 번 실행되면 아래 RQ로 내려가되 레디 큐에 자기 혼자면 내려가지 않음(p.25 필기), RQi의 quantum = 1 또는 2^i(p.24-25)
 */

export type SchedAlgo = "fcfs" | "rr" | "spn" | "srt" | "hrrn" | "feedback";

export const SCHED_LABEL: Record<SchedAlgo, string> = {
  fcfs: "FCFS",
  rr: "RR",
  spn: "SPN",
  srt: "SRT",
  hrrn: "HRRN",
  feedback: "Feedback",
};

export interface Proc {
  name: string;
  arrival: number;
  service: number;
}

export interface Segment {
  name: string;
  start: number;
  end: number;
}

/** 스케줄링 결정 한 번: 그때 고를 수 있던 프로세스(실행 중이던 것 포함)와 고른 것 */
export interface Decision {
  time: number;
  chosen: string;
  candidates: { name: string; waited: number; remaining: number; ratio: number }[];
}

export interface SchedOptions {
  /** RR·Feedback(q 고정)의 time quantum. 기본 1 */
  quantum?: number;
  /** Feedback quantum 방식: "fixed" = 모든 RQ가 quantum, "pow2" = RQi는 2^i */
  feedback?: "fixed" | "pow2";
}

export interface SchedResult {
  segments: Segment[];
  finish: Record<string, number>;
  /** 반환시간 Tr = 완료 − 도착 */
  turnaround: Record<string, number>;
  /** 대기시간 Tw = Tr − Ts */
  waiting: Record<string, number>;
  /** 정규화 반환시간 Tr/Ts */
  normalized: Record<string, number>;
  avgTurnaround: number;
  avgWaiting: number;
  avgNormalized: number;
  decisions: Decision[];
}

interface Live extends Proc {
  idx: number;
  remaining: number;
  level: number;
}

/** 평균을 슬라이드 표(p.27)처럼 소수 둘째 자리로 */
export const round2 = (x: number) => Math.round(x * 100) / 100;

export function simulate(algo: SchedAlgo, procs: readonly Proc[], opts: SchedOptions = {}): SchedResult {
  const q = opts.quantum ?? 1;
  const quantumOf = (level: number) => (algo === "feedback" && opts.feedback === "pow2" ? 2 ** level : q);
  const all: Live[] = procs.map((p, idx) => ({ ...p, idx, remaining: p.service, level: 0 }));
  const byArrival = [...all].sort((a, b) => a.arrival - b.arrival || a.idx - b.idx);
  const finish: Record<string, number> = {};
  const segments: Segment[] = [];
  const decisions: Decision[] = [];
  /** RR·FCFS·SPN·SRT·HRRN의 준비 큐(도착·재진입 순서) / Feedback은 RQ별 */
  const ready: Live[] = [];
  const levels: Live[][] = [];
  let running: Live | null = null;
  let slice = 0;
  let next = 0;
  let t = 0;
  const order = (a: Live, b: Live) => a.arrival - b.arrival || a.idx - b.idx;
  const ratio = (p: Live, now: number) => (now - p.arrival - (p.service - p.remaining) + p.service) / p.service;
  const record = (now: number, chosen: Live, pool: Live[]) =>
    decisions.push({
      time: now,
      chosen: chosen.name,
      candidates: pool.map((p) => ({ name: p.name, waited: now - p.arrival - (p.service - p.remaining), remaining: p.remaining, ratio: ratio(p, now) })),
    });

  while (Object.keys(finish).length < all.length) {
    let arrived = false;
    while (next < byArrival.length && byArrival[next].arrival <= t) {
      const p = byArrival[next++];
      if (algo === "feedback") (levels[0] ??= []).push(p);
      else ready.push(p);
      arrived = true;
    }
    if (running && running.remaining === 0) running = null;

    if (algo === "rr" && running && slice >= q) {
      if (ready.length) {
        ready.push(running);
        running = null;
      } else slice = 0;
    }
    if (algo === "feedback" && running && slice >= quantumOf(running.level)) {
      if (levels.some((l) => l?.length)) {
        running.level++;
        (levels[running.level] ??= []).push(running);
        running = null;
      } else slice = 0;
    }
    if (algo === "srt" && running && arrived && ready.length) {
      const pool: Live[] = [running, ...ready];
      const best: Live = [...pool].sort((a, b) => a.remaining - b.remaining || order(a, b))[0];
      if (best !== running) {
        record(t, best, pool);
        ready.push(running);
        ready.splice(ready.indexOf(best), 1);
        running = best;
        slice = 0;
      }
    }

    if (!running) {
      let pick: Live | undefined;
      if (algo === "feedback") {
        const l = levels.find((x) => x?.length);
        pick = l?.shift();
        if (pick) record(t, pick, [pick, ...levels.flat()]);
      } else if (ready.length) {
        const pool = [...ready];
        if (algo === "fcfs" || algo === "rr") pick = ready[0];
        else if (algo === "spn") pick = [...ready].sort((a, b) => a.service - b.service || order(a, b))[0];
        else if (algo === "srt") pick = [...ready].sort((a, b) => a.remaining - b.remaining || order(a, b))[0];
        else pick = [...ready].sort((a, b) => ratio(b, t) - ratio(a, t) || order(a, b))[0];
        ready.splice(ready.indexOf(pick), 1);
        record(t, pick, pool);
      }
      running = pick ?? null;
      slice = 0;
    }

    if (running) {
      const last = segments.at(-1);
      if (last && last.name === running.name && last.end === t) last.end = t + 1;
      else segments.push({ name: running.name, start: t, end: t + 1 });
      running.remaining--;
      slice++;
      if (running.remaining === 0) finish[running.name] = t + 1;
    }
    t++;
  }

  const turnaround: Record<string, number> = {};
  const waiting: Record<string, number> = {};
  const normalized: Record<string, number> = {};
  for (const p of all) {
    turnaround[p.name] = finish[p.name] - p.arrival;
    waiting[p.name] = turnaround[p.name] - p.service;
    normalized[p.name] = turnaround[p.name] / p.service;
  }
  const avg = (r: Record<string, number>) => all.reduce((s, p) => s + r[p.name], 0) / all.length;
  return { segments, finish, turnaround, waiting, normalized, avgTurnaround: avg(turnaround), avgWaiting: avg(waiting), avgNormalized: avg(normalized), decisions };
}

/** 시각 t부터 t+1까지 실행 중인 프로세스(없으면 null) */
export function runningAt(r: SchedResult, t: number): string | null {
  return r.segments.find((s) => s.start <= t && t < s.end)?.name ?? null;
}

/** 시각 t에 실행을 시작(또는 재개)하는 프로세스 — 그 시각에 새 구간이 시작되지 않으면 null */
export function startsAt(r: SchedResult, t: number): string | null {
  return r.segments.find((s) => s.start === t)?.name ?? null;
}

/** 시각 0..end−1의 실행 프로세스 줄(예: "AAABBBBBB…") */
export function timeline(r: SchedResult, end?: number): string {
  const last = end ?? Math.max(...r.segments.map((s) => s.end));
  return Array.from({ length: last }, (_, t) => runningAt(r, t) ?? "-").join("");
}

/** 지수 평균(p.18): S(n+1) = α·T(n) + (1−α)·S(n). 반환: [S(1)=s1, S(2), …, S(k+1)] */
export function exponentialAverage(observed: readonly number[], alpha: number, s1: number): number[] {
  const out = [s1];
  for (const t of observed) out.push(alpha * t + (1 - alpha) * out[out.length - 1]);
  return out;
}

/** 단순 평균(p.18): S(n+1) = (T(1)+…+T(n)) / n */
export function simpleAverage(observed: readonly number[]): number {
  return observed.reduce((s, x) => s + x, 0) / observed.length;
}

/** HRRN 응답 비율 R = (w + s) / s (p.22) */
export const responseRatio = (waited: number, service: number) => (waited + service) / service;

/** Ch09 슬라이드 공통 예제(p.11-27): 도착 0·2·4·6·8, 서비스 3·6·4·5·2 */
export const CH09_EXAMPLE: readonly Proc[] = [
  { name: "A", arrival: 0, service: 3 },
  { name: "B", arrival: 2, service: 6 },
  { name: "C", arrival: 4, service: 4 },
  { name: "D", arrival: 6, service: 5 },
  { name: "E", arrival: 8, service: 2 },
];

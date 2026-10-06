/**
 * 실행 엔진 클라이언트(Sprint 13): Worker를 띄우고, 요청마다 응답을 기다리며, **시간 제한**을 건다.
 * - 시간 제한은 Worker가 "started"(사용자 코드 실행 직전)를 보낸 때부터 잰다. 넘으면 Worker를 종료하고 "timeout"으로 끝낸다
 *   (Pyodide는 실행 중에 끊을 방법이 없어 Worker를 통째로 버린다 — 다음 실행 때 엔진을 다시 불러온다).
 * - Worker 만드는 방법을 주입받아 브라우저(Web Worker)와 Node(worker_threads, 테스트)에서 같은 코드를 쓴다.
 */
import type { EngineMsg, EngineReq, PyPackage, PythonRunReq, PythonRunResult, SqlRunReq, SqlRunResult, WorkerLike } from "./protocol";

export const DEFAULT_TIMEOUT_MS = 5000;
/** 엔진 불러오기 자체의 상한(판다스 import가 휴대폰에서 오래 걸려 넉넉히) */
export const LOAD_TIMEOUT_MS = 180_000;

export type RunOutcome<R> =
  | { status: "done"; result: R; ms: number }
  | { status: "timeout"; limitMs: number }
  | { status: "unavailable"; message: string };

type Pending = {
  resolve: (m: EngineMsg) => void;
  onStarted?: () => void;
  onProgress?: (stage: string) => void;
};

export class EngineClient {
  private worker: WorkerLike | null = null;
  private pending = new Map<number, Pending>();
  private seq = 0;
  /** 지금 Worker에 불러와 둔 것 — Worker를 버리면 비운다 */
  readonly loaded = { python: false, packages: new Set<PyPackage>() };

  constructor(private readonly createWorker: () => WorkerLike) {}

  private ensureWorker(): WorkerLike {
    if (this.worker) return this.worker;
    const w = this.createWorker();
    w.onmessage = (ev) => {
      const m = ev.data;
      const p = this.pending.get(m.id);
      if (!p) return;
      if (m.kind === "progress") p.onProgress?.(m.stage);
      else if (m.kind === "started") p.onStarted?.();
      else {
        this.pending.delete(m.id);
        p.resolve(m);
      }
    };
    w.onerror = () => this.reset("엔진 Worker 오류");
    this.worker = w;
    return w;
  }

  /** Worker를 버린다(시간 초과·오류). 기다리던 요청은 모두 실패로 끝낸다 */
  reset(message = "엔진을 다시 시작합니다") {
    this.worker?.terminate();
    this.worker = null;
    this.loaded.python = false;
    this.loaded.packages.clear();
    for (const [id, p] of this.pending) p.resolve({ id, kind: "fail", message });
    this.pending.clear();
  }

  private request(req: EngineReq, opts: { timeoutMs: number; loadTimeoutMs?: number; onProgress?: (s: string) => void }) {
    const id = ++this.seq;
    return new Promise<EngineMsg | { kind: "timeout" }>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const finish = (m: EngineMsg | { kind: "timeout" }) => {
        if (timer) clearTimeout(timer);
        resolve(m);
      };
      // 불러오기 단계 상한
      timer = setTimeout(() => {
        this.pending.delete(id);
        this.reset("엔진을 불러오는 데 너무 오래 걸립니다");
        finish({ kind: "fail", id, message: "엔진을 불러오는 데 너무 오래 걸립니다" });
      }, opts.loadTimeoutMs ?? LOAD_TIMEOUT_MS);
      this.pending.set(id, {
        resolve: finish,
        onProgress: opts.onProgress,
        onStarted: () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            this.pending.delete(id);
            this.reset("시간 초과");
            finish({ kind: "timeout" });
          }, opts.timeoutMs);
        },
      });
      try {
        this.ensureWorker().postMessage({ id, ...req });
      } catch (e) {
        this.pending.delete(id);
        finish({ id, kind: "fail", message: String(e) });
      }
    });
  }

  /** Python(+필요한 패키지)을 미리 불러온다. 걸린 시간(ms)을 돌려준다 */
  async preparePython(base: string, wheels: string[], packages: PyPackage[], onProgress?: (s: string) => void): Promise<{ ok: true; ms: number } | { ok: false; message: string }> {
    const m = await this.request({ kind: "python-init", base, wheels, packages }, { timeoutMs: LOAD_TIMEOUT_MS, onProgress });
    if (m.kind === "ready") {
      this.loaded.python = true;
      for (const p of m.packages) this.loaded.packages.add(p);
      return { ok: true, ms: m.ms };
    }
    return { ok: false, message: m.kind === "fail" ? m.message : "엔진을 불러오지 못했습니다" };
  }

  async runPython(req: Omit<PythonRunReq, "kind">, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<RunOutcome<PythonRunResult>> {
    const m = await this.request({ kind: "python-run", ...req }, { timeoutMs });
    if (m.kind === "result") {
      this.loaded.python = true;
      for (const p of req.packages) this.loaded.packages.add(p);
      return { status: "done", result: m.result as PythonRunResult, ms: m.ms };
    }
    if (m.kind === "timeout") return { status: "timeout", limitMs: timeoutMs };
    return { status: "unavailable", message: m.kind === "fail" ? m.message : "엔진을 불러오지 못했습니다" };
  }

  async runSql(req: Omit<SqlRunReq, "kind">, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<RunOutcome<SqlRunResult>> {
    const m = await this.request({ kind: "sql-run", ...req }, { timeoutMs });
    if (m.kind === "result") return { status: "done", result: m.result as SqlRunResult, ms: m.ms };
    if (m.kind === "timeout") return { status: "timeout", limitMs: timeoutMs };
    return { status: "unavailable", message: m.kind === "fail" ? m.message : "엔진을 불러오지 못했습니다" };
  }
}

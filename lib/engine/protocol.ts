/** 실행 엔진 Worker ↔ 화면 메시지(Sprint 13). 브라우저 Worker(engine.worker.ts)와 Node Worker(runtime/nodeEngineWorker.mjs)가 같은 약속을 따른다. */

export type PyPackage = "numpy" | "pandas";

export interface PythonInitReq {
  kind: "python-init";
  /** 엔진 파일 경로(예: /engine/pyodide-314.0.7/) */
  base: string;
  /** openpyxl 등 직접 푸는 휠 파일 이름 */
  wheels: string[];
  packages: PyPackage[];
}
export interface PythonRunReq extends Omit<PythonInitReq, "kind"> {
  kind: "python-run";
  code: string;
  setup?: string;
  checks?: string[];
}
export interface SqlRunReq {
  kind: "sql-run";
  base: string;
  setup: string;
  code: string;
  tables?: string[];
}
export type EngineReq = PythonInitReq | PythonRunReq | SqlRunReq;

export interface PyError {
  type: string;
  message: string;
  line: number | null;
}
export interface PythonRunResult {
  stdout: string;
  truncated: boolean;
  error: PyError | null;
  checks: { expr: string; pass: boolean; error?: string }[];
  setupError?: string;
}
export interface SqlRunResult {
  error: string | null;
  result: { columns: string[]; rows: unknown[][] } | null;
  tables: Record<string, { columns: string[]; rows: unknown[][] } | null>;
  statements: number;
}

export type EngineMsg =
  | { id: number; kind: "progress"; stage: string }
  /** 엔진 준비 완료(ms: 이번 요청에서 불러오기에 걸린 시간) */
  | { id: number; kind: "ready"; ms: number; packages: PyPackage[] }
  /** 사용자 코드 실행 직전 — 시간 제한은 이때부터 잰다(엔진 불러오기 시간은 빼고) */
  | { id: number; kind: "started" }
  | { id: number; kind: "result"; result: PythonRunResult | SqlRunResult; ms: number }
  | { id: number; kind: "fail"; message: string };

/** 브라우저 Worker와 Node worker_threads를 같은 모양으로 감싼 것 */
export interface WorkerLike {
  postMessage(msg: { id: number } & EngineReq): void;
  terminate(): void;
  onmessage: ((ev: { data: EngineMsg }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
}

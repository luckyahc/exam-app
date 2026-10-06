/** Node(worker_threads)에서 EngineClient를 쓰기 위한 어댑터 — 테스트·Sprint 14 검증 전용(앱 번들에는 들어가지 않는다) */
import { Worker } from "node:worker_threads";
import { EngineClient } from "./client";
import type { EngineMsg, WorkerLike } from "./protocol";

export function createNodeEngineClient(): EngineClient {
  return new EngineClient((): WorkerLike => {
    const w = new Worker(new URL("./runtime/nodeEngineWorker.mjs", import.meta.url));
    const like: WorkerLike = {
      postMessage: (msg) => w.postMessage(msg),
      terminate: () => void w.terminate(),
      onmessage: null,
      onerror: null,
    };
    w.on("message", (data: EngineMsg) => like.onmessage?.({ data }));
    w.on("error", (e) => like.onerror?.(e));
    return like;
  });
}

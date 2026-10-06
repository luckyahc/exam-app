/**
 * 브라우저에서 쓰는 실행 엔진(Sprint 13). Web Worker는 코드 문제 화면이 처음 엔진을 쓸 때 만들고(지연), 앱 전체에서 하나만 쓴다.
 * 엔진 파일 목록·용량은 빌드 때 만든 /engine/manifest.json에서 읽는다(scripts/prepare-engine.mjs).
 */
import { EngineClient } from "./client";
import type { EngineManifest } from "./codeWriteRun";
import type { WorkerLike } from "./protocol";

let client: EngineClient | null = null;
let manifest: Promise<EngineManifest> | null = null;

/**
 * Worker는 번들하지 않은 정적 모듈 파일(manifest.worker)이다 — Pyodide 314는 classic Worker를 거부하는데,
 * 번들러가 만드는 Worker는 classic이라 쓸 수 없었다(Sprint 13 브라우저 확인에서 발견).
 */
export function getEngine(m: Pick<EngineManifest, "worker">): EngineClient {
  if (!client) {
    client = new EngineClient(() => new Worker(m.worker, { type: "module", name: "code-engine" }) as unknown as WorkerLike);
  }
  return client;
}

/** 엔진을 아직 만들지 않았으면 null(불러온 패키지 확인용) */
export function peekEngine(): EngineClient | null {
  return client;
}

export function getManifest(): Promise<EngineManifest> {
  if (!manifest) {
    manifest = fetch("/engine/manifest.json").then((r) => {
      if (!r.ok) throw new Error(`엔진 정보를 읽지 못했습니다(HTTP ${r.status})`);
      return r.json() as Promise<EngineManifest>;
    });
    manifest.catch(() => (manifest = null));
  }
  return manifest;
}

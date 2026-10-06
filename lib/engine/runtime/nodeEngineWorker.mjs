// Node용 실행 엔진 Worker(worker_threads) — 브라우저 engine.worker.ts와 같은 메시지 약속(protocol.ts)을 따른다.
// Vitest 엔진 테스트(시간 초과 포함)와 Sprint 14 작성 시 검증이 쓴다. 엔진 파일은 public/engine/(prepare-engine.mjs)에서 읽는다.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parentPort } from "node:worker_threads";
import { installWheels, runPython } from "./pyRuntime.js";
import { runSql } from "./sqlRuntime.js";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "../../..");
const local = (base) => path.join(ROOT, "public", base.replace(/^\//, ""));

let py = null;
const loaded = new Set();
let SQL = null;
const post = (m) => parentPort.postMessage(m);

async function ensurePython(id, base, wheels, packages) {
  const t0 = performance.now();
  if (!py) {
    const { loadPyodide } = await import("pyodide");
    py = await loadPyodide({ indexURL: local(base) + path.sep });
    installWheels(py, wheels.map((w) => new Uint8Array(readFileSync(path.join(local(base), w)))));
  }
  const need = packages.filter((p) => !loaded.has(p));
  if (need.length) {
    post({ id, kind: "progress", stage: `${need.join("·")} 불러오는 중` });
    await py.loadPackage(need, { messageCallback: () => {}, errorCallback: () => {} });
    need.forEach((p) => loaded.add(p));
    await py.runPythonAsync(need.map((p) => `import ${p}`).join("\n"));
  }
  return performance.now() - t0;
}

parentPort.on("message", async (req) => {
  const { id } = req;
  try {
    if (req.kind === "python-init") {
      const ms = await ensurePython(id, req.base, req.wheels, req.packages);
      post({ id, kind: "ready", ms, packages: [...loaded] });
    } else if (req.kind === "python-run") {
      await ensurePython(id, req.base, req.wheels, req.packages);
      post({ id, kind: "started" });
      const t0 = performance.now();
      const result = await runPython(py, { code: req.code, setup: req.setup, checks: req.checks });
      post({ id, kind: "result", result, ms: performance.now() - t0 });
    } else if (req.kind === "sql-run") {
      if (!SQL) SQL = await require("sql.js")({ locateFile: (f) => path.join(local(req.base), f) });
      post({ id, kind: "started" });
      const t0 = performance.now();
      const result = runSql(SQL, { setup: req.setup, code: req.code, tables: req.tables });
      post({ id, kind: "result", result, ms: performance.now() - t0 });
    }
  } catch (e) {
    post({ id, kind: "fail", message: String(e?.message ?? e) });
  }
});

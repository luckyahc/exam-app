// 코드 실행 엔진 Web Worker — 브라우저용(Sprint 13). **모듈 Worker**로만 동작한다(Pyodide 314는 classic Worker를 지원하지 않는다).
// 번들러를 거치지 않는 정적 파일이다: scripts/prepare-engine.mjs가 이 폴더의 JS를 public/engine/app-{내용 해시}/로 복사하고,
// 화면은 manifest.json의 worker 주소로 `new Worker(url, { type: "module" })`를 만든다.
// - 화면과 분리된 스레드라 사용자 코드가 앱 화면(DOM)에 손댈 수 없다(Worker에는 document가 없다).
// - Pyodide·sql.js 파일은 같은 출처의 /engine/{이름}-{버전}/에서만 받는다(외부 CDN 없음). 사용자 코드 실행 중에는 fetch도 막는다.
// - 시간 제한은 화면 쪽(client.ts)이 "started"부터 재고, 넘으면 이 Worker를 통째로 종료한다.
import { makeGuardedFetch, removeNetworkGlobals } from "./networkGuard.js";
import { installWheels, runPython } from "./pyRuntime.js";
import { runSql } from "./sqlRuntime.js";

const post = (m) => self.postMessage(m);

let userCodeRunning = false;
self.fetch = makeGuardedFetch(self.fetch.bind(self), self.location.href, () => userCodeRunning);
removeNetworkGlobals(self);

let py = null;
const loadedPackages = new Set();

async function ensurePython(id, base, wheels, packages) {
  const t0 = performance.now();
  if (!py) {
    post({ id, kind: "progress", stage: "Python 불러오는 중" });
    const { loadPyodide } = await import(`${base}pyodide.mjs`);
    py = await loadPyodide({ indexURL: base });
    post({ id, kind: "progress", stage: "openpyxl 설치 중" });
    const bytes = await Promise.all(wheels.map(async (w) => new Uint8Array(await (await self.fetch(base + w)).arrayBuffer())));
    installWheels(py, bytes);
  }
  const need = packages.filter((p) => !loadedPackages.has(p));
  if (need.length) {
    post({ id, kind: "progress", stage: `${need.join("·")} 불러오는 중` });
    await py.loadPackage(need, { messageCallback: () => {}, errorCallback: () => {} });
    for (const p of need) loadedPackages.add(p);
    // 판다스는 import도 오래 걸려 불러올 때 미리 해 둔다
    await py.runPythonAsync(need.map((p) => `import ${p}`).join("\n"));
  }
  return performance.now() - t0;
}

let SQL = null;
async function ensureSql(base) {
  if (SQL) return;
  // sql-wasm.js는 UMD 스크립트라 모듈 Worker에서 import할 수 없다 → 같은 출처에서 읽어 전역에서 실행
  const text = await (await self.fetch(`${base}sql-wasm.js`)).text();
  (0, eval)(text);
  SQL = await self.initSqlJs({ locateFile: (f) => base + f });
}

self.onmessage = async (ev) => {
  const req = ev.data;
  const { id } = req;
  try {
    if (req.kind === "python-init") {
      const ms = await ensurePython(id, req.base, req.wheels, req.packages);
      post({ id, kind: "ready", ms, packages: [...loadedPackages] });
    } else if (req.kind === "python-run") {
      await ensurePython(id, req.base, req.wheels, req.packages);
      post({ id, kind: "started" });
      const t0 = performance.now();
      userCodeRunning = true;
      try {
        const result = await runPython(py, { code: req.code, setup: req.setup, checks: req.checks });
        post({ id, kind: "result", result, ms: performance.now() - t0 });
      } finally {
        userCodeRunning = false;
      }
    } else if (req.kind === "sql-run") {
      await ensureSql(req.base);
      post({ id, kind: "started" });
      const t0 = performance.now();
      userCodeRunning = true;
      try {
        const result = runSql(SQL, { setup: req.setup, code: req.code, tables: req.tables });
        post({ id, kind: "result", result, ms: performance.now() - t0 });
      } finally {
        userCodeRunning = false;
      }
    }
  } catch (e) {
    post({ id, kind: "fail", message: String(e?.message ?? e) });
  }
};

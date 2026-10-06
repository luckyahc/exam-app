// 코드 실행 엔진 파일을 public/engine/ 아래에 준비한다(Sprint 13). npm run build/dev/test 앞에서 자동 실행(prebuild·predev·pretest).
//
// - Pyodide 기본 파일·sql.js: node_modules의 npm 패키지에서 **복사**한다.
// - 넘파이·판다스(+의존성)·openpyxl 휠: npm에 이 Pyodide 버전용 패키지가 없어서 빌드할 때 공식 배포처에서 내려받는다
//   (Pyodide 배포본은 jsdelivr의 pyodide 공식 미러, openpyxl·et_xmlfile은 PyPI). 받은 파일은 **SHA-256으로 검증**하고
//   node_modules/.cache/engine-wheels/에 보관해 두 번째부터는 내려받지 않는다. Vercel 빌드 캐시는 `node_modules/**`를
//   다음 빌드에 되살리므로(공식 문서 "What is cached") 배포 빌드에서도 다시 받지 않는다. 저장소에는 들어가지 않는다.
// - 내려받기 실패·SHA-256 불일치·파일 누락이면 **빌드를 실패시킨다**(종료 코드 1). 엔진 없이 조용히 배포되지 않게 하기 위해서다.
// - public/engine/은 .gitignore — 바이너리를 저장소에 커밋하지 않는다. 실행 중(브라우저)에는 외부 주소를 쓰지 않는다.
// - 경로에 버전을 넣어(`pyodide-314.0.7/`) next.config의 Cache-Control: immutable 로 브라우저 캐시를 재사용한다.

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NM = path.join(ROOT, "node_modules");
const OUT = path.join(ROOT, "public", "engine");
// ENGINE_WHEEL_CACHE: 캐시 폴더 바꾸기(실패 처리 점검용)
const CACHE = process.env.ENGINE_WHEEL_CACHE ? path.resolve(process.env.ENGINE_WHEEL_CACHE) : path.join(NM, ".cache", "engine-wheels");

process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);
function fail(e) {
  console.error(`
[prepare-engine] 실행 엔진 준비 실패 — 빌드를 중단합니다.
  원인: ${e?.message ?? e}
  (엔진 없이 배포하지 않습니다. 네트워크를 확인하고 다시 빌드하세요.)
`);
  process.exit(1);
}

const pyVersion = JSON.parse(readFileSync(path.join(NM, "pyodide", "package.json"), "utf8")).version;
const sqlVersion = JSON.parse(readFileSync(path.join(NM, "sql.js", "package.json"), "utf8")).version;
const PY_DIR = path.join(OUT, `pyodide-${pyVersion}`);
const SQL_DIR = path.join(OUT, `sqljs-${sqlVersion}`);

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const size = (file) => statSync(file).size;

function copy(src, dir) {
  mkdirSync(dir, { recursive: true });
  const dst = path.join(dir, path.basename(src));
  if (!existsSync(dst) || size(dst) !== size(src) || sha256(dst) !== sha256(src)) copyFileSync(src, dst);
  return dst;
}

const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");

async function download(url) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      last = e;
      if (attempt < 3) console.warn(`  [재시도 ${attempt}/2] ${url}: ${e.message}`);
    }
  }
  throw new Error(`내려받기 실패(3회 시도) ${url}: ${last?.message ?? last}`);
}

async function fetchVerified(url, file, hash) {
  mkdirSync(CACHE, { recursive: true });
  const cached = path.join(CACHE, file);
  if (existsSync(cached) && sha256(cached) === hash) return cached;
  process.stdout.write(`  내려받기 ${file} … `);
  const buf = await download(url);
  const got = shaOf(buf);
  // 검증을 통과한 파일만 캐시에 쓴다(틀린 파일이 남아 다음 빌드에 쓰이지 않게)
  if (got !== hash) throw new Error(`${file}: SHA-256 불일치 — 기대 ${hash}, 받은 파일 ${got} (${url})`);
  writeFileSync(cached, buf);
  console.log("완료");
  return cached;
}

// 1) Pyodide 기본(npm 패키지에서 복사)
const PY_CORE = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
for (const f of PY_CORE) copy(path.join(NM, "pyodide", f), PY_DIR);

// 2) 넘파이·판다스와 의존성: 해시는 Pyodide 패키지의 pyodide-lock.json에 있는 값
const lock = JSON.parse(readFileSync(path.join(NM, "pyodide", "pyodide-lock.json"), "utf8"));
const LOCK_PACKAGES = ["numpy", "pandas", "python-dateutil", "pytz", "six"];
for (const name of LOCK_PACKAGES) {
  const p = lock.packages[name];
  const file = await fetchVerified(`https://cdn.jsdelivr.net/pyodide/v${pyVersion}/full/${p.file_name}`, p.file_name, p.sha256);
  copy(file, PY_DIR);
}

// 3) openpyxl(순수 파이썬, Pyodide 패키지 목록에 없음) — PyPI 휠, 해시 고정
const PYPI_WHEELS = [
  {
    name: "openpyxl",
    file: "openpyxl-3.1.5-py2.py3-none-any.whl",
    sha256: "5282c12b107bffeef825f4617dc029afaf41d0ea60823bbb665ef3079dc79de2",
    url: "https://files.pythonhosted.org/packages/c0/da/977ded879c29cbd04de313843e76868e6e13408a94ed6b987245dc7c8506/openpyxl-3.1.5-py2.py3-none-any.whl",
  },
  {
    name: "et_xmlfile",
    file: "et_xmlfile-2.0.0-py3-none-any.whl",
    sha256: "7a91720bc756843502c3b7504c77b8fe44217c85c537d85037f0f536151b2caa",
    url: "https://files.pythonhosted.org/packages/c1/8b/5fe2cc11fee489817272089c4203e679c63b570a5aaeb18d852ae3cbba6a/et_xmlfile-2.0.0-py3-none-any.whl",
  },
];
for (const w of PYPI_WHEELS) copy(await fetchVerified(w.url, w.file, w.sha256), PY_DIR);

// 4) sql.js(npm 패키지에서 복사)
for (const f of ["sql-wasm.js", "sql-wasm.wasm"]) copy(path.join(NM, "sql.js", "dist", f), SQL_DIR);

// 5) 브라우저 Worker(정적 모듈 Worker — lib/engine/runtime/*.js): 내용 해시를 경로에 넣어 immutable 캐시가 안전하게
const RUNTIME = path.join(ROOT, "lib", "engine", "runtime");
const WORKER_FILES = ["browserWorker.js", "pyRuntime.js", "sqlRuntime.js", "networkGuard.js"];
const workerHash = createHash("sha256");
for (const f of WORKER_FILES) workerHash.update(readFileSync(path.join(RUNTIME, f)));
const appDir = `app-${workerHash.digest("hex").slice(0, 12)}`;
for (const f of WORKER_FILES) copy(path.join(RUNTIME, f), path.join(OUT, appDir));

// 6) 화면에 보여 줄 용량 정보(바이트, 원래 크기 기준)
const bytes = (dir, files) => files.reduce((n, f) => n + size(path.join(dir, f)), 0);
const manifest = {
  pyodide: { version: pyVersion, base: `/engine/pyodide-${pyVersion}/` },
  sqljs: { version: sqlVersion, base: `/engine/sqljs-${sqlVersion}/` },
  worker: `/engine/${appDir}/browserWorker.js`,
  openpyxlWheels: PYPI_WHEELS.map((w) => w.file),
  bytes: {
    python: bytes(PY_DIR, PY_CORE) + bytes(PY_DIR, PYPI_WHEELS.map((w) => w.file)),
    numpy: bytes(PY_DIR, [lock.packages.numpy.file_name]),
    pandas: bytes(PY_DIR, ["pandas", "python-dateutil", "pytz", "six"].map((n) => lock.packages[n].file_name)),
    sql: bytes(SQL_DIR, ["sql-wasm.js", "sql-wasm.wasm"]),
  },
};
// 7) 마지막 점검: 화면이 쓸 파일이 모두 있고, 휠은 기대 해시와 같은지(복사 중 깨짐·누락 방지)
const expectWheels = [
  ...LOCK_PACKAGES.map((n) => [lock.packages[n].file_name, lock.packages[n].sha256]),
  ...PYPI_WHEELS.map((w) => [w.file, w.sha256]),
];
for (const [file, hash] of expectWheels) {
  const f = path.join(PY_DIR, file);
  if (!existsSync(f) || sha256(f) !== hash) throw new Error(`public/engine 점검 실패: ${file} 없음 또는 해시 불일치`);
}
for (const f of [...PY_CORE.map((x) => path.join(PY_DIR, x)), path.join(SQL_DIR, "sql-wasm.js"), path.join(SQL_DIR, "sql-wasm.wasm"), ...WORKER_FILES.map((x) => path.join(OUT, appDir, x))]) {
  if (!existsSync(f) || size(f) === 0) throw new Error(`public/engine 점검 실패: ${path.relative(ROOT, f)} 없음`);
}
writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(
  `엔진 준비 완료: public/engine/ (Python ${(manifest.bytes.python / 1e6).toFixed(1)} MB · 넘파이 ${(manifest.bytes.numpy / 1e6).toFixed(1)} MB · 판다스 ${(manifest.bytes.pandas / 1e6).toFixed(1)} MB · SQL ${(manifest.bytes.sql / 1e6).toFixed(1)} MB)`,
);

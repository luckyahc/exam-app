// 데이터과학 함수 정리표(data/subjects/data-science/functions.json)의 exampleOutput·relatedQuestionIds를 다시 만든다(2026-10-16).
// 예시는 손으로 결과를 쓰지 않고 검증 엔진(Pyodide·sql.js, lib/verify/run.ts — npm run verify:ds와 같은 엔진)으로 실행한다.
// 실행: node scripts/ds-functions.mjs  (엔진이 없으면 먼저 node scripts/prepare-engine.mjs)
// 확인은 npm test가 한다(lib/verify/dsFunctions.test.ts — 재실행 결과 = exampleOutput).
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["vitest", "run", "lib/verify/dsFunctions.test.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, UPDATE_DS_FUNCTIONS: "1" },
});
process.exit(r.status ?? 1);

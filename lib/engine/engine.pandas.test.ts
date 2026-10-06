/**
 * 판다스 엔진 테스트 — 불러오기+import가 오래 걸려(Node 데스크톱 약 12초) engine.test.ts와 나눴다.
 * 예제는 source/data-science/Lec6.pdf s.49·s.51 [코드 6-27]·[코드 6-29].
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createNodeEngineClient } from "./nodeClient";
import type { PythonRunResult } from "./protocol";
import { executeCodeWrite } from "./codeWriteRun";
import type { CodeWriteQ } from "@/lib/qtypes/codeWrite";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";

const manifestPath = path.resolve(import.meta.dirname, "../../public/engine/manifest.json");
const ready = existsSync(manifestPath);
const manifest = ready ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;

describe.skipIf(!ready)("판다스", () => {
  const client = createNodeEngineClient();
  afterAll(() => client.reset());

  it("[코드 6-27]·[코드 6-29]: 숫자형 df에서 두 조건식을 동시에 만족하는 행", async () => {
    const t0 = Date.now();
    const prep = await client.preparePython(manifest.pyodide.base, manifest.openpyxlWheels, ["numpy", "pandas"]);
    expect(prep.ok).toBe(true);
    const loadMs = Date.now() - t0;
    const o = await client.runPython({
      base: manifest.pyodide.base,
      wheels: manifest.openpyxlWheels,
      packages: ["numpy", "pandas"],
      code: [
        "import pandas as pd",
        "list1 = list([['허준호', '남자', 30, 183], ['이가원', '여자', 24, 162], ['배규민', '남자', 23, 179], ['고고림', '남자', 21, 182],",
        "              ['이새봄', '여자', 28, 160], ['이보람', '여자', 26, 163], ['이루리', '여자', 24, 157], ['오다현', '여자', 24, 172]])",
        "col_names = ['이름', '성별', '나이', '키']",
        "df = pd.DataFrame(list1, columns=col_names)",
        "print(df[(df['성별'] == '여자') & (df['키'] > 160)]['이름'].tolist())",
      ].join("\n"),
    });
    expect(o.status).toBe("done");
    const r = (o as { result: PythonRunResult }).result;
    expect(r.error).toBeNull();
    expect(r.stdout.trim()).toBe("['이가원', '이보람', '오다현']");
    console.log(`판다스 불러오기+import ${loadMs} ms`);
  }, 120_000);

  it("/playground 판다스 예시: 모범 답안 통과, & 대신 |(하나만 만족)는 실패", async () => {
    const q = dsPlaygroundQuestions().find((x) => x.id === "data-science-lec6-demo-code-write-002") as CodeWriteQ;
    expect((await executeCodeWrite(client, manifest, q, q.solution)).passed).toBe(true);
    const or = await executeCodeWrite(client, manifest, q, q.solution.replace(" & ", " | "));
    expect(or.passed).toBe(false);
  }, 120_000);
});

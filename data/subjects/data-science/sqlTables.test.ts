/**
 * "사용 테이블"·"사용 데이터" 스냅샷(sqlTables.generated.json)이 지금 문항·준비 SQL·준비 코드와 맞는지.
 * 실패하면 `node scripts/build-sql-tables.mjs`를 다시 실행한다.
 * - SQL: sql.js로 그대로 다시 만들어 비교(빠름)
 * - Python: Pyodide를 띄우지 않고 준비 코드 해시만 비교(데이터는 준비 코드에서만 나오므로 해시가 같으면 같다)
 */
import { describe, expect, it } from "vitest";
import { buildSqlPart, loadDsQuestions, loadSqlSetups, pythonQuestionHashes } from "@/scripts/build-sql-tables.mjs";
import { DS_SNAPSHOTS } from "@/lib/qtypes/dataSnapshots";

const RERUN = "스냅샷이 문항·준비 데이터와 다르다 — `node scripts/build-sql-tables.mjs`를 다시 실행하세요";

describe("데이터과학 표 스냅샷", () => {
  it("SQL: 준비 SQL을 실행한 결과·문항별 관련 테이블이 JSON과 같다", async () => {
    const qs = await loadDsQuestions();
    const fresh = await buildSqlPart(qs, await loadSqlSetups());
    expect(DS_SNAPSHOTS.sql, RERUN).toEqual(fresh);
  });

  it("Python: 준비 코드가 바뀌거나 문항이 늘거나 줄면 실패", async () => {
    const hashes = pythonQuestionHashes(await loadDsQuestions());
    const { setups, noData, questions } = DS_SNAPSHOTS.python;
    const known = new Set([...Object.keys(setups), ...noData]);
    for (const [id, h] of Object.entries(hashes)) expect(known.has(h), `${id}: ${RERUN}`).toBe(true);
    const withData = Object.fromEntries(Object.entries(hashes).filter(([, h]) => h in setups));
    expect(questions, RERUN).toEqual(withData);
    const used = new Set(Object.values(hashes));
    expect([...known].filter((h) => !used.has(h)), `쓰지 않는 준비 코드 스냅샷 — ${RERUN}`).toEqual([]);
  });

  it("Python DataFrame 스냅샷에는 dtype이 없다(Pyodide·Colab 차이, 결정 15)", () => {
    for (const s of Object.values(DS_SNAPSHOTS.python.setups)) for (const f of s.frames) expect(f.columns.filter((c) => c.type !== undefined), f.name).toEqual([]);
  });

  it("Lec5 SQL 문항 중 준비 SQL이 있는 문항(빈 데이터베이스에서 시작하는 문항 제외)은 모두 표가 있다", async () => {
    const qs = (await loadDsQuestions()) as { id: string; chapter: string; type: string; sql?: { setup: string }; verify?: { mode: string; sql?: { setup: string } } }[];
    const withSetup = qs.filter((q) => {
      const s = q.type === "code-write" ? q.sql?.setup : q.verify?.mode === "run" ? q.verify.sql?.setup : undefined;
      return q.chapter === "lec5" && s && s !== "empty";
    });
    expect(withSetup.filter((q) => !DS_SNAPSHOTS.sql.questions[q.id]).map((q) => q.id)).toEqual([]);
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import ch01 from "./ch01";
import ch02 from "./ch02";

// 강의자료 예제 목록(docs/verification/data-comm-examples.md) ↔ 문항 데이터: 중복 열의 id는 있는 문항, 새 문항 열의 id는 sourceRef가 있는 문항

describe("데이터 통신 강의자료 예제 목록", () => {
  const md = readFileSync(path.resolve(import.meta.dirname, "../../../docs/verification/data-comm-examples.md"), "utf8");
  const rows = md.split(/\r?\n/).filter((l) => /^\| Ch0[12] \| s\./.test(l)).map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  const all = new Map([...ch01, ...ch02].map((q) => [q.id, q]));
  const ids = (cell: string) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

  it("예제 23개, 중복 열의 id는 모두 있는 문항이다", () => {
    expect(rows).toHaveLength(23);
    for (const r of rows) for (const id of ids(r[4])) expect(all.has(id), id).toBe(true);
  });

  it("새 문항 열 = sourceRef가 있는 문항 전부(강의·쪽이 표와 같다)", () => {
    const fresh = rows.flatMap((r) => ids(r[5]).map((id) => [id, r[0], r[1]] as const));
    expect(fresh.map(([id]) => id).sort()).toEqual([...all.values()].filter((q) => q.sourceRef).map((q) => q.id).sort());
    for (const [id, lecture, ref] of fresh) {
      const s = all.get(id)!.sourceRef!;
      expect(s.lecture, id).toBe(lecture);
      expect(ref, id).toContain(`(p.${s.page})`);
    }
  });
});

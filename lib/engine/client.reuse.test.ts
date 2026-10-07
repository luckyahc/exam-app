/**
 * 엔진 Worker 재사용(Sprint 17): 같은 화면(세션)에서 문제를 넘겨도 Worker는 하나이고, 판다스는 한 번만 불러온다.
 * Worker를 다시 만드는 것은 시간 초과·오류로 reset()했을 때뿐이다. 실제 Pyodide 없이 가짜 Worker로 확인한다.
 */
import { describe, expect, it } from "vitest";
import { EngineClient } from "./client";
import type { EngineReq, WorkerLike } from "./protocol";

/** 받은 요청을 기록하고 바로 응답하는 가짜 Worker. hang이면 python-run에 "started"만 보내고 끝내지 않는다 */
function fakeFactory(opts: { hang?: () => boolean } = {}) {
  const created: { reqs: EngineReq[]; terminated: boolean }[] = [];
  const make = (): WorkerLike => {
    const rec = { reqs: [] as EngineReq[], terminated: false };
    created.push(rec);
    const loaded = new Set<string>();
    const w: WorkerLike = {
      onmessage: null,
      onerror: null,
      postMessage(m: { id: number } & EngineReq) {
        rec.reqs.push(m);
        const reply = (data: unknown) => queueMicrotask(() => w.onmessage?.({ data } as MessageEvent));
        if (m.kind === "python-init") {
          for (const p of m.packages) loaded.add(p);
          reply({ id: m.id, kind: "ready", ms: 1, packages: [...loaded] });
        } else if (m.kind === "python-run") {
          reply({ id: m.id, kind: "started" });
          if (!opts.hang?.()) reply({ id: m.id, kind: "result", ms: 1, result: { stdout: "", error: null, checks: [] } });
        }
      },
      terminate() {
        rec.terminated = true;
      },
    } as unknown as WorkerLike;
    return w;
  };
  return { created, make };
}

describe("엔진 Worker 재사용", () => {
  it("판다스 문제 여러 개: Worker 1개, 판다스 불러오기 요청은 처음 한 번만 실제로 일어난다", async () => {
    const f = fakeFactory();
    const eng = new EngineClient(f.make);
    // 문제 1(판다스) 준비 → 실행, 문제 2·3(판다스) 준비 → 실행
    for (let i = 0; i < 3; i++) {
      expect((await eng.preparePython("/b/", [], ["numpy", "pandas"])).ok).toBe(true);
      expect((await eng.runPython({ base: "/b/", wheels: [], packages: ["numpy", "pandas"], code: "print(1)" })).status).toBe("done");
    }
    expect(f.created).toHaveLength(1);
    expect(eng.loaded.packages.has("pandas")).toBe(true); // 화면은 이 값을 보고 두 번째 판다스 문제부터 버튼 없이 자동 준비한다
  });

  it("시간 초과로 Worker를 종료한 경우에만 새로 띄우고, 불러온 패키지 기록을 비운다", async () => {
    let hang = true;
    const f = fakeFactory({ hang: () => hang });
    const eng = new EngineClient(f.make);
    await eng.preparePython("/b/", [], ["numpy", "pandas"]);
    expect((await eng.runPython({ base: "/b/", wheels: [], packages: ["pandas"], code: "while True: pass" }, 20)).status).toBe("timeout");
    expect(f.created[0].terminated).toBe(true);
    expect(eng.loaded.packages.has("pandas")).toBe(false); // → 다음 판다스 문제는 다시 버튼을 보여 준다
    hang = false;
    expect((await eng.runPython({ base: "/b/", wheels: [], packages: ["pandas"], code: "print(1)" })).status).toBe("done");
    expect(f.created).toHaveLength(2);
  });

  it("불러오기 실패(내려받기 실패 등): 그 Worker를 버리고, 다시 시도는 새 Worker로 처음부터", async () => {
    let failInit = true;
    const created: WorkerLike[] = [];
    const eng = new EngineClient(() => {
      const w = {
        onmessage: null,
        onerror: null,
        terminated: false,
        postMessage(m: { id: number } & EngineReq) {
          const data = failInit ? { id: m.id, kind: "fail", message: "엔진 파일을 내려받지 못했습니다(HTTP 503)" } : { id: m.id, kind: "ready", ms: 1, packages: [] };
          queueMicrotask(() => w.onmessage?.({ data } as MessageEvent));
        },
        terminate() {
          w.terminated = true;
        },
      } as unknown as WorkerLike & { terminated: boolean };
      created.push(w);
      return w;
    });
    const r = await eng.preparePython("/b/", [], []);
    expect(r).toEqual({ ok: false, message: "엔진 파일을 내려받지 못했습니다(HTTP 503)" });
    expect((created[0] as WorkerLike & { terminated: boolean }).terminated).toBe(true);
    failInit = false;
    expect((await eng.preparePython("/b/", [], [])).ok).toBe(true);
    expect(created).toHaveLength(2);
  });
});

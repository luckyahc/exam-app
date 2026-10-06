// Python 실행 런타임(Sprint 13). 브라우저 Web Worker와 Node(Vitest·Sprint 14 검증)가 함께 쓰는 순수 JS 모듈이다.
// Pyodide 인스턴스를 받아서 쓰기만 하고, 불러오기(어디서 파일을 읽을지)는 호출하는 쪽이 정한다.

/** 출력 길이 제한(글자). 넘으면 이후 출력은 버리고 truncated = true */
export const MAX_OUTPUT_CHARS = 20000;

// 매 실행 앞에 붙는 준비 코드: input() 금지(결정 — 이 앱의 문제에는 표준 입력이 없다), 실행마다 새 작업 폴더
const PRELUDE = `
import builtins as __b, os as __os, tempfile as __tf
def __no_input(*args, **kwargs):
    raise RuntimeError("input()은 쓸 수 없습니다 — 이 앱의 코드 문제에는 표준 입력이 없습니다")
__b.input = __no_input
__os.chdir(__tf.mkdtemp())
del __b, __os, __tf, __no_input
`;

/**
 * openpyxl·et_xmlfile 순수 파이썬 휠을 site-packages에 푼다(Pyodide 패키지 목록에 없어서 직접 설치).
 * @param {any} py Pyodide
 * @param {Uint8Array[]} wheels 휠 파일 바이트
 */
export function installWheels(py, wheels) {
  // 작업 폴더가 아니라 site-packages에 푼다(실행마다 작업 폴더를 새로 만들므로)
  const site = py.runPython("import site; site.getsitepackages()[0]");
  for (const w of wheels) py.unpackArchive(w, "wheel", { extractDir: site });
}

/**
 * Python 오류를 화면용으로 줄인다: 마지막 줄(예: "SyntaxError: expected ':'")과 사용자 코드의 줄 번호.
 * @param {unknown} e
 * @returns {{ type: string, message: string, line: number | null }}
 */
export function formatPythonError(e) {
  const text = String(e && typeof e === "object" && "message" in e ? e.message : e);
  const lines = text.split("\n").map((l) => l.trimEnd()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "Error";
  const m = /^([A-Za-z_][\w.]*)(?::\s?(.*))?$/.exec(last);
  let line = null;
  for (const l of lines) {
    const lm = /File "<exec>", line (\d+)/.exec(l);
    if (lm) line = Number(lm[1]);
  }
  return { type: m ? m[1] : "Error", message: last, line };
}

/**
 * 코드 하나를 실행한다. 이름 공간은 매번 새로 만들고 실행 후 버린다.
 * @param {any} py Pyodide
 * @param {{ code: string, setup?: string, checks?: string[] }} req
 *   setup: 사용자 코드 앞에 같은 이름 공간에서 실행(파일 만들기·변수 준비), checks: 사용자 코드 뒤에 참/거짓을 볼 식
 * @returns {Promise<{ stdout: string, truncated: boolean, error: null | { type: string, message: string, line: number | null }, checks: { expr: string, pass: boolean, error?: string }[], setupError?: string }>}
 */
export async function runPython(py, req) {
  let stdout = "";
  let truncated = false;
  const write = (s) => {
    if (truncated) return;
    const chunk = s + "\n";
    if (stdout.length + chunk.length > MAX_OUTPUT_CHARS) {
      stdout += chunk.slice(0, MAX_OUTPUT_CHARS - stdout.length);
      truncated = true;
    } else stdout += chunk;
  };
  py.setStdout({ batched: write });
  py.setStderr({ batched: write });
  const ns = py.globals.get("dict")();
  try {
    await py.runPythonAsync(PRELUDE, { globals: ns });
    if (req.setup) {
      try {
        await py.runPythonAsync(req.setup, { globals: ns });
      } catch (e) {
        return { stdout, truncated, error: null, checks: [], setupError: formatPythonError(e).message };
      }
    }
    let error = null;
    try {
      await py.runPythonAsync(req.code, { globals: ns });
    } catch (e) {
      error = formatPythonError(e);
    }
    const checks = [];
    if (!error) {
      for (const expr of req.checks ?? []) {
        try {
          const v = py.runPython(`bool(${expr})`, { globals: ns });
          checks.push({ expr, pass: v === true });
        } catch (e) {
          checks.push({ expr, pass: false, error: formatPythonError(e).message });
        }
      }
    }
    return { stdout, truncated, error, checks };
  } finally {
    ns.destroy();
  }
}

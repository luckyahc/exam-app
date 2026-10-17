# 데이터과학 Lec7(맷플롯립) 문항 로컬 검증(2026-10-17). 앱 실행 엔진(Pyodide)에 맷플롯립이 없어서
# 로컬 CPython + matplotlib(Agg 백엔드)로 문항 코드를 실행하고 그래프 객체 속성·통계를 JSON으로 돌려준다.
# 실행: lib/verify/matplotlib.test.ts가 문항 데이터에서 작업 목록을 만들어 이 스크립트에 넘긴다(직접 실행할 일은 없다).
#   python scripts/verify-matplotlib.py jobs.json  → 표준 출력에 결과 JSON
# 작업 하나: { key, code, after?, truths?: [식], value?: 식 }
#   - code: 문항 코드(슬라이드 앞 셀에서 불러온 plt·np·pd는 미리 넣어 둔다), plt.show()는 아무것도 하지 않게 바꾼다
#   - after: code 뒤에 실행할 검사 준비 코드(예: st = cbook.boxplot_stats(numbers)[0])
#   - truths: 보기마다 참/거짓을 계산하는 식, value: 정답과 비교할 값을 계산하는 식
#   - 결과: { key, error: {type, message} | null, stdout(print 출력 — 함수 정리 예시), signature(그래프 구조), truths, value }
import contextlib
import io
import json
import logging
import os
import sys
import tempfile
import warnings

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from matplotlib import cbook, colors  # noqa: E402

warnings.filterwarnings("ignore")  # 한글 폰트가 없는 PC의 글리프 경고
logging.getLogger("matplotlib").setLevel(logging.ERROR)

# 슬라이드 주석의 낱말(7-4·7-5): 포맷 문자 → 뜻
COLOR = {"r": "빨간색", "g": "초록색", "b": "파란색", "k": "검은색", "y": "노란색"}
MARKER = {"s": "사각형 마커", "^": "삼각형 마커", ".": "점 마커", "o": "원 마커", "None": "마커 없음"}
STYLE = {"-": "실선", "--": "파선", ":": "점선", "-.": "일점쇄선", "None": "선 없음"}


def desc(line):
    """선 하나의 색·마커·선 스타일을 슬라이드 낱말로: '빨간색 · 사각형 마커 · 점선'"""
    c = line.get_color()
    name = c if isinstance(c, str) and c in COLOR else next((k for k in COLOR if colors.same_color(k, c)), colors.to_hex(c))
    return f"{COLOR.get(name, name)} · {MARKER[str(line.get_marker())]} · {STYLE[str(line.get_linestyle())]}"


def r6(v):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r6(x) for x in v]
    if isinstance(v, (float, np.floating)):
        return round(float(v), 6)
    if isinstance(v, np.integer):
        return int(v)
    return v


def signature(fig):
    fig.canvas.draw()
    out = []
    for ax in fig.axes:
        spec = ax.get_subplotspec()
        legend = ax.get_legend()
        out.append({
            "grid": None if spec is None else [*spec.get_geometry()[:2], spec.rowspan.start, spec.colspan.start],
            "title": ax.get_title(),
            "xlabel": ax.get_xlabel(),
            "ylabel": ax.get_ylabel(),
            "xlim": r6(ax.get_xlim()),
            "ylim": r6(ax.get_ylim()),
            "lines": [[colors.to_hex(l.get_color()), str(l.get_marker()), str(l.get_linestyle()), l.get_alpha(), l.get_label(), r6(list(l.get_xdata())), r6(list(l.get_ydata()))] for l in ax.lines],
            "patches": [[type(p).__name__, colors.to_hex(p.get_facecolor()), r6(list(p.get_path().vertices.flatten()))] for p in ax.patches],
            "collections": [[r6(c.get_offsets().tolist()), [colors.to_hex(x) for x in c.get_facecolors()], r6(list(c.get_sizes()))] for c in ax.collections],
            "texts": [[t.get_text(), r6(list(t.get_position()))] for t in ax.texts],
            "xticklabels": [t.get_text() for t in ax.get_xticklabels()],
            "legend": None if legend is None else [t.get_text() for t in legend.get_texts()],
        })
    return out


def run(job, workdir):
    plt.close("all")
    plt.rcdefaults()
    np.random.seed(0)  # 7-5·7-6의 randn — 같은 작업의 변형끼리 같은 데이터
    plt.show = lambda *a, **k: None
    os.chdir(workdir)
    ns = {"plt": plt, "np": np, "pd": pd, "cbook": cbook, "desc": desc, "__name__": "__main__"}
    res = {"key": job["key"], "error": None, "stdout": "", "signature": None, "truths": None, "value": None}
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(job["code"], "<code>", "exec"), ns)
    except Exception as e:  # noqa: BLE001 — 오류 종류 자체가 검사 대상
        res["error"] = {"type": type(e).__name__, "message": str(e)}
        return res
    finally:
        res["stdout"] = buf.getvalue()
    fig = plt.gcf()
    ns.update(fig=fig, ax=plt.gca())
    res["signature"] = signature(fig)
    if job.get("after"):
        exec(job["after"], ns)
    if job.get("truths"):
        res["truths"] = [bool(eval(t, ns)) for t in job["truths"]]
    if job.get("value"):
        res["value"] = r6(eval(job["value"], ns))
    return res


def main():
    jobs = json.load(open(sys.argv[1], encoding="utf8"))
    with tempfile.TemporaryDirectory() as d:
        results = [run(j, d) for j in jobs]
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps({"matplotlib": matplotlib.__version__, "results": results}, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()

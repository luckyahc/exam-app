import type { SubjectDef } from "../types";

// 챕터 = 강의(Lec1~Lec7). 구성·최소 문항 수 근거: docs/ds-source-analysis.md, docs/coverage-matrix.md 데이터과학 절,
// 결정 사항: docs/ds-question-types.md §10(2026-10-06). 문제는 Sprint 15·16에서 채웠다(Lec6까지 들어가 준비 중 표시를 뗐다).
const dataScience = {
  id: "data-science",
  name: "데이터과학",
  shortName: "DS",
  color: { light: "#a14a0c", dark: "#fbbf24" },
  sourceDir: "source/data-science",
  // ⭐ 근거 0건(필기·인쇄 강조 없음) — 결정 3
  examPoints: false,
  // 시험처럼 복수 선택도 완전히 맞아야 1점(결정 6). 코드 유형은 유형 자체가 0/1
  allOrNothing: ["multi"],
  chapters: [
    { id: "lec1", exam: "2-2-mid", title: "Lec1. 인공지능과 빅데이터 · 파이썬 · Colab", shortTitle: "AI·파이썬·Colab", minQuestions: 20, load: () => import("./lec1").then((m) => m.default) },
    { id: "lec2", exam: "2-2-mid", title: "Lec2. 파이썬 기초", shortTitle: "파이썬 기초", minQuestions: 56, load: () => import("./lec2").then((m) => m.default) },
    { id: "lec3", exam: "2-2-mid", title: "Lec3. CSV 파일 · 엑셀 파일", shortTitle: "CSV·엑셀", minQuestions: 27, load: () => import("./lec3").then((m) => m.default) },
    { id: "lec4", exam: "2-2-mid", title: "Lec4. 셀레니움 · 웹 크롤링", shortTitle: "셀레니움", minQuestions: 32, load: () => import("./lec4").then((m) => m.default) },
    { id: "lec5", exam: "2-2-mid", title: "Lec5. 데이터베이스 · MySQL", shortTitle: "MySQL", minQuestions: 66, load: () => import("./lec5").then((m) => m.default) },
    { id: "lec6", exam: "2-2-mid", title: "Lec6. 넘파이 · 판다스", shortTitle: "넘파이·판다스", minQuestions: 78, load: () => import("./lec6").then((m) => m.default) },
    // Lec7은 s.1~25(맷플롯립 기초·기온 CSV 준비)만(2026-10-17) — 맷플롯립 코드는 로컬 CPython으로 검증(lib/verify/matplotlib.test.ts)
    { id: "lec7", exam: "2-2-mid", title: "Lec7. 데이터 시각화 · 맷플롯립", shortTitle: "맷플롯립", minQuestions: 44, load: () => import("./lec7").then((m) => m.default) },
    // 기말(2026-11-03): Lec7 s.26~59(맷플롯립 활용 후반·워드클라우드·네트워크X)와 Lec8 전체. s.21~25는 위 lec7(중간)에 이미 있다
    { id: "lec7b", exam: "2-2-final", title: "Lec7 후반. 기온 데이터 · 워드클라우드 · 네트워크X", shortTitle: "시각화 활용", minQuestions: 22, load: () => import("./lec7b").then((m) => m.default) },
    { id: "lec8", exam: "2-2-final", title: "Lec8. 데이터 전처리", shortTitle: "데이터 전처리", minQuestions: 28, load: () => import("./lec8").then((m) => m.default) },
  ],
} as const satisfies SubjectDef;

export default dataScience;

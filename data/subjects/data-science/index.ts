import type { SubjectDef } from "../types";

// 챕터 = 강의(Lec1~Lec6). 구성·최소 문항 수 근거: docs/ds-source-analysis.md, docs/coverage-matrix.md 데이터과학 절,
// 결정 사항: docs/ds-question-types.md §10(2026-10-06). 문제는 Sprint 15·16에서 채운다.
const dataScience = {
  id: "data-science",
  name: "데이터과학",
  shortName: "DS",
  color: { light: "#b45309", dark: "#fbbf24" },
  sourceDir: "source/data-science",
  status: "preparing",
  // ⭐ 근거 0건(필기·인쇄 강조 없음) — 결정 3
  examPoints: false,
  // 시험처럼 복수 선택도 완전히 맞아야 1점(결정 6). 코드 유형은 유형 자체가 0/1
  allOrNothing: ["multi"],
  chapters: [
    { id: "lec1", title: "Lec1. 인공지능과 빅데이터 · 파이썬 · Colab", shortTitle: "AI·파이썬·Colab", minQuestions: 20, load: () => import("./lec1").then((m) => m.default) },
    { id: "lec2", title: "Lec2. 파이썬 기초", shortTitle: "파이썬 기초", minQuestions: 56, load: () => import("./lec2").then((m) => m.default) },
    { id: "lec3", title: "Lec3. CSV 파일 · 엑셀 파일", shortTitle: "CSV·엑셀", minQuestions: 27, load: () => import("./lec3").then((m) => m.default) },
    { id: "lec4", title: "Lec4. 셀레니움 · 웹 크롤링", shortTitle: "셀레니움", minQuestions: 32, load: () => import("./lec4").then((m) => m.default) },
    { id: "lec5", title: "Lec5. 데이터베이스 · MySQL", shortTitle: "MySQL", minQuestions: 66, load: () => import("./lec5").then((m) => m.default) },
    { id: "lec6", title: "Lec6. 넘파이 · 판다스", shortTitle: "넘파이·판다스", minQuestions: 78, load: () => import("./lec6").then((m) => m.default) },
  ],
} as const satisfies SubjectDef;

export default dataScience;

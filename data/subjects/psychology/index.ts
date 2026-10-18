import type { SubjectDef } from "../types";

// 심리학개론(2026-10-16): 원천자료 docs/psychology/source-ch01-03.md · source-ch04-07.md(교재 사진 전사본 + 부록 용어 정의), 계획 docs/psychology/plan.md.
// 시험 범위 1~7장(4~7장은 2026-10-18 2단계에서 추가).
// 서술형은 자기 채점(essay) — 정답률·오답노트에서 빠진다. ⭐ = 용어 박스·표에서 나온 문항(printed-emphasis).
const psychology = {
  id: "psychology",
  name: "심리학개론",
  shortName: "PSY",
  color: { light: "#7e22ce", dark: "#d8b4fe" },
  // 교재 PDF가 없고 사진 전사본(md)만 있다 — integrity.test.ts의 근거 폴더 검사는 md 원천자료로 본다
  sourceDir: "docs/psychology",
  chapters: [
    { id: "ch01", title: "Ch01. 심리과학을 비판적으로 생각하기", shortTitle: "심리과학", minQuestions: 35, load: () => import("./ch01").then((m) => m.default) },
    { id: "ch02", title: "Ch02. 마음의 생물학과 의식", shortTitle: "생물학과 의식", minQuestions: 45, load: () => import("./ch02").then((m) => m.default) },
    { id: "ch03", title: "Ch03. 일생에 걸친 발달", shortTitle: "발달", minQuestions: 40, load: () => import("./ch03").then((m) => m.default) },
    { id: "ch04", title: "Ch04. 감각과 지각", shortTitle: "감각과 지각", minQuestions: 40, load: () => import("./ch04").then((m) => m.default) },
    { id: "ch05", title: "Ch05. 학습", shortTitle: "학습", minQuestions: 40, load: () => import("./ch05").then((m) => m.default) },
    { id: "ch06", title: "Ch06. 기억", shortTitle: "기억", minQuestions: 45, load: () => import("./ch06").then((m) => m.default) },
    { id: "ch07", title: "Ch07. 사고와 언어 그리고 지능", shortTitle: "사고·언어·지능", minQuestions: 45, load: () => import("./ch07").then((m) => m.default) },
  ],
} as const satisfies SubjectDef;

export default psychology;

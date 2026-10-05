import type { SubjectDef } from "../types";

// 챕터 구성·문항 목표 근거: docs/dc-source-analysis.md, docs/coverage-matrix.md
const dataComm = {
  id: "data-comm",
  name: "데이터 통신",
  shortName: "DC",
  color: { light: "#0f766e", dark: "#2dd4bf" },
  sourceDir: "source/data-communication",
  // 생성기 10개(Sprint 9) — lib/sim/data-comm/generators.ts
  loadGenerators: () => import("@/lib/sim/data-comm/generators").then((m) => m.DC_GENERATORS),
  chapters: [
    {
      id: "ch01",
      title: "Ch01. 개요",
      shortTitle: "개요",
      minQuestions: 57,
      load: () => import("./ch01").then((m) => m.default),
    },
    {
      id: "ch02",
      title: "Ch02. 물리 계층",
      shortTitle: "물리 계층",
      minQuestions: 106,
      load: () => import("./ch02").then((m) => m.default),
    },
  ],
} as const satisfies SubjectDef;

export default dataComm;

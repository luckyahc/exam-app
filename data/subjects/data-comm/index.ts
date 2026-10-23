import type { Question } from "@/types/question";
import type { SubjectDef } from "../types";

// 챕터 구성·문항 목표 근거: docs/dc-source-analysis.md, docs/coverage-matrix.md
// 단답형 모음(shortAnswer.ts, 2026-10-23)과 힌트관련1~5 모의시험(hintExams.ts, 2026-10-22 — docs/dc-exam-hint.md)은 각 챕터 문항 뒤에 이 순서로 붙인다.
const dataComm = {
  id: "data-comm",
  name: "데이터 통신",
  shortName: "DC",
  color: { light: "#0f766e", dark: "#2dd4bf" },
  sourceDir: "source/data-communication",
  // 시험 힌트: '모두 고르시오'(정답 2~4개)는 부분 점수 없음 — docs/dc-exam-hint.md
  allOrNothing: ["multi"],
  // 생성기 10개(Sprint 9) — lib/sim/data-comm/generators.ts
  loadGenerators: () => import("@/lib/sim/data-comm/generators").then((m) => m.DC_GENERATORS),
  chapters: [
    {
      id: "ch01",
      title: "Ch01. 개요",
      shortTitle: "개요",
      minQuestions: 56,
      load: (): Promise<Question[]> => Promise.all([import("./ch01"), import("./shortAnswer"), import("./hintExams")]).then(([m, s, h]) => [...m.default, ...s.shortQuestions("ch01"), ...h.hintQuestions("ch01")]),
    },
    {
      id: "ch02",
      title: "Ch02. 물리 계층",
      shortTitle: "물리 계층",
      minQuestions: 106,
      load: (): Promise<Question[]> => Promise.all([import("./ch02"), import("./shortAnswer"), import("./hintExams")]).then(([m, s, h]) => [...m.default, ...s.shortQuestions("ch02"), ...h.hintQuestions("ch02")]),
    },
  ],
} as const satisfies SubjectDef;

export default dataComm;

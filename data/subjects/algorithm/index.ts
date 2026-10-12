import type { SubjectDef } from "../types";

// 알고리즘: 문제는 족보에서만 만든다(docs/jokbo-plan.md). 챕터 = 족보에 나온 주제(docs/jokbo/algorithm/inventory.md §3),
// minQuestions = 챕터별 대표 문항 수(예정, 2019 예상문제 E19 제외 후). 문제는 Sprint 21에서 채우고, 그때 "준비 중"(status)을 뗀다.
const algorithm = {
  id: "algorithm",
  name: "알고리즘",
  shortName: "ALG",
  color: { light: "#be123c", dark: "#fb7185" },
  sourceDir: "source/algorithm",
  status: "preparing",
  // ⭐ 근거(필기·인쇄 강조) 없음 — 족보 출현 횟수는 "족보 N회" 뱃지로 보인다
  examPoints: false,
  chapters: [
    { id: "analysis", title: "알고리즘 분석 · 점근 표기", shortTitle: "점근 분석", minQuestions: 9, load: () => import("./analysis").then((m) => m.default) },
    { id: "recurrence", title: "재귀 · 점화식 · 마스터 정리", shortTitle: "점화식", minQuestions: 11, load: () => import("./recurrence").then((m) => m.default) },
    { id: "sorting", title: "정렬 · 힙 · 선형 시간 정렬", shortTitle: "정렬", minQuestions: 12, load: () => import("./sorting").then((m) => m.default) },
    { id: "dc", title: "분할 정복 · 선택", shortTitle: "분할 정복", minQuestions: 6, load: () => import("./dc").then((m) => m.default) },
    { id: "dp", title: "동적 계획법", shortTitle: "동적 계획법", minQuestions: 15, load: () => import("./dp").then((m) => m.default) },
  ],
} as const satisfies SubjectDef;

export default algorithm;

import type { Question } from "@/types/question";
import type { SubjectDef } from "../types";

// 알고리즘: 족보 문항(docs/jokbo-plan.md) + 족보에 없던 주제의 일반 문항(2026-10-15, dc·dp — docs/verification/algorithm-general.md).
// 강의 자료 2·3 챕터(analysis·recurrence·sorting)에는 족보 유형 생성 문항(patterns.ts, 2026-10-16 — docs/jokbo/algorithm/pattern-analysis.md)을 뒤에 붙인다.
// 족보관련1·2 모의시험(mockExams.ts, 2026-10-22 — docs/jokbo/algorithm/mock-exams.md)은 모든 챕터 맨 뒤에 붙인다.
// 챕터 = 족보에 나온 주제(docs/jokbo/algorithm/inventory.md §3), minQuestions = 챕터별 족보 대표 문항 수(2019 예상문제 E19 제외 후).
const algorithm = {
  id: "algorithm",
  name: "알고리즘",
  shortName: "ALG",
  color: { light: "#be123c", dark: "#fb7185" },
  sourceDir: "source/algorithm",
  // ⭐ 근거(필기·인쇄 강조) 없음 — 족보 출현 횟수는 "족보 N회" 뱃지로 보인다
  examPoints: false,
  chapters: [
    { id: "analysis", title: "알고리즘 분석 · 점근 표기", shortTitle: "점근 분석", minQuestions: 9, load: (): Promise<Question[]> => Promise.all([import("./analysis"), import("./patterns"), import("./mockExams")]).then(([m, p, x]) => [...m.default, ...p.analysisPatterns, ...x.mockQuestions("analysis")]) },
    { id: "recurrence", title: "재귀 · 점화식 · 마스터 정리", shortTitle: "점화식", minQuestions: 11, load: (): Promise<Question[]> => Promise.all([import("./recurrence"), import("./patterns"), import("./mockExams")]).then(([m, p, x]) => [...m.default, ...p.recurrencePatterns, ...x.mockQuestions("recurrence")]) },
    { id: "sorting", title: "정렬 · 힙 · 선형 시간 정렬", shortTitle: "정렬", minQuestions: 12, load: (): Promise<Question[]> => Promise.all([import("./sorting"), import("./patterns"), import("./mockExams")]).then(([m, p, x]) => [...m.default, ...p.sortingPatterns, ...x.mockQuestions("sorting")]) },
    { id: "dc", title: "분할 정복 · 선택", shortTitle: "분할 정복", minQuestions: 6, load: (): Promise<Question[]> => Promise.all([import("./dc"), import("./mockExams")]).then(([m, x]) => [...m.default, ...x.mockQuestions("dc")]) },
    { id: "dp", title: "동적 계획법", shortTitle: "동적 계획법", minQuestions: 15, load: (): Promise<Question[]> => Promise.all([import("./dp"), import("./mockExams")]).then(([m, x]) => [...m.default, ...x.mockQuestions("dp")]) },
  ],
} as const satisfies SubjectDef;

export default algorithm;

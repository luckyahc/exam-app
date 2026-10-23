import { inScope } from "@/lib/qtypes/base";
import type { Question } from "@/types/question";
import type { ChapterDef, SubjectDef } from "../types";

// 심리학개론(2026-10-23 재작성): 원천자료 docs/psychology/summary-notes.pdf("마이어스 심리학개론 상세 요약 정리 노트", 로컬 전용 — 커밋하지 않는다),
// 범위 CHAPTER 01~08(하단 쪽 번호 2~28), 계획 docs/psychology/plan.md. 장 순서·이름은 PDF 목차 그대로.
// 옛 단원 ch01~ch07(교재 사진 전사본 기준, docs/psychology/_old/)은 삭제 — 새 단원 id는 c01~c08이라 옛 기록 id와 겹치지 않는다.
// 서술형은 자기 채점(essay) — 정답률·오답노트에서 빠진다. ⭐ = PDF 표·굵은 용어에서 나온 문항(printed-emphasis).
//
// 출제 범위 조정(2026-10-24): 교재(축약판)에 없는 부분은 지우지 않고 숨긴다 — 다시 켜려면 아래 표시를 지운다.
// - 단원 c04 전체: outOfScope 단원 → 과목 화면·출제·통계에 나오지 않는다(단원 번호는 그대로).
// - c02 "행동유전학과 진화심리학", c03 "향정신성 약물"(약물 세 소제목) 절의 문항: 문항의 outOfScope: true → 로더가 걸러 낸다.

type PsyChapter = Omit<ChapterDef, "load"> & { outOfScope?: true; loadAll: () => Promise<readonly Question[]> };

/** 숨긴 것까지 모든 단원·문항(테스트와 범위를 다시 켤 때 쓴다) */
export const ALL_CHAPTERS: readonly PsyChapter[] = [
  { id: "c01", title: "Ch01. 심리학의 역사와 과학적 사고", shortTitle: "역사와 과학적 사고", minQuestions: 26, loadAll: () => import("./c01").then((m) => m.default) },
  { id: "c02", title: "Ch02. 마음의 생물학", shortTitle: "마음의 생물학", minQuestions: 25, loadAll: () => import("./c02").then((m) => m.default) },
  { id: "c03", title: "Ch03. 의식과 이중 처리과정", shortTitle: "의식과 이중 처리과정", minQuestions: 33, loadAll: () => import("./c03").then((m) => m.default) },
  { id: "c04", title: "Ch04. 본성, 양육, 인간의 다양성", shortTitle: "본성·양육·다양성", minQuestions: 22, outOfScope: true, loadAll: () => import("./c04").then((m) => m.default) },
  { id: "c05", title: "Ch05. 전 생애 발달", shortTitle: "전 생애 발달", minQuestions: 24, loadAll: () => import("./c05").then((m) => m.default) },
  { id: "c06", title: "Ch06. 감각과 지각", shortTitle: "감각과 지각", minQuestions: 28, loadAll: () => import("./c06").then((m) => m.default) },
  { id: "c07", title: "Ch07. 학습", shortTitle: "학습", minQuestions: 26, loadAll: () => import("./c07").then((m) => m.default) },
  { id: "c08", title: "Ch08. 기억", shortTitle: "기억", minQuestions: 24, loadAll: () => import("./c08").then((m) => m.default) },
];

const psychology = {
  id: "psychology",
  name: "심리학개론",
  shortName: "PSY",
  color: { light: "#7e22ce", dark: "#d8b4fe" },
  sourceDir: "docs/psychology",
  // 출제 범위 안의 단원·문항만 — 화면·퀴즈·통계는 이것만 본다
  chapters: ALL_CHAPTERS.filter((c) => !c.outOfScope).map(({ loadAll, outOfScope: _, ...c }) => ({ ...c, load: () => loadAll().then(inScope) })),
} as const satisfies SubjectDef;

export default psychology;

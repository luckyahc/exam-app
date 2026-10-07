import type { SubjectDef } from "../types";
import type { Question } from "@/types/question";
import { applyHints } from "./hints";

type Mod = Promise<{ default: readonly Question[] }>;
/**
 * 챕터 문항 + 시험 힌트 보강 문항(chNN-hint.ts) + 용어 단답형(terms.ts)을 합치고 힌트 연결(⭐)을 적용한다.
 * 반환 타입을 적어 레지스트리 타입 추론이 순환하지 않게
 */
const withHints =
  (chapter: string, main: () => Mod, extra: () => Mod) =>
  (): Promise<readonly Question[]> =>
    Promise.all([main(), extra(), import("./terms")]).then(([m, h, t]) => applyHints([...m.default, ...h.default, ...t.termQuestions(chapter)]));

const os = {
  id: "os",
  name: "운영체제",
  shortName: "OS",
  color: { light: "#4f46e5", dark: "#818cf8" },
  sourceDir: "source/os",
  loadGenerators: () => import("@/lib/sim/os/generators").then((m) => m.OS_GENERATORS),
  loadGlossary: () => import("./glossary").then((m) => m.OS_GLOSSARY),
  chapters: [
    {
      id: "ch02",
      title: "Ch02. 운영체제 개요",
      shortTitle: "운영체제 개요",
      minQuestions: 50,
      load: withHints("ch02", () => import("./ch02"), () => import("./ch02-hint")),
    },
    {
      id: "ch03",
      title: "Ch03. 프로세스 기술과 제어",
      shortTitle: "프로세스",
      minQuestions: 80,
      load: withHints("ch03", () => import("./ch03"), () => import("./ch03-hint")),
    },
    {
      id: "ch07",
      title: "Ch07. 메모리 관리",
      shortTitle: "메모리 관리",
      minQuestions: 80,
      load: withHints("ch07", () => import("./ch07"), () => import("./ch07-hint")),
    },
    {
      id: "ch08",
      title: "Ch08. 가상 메모리",
      shortTitle: "가상 메모리",
      minQuestions: 120,
      load: withHints("ch08", () => import("./ch08"), () => import("./ch08-hint")),
    },
  ],
} as const satisfies SubjectDef;

export default os;

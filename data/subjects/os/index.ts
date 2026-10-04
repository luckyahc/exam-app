import type { SubjectDef } from "../types";

const os = {
  id: "os",
  name: "운영체제",
  shortName: "OS",
  color: { light: "#4f46e5", dark: "#818cf8" },
  sourceDir: "source/os",
  loadGenerators: () => import("@/lib/sim/os/generators").then((m) => m.OS_GENERATORS),
  chapters: [
    {
      id: "ch02",
      title: "Ch02. 운영체제 개요",
      shortTitle: "운영체제 개요",
      minQuestions: 50,
      load: () => import("./ch02").then((m) => m.default),
    },
    {
      id: "ch03",
      title: "Ch03. 프로세스 기술과 제어",
      shortTitle: "프로세스",
      minQuestions: 80,
      load: () => import("./ch03").then((m) => m.default),
    },
    {
      id: "ch07",
      title: "Ch07. 메모리 관리",
      shortTitle: "메모리 관리",
      minQuestions: 80,
      load: () => import("./ch07").then((m) => m.default),
    },
    {
      id: "ch08",
      title: "Ch08. 가상 메모리",
      shortTitle: "가상 메모리",
      minQuestions: 120,
      load: () => import("./ch08").then((m) => m.default),
    },
  ],
} as const satisfies SubjectDef;

export default os;

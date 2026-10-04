import type { GeneratorMap } from "@/lib/sim/_shared/types";
import type { Question } from "@/types/question";

export interface ChapterDef {
  /** 과목 안에서만 유일. 예: 'ch08' */
  id: string;
  /** 'Ch08. 가상 메모리' */
  title: string;
  /** '가상 메모리' */
  shortTitle: string;
  /** 정적 문제 최소 문항 수 */
  minQuestions: number;
  /** 챕터 문제 배열을 동적 import로 불러온다(퀴즈 화면에서 필요한 챕터만 로드). */
  load: () => Promise<readonly Question[]>;
}

export interface SubjectDef {
  /** URL slug: 소문자 + 하이픈. 'os', 'data-comm' */
  id: string;
  /** '운영체제' */
  name: string;
  /** 좁은 화면/뱃지용. 'OS' */
  shortName: string;
  /** 대표 색상(hex). 라이트/다크 배경 대비 4.5:1 이상 — data/subjects/integrity.test.ts가 검사 */
  color: { light: string; dark: string };
  /** 근거 PDF 폴더 (문서/검수용) */
  sourceDir: string;
  /** 배열 순서 = 화면 표시 순서 */
  chapters: readonly ChapterDef[];
  /** 문제 생성기(lib/sim/{과목}/generators.ts)를 동적 import로 불러온다 — 시뮬레이터 코드가 모든 화면 번들에 실리지 않게 */
  loadGenerators?: () => Promise<GeneratorMap>;
}

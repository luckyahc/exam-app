/**
 * 문제 한 개의 데이터. 실제 타입(`types/question.ts`의 `Question`, 과목 필드 포함)은
 * Sprint 3(문제 유형 엔진)에서 정의하고 이 별칭을 그것으로 교체한다.
 */
export type QuestionData = unknown;

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
  load: () => Promise<readonly QuestionData[]>;
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
}

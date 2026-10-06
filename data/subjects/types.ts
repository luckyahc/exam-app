import type { GeneratorMap } from "@/lib/sim/_shared/types";
import type { QType, Question } from "@/types/question";

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
  /**
   * 콘텐츠 작성 전 과목. 문제가 0개인 챕터만 최소 문항 수 검사를 건너뛴다(문제가 들어간 챕터는 바로 검사).
   * 화면의 "준비 중"은 이 값이 아니라 실제 문제 수로 정한다.
   */
  status?: "preparing";
  /** false = 이 과목은 ⭐(시험 포인트)를 쓰지 않는다 — 화면에 "⭐ 해당 없음", ⭐만 풀기·달성도 숨김 */
  examPoints?: false;
  /** 부분 점수 없이 0/1로 채점하는 유형(부분 점수를 화면에도 보이지 않는다). 예: 데이터과학 ["multi"] */
  allOrNothing?: readonly QType[];
}

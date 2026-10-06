import type { SubjectId } from "@/data/subjects/registry";

/** ⭐ 근거: handwritten = 교수님 필기(OS), printed-emphasis = 슬라이드에 인쇄된 강조(데이터 통신). */
export type ExamBasis = "handwritten" | "printed-emphasis";

/** 생성기 기반 문제: 같은 name·params·seed면 같은 문제가 다시 만들어진다. */
export interface GeneratorRef {
  name: string;
  params: Record<string, unknown>;
  seed: number;
}

/** 지문에 딸린 코드 블록 */
export interface QuestionCode {
  language: "python" | "sql";
  source: string;
  /** 줄 번호 표시(슬라이드처럼 "3행의 a" 같은 설명이 있을 때) */
  lineNumbers?: boolean;
}

/** 모든 문제 유형이 공유하는 필드. 유형별 payload는 lib/qtypes/{type}.ts가 이 위에 더한다. */
export interface BaseQ<T extends string = string> {
  /** `{subject}-{chapter}-{topicSlug}-{nnn}` (생성기 문제는 `{subject}-{chapter}-gen-{name}-{seed}`) */
  id: string;
  subject: SubjectId;
  /** 과목 내 챕터 id */
  chapter: string;
  /** 세부 주제 (필터용) */
  topic: string;
  type: T;
  /** ⭐ 시험 출제 포인트 */
  exam: boolean;
  /** exam이 true면 필수, false면 없어야 한다 */
  examBasis?: ExamBasis;
  difficulty: 1 | 2 | 3;
  /** 'Ch08 p.48'(OS) / 'Ch02 s.38'(데이터 통신) */
  slideRef: string;
  /** 굵게(**…**)·인라인 코드(`…`)만 허용 */
  prompt: string;
  /** (1) 정답 근거 (2) 오답이 틀린 이유 */
  explanation: string;
  /** 핵심 개념 한 줄 요약 */
  summary?: string;
  /** 지문 아래에 보여 줄 코드(여러 줄·들여쓰기 그대로). 데이터과학 "실행 결과 고르기" 등 — Sprint 12 */
  code?: QuestionCode;
  generator?: GeneratorRef;
  /** 데이터과학 작성 시 검증 방식(Sprint 14 — lib/verify/). 다른 과목은 쓰지 않는다 */
  verify?: VerifySpec;
}

/**
 * 작성 시 검증(데이터과학, Sprint 14): 코드 정답은 사람이 쓰지 않고 실행 결과로 검증한다.
 * - `run`: Node에서 Pyodide·sql.js로 실행해 검사. `check`는 코드가 딸린 mcq·multi·blank의 검사 종류
 * - `skip`: 실행 검증 제외 — 셀레니움·Colab 명령·MySQL 서버 전용 문법처럼 실행할 수 없는 코드. 이유 필수
 * 코드가 없는 문항은 `verify`를 두지 않는다(검증 방식 "개념"). `code-write`는 자기 python·sql 설정으로 항상 실행한다.
 */
export type VerifySpec =
  | {
      mode: "run";
      python?: { packages?: ("numpy" | "pandas")[]; setup?: string; checks?: string[] };
      sql?: { setup: "firstDB"; mode: "select" | "tables"; tables?: string[]; orderMatters?: boolean };
      check?: VerifyCheck;
    }
  | { mode: "skip"; reason: string };

export type VerifyCheck =
  /** 코드 출력 고르기: mcq는 정답 보기 = 실제 출력·오답 보기 ≠ 출력, multi는 정답 보기만 출력 줄, blank는 첫 정답 = 출력 줄.
   *  `lineSep`: 보기 한 줄에 여러 출력 줄을 적을 때 쓴 구분자(예: " → ") */
  | { kind: "output"; lineSep?: string }
  /** 오류 위치·종류 문제: 실제로 이 오류가 나야 한다(줄 번호를 적으면 줄까지) */
  | { kind: "error"; errorType: string; line?: number };

export interface GradeResult<D = unknown> {
  /** score === 1 */
  correct: boolean;
  /** 0..1 부분점수 */
  score: number;
  /** 유형별 칸/항목별 정오 — 비교 UI가 사용 */
  detail: D;
}

/** 문제 유형 하나의 순수 로직(채점·검증). React를 import하지 않는다. */
export interface QTypeCore<Q extends BaseQ, A, D = unknown> {
  type: Q["type"];
  /** 뱃지/필터 이름: '객관식', '표 채우기' */
  label: string;
  emptyAnswer(q: Q): A;
  /** 제출 버튼 활성화 조건 */
  isComplete(q: Q, a: A): boolean;
  grade(q: Q, a: A): GradeResult<D>;
  /** 데이터 오류 메시지 (빈 배열 = 정상). 무결성 테스트가 호출 */
  validate(q: Q): string[];
  /** 숫자키(1~5) 단축키 대상 개수 — 선택형만 */
  choiceCount?(q: Q): number;
  /** 숫자키 i(0부터)를 눌렀을 때의 새 답 — choiceCount가 있으면 함께 정의 */
  applyChoice?(q: Q, a: A, index: number): A;
}

export const QUESTION_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** 생성기가 아닌 문제의 id 뒷부분: `{topicSlug}-{nnn}` */
const STATIC_REST = /^[a-z0-9]+(-[a-z0-9]+)*-\d{3}$/;

/** 유형과 무관한 공통 필드 검사. 과목·챕터 존재 여부는 레지스트리가 필요하므로 무결성 테스트가 따로 본다. */
export function validateBase(q: BaseQ): string[] {
  const errors: string[] = [];
  const prefix = `${q.subject}-${q.chapter}-`;
  if (!QUESTION_ID.test(q.id)) errors.push(`id 형식 오류: ${q.id}`);
  if (!q.id.startsWith(prefix)) errors.push(`id가 '${prefix}'로 시작하지 않음`);
  const rest = q.id.slice(prefix.length);
  if (q.generator) {
    const expected = `gen-${q.generator.name}-${q.generator.seed}`;
    if (rest !== expected) errors.push(`생성기 문제 id는 '${prefix}${expected}'여야 함`);
    if (!Number.isInteger(q.generator.seed) || q.generator.seed < 0) {
      errors.push("generator.seed는 0 이상의 정수");
    }
  } else if (!STATIC_REST.test(rest)) {
    errors.push(`id 끝은 '{topicSlug}-{nnn}'(3자리 번호)이어야 함: ${q.id}`);
  }
  if (q.exam && !q.examBasis) errors.push("exam이 true면 examBasis 필수");
  if (!q.exam && q.examBasis) errors.push("exam이 false인데 examBasis가 있음");
  if (![1, 2, 3].includes(q.difficulty)) errors.push("difficulty는 1|2|3");
  for (const key of ["topic", "slideRef", "prompt", "explanation"] as const) {
    if (!q[key]?.trim()) errors.push(`${key}가 비어 있음`);
  }
  if (q.code) {
    if (q.code.language !== "python" && q.code.language !== "sql") errors.push("code.language는 python|sql");
    if (!q.code.source.trim()) errors.push("code.source가 비어 있음");
    if (/[‘’“”]/.test(q.code.source)) errors.push("code.source에 굽은 따옴표가 있음");
  }
  return errors;
}

export function result<D>(score: number, detail: D): GradeResult<D> {
  const s = Math.max(0, Math.min(1, score));
  return { correct: s === 1, score: s, detail };
}

/** 문자열 배열 중복 검사 */
export function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) (seen.has(v) ? dup : seen).add(v);
  return [...dup];
}

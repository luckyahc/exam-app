import type { SubjectId } from "@/data/subjects/registry";

/** ⭐ 근거: handwritten = 교수님 필기(OS), printed-emphasis = 슬라이드에 인쇄된 강조(데이터 통신),
 *  exam-hint = 교수님 공식 시험 힌트의 범위(OS, docs/os-exam-hint.md). 필기 근거가 있는 문항은 handwritten을 유지하고 hintIds만 붙는다. */
export type ExamBasis = "handwritten" | "printed-emphasis" | "exam-hint";

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
  /** 시험 힌트 세부 항목(예: ["3-4"], data/subjects/os/hints.ts). 있으면 exam: true */
  hintIds?: string[];
  /** 지문 아래에 보여 줄 코드(여러 줄·들여쓰기 그대로). 데이터과학 "실행 결과 고르기" 등 — Sprint 12 */
  code?: QuestionCode;
  generator?: GeneratorRef;
  /** 데이터과학 작성 시 검증 방식(Sprint 14 — lib/verify/). 다른 과목은 쓰지 않는다 */
  verify?: VerifySpec;
  /**
   * 실행 검증이 없는 SQL 문항(개념·실행 제외)이 특정 테이블의 데이터를 알아야 풀 때, 지문 아래 "사용 테이블"로 보여 줄
   * 준비 스크립트(lib/qtypes/dsSchemas.ts SQL_SETUPS 이름)와 테이블. 표 내용은 scripts/build-sql-tables.mjs가 미리 만든다
   */
  showTables?: { setup: "firstDB" | "studentCourse"; tables: string[] };
  /**
   * 문제 분류(Sprint 18, docs/jokbo-plan.md). 없으면 일반 문항, "jokbo"면 족보에서 만든 문항 — jokbo 필수.
   * 계획 문서의 `source: "jokbo"`에 해당한다 — `source`는 코드 빈칸(code-blank)의 코드 본문 필드라 이름을 `origin`으로 했다
   */
  origin?: "jokbo";
  jokbo?: JokboInfo;
  /** 족보 유형을 본뜬 생성 문항(origin 없음)이 바탕으로 삼은 족보 문항 id(2026-10-16, docs/jokbo/algorithm/pattern-analysis.md) */
  basedOn?: string[];
  /**
   * 강의자료 예제를 원본 그대로 옮긴 문항의 출처(2026-10-16, docs/verification/data-comm-examples.md): 강의·PDF 쪽·예제 번호.
   * 계획 문서의 `source: { lecture, page, label }`에 해당한다 — `source`는 코드 빈칸의 코드 본문 필드라 이름을 `sourceRef`로 했다
   */
  sourceRef?: { lecture: string; page: number; label: string };
  /** 지문 아래 그림(족보 원본 스캔에서 자른 그래프 등, Sprint 21). 표·배열·코드는 그림 대신 글자로 옮긴다 */
  figure?: QuestionFigure;
}

/** `public/jokbo/<과목>/<문항id>.png` — 가로 1200px 이하·300KB 이하(data/subjects/figures.test.ts), 다크 모드에서도 흰 카드 위에 보인다 */
export interface QuestionFigure {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** 족보에 한 번 나온 기록. term: 연도/학기(있으면, 예 "2023 중간") */
export interface JokboOccurrence {
  file: string;
  /** 원문 문항 번호. 번호가 없으면 "번호 미표기" */
  number: string;
  term?: string;
}

/** 족보 문항 정보 — 같은 문제는 occurrences에 모으고, 비슷하지만 다른 문제는 variantGroup으로 묶는다 */
export interface JokboInfo {
  occurrences: JokboOccurrence[];
  /** 서술형 원문을 허용 유형으로 바꿨을 때 원문 보존 */
  original?: string;
  /** `{subject}-vg-{slug}` */
  variantGroup?: string;
  /** jokbo = 족보 해설을 바탕으로 씀, generated = 직접 생성(OS는 슬라이드 근거) */
  explanationSource: "jokbo" | "generated";
}

const KEBAB = "[a-z0-9]+(?:-[a-z0-9]+)*";

/** 족보 필드 검사: 족보 문항 id `{subject}-{chapter}-jokbo-NNN`, occurrences 1개 이상, explanationSource 필수, variantGroup 형식 */
export function validateJokbo(q: BaseQ): string[] {
  const errors: string[] = [];
  const jokboId = new RegExp(`^${q.subject}-${q.chapter}-jokbo-\\d{3}$`).test(q.id);
  if (q.origin !== undefined && q.origin !== "jokbo") errors.push(`origin은 "jokbo"만 허용: ${String(q.origin)}`);
  if (q.origin === "jokbo") {
    if (!jokboId) errors.push(`족보 문항 id는 '${q.subject}-${q.chapter}-jokbo-NNN'이어야 함: ${q.id}`);
    if (!q.jokbo) errors.push("origin이 jokbo면 jokbo 필드 필수");
  } else {
    if (q.jokbo) errors.push("jokbo 필드가 있으면 origin: \"jokbo\" 필수");
    if (q.id.startsWith(`${q.subject}-${q.chapter}-jokbo-`)) errors.push("'-jokbo-' id는 족보 문항만 쓴다");
  }
  if (q.basedOn !== undefined) {
    if (q.origin === "jokbo") errors.push("basedOn은 족보 문항이 아닌 생성 문항만 쓴다");
    if (!Array.isArray(q.basedOn) || q.basedOn.length === 0) errors.push("basedOn은 족보 문항 id 1개 이상");
    else if (new Set(q.basedOn).size !== q.basedOn.length) errors.push("basedOn에 같은 id가 두 번 있음");
    for (const id of q.basedOn ?? [])
      if (!new RegExp(`^${q.subject}-[a-z0-9]+-jokbo-\\d{3}$`).test(id)) errors.push(`basedOn은 '${q.subject}-{chapter}-jokbo-NNN': ${id}`);
  }
  if (q.sourceRef !== undefined) {
    const r = q.sourceRef;
    if (!r.lecture?.trim() || !r.label?.trim()) errors.push("sourceRef.lecture·label이 비어 있음");
    if (!Number.isInteger(r.page) || r.page < 1) errors.push("sourceRef.page는 1 이상의 정수");
  }
  const j = q.jokbo;
  if (!j) return errors;
  if (!Array.isArray(j.occurrences) || j.occurrences.length === 0) errors.push("jokbo.occurrences는 1개 이상");
  for (const o of j.occurrences ?? []) {
    if (!o.file?.trim() || !o.number?.trim()) errors.push("jokbo.occurrences의 file·number가 비어 있음");
    if (o.term !== undefined && !o.term.trim()) errors.push("jokbo.occurrences의 term이 빈 문자열");
  }
  if (j.explanationSource !== "jokbo" && j.explanationSource !== "generated") errors.push("jokbo.explanationSource는 jokbo|generated 필수");
  if (j.variantGroup !== undefined && !new RegExp(`^${q.subject}-vg-${KEBAB}$`).test(j.variantGroup))
    errors.push(`jokbo.variantGroup 형식은 '${q.subject}-vg-{slug}': ${j.variantGroup}`);
  if (j.original !== undefined && !j.original.trim()) errors.push("jokbo.original이 빈 문자열");
  return errors;
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
      /** setup: lib/qtypes/dsSchemas.ts SQL_SETUPS 이름. compareColumns: 별칭(AS)을 묻는 빈칸처럼 열 이름까지 비교 */
      sql?: { setup: "firstDB" | "studentCourse" | "empty"; mode: "select" | "tables"; tables?: string[]; orderMatters?: boolean; compareColumns?: boolean };
      check?: VerifyCheck;
    }
  /**
   * `local: "matplotlib"`(2026-10-17, Lec7): 앱 실행 엔진(Pyodide)에 맷플롯립이 없어 앱·verify:ds 엔진으로는 실행하지 않고,
   * 로컬 CPython(Agg 백엔드)으로 그래프 객체·통계를 검사한다 — scripts/verify-matplotlib.py, lib/verify/matplotlib.test.ts.
   * 이 검사가 결과를 확인하므로 실행 결과를 묻는 문제로 낼 수 있다
   */
  | { mode: "skip"; reason: string; local?: "matplotlib" };

export type VerifyCheck =
  /** 코드 출력 고르기: mcq는 정답 보기 = 실제 출력·오답 보기 ≠ 출력, multi는 정답 보기만 출력 줄, blank는 첫 정답 = 출력 줄.
   *  `lineSep`: 보기 한 줄에 여러 출력 줄을 적을 때 쓴 구분자(예: " → ").
   *  SQL(mcq만, Sprint 16): 보기 = 결과 표의 행을 lineSep(기본 " / ")으로, 한 행의 값을 ", "로 이은 글자 — 행 순서는 orderMatters일 때만 본다 */
  | {
      kind: "output";
      lineSep?: string;
      /** Colab 코드 셀처럼 마지막 줄 식의 값을 화면에 보여 주는 코드(예: Lec1 s.20 `seconds_in_a_day`) — 검증 때 마지막 줄을 print(repr(…))로 바꿔 실행 */
      cell?: true;
    }
  /** 오류 위치·종류 문제: 실제로 이 오류가 나야 한다(줄 번호를 적으면 줄까지) */
  | { kind: "error"; errorType: string; line?: number };

export interface GradeResult<D = unknown> {
  /** score === 1 */
  correct: boolean;
  /** 0..1 부분점수 */
  score: number;
  /** 유형별 칸/항목별 정오 — 비교 UI가 사용 */
  detail: D;
  /** 자기 채점(서술형 essay): 정답/오답이 없다 — 기록은 "풀었음"만, 정답률·오답노트·약점 통계에서 뺀다 */
  selfCheck?: true;
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
  if (q.hintIds && (!q.hintIds.length || !q.exam)) errors.push("hintIds가 있으면 비어 있지 않고 exam: true여야 함");
  if (q.examBasis === "exam-hint" && !q.hintIds?.length) errors.push("examBasis exam-hint는 hintIds 필수");
  if (![1, 2, 3].includes(q.difficulty)) errors.push("difficulty는 1|2|3");
  for (const key of ["topic", "slideRef", "prompt", "explanation"] as const) {
    if (!q[key]?.trim()) errors.push(`${key}가 비어 있음`);
  }
  if (q.code) {
    if (q.code.language !== "python" && q.code.language !== "sql") errors.push("code.language는 python|sql");
    if (!q.code.source.trim()) errors.push("code.source가 비어 있음");
    if (/[‘’“”]/.test(q.code.source)) errors.push("code.source에 굽은 따옴표가 있음");
  }
  errors.push(...validateJokbo(q));
  if (q.figure) {
    if (q.figure.src !== `/jokbo/${q.subject}/${q.id}.png`) errors.push(`figure.src는 '/jokbo/${q.subject}/${q.id}.png'`);
    if (!q.figure.alt?.trim()) errors.push("figure.alt(그림 설명) 필수");
    if (!(q.figure.width > 0 && q.figure.width <= 1200 && q.figure.height > 0)) errors.push("figure 크기: 가로 1~1200px");
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

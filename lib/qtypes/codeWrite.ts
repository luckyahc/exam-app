import { type BaseQ, type QTypeCore, result } from "./base";
import { CODE_LANGS, CURLY_QUOTE, type CodeLang } from "./_shared/codeTokens";
import { SQL_SETUPS, type SqlSetupName } from "./dsSchemas";

/**
 * 전체 작성형(데이터과학, Sprint 13). 사용자가 코드를 직접 써서 **실행 결과로 0/1 채점**한다.
 * - Python: 모범 답안과 사용자 코드를 같은 엔진(Pyodide)에서 같은 준비 코드로 실행해 **표준 출력**을 비교
 *   (줄 끝 공백·마지막 줄바꿈만 무시) + `checks`(변수·함수 값 검사식)가 모두 참이어야 정답.
 * - SQL: 같은 준비 스크립트 위에서 실행해 SELECT는 결과 표를 **행 순서 무시**로 비교(`orderMatters`면 순서까지),
 *   `mode: "tables"`는 실행 후 테이블 상태를 비교.
 * 실행은 비동기(Web Worker)라 화면이 먼저 실행하고 결과를 답(`run`)에 담는다. `grade`는 담긴 결과만 읽는다(동기).
 */
export type PyPackage = "numpy" | "pandas";
export const PY_PACKAGES: readonly PyPackage[] = ["numpy", "pandas"];

export interface CodeWriteQ extends BaseQ<"code-write"> {
  language: CodeLang;
  /** 입력칸 처음 내용(빈 문자열 가능) */
  starter: string;
  /** 모범 답안 — 슬라이드 코드 기반. 기대 결과는 이 코드를 실행해서 얻는다 */
  solution: string;
  python?: {
    /** 함께 불러올 패키지(넘파이는 필요할 때만, 판다스는 "실행 엔진 불러오기" 버튼) */
    packages?: PyPackage[];
    /** 사용자 코드 앞에 같은 이름 공간에서 실행(보이지 않는 준비 — 파일 만들기 등) */
    setup?: string;
    /** 사용자 코드 뒤에 참이어야 하는 식(변수·함수 값 검사) */
    checks?: string[];
  };
  sql?: {
    setup: SqlSetupName;
    mode: "select" | "tables";
    /** mode: "tables"일 때 실행 후 비교할 테이블 */
    tables?: string[];
    /** 문제가 ORDER BY를 요구할 때만 true */
    orderMatters?: boolean;
    /** 별칭(AS)을 묻는 문제만 열 이름까지 비교 */
    compareColumns?: boolean;
  };
}

/** 화면에 보일 실행 결과 한쪽(사용자 또는 기대) */
export interface RunSide {
  stdout?: string;
  table?: { columns: string[]; rows: unknown[][] } | null;
  tables?: Record<string, { columns: string[]; rows: unknown[][] } | null>;
  error?: string | null;
  truncated?: boolean;
}

export interface CodeWriteRun {
  /** 실행한 입력칸 내용(바꾸기 전 원문) — 지금 입력칸과 같아야 제출할 수 있다 */
  input: string;
  status: "done" | "timeout" | "unavailable";
  passed: boolean;
  /** 굽은 따옴표를 곧은 따옴표로 바꿔 실행했는가(결정 13) */
  quotesFixed: boolean;
  mine?: RunSide;
  expected?: RunSide;
  /** 틀린 이유(사람이 읽는 문장) */
  reason?: string;
  /** 사용자 코드 실행 시간(ms) */
  ms?: number;
}
export type CodeWriteA = { source: string; run: CodeWriteRun | null };
export type CodeWriteDetail = CodeWriteRun | null;

/** 지금 입력칸 내용으로 실행한 결과가 있고, 엔진이 결과를 냈는가(채점할 수 없는 상태면 제출 불가 → 기록에 남지 않음) */
export function runIsCurrent(a: CodeWriteA): boolean {
  return a.run !== null && a.run.input === a.source && a.run.status !== "unavailable";
}

export const codeWriteCore: QTypeCore<CodeWriteQ, CodeWriteA, CodeWriteDetail> = {
  type: "code-write",
  label: "코드 작성",
  emptyAnswer: (q) => ({ source: q.starter, run: null }),
  isComplete: (_q, a) => runIsCurrent(a),
  grade: (_q, a) => result(runIsCurrent(a) && a.run!.passed ? 1 : 0, a.run),
  validate(q) {
    const e: string[] = [];
    if (!CODE_LANGS.includes(q.language)) e.push(`language는 ${CODE_LANGS.join("|")}`);
    if (!q.solution.trim()) e.push("solution이 비어 있음");
    for (const [k, v] of [["solution", q.solution], ["starter", q.starter]] as const) if (CURLY_QUOTE.test(v)) e.push(`${k}에 굽은 따옴표가 있음`);
    if (q.language === "python") {
      if (!q.python) e.push("python 설정이 없음");
      if (q.sql) e.push("python 문제에 sql 설정");
      for (const p of q.python?.packages ?? []) if (!PY_PACKAGES.includes(p)) e.push(`알 수 없는 패키지 ${p}`);
      if (q.python?.packages?.includes("pandas") && !q.python.packages.includes("numpy")) e.push("pandas는 numpy와 함께");
    } else {
      if (!q.sql) e.push("sql 설정이 없음");
      if (q.python) e.push("sql 문제에 python 설정");
      if (q.sql && !(q.sql.setup in SQL_SETUPS)) e.push(`알 수 없는 준비 스크립트 ${q.sql.setup}`);
      if (q.sql?.mode === "tables" && !q.sql.tables?.length) e.push("mode: tables에는 tables가 필요");
      if (q.sql && q.sql.mode !== "select" && q.sql.mode !== "tables") e.push("mode는 select|tables");
    }
    return e;
  },
};

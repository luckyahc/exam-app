import FUNCTIONS from "@/data/subjects/data-science/functions.json";
import { normalizeText } from "@/lib/qtypes/_shared/textMatch";

/**
 * 데이터과학 장별 함수 정리표(2026-10-16). 데이터: data/subjects/data-science/functions.json — 강의자료(Lec1~6)에 나오는 함수·메서드·SQL 구문만.
 * exampleOutput은 손으로 쓰지 않고 검증 엔진(Pyodide·sql.js)으로 실행한 결과다(lib/verify/dsFunctions.test.ts, 다시 만들기: node scripts/ds-functions.mjs).
 */
export interface DsFunction {
  id: string;
  /** 처음 나온 장 */
  lecture: string;
  category: string;
  name: string;
  lang: "python" | "sql";
  signature: string;
  description: string;
  usage: string;
  example: string;
  /** python: 예시 앞에 실행하는 준비 코드(파일 만들기·df 만들기) / sql: 준비 스크립트 이름(lib/qtypes/dsSchemas.ts SQL_SETUPS) */
  setup?: string;
  /** 검증 엔진에서 실행할 수 없는 이유(셀레니움·MySQL 전용·Colab 전용) — 있으면 exampleOutput이 null */
  noRun?: string;
  exampleOutput: string | null;
  pitfall?: string;
  /** 관련 문항 찾기 정규식(기본: 이름에서 만든 호출 모양) */
  match?: string;
  relatedQuestionIds: string[];
  /** 처음 나온 장 뒤에 다시 나오는 장 */
  alsoIn?: string[];
}

export const DS_FUNCTIONS = FUNCTIONS as DsFunction[];
/** 함수 정리 페이지(/s/[subject]/functions)가 있는 과목 */
export const FUNCTION_SUBJECTS = ["data-science"] as const;
export const DS_LECTURES = ["lec1", "lec2", "lec3", "lec4", "lec5", "lec6"] as const;
/** 관련 문항은 장 순서대로 앞에서 이만큼만 적는다(print처럼 거의 모든 문항에 나오는 함수) */
export const RELATED_MAX = 20;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const last = (name: string) => name.split(".").pop()!;
const MODULES = ["np", "pd", "csv", "openpyxl", "sys", "webdriver", "files"];

/**
 * 문항 본문(지문·코드·보기·빈칸)에서 이 함수가 쓰였는지 찾는 정규식.
 * - SQL: 대문자 구문(공백은 여러 칸 허용)
 * - 내장 함수(print·len…): `이름(`·`이름( )` 호출 모양
 * - 모듈 함수·메서드: 마지막 이름을 낱말로(빈칸 정답 "iloc"·보기 "isin( )은 …"도 찾는다). 같은 장에 마지막 이름이 같은 항목이 있으면
 *   (np.sort·a.sort) 모듈 함수는 전체 이름, 메서드는 `.이름(`으로 좁힌다
 */
export function questionPattern(f: Pick<DsFunction, "name" | "lang" | "match" | "lecture">, all: readonly Pick<DsFunction, "name" | "lecture">[] = DS_FUNCTIONS): RegExp {
  if (f.match) return new RegExp(f.match);
  if (f.lang === "sql") return new RegExp(`(^|[^A-Za-z_])${esc(f.name.replace(/ ….*$/, "")).replace(/ /g, "\\s+")}([^A-Za-z_]|$)`);
  const parts = f.name.split(".");
  const name = last(f.name);
  if (parts.length === 1) return new RegExp(`(^|[^A-Za-z0-9_.])${esc(name)}\\s*\\(`);
  const clash = all.some((o) => o !== f && o.lecture === f.lecture && o.name !== f.name && last(o.name) === name);
  if (!clash) return new RegExp(`(^|[^A-Za-z0-9_])${esc(name)}(?![A-Za-z0-9_])`);
  return MODULES.includes(parts[0]) ? new RegExp(`${esc(f.name)}\\s*\\(`) : new RegExp(`\\.${esc(name)}\\s*\\(`);
}

/** 화면 필터: 장 탭 + 카테고리 + 이름 검색(공백·대소문자 무시) */
export function filterFunctions(list: readonly DsFunction[], opts: { lecture?: string; category?: string; query?: string }): DsFunction[] {
  const q = normalizeText(opts.query ?? "");
  return list.filter(
    (f) =>
      (!opts.lecture || f.lecture === opts.lecture || !!f.alsoIn?.includes(opts.lecture)) &&
      (!opts.category || f.category === opts.category) &&
      (!q || normalizeText(f.name).includes(q) || normalizeText(f.signature).includes(q)),
  );
}

export const categoriesOf = (list: readonly DsFunction[]) => [...new Set(list.map((f) => f.category))];

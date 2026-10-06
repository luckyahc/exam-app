/**
 * 코드 빈칸 채점용 토큰화(데이터과학, Sprint 12 — docs/ds-question-types.md §2-2).
 * 실행했을 때 결과가 같은 차이만 무시한다: 토큰 사이 공백, 파이썬의 '…' ↔ "…", SQL 키워드·함수 이름의 대소문자.
 * 토큰을 붙이거나 나누는 차이(`not in` ↔ `notin`), 파이썬 대소문자, 빠진 콜론·괄호는 그대로 다르게 본다.
 */

export type CodeLang = "python" | "sql";
export const CODE_LANGS: readonly CodeLang[] = ["python", "sql"];
export const CODE_LANG_LABEL: Record<CodeLang, string> = { python: "Python", sql: "SQL" };

/** 굽은 따옴표(‘ ’ ‚ ‛ “ ” „ ‟)를 곧은 따옴표로. 바꾼 것이 있으면 changed = true (결정 13) */
export function straightenQuotes(s: string): { text: string; changed: boolean } {
  const text = s.replace(/[‘’‚‛]/g, "'").replace(/[“”„‟]/g, '"');
  return { text, changed: text !== s };
}

export const CURLY_QUOTE = /[‘’‚‛“”„‟]/;

// SQL 키워드·자주 쓰는 함수 이름(대소문자 구별 없음). 강의 5의 문법 + 일반 키워드
const SQL_KEYWORDS = new Set(
  (
    "SELECT FROM WHERE AND OR NOT IN IS NULL AS DISTINCT LIKE BETWEEN ORDER BY GROUP HAVING ASC DESC LIMIT OFFSET " +
    "INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE DATABASE DROP ALTER ADD COLUMN IF EXISTS USE " +
    "PRIMARY FOREIGN KEY REFERENCES UNIQUE DEFAULT CHECK CONSTRAINT INDEX " +
    "INNER LEFT RIGHT FULL OUTER JOIN ON CROSS UNION ALL ANY SOME CASE WHEN THEN ELSE END " +
    "CHAR VARCHAR TEXT INT INTEGER FLOAT DOUBLE DECIMAL DATE DATETIME TIME YEAR BOOLEAN " +
    "COUNT SUM AVG MIN MAX VERSION TRUE FALSE"
  ).split(" "),
);

const PY_OPS = ["**=", "//=", ">>=", "<<=", "...", "->", ":=", "==", "!=", "<=", ">=", "//", "**", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>"];
const SQL_OPS = ["<>", "!=", "<=", ">=", "||"];
const IDENT_START = /[\p{L}_]/u;
const IDENT_PART = /[\p{L}\p{N}_]/u;

/**
 * 토큰 배열. 닫히지 않은 문자열처럼 토큰으로 나눌 수 없으면 null.
 * 문자열 토큰은 `STR:접두사:내용`(따옴표 종류는 지움), 키워드는 `KW:대문자`, 그 밖은 글자 그대로.
 */
export function tokenize(src: string, lang: CodeLang): string[] | null {
  const out: string[] = [];
  const ops = lang === "python" ? PY_OPS : SQL_OPS;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    // 주석: 파이썬 #, SQL -- (MySQL #도) — 줄 끝까지 한 토큰(내용까지 비교)
    if ((lang === "python" && c === "#") || (lang === "sql" && (c === "#" || src.startsWith("--", i)))) {
      const end = src.indexOf("\n", i);
      const body = src.slice(i, end < 0 ? src.length : end).trim();
      out.push(`COMMENT:${body.replace(/^(#|--)\s*/, "")}`);
      i = end < 0 ? src.length : end;
      continue;
    }
    // 문자열(파이썬은 r/b/f/u 접두사 허용)
    let prefix = "";
    if (lang === "python") {
      const m = /^[rRbBfFuU]{1,2}(?=['"])/.exec(src.slice(i));
      if (m) prefix = m[0].toLowerCase();
    }
    const q = src[i + prefix.length];
    if (q === "'" || q === '"' || (lang === "sql" && q === "`")) {
      const start = i + prefix.length;
      const triple = lang === "python" && src.startsWith(q.repeat(3), start);
      const delim = triple ? q.repeat(3) : q;
      let j = start + delim.length;
      let body = "";
      let closed = false;
      while (j < src.length) {
        if (src.startsWith(delim, j)) {
          // SQL은 따옴표 두 번('')이 따옴표 한 글자
          if (lang === "sql" && !triple && src[j + 1] === q) {
            body += q;
            j += 2;
            continue;
          }
          closed = true;
          j += delim.length;
          break;
        }
        if (src[j] === "\\" && lang === "python" && j + 1 < src.length) {
          body += src.slice(j, j + 2);
          j += 2;
          continue;
        }
        if (src[j] === "\n" && !triple) break;
        body += src[j];
        j++;
      }
      if (!closed) return null;
      out.push(q === "`" ? body : `STR:${prefix}:${body}`);
      i = j;
      continue;
    }
    if (/\d/.test(c) || (c === "." && /\d/.test(src[i + 1] ?? ""))) {
      const m = /^(\d[\d_]*)?(\.\d[\d_]*|\.)?([eE][+-]?\d+)?[jJ]?/.exec(src.slice(i))!;
      out.push(m[0]);
      i += m[0].length;
      continue;
    }
    if (IDENT_START.test(c)) {
      let j = i + 1;
      while (j < src.length && IDENT_PART.test(src[j])) j++;
      const word = src.slice(i, j);
      out.push(lang === "sql" && SQL_KEYWORDS.has(word.toUpperCase()) ? `KW:${word.toUpperCase()}` : word);
      i = j;
      continue;
    }
    const op = ops.find((o) => src.startsWith(o, i));
    out.push(op ?? c);
    i += op ? op.length : 1;
  }
  return out;
}

/** 두 코드 조각이 토큰 단위로 같은가(둘 다 토큰화돼야 함) */
export function sameTokens(a: string, b: string, lang: CodeLang): boolean {
  const ta = tokenize(a, lang);
  const tb = tokenize(b, lang);
  return ta !== null && tb !== null && ta.length === tb.length && ta.every((t, i) => t === tb[i]);
}

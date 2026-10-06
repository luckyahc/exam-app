/**
 * 코드 빈칸 허용 답안 후보 만들기(Sprint 14). "실행해서 같은 결과가 나오는 다른 표현"을 자동으로 모두 찾을 수는 없으므로
 * (a) 아래 공통 변환 규칙으로 **첫 번째 정답(슬라이드 표기)**에서 후보를 만들고 (b) 작성자가 `candidates`로 더한다.
 * 후보는 실행해서(run.ts) 같은 결과면 accept, 다르면 wrong에 있어야 한다. 토큰 비교로 이미 같은 후보는 기록하지 않는다.
 */
import type { CodeLang } from "@/lib/qtypes/_shared/codeTokens";

export interface CandidateRule {
  id: string;
  name: string;
  langs: CodeLang[];
  /** 바꿀 수 없으면 null */
  apply(text: string): string | null;
}

const AUG = String.raw`(\*\*|//|[+\-*/%])`;
// 한 덩어리 피연산자(이름·숫자·문자열·첨자·호출). 이름에 한글을 쓰므로 \p{L}(u 플래그)
const SIMPLE = String.raw`[\p{L}\p{N}_.\[\]'"]+(?:\([^()]*\))?`;
const IDENT = String.raw`[\p{L}_][\p{L}\p{N}_]*`;
const re = (src: string) => new RegExp(src, "u");
/** 바깥 괄호 하나가 식 전체를 감싸는가 */
function wrapped(t: string): boolean {
  if (!t.startsWith("(") || !t.endsWith(")")) return false;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    depth += t[i] === "(" ? 1 : t[i] === ")" ? -1 : 0;
    if (depth === 0 && i < t.length - 1) return false;
  }
  return true;
}
/** 문자열 밖만 바꾼다('…'·"…" 안은 그대로) */
const outsideStrings = (t: string, f: (s: string) => string) =>
  t
    .split(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/)
    .map((part, i) => (i % 2 ? part : f(part)))
    .join("");
const MIRROR: Record<string, string> = { "==": "==", "!=": "!=", "<>": "<>", "=": "=", "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
const hasTopLevelOp = (s: string) => /\s[+\-*/%]\s|\*\*|\/\//.test(s);

export const CANDIDATE_RULES: readonly CandidateRule[] = [
  {
    id: "aug-to-plain",
    name: "복합 대입 → 풀어 쓴 대입 (a += 1 → a = a + 1)",
    langs: ["python"],
    apply(t) {
      const m = t.match(re(String.raw`^(${IDENT}(?:\[[^\]]*\])?)\s*${AUG}=\s*(.+)$`));
      if (!m) return null;
      const rhs = hasTopLevelOp(m[3]) ? `(${m[3]})` : m[3];
      return `${m[1]} = ${m[1]} ${m[2]} ${rhs}`;
    },
  },
  {
    id: "plain-to-aug",
    name: "풀어 쓴 대입 → 복합 대입 (a = a + 1 → a += 1)",
    langs: ["python"],
    apply(t) {
      const m = t.match(re(String.raw`^(${IDENT})\s*=\s*\1\s*${AUG}\s*(.+)$`));
      return m ? `${m[1]} ${m[2]}= ${m[3]}` : null;
    },
  },
  {
    id: "int-bound",
    name: "정수 비교 경계 바꾸기 (i <= 9 → i < 10)",
    langs: ["python", "sql"],
    apply(t) {
      const m = t.match(/(?<![<>=!-])(<=|>=|<|>)(?![<>=])\s*(-?\d+)(?![\d.])/);
      if (!m || m.index === undefined) return null;
      const n = Number(m[2]);
      const rep = { "<=": `< ${n + 1}`, "<": `<= ${n - 1}`, ">=": `> ${n - 1}`, ">": `>= ${n + 1}` }[m[1]]!;
      return t.slice(0, m.index) + rep + t.slice(m.index + m[0].length);
    },
  },
  {
    id: "mirror",
    name: "비교 양변 바꾸기 (i <= 9 → 9 >= i)",
    langs: ["python", "sql"],
    apply(t) {
      const m = t.match(re(String.raw`^(${SIMPLE})\s*(==|!=|<>|<=|>=|<|>|=)\s*(${SIMPLE})$`));
      return m ? `${m[3]} ${MIRROR[m[2]]} ${m[1]}` : null;
    },
  },
  {
    id: "commute",
    name: "덧셈·곱셈 순서 바꾸기 (i + 1 → 1 + i, 대입의 오른쪽도)",
    langs: ["python"],
    apply(t) {
      const asg = t.match(re(String.raw`^(${IDENT}\s*=\s*)(?!=)(.+)$`));
      const [head, body] = asg ? [asg[1], asg[2]] : ["", t];
      const m = body.match(re(String.raw`^(${SIMPLE})\s*([+*])\s*(${SIMPLE})$`));
      return m ? `${head}${m[3]} ${m[2]} ${m[1]}` : null;
    },
  },
  {
    id: "paren",
    name: "식 전체를 괄호로 감싸기 (i <= 9 → (i <= 9))",
    langs: ["python", "sql"],
    apply(t) {
      if (re(String.raw`^${IDENT}\s*(\*\*|//|[+\-*/%])?=(?!=)`).test(t)) return null; // 대입문은 감쌀 수 없다
      if (wrapped(t)) return null; // 이미 바깥 괄호가 있음
      return /(==|!=|<>|<=|>=|<|>|\s[+\-*/%]\s)/.test(t) ? `(${t})` : null;
    },
  },
  {
    id: "unparen",
    name: "바깥 괄호 없애기 ((i <= 9) → i <= 9)",
    langs: ["python", "sql"],
    apply(t) {
      return wrapped(t) ? t.slice(1, -1).trim() || null : null;
    },
  },
  {
    id: "range-zero",
    name: "range 시작 0 생략·추가 (range(0, n) ↔ range(n))",
    langs: ["python"],
    apply(t) {
      const a = t.match(/^range\(\s*0\s*,\s*([^,()]+)\)$/);
      if (a) return `range(${a[1].trim()})`;
      const b = t.match(/^range\(\s*([^,()]+)\)$/);
      return b ? `range(0, ${b[1].trim()})` : null;
    },
  },
  {
    id: "neq-sql",
    name: "SQL 같지 않음 표기 (<> ↔ !=)",
    langs: ["sql"],
    apply(t) {
      if (t.includes("<>")) return t.replace("<>", "!=");
      return t.includes("!=") ? t.replace("!=", "<>") : null;
    },
  },
  {
    id: "quote-kind",
    name: "따옴표 종류 바꾸기 ('a' ↔ \"a\") — 토큰 비교로 이미 같음",
    langs: ["python"],
    apply(t) {
      if (!/['"]/.test(t)) return null;
      return t.replace(/['"]/g, (c) => (c === "'" ? '"' : "'"));
    },
  },
  {
    id: "spacing",
    name: "연산자 주변 공백 바꾸기 (i<=9 ↔ i <= 9) — 토큰 비교로 이미 같음",
    langs: ["python", "sql"],
    apply(t) {
      const tight = t.replace(/\s*(==|!=|<>|<=|>=|\+=|-=|\*=|\/=|[<>=+\-*/%,])\s*/g, "$1");
      return tight !== t ? tight : t.replace(/(==|!=|<=|>=|\+=|-=|[<>=+*/%])/g, " $1 ").replace(/\s+/g, " ").trim();
    },
  },
  {
    id: "sql-case",
    name: "SQL 키워드 대소문자 (GROUP BY ↔ group by) — 토큰 비교로 이미 같음",
    langs: ["sql"],
    apply(t) {
      const low = outsideStrings(t, (x) => x.toLowerCase());
      if (low !== t) return low;
      const up = outsideStrings(t, (x) => x.toUpperCase());
      return up !== t ? up : null;
    },
  },
];

export interface Candidate {
  text: string;
  /** 규칙 id 또는 "author"(작성자가 더한 후보) */
  source: string;
}

/** 첫 번째 정답에 규칙을 한 번씩 적용한 후보 + 작성자 후보(같은 글자는 한 번만, 첫 번째 정답 자신은 빼고) */
export function blankCandidates(first: string, lang: CodeLang, authored: readonly string[] = []): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set([first]);
  for (const r of CANDIDATE_RULES) {
    if (!r.langs.includes(lang)) continue;
    const t = r.apply(first);
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push({ text: t, source: r.id });
    }
  }
  for (const t of authored) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push({ text: t, source: "author" });
    }
  }
  return out;
}

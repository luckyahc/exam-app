/**
 * 데이터과학 작성 시 검증 — 실행하지 않고 보는 규칙(Sprint 14). 빠르므로 `npm test`의 최소 검증으로 늘 돈다.
 * 실행 검증은 run.ts.
 */
import { fillCodeBlanks } from "@/lib/qtypes/codeBlank";
import type { CodeLang } from "@/lib/qtypes/_shared/codeTokens";
import type { Question } from "@/lib/qtypes/registry";
import { DS_ERRATA, codeRefs } from "./errata";

export type VerifyMethod = "실행" | "실행 제외" | "개념";

/**
 * 앱 화면에 보이는 코드 줄(components/qtypes/CodeBlock.tsx와 같은 규칙: CRLF → LF, 마지막 줄바꿈 하나만 뺌, **빈 줄도 한 줄**).
 * 검증은 이 코드를 그대로 실행하므로 Python 오류 줄 번호 = 화면 줄 번호다(준비 코드 setup은 따로 실행돼 줄 번호에 들어가지 않는다).
 */
export function screenLines(source: string): string[] {
  return source.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
}

/**
 * 기준 실행 환경은 슬라이드(Colab, 64비트 CPython)다. Pyodide(wasm32)와 결과가 다를 수 있는 출력은 출력 문제로 내지 않는다.
 * 코드에서 감지: 넘파이 dtype·itemsize·nbytes, 정수 크기·플랫폼 정보(sys.maxsize·sys.platform·platform·os.name), 객체 주소(id)·크기(getsizeof)
 */
const PLATFORM_CODE = /\.(dtype|itemsize|nbytes)\b|\bsys\.(maxsize|platform|version)\b|\bplatform\.|\bos\.name\b|\bid\(|\bgetsizeof\(/;
/** 실행 출력에서 감지: Pyodide에서만 나오는 32비트 정수 표기, 메모리 주소 */
export const PLATFORM_OUTPUT = /\b(u?int32)\b|0x[0-9a-f]{6,}/i;

export function platformDependent(source: string): string | null {
  const m = source.match(PLATFORM_CODE);
  return m ? m[0] : null;
}

/** 문항에서 실행할 코드(코드 빈칸은 첫 번째 정답으로 채운 코드). 코드가 없으면 null */
export function questionCode(q: Question): { language: CodeLang; source: string } | null {
  if (q.type === "code-write") return { language: q.language, source: q.solution };
  if (q.type === "code-blank") return { language: q.language, source: fillCodeBlanks(q.source, q.blanks.map((b) => b.accept[0] ?? "")) };
  return q.code ? { language: q.code.language, source: q.code.source } : null;
}

export function verifyMethod(q: Question): VerifyMethod {
  if (q.type === "code-write") return "실행";
  if (q.verify?.mode === "skip") return "실행 제외";
  return q.verify?.mode === "run" ? "실행" : "개념";
}

/**
 * 실행할 수 없는 코드 감지 — 걸리면 `verify: { mode: "skip", reason }`이어야 한다.
 * 셀레니움·웹 접속, Colab 전용 명령(!pip, %cd, google.colab), MySQL 서버 전용 문법(데이터베이스 만들기·선택, SHOW, DESC 등)
 */
const UNRUNNABLE: { lang: CodeLang; re: RegExp; what: string }[] = [
  { lang: "python", re: /\b(selenium|webdriver)\b/, what: "셀레니움(브라우저 자동화)" },
  { lang: "python", re: /^\s*[!%]/m, what: "Colab·IPython 명령(! 또는 %)" },
  { lang: "python", re: /\bgoogle\.colab\b/, what: "Colab 전용 모듈(google.colab)" },
  { lang: "python", re: /\b(requests|urllib\.request|urlopen)\b/, what: "인터넷 접속" },
  { lang: "sql", re: /\b(CREATE\s+DATABASE|USE\s+\w+\s*;|SHOW\s+(DATABASES|TABLES)|DESC(RIBE)?\s+\w+\s*;|AUTO_INCREMENT|ENGINE\s*=)/i, what: "MySQL 서버 전용 문법" },
  { lang: "sql", re: /\bVALUES\s*\([^)]*\bDEFAULT\b/i, what: "MySQL 서버 전용 문법(VALUES 안의 DEFAULT)" },
  { lang: "sql", re: /\bVERSION\s*\(\s*\)/i, what: "MySQL 서버 전용 함수(VERSION)" },
];

export function unrunnableReason(code: { language: CodeLang; source: string }): string | null {
  const hit = UNRUNNABLE.find((u) => u.lang === code.language && u.re.test(code.source));
  return hit ? hit.what : null;
}

/** 실행하지 않고 보는 검증 규칙 위반 목록(빈 배열 = 정상) */
export function staticVerifyErrors(q: Question): string[] {
  const e: string[] = [];
  if (q.subject !== "data-science") {
    if (q.verify) e.push("verify는 데이터과학 문항만 쓴다");
    return e;
  }
  const code = questionCode(q);
  const v = q.verify;
  if (q.type === "code-write") {
    if (v) e.push("code-write는 verify를 두지 않는다(자기 python·sql 설정으로 항상 실행 — 실행 제외 불가)");
    if (q.language === "python" && q.expect?.stdout === undefined) e.push("code-write(Python)는 expect.stdout(슬라이드 실행결과) 필수");
    if (q.language === "sql" && q.sql?.mode === "select" && !q.expect?.rows) e.push("code-write(SQL select)는 expect.rows(슬라이드 결과 표) 필수");
  } else if (!code) {
    if (v) e.push("코드가 없는 문항(개념)에 verify가 있음");
  } else if (!v) {
    e.push("코드가 있는 문항은 verify 필수 — 실행(run) 또는 실행 제외(skip, 이유)");
  } else if (v.mode === "skip") {
    if (v.reason.trim().length < 5) e.push("실행 제외(skip)에는 이유를 적는다");
  } else {
    if (code.language === "sql" && !v.sql) e.push("SQL 코드 실행에는 verify.sql(스키마·mode) 필요");
    if (code.language === "python" && v.sql) e.push("Python 코드에 verify.sql");
    if (q.type === "code-blank" && v.check) e.push("code-blank는 check를 두지 않는다(허용 답안이 모두 같은 결과인지 본다)");
    if ((q.type === "mcq" || q.type === "multi" || q.type === "blank") && !v.check) e.push(`${q.type}에 코드가 있으면 verify.check(output|error) 필요`);
    // SQL은 결과 표 고르기(mcq, output)만 — 오류 검사는 sql.js와 MySQL의 오류 문구·종류가 달라 출제하지 않는다
    if (v.check && code.language === "sql" && !(v.check.kind === "output" && q.type === "mcq")) e.push("SQL은 mcq 결과 표 고르기(check output)만 지원");
    // 오류 줄 번호는 앱 화면의 줄 번호(빈 줄 포함) 기준 — 화면에 줄 번호가 보여야 하고, 그 줄이 실제로 있어야 한다
    if (v.check?.kind === "error" && v.check.line !== undefined) {
      if (!q.code?.lineNumbers) e.push("오류 줄을 묻는 문항은 code.lineNumbers: true(화면에 줄 번호 표시)");
      const lines = screenLines(code.source);
      if (v.check.line < 1 || v.check.line > lines.length || !lines[v.check.line - 1].trim()) e.push(`오류 줄 ${v.check.line}이 화면 코드(${lines.length}줄)의 빈 줄이거나 범위 밖`);
    }
    if (v.sql?.mode === "tables" && !v.sql.tables?.length) e.push("verify.sql mode: tables에는 tables 필요");
  }
  // 출력 문제(전체 작성형·출력 고르기)에 Pyodide·Colab 결과가 다를 수 있는 코드 금지
  const outputQuestion = q.type === "code-write" || (v?.mode === "run" && v.check?.kind === "output");
  if (code && outputQuestion && code.language === "python") {
    const hit = platformDependent(code.source);
    if (hit) e.push(`Pyodide와 슬라이드(Colab) 결과가 다를 수 있는 출력(${hit}) — 출력 문제로 내지 않는다`);
  }
  // 실행할 수 없는 코드는 실행 제외로만, 실행 제외 SQL(MySQL 전용)은 빈칸형·개념형으로만
  if (code) {
    const why = unrunnableReason(code);
    if (why && (q.type === "code-write" || v?.mode === "run")) e.push(`실행할 수 없는 코드(${why}) — verify: { mode: "skip", reason }로 표시`);
  }
  // 실행 결과를 확인할 수 없으므로 결과를 묻는 문제(출력 고르기)로 쓰지 않는다
  if (v?.mode === "skip" && q.type !== "code-blank" && /실행 결과|결과 표|출력/.test(q.prompt)) {
    e.push("실행 제외 코드는 빈칸형·개념형으로만(실행 결과를 묻는 문제 금지)");
  }
  // 슬라이드 오류 목록의 코드를 쓰면 해설에 "(보충)" + 다른 점
  const refs = codeRefs(`${q.prompt}\n${q.explanation}`);
  const material = [code?.source ?? "", ...("choices" in q ? q.choices : [])].join("\n");
  for (const er of DS_ERRATA.filter((x) => refs.includes(x.code) && (!x.when || x.when.test(material)))) {
    if (!q.explanation.includes("(보충)")) e.push(`[코드 ${er.code}]는 슬라이드와 실제 실행이 다르다(${er.note}) — 해설에 "(보충)" 필요`);
    else if (!er.keywords.some((k) => q.explanation.includes(k))) e.push(`[코드 ${er.code}] 해설 "(보충)"에 슬라이드와 다른 점(${er.keywords.join("·")} 중 하나)이 없음`);
  }
  return e;
}

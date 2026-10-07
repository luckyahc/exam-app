/**
 * 과목 공용 용어 사전 구조(OS부터 — data/subjects/os/glossary.ts). 과목 정의의 loadGlossary가 있으면 용어 정리 화면·용어 퀴즈가 생긴다.
 * - 정의는 슬라이드 표현에 가깝게 쓰고, 정답 용어가 정의 문장에 그대로 들어가지 않게 한다(용어 단답형의 지문이 되므로)
 * - 정의가 없는 용어(슬라이드에 이름만 등장)는 def 없이 두고 문제를 만들지 않는다
 * - 영어 표기·약자의 풀네임은 슬라이드에 있는 것만 적는다
 */

export interface GlossaryEntry {
  /** 사전 안에서 유일한 슬러그 */
  id: string;
  ko: string;
  en?: string;
  abbr?: string;
  /** 약자의 풀네임(슬라이드에 있을 때만) */
  abbrFull?: string;
  /** 처음 정의된 곳 기준. 없으면 이름만 등장(정의 없음) */
  def?: string;
  chapter: string;
  /** 처음 정의된 곳 */
  slideRef: string;
  /** 다른 챕터·쪽에 나오는 곳(참고 위치) */
  seeAlso?: string[];
  basis: "인쇄" | "교수님 필기";
  /** 같은 뜻의 다른 이름(예: 논리주소 = 가상주소) — 단답형 accept에 넣는다 */
  synonyms?: string[];
  /** 이 용어를 정의로 묻는 기존 blank 문항(있으면 새 문항을 만들지 않는다) */
  linkedQuestionIds?: string[];
  /** 시험 힌트 항목(OS) */
  hintIds?: string[];
  /** 같은 설명이 다른 용어에도 해당할 수 있어 함께 정답으로 인정한 이유 */
  alsoNote?: string;
}

const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];

/** 한국어·영어·약자·동의어와 대소문자·띄어쓰기·하이픈 변형(채점은 대소문자·공백을 이미 무시 — 하이픈만 따로) */
export function termAccept(e: Pick<GlossaryEntry, "ko" | "en" | "abbr" | "abbrFull" | "synonyms">): string[] {
  const base = uniq([e.ko, e.en ?? "", e.abbr ?? "", e.abbrFull ?? "", ...(e.synonyms ?? [])]);
  const out: string[] = [];
  for (const s of base) {
    out.push(s);
    // 괄호 앞부분만(예: "time slice(time quantum)" → "time slice")
    const head = s.replace(/\s*\(.*\)\s*$/, "");
    if (head !== s) out.push(head);
    if (/[A-Za-z]/.test(s)) {
      if (/\s/.test(s)) out.push(s.replace(/\s+/g, "-"));
      if (/-/.test(s)) out.push(s.replace(/-/g, " "));
    }
  }
  if (e.en) out.push(`${e.ko}(${e.en})`, `${e.en}(${e.ko})`);
  if (e.abbr) out.push(`${e.ko}(${e.abbr})`, `${e.abbr}(${e.ko})`);
  return uniq(out);
}

/** 정의 문장 안에 정답 용어(2글자 이상)가 그대로 들어 있는지 — 대소문자·공백 무시 */
export function defLeaksTerm(e: GlossaryEntry): string[] {
  if (!e.def) return [];
  const n = (s: string) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  const def = n(e.def);
  return uniq([e.ko, e.en ?? "", e.abbr ?? "", ...(e.synonyms ?? [])]).filter((t) => n(t).length >= 2 && def.includes(n(t)));
}

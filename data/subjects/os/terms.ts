import type { Question } from "@/types/question";
import { termAccept } from "../glossary";
import { OS_GLOSSARY } from "./glossary";

/**
 * 용어 단답형(os-chXX-term-NNN) — 용어 사전에서 만든다. 정의가 있고, 같은 용어를 정의로 묻는 기존 blank(linkedQuestionIds)가 없는 용어만.
 * 번호는 챕터 안에서 사전 순서대로 매긴다 → 새 용어는 사전의 챕터 끝에 추가하고 순서를 바꾸지 않는다(학습 기록이 id에 묶여 있다)
 */
const pageOf = (slideRef: string) => slideRef.replace(/^Ch\d\d\s+/, "");

function build(): Question[] {
  const counters: Record<string, number> = {};
  const out: Question[] = [];
  for (const e of OS_GLOSSARY) {
    if (!e.def || e.linkedQuestionIds?.length) continue;
    const n = (counters[e.chapter] = (counters[e.chapter] ?? 0) + 1);
    const label = [e.ko, e.en && e.en !== e.ko ? e.en : "", e.abbr && e.abbr !== e.ko ? `약자 ${e.abbr}${e.abbrFull ? ` = ${e.abbrFull}` : ""}` : ""].filter(Boolean).join(" · ");
    const syn = e.synonyms?.length ? ` 같은 뜻: ${e.synonyms.join(", ")}.` : "";
    const see = e.seeAlso?.length ? ` 참고: ${e.seeAlso.join(", ")}.` : "";
    const also = e.alsoNote ? ` (정답 인정) ${e.alsoNote}.` : "";
    out.push({
      subject: "os",
      chapter: e.chapter,
      id: `os-${e.chapter}-term-${String(n).padStart(3, "0")}`,
      topic: "용어",
      type: "blank",
      difficulty: 1,
      slideRef: e.slideRef,
      ...(e.hintIds?.length ? { exam: true, examBasis: "exam-hint", hintIds: [...e.hintIds] } : { exam: false }),
      prompt: "다음 설명에 해당하는 용어를 쓰시오(한국어 또는 영어).",
      text: `${e.def} → {{0}}`,
      blanks: [{ accept: termAccept(e) }],
      explanation: `${pageOf(e.slideRef)}${e.basis === "교수님 필기" ? "(교수님 필기)" : ""}: ${e.def} → ${label}.${syn}${see}${also}`,
    } as Question);
  }
  return out;
}

const ALL = build();

export function termQuestions(chapter: string): Question[] {
  return ALL.filter((q) => q.chapter === chapter);
}

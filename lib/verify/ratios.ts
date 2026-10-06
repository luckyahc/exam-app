/** 데이터과학 문항 비중(Sprint 15 마무리) — 규칙 검사는 data/subjects/data-science/ratio.test.ts */
import type { Question } from "@/types/question";
import { questionCode } from "./rules";

/** 코드 문제(코드가 딸린 문항) 안의 빈칸형·전체 작성형·실행 결과 고르기 비율과, 강의 전체의 복수 선택·mcq 비율 */
export function dsRatios(qs: readonly Question[]) {
  const code = qs.filter((q) => questionCode(q));
  const n = (f: (q: Question) => boolean, of: readonly Question[]) => of.filter(f).length;
  const isOutput = (q: Question) => q.verify?.mode === "run" && q.verify.check?.kind === "output";
  return {
    total: qs.length,
    code: code.length,
    blank: n((q) => q.type === "code-blank", code) / code.length,
    write: n((q) => q.type === "code-write", code) / code.length,
    output: n(isOutput, code) / code.length,
    multi: n((q) => q.type === "multi", qs) / qs.length,
    mcq: n((q) => q.type === "mcq", qs) / qs.length,
  };
}

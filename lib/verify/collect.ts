/** 검증 대상 모으기(Sprint 14): 데이터과학 강의 문항 + /playground 예시 */
import { SUBJECTS } from "@/data/subjects/registry";
import { dsPlaygroundQuestions } from "@/lib/qtypes/dsSamples";
import type { Question } from "@/lib/qtypes/registry";
import type { VerifyReport } from "./run";

export async function dsQuestions(): Promise<Question[]> {
  const ds = SUBJECTS.find((s) => s.id === "data-science")!;
  const out: Question[] = [...dsPlaygroundQuestions()];
  for (const c of ds.chapters) out.push(...(await c.load()));
  return out;
}

/** 실패 메시지를 문항별로 모아 보이기 */
export const failures = (reps: VerifyReport[]) => reps.filter((r) => !r.ok).map((r) => `${r.id}\n  - ${r.problems.join("\n  - ")}`);

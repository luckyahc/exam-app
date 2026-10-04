import type { GeneratorRef, GradeResult } from "@/lib/qtypes/base";
import type { SubjectRecords } from "./schema";

/**
 * 채점 한 번을 과목 학습 기록에 반영하는 순수 함수(입력 기록은 바꾸지 않고 새 기록을 돌려준다).
 *
 * 정답/오답 규칙 — 학습 기록·통계·오답노트 공통:
 * - **완전히 맞았을 때만 정답**(`result.correct`, 즉 score === 1). 하나라도 틀리면 부분 점수가 있어도 오답.
 * - 정답 수(`correctCount`)·정답률·오답노트는 이 정답/오답만으로 센다.
 * - 부분 점수(0..1)는 `lastScore`에 따로 저장만 한다(판정·통계에 쓰지 않음).
 * - 오답이면 오답노트에 쌓고(wrongCount+1, resolved=false), 나중에 완전히 맞히면 resolved=true.
 */
export function recordAttempt(
  records: SubjectRecords,
  questionId: string,
  result: Pick<GradeResult, "correct" | "score">,
  at: string,
  gen?: GeneratorRef,
): SubjectRecords {
  const prev = records.progress[questionId];
  const attempts = (prev?.attempts ?? 0) + 1;
  const progress = {
    ...records.progress,
    [questionId]: {
      attempts,
      correctCount: (prev?.correctCount ?? 0) + (result.correct ? 1 : 0),
      lastScore: result.score,
      lastAt: at,
    },
  };

  const prevWrong = records.wrong[questionId];
  let wrong = records.wrong;
  if (!result.correct) {
    wrong = {
      ...wrong,
      [questionId]: {
        wrongCount: (prevWrong?.wrongCount ?? 0) + 1,
        attempts,
        lastWrongAt: at,
        resolved: false,
        ...((gen ?? prevWrong?.gen) ? { gen: gen ?? prevWrong?.gen } : {}),
      },
    };
  } else if (prevWrong) {
    wrong = { ...wrong, [questionId]: { ...prevWrong, attempts, resolved: true } };
  }

  return { ...records, progress, wrong };
}

export interface AccuracySummary {
  /** 푼 횟수 합 */
  attempts: number;
  /** 완전히 맞힌 횟수 합 */
  correct: number;
  /** correct / attempts (풀이가 없으면 null) */
  rate: number | null;
  /** 아직 해결하지 못한 오답노트 문제 수 */
  openWrong: number;
}

/** 정답률·오답 수 요약. 완전히 맞음 기준으로만 센다(부분 점수는 반영하지 않음). */
export function summarize(
  records: SubjectRecords,
  questionIds?: readonly string[],
): AccuracySummary {
  const pick = <T>(map: Record<string, T>) =>
    questionIds ? questionIds.filter((id) => id in map).map((id) => map[id]) : Object.values(map);
  let attempts = 0;
  let correct = 0;
  for (const p of pick(records.progress)) {
    attempts += p.attempts;
    correct += p.correctCount;
  }
  const openWrong = pick(records.wrong).filter((w) => !w.resolved).length;
  return { attempts, correct, rate: attempts ? correct / attempts : null, openWrong };
}

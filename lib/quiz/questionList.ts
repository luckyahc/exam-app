import { answerKey } from "@/lib/qtypes/answerKey";
import { gradeQuestion, type Question } from "@/lib/qtypes/registry";
import type { SubjectRecords } from "@/lib/storage/schema";
import { filterQuestions, newSession, type QuizSession } from "./session";
import { matchesStar, type StarBasis } from "./starBasis";
import { questionStatus, type QStatus } from "./status";

/**
 * 과목별 "문제 목록"(풀이 상태별 문제 보기)의 순수 로직 — 화면은 components/questions/QuestionList.tsx.
 * 목록은 챕터의 원래 문제(정적 + 고정 seed 생성기 문항)만 다룬다. "비슷한 문제"로 새로 만든 문제는 챕터 데이터에 없으므로 나오지 않는다.
 */
export type ListTab = "all" | QStatus | "bookmark";
export const LIST_TABS: readonly ListTab[] = ["all", "unsolved", "correct", "wrong", "bookmark"];
export const TAB_LABEL: Record<ListTab, string> = { all: "전체", unsolved: "안 푼 문제", correct: "맞힌 문제", wrong: "틀린 문제", bookmark: "북마크" };

export interface ListFilter {
  chapter?: string | null;
  type?: string | null;
  /** ⭐ 근거(lib/quiz/starBasis.ts). 없으면 ⭐ 조건 없음 */
  star?: StarBasis | null;
  topic?: string | null;
}

export interface ListRow {
  q: Question;
  status: QStatus;
  attempts: number;
  bookmarked: boolean;
}

export function listRows(questions: readonly Question[], records: SubjectRecords | undefined): ListRow[] {
  const marks = new Set(records?.bookmarks ?? []);
  return questions.map((q) => ({
    q,
    status: questionStatus(records, q.id),
    attempts: records?.progress[q.id]?.attempts ?? 0,
    bookmarked: marks.has(q.id),
  }));
}

const inTab = (r: ListRow, tab: ListTab) => tab === "all" || (tab === "bookmark" ? r.bookmarked : r.status === tab);
const passes = (r: ListRow, f: ListFilter) =>
  (!f.chapter || r.q.chapter === f.chapter) && (!f.type || r.q.type === f.type) && (!f.star || matchesStar(r.q, f.star)) && (!f.topic || r.q.topic === f.topic);

/** 필터를 적용한 뒤 탭마다 개수(탭 개수는 필터 결과 기준) */
export function tabCounts(rows: readonly ListRow[], f: ListFilter): Record<ListTab, number> {
  const base = rows.filter((r) => passes(r, f));
  return Object.fromEntries(LIST_TABS.map((t) => [t, base.filter((r) => inTab(r, t)).length])) as Record<ListTab, number>;
}

export function visibleRows(rows: readonly ListRow[], tab: ListTab, f: ListFilter): ListRow[] {
  return rows.filter((r) => inTab(r, tab) && passes(r, f));
}

/** "이 목록으로 풀기": 지금 보이는 목록과 같은 문제로 세션을 만든다(섞기·문제 수 옵션) */
export function sessionFromList(
  rows: readonly ListRow[],
  opts: { shuffle: boolean; count: number | null; label: string; backHref: string; seed: string; now?: number },
): QuizSession {
  const picked = filterQuestions(
    rows.map((r) => r.q),
    { shuffle: opts.shuffle, count: opts.count, seed: opts.seed },
  );
  return newSession(picked, { mode: "instant", label: opts.label, backHref: opts.backHref, now: opts.now });
}

/** "정답·해설 보기": 정답 키로 채점한 결과만 만든다 — 학습 기록에는 아무것도 쓰지 않는다 */
export function revealAnswer(q: Question) {
  const answer = answerKey(q);
  return { answer, result: gradeQuestion(q, answer) };
}

/** 목록 한 줄에 보여 줄 문제 앞부분(굵게·코드 표시 기호를 뗀다) */
export function promptPreview(q: Question, max = 80): string {
  const x = q as unknown as { text?: string };
  const base = q.prompt.replace(/\*\*|`/g, "").replace(/\s+/g, " ").trim();
  const extra = /빈칸에 알맞은|다음 설명에 해당하는 용어/.test(base) && x.text ? ` ${x.text.replace(/\{\{\d+\}\}/g, "___").replace(/\*\*|`/g, "")}` : "";
  const s = (base + extra).trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

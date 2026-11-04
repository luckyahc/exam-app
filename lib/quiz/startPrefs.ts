import type { AppSettings } from "@/lib/settings/appSettings";
import { startPrefsKey } from "@/lib/storage/keys";
import { safeGetJSON, safeSetJSON } from "@/lib/storage/safeStorage";
import type { SourceFilter } from "./jokbo";
import type { ExamView } from "./session";
import type { StarBasis } from "./starBasis";
import type { QStatus } from "./status";

/** 챕터 화면 "직접 고르기" 조건. 퀴즈 주소 쿼리로 바꿔 /quiz에 넘긴다(toParams) */
export interface StartPrefs {
  types: string[];
  difficulties: number[];
  topics: string[];
  status: QStatus | "all";
  star: StarBasis | null;
  source: SourceFilter;
  /** 0 = 전체 */
  count: number;
  shuffle: boolean;
  mode: "instant" | "exam";
  /** 분, 0 = 제한 없음(시험 모드만) */
  timer: number;
  view: ExamView;
}

export const START_COUNTS = [10, 20, 30, 0] as const;

/** 저장된 값이 없을 때: 조건 없음 + 문제 수·순서·모드는 설정 탭 기본값 */
export function defaultPrefs(s: AppSettings): StartPrefs {
  return {
    types: [],
    difficulties: [],
    topics: [],
    status: "all",
    star: null,
    source: "all",
    count: s.quizCount,
    shuffle: s.quizOrder === "shuffle",
    mode: s.quizMode,
    timer: 0,
    view: "eclass",
  };
}

/** 저장된 원시 값을 기본값 위에 얹는다(모르는 값은 버린다). 챕터에 없는 유형·토픽은 쓰는 쪽에서 거른다 */
export function readPrefs(subjectId: string, chapterId: string, s: AppSettings): StartPrefs {
  const base = defaultPrefs(s);
  const raw = safeGetJSON<Record<string, Partial<StartPrefs>>>(startPrefsKey(subjectId))?.[
    chapterId
  ];
  if (!raw || typeof raw !== "object") return base;
  const strs = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    types: strs(raw.types),
    difficulties: Array.isArray(raw.difficulties)
      ? raw.difficulties.filter((d) => d === 1 || d === 2 || d === 3)
      : [],
    topics: strs(raw.topics),
    status: (["all", "unsolved", "wrong", "correct"] as const).includes(raw.status as never)
      ? raw.status!
      : "all",
    star: raw.star === "all" || raw.star === "handwritten" || raw.star === "hint" ? raw.star : null,
    source: typeof raw.source === "string" ? (raw.source as SourceFilter) : "all",
    count: (START_COUNTS as readonly number[]).includes(raw.count as number)
      ? raw.count!
      : base.count,
    shuffle: typeof raw.shuffle === "boolean" ? raw.shuffle : base.shuffle,
    mode: raw.mode === "exam" || raw.mode === "instant" ? raw.mode : base.mode,
    timer: typeof raw.timer === "number" && raw.timer >= 0 && raw.timer <= 300 ? raw.timer : 0,
    view: raw.view === "app" ? "app" : "eclass",
  };
}

export function writePrefs(subjectId: string, chapterId: string, prefs: StartPrefs) {
  const all = safeGetJSON<Record<string, StartPrefs>>(startPrefsKey(subjectId)) ?? {};
  safeSetJSON(startPrefsKey(subjectId), { ...all, [chapterId]: prefs });
}

/** 조건 → 퀴즈 주소 쿼리(이전 챕터 시작 화면과 같은 이름·형식) */
export function toParams(subjectId: string, chapterId: string, p: StartPrefs): URLSearchParams {
  const q = new URLSearchParams({ subject: subjectId, chapter: chapterId, mode: p.mode });
  if (p.types.length) q.set("types", p.types.join(","));
  if (p.topics.length) q.set("topics", p.topics.join("|"));
  if (p.star) q.set("star", p.star === "all" ? "1" : p.star);
  if (p.status !== "all") q.set("status", p.status);
  if (p.source !== "all") q.set("source", p.source);
  if (p.difficulties.length) q.set("diff", [...p.difficulties].sort().join(","));
  if (p.count) q.set("count", String(p.count));
  if (p.shuffle) q.set("shuffle", "1");
  if (p.mode === "exam" && p.timer) q.set("timer", String(p.timer * 60));
  if (p.mode === "exam" && p.view === "eclass") q.set("view", "eclass");
  return q;
}

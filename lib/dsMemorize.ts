import { filterFunctions, type DsFunction } from "@/lib/dsFunctions";

/**
 * 함수 정리 암기 모드(2026-10-20) — 순수 함수만. 화면: components/functions/MemorizeView.tsx, 저장: lib/storage/memoStore.ts.
 * - 방향 A(이름 맞히기): 설명·쓰임이 보이고 이름이 가려진다 → 보이는 글자(시그니처·예시·주의…) 안의 이름도 ▢▢▢로 가린다(maskName)
 * - 방향 B(역할 맞히기): 이름·시그니처만 보이고 설명·쓰임·주의·예시 출력이 가려진다
 */
export type MemoDir = "A" | "B";
export const MEMO_DIRS: readonly MemoDir[] = ["A", "B"];
export const MASK = "▢▢▢";

export interface MemoEntry {
  known: boolean;
  /** 마지막 확인 시각(ISO) */
  at: string;
}
/** 방향별 함수 id → 기록 */
export type MemoRecords = Record<MemoDir, Record<string, MemoEntry>>;
export const emptyMemo = (): MemoRecords => ({ A: {}, B: {} });

/** 저장소에서 읽은 값이 깨져 있어도 빈 기록으로 */
export function parseMemo(v: unknown): MemoRecords {
  const out = emptyMemo();
  if (!v || typeof v !== "object") return out;
  for (const d of MEMO_DIRS) {
    const m = (v as Record<string, unknown>)[d];
    if (!m || typeof m !== "object") continue;
    for (const [id, e] of Object.entries(m as Record<string, unknown>)) {
      if (
        e &&
        typeof e === "object" &&
        typeof (e as MemoEntry).known === "boolean" &&
        typeof (e as MemoEntry).at === "string"
      )
        out[d][id] = { known: (e as MemoEntry).known, at: (e as MemoEntry).at };
    }
  }
  return out;
}

type Named = Pick<DsFunction, "name" | "lang">;

/**
 * 가려야 할 이름 조각. 파이썬은 앞의 객체·모듈 이름(np·df·list·driver…)을 뺀 나머지와 그 조각들
 * (df.groupby → groupby, Series.str.contains → str.contains·str·contains), SQL은 "…"로 나뉜 구문들(SELECT … FROM → SELECT·FROM).
 */
export function nameTokens(f: Named): string[] {
  if (f.lang === "sql") return f.name.split(/\s*…\s*/).filter(Boolean);
  const parts = f.name.split(".");
  const core = parts.length > 1 ? parts.slice(1) : parts;
  return [...new Set([core.join("."), ...core])];
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 이름 조각을 낱말로(앞뒤가 영문·숫자·_가 아닐 때) 찾는 정규식 — 대소문자·SQL 띄어쓰기 무시. 한글 조사(groupby로)는 경계로 본다 */
export function namePattern(f: Named): RegExp {
  const alts = nameTokens(f)
    .sort((a, b) => b.length - a.length)
    .map((t) => esc(t).replace(/ /g, "\\s+"));
  return new RegExp(`(?<![A-Za-z0-9_])(?:${alts.join("|")})(?![A-Za-z0-9_])`, "gi");
}

/** 보이는 글자 안의 함수 이름을 ▢▢▢로(df.groupby('반') → df.▢▢▢('반')) */
export function maskName(text: string, f: Named): string {
  return text.replace(namePattern(f), MASK);
}

/** 방향 A에서 이름을 가린 채 보여 주는 항목들 */
export function maskedFields(f: DsFunction) {
  const m = (s: string | null | undefined) => (s == null ? s : maskName(s, f));
  return {
    signature: m(f.signature)!,
    description: m(f.description)!,
    usage: m(f.usage)!,
    pitfall: m(f.pitfall),
    example: m(f.example)!,
    exampleOutput: m(f.exampleOutput) ?? null,
    setup: m(f.setup),
    noRun: m(f.noRun),
  };
}

const PREFIX = /^(np|pd|df|plt)\./;
const normName = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s…]+/g, "")
    .replace(/\(.*\)$/, "")
    .replace(/\[.*\]$/, "");

/**
 * 이름 직접 입력 채점: 공백·대소문자 무시, 끝의 괄호·인자 무시, np.·pd.·df.·plt.(그리고 그 함수 자신의 앞부분 list.·driver.…)는 생략해도 정답.
 */
export function checkName(input: string, f: Named): boolean {
  const got = normName(input);
  if (!got) return false;
  const full = normName(f.name);
  const core =
    f.lang === "python" && f.name.includes(".")
      ? normName(f.name.split(".").slice(1).join("."))
      : full;
  return [got, got.replace(PREFIX, "")].some((g) => g === full || g === core);
}

/** 알았음/몰랐음 표시(시각 갱신) */
export function markMemo(
  r: MemoRecords,
  dir: MemoDir,
  id: string,
  known: boolean,
  now: Date,
): MemoRecords {
  return { ...r, [dir]: { ...r[dir], [id]: { known, at: now.toISOString() } } };
}

/** 장 탭(그 장에 다시 나오는 함수 포함) 단위로 한 방향 기록을 지운다. lecture가 ""면 그 방향 전체 */
export function resetMemo(
  r: MemoRecords,
  dir: MemoDir,
  list: readonly DsFunction[],
  lecture: string,
): MemoRecords {
  const ids = new Set(filterFunctions(list, { lecture }).map((f) => f.id));
  return { ...r, [dir]: Object.fromEntries(Object.entries(r[dir]).filter(([id]) => !ids.has(id))) };
}

export type MemoFilter = "" | "unknown" | "unseen";

/** "몰랐음만"·"아직 안 본 것만" — 장·카테고리·검색 필터(filterFunctions) 결과에 이어서 건다 */
export function filterMemo<T extends Pick<DsFunction, "id">>(
  list: readonly T[],
  r: MemoRecords,
  dir: MemoDir,
  filter: MemoFilter,
): T[] {
  if (!filter) return [...list];
  return list.filter((f) => (filter === "unknown" ? r[dir][f.id]?.known === false : !r[dir][f.id]));
}

/** 장별 진행 요약(장 탭과 같은 기준 — 다시 나오는 장에도 센다) */
export function memoSummary(
  list: readonly DsFunction[],
  r: MemoRecords,
  dir: MemoDir,
  lectures: readonly string[],
) {
  return lectures.map((lecture) => {
    const fs = filterFunctions(list, { lecture });
    return {
      lecture,
      known: fs.filter((f) => r[dir][f.id]?.known === true).length,
      total: fs.length,
    };
  });
}

/** 순서 섞기(Fisher–Yates). rand는 테스트에서 주입 */
export function shuffled<T>(xs: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

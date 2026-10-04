import type { ExamBasis } from "@/lib/qtypes/base";
import type { CalcQ } from "@/lib/qtypes/calc";
import type { ClassifyQ } from "@/lib/qtypes/classify";
import type { McqQ } from "@/lib/qtypes/mcq";
import type { TraceCell, TraceQ } from "@/lib/qtypes/trace";
import { createRng, type Rng } from "../_shared/rng";
import { type Generator, type GeneratorMap, genId } from "../_shared/types";
import { type BuddyOp, opLabel, simulateBuddy } from "./buddy";
import {
  batchFirstResponse,
  batchUtilization,
  timeSharingFirstResponse,
  timeSharingUtilization,
} from "./cpuTime";
import { invertedEntries, KB, GB, pageTableInfo } from "./memoryCapacity";
import { logicalToPhysical, physicalToLogical, solveFrame } from "./paging";
import { chooseHole, FIT_LABEL, FITS, type Fit, type Hole } from "./placement";
import { SCENARIOS, SWITCH_CAUSES, scenariosByCause, TRANSITIONS } from "./processScenario";
import { ALGO_LABEL, type Algo, simulateReplacement } from "./replacement";
import { segLogicalToPhysical } from "./segmentation";

/**
 * OS 문제 생성기 (Sprint 4). 모든 정답은 lib/sim/os의 시뮬레이터로 계산한다.
 * 같은 seed·params면 항상 같은 문제(결정적). params를 주면 그 값으로 고정하고, 없으면 seed로 고른다.
 */

interface Meta {
  chapter: string;
  topic: string;
  slideRef: string;
  exam: boolean;
  examBasis?: ExamBasis;
}

function baseOf(
  name: string,
  meta: Meta,
  seed: number,
  params: Record<string, unknown>,
  difficulty: 1 | 2 | 3,
) {
  return {
    id: genId("os", meta.chapter, name, seed),
    subject: "os" as const,
    chapter: meta.chapter,
    topic: meta.topic,
    exam: meta.exam,
    ...(meta.exam ? { examBasis: meta.examBasis } : {}),
    difficulty,
    slideRef: meta.slideRef,
    generator: { name, params, seed },
  };
}

const fmt = (n: number) => n.toLocaleString("en-US");
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** mcq 보기: 정답 + 오답 후보(중복·정답과 같은 값 제거) 중 앞 (count−1)개를 섞는다 */
function mcqChoices(rng: Rng, correct: string, wrong: readonly string[], count = 4) {
  const pool = [...new Set(wrong.filter((w) => w !== correct))].slice(0, count - 1);
  if (pool.length < count - 1) return null;
  const choices = rng.shuffle([correct, ...pool]);
  return { choices, answerIndex: choices.indexOf(correct) };
}

// ------------------------------------------------------------------ 페이징 주소 변환
type PagingParams = { variant: "l2p" | "p2l" | "solve"; pageSize: number };
const PAGING: Meta = {
  chapter: "ch07",
  topic: "주소 변환",
  slideRef: "Ch07 p.32-36",
  exam: true,
  examBasis: "handwritten",
};

export const pagingGen: Generator<PagingParams> = {
  name: "paging",
  chapter: PAGING.chapter,
  topic: PAGING.topic,
  description:
    "페이지 테이블 주소 변환: 논리→물리, 물리→논리(선형 탐색), 빈칸 프레임 번호 x 구하기",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = params.variant ?? rng.pick(["l2p", "p2l", "solve"] as const);
    const P = params.pageSize ?? rng.pick([1000, 1024, 2048, 4096]);
    const frames = rng.sample([0, 1, 2, 3, 4, 5, 6, 7], 4);
    const page = rng.int(0, 3);
    const offset = rng.int(1, P - 1);
    const logical = page * P + offset;
    const physical = frames[page] * P + offset;
    const tableText = (hide?: number) =>
      frames.map((f, i) => `페이지 ${i}→프레임 ${i === hide ? "x" : f}`).join(", ");
    const head = `페이지 크기는 ${fmt(P)}이고 페이지 테이블이 \`${tableText(variant === "solve" ? page : undefined)}\`일 때, `;
    let prompt: string;
    let answer: number;
    let steps: string[];
    if (variant === "l2p") {
      const r = logicalToPhysical(frames, P, logical);
      answer = r.physical!;
      prompt = `${head}**논리주소 ${fmt(logical)}**의 실제주소는?`;
      steps = [
        `페이지 번호 = ${fmt(logical)} / ${fmt(P)} = ${page}, offset = ${fmt(logical)} % ${fmt(P)} = ${offset}`,
        `페이지 테이블[${page}] = 프레임 ${frames[page]}`,
        `실제주소 = ${frames[page]} × ${fmt(P)} + ${offset} = ${fmt(answer)}`,
      ];
    } else if (variant === "p2l") {
      const r = physicalToLogical(frames, P, physical)!;
      answer = r.logical;
      prompt = `${head}**실제주소 ${fmt(physical)}**의 논리주소는?`;
      steps = [
        `프레임 번호 = ${fmt(physical)} / ${fmt(P)} = ${r.frame}, offset = ${r.offset}`,
        `페이지 테이블에서 값이 ${r.frame}인 인덱스를 처음부터 찾음 → 페이지 ${r.page} (선형 탐색 ${r.comparisons}칸)`,
        `논리주소 = ${r.page} × ${fmt(P)} + ${r.offset} = ${fmt(answer)}`,
      ];
    } else {
      answer = solveFrame(logical, physical, P);
      prompt = `${head}논리주소 ${fmt(logical)}이 실제주소 ${fmt(physical)}로 변환된다. **x(프레임 번호)**는?`;
      steps = [
        `논리주소 ${fmt(logical)} → 페이지 ${page}, offset ${offset}`,
        `x × ${fmt(P)} + ${offset} = ${fmt(physical)}`,
        `x = (${fmt(physical)} − ${offset}) / ${fmt(P)} = ${answer}`,
      ];
    }
    const q: CalcQ = {
      ...baseOf("paging", PAGING, seed, { variant, pageSize: P }, variant === "l2p" ? 1 : 2),
      type: "calc",
      prompt,
      answer,
      tolerance: 0,
      steps,
      explanation:
        variant === "p2l"
          ? "실제주소 → 논리주소는 프레임 번호를 값으로 가진 페이지를 테이블에서 **선형 탐색**해야 하므로, 페이지 번호를 인덱스로 바로 쓰는 논리 → 실제 변환보다 느리다."
          : "페이지 번호 = 주소 / 페이지 크기, offset = 주소 % 페이지 크기. 페이지 번호를 인덱스로 테이블에서 프레임 번호를 바로 찾는다(빠름).",
      summary: "실제주소 = 프레임 번호 × 페이지 크기 + offset",
    };
    return q;
  },
};

// ------------------------------------------------------------------ 세그먼테이션
type SegParams = { trap: boolean };
const SEG: Meta = {
  chapter: "ch07",
  topic: "기본 세그먼테이션",
  slideRef: "Ch07 p.37-41",
  exam: false,
};
const TRAP = "보호 위반(트랩) 발생";

export const segmentationGen: Generator<SegParams> = {
  name: "segmentation",
  chapter: SEG.chapter,
  topic: SEG.topic,
  description: "세그먼트 테이블 주소 변환과 길이 초과 시 보호 위반(트랩) 판정",
  generate(seed, params = {}) {
    for (let attempt = 0; ; attempt++) {
      const rng = createRng(seed * 31 + attempt);
      const trap = params.trap ?? rng.chance(0.4);
      const bases = rng.sample([0, 1024, 2048, 3072, 4096, 5120], 3);
      const lengths = bases.map(() => rng.int(2, 12) * 50);
      const table = bases.map((base, i) => ({ base, length: lengths[i] }));
      const s = rng.int(0, 2);
      const offset = trap ? rng.int(lengths[s], 1000) : rng.int(1, lengths[s] - 1);
      const logical = s * 1024 + offset;
      const r = segLogicalToPhysical(table, 1024, logical);
      if (r.trap !== trap) continue;
      const correct = r.trap ? TRAP : fmt(r.physical);
      const wrong = [
        r.trap ? fmt(table[s].base + offset) : TRAP, // 길이 검사를 빼먹은 값 / 정상인데 트랩이라고 착각
        fmt(table[s].base + logical), // 세그먼트 번호를 떼지 않고 더함
        fmt(table[(s + 1) % 3].base + offset), // 다른 세그먼트 base 사용
        fmt(logical), // 변환하지 않음
      ];
      const mc = mcqChoices(rng, correct, wrong);
      if (!mc) continue;
      const tableText = table
        .map((t, i) => `세그먼트 ${i}: base ${fmt(t.base)}, 길이 ${t.length}`)
        .join(" / ");
      const q: McqQ = {
        ...baseOf("segmentation", SEG, seed, { trap }, 2),
        type: "mcq",
        prompt: `세그먼트 최대 크기 1024, 세그먼트 테이블 \`${tableText}\`일 때 **논리주소 ${fmt(logical)}**의 실제주소는?`,
        ...mc,
        explanation: r.trap
          ? `세그먼트 번호 = ${fmt(logical)} / 1024 = ${s}, offset = ${offset}. offset ${offset} ≥ 세그먼트 길이 ${lengths[s]}이므로 **보호 위반(트랩)**이 발생한다. 길이 검사 없이 base + offset을 계산하면 틀린다.`
          : `세그먼트 번호 = ${fmt(logical)} / 1024 = ${s}, offset = ${offset} < 길이 ${lengths[s]}이므로 정상. 실제주소 = base ${fmt(table[s].base)} + ${offset} = ${correct}.`,
        summary: "offset < 길이면 base + offset, 아니면 트랩",
      };
      return q;
    }
  },
};

// ------------------------------------------------------------------ 버디 시스템
type BuddyParams = { variant: "state" | "start" | "frag" };
const BUDDY: Meta = {
  chapter: "ch07",
  topic: "버디 시스템",
  slideRef: "Ch07 p.20-24",
  exam: true,
  examBasis: "handwritten",
};

function buddyOps(rng: Rng): BuddyOp[] {
  const names = ["A", "B", "C", "D", "E"];
  const sizes = [30, 40, 60, 64, 75, 100, 120, 200, 240, 256];
  const ops: BuddyOp[] = [];
  const live: string[] = [];
  let used = 0;
  for (const name of names.slice(0, rng.int(3, 4))) {
    const size = rng.pick(sizes);
    ops.push({ type: "request", name, size });
    live.push(name);
    used++;
    if (used >= 2 && rng.chance(0.5))
      ops.push({ type: "release", name: live.splice(rng.int(0, live.length - 2), 1)[0] });
  }
  if (!ops.some((o) => o.type === "release"))
    ops.push({ type: "release", name: live.splice(rng.int(0, live.length - 1), 1)[0] });
  return ops;
}

export const buddyGen: Generator<BuddyParams> = {
  name: "buddy",
  chapter: BUDDY.chapter,
  topic: BUDDY.topic,
  description: "1M 버디 시스템 요청/반납 순서 후 블록 상태, 블록 시작 주소, 내부 단편화",
  generate(seed, params = {}) {
    for (let attempt = 0; ; attempt++) {
      const rng = createRng(seed * 37 + attempt);
      const variant = params.variant ?? rng.pick(["state", "state", "start", "frag"] as const);
      const ops = buddyOps(rng);
      const steps = simulateBuddy(1024, ops);
      if (steps.some((s) => s.failed)) continue;
      const opsText = ops.map((o) => opLabel(o)).join(" → ");
      const trace = steps.map((s) => `${opLabel(s.op)}: ${s.line}`).join(" / ");
      const base = baseOf("buddy", BUDDY, seed, { variant }, variant === "state" ? 3 : 2);
      if (variant === "state") {
        const last = steps[steps.length - 1].line;
        const wrong = [
          simulateBuddy(1024, ops, { merge: false }).at(-1)!.line, // 반납 때 병합을 안 함
          simulateBuddy(1024, ops, { allocate: "right" }).at(-1)!.line, // 오른쪽 반을 할당
          steps[steps.length - 2].line, // 마지막 연산 전 상태
          simulateBuddy(1024, ops, { merge: false, allocate: "right" }).at(-1)!.line,
        ];
        const mc = mcqChoices(rng, last, wrong);
        if (!mc) continue;
        const q: McqQ = {
          ...base,
          type: "mcq",
          prompt: `1M 메모리에서 버디 시스템으로 \`${opsText}\`를 차례로 실행한 직후의 블록 상태는? (왼쪽이 낮은 주소)`,
          ...mc,
          explanation: `요청은 2^k로 올려 가장 작은 맞는 블록을 반으로 쪼개며 **왼쪽**을 할당하고, 반납 시에는 **같은 분할에서 나온 buddy가 쪼개지지 않은 free**일 때만 병합한다. 단계별: ${trace}`,
          summary: "2^k 올림·왼쪽 할당·buddy 쌍만 병합",
        };
        return q;
      }
      const lastReq = [...steps].reverse().find((s) => s.op.type === "request")!;
      const req = lastReq.op as Extract<BuddyOp, { type: "request" }>;
      const block = lastReq.blocks.find((b) => b.name === req.name)!;
      const q: CalcQ =
        variant === "start"
          ? {
              ...base,
              type: "calc",
              prompt: `1M 메모리에서 버디 시스템으로 \`${opsText}\`를 실행할 때 **${req.name}가 할당받는 블록의 시작 주소**는? (K 단위, 메모리 시작 = 0K)`,
              answer: block.start,
              tolerance: 0,
              unit: "K",
              steps: steps.map((s) => `${opLabel(s.op)}: ${s.line}`),
              explanation: `${req.name}=${req.size}K는 ${block.size}K 블록에 들어가며 그 시작 주소는 ${block.start}K이다. 같은 크기 후보가 여럿이면 낮은 주소(왼쪽)부터 쓴다.`,
            }
          : {
              ...base,
              type: "calc",
              prompt: `1M 메모리에서 버디 시스템으로 \`${opsText}\`를 실행할 때 **${req.name}(${req.size}K 요청)의 내부 단편화** 크기는?`,
              answer: block.size - req.size,
              tolerance: 0,
              unit: "K",
              steps: [
                `${req.size}K를 수용하는 가장 작은 2^k = ${block.size}K`,
                `내부 단편화 = ${block.size} − ${req.size} = ${block.size - req.size}K`,
              ],
              explanation: `버디 시스템은 요청을 2의 거듭제곱으로 올려 블록 전체를 할당하므로 ${req.size}K를 요청해도 ${block.size}K가 할당되고 그 차이가 내부 단편화다.`,
            };
      return q;
    }
  },
};

// ------------------------------------------------------------------ 배치 알고리즘
type PlacementParams = { fit: Fit };
const PLACE: Meta = {
  chapter: "ch07",
  topic: "배치 알고리즘",
  slideRef: "Ch07 p.15-19",
  exam: true,
  examBasis: "handwritten",
};

export const placementGen: Generator<PlacementParams> = {
  name: "placement",
  chapter: PLACE.chapter,
  topic: PLACE.topic,
  description:
    "빈 블록 목록과 요청 크기로 First/Best/Next/Worst-fit이 고르는 블록 (Next-fit wrap-around 포함)",
  generate(seed, params = {}) {
    for (let attempt = 0; ; attempt++) {
      const rng = createRng(seed * 41 + attempt);
      const fit = params.fit ?? rng.pick(FITS);
      const sizes = rng.sample([8, 12, 15, 18, 20, 24, 30, 36, 40, 45, 50, 60], 5);
      let addr = rng.int(1, 4) * 10;
      const holes: Hole[] = sizes.map((size) => {
        const h = { start: addr, size };
        addr += size + rng.int(1, 4) * 10;
        return h;
      });
      const request = rng.int(6, 35);
      // 마지막 배치가 끝난 주소는 할당된 영역 안이어야 한다 → 어떤 빈 블록 시작 바로 앞(간격 ≥ 10K 안쪽)
      const lastEnd = rng.pick(holes).start - rng.int(0, 8);
      const picks = FITS.map((f) => chooseHole(holes, request, f, lastEnd));
      const mine = picks[FITS.indexOf(fit)];
      if (mine.index === null) continue;
      // 쉬운 문제 방지: 고른 알고리즘의 답이 다른 알고리즘 중 최소 하나와 달라야 한다
      if (picks.every((p) => p.index === mine.index)) continue;
      if (fit === "next" && rng.chance(0.5) && !mine.wrapped) continue; // Next-fit은 절반 정도 wrap-around 사례
      const label = (h: Hole, i: number) => `블록 ${i + 1} (시작 ${h.start}K, 크기 ${h.size}K)`;
      const choices = holes.map(label);
      const q: McqQ = {
        ...baseOf("placement", PLACE, seed, { fit }, fit === "next" ? 3 : 2),
        type: "mcq",
        prompt:
          `빈 블록이 주소 순서로 \`${holes.map((h) => `${h.start}K~${h.start + h.size}K(${h.size}K)`).join(", ")}\`일 때 ` +
          `**${request}K** 요청을 **${FIT_LABEL[fit]}**으로 배치하면 선택되는 블록은?` +
          (fit === "next" ? ` (마지막 배치가 끝난 주소: ${lastEnd}K)` : ""),
        choices,
        answerIndex: mine.index,
        explanation:
          `${FIT_LABEL[fit]}: ${
            {
              first: "처음부터 훑어 충분히 큰 첫 블록",
              best: "충분히 큰 블록 중 요청 크기에 가장 가까운(가장 작은) 블록",
              worst: "가장 큰 블록",
              next: `마지막 배치 위치(${lastEnd}K)부터 훑고, 끝까지 없으면 처음으로 돌아감${mine.wrapped ? " — 이번에는 끝까지 맞는 블록이 없어 처음으로 돌아갔다" : ""}`,
            }[fit]
          }. 같은 요청에서 다른 알고리즘의 선택: ` +
          FITS.map((f, i) => `${FIT_LABEL[f]} → 블록 ${(picks[i].index ?? -1) + 1}`).join(", ") +
          ".",
        summary: "First ≈ Next > Best ≥ Worst (속도), Best-fit은 미세 조각을 가장 많이 남김",
      };
      return q;
    }
  },
};

// ------------------------------------------------------------------ 응답시간 / CPU 이용률
type CpuParams = { variant: "batchResp" | "tsResp" | "batchUtil" | "tsUtil" };
const CPU: Meta = {
  chapter: "ch02",
  topic: "시간 계산",
  slideRef: "Ch02 p.21-24",
  exam: true,
  examBasis: "handwritten",
};

export const cpuTimeGen: Generator<CpuParams> = {
  name: "cpu-time",
  chapter: CPU.chapter,
  topic: CPU.topic,
  description: "다중프로그램 일괄처리 vs 시분할의 첫 응답시간·유효 CPU 이용률",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant =
      params.variant ?? rng.pick(["batchResp", "tsResp", "batchUtil", "tsUtil"] as const);
    const n = rng.int(4, 12);
    const t = rng.pick([0.5, 1, 2]);
    const s = rng.pick([0.01, 0.02, 0.05]);
    const q = rng.pick([0.1, 0.25, 0.5].filter((x) => x <= t));
    const p = { n, t, s, q, output: 0.1 };
    const setup = `프로그램 ${n}개(각각 I/O 없이 ${t}초 실행), 내 프로그램은 마지막 순서, 실행 후 0.1초 만에 첫 출력, 스위칭 시간 ${s}초`;
    const table = {
      batchResp: {
        ask: "**다중프로그램 일괄처리**에서 내 프로그램의 첫 응답시간",
        value: batchFirstResponse(p),
        unit: "초",
        steps: [
          `(N−1)×(T+s) + s + 0.1`,
          `= ${n - 1} × (${t} + ${s}) + ${s} + 0.1`,
          `= ${round(batchFirstResponse(p), 4)}초`,
        ],
      },
      tsResp: {
        ask: `**시분할(타임슬라이스 ${q}초)**에서 내 프로그램의 첫 응답시간`,
        value: timeSharingFirstResponse(p),
        unit: "초",
        steps: [
          `(N−1)×(q+s) + s + 0.1`,
          `= ${n - 1} × (${q} + ${s}) + ${s} + 0.1`,
          `= ${round(timeSharingFirstResponse(p), 4)}초`,
        ],
      },
      batchUtil: {
        ask: "**다중프로그램 일괄처리**의 유효 CPU 이용률",
        value: batchUtilization(p),
        unit: "",
        steps: [
          `스위칭 ${n}번`,
          `N×T / (N×T + N×s) = ${n * t} / (${n * t} + ${round(n * s, 4)})`,
          `≈ ${round(batchUtilization(p), 4)}`,
        ],
      },
      tsUtil: {
        ask: `**시분할(타임슬라이스 ${q}초)**의 유효 CPU 이용률`,
        value: timeSharingUtilization(p),
        unit: "",
        steps: [
          `스위칭 횟수 = 전체 실행시간 / q = ${n * t} / ${q} = ${round((n * t) / q, 4)}번`,
          `N×T / (N×T + 스위칭 횟수×s) = ${n * t} / (${n * t} + ${round(((n * t) / q) * s, 4)})`,
          `≈ ${round(timeSharingUtilization(p), 4)}`,
        ],
      },
    }[variant];
    const out: CalcQ = {
      ...baseOf("cpu-time", CPU, seed, { variant }, 2),
      type: "calc",
      prompt: `${setup}일 때 ${table.ask}은? (소수 둘째 자리까지)`,
      answer: round(table.value, 2),
      tolerance: 0.005,
      ...(table.unit ? { unit: table.unit } : {}),
      steps: table.steps,
      explanation:
        "일괄처리는 앞 프로그램이 끝나야 CPU를 넘겨받아 응답이 느리지만 스위칭이 적어 CPU 이용률이 높고, 시분할은 타임슬라이스마다 돌아가며 실행해 응답이 빠른 대신 스위칭이 많아 이용률이 낮다. 과거엔 CPU 이용률, 오늘날은 응답시간이 중요하다.",
      summary: "일괄: 응답↑·이용률↑ / 시분할: 응답↓·이용률↓",
    };
    return out;
  },
};

// ------------------------------------------------------------------ 페이지 교체
type ReplParams = { variant: "count" | "trace"; algo: Algo };
const REPL: Meta = {
  chapter: "ch08",
  topic: "교체 알고리즘",
  slideRef: "Ch08 p.42-49",
  exam: true,
  examBasis: "handwritten",
};

export const replacementGen: Generator<ReplParams> = {
  name: "replacement",
  chapter: REPL.chapter,
  topic: REPL.topic,
  description:
    "페이지 교체(OPT/LRU/FIFO/Clock) F 횟수, 진행 표 빈칸 채우기 (Figure 8.15 집계 규칙)",
  generate(seed, params = {}) {
    for (let attempt = 0; ; attempt++) {
      const rng = createRng(seed * 43 + attempt);
      const variant = params.variant ?? rng.pick(["count", "trace"] as const);
      const algo =
        params.algo ??
        rng.pick(
          variant === "trace"
            ? (["fifo", "lru", "opt"] as const)
            : (["fifo", "lru", "opt", "clock"] as const),
        );
      const refs = Array.from({ length: rng.int(9, 12) }, () => rng.int(1, 5));
      const r = simulateReplacement(refs, 3, algo);
      if (r.faults < 2) continue;
      const refText = refs.join(" ");
      const base = baseOf(
        "replacement",
        REPL,
        seed,
        { variant, algo },
        variant === "trace" ? 3 : 2,
      );
      const rule =
        "※ F는 프레임 3개가 처음 다 채워진 **뒤**의 페이지 폴트만 센다 — 처음 채우는 적재는 F가 아니다(Figure 8.15 기준).";
      if (variant === "count") {
        const q: CalcQ = {
          ...base,
          type: "calc",
          prompt: `프레임 3개, 참조열 \`${refText}\`에서 **${ALGO_LABEL[algo]}**의 F 횟수는? ${rule}`,
          answer: r.faults,
          tolerance: 0,
          unit: "번",
          steps: r.steps.map(
            (s, i) =>
              `${i + 1}. 참조 ${s.ref}: [${s.frames.map((f, j) => (f === null ? "·" : algo === "clock" && s.use?.[j] ? `${f}*` : f)).join(" ")}]${s.fault ? " F" : s.hit ? " (히트)" : " (적재)"}`,
          ),
          explanation:
            (algo === "clock"
              ? "Clock: 참조·적재 때 use=1, 교체는 pointer부터 처음 만나는 use=0 프레임이며 지나치는 use=1은 0으로 바꾼다. 히트 때는 pointer가 움직이지 않는다. (* = use bit 1)"
              : algo === "opt"
                ? "OPT: 앞으로 가장 오랫동안 참조되지 않을 페이지를 교체한다. 다시 참조되지 않는 페이지가 여럿이면 맨 위 프레임을 뺀다."
                : algo === "lru"
                  ? "LRU: 가장 오랫동안 참조되지 않은(가장 최근 사용이 오래된) 페이지를 교체한다."
                  : "FIFO: 가장 먼저 들어온 페이지를 교체한다(참조 여부와 무관).") +
            ` ${otherBasis(r)}`,
          summary: "성능: OPT(구현 불가) > LRU > Clock(LRU 근사) > FIFO",
        };
        return q;
      }
      // trace: 프레임 행 3개 + F 행. 처음 다 찬 이후 구간에서 4~6칸을 비운다.
      const full = r.steps.findIndex((s) => s.frames.every((f) => f !== null));
      const candidates: [number, number][] = [];
      for (let c = full + 1; c < refs.length; c++)
        for (let row = 0; row < 4; row++) candidates.push([row, c]);
      const blanks = new Set(
        rng.sample(candidates, rng.int(4, 6)).map(([row, c]) => `${row}:${c}`),
      );
      if (![...blanks].some((k) => k.startsWith("3:"))) continue; // F 행 빈칸 최소 1개
      const rows = [0, 1, 2].map((fi) => ({
        label: `프레임 ${fi + 1}`,
        cells: r.steps.map((s, c): TraceCell => {
          const v = s.frames[fi];
          return {
            value: v === null ? "" : String(v),
            ...(blanks.has(`${fi}:${c}`) ? { blank: true } : {}),
          };
        }),
      }));
      rows.push({
        label: "F",
        cells: r.steps.map((s, c): TraceCell => ({
          value: s.fault ? "F" : "-",
          ...(blanks.has(`3:${c}`) ? { blank: true, options: ["F", "-"] } : {}),
        })),
      });
      const q: TraceQ = {
        ...base,
        type: "trace",
        prompt: `프레임 3개, 참조열 \`${refText}\`에 대한 **${ALGO_LABEL[algo]}** 진행 표의 빈칸을 채우시오(F가 아니면 -). ${rule}`,
        columns: refs.map(String),
        rows,
        explanation: `${ALGO_LABEL[algo]}의 F는 총 ${r.faults}번. ${otherBasis(r)} 빈 프레임은 위부터 채우고, 교체 시 ${
          algo === "fifo"
            ? "가장 먼저 들어온"
            : algo === "lru"
              ? "가장 오래전에 참조된"
              : "앞으로 가장 오래 참조되지 않을"
        } 페이지를 뺀다.`,
      };
      return q;
    }
  },
};

// ------------------------------------------------------------------ Process switch / 상태 전이
type SwitchParams = { variant: "cause" | "transition" };

export const processSwitchGen: Generator<SwitchParams> = {
  name: "process-switch",
  chapter: "ch03",
  topic: "Process switch 5가지 경우",
  description: "시나리오 문장을 Process switch 원인 5가지 또는 상태 전이로 분류",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant = params.variant ?? rng.pick(["cause", "transition"] as const);
    if (variant === "cause") {
      const picked = rng.shuffle(SWITCH_CAUSES.map((c) => rng.pick(scenariosByCause(c))));
      const q: ClassifyQ = {
        ...baseOf(
          "process-switch",
          {
            chapter: "ch03",
            topic: "Process switch 5가지 경우",
            slideRef: "Ch03 p.41-42",
            exam: true,
            examBasis: "handwritten",
          },
          seed,
          { variant },
          2,
        ),
        type: "classify",
        prompt: "각 상황에서 Process switch를 일으키는 원인을 고르시오.",
        buckets: [...SWITCH_CAUSES],
        items: picked.map((s) => ({ label: s.text, bucket: s.cause })),
        explanation:
          "Clock interrupt = 타임슬라이스 소진·sleep 시간 경과, I/O interrupt = 기다리던 데이터 도착, I/O 함수 호출 = scanf·fread·recv 등 시스템 콜(데이터가 없으면 Blocked), Trap = Segment fault·Illegal instruction(종료), Memory fault = 필요한 페이지가 메모리에 없음(디스크 읽기 요청 후 Blocked).",
        summary: "Process switch 5가지: Clock / I/O interrupt / I/O 호출 / Trap / Memory fault",
      };
      return q;
    }
    const picked = rng.sample(SCENARIOS, 5);
    const q: ClassifyQ = {
      ...baseOf(
        "process-switch",
        {
          chapter: "ch03",
          topic: "5-상태 모델 + 상태 전이도",
          slideRef: "Ch03 p.12-13",
          exam: true,
          examBasis: "handwritten",
        },
        seed,
        { variant },
        2,
      ),
      type: "classify",
      prompt: "각 상황이 일으키는 프로세스 상태 전이를 고르시오.",
      buckets: [...TRANSITIONS],
      items: picked.map((s) => ({ label: s.text, bucket: s.transition })),
      explanation:
        "Running→Ready = Clock interrupt(타임슬라이스 소진), Running→Blocked = I/O 함수 호출 또는 Memory fault, Blocked→Ready = I/O interrupt(기다리던 데이터 도착), Running→Exit = 정상 종료 또는 Trap.",
      summary:
        "Running→Ready: Clock / Running→Blocked: I/O 호출·Memory fault / Blocked→Ready: I/O interrupt / Running→Exit: Trap",
    };
    return q;
  },
};

// ------------------------------------------------------------------ 메모리 용량
type CapParams = { variant: "entries" | "tableKB" | "pagesForTable" | "inverted" };

export const memoryCapacityGen: Generator<CapParams> = {
  name: "memory-capacity",
  chapter: "ch08",
  topic: "2단계 페이지 테이블 계산",
  description:
    "주소공간·페이지 크기·엔트리 크기로 페이지 수·페이지 테이블 크기·필요한 페이지 수, 역 페이지 테이블 엔트리 수",
  generate(seed, params = {}) {
    const rng = createRng(seed);
    const variant =
      params.variant ?? rng.pick(["entries", "tableKB", "pagesForTable", "inverted"] as const);
    const kb = (n: number) => (n >= 1024 ? `${n / 1024}MB` : `${n}KB`);
    if (variant === "inverted") {
      const ramGB = rng.pick([1, 2, 4, 8]);
      const frameKB = rng.pick([1, 2, 4, 8]);
      const answer = invertedEntries(ramGB * GB, frameKB * KB);
      const q: CalcQ = {
        ...baseOf(
          "memory-capacity",
          { chapter: "ch08", topic: "역 페이지 테이블", slideRef: "Ch08 p.15-17", exam: false },
          seed,
          { variant },
          1,
        ),
        type: "calc",
        prompt: `실제 메모리 ${ramGB}GB, 프레임 크기 ${frameKB}KB일 때 **역 페이지 테이블(Inverted Page Table)의 엔트리 수**는?`,
        answer,
        tolerance: 0,
        unit: "개",
        steps: [
          `프레임 수 = ${ramGB}GB / ${frameKB}KB = 2^${Math.log2(ramGB * GB)} / 2^${Math.log2(frameKB * KB)} = ${fmt(answer)}`,
          "엔트리는 프레임마다 하나(프레임 번호가 인덱스)",
        ],
        explanation:
          "역 페이지 테이블은 가상 페이지가 아니라 실제 메모리 프레임마다 엔트리가 하나라서, 크기가 프로세스 주소공간이 아니라 RAM 크기에 비례한다.",
      };
      return q;
    }
    const bits = rng.pick([30, 32, 32, 34]);
    const pageKB = rng.pick([1, 2, 4, 4, 8]);
    const entry = rng.pick([4, 4, 8]);
    const info = pageTableInfo(bits, pageKB * KB, entry);
    const setup = `${bits}비트 가상 주소공간, 페이지 크기 ${pageKB}KB, 페이지 테이블 엔트리 ${entry}바이트일 때`;
    const steps = [
      `페이지 수 = 2^${bits} / 2^${info.offsetBits} = 2^${info.pageBits} = ${fmt(info.pages)}`,
      `페이지 테이블 크기 = ${fmt(info.pages)} × ${entry}B = ${kb(info.tableBytes / KB)}`,
      `테이블을 담는 페이지 수 = ${kb(info.tableBytes / KB)} / ${pageKB}KB = ${fmt(info.pagesForTable)}`,
    ];
    const ask = {
      entries: { text: "**페이지 테이블 엔트리 수**(= 페이지 수)", answer: info.pages, unit: "개" },
      tableKB: {
        text: "**페이지 테이블 크기**(KB 단위)",
        answer: info.tableBytes / KB,
        unit: "KB",
      },
      pagesForTable: {
        text: "페이지 테이블을 담는 데 필요한 **페이지 수**",
        answer: info.pagesForTable,
        unit: "개",
      },
    }[variant];
    const q: CalcQ = {
      ...baseOf(
        "memory-capacity",
        {
          chapter: "ch08",
          topic: "2단계 페이지 테이블 계산",
          slideRef: "Ch08 p.13-14",
          exam: false,
        },
        seed,
        { variant },
        2,
      ),
      type: "calc",
      prompt: `${setup} ${ask.text}는?`,
      answer: ask.answer,
      tolerance: 0,
      unit: ask.unit,
      steps,
      explanation: `페이지 테이블(${kb(info.tableBytes / KB)})이 한 페이지(${pageKB}KB)보다 ${info.multiLevel ? "크므로 테이블 자체도 여러 페이지에 나눠 담아야 해서 **2단계(이상) 페이지 테이블**이 필요하다" : "작아 한 페이지에 들어가므로 2단계 구조가 필요 없다"}. 예: 4GB·4KB·4B → 100만 엔트리·4MB 테이블·1024페이지.`,
    };
    return q;
  },
};

/** 폴트 수 기준 규칙: 해설에 다른 기준(초기 적재 포함)의 값을 한 줄로 적는다 */
export function otherBasis(r: { faults: number; misses: number }): string {
  return `초기 적재까지 포함하면 ${r.misses}회(초기 적재 ${r.misses - r.faults}회 + F ${r.faults}회).`;
}

/** os 과목 생성기 맵 — data/subjects/os/index.ts의 loadGenerators가 동적 import로 가져간다 */
export const OS_GENERATORS: GeneratorMap = Object.fromEntries(
  [
    pagingGen,
    segmentationGen,
    buddyGen,
    placementGen,
    cpuTimeGen,
    replacementGen,
    processSwitchGen,
    memoryCapacityGen,
  ].map((g) => [g.name, g as unknown as Generator]),
);

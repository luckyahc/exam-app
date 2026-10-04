/**
 * 버디 시스템 (Ch07 p.20-24, 원본 §6-3).
 *
 * 내부적으로 **분할 트리**를 유지한다(Ch07 p.24 Figure 7.7, 필기 "트리구조를 내부적으로 가지고 있어야 합병 가능").
 * 병합은 "같은 분할에서 나온 buddy 쌍이 둘 다 쪼개지지 않은 채 free"일 때만 일어난다 — 단순히 인접한
 * free 블록끼리 합치면 틀린다(p.23 Release A: A의 buddy가 C+64K로 쪼개져 있어 둘 다 비어도 병합 불가).
 *
 * 크기 단위는 호출자가 정한다(슬라이드는 K). 상태는 불변 — 연산마다 새 트리를 돌려준다.
 */

export type BuddyNode =
  | { kind: "free"; start: number; size: number }
  | { kind: "alloc"; start: number; size: number; name: string; requested: number }
  | { kind: "split"; start: number; size: number; left: BuddyNode; right: BuddyNode };

export interface BuddyOptions {
  /** 분할 후 할당할 쪽. 슬라이드 규칙은 왼쪽(기본값). 오답 보기 생성용으로만 바꾼다 */
  allocate?: "left" | "right";
  /** 반납 시 buddy 병합 여부. 슬라이드 규칙은 병합(기본값). 오답 보기 생성용으로만 끈다 */
  merge?: boolean;
}

export function createBuddy(total: number): BuddyNode {
  if (!Number.isInteger(Math.log2(total))) throw new RangeError("전체 크기는 2의 거듭제곱");
  return { kind: "free", start: 0, size: total };
}

/** 요청을 수용하는 가장 작은 2^k (예: 100 → 128, 40 → 64) */
export function roundUpPow2(n: number): number {
  if (n <= 0) throw new RangeError("요청 크기는 양수");
  return 2 ** Math.ceil(Math.log2(n));
}

function freeLeaves(node: BuddyNode): Extract<BuddyNode, { kind: "free" }>[] {
  if (node.kind === "free") return [node];
  if (node.kind === "split") return [...freeLeaves(node.left), ...freeLeaves(node.right)];
  return [];
}

/** 크기 target을 왼쪽(또는 오른쪽)부터 쪼개 내려가며 할당한 새 노드 */
function carve(
  start: number,
  size: number,
  target: number,
  name: string,
  requested: number,
  side: "left" | "right",
): BuddyNode {
  if (size === target) return { kind: "alloc", start, size, name, requested };
  const half = size / 2;
  const leftStart = start;
  const rightStart = start + half;
  if (side === "left") {
    return {
      kind: "split",
      start,
      size,
      left: carve(leftStart, half, target, name, requested, side),
      right: { kind: "free", start: rightStart, size: half },
    };
  }
  return {
    kind: "split",
    start,
    size,
    left: { kind: "free", start: leftStart, size: half },
    right: carve(rightStart, half, target, name, requested, side),
  };
}

function replaceAt(node: BuddyNode, start: number, size: number, next: BuddyNode): BuddyNode {
  if (node.start === start && node.size === size) return next;
  if (node.kind !== "split") return node;
  const inLeft = start < node.left.start + node.left.size;
  return inLeft
    ? { ...node, left: replaceAt(node.left, start, size, next) }
    : { ...node, right: replaceAt(node.right, start, size, next) };
}

export type RequestResult =
  | {
      ok: true;
      state: BuddyNode;
      block: { start: number; size: number };
      internalFragmentation: number;
    }
  | { ok: false; state: BuddyNode };

/**
 * 할당: 요청을 2^k로 올림 → 그 크기 이상인 free 블록 중 **가장 작은 크기**, 같은 크기면 **가장 낮은 주소**를 골라
 * 필요한 만큼 반으로 쪼개며 왼쪽 반을 할당한다. 맞는 블록이 없으면 실패.
 */
export function buddyRequest(
  state: BuddyNode,
  name: string,
  requested: number,
  opts: BuddyOptions = {},
): RequestResult {
  const target = roundUpPow2(requested);
  const candidates = freeLeaves(state)
    .filter((b) => b.size >= target)
    .sort((a, b) => a.size - b.size || a.start - b.start);
  const chosen = candidates[0];
  if (!chosen) return { ok: false, state };
  const node = carve(chosen.start, chosen.size, target, name, requested, opts.allocate ?? "left");
  const next = replaceAt(state, chosen.start, chosen.size, node);
  const block = findAlloc(next, name)!;
  return {
    ok: true,
    state: next,
    block: { start: block.start, size: block.size },
    internalFragmentation: target - requested,
  };
}

function findAlloc(node: BuddyNode, name: string): Extract<BuddyNode, { kind: "alloc" }> | null {
  if (node.kind === "alloc") return node.name === name ? node : null;
  if (node.kind === "split") return findAlloc(node.left, name) ?? findAlloc(node.right, name);
  return null;
}

/** 반납: 블록을 free로 바꾸고, buddy(형제)가 쪼개지지 않은 free면 부모로 합치기를 위로 연쇄한다. */
export function buddyRelease(state: BuddyNode, name: string, opts: BuddyOptions = {}): BuddyNode {
  const merge = opts.merge ?? true;
  const go = (node: BuddyNode): BuddyNode => {
    if (node.kind === "alloc")
      return node.name === name ? { kind: "free", start: node.start, size: node.size } : node;
    if (node.kind !== "split") return node;
    const left = go(node.left);
    const right = go(node.right);
    if (merge && left.kind === "free" && right.kind === "free")
      return { kind: "free", start: node.start, size: node.size };
    return { ...node, left, right };
  };
  if (!findAlloc(state, name)) throw new Error(`할당되지 않은 블록: ${name}`);
  return go(state);
}

export interface BlockView {
  start: number;
  size: number;
  name: string | null;
}

/** 주소 순서의 잎 블록 목록(표의 한 행) */
export function buddyBlocks(node: BuddyNode): BlockView[] {
  if (node.kind === "split") return [...buddyBlocks(node.left), ...buddyBlocks(node.right)];
  return [{ start: node.start, size: node.size, name: node.kind === "alloc" ? node.name : null }];
}

/** 슬라이드 표기: "A=128K | 128K | B=256K | 512K" (unit 단위 숫자 뒤에 unit, 1024K 이상은 M) */
export function formatBlocks(blocks: readonly BlockView[], unit = "K"): string {
  const size = (n: number) =>
    unit === "K" && n >= 1024 && n % 1024 === 0 ? `${n / 1024}M` : `${n}${unit}`;
  return blocks.map((b) => (b.name ? `${b.name}=${size(b.size)}` : size(b.size))).join(" | ");
}

export type BuddyOp =
  { type: "request"; name: string; size: number } | { type: "release"; name: string };

export interface BuddyStep {
  op: BuddyOp;
  /** 이 연산 직후 상태 */
  state: BuddyNode;
  blocks: BlockView[];
  line: string;
  /** request 실패 시 true */
  failed?: boolean;
}

export function simulateBuddy(
  total: number,
  ops: readonly BuddyOp[],
  opts: BuddyOptions = {},
): BuddyStep[] {
  let state = createBuddy(total);
  const steps: BuddyStep[] = [];
  for (const op of ops) {
    let failed = false;
    if (op.type === "request") {
      const r = buddyRequest(state, op.name, op.size, opts);
      failed = !r.ok;
      state = r.state;
    } else {
      state = buddyRelease(state, op.name, opts);
    }
    const blocks = buddyBlocks(state);
    steps.push({ op, state, blocks, line: formatBlocks(blocks), ...(failed ? { failed } : {}) });
  }
  return steps;
}

export const opLabel = (op: BuddyOp, unit = "K") =>
  op.type === "request" ? `Request ${op.size}${unit} (${op.name})` : `Release ${op.name}`;

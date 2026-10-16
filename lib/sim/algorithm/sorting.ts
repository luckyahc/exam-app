/**
 * 알고리즘 족보 정답 검증용 시뮬레이터 — 정렬·힙·선택 (강의 자료 3·4, Sprint 21).
 * 배열 인덱스는 강의와 같이 1부터 센다(함수 안에서는 0부터 쓰고 결과만 1부터 돌려준다).
 */

/** 계수 정렬(Lec3 p.73-74): C1 = 값별 빈도, C2 = 누적 빈도(값 1..k) */
export function countingSort(a: readonly number[], k: number): { c1: number[]; c2: number[]; b: number[] } {
  const c1 = Array<number>(k).fill(0);
  for (const x of a) c1[x - 1]++;
  const c2 = c1.map((_, i) => c1.slice(0, i + 1).reduce((s, x) => s + x, 0));
  const cnt = [...c2];
  const b = Array<number>(a.length).fill(0);
  for (let j = a.length - 1; j >= 0; j--) b[--cnt[a[j] - 1]] = a[j];
  return { c1, c2, b };
}

/** 교재 partition(Lec3 p.36-39): 마지막 원소가 피벗, 작거나 같은 원소를 앞으로. 반환 = 피벗의 위치(1부터) */
export function partition(arr: number[], p: number, r: number): number {
  const x = arr[r - 1];
  let i = p - 1;
  for (let j = p; j < r; j++) {
    if (arr[j - 1] <= x) {
      i++;
      [arr[i - 1], arr[j - 1]] = [arr[j - 1], arr[i - 1]];
    }
  }
  [arr[i], arr[r - 1]] = [arr[r - 1], arr[i]];
  return i + 1;
}

/** 평균 선형 선택 select(A, p, r, i)의 첫 호출 한 단계(Lec4 p.20): k, 다음 호출(2 = 왼쪽, 3 = 오른쪽), 그때의 순위 */
export function selectStep(a: readonly number[], i: number): { k: number; call: 2 | 3 | null; nextI: number | null } {
  const arr = [...a];
  const q = partition(arr, 1, arr.length);
  const k = q;
  if (i < k) return { k, call: 2, nextI: i };
  if (i === k) return { k, call: null, nextI: null };
  return { k, call: 3, nextI: i - k };
}

/** 최소 힙 검사(인덱스 1부터): 모든 부모 ≤ 자식 */
export function isMinHeap(a: readonly number[]): boolean {
  return a.every((x, i) => i === 0 || a[Math.floor((i + 1) / 2) - 1] <= x);
}

/** 교재 buildHeap·heapify(최소 힙, M22 해설 코드): heapify가 원소를 바꿀 때마다의 배열 상태 */
export function buildHeapSteps(a: readonly number[]): number[][] {
  const arr = [...a];
  const n = arr.length;
  const steps: number[][] = [];
  const heapify = (k: number) => {
    const left = 2 * k;
    const right = 2 * k + 1;
    let smaller: number;
    if (right <= n) smaller = arr[left - 1] < arr[right - 1] ? left : right;
    else if (left <= n) smaller = left;
    else return;
    if (arr[smaller - 1] < arr[k - 1]) {
      [arr[k - 1], arr[smaller - 1]] = [arr[smaller - 1], arr[k - 1]];
      steps.push([...arr]);
      heapify(smaller);
    }
  };
  for (let i = Math.floor(n / 2); i >= 1; i--) heapify(i);
  return steps;
}

/** 힙 정렬(최소 힙 + 끝으로 보내기)의 원소 비교 횟수 — 이미 정렬된 입력에서도 n log n에 비례함을 확인 */
export function heapSortComparisons(a: readonly number[]): number {
  const arr = [...a];
  let cmp = 0;
  const heapify = (k: number, n: number) => {
    for (;;) {
      const l = 2 * k;
      const r = l + 1;
      let s = k;
      if (l <= n) {
        cmp++;
        if (arr[l - 1] < arr[s - 1]) s = l;
      }
      if (r <= n) {
        cmp++;
        if (arr[r - 1] < arr[s - 1]) s = r;
      }
      if (s === k) return;
      [arr[k - 1], arr[s - 1]] = [arr[s - 1], arr[k - 1]];
      k = s;
    }
  };
  for (let i = Math.floor(arr.length / 2); i >= 1; i--) heapify(i, arr.length);
  for (let i = arr.length; i >= 2; i--) {
    [arr[0], arr[i - 1]] = [arr[i - 1], arr[0]];
    heapify(1, i - 1);
  }
  return cmp;
}

/** 삽입 정렬 비교 횟수 */
export function insertionComparisons(a: readonly number[]): number {
  const arr = [...a];
  let cmp = 0;
  for (let j = 1; j < arr.length; j++) {
    const key = arr[j];
    let i = j - 1;
    while (i >= 0) {
      cmp++;
      if (arr[i] <= key) break;
      arr[i + 1] = arr[i];
      i--;
    }
    arr[i + 1] = key;
  }
  return cmp;
}

/** 기수 정렬(LSD, 안정 정렬, Lec3 p.70-72): 자릿수 단계마다 target의 위치(1부터) */
export function radixPositions(nums: readonly string[], target: string): number[] {
  let cur = [...nums];
  const width = nums[0].length;
  const out: number[] = [];
  for (let d = width - 1; d >= 0; d--) {
    cur = [...cur].sort((x, y) => Number(x[d]) - Number(y[d])); // Array.sort는 안정 정렬
    out.push(cur.indexOf(target) + 1);
  }
  return out;
}

/** 선형 시간 보장 선택(Lec4 p.26-35): 그룹 크기 g(홀수)일 때 중앙값 M 기준 한쪽에 반드시 남는 비율 [큰 쪽, 작은 쪽] (정수비) */
export function linearSelectRatio(g: number): [number, number] {
  // M보다 작거나 같다고 보장되는 원소 ≈ (그룹의 절반) × (그룹당 (g+1)/2개) = n(g+1)/(4g)
  const sure = g + 1; // 분모 4g 기준
  const rest = 4 * g - sure;
  const d = gcd(rest, sure);
  return [rest / d, sure / d];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** 퀵 정렬 비교 횟수(교재 partition 사용) — 정렬된 입력에서 n²/2 */
export function quickSortComparisons(a: readonly number[]): number {
  const arr = [...a];
  let cmp = 0;
  const qs = (p: number, r: number) => {
    // 재귀 깊이가 n까지 가므로 스택 대신 반복
    const stack: [number, number][] = [[p, r]];
    while (stack.length) {
      const [lo, hi] = stack.pop()!;
      if (lo >= hi) continue;
      cmp += hi - lo;
      const q = partition(arr, lo, hi);
      stack.push([lo, q - 1], [q + 1, hi]);
    }
  };
  qs(1, arr.length);
  return cmp;
}

/** 기수 정렬(LSD) 단계마다의 배열 — 해설의 단계별 배열 확인용 */
export function radixSteps(nums: readonly string[]): string[][] {
  let cur = [...nums];
  const out: string[][] = [];
  for (let d = nums[0].length - 1; d >= 0; d--) {
    cur = [...cur].sort((x, y) => Number(x[d]) - Number(y[d]));
    out.push(cur);
  }
  return out;
}

/** 병합 정렬 비교 횟수 — 정렬된 입력에서도 n log n에 비례 */
export function mergeSortComparisons(a: readonly number[]): number {
  let cmp = 0;
  const sort = (xs: number[]): number[] => {
    if (xs.length <= 1) return xs;
    const m = xs.length >> 1;
    const l = sort(xs.slice(0, m));
    const r = sort(xs.slice(m));
    const out: number[] = [];
    let i = 0;
    let j = 0;
    while (i < l.length && j < r.length) {
      cmp++;
      out.push(l[i] <= r[j] ? l[i++] : r[j++]);
    }
    return out.concat(l.slice(i), r.slice(j));
  };
  sort([...a]);
  return cmp;
}

/**
 * 순서 배치 부분점수 = 상대 순서가 맞는 항목 쌍의 비율 (켄달 타우의 일치 쌍 비율).
 * `order`는 사용자가 배치한 원래 항목 인덱스 목록이고, 정답은 0, 1, 2, … 순서다.
 * 예: [0,2,1,3] → 쌍 6개 중 (2,1)만 뒤집힘 → 5/6.
 */
export function orderScore(order: readonly number[]): number {
  const n = order.length;
  if (n < 2) return 1;
  let concordant = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) if (order[i] < order[j]) concordant++;
  }
  return concordant / ((n * (n - 1)) / 2);
}

/** 0..n-1의 순열인가 */
export function isPermutation(order: readonly number[], n: number): boolean {
  return order.length === n && new Set(order).size === n && order.every((v) => v >= 0 && v < n);
}

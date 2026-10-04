/**
 * 빈칸·표 칸 정답 비교용 정규화: 유니코드 정규화(NFKC) → 소문자 → 모든 공백 제거.
 * "지역성의 원리" = "지역성의원리", "Demand Paging" = "demandpaging".
 */
export function normalizeText(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

/** 입력이 허용 답안(한/영 표기 변형 포함) 중 하나와 같은가 */
export function matchesAny(input: string, accept: readonly string[]): boolean {
  const n = normalizeText(input);
  return n.length > 0 && accept.some((a) => normalizeText(a) === n);
}

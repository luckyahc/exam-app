/** 조건부 className 이어 붙이기 (false·null·undefined·빈 문자열은 건너뛴다) */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

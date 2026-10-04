const LEGACY_OS_ID = /^ch(02|03|07|08)-/;

/**
 * v1 문제 id(`ch08-clock-trace-001`)를 v2 형식(`os-ch08-clock-trace-001`)으로 바꾼다.
 * 이미 과목 접두사가 있거나 규칙에 맞지 않는 id는 그대로 둔다(고아 id도 지우지 않음).
 * 멱등: 두 번 적용해도 결과가 같다.
 */
export function migrateLegacyQuestionId(id: string): string {
  return LEGACY_OS_ID.test(id) ? `os-${id}` : id;
}

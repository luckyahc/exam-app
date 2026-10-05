import { shuffledIndexes } from "@/lib/random";

/**
 * 객관식·복수 선택의 **화면 표시 순서**(원래 보기 번호의 배열). 문제 id로 고정해 섞는다 — 같은 문제는 항상 같은 순서라
 * 서버/클라이언트 렌더가 일치하고, 데이터에서 정답이 앞쪽에 몰려 있어도 화면에서는 위치가 고르게 퍼진다(Sprint 11).
 * 정답·채점은 원래 번호(answerIndex·answerIndexes) 그대로다. 숫자 단축키 i는 화면의 i번째 보기를 뜻한다.
 * `shuffle: false`인 문제(다른 보기를 가리키는 보기, 주소 순서로 나열한 블록 등)는 데이터 순서 그대로 보인다.
 */
export function choiceOrder(q: { id: string; choices: readonly string[]; shuffle?: false }): number[] {
  if (q.shuffle === false) return q.choices.map((_, i) => i);
  return shuffledIndexes(q.choices.length, `${q.id}:choices`);
}

// 심리학개론 문항 작성 도우미(docs/psychology/plan.md). id 가운데 = 문항 성격:
// case(사례 적용) · compare(비교·구분) · define(정의·인물 암기) · order(순서·단계) — 선택형,
// short(단답형 = blank 한 칸, 인정 답안 여러 개), essay(서술형 = 자기 채점).

/**
 * 해설 = 정답 이유 · 오답이 틀린 이유 · 같은 장 안의 관련 개념(맥락 연결) + 끝에 근거 한 줄(psychology.test.ts가 검사).
 * 근거: "교재 표 3.1" / "교재 본문" / 부록(표준 정의)을 쓰면 "+ 보충" — "(보충)"을 문장마다 붙이지 않는다(docs/psychology/plan.md §1).
 */
export const why = (ok: string, wrong: string, link: string, basis: string) => `정답: ${ok} 오답: ${wrong} 연결: ${link}\n근거: ${basis}`;

/** ⭐ = 용어 박스·표에서 나온 문항(printed-emphasis) — 요약 한 줄 필수 */
export const star = (summary: string) => ({ exam: true, examBasis: "printed-emphasis", summary }) as const;
export const plain = { exam: false } as const;

/** 단답형: 인정 답안(교재 표기 먼저, 흔한 동의어 함께). 채점은 공백·대소문자 무시 */
export const short = (...accept: string[]) => ({ type: "blank" as const, text: "답: {{0}}", blanks: [{ accept }] });

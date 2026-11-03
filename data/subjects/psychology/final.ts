// 심리학개론 기말(CHAPTER 09·10) 공통 — 원천자료 docs/psychology/summary-notes-final.pdf(로컬 전용) 하단 쪽 번호 1~5.
// 종이시험 형식: 5지선다(mcq, 보기 5개) 70% · 단답형(blank) 30%. id 가운데 = identify(개념 식별) · judge(설명 판단) · link(학자·연구 연결) · short(단답).
// 용어는 교재 제7장 표기(docs/psychology/_old/source-ch04-07.md 표 7.1~7.3, PDF 끝 "용어 수정 내역").

/** 해설 = 정답 이유 + 오답 보기마다 1줄 + 근거 */
export const explain = (ok: string, wrongs: readonly string[], basis: string) =>
  [`정답: ${ok}`, ...(wrongs.length ? [`오답: ${wrongs.join(" / ")}`] : []), `근거: ${basis}`].join("\n");

/** ⭐ = PDF 표·빨간 굵은 용어에서 나온 문항 */
export const star = (summary: string) => ({ exam: true, examBasis: "printed-emphasis", summary }) as const;
export const plain = { exam: false } as const;

/** 단답형: 인정 답안 = 교재 표기(첫 번째) + 요약 노트 원래 표기 + 영문 */
export const short = (...accept: string[]) => ({ type: "blank" as const, text: "답: {{0}}", blanks: [{ accept }] });

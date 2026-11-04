/** 입력 부품(TextInput·SelectInput) 공통: 채점 상태별 테두리. 포커스는 빨강 대신 먹선을 2px로 굵게. */
export type FieldStatus = "correct" | "incorrect";

export const FIELD_BASE =
  "min-h-12 w-full border-[1.5px] bg-paper px-3.5 py-2.5 text-base text-sumi focus:outline-2 focus:-outline-offset-2 focus:outline-sumi";

export function fieldBorder(status?: FieldStatus) {
  return status === "correct" ? "border-ok" : status === "incorrect" ? "border-shu" : "border-sumi";
}

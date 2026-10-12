import type { JokboOccurrence } from "@/lib/qtypes/base";

// OS 족보 출처(docs/jokbo/os/inventory.md). 족보 문항은 원문 그대로 출제한다(docs/jokbo-plan.md §4) —
// 문장·보기·보기 순서(shuffle: false)·숫자를 원문과 같게, 점수 표기("(2 점, 복수선택 가능)")만 뺀다.
// 2022 시험지의 LMS 정답은 해설이 아니므로 모든 OS 족보 문항의 해설은 생성 해설(슬라이드 근거)이다.

export const OS23 = "23운영체제 중간(심재홍).pdf";
export const OS22 = "운영체제 - 심재홍 - 2022 중간 시험지.pdf";

export const y23 = (n: number): JokboOccurrence => ({ file: OS23, number: String(n), term: "2023 중간" });
export const y22 = (n: number): JokboOccurrence => ({ file: OS22, number: String(n), term: "2022 중간" });

/** 족보 문항 공통 필드. vg = variantGroup slug(`os-vg-` 뒤) */
export function jokboOf(occurrences: JokboOccurrence[], vg?: string) {
  return {
    exam: false,
    origin: "jokbo",
    jokbo: { occurrences, explanationSource: "generated", ...(vg ? { variantGroup: `os-vg-${vg}` } : {}) },
  } as const;
}

/** 고정폭 원문 블록(메모리 상태 그림·표) — 지문·보기 안에서 RichText가 CodeBlock("원문")으로 그린다 */
export const block = (...lines: string[]) => "```text\n" + lines.join("\n") + "\n```";

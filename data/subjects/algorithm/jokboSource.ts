import type { JokboOccurrence } from "@/lib/qtypes/base";

// 알고리즘 족보 출처(docs/jokbo/algorithm/inventory.md). 문항은 원문 그대로(docs/jokbo-plan.md §4) — 원본 스캔과 대조한 결과는
// docs/verification/algorithm-*.md. 점수 표기와 문제은행 태그("[07]" 등)만 뺐다.

const ZIP = "알고리즘 족보모음집.zip";
const SRC = {
  M21: { file: `${ZIP} › 원본참조/M21`, term: "2021 중간" },
  M22: { file: "2022 알고리즘 중간고사 해설(교수 직접) 1 1.pdf", term: "2022 중간" },
  M23: { file: "23년도 알고리즘(강문수).pdf", term: "2023 중간" },
  T22: { file: `${ZIP} › 원본참조/T22`, term: "2022 중간 대비 테스트" },
  S22: { file: `${ZIP} › 원본참조/S22`, term: "2022 중간 대비 특별 시험" },
  T23: { file: `${ZIP} › 원본참조/T23`, term: "2023 중간 대비 테스트" },
  F22: { file: `${ZIP} › 원본참조/F22`, term: "2022 기말 대비 테스트" },
  F23: { file: `${ZIP} › 원본참조/2023 알고리즘 기말기출.pdf`, term: "2023 기말" },
} as const;

/** "M21-3" → 출현 기록 */
export const at = (ref: string): JokboOccurrence => {
  const [k, n] = ref.split("-") as [keyof typeof SRC, string];
  return { ...SRC[k], number: n };
};

/** 족보 문항 공통 필드. source = 해설 출처(족보 해설이 있으면 "jokbo"), vg = variantGroup slug */
export function jokboOf(refs: string[], source: "jokbo" | "generated", vg?: string) {
  return {
    exam: false,
    origin: "jokbo",
    jokbo: { occurrences: refs.map(at), explanationSource: source, ...(vg ? { variantGroup: `algorithm-vg-${vg}` } : {}) },
  } as const;
}

/** 고정폭 원문 블록(코드·표·배열) */
export const block = (...lines: string[]) => "```text\n" + lines.join("\n") + "\n```";

/** 그림(원본 스캔에서 자른 그래프) */
export const figureOf = (id: string, alt: string, width: number, height: number) => ({ figure: { src: `/jokbo/algorithm/${id}.png`, alt, width, height } });

export const N_INPUTS = block(
  "1. 입력 중 100개에 대해 알고리즘은 n log n 에 비례하는 시간이 든다.",
  "2. 입력 중 100개에 대해 알고리즘은 log n 에 비례하는 시간이 든다.",
  "3. 이외의 모든 입력에 대해 알고리즘은 n에 비례하는 시간이 든다.",
);
export const N_HEAD = "어떤 알고리즘의 크기 n인 모든 가능한 입력의 수는 n!이다. 충분히 큰 n에 대해 항상 다음의 성질이 성립한다.";

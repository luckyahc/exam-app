/**
 * 운영체제 시험 힌트(교수님 공식, docs/os-exam-hint.md)의 세부 항목과 문항 연결.
 * - 힌트 항목에 연결된 문항은 ⭐(exam: true)이 된다. 이미 handwritten ⭐인 문항은 근거를 그대로 두고 hintIds만 붙는다.
 * - 연결은 이 파일 한곳에서 관리한다(문항 파일의 exam·examBasis를 일일이 고치지 않는다) — 챕터 load가 applyHints로 적용
 * - 새로 만든 문항은 문항 객체에 hintIds를 직접 적어도 된다(두 곳에 적으면 합친다)
 */

export interface HintItem {
  id: string;
  chapter: "ch02" | "ch03" | "ch07" | "ch08";
  title: string;
  /** 근거 슬라이드 */
  slideRef: string;
  /** 순서가 핵심 → order 2개 이상 */
  needsOrder?: boolean;
  /** 구성요소·대응이 핵심 → match 2개 이상 */
  needsMatch?: boolean;
}

export const HINT_ITEMS: readonly HintItem[] = [
  { id: "2-1", chapter: "ch02", title: "운영체제의 목적(목표)", slideRef: "Ch02 p.2-3, p.9" },
  { id: "2-2", chapter: "ch02", title: "운영체제가 제공하는 서비스", slideRef: "Ch02 p.5-6", needsMatch: true },
  { id: "2-3", chapter: "ch02", title: "커널", slideRef: "Ch02 p.10-11" },
  { id: "2-4", chapter: "ch02", title: "커널 함수의 호출 시점", slideRef: "Ch02 p.11" },
  { id: "2-5", chapter: "ch02", title: "Multiprogrammed vs Time Sharing: 시스템의 목적·특징", slideRef: "Ch02 p.13-14, p.18, p.20-21", needsMatch: true },
  { id: "2-6", chapter: "ch02", title: "Multiprogrammed vs Time Sharing: process switch(CPU 양도) 발생 시점", slideRef: "Ch02 p.14, p.20", needsMatch: true },
  { id: "2-7", chapter: "ch02", title: "Multiprogrammed vs Time Sharing: processor utilization 차이", slideRef: "Ch02 p.21, p.24", needsMatch: true },
  { id: "2-8", chapter: "ch02", title: "Multiprogrammed vs Time Sharing: response time 차이", slideRef: "Ch02 p.21, p.23-24", needsMatch: true },
  { id: "2-9", chapter: "ch02", title: "processor utilization 계산", slideRef: "Ch02 p.21, p.24" },
  { id: "2-10", chapter: "ch02", title: "response time 계산", slideRef: "Ch02 p.21-23" },

  { id: "3-1", chapter: "ch03", title: "프로세스 전반의 특징(정의)", slideRef: "Ch03 p.2" },
  { id: "3-2", chapter: "ch03", title: "프로세스의 기능(생성·종료·스케줄링·실행 모드)", slideRef: "Ch03 p.3-4, p.7, p.15-16, p.36-37" },
  { id: "3-3", chapter: "ch03", title: "프로세스 상태 종류", slideRef: "Ch03 p.12, p.20" },
  { id: "3-4", chapter: "ch03", title: "프로세스 상태 변화도와 상태가 변하는 시점", slideRef: "Ch03 p.12-14, p.20-21", needsOrder: true, needsMatch: true },
  { id: "3-5", chapter: "ch03", title: "프로세스 image의 구성요소", slideRef: "Ch03 p.22-26", needsMatch: true },
  { id: "3-6", chapter: "ch03", title: "프로세스 image 구성요소별 저장 내용", slideRef: "Ch03 p.22-25", needsMatch: true },
  { id: "3-7", chapter: "ch03", title: "PCB(process control block)의 구성요소와 저장 내용", slideRef: "Ch03 p.5-7, p.26-31", needsMatch: true },
  { id: "3-8", chapter: "ch03", title: "Process switch 발생 시점", slideRef: "Ch03 p.40-42", needsMatch: true },
  { id: "3-9", chapter: "ch03", title: "Process switch와 상태 변화도의 관계", slideRef: "Ch03 p.13, p.40-45", needsMatch: true },
  { id: "3-10", chapter: "ch03", title: "Interrupt 처리 전 과정의 순서", slideRef: "Ch03 p.38-39", needsOrder: true },
  { id: "3-11", chapter: "ch03", title: "Interrupt 처리 과정별 하는 일", slideRef: "Ch03 p.38-40", needsMatch: true },

  { id: "7-1", chapter: "ch07", title: "Relocation(재배치)의 의미와 발생 시점·예시", slideRef: "Ch07 p.4-5, p.25", needsMatch: true },
  { id: "7-2", chapter: "ch07", title: "Protection(보호)의 의미와 발생 시점·예시", slideRef: "Ch07 p.6-7", needsMatch: true },
  { id: "7-3", chapter: "ch07", title: "Sharing(공유)의 의미와 예시", slideRef: "Ch07 p.8", needsMatch: true },
  { id: "7-4", chapter: "ch07", title: "Fixed partitioning(고정 분할)", slideRef: "Ch07 p.11-13" },
  { id: "7-5", chapter: "ch07", title: "Dynamic partitioning(동적 분할)", slideRef: "Ch07 p.11, p.14-15" },
  { id: "7-6", chapter: "ch07", title: "동적 메모리 할당(배치) 알고리즘에 의한 할당", slideRef: "Ch07 p.16-20", needsMatch: true },
  { id: "7-7", chapter: "ch07", title: "Buddy system에 의한 메모리 할당", slideRef: "Ch07 p.21-24" },
  { id: "7-8", chapter: "ch07", title: "Buddy system에 의한 메모리 반납", slideRef: "Ch07 p.21-24" },
  { id: "7-9", chapter: "ch07", title: "basic paging system", slideRef: "Ch07 p.27-31" },
  { id: "7-10", chapter: "ch07", title: "가상(논리)주소와 실제주소 변환", slideRef: "Ch07 p.26, p.32-37, p.40-41", needsOrder: true },

  { id: "8-1", chapter: "ch08", title: "Real memory와 virtual memory의 공통점", slideRef: "Ch08 p.2-4", needsMatch: true },
  { id: "8-2", chapter: "ch08", title: "Real memory와 virtual memory의 차이점", slideRef: "Ch08 p.2-4", needsMatch: true },
  { id: "8-3", chapter: "ch08", title: "가상 기억장치에서 프로그램 실행 과정(page fault 전후)", slideRef: "Ch08 p.5-6, p.24", needsOrder: true },
  { id: "8-4", chapter: "ch08", title: "지역성의 원리", slideRef: "Ch08 p.7-8" },
  { id: "8-5", chapter: "ch08", title: "TLB 작동 순서", slideRef: "Ch08 p.19-24", needsOrder: true },
  { id: "8-6", chapter: "ch08", title: "Thrashing", slideRef: "Ch08 p.29, p.60-62", needsOrder: true },
  { id: "8-7", chapter: "ch08", title: "가상 기억장치의 정책들", slideRef: "Ch08 p.38-61", needsMatch: true },
  { id: "8-8", chapter: "ch08", title: "Frame locking", slideRef: "Ch08 p.42" },
  { id: "8-9", chapter: "ch08", title: "페이지 교체 알고리즘", slideRef: "Ch08 p.43-53" },
];

const rng = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}-${String(from + i).padStart(3, "0")}`);

/** 힌트 항목 → 기존 문항 id(접두 `os-` 생략). 새 문항은 문항 객체의 hintIds로 단다 */
const LINKS: Record<string, readonly string[]> = {
  "2-1": [...rng("ch02-os-goal", 1, 4), ...rng("ch02-evolve", 1, 3)],
  "2-2": [...rng("ch02-os-service", 1, 3), ...rng("ch02-not-supported", 1, 8)],
  "2-3": [...rng("ch02-kernel", 1, 3)],
  "2-4": [...rng("ch02-kernel-call", 1, 2)],
  "2-5": ["ch02-history-001", "ch02-history-002", "ch02-uniprog-001", "ch02-uniprog-003", "ch02-time-calc-009", "ch02-time-calc-012"],
  "2-6": [...rng("ch02-batch-switch", 1, 4)],
  "2-7": ["ch02-time-calc-009", "ch02-time-calc-010", "ch02-time-calc-011", "ch02-time-calc-012", "ch02-time-calc-013"],
  "2-8": ["ch02-time-calc-008", "ch02-time-calc-009", "ch02-time-calc-012", "ch02-time-calc-013", "ch02-time-calc-014"],
  "2-9": ["ch02-time-calc-003", "ch02-time-calc-004", "ch02-time-calc-007", "ch02-time-calc-010"],
  "2-10": ["ch02-time-calc-001", "ch02-time-calc-002", "ch02-time-calc-005", "ch02-time-calc-006", "ch02-time-calc-008", "ch02-time-calc-014"],

  "3-1": [...rng("ch03-process-def", 1, 8)],
  "3-2": [...rng("ch03-creation", 1, 3), ...rng("ch03-termination", 1, 10), ...rng("ch03-create-steps", 1, 2), ...rng("ch03-scheduler", 1, 5), ...rng("ch03-mode", 1, 3)],
  "3-3": ["ch03-state-002", "ch03-state-006", "ch03-state-010", "ch03-suspend-001", "ch03-suspend-003", "ch03-suspend-004", "ch03-suspend-005", "ch03-suspend-006", "ch03-suspend-007"],
  "3-4": ["ch03-state-001", "ch03-state-003", "ch03-state-004", "ch03-state-005", "ch03-state-007", "ch03-state-008", "ch03-state-009", "ch03-suspend-002", "ch03-suspend-008", ...rng("ch03-wait-event", 1, 4)],
  "3-5": ["ch03-image-001", "ch03-image-003", "ch03-image-005", "ch03-stack-006", "ch03-pcb-001"],
  "3-6": ["ch03-image-002", "ch03-image-003", "ch03-image-004", ...rng("ch03-stack", 1, 5), "ch03-stack-007", "ch03-stack-008"],
  "3-7": [...rng("ch03-pcb", 1, 4), ...rng("ch03-context", 1, 3)],
  "3-8": [...rng("ch03-process-switch", 1, 10)],
  "3-9": ["ch03-process-switch-005", "ch03-process-switch-006", "ch03-process-switch-007", "ch03-process-switch-008", "ch03-interrupt-009", "ch03-scheduler-004", ...rng("ch03-resume", 1, 3)],
  "3-10": [...rng("ch03-interrupt", 1, 4)],
  "3-11": ["ch03-interrupt-003", "ch03-interrupt-005", "ch03-interrupt-006", "ch03-interrupt-007", "ch03-interrupt-008", "ch03-scheduler-003"],

  "7-1": [...rng("ch07-relocation", 1, 5), "ch07-requirement-002", "ch07-protection-005"],
  "7-2": [...rng("ch07-protection", 1, 6), "ch07-requirement-002"],
  "7-3": [...rng("ch07-sharing", 1, 6), "ch07-requirement-002"],
  "7-4": ["ch07-partition-001", "ch07-partition-002", "ch07-partition-005", "ch07-partition-007"],
  "7-5": ["ch07-partition-001", "ch07-partition-003", "ch07-partition-004", "ch07-partition-006"],
  "7-6": [...rng("ch07-placement", 1, 8), "ch07-gen-placement-1", "ch07-gen-placement-2"],
  "7-7": ["ch07-buddy-001", "ch07-buddy-002", "ch07-buddy-004", "ch07-buddy-006", "ch07-gen-buddy-1"],
  "7-8": ["ch07-buddy-001", "ch07-buddy-003", "ch07-buddy-005", "ch07-buddy-007", "ch07-buddy-008", "ch07-gen-buddy-2"],
  "7-9": [...rng("ch07-paging-basic", 1, 6), "ch07-bit-slice-004"],
  "7-10": [...rng("ch07-translation", 1, 8), "ch07-gen-paging-1", "ch07-gen-paging-2", "ch07-bit-slice-001", "ch07-bit-slice-003", "ch07-bit-slice-005", ...rng("ch07-address", 1, 4), "ch07-segmentation-001", "ch07-segmentation-003", "ch07-segmentation-008", "ch07-gen-segmentation-1"],

  "8-1": ["ch08-virtual-001", "ch08-virtual-004"],
  "8-2": ["ch08-virtual-001", "ch08-virtual-002", "ch08-virtual-003"],
  "8-3": [...rng("ch08-page-fault", 1, 9), "ch08-tlb-002", "ch08-tlb-010"],
  "8-4": [...rng("ch08-locality", 1, 7)],
  "8-5": [...rng("ch08-tlb", 1, 10), "ch08-tlb-cache-002"],
  "8-6": [...rng("ch08-thrashing", 1, 10)],
  "8-7": ["ch08-policy-001", ...rng("ch08-fetch", 1, 9), ...rng("ch08-placement-policy", 1, 3), ...rng("ch08-replacement-policy", 1, 3), ...rng("ch08-resident-set", 1, 5), ...rng("ch08-cleaning", 1, 4), ...rng("ch08-page-buffering", 1, 2)],
  "8-8": [...rng("ch08-lock", 1, 4), "ch08-pte-001"],
  "8-9": [...rng("ch08-replacement", 1, 8), "ch08-gen-replacement-2", "ch08-gen-replacement-3", ...rng("ch08-clock", 1, 6), ...rng("ch08-lfu", 1, 4), ...rng("ch08-enhanced-clock", 1, 5)],
};

/** 문항 id(전체) → 힌트 항목 id 목록 */
export const HINT_LINKS: ReadonlyMap<string, readonly string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const [hint, ids] of Object.entries(LINKS)) for (const id of ids) m.set(`os-${id}`, [...(m.get(`os-${id}`) ?? []), hint]);
  return m;
})();

/**
 * 챕터 load에서 쓴다: 연결된 문항을 ⭐로(근거가 없으면 exam-hint), hintIds를 붙인다.
 * Question 타입을 import하지 않는다 — 과목 레지스트리(index.ts)가 이 파일을 쓰므로 타입이 순환하지 않게
 */
export function applyHints<T extends { id: string; exam: boolean; examBasis?: string; hintIds?: string[] }>(qs: readonly T[]): T[] {
  return qs.map((q) => {
    const ids = [...new Set([...(q.hintIds ?? []), ...(HINT_LINKS.get(q.id) ?? [])])];
    if (!ids.length) return q;
    return { ...q, hintIds: ids, exam: true, examBasis: q.exam && q.examBasis ? q.examBasis : "exam-hint" };
  });
}

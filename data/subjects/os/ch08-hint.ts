import type { Question } from "@/types/question";

// Ch08 시험 힌트 보강(docs/os-exam-hint.md) — 근거: source/os/Ch08 Virtual Memory.pdf(인쇄 + 교수님 필기)
// 힌트 항목: 8-1·8-2 Real vs virtual memory, 8-6 thrashing, 8-8 frame locking

const base = { subject: "os", chapter: "ch08" } as const;
const hint = (...hintIds: string[]) => ({ exam: true, examBasis: "exam-hint", hintIds }) as const;

const questions: readonly Question[] = [
  // ───────────────────────────── 8-1·8-2 Real memory vs Virtual memory (p.2-4)
  {
    ...base,
    ...hint("8-1", "8-2"),
    id: "os-ch08-hint-virtual-001",
    topic: "실제 메모리 vs 가상 메모리",
    type: "match",
    difficulty: 1,
    slideRef: "Ch08 p.3-4",
    prompt: "메모리 시스템과 프로세스 실행 조건을 짝지으시오.",
    pairs: [
      { left: "Real memory system(예: 스마트폰)", right: "프로세스 전체가 메모리에 로드되어야 실행 가능" },
      { left: "Virtual memory system(예: Windows & UNIX)", right: "프로세스의 일부분만 메모리에 로드되어도 실행 가능, 나머지는 디스크에 존재" },
    ],
    distractors: ["프로세스가 메모리에 연속적으로 배치되어야만 실행 가능"],
    explanation: "p.3: 실제 메모리(스마트폰) — 프로세스는 page 또는 segment 단위로 분할되고, 프로세스 전체가 메모리에 로드되어야 실행 가능(필기: 스마트폰은 virtual memory system이 아니라 메인메모리에 전부 들어가야 실행). p.4: 가상 메모리(Windows & UNIX) — 프로세스의 일부분만 메모리에 로드되어도 실행 가능하고 나머지는 디스크에 있다가 필요할 때 가져온다. 두 시스템 모두 연속 배치는 필요 없다.",
  },
  {
    ...base,
    ...hint("8-1"),
    id: "os-ch08-hint-virtual-002",
    topic: "실제 메모리 vs 가상 메모리",
    type: "match",
    difficulty: 2,
    slideRef: "Ch08 p.3-4",
    prompt: "Real memory와 virtual memory의 **공통점**(가상 메모리가 Real Memory의 기능을 그대로 활용하는 것)과 설명을 짝지으시오.",
    pairs: [
      { left: "MMU 장치의 HW적 주소변환", right: "논리주소 → 실제주소 변환" },
      { left: "메모리 분할 방식", right: "Paging system 또는 Segmentation system을 그대로 사용" },
      { left: "배치 방식", right: "프로세스가 메모리에 연속적으로 배치될 필요 없음(비연속 배치)" },
    ],
    explanation: "p.3: 실제 메모리에서 프로세스는 page 또는 segment 단위로 분할되어 비연속적으로 배치되고, MMU가 HW적으로 주소를 변환한다(논리주소 → 실제주소). p.4: 가상 메모리는 이 Real Memory의 기능을 활용한다 — Paging system 또는 Segmentation system 그대로 사용, MMU 장치에서 HW적 주소변환, 프로세스가 메모리에 연속적으로 배치될 필요 없음.",
  },
  {
    ...base,
    ...hint("8-2"),
    id: "os-ch08-hint-virtual-003",
    topic: "실제 메모리 vs 가상 메모리",
    type: "match",
    difficulty: 2,
    slideRef: "Ch08 p.4",
    prompt: "가상 메모리 시스템이 실제 메모리 시스템과 **다른 점**과 그 결과를 짝지으시오.",
    pairs: [
      { left: "장시간 사용되지 않는 페이지는 디스크로 빼냄", right: "그만큼 생긴 메모리 공간에 다음에 실행할 명령어들을 깔아 놓음" },
      { left: "프로세스의 일부분만 메모리에 로드", right: "메모리보다 더 큰 프로그램 실행, 더 많은 프로세스 실행(multiprogramming)" },
      { left: "더 많은 프로세스를 실행", right: "CPU를 더 많이 활용 → CPU 이용률 향상" },
    ],
    explanation: "p.4: 가상 메모리는 프로세스의 일부분만 로드되어도 실행 가능하고, 장시간 사용되지 않는 페이지는 디스크로 빼낸다(필기: 빼내면 생긴 공간에 내 프로그램의 다음번 실행할 명령어들을 깔아 놓는다). 일부분만 로드되므로 메모리보다 더 큰 프로그램과 더 많은 프로세스를 실행할 수 있고, 프로세스가 많으면 CPU를 더 많이 활용해 CPU 이용률이 향상된다.",
  },
  {
    ...base,
    ...hint("8-1"),
    id: "os-ch08-hint-virtual-004",
    topic: "실제 메모리 vs 가상 메모리",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch08 p.3-4",
    prompt: "빈칸에 알맞은 영어 약자를 쓰시오.",
    text: "Real memory와 virtual memory 모두 {{0}} 장치에서 HW적으로 논리주소를 실제주소로 변환한다. CPU는 논리주소만을 취급하고 실제 주소는 이 장치만 취급한다.",
    blanks: [{ accept: ["MMU", "mmu", "memory management unit", "메모리 관리 장치"] }],
    explanation: "p.3: MMU(memory management unit) 역할 — 메모리 보호, HW적으로 주소변환(논리주소 → 실제주소). CPU는 논리주소만을 취급하고 실제 주소는 MMU만 취급한다. p.4: 가상 메모리도 MMU 장치에서 HW적으로 주소변환한다.",
  },
  {
    ...base,
    ...hint("8-1"),
    id: "os-ch08-hint-virtual-005",
    topic: "실제 메모리 vs 가상 메모리",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch08 p.3-4",
    prompt: "Real memory system과 virtual memory system의 **공통점**으로 옳은 것은?",
    choices: [
      "프로세스가 메모리에 연속적으로 배치될 필요가 없다",
      "프로세스 전체가 메모리에 로드되어야 실행 가능하다",
      "장시간 사용되지 않는 페이지를 디스크로 swap out한다",
      "메모리보다 더 큰 프로그램을 실행할 수 있다",
    ],
    answerIndex: 0,
    explanation: "p.3-4: 두 시스템 모두 프로세스가 메모리에 연속적으로 배치될 필요가 없고(page·segment 단위 비연속 배치), MMU가 HW적으로 주소를 변환한다. 프로세스 전체 로드는 Real memory만의 조건이고, swap out과 메모리보다 큰 프로그램 실행은 virtual memory만의 특징이다.",
  },
  {
    ...base,
    ...hint("8-2"),
    id: "os-ch08-hint-virtual-006",
    topic: "실제 메모리 vs 가상 메모리",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch08 p.4",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "가상 메모리 시스템은 Disk swap out, swap in을 프로그램 전체가 아니라 {{0}} 단위로 수행한다.",
    blanks: [{ accept: ["페이지", "page", "Page", "페이지(page)"] }],
    explanation: "p.4: Disk swap out, swap in을 수행함(페이지 단위로 실행). p.9 필기도 디스크로 나가고 들어오는 단위는 프로그램 전체가 아닌 작은 조각(4KB) 정도라고 설명한다(Ch02 p.9).",
  },

  // ───────────────────────────── 8-6 Thrashing (p.29, p.60-61)
  {
    ...base,
    ...hint("8-6"),
    id: "os-ch08-hint-thrashing-001",
    topic: "스래싱과 부하 제어",
    type: "order",
    difficulty: 2,
    slideRef: "Ch08 p.29, p.61",
    prompt: "메모리 내에서 실행되는 프로세스 수를 조금씩 늘려 갈 때 CPU 이용률 곡선의 변화를 순서대로 배치하시오.",
    items: [
      "프로세스 수가 너무 적음: 모든 프로세스가 블록되어 CPU가 놀거나 스와핑에 시간 낭비",
      "프로세스 수 증가: CPU가 할 일이 많아 이용률이 높아짐",
      "곡선 정점: 스래싱 직전의 적정 수준(멀티프로그래밍 수준)",
      "프로세스 수가 너무 많음: 프로세스당 프레임 부족으로 스래싱, CPU 이용률 떨어짐",
    ],
    explanation: "p.29: 실행 중인 프로세스가 많아질수록 CPU 이용률이 높아지지만, 더 증가하면 프로세스당 frame 수가 줄어 page fault가 늘고 스래싱으로 이용률이 떨어진다. p.61: 너무 적으면 모든 프로세스가 블록되어 스와핑에 시간 낭비, 너무 많으면 스래싱 — 목표는 스래싱 직전의 적정 수준(곡선 정점) 유지.",
  },

  // ───────────────────────────── 8-8 Frame locking (p.42)
  {
    ...base,
    ...hint("8-8"),
    id: "os-ch08-hint-lock-001",
    topic: "프레임 잠금",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch08 p.42",
    prompt: "**프레임 잠금(Frame Locking)**에 대한 설명으로 옳은 것은?",
    choices: [
      "디스크로 swap out 되지 않도록 중요한 페이지들을 프레임에 고정시켜, 잠긴 프레임은 교체될 수 없다",
      "가장 오랫동안 참조되지 않은 페이지를 골라 교체한다",
      "페이지가 참조될 때만 디스크에서 주 메모리로 가져온다",
      "수정된 페이지를 미리 일괄적으로 디스크에 기록해 둔다",
    ],
    answerIndex: 0,
    explanation: "p.42: 프레임 잠금 — 디스크로 swap out 되지 않도록 중요한 페이지들(운영체제의 커널, 제어 구조체, I/O 버퍼)을 프레임에 고정시켜 항상 메인메모리에 상주하게 하며, 프레임이 잠겨 있으면 교체될 수 없다. 가장 오래 참조되지 않은 페이지 교체는 LRU, 참조될 때만 가져오는 것은 요구 페이징, 미리 기록은 선청소다.",
  },
];

export default questions;

import type { Question } from "@/types/question";

// Ch07 시험 힌트 보강(docs/os-exam-hint.md) — 근거: source/os/Ch07 Memory Management.pdf(인쇄 + 교수님 필기)
// 힌트 항목: 7-1~7-3 재배치·보호·공유, 7-4·7-5 고정·동적 분할, 7-6 배치 알고리즘, 7-7·7-8 버디 할당·반납

const base = { subject: "os", chapter: "ch07" } as const;
const hint = (...hintIds: string[]) => ({ exam: true, examBasis: "exam-hint", hintIds }) as const;

const questions: readonly Question[] = [
  // ───────────────────────────── 7-1~7-3 Relocation · Protection · Sharing (p.4-8)
  {
    ...base,
    ...hint("7-1"),
    id: "os-ch07-hint-relocation-001",
    topic: "재배치",
    type: "match",
    difficulty: 2,
    slideRef: "Ch07 p.4",
    prompt: "메모리 재배치(Relocation)가 일어나는 두 경우와 교수님 필기의 설명을 짝지으시오.",
    pairs: [
      { left: "Disk swap out 한 후 다시 swap in 할 때", right: "디스크의 swap 영역에 있던 프로그램을 메인메모리의 다른 빈 공간을 찾아 다시 넣음" },
      { left: "Memory compaction 때", right: "중간중간 생긴 쓰지 않는 작은 메모리 공간을 확보하려고 모든 프로그램을 메모리 앞쪽으로 옮김" },
    ],
    distractors: ["프로그램을 컴파일해 실행 파일(*.exe)을 만들 때"],
    explanation: "p.4: 재배치가 필요한 두 가지 케이스 — Disk swap out 후 다시 swap in할 때(다른 빈 공간에 들어가 프로그램이 다른 위치로 옮겨감), Memory compaction 때(작은 메모리 조각을 확보하기 위해 모든 프로그램을 메모리 앞쪽으로 옮김).",
  },
  {
    ...base,
    ...hint("7-1", "7-2", "7-3"),
    id: "os-ch07-hint-requirement-001",
    topic: "메모리 관리 요구사항",
    type: "match",
    difficulty: 2,
    slideRef: "Ch07 p.4-8",
    prompt: "메모리 관리 요구사항과 슬라이드(필기 포함)의 예시를 짝지으시오.",
    pairs: [
      { left: "Relocation(재배치)", right: "실행 중 디스크로 swap되었던 프로그램이 주기억장치의 다른 위치로 돌아옴" },
      { left: "Protection(보호)", right: "접근한 주소가 남의 주소 영역이면 MMU가 CPU에 trap interrupt를 건넴" },
      { left: "Sharing(공유)", right: "PowerPoint 10개 실행 시 프로그램 코드는 하나만 두고 데이터는 따로 가짐" },
    ],
    explanation: "p.4: 재배치 — 프로그램이 실행되는 동안 디스크로 스왑되었다가 다른 위치로 주기억장치에 다시 돌아올 수 있음. p.6: 보호 — 실행 시점에 MMU가 검사하고, 남의 주소 영역이면 MMU가 CPU에 인터럽트(trap)를 건넨다. p.8: 공유 — PowerPoint 10개 실행 시 프로그램 코드는 공유하고 데이터는 따로 가짐.",
  },
  {
    ...base,
    ...hint("7-2"),
    id: "os-ch07-hint-protection-001",
    topic: "보호 / Base·Bounds 레지스터",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.6",
    prompt: "빈칸에 알맞은 영어 약자를 쓰시오.",
    text: "실행 시점(run time)의 메모리 보호 검사는 메모리와는 별개의 하드웨어 디바이스인 {{0}}(memory management unit)가 수행한다.",
    blanks: [{ accept: ["MMU", "mmu", "memory management unit", "메모리 관리 하드웨어", "메모리 관리 장치"] }],
    explanation: "p.6: OS가 보호 정보(page table 권한, base/limit)를 설정하고, 실행 시점 메모리 보호 검사는 하드웨어(MMU, memory management unit)가 수행한다. 필기: MMU는 메모리와는 별개의, 메모리를 관리해 주는 하드웨어 디바이스.",
  },

  // ───────────────────────────── 7-4·7-5 Fixed · Dynamic partitioning (p.11-15)
  {
    ...base,
    ...hint("7-4", "7-5"),
    id: "os-ch07-hint-partition-001",
    topic: "고정 분할 / 동적 분할",
    type: "match",
    difficulty: 1,
    slideRef: "Ch07 p.11, p.13-14",
    prompt: "메모리 분할 방법과 특징을 짝지으시오.",
    pairs: [
      { left: "고정 분할(Fixed Partitioning)", right: "미리 고정된 크기로 메모리를 잘라 놓아, 작은 프로그램도 분할 하나를 통째로 차지(내부 단편화)" },
      { left: "동적 분할(Dynamic Partitioning)", right: "분할의 길이와 개수가 가변적이며, 결국 메모리에 빈 구멍이 생김(외부 단편화)" },
      { left: "버디 시스템(Buddy system)", right: "고정 분할과 동적 분할의 절충" },
    ],
    explanation: "p.11: 고정 분할(고정된 크기의 메모리를 할당), 동적 분할(동적으로 메모리 할당), 버디 시스템(고정과 동적 분할의 절충). p.13: 고정 분할은 아무리 작은 프로그램이라도 분할 하나를 통째로 차지 → 내부 단편화. p.14: 동적 분할은 분할의 길이와 개수가 가변적이고 결국 빈 구멍(외부 단편화)이 생긴다.",
  },
  {
    ...base,
    ...hint("7-4"),
    id: "os-ch07-hint-partition-002",
    topic: "고정 분할 / 동적 분할",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.13",
    prompt: "빈칸에 알맞은 영어 용어를 쓰시오.",
    text: "고정 분할에서는 아무리 작은 프로그램이라도 분할 하나를 통째로 차지해 주기억장치의 사용이 비효율적이다. 이를 내부 단편화({{0}})라 한다.",
    blanks: [{ accept: ["Internal Fragmentation", "internalfragmentation", "Internal-Fragmentation", "내부 단편화", "내부단편화", "내부 조각"] }],
    explanation: "p.13: 고정 분할은 주기억장치의 사용이 비효율적 — 아무리 작은 프로그램이라도 분할 하나를 통째로 차지하며, 이를 내부 단편화(Internal Fragmentation)라 한다(필기: 1M을 넣으면 나머지 7M는 놀고 있다, 내부 조각).",
  },
  {
    ...base,
    ...hint("7-4"),
    id: "os-ch07-hint-partition-003",
    topic: "고정 분할 / 동적 분할",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.12-13",
    prompt: "교수님 필기에 따르면 서로 다른 크기 고정 분할에서 대부분의 프로그램이 5M~8M 정도일 때 생기는 문제는?",
    choices: [
      "12M·16M 분할은 놀고 있는데도 프로그램들이 6M·8M 분할 앞에 줄서 있다가, 실행하던 프로그램이 끝나면 들어간다",
      "프로그램이 12M·16M 분할에 먼저 들어가 6M·8M 분할이 놀게 된다",
      "분할의 길이와 개수가 실행 중에 계속 바뀐다",
      "프로그램이 여러 분할에 나뉘어 비연속적으로 배치된다",
    ],
    answerIndex: 0,
    explanation: "p.12 필기: 크기별로 미리 고정해 나눠 놓았기 때문에, 대부분의 프로그램이 5M·6M·7M·8M 정도라면 12M·16M 메모리는 놀고 있음에도 여기에 넣지 않고 6M·8M 메모리에 줄서 있다가 실행하던 프로그램이 끝나면 거기에 넣는다. p.13: 메모리 관리하긴 편하지만 메모리 낭비가 심하다.",
  },
  {
    ...base,
    ...hint("7-5"),
    id: "os-ch07-hint-partition-004",
    topic: "고정 분할 / 동적 분할",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch07 p.14",
    prompt: "**동적 분할(Dynamic Partitioning)**에 대한 설명으로 옳은 것은?",
    choices: [
      "분할의 길이와 개수가 가변적이고, 프로세스는 필요한 만큼 정확히 메모리를 할당받는다",
      "미리 고정된 크기로 메모리를 잘라 놓고, 프로그램을 그중 하나에 넣는다",
      "메모리 할당을 항상 2의 거듭제곱 크기로 한다",
      "빈 구멍이 생기지 않으므로 메모리 압축(compaction)이 필요 없다",
    ],
    answerIndex: 0,
    explanation: "p.14: 동적 분할은 분할의 길이와 개수가 가변적이고 프로세스는 필요한 만큼 정확히 메모리를 할당받지만, 결국 빈 구멍(외부 단편화)이 생겨 메모리 압축(Compaction)이 필요하다(필기: java의 new, C의 malloc). 고정된 크기는 고정 분할(p.11), 2의 거듭제곱은 버디 시스템(p.21)이다.",
  },

  // ───────────────────────────── 7-6 배치 알고리즘 (p.16-19)
  {
    ...base,
    ...hint("7-6"),
    id: "os-ch07-hint-placement-001",
    topic: "배치 알고리즘",
    type: "match",
    difficulty: 2,
    slideRef: "Ch07 p.19",
    prompt: "p.19 표를 기준으로 배치 알고리즘과 특징을 짝지으시오.",
    pairs: [
      { left: "First-fit", right: "가장 실용적·빠름, 초반 '전두부 파편화' 발생 경향" },
      { left: "Next-fit", right: "first-fit의 군집화 완화 시도이나, 활용도는 약간 떨어지는 경우 많음" },
      { left: "Best-fit", right: "작은 요청이 많으면 초기에 효율적이나, 미세 조각 누적으로 장기 성능 저하 가능" },
      { left: "Worst-fit", right: "큰 블록 빨리 소모 → 대형 요청 실패 증가, 일반적으로 권장 적음" },
    ],
    explanation: "p.19 표: First-fit(가장 실용적·빠름, 초반 전두부 파편화), Next-fit(first-fit의 군집화 완화 시도, 활용도 약간 떨어짐), Best-fit(작은 요청이 많으면 초기에 효율적, 미세 조각 누적으로 장기 성능 저하), Worst-fit(큰 블록 빨리 소모 → 대형 요청 실패↑, 일반적으로 권장 적음).",
  },

  // ───────────────────────────── 7-7·7-8 Buddy 할당·반납 (p.21-24)
  {
    ...base,
    ...hint("7-7"),
    id: "os-ch07-hint-buddy-001",
    topic: "버디 시스템",
    type: "order",
    difficulty: 2,
    slideRef: "Ch07 p.21",
    prompt: "1024 bytes가 통째로 비어 있는 메모리에서 버디 알고리즘으로 **40 bytes**를 요청했을 때의 할당 과정을 순서대로 배치하시오.",
    items: [
      "40을 수용하는 가장 작은 2의 거듭제곱인 64를 할당 크기로 정함",
      "64 크기의 빈 블록이 없으므로 128, 256, 512 크기로 두 배씩 늘려 빈 블록을 찾음",
      "결국 1024 크기의 빈 블록을 찾음",
      "찾은 블록을 반으로 분할(512 | 512)하고, 왼쪽 블록을 64가 될 때까지 계속 반으로 분할",
      "64 블록을 할당",
    ],
    explanation: "p.21: 40 bytes를 요청하면 40을 수용하는 가장 작은 2의 거듭제곱인 2^6(64)가 할당된다. 64 크기의 빈 블록이 없으면 두 배인 128, 256, 512 크기의 빈 블록을 차례로 찾고, 없으면 결국 1024 크기의 빈 블록을 찾는다. 찾은 블록을 반으로 분할(512 | 512)하고 왼쪽을 64가 될 때까지 계속 반으로 분할하며 내려간다 → 64 | 64 | 128 | 256 | 512.",
  },
  {
    ...base,
    ...hint("7-8"),
    id: "os-ch07-hint-buddy-002",
    topic: "버디 시스템",
    type: "order",
    difficulty: 2,
    slideRef: "Ch07 p.22",
    prompt: "버디 알고리즘에서 메모리 블록이 **반납**될 때의 과정을 순서대로 배치하시오.",
    items: [
      "메모리 블록이 반납됨",
      "반납된 블록의 buddy가 이미 free인지, 계속 사용 중인지 확인",
      "buddy가 free이면 반납된 블록과 buddy를 하나로 합쳐(merging) 두 배의 큰 블록을 만듦",
      "합병된 큰 블록의 buddy가 또 free이면 합병 과정을 계속 진행",
    ],
    explanation: "p.22: 메모리 블록이 반납되면 우선 그 메모리의 buddy가 이미 free인지 확인하고, free라면 반납된 블록과 buddy 블록을 하나로 합쳐(메모리 합병, merging) 두 배의 큰 블록으로 만든다. 합병된 큰 블록의 buddy가 또 free라면 합병을 계속 진행한다.",
  },
  {
    ...base,
    ...hint("7-7", "7-8"),
    id: "os-ch07-hint-buddy-003",
    topic: "버디 시스템",
    type: "match",
    difficulty: 1,
    slideRef: "Ch07 p.21-22",
    prompt: "버디 알고리즘의 연산과 동작을 짝지으시오.",
    pairs: [
      { left: "메모리 할당", right: "2의 거듭제곱 크기로 맞추고, 맞는 빈 블록이 없으면 두 배 크기의 빈 블록을 반으로 분할" },
      { left: "메모리 반납", right: "buddy가 free이면 하나로 합쳐(merging) 두 배의 큰 블록으로 만듦" },
    ],
    distractors: ["빈 블록들을 메모리 앞쪽으로 옮겨 한 블록으로 모음(compaction)"],
    explanation: "p.21: 버디 할당은 2^x 크기로 하며, 맞는 빈 블록이 없으면 두 배 크기의 빈 블록을 찾아 반으로 분할해 왼쪽 반을 할당한다. p.22: 반납 시 buddy가 free이면 합병(merging)해 두 배의 큰 블록으로 만든다. p.24 필기: 버디 시스템은 메모리 컴팩션이 필요 없다.",
  },
];

export default questions;

import { baseBounds } from "@/lib/sim/os/baseBounds";
import { formatBlocks, opLabel, roundUpPow2, simulateBuddy, type BuddyOp } from "@/lib/sim/os/buddy";
import { buddyGen, pagingGen, placementGen, segmentationGen } from "@/lib/sim/os/generators";
import { KB, MB, pageTableInfo } from "@/lib/sim/os/memoryCapacity";
import { bitSplit, logicalToPhysical, physicalToLogical, solveFrame } from "@/lib/sim/os/paging";
import { chooseHole, FIT_LABEL, FITS, type Hole } from "@/lib/sim/os/placement";
import { segLogicalToPhysical, type Segment } from "@/lib/sim/os/segmentation";
import type { Question } from "@/types/question";

// Ch07 메모리 관리 — 근거: source/os/Ch07 Memory Management.pdf(41쪽), 원본 §6-1~6-4·§7, docs/coverage-matrix.md
// ⭐(handwritten): p.16 "네가지 케이스 시험", p.21 "시험", p.23 "시험. 메모리 할당하는 과정이 시험에 나옴",
//   p.34 "시험: 주소변환. 페이지 테이블이 주어지면 어떻게 주소변환이 일어나는가?"
// 계산·시뮬레이션 정답은 모두 lib/sim/os 함수로 계산한다(손으로 쓴 숫자 없음). 슬라이드 기준값과의 일치는
// data/subjects/os/ch07.test.ts가 확인한다. 생성기 문항은 {generator: name, params, seed}로 만든다.
// (보충): "물리→논리 변환은 선형 탐색이라 느리다"는 원본 §6-1의 해설 요구이고 슬라이드에는 문장으로 없다(p.35는 index를 찾는다고만 함).

const base = { subject: "os", chapter: "ch07" } as const;
const star = { exam: true, examBasis: "handwritten" } as const;
const plain = { exam: false } as const;
const fmt = (n: number) => n.toLocaleString("en-US");

// ── 슬라이드 기준값 ───────────────────────────────────────────────
/** p.34-36: 페이지 크기 1024, 페이지 테이블 {0→1, 1→2, 2→x}, x = 0 */
const P_SLIDE = 1024;
const T_SLIDE = [1, 2, 0];
/** p.32: 페이지 크기 1000(암산용), 페이지 1 → 프레임 5 */
const T_1000 = [0, 5];
/** p.33 Figure 7.11(a): 16비트 논리주소 000001|0111011110, 페이지 테이블 0→000101, 1→000110, 2→011001 */
const FIG711_LOGICAL = parseInt("0000010111011110", 2);
const FIG711_TABLE = [parseInt("000101", 2), parseInt("000110", 2), parseInt("011001", 2)];
/** p.41: 세그먼트 최대 1024, 테이블 {0:(1024,100), 1:(2048,200), 2:(x=0,150)} */
const SEG_SLIDE: Segment[] = [
  { base: 1024, length: 100 },
  { base: 2048, length: 200 },
  { base: 0, length: 150 },
];
/** p.40 Figure 7.12(b): 4비트 세그먼트 번호 + 12비트 offset(세그먼트 최대 4096) */
const FIG712_LOGICAL = parseInt("0001001011110000", 2);
const FIG712_TABLE: Segment[] = [
  { length: parseInt("001011101110", 2), base: parseInt("0000010000000000", 2) },
  { length: parseInt("011110011110", 2), base: parseInt("0010000000100000", 2) },
];
/** p.20 Figure 7.5: 16M 요청 직전의 빈 블록(위→아래 = 주소 순서). 주소값은 순서만 맞춘 내부 계산용 */
const FIG75_SIZES = [8, 12, 22, 18, 8, 6, 14, 36];
const FIG75_HOLES: Hole[] = FIG75_SIZES.reduce<Hole[]>((acc, size) => {
  const prev = acc.at(-1);
  return [...acc, { start: prev ? prev.start + prev.size + 4 : 8, size }];
}, []);
/** "Last allocated block"은 18M 블록과 두 번째 8M 블록 사이 */
const FIG75_LAST_END = FIG75_HOLES[4].start;
const FIG75 = FITS.map((fit) => {
  const { index } = chooseHole(FIG75_HOLES, 16, fit, FIG75_LAST_END);
  const hole = FIG75_HOLES[index!];
  return { fit, chosen: `${hole.size}M`, rest: `${hole.size - 16}M` };
});
/** p.23 버디 1M 전체 표 */
const P23_OPS: BuddyOp[] = [
  { type: "request", name: "A", size: 100 },
  { type: "request", name: "B", size: 240 },
  { type: "request", name: "C", size: 64 },
  { type: "request", name: "D", size: 256 },
  { type: "release", name: "B" },
  { type: "release", name: "A" },
  { type: "request", name: "E", size: 75 },
  { type: "release", name: "C" },
  { type: "release", name: "E" },
  { type: "release", name: "D" },
];
const P23 = simulateBuddy(1024, P23_OPS);
const P23_NO_MERGE = simulateBuddy(1024, P23_OPS, { merge: false });
const P23_RIGHT = simulateBuddy(1024, P23_OPS, { allocate: "right" });
/** 빈칸 칸의 드롭다운: 정답 + 흔한 오답(병합 안 함 / 오른쪽 할당 / 직전 상태) */
const p23Options = (i: number) =>
  [...new Set([P23[i].line, P23_NO_MERGE[i].line, P23_RIGHT[i].line, P23[i - 1].line])].sort();
/** p.21: 1024 빈 블록에서 40 bytes 요청 → 64 | 64 | 128 | 256 | 512 (X = 할당 블록) */
const P21_OPS: BuddyOp[] = [{ type: "request", name: "X", size: 40 }];
const P21_40 = {
  correct: formatBlocks(simulateBuddy(1024, P21_OPS).at(-1)!.blocks, "B"),
  wrong: [
    formatBlocks(simulateBuddy(1024, P21_OPS, { allocate: "right" }).at(-1)!.blocks, "B"), // 오른쪽 반 할당
    "X=40B | 984B", // 2^k로 올리지 않음
    "X=64B | 960B", // 반씩 분할하지 않고 64만 떼어 줌
  ],
};

// 주소 변환 trace: 페이지 크기 1024, 페이지 테이블 0→5, 1→2, 2→7, 3→0
const T_TRACE = [5, 2, 7, 0];
const TRACE_ADDRS = [100, 2500, 3500];
const TRACE_ROWS = TRACE_ADDRS.map((a) => logicalToPhysical(T_TRACE, 1024, a));
const BIT_ADDRS = [3, FIG711_LOGICAL, 5000];
const BIT_ROWS = BIT_ADDRS.map((a) => bitSplit(a, 16, 1024));

const p34 = logicalToPhysical(T_SLIDE, P_SLIDE, 3);
const p35 = physicalToLogical(T_SLIDE, P_SLIDE, 2050)!;
const p36x = solveFrame(2049, 1, P_SLIDE);
const p32 = logicalToPhysical(T_1000, 1000, 1179);
const fig711 = logicalToPhysical(FIG711_TABLE, 1024, FIG711_LOGICAL);
const seg41 = segLogicalToPhysical(SEG_SLIDE, 1024, 3);
const segTrap = segLogicalToPhysical(SEG_SLIDE, 1024, 120);
const fig712 = segLogicalToPhysical(FIG712_TABLE, 4096, FIG712_LOGICAL);
const bb = baseBounds(30000, 5000, 1200);
const bbTrap = baseBounds(30000, 5000, 6200);
const pages4MB = pageTableInfo(Math.log2(4 * MB), 4 * KB, 4).pages;

const questions: readonly Question[] = [
  // ───────────────────────────── 메모리 관리 요구사항 (p.2-3)
  {
    ...base,
    ...plain,
    id: "os-ch07-requirement-001",
    topic: "메모리 관리 요구사항",
    type: "multi",
    difficulty: 1,
    slideRef: "Ch07 p.3",
    prompt: "슬라이드에 제시된 **메모리 관리 요구사항**을 모두 고르시오.",
    choices: ["재배치(Relocation)", "보호(Protection)", "공유(Sharing)", "스케줄링(Scheduling)", "논리적 구성", "물리적 구성"],
    answerIndexes: [0, 1, 2, 4, 5],
    explanation:
      "p.3: 메모리 관리 요구사항은 재배치·보호·공유·논리적 구성·물리적 구성 다섯 가지다. 스케줄링은 프로세서 관리(Ch03)의 일로 메모리 관리 요구사항 목록에 없다.",
    summary: "요구사항 5가지 = 재배치 · 보호 · 공유 · 논리적 구성 · 물리적 구성",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-requirement-002",
    topic: "메모리 관리 요구사항",
    type: "match",
    difficulty: 2,
    slideRef: "Ch07 p.4-10",
    prompt: "메모리 관리 요구사항과 설명을 짝지으시오.",
    pairs: [
      { left: "재배치", right: "실행 중 디스크로 스왑되었다가 다른 위치로 돌아올 수 있음" },
      { left: "보호", right: "허가 없이 다른 프로세스의 메모리를 참조할 수 없음" },
      { left: "공유", right: "여러 프로세스가 메모리의 동일한 부분에 접근하도록 허용" },
      { left: "논리적 구성", right: "프로그램은 모듈 단위로 작성됨" },
      { left: "물리적 구성", right: "사용할 메모리가 부족할 때의 오버레이 → 가상 메모리" },
    ],
    explanation:
      "p.4 재배치, p.6 보호, p.8 공유, p.9 논리적 구성(모듈), p.10 물리적 구성(오버레이)의 첫 정의를 짝지었다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-requirement-003",
    topic: "메모리 관리 요구사항",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.2",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "메모리 관리란 여러 프로세스를 수용하기 위해 메모리를 {{0}}하는 것이다.",
    blanks: [{ accept: ["분할", "나누는 것", "나눔", "partition", "partitioning"] }],
    explanation:
      "p.2: 메모리 관리는 여러 프로세스를 수용하기 위해 메모리를 분할하는 것이며, 준비 상태 프로세스를 충분히 확보하도록 메모리를 적절히 할당해야 한다.",
  },

  // ───────────────────────────── 재배치 (p.4-5, p.25)
  {
    ...base,
    ...plain,
    id: "os-ch07-relocation-001",
    topic: "재배치",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch07 p.4",
    prompt: "슬라이드에 제시된 **메모리 재배치가 필요한 두 가지 경우**로 옳은 것은?",
    choices: [
      "디스크로 swap out 했다가 다시 swap in 할 때 / 메모리 압축(compaction) 때",
      "프로그램을 컴파일할 때 / 링크할 때",
      "CPU 스케줄링이 일어날 때 / 인터럽트가 발생할 때",
      "페이지 크기를 바꿀 때 / 캐시가 가득 찼을 때",
    ],
    answerIndex: 0,
    explanation:
      "p.4: ① 디스크 swap out 후 다시 swap in 할 때(다른 빈 위치로 돌아옴) ② 공간 확보를 위해 모든 프로그램을 앞쪽으로 옮기는 memory compaction 때 재배치된다. 컴파일·링크는 0번지 기준 주소를 정하는 단계이고, 스케줄링·인터럽트는 프로그램을 옮기지 않는다.",
    summary: "재배치 2가지 = swap in(다른 위치) · compaction",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-relocation-002",
    topic: "재배치",
    type: "ox",
    difficulty: 1,
    slideRef: "Ch07 p.4",
    prompt: "프로그래머는 프로그램을 작성할 때 그 프로그램이 실행 시 메모리의 어디에 배치될지 알 수 있다.",
    answer: false,
    falseReason: "p.4: 프로그래머는 프로그램이 실행될 때 메모리의 어디에 배치될지 알 수 없다(실행 시 배치, 장소는 모름).",
    explanation: "그래서 논리주소 → 실제주소 변환이 필요하다(p.4).",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-relocation-003",
    topic: "재배치",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.4",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "중간중간 생긴 작은 메모리 조각을 모아 공간을 확보하기 위해 모든 프로그램을 메모리 앞쪽으로 옮기는 작업을 {{0}}이라 한다.",
    blanks: [{ accept: ["Memory compaction", "compaction", "메모리 압축", "압축", "메모리 컴팩션", "컴팩션"] }],
    explanation:
      "p.4 인쇄 'Memory compaction 때'와 필기: 쓰지 않는 조그마한 메모리 조각을 확보하기 위해 모든 프로그램을 앞쪽으로 옮기는 작업이 Memory compaction이다. 이때 프로그램 위치가 바뀌므로 재배치가 필요하다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-relocation-004",
    topic: "재배치",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.5",
    prompt: "프로그램이 사용하는 주소(점프할 명령어 주소, 전역변수 주소, 포인터 변수 값)는 실제 메모리의 진짜 주소다.",
    answer: false,
    falseReason:
      "교수님 필기 기준(p.5): 프로그램이 재배치되어도 문제가 없는 이유는 우리가 사용하는 주소가 가짜 주소이기 때문이다. 실제 메모리에서는 진짜 주소를 사용한다.",
    explanation: "p.4 필기에서도 논리주소를 '가짜주소'라 부른다. 논리주소 → 실제주소 변환이 필요하다.",
  },

  {
    ...base,
    ...plain,
    id: "os-ch07-relocation-005",
    topic: "재배치",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch07 p.25",
    prompt: "재배치(Relocation)에 대한 설명으로 슬라이드 p.25에 제시된 것을 모두 고르시오.",
    choices: [
      "프로그램이 메모리에 적재될 때 실제(절대) 메모리 위치가 결정된다",
      "프로세스는 실행 중에 스와핑으로 서로 다른 절대 메모리 위치에 배치될 수 있다",
      "압축(compaction) 역시 프로그램이 다른 절대 메모리 위치에 배치되게 한다",
      "프로그램의 절대 메모리 위치는 컴파일할 때 고정된다",
      "한 번 적재된 프로세스는 종료될 때까지 같은 위치에 있다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "p.25: 실제(절대) 위치는 적재될 때 결정되고, 스와핑과 압축 때문에 실행 중에도 다른 절대 위치로 옮겨질 수 있다. 컴파일 시점에는 위치를 알 수 없으므로(p.4) 상대주소(0번지 기준)로 컴파일하고 실행 시 재배치한다(p.7).",
  },

  // ───────────────────────────── 보호 / Base·Bounds (p.6-7)
  {
    ...base,
    ...plain,
    id: "os-ch07-protection-001",
    topic: "보호 / Base·Bounds 레지스터",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.6",
    prompt: "메모리 **보호 검사**는 언제, 무엇이 하는가?",
    choices: [
      "실행 시점(run time)에 하드웨어(MMU)가 검사한다 — 보호 정보는 OS가 설정",
      "컴파일 시점에 컴파일러가 모든 절대 주소를 검사한다",
      "링크 시점에 링커가 주소를 검사해 두면 실행 중에는 검사하지 않는다",
      "실행 시점에 사용자 프로그램이 스스로 주소를 검사한다",
    ],
    answerIndex: 0,
    explanation:
      "p.6: 컴파일 시점에는 절대 주소를 검사하는 것이 불가능하므로 실행 시점에 검사해야 한다. OS가 보호 정보(page table 권한, base/limit)를 설정하고, 실행 시점 검사는 하드웨어(MMU)가 수행한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-protection-002",
    topic: "보호 / Base·Bounds 레지스터",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.6",
    prompt: "빈칸에 알맞은 장치 이름을 쓰시오.",
    text: "OS가 보호 정보를 설정하면, 실행 시점의 메모리 보호 검사는 메모리와는 별개의 하드웨어 디바이스인 {{0}}가 수행한다.",
    blanks: [
      {
        accept: ["MMU", "memory management unit", "메모리 관리 장치", "메모리 관리 하드웨어", "MMU(memory management unit)"],
      },
    ],
    explanation: "p.6: MMU(memory management unit, 메모리 관리 하드웨어). 필기: 메모리와는 별개의 디바이스로 메모리를 관리해 주는 하드웨어다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-protection-003",
    topic: "보호 / Base·Bounds 레지스터",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.6",
    prompt: "접근한 주소가 다른 프로세스의 영역이면 MMU가 CPU에 trap interrupt를 걸고, 그 결과 process switch가 일어난다.",
    answer: true,
    explanation:
      "교수님 필기 기준(p.6): 접근한 주소가 남의 주소 영역이면 MMU 장치가 CPU에 인터럽트를 건네준다(trap interrupt → process switch). 인터럽트 때 실행하는 함수는 운영체제의 한 부분이다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-protection-004",
    topic: "보호 / Base·Bounds 레지스터",
    type: "match",
    difficulty: 2,
    slideRef: "Ch07 p.7",
    prompt: "Base·Bounds 레지스터 동작과 역할을 짝지으시오.",
    pairs: [
      { left: "베이스(base) 레지스터", right: "적재된 실제 시작주소 — 상대주소 + base = 절대주소(재배치)" },
      { left: "바운드(bounds/limit) 레지스터", right: "프로세스 영역 크기 — 상대주소 < bounds 검사(보호)" },
      { left: "상대주소 ≥ bounds", right: "보호 위반(트랩)" },
    ],
    explanation: "p.7: 한 쌍의 레지스터로 재배치(base 가산)와 보호(bounds 비교)를 하드웨어가 동시에 처리한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-protection-005",
    topic: "보호 / Base·Bounds 레지스터",
    type: "calc",
    difficulty: 2,
    slideRef: "Ch07 p.7",
    prompt: "base 레지스터 = 30,000, bounds 레지스터 = 5,000인 프로세스가 **상대주소 1,200**에 접근하면 실제(절대)주소는?",
    answer: bb.physical!,
    tolerance: 0,
    steps: ["상대주소 1,200 < bounds 5,000 → 통과(보호 위반 아님)", `절대주소 = 1,200 + 30,000 = ${fmt(bb.physical!)}`],
    explanation:
      "p.7: CPU가 상대주소를 만들면 base 가산과 bounds 비교가 동시에 일어나고, 통과하면 '상대주소 + base' 위치에 접근한다. bounds는 비교에만 쓰이고 더하지 않는다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-protection-006",
    topic: "보호 / Base·Bounds 레지스터",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.7",
    prompt: "base 레지스터 = 30,000, bounds 레지스터 = 5,000인 프로세스가 **상대주소 6,200**에 접근하면?",
    choices: [
      bbTrap.trap ? "보호 위반(트랩)이 발생한다" : fmt(bbTrap.physical),
      "실제주소 36,200에 접근한다",
      "실제주소 6,200에 접근한다",
      "실제주소 35,000에 접근한다",
    ],
    answerIndex: 0,
    explanation:
      "p.7: 상대주소 < bounds여야 통과한다. 6,200 ≥ 5,000이므로 메모리에 접근하지 않고 보호 위반(트랩)이 된다. 36,200은 bounds 검사를 빼먹고 base만 더한 값이다.",
  },

  // ───────────────────────────── 공유 (p.8)
  {
    ...base,
    ...plain,
    id: "os-ch07-sharing-001",
    topic: "공유",
    type: "classify",
    difficulty: 2,
    slideRef: "Ch07 p.8",
    prompt: "각 사례가 무엇을 공유하는지 분류하시오.",
    buckets: ["프로그램(함수) 코드 공유", "데이터 공유"],
    items: [
      { label: "PowerPoint를 10개 실행", bucket: "프로그램(함수) 코드 공유" },
      { label: "서로 다른 여러 프로세스가 하나의 DLL을 사용", bucket: "프로그램(함수) 코드 공유" },
      { label: "하나의 버퍼(배열)를 여러 프로세스가 함께 사용", bucket: "데이터 공유" },
      { label: "한 프로그램이 배열에 쓴 데이터를 다른 프로그램이 읽어 주고받음", bucket: "데이터 공유" },
    ],
    explanation:
      "교수님 필기 기준(p.8): 동일 프로그램 여러 개 실행과 DLL 라이브러리는 프로그램 코드/함수 코드를 공유하고, 세 번째(하나의 버퍼)는 실제로 데이터를 공유한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-sharing-002",
    topic: "공유",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.8",
    prompt: "여러 프로그램이 하나의 DLL 라이브러리를 공유한다는 것은 그 라이브러리의 데이터를 함께 쓴다는 뜻이다.",
    answer: false,
    falseReason: "교수님 필기 기준(p.8): DLL 라이브러리일 경우에는 실행 명령어가 있는 코드를 공유한다(데이터를 공유한다는 것이 아님).",
    explanation: "데이터를 실제로 공유하는 것은 하나의 버퍼(배열)를 여러 프로세스가 함께 쓰는 경우다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-sharing-003",
    topic: "공유",
    type: "match",
    difficulty: 2,
    slideRef: "Ch07 p.8",
    prompt: "라이브러리·공유 방식과 설명을 짝지으시오.",
    pairs: [
      { left: "정적 라이브러리", right: "printf·scanf 함수 코드가 프로그램 안에 같이 들어감" },
      { left: "DLL(동적) 라이브러리", right: "printf·scanf가 독립적으로 메모리에 올라가 사용하는 모든 프로그램이 공유" },
      { left: "데이터 공유", right: "하나의 버퍼(배열)를 여러 프로세스가 함께 사용" },
    ],
    explanation:
      "교수님 필기 기준(p.8): 라이브러리에서 함수를 빼 와 프로그램 코드에 넣으면 정적 라이브러리, 함수가 독립적으로 메인 메모리에 깔려 있고 모든 프로그램이 공유하면 다이나믹/DLL 라이브러리다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-sharing-004",
    topic: "공유",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch07 p.8",
    prompt: "PowerPoint를 10개 실행했을 때 여러 프로세스가 **공유하는 것**은?",
    choices: ["프로그램 코드(코드 영역)", "전역변수", "힙", "스택"],
    answerIndex: 0,
    explanation:
      "p.8: PowerPoint 10개 실행 시 프로그램 코드는 공유하고 프로그램 데이터는 따로 가진다. 교수님 필기 기준: 전역변수·힙·스택은 전부 따로 갖고 코드 영역만 하나만 둔다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-sharing-005",
    topic: "공유",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.8",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "운영체제가 제공하는 라이브러리와 Windows API 함수들은 {{0}} 라이브러리로 제공된다.",
    blanks: [
      {
        accept: ["DLL", "동적", "동적 링크", "다이나믹", "dynamic", "dynamic link", "Dynamic Link Library", "DLL(동적)"],
      },
    ],
    explanation: "교수님 필기 기준(p.8): 운영체제가 제공해 주는 라이브러리들과 Windows API 함수들은 DLL 라이브러리로 제공된다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-sharing-006",
    topic: "공유",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.8",
    prompt: "같은 프로그램을 여러 개 실행할 때 코드 영역을 하나만 두고 공유할 수 있는 것은 코드는 읽기만 하기 때문이다.",
    answer: true,
    explanation:
      "교수님 필기 기준(p.8): 전역변수·힙·스택은 전부 따로 갖고 있지만 코드 영역은 하나만 둔다(읽기만 하기 때문). Ch03 p.24에서도 Text segment는 읽기 전용이다.",
  },

  // ───────────────────────────── 논리적 구성 (p.9)
  {
    ...base,
    ...plain,
    id: "os-ch07-logical-org-001",
    topic: "논리적 구성",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.9",
    prompt: "프로그램의 **모듈 구조를 메모리에 그대로 반영한 것**은?",
    choices: ["세그먼테이션", "페이징", "고정 분할", "오버레이"],
    answerIndex: 0,
    explanation:
      "p.9: 모듈 구조를 메모리에 그대로 반영한 것이 세그먼테이션이고 각 모듈은 하나의 세그먼트가 될 수 있다. 반면 페이징은 논리 구조를 무시한다(고정 크기). 고정 분할·오버레이는 모듈 구조와 무관하다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-logical-org-002",
    topic: "논리적 구성",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.9",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "관련 함수·데이터를 묶은 독립적 논리 단위로, 따로 작성·컴파일하고 메모리에 적재할 수 있는 것을 {{0}}이라 한다.",
    blanks: [{ accept: ["모듈", "module", "모듈(Module)"] }],
    explanation: "p.9: 모듈(Module) — 예: 소스 파일, 클래스, 라이브러리. 필기: 각각의 c 파일을 하나의 모듈이라 하고, 여러 모듈로 하나의 exe 파일을 만든다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-logical-org-003",
    topic: "논리적 구성",
    type: "ox",
    difficulty: 1,
    slideRef: "Ch07 p.9",
    prompt: "페이징은 프로그램의 모듈(논리) 구조를 그대로 반영해 메모리를 나눈다.",
    answer: false,
    falseReason: "p.9: 페이징은 논리 구조를 무시한다(고정 크기). 모듈 구조를 반영하는 것은 세그먼테이션이다.",
    explanation: "모듈마다 다른 보호 수준(read-only, execute-only)을 주고 모듈을 공유할 수 있는 것도 논리적 구성의 특징이다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-logical-org-004",
    topic: "논리적 구성",
    type: "multi",
    difficulty: 1,
    slideRef: "Ch07 p.9",
    prompt: "슬라이드에 **모듈의 예**로 제시된 것을 모두 고르시오.",
    choices: ["소스 파일", "클래스", "라이브러리", "페이지 프레임", "CPU 레지스터"],
    answerIndexes: [0, 1, 2],
    explanation: "p.9: 모듈의 예는 소스 파일, 클래스, 라이브러리다. 페이지 프레임은 메모리를 고정 크기로 자른 단위이고, 레지스터는 CPU 안의 저장 공간이다.",
  },

  // ───────────────────────────── 물리적 구성 (p.10)
  {
    ...base,
    ...plain,
    id: "os-ch07-physical-org-001",
    topic: "물리적 구성",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.10",
    prompt: "**오버레이(Overlaying)** 기법의 단점으로 슬라이드에 제시된 것은?",
    choices: [
      "오버레이 구조를 프로그래머가 직접 설계해야 해 어렵고 오류가 잦다",
      "MMU가 있어야만 동작한다",
      "모든 모듈이 항상 동시에 메모리에 있어야 한다",
      "운영체제가 자동으로 관리하므로 프로그래머가 제어할 수 없다",
    ],
    answerIndex: 0,
    explanation:
      "p.10: 오버레이는 프로그래머가 수동 관리하며, 구조를 직접 설계해야 해 어렵고 오류가 잦다. 오히려 MMU 없는 임베디드에만 잔존하고, 동시에 필요 없는 부분끼리 같은 영역을 번갈아 쓰는 기법이다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-physical-org-002",
    topic: "물리적 구성",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.10",
    prompt: "빈칸에 알맞은 기법 이름을 쓰시오.",
    text: "메모리가 부족할 때 프로그램을 조각내어, 동시에 필요 없는 부분끼리 같은 메모리 영역을 겹쳐 번갈아 적재하는 기법을 {{0}}라 한다.",
    blanks: [{ accept: ["오버레이", "overlay", "overlaying", "오버레이 기법", "오버레이(Overlaying)"] }],
    explanation: "p.10: 오버레이(Overlaying) 기법 — 여러 모듈이 메모리의 동일한 영역을 할당받을 수 있게 한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-physical-org-003",
    topic: "물리적 구성",
    type: "ox",
    difficulty: 1,
    slideRef: "Ch07 p.10",
    prompt: "가상 메모리(8장)는 오버레이가 하던 일을 자동화한 것이다.",
    answer: true,
    explanation: "p.10: 오버레이는 프로그래머가 수동 관리하지만, 가상 메모리(8장)가 이를 자동화한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-physical-org-004",
    topic: "물리적 구성",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.10",
    prompt: "오버레이는 오늘날 PC·서버·스마트폰 같은 범용 시스템에서는 거의 쓰이지 않고, MMU 없는 임베디드 시스템에만 남아 있다.",
    answer: true,
    explanation: "p.10: 오늘날 범용(PC·서버·스마트폰)엔 거의 안 쓰고 MMU 없는 임베디드에만 잔존한다.",
  },

  // ───────────────────────────── 고정 분할 vs 동적 분할 (p.11-15)
  {
    ...base,
    ...plain,
    id: "os-ch07-partition-001",
    topic: "고정 분할 / 동적 분할",
    type: "classify",
    difficulty: 2,
    slideRef: "Ch07 p.11-14",
    prompt: "각 특징이 고정 분할과 동적 분할 중 어디에 해당하는지 분류하시오.",
    buckets: ["고정 분할", "동적 분할"],
    items: [
      { label: "메모리를 미리 고정된 크기로 잘라 놓는다", bucket: "고정 분할" },
      { label: "같은 크기 분할과 서로 다른 크기 분할이 있다", bucket: "고정 분할" },
      { label: "작은 프로그램도 분할 하나를 통째로 차지한다", bucket: "고정 분할" },
      { label: "분할의 길이와 개수가 가변적이다", bucket: "동적 분할" },
      { label: "프로세스가 필요한 만큼 정확히 메모리를 할당받는다", bucket: "동적 분할" },
      { label: "빈 메모리를 모으려면 압축(compaction)이 필요하다", bucket: "동적 분할" },
    ],
    explanation:
      "p.11-13: 고정 분할은 미리 고정된 크기(같은/다른 크기)로 나누고 분할 하나를 통째로 차지해 내부 단편화가 생긴다. p.14: 동적 분할은 길이·개수가 가변이고 필요한 만큼 할당하지만 외부 단편화가 생겨 압축이 필요하다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-partition-002",
    topic: "고정 분할 / 동적 분할",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.12-13",
    prompt: "서로 다른 크기 고정 분할(Figure 7.2 (b))에서 16M 분할에 13M 프로그램을 넣었다. 남는 3M에 대한 설명으로 옳은 것은?",
    choices: [
      "분할 안에서 놀고 있는 메모리로, 내부 단편화(Internal Fragmentation)다",
      "분할 사이에 생긴 빈 구멍으로, 외부 단편화(External Fragmentation)다",
      "다른 프로그램에게 3M를 바로 나눠 줄 수 있다",
      "압축(compaction)을 하면 다른 프로세스가 쓸 수 있게 된다",
    ],
    answerIndex: 0,
    explanation:
      "교수님 필기 기준(p.12): 16M 분할에 13M를 넣으면 3M는 놀고 있다. p.13: 아무리 작은 프로그램이라도 분할 하나를 통째로 차지하며, 이를 내부 단편화라 한다. 외부 단편화와 압축은 동적 분할(p.14)의 이야기다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-partition-003",
    topic: "고정 분할 / 동적 분할",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.15",
    prompt:
      "Figure 7.4 (e)→(f)에서 Process 2가 빠진 14M 빈 자리에 Process 4(8M)를 넣었더니 Process 4 뒤에 6M가 비었다. 이 6M에 대한 설명으로 옳은 것은?",
    choices: [
      "프로세스들 사이에 생긴 빈 구멍으로, 외부 단편화가 된다",
      "Process 4에 할당된 공간이므로 내부 단편화다",
      "Process 4가 끝날 때까지 다른 프로세스가 절대 쓸 수 없다",
      "동적 분할에서는 이런 빈 공간이 생기지 않는다",
    ],
    answerIndex: 0,
    explanation:
      "p.14: 동적 분할에서는 프로세스가 필요한 만큼(8M) 정확히 할당받으므로 남은 6M는 Process 4의 것이 아니라 빈 구멍이 된다. 이런 구멍이 쌓이는 것이 외부 단편화이며, Figure 7.4 (h)처럼 6M·6M·4M로 흩어진다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-partition-004",
    topic: "고정 분할 / 동적 분할",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.14",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "동적 분할에서 프로세스는 필요한 만큼 정확히 메모리를 할당받지만, 결국 메모리에 빈 구멍이 생긴다. 이를 {{0}}라 한다.",
    blanks: [{ accept: ["외부 단편화", "외부단편화", "External Fragmentation", "외부 조각", "외부 조각화", "외부 단편화(External Fragmentation)"] }],
    explanation: "p.14: 외부 단편화(External Fragmentation). 고정 분할의 내부 단편화(p.13)와 구분한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-partition-005",
    topic: "고정 분할 / 동적 분할",
    type: "blank",
    difficulty: 2,
    slideRef: "Ch07 p.11",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "버디 시스템(Buddy system)은 고정 분할과 동적 분할의 {{0}}이다.",
    blanks: [{ accept: ["절충", "절충안", "절충형", "타협", "중간"] }],
    explanation: "p.11: 메모리 분할과 배치 방법은 고정 분할, 동적 분할, 그리고 둘의 절충인 버디 시스템으로 나뉜다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-partition-006",
    topic: "고정 분할 / 동적 분할",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch07 p.14",
    prompt: "메모리 압축(compaction)의 **비용**으로 슬라이드에 제시된 것을 모두 고르시오.",
    choices: ["CPU 시간", "전 프로세스 이동", "프로세스가 재배치 가능해야 함", "디스크 공간이 두 배로 필요함", "페이지 테이블을 모두 지워야 함"],
    answerIndexes: [0, 1, 2],
    explanation:
      "p.14: 압축은 프로세스들을 이동시켜 인접하게 만들고 모든 빈 메모리를 한 블록으로 모으는 것으로, 비용이 높다(CPU 시간, 전 프로세스 이동, 재배치 가능해야 함). 디스크 공간·페이지 테이블은 언급되지 않았다.",
  },

  {
    ...base,
    ...plain,
    id: "os-ch07-partition-007",
    topic: "고정 분할 / 동적 분할",
    type: "classify",
    difficulty: 2,
    slideRef: "Ch07 p.12",
    prompt: "Figure 7.2의 고정 분할에 대한 설명을 같은 크기 분할과 서로 다른 크기 분할로 분류하시오. (교수님 필기 포함)",
    buckets: ["같은 크기 분할 (a)", "서로 다른 크기 분할 (b)"],
    items: [
      { label: "OS 영역을 뺀 나머지를 모두 8M 분할로 나눈다", bucket: "같은 크기 분할 (a)" },
      { label: "8M보다 작으면 무조건 8M 분할에 넣어서 돌린다", bucket: "같은 크기 분할 (a)" },
      { label: "2M·4M·6M·8M·8M·12M·16M처럼 크기별로 미리 나눠 놓는다", bucket: "서로 다른 크기 분할 (b)" },
      { label: "많이 사용되는 8M 분할은 2개 만든다", bucket: "서로 다른 크기 분할 (b)" },
      { label: "12M·16M 분할이 놀고 있어도 6M·8M 분할 앞에 줄 서 있다가 들어간다", bucket: "서로 다른 크기 분할 (b)" },
    ],
    explanation:
      "p.12 Figure 7.2: (a) Equal-size partitions는 모두 8M, (b) Unequal-size partitions는 2M~16M. 교수님 필기 기준: (a) '8M보다 작으면 무조건 8M에 넣어서 돌림', (b) '많이 사용되는 8M는 2개 만듦', '대부분의 프로그램이 5M~8M 정도라면 12M·16M 메모리는 놀고 있음에도 여기에 넣지 않고 6M·8M 메모리에 줄 서 있다가 거기에 넣는다'.",
  },

  // ───────────────────────────── ⭐ 배치 알고리즘 (p.16-20)
  {
    ...base,
    ...star,
    id: "os-ch07-placement-001",
    topic: "배치 알고리즘",
    type: "match",
    difficulty: 1,
    slideRef: "Ch07 p.16-19",
    prompt: "동적 분할 배치 알고리즘과 블록 선택 방법을 짝지으시오.",
    pairs: [
      { left: "최적 적합(Best-fit)", right: "요청 크기에 가장 가까운 블록" },
      { left: "최초 적합(First-fit)", right: "메모리를 처음부터 훑어 충분히 큰 첫 번째 빈 블록" },
      { left: "다음 적합(Next-fit)", right: "마지막으로 배치한 위치부터 훑음" },
      { left: "최악 적합(Worst-fit)", right: "가장 큰 블록" },
    ],
    explanation: "p.16-19의 네 알고리즘 정의다(p.16 필기 \"네가지 케이스 시험\").",
    summary: "Best=가장 가까운 · First=첫 블록 · Next=마지막 위치부터 · Worst=가장 큰",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-002",
    summary: "Best-fit이 성능이 가장 나쁘고 압축이 더 자주 필요(p.16), First-fit이 가장 우수(p.17)",
    topic: "배치 알고리즘",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.16-17",
    prompt: "슬라이드 기준으로 **성능이 가장 나쁜** 배치 알고리즘은?",
    choices: ["Best-fit", "First-fit", "Next-fit", "Worst-fit"],
    answerIndex: 0,
    explanation:
      "p.16: Best-fit은 성능이 가장 나쁘고 메모리 압축을 더 자주 해야 한다. 교수님 필기 기준: 딱 맞는 것을 찾다 보니 다른 프로그램에게 줄 수도 없는 외부 단편화를 가장 많이 발생시킨다. '가장 가까운 블록을 고르니 가장 좋다'는 흔한 오개념이다. p.17: First-fit이 가장 단순·빠르고 가장 우수하다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-003",
    summary: "속도(처리량): first ≈ next > best ≥ worst(p.19)",
    topic: "배치 알고리즘",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.19",
    prompt: "배치 알고리즘의 **속도(처리량)** 비교로 슬라이드에 제시된 것은?",
    choices: ["first ≈ next > best ≥ worst", "best > first > next > worst", "worst > best > next ≈ first", "first = next = best = worst"],
    answerIndex: 0,
    explanation:
      "p.19: 속도(처리량)는 first ≈ next > best ≥ worst. (보충) Best·Worst는 조건에 맞는 블록을 고르려고 빈 블록 전체를 살펴야 하므로, 맞는 첫 블록에서 멈추는 First/Next보다 느리다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-004",
    summary: "16M 요청: First 22M, Best 18M, Next 36M, Worst 36M(Figure 7.5, p.20)",
    topic: "배치 알고리즘",
    type: "trace",
    difficulty: 3,
    slideRef: "Ch07 p.20",
    prompt:
      "Figure 7.5에서 빈 블록이 위(낮은 주소)부터 `8M, 12M, 22M, 18M, 8M, 6M, 14M, 36M` 순서로 있고, 마지막으로 배치한 블록(Last allocated block)은 18M 블록과 두 번째 8M 블록 사이에 있다. **16M** 요청 시 각 알고리즘이 고르는 빈 블록과 할당 후 그 블록에 남는 크기를 채우시오.",
    columns: FIG75.map((r) => `${FIT_LABEL[r.fit]}`),
    rows: [
      {
        label: "선택되는 빈 블록",
        cells: FIG75.map((r, i) => ({
          value: r.chosen,
          ...(i === 0 ? {} : { blank: true, options: [...new Set(FIG75_SIZES.map((s) => `${s}M`))] }),
        })),
      },
      {
        label: "할당 후 남는 크기",
        cells: FIG75.map((r, i) => ({
          value: r.rest,
          ...(i === 0 ? {} : { blank: true, options: ["2M", "4M", "6M", "20M"] }),
        })),
      },
    ],
    explanation:
      "p.20: First-fit은 처음부터 훑어 22M(남는 6M), Best-fit은 16M에 가장 가까운 18M(남는 2M), Next-fit은 마지막 배치 위치부터 훑어 8M·6M·14M를 지나 36M(남는 20M)를 고른다. Worst-fit은 가장 큰 36M를 고른다(그림에는 없음, p.19 정의로 계산). 교수님 필기 기준: Next-fit이 끝까지 찾았는데 공간이 없으면 맨 처음으로 이동해 처음 맞는 블록(이 그림에서는 22M)을 할당한다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-005",
    summary: "Next-fit은 끝까지 없으면 메모리 맨 처음으로 돌아가 찾는다(p.20 필기)",
    topic: "배치 알고리즘",
    type: "blank",
    difficulty: 2,
    slideRef: "Ch07 p.20",
    prompt: "교수님 필기 기준으로 빈칸에 알맞은 말을 쓰시오.",
    text: "Next-fit은 마지막 배치 위치부터 훑다가 메모리 끝까지 찾았는데 맞는 공간이 없으면 메모리의 맨 {{0}}으로 이동해 다시 찾는다.",
    blanks: [{ accept: ["처음", "앞", "맨 앞", "시작", "처음 위치", "앞쪽"] }],
    explanation: "교수님 필기 기준(p.20): 만약 끝까지 찾았는데 공간이 없다면 맨 처음으로 이동해서 그때 처음으로 있는 22M 부분을 할당해 주게 된다(wrap-around).",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-006",
    summary: "First-fit = 가장 실용적·빠름, 초반 '전두부 파편화' 경향(p.19)",
    topic: "배치 알고리즘",
    type: "blank",
    difficulty: 2,
    slideRef: "Ch07 p.19",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "p.19 표에서 First-fit은 가장 실용적이고 빠르지만 초반 '{{0}}' 발생 경향이 있다.",
    blanks: [{ accept: ["전두부 파편화", "전두부파편화", "전두부 단편화"] }],
    explanation:
      "p.19 표: First-fit = 가장 실용적·빠름, 초반 '전두부 파편화' 발생 경향. p.17: 메모리 앞부분에 많은 프로세스가 적재되어 빈 블록을 찾을 때 그 부분을 매번 탐색해야 할 수 있다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-007",
    summary: "Next-fit은 끝부분의 큰 블록을 자주 쪼개 First-fit보다 약간 나쁘다(p.18-19)",
    topic: "배치 알고리즘",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.18-19",
    prompt: "Next-fit은 가장 큰 블록이 있는 메모리 끝부분을 자주 쪼개게 되어, 결과가 First-fit보다 약간 나쁜 경우가 많다.",
    answer: true,
    explanation:
      "p.18: Next-fit은 메모리 끝부분에서 블록을 할당하는 경우가 더 많아 가장 큰 메모리 블록이 작은 블록들로 쪼개지고, 최초 적합보다 결과가 약간 나쁘다. p.19: next-fit은 first-fit보다 다소 악화하는 경우가 많다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-placement-008",
    summary: "Best-fit = 성능 최악·압축 자주·미세 조각 최다(p.16·p.19)",
    topic: "배치 알고리즘",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch07 p.16, p.19",
    prompt: "**Best-fit**의 특징으로 슬라이드에 제시된 것을 모두 고르시오.",
    choices: [
      "성능이 가장 나쁘다",
      "메모리 압축을 더 자주 해야 한다",
      "미세 조각을 가장 많이 양산하는 경향이 있다",
      "속도가 가장 빠르다",
      "가장 큰 블록을 할당한다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "p.16: 성능이 가장 나쁘고 압축을 더 자주 해야 한다. p.19: best-fit이 미세 조각을 가장 많이 양산한다. 속도는 first ≈ next가 가장 빠르고(p.19), 가장 큰 블록을 할당하는 것은 Worst-fit이다.",
  },
  placementGen.generate(1, { fit: "next" }),
  placementGen.generate(2, { fit: "best" }),

  // ───────────────────────────── ⭐ 버디 시스템 (p.21-24)
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-001",
    summary: "요청은 2^k로 올려 반씩 쪼개 할당, 반납 시 buddy가 free면 합병(p.21-23)",
    topic: "버디 시스템",
    type: "trace",
    difficulty: 3,
    slideRef: "Ch07 p.23",
    prompt:
      "1M 메모리에서 버디 시스템으로 슬라이드 p.23의 요청·반납을 차례로 실행한다. 각 연산 **직후의 블록 상태**(왼쪽이 낮은 주소)를 빈칸에 채우시오.",
    columns: ["블록 상태"],
    rows: P23.map((s, i) => ({
      label: opLabel(s.op),
      cells: [[2, 5, 6, 7].includes(i) ? { value: s.line, blank: true, options: p23Options(i) } : { value: s.line }],
    })),
    explanation:
      "p.23: 요청은 2^k로 올려 가장 작은 맞는 블록을 반으로 쪼개며 왼쪽을 할당하고, 반납 시 buddy가 free면 합병한다. 교수님 필기 기준: 100K를 할당해 준 게 아니고 128K 전체를 할당해 준 것이다. Release A 때는 A의 buddy(128K)가 C+64K로 쪼개져 있어 '합병을 시켜야 하지만 현재는 비어 있지 않으므로 하고 싶어도 못 한다'. Release C 때 C와 64K가 합병해 128K가 되고, Release E 때 E·128K·256K가 연쇄 합병해 512K가 된다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-002",
    summary: "100K 요청 → 128K 블록 전체 할당, 28K는 내부 단편화(p.23 필기)",
    topic: "버디 시스템",
    type: "calc",
    difficulty: 1,
    slideRef: "Ch07 p.23",
    prompt: "버디 시스템에서 **100K**를 요청하면 생기는 내부 단편화 크기는?",
    answer: roundUpPow2(100) - 100,
    tolerance: 0,
    unit: "K",
    steps: [`100K를 수용하는 가장 작은 2^k = ${roundUpPow2(100)}K`, `내부 단편화 = ${roundUpPow2(100)} − 100 = ${roundUpPow2(100) - 100}K`],
    explanation:
      "교수님 필기 기준(p.23): '중요: 100K를 할당해 준 게 아니고 128K 전체를 할당해 준 것이다.' 요청보다 큰 블록 전체가 할당되어 남는 28K가 내부 단편화다. p.24 필기: 버디 시스템은 메모리 낭비가 단점이지만 메모리 컴팩션이 필요 없다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-003",
    summary: "같은 분할에서 나온 buddy가 비어 있어야만 합병한다(p.21·p.23 필기)",
    topic: "버디 시스템",
    type: "mcq",
    difficulty: 3,
    slideRef: "Ch07 p.23-24",
    prompt:
      "p.23 표의 **Release A** 직후 상태는 `128K | C=64K | 64K | 256K | D=256K | 256K`다. 비어 있는 128K(A 자리)와 그 오른쪽 64K가 합병되지 않는 이유는?",
    choices: [
      "A의 buddy는 [128K, 256K) 128K 블록인데, 그 블록이 C와 64K로 쪼개져 있어 통째로 free가 아니기 때문",
      "버디 시스템은 반납할 때 합병을 하지 않기 때문",
      "128K와 64K는 크기가 달라 buddy가 될 수 없지만, 크기만 같으면 이웃한 어떤 free 블록과도 합병하기 때문",
      "합병은 메모리 압축(compaction) 때만 일어나기 때문",
    ],
    answerIndex: 0,
    explanation:
      "p.21: 같은 크기로 분할된 두 블록끼리 buddy다. A(128K)의 buddy는 같은 256K에서 갈라진 오른쪽 128K인데, 그 블록이 C=64K와 64K로 쪼개져 있다. 교수님 필기 기준(p.23): '합병을 시켜야 하지만 현재는 비어 있지 않으므로 하고 싶어도 못 한다.' 크기만 같다고 합병하지 않으며(같은 분할에서 나온 쌍만), 버디 시스템은 compaction이 필요 없다(p.24).",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-004",
    summary: "40B 요청 → 2^6 = 64 블록: 64 | 64 | 128 | 256 | 512(p.21)",
    topic: "버디 시스템",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.21",
    prompt:
      "1024바이트가 통째로 비어 있는 메모리에서 버디 알고리즘으로 **40 bytes**를 요청했다. 할당 직후 블록 상태는? (왼쪽이 낮은 주소, X = 이번에 할당된 블록)",
    choices: [P21_40.correct, ...P21_40.wrong],
    answerIndex: 0,
    explanation:
      "p.21: 40을 수용하는 가장 작은 2의 거듭제곱인 2^6(64)이 할당된다. 64·128·256·512 크기의 빈 블록이 없으면 1024를 반으로 분할(512 | 512)하고, 왼쪽 512를 64가 될 때까지 계속 반으로 분할하며 내려가 맨 왼쪽 64를 할당한다 → 64 | 64 | 128 | 256 | 512. 40B만 떼어 주지 않으며(2의 거듭제곱 블록 전체), 오른쪽 반을 할당하지 않는다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-005",
    summary: "크기만 같아서는 안 되고 같은 분할에서 나온 buddy끼리만 합병한다(p.21)",
    topic: "버디 시스템",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.21",
    prompt: "버디 시스템에서 크기가 같은 두 free 블록이 서로 붙어 있기만 하면 항상 합병된다.",
    answer: false,
    falseReason:
      "p.21: 같은 크기로 '분할된' 두 블록끼리만 buddy다. 교수님 필기 기준: 파란색 64와 검은색 64는 친구가 아니다 — 이웃해 있어도 서로 다른 블록에서 갈라진 64K끼리는 합병하지 않는다.",
    explanation: "그래서 p.24 필기처럼 할당 상태를 트리 구조로 추적해야 합병 대상을 정확히 알 수 있다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-006",
    summary: "같은 크기로 분할된 두 블록 = buddy(p.21)",
    topic: "버디 시스템",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.21",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "같은 크기로 분할된 두 개의 블록끼리 서로 {{0}}라 한다.",
    blanks: [{ accept: ["buddy", "버디", "친구", "buddy(친구)", "버디(buddy)"] }],
    explanation: "p.21: 같은 크기로 분할된 두 개의 블록끼리 서로 buddy(친구)라 하며, 반납 시 buddy가 free면 합병한다(p.22).",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-007",
    summary: "버디 시스템은 내부적으로 트리 구조로 할당 상태를 추적한다(p.24 필기)",
    topic: "버디 시스템",
    type: "blank",
    difficulty: 2,
    slideRef: "Ch07 p.24",
    prompt: "교수님 필기 기준으로 빈칸에 알맞은 말을 쓰시오.",
    text: "버디 시스템이 메모리 할당 상태를 정확하게 추적해서 합병을 하려면 내부적으로 {{0}} 구조를 가지고 있어야 한다.",
    blanks: [{ accept: ["트리", "tree", "트리 구조", "이진 트리", "binary tree", "tree structure"] }],
    explanation: "교수님 필기 기준(p.24): 메모리 할당 관리하려면 트리 구조를 내부적으로 가지고 있어야 할당 상태를 정확하게 추적해서 합병할 수 있다(Figure 7.7 Tree Representation of Buddy System).",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-buddy-008",
    summary: "Request = new·malloc, Release = free·delete(p.23 필기)",
    topic: "버디 시스템",
    type: "classify",
    difficulty: 1,
    slideRef: "Ch07 p.23",
    prompt: "교수님 필기 기준으로 각 함수·연산자가 버디 표의 Request와 Release 중 어디에 해당하는지 분류하시오.",
    buckets: ["Request", "Release"],
    items: [
      { label: "new", bucket: "Request" },
      { label: "malloc", bucket: "Request" },
      { label: "free", bucket: "Release" },
      { label: "delete", bucket: "Release" },
    ],
    explanation: "교수님 필기 기준(p.23): Request = new, malloc / Release = free, delete.",
  },
  buddyGen.generate(2, { variant: "state" }),
  buddyGen.generate(1, { variant: "start" }),

  // ───────────────────────────── 주소 용어 (p.26)
  {
    ...base,
    ...plain,
    id: "os-ch07-address-001",
    topic: "주소 용어",
    type: "match",
    difficulty: 1,
    slideRef: "Ch07 p.26",
    prompt: "주소 용어와 설명을 짝지으시오.",
    pairs: [
      { left: "논리 주소(가상 주소)", right: "메모리 위치에 대한 참조가 현재 데이터의 메모리 배정과 무관 — 물리 주소로 변환해야 함" },
      { left: "상대 주소", right: "어떤 알려진 기준점에 대한 상대적 위치로 표현된 주소" },
      { left: "물리 주소", right: "주기억장치 내의 절대 주소 또는 실제 위치" },
    ],
    explanation: "p.26의 세 정의다. 필기: 논리·상대 주소는 둘 다 상대적인 주소다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-address-002",
    topic: "주소 용어",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.26",
    prompt: "CPU와 프로그램은 물리 주소를 사용하고, 메인 메모리가 그것을 논리 주소로 바꿔 데이터를 찾는다.",
    answer: false,
    falseReason:
      "교수님 필기 기준(p.26): 메모리만 진짜 주소를 알고 있고, 프로그램이든 CPU든 사용하는 것은 논리주소다. 메인 메모리에 논리주소를 보내면 물리주소로 변환해 그 위치의 데이터를 읽어 CPU에 보낸다.",
    explanation: "논리 주소와 물리 주소의 역할을 뒤바꾼 문장이다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-address-003",
    topic: "주소 용어",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.26",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "논리 주소(logical address)는 {{0}} 주소(virtual address)라고도 한다.",
    blanks: [{ accept: ["가상", "가상 주소", "가상주소", "virtual", "virtual address"] }],
    explanation: "p.26: 논리 주소(또는 가상 주소): logical address, virtual address.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-address-004",
    topic: "주소 용어",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch07 p.26, p.33",
    prompt: "C 프로그램에서 **포인터 변수에 들어 있는 값**은 어떤 주소인가?",
    choices: ["논리 주소(가상 주소)", "물리 주소", "디스크 섹터 주소", "프레임 번호"],
    answerIndex: 0,
    explanation:
      "p.33: 포인터 변수 값 및 CPU가 다루는 모든 주소는 사실 논리주소다. p.26 필기: 포인터 변수·명령어의 주소 모두 논리주소다. 물리주소로의 변환은 MMU가 한다.",
  },

  // ───────────────────────────── 기본 페이징 (p.27-31)
  {
    ...base,
    ...plain,
    id: "os-ch07-paging-basic-001",
    topic: "기본 페이징",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.27",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "기본 페이징에서 프로세스를 나눈 덩어리를 {{0}}, 메모리를 나눈 덩어리를 {{1}}이라 한다.",
    blanks: [
      { accept: ["페이지", "page", "페이지(page)"] },
      { accept: ["프레임", "frame", "프레임(frame)", "페이지 프레임", "page frame"] },
    ],
    explanation: "p.27: 메모리와 프로세스를 같은 크기(4KB)의 작은 고정 크기 덩어리로 나누고, 프로세스의 덩어리를 페이지(page), 메모리의 덩어리를 프레임(frame)이라 한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-paging-basic-002",
    topic: "기본 페이징",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.31",
    prompt: "**페이지 테이블**에 대한 설명으로 옳은 것은?",
    choices: [
      "실제로는 integer 배열이며, 배열 인덱스가 페이지 번호이고 값이 그 페이지가 배치된 프레임 번호다",
      "배열 인덱스가 프레임 번호이고 값이 페이지 번호다",
      "프로그래머가 직접 만들어 프로그램 안에 넣는다",
      "모든 프로세스가 하나의 페이지 테이블을 함께 쓴다",
    ],
    answerIndex: 0,
    explanation:
      "p.31: 페이지 테이블은 실제로 integer 배열이며, 페이지 번호(배열 인덱스)에 해당 페이지가 배치된 메모리 frame 번호가 들어 있다. 운영체제가 자동 생성·관리하고(p.31), 각 프로세스마다 유지한다(p.27).",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-paging-basic-003",
    topic: "기본 페이징",
    type: "ox",
    difficulty: 1,
    slideRef: "Ch07 p.29-30",
    prompt: "기본 페이징에서 한 프로세스의 페이지들은 메모리의 연속된 프레임에 차례로 배치되어야 한다.",
    answer: false,
    falseReason: "p.29-30: 실제 메모리에는 page 단위로 잘라서 비연속적으로 아무 빈 곳에 배치된다.",
    explanation: "그래서 페이지마다 어느 프레임에 있는지 기록한 페이지 테이블이 필요하다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-paging-basic-004",
    topic: "기본 페이징",
    type: "calc",
    difficulty: 1,
    slideRef: "Ch07 p.28",
    prompt: "페이지 크기가 4KB일 때 크기 **4MB**인 프로그램은 몇 개의 페이지로 나뉘는가?",
    answer: pages4MB,
    tolerance: 0,
    unit: "개",
    steps: ["4MB = 2^22 바이트, 4KB = 2^12 바이트", `페이지 수 = 2^22 / 2^12 = 2^10 = ${fmt(pages4MB)}`],
    explanation: "교수님 필기 기준(p.28): 프로그램 크기가 4MB면 페이지 1024개.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-paging-basic-005",
    topic: "기본 페이징",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.31",
    prompt: "p.31 예제에서 **Process B의 페이지 테이블**이 모두 N으로 표시되어 있다. 이것이 뜻하는 것은?",
    choices: [
      "Process B의 페이지들이 현재 메인 메모리에 로딩되어 있지 않다",
      "Process B의 페이지가 모두 프레임 N번에 들어 있다",
      "Process B는 페이지가 하나도 없는 빈 프로그램이다",
      "Process B는 세그먼테이션을 쓴다",
    ],
    answerIndex: 0,
    explanation:
      "교수님 필기 기준(p.31): 페이지가 메모리에 로딩되어 있지 않다(N). 일부는 메모리에 들어와 있지 않을 수 있으며, 해당 페이지가 현재 메인 메모리에 없다는 것을 알 수 있다. p.30: Process B가 디스크로 빠지거나 종료된 경우다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-paging-basic-006",
    topic: "기본 페이징",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.31",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "페이지 테이블은 {{0}}가 프로세스마다 자동 생성 및 관리하며, 논리주소를 실제주소로 변환하는 데 활용된다.",
    blanks: [{ accept: ["운영체제", "OS", "operating system", "운영 체제"] }],
    explanation:
      "p.31: 운영체제가 자동 생성 및 관리. p.34 필기: 운영체제가 프로그램을 메인 메모리의 프레임에 넣을 때마다(swap in 포함) 그때그때 프레임 번호를 저장해 둔다.",
  },

  // ───────────────────────────── ⭐ 주소 변환 (p.32-36)
  {
    ...base,
    ...star,
    id: "os-ch07-translation-001",
    topic: "주소 변환",
    type: "calc",
    difficulty: 1,
    slideRef: "Ch07 p.34",
    prompt: "페이지 크기 1024, 페이지 테이블 `페이지 0→프레임 1, 페이지 1→프레임 2, 페이지 2→프레임 x`일 때 **논리주소 3**의 실제주소는?",
    answer: p34.physical!,
    tolerance: 0,
    steps: [
      `페이지 번호 = 3 / 1024 = ${p34.page}, offset = 3 % 1024 = ${p34.offset}`,
      `페이지 테이블[${p34.page}] = 프레임 ${p34.frame}`,
      `프레임 시작주소 = ${p34.frame} × 1024 = ${p34.frame! * 1024}`,
      `실제주소 = ${p34.frame! * 1024} + ${p34.offset} = ${p34.physical}`,
    ],
    explanation:
      "p.34(필기 \"시험: 주소변환\"): 논리주소 / 페이지 크기 = 페이지 번호, 나머지 = offset, 페이지 번호를 index로 테이블에서 프레임 번호를 찾아 프레임 시작주소 + offset. 교수님 필기 기준: 이 과정을 MMU 하드웨어 장치가 한다.",
    summary: "실제주소 = 테이블[논리/P] × P + 논리%P",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-002",
    summary: "실제 → 논리: 프레임 번호를 값으로 가진 index를 페이지 테이블에서 찾는다(p.35)",
    topic: "주소 변환",
    type: "calc",
    difficulty: 2,
    slideRef: "Ch07 p.35",
    prompt: "같은 페이지 테이블(`0→1, 1→2, 2→x`, 페이지 크기 1024)에서 **실제주소 2050**의 논리주소는?",
    answer: p35.logical,
    tolerance: 0,
    steps: [
      `프레임 번호 = 2050 / 1024 = ${p35.frame}, offset = 2050 % 1024 = ${p35.offset}`,
      `페이지 테이블에서 값이 ${p35.frame}인 index를 찾음 → 페이지 ${p35.page}`,
      `논리주소 = ${p35.page} × 1024 + ${p35.offset} = ${p35.logical}`,
    ],
    explanation:
      "p.35: 실제주소 → 논리주소는 프레임 번호를 '값으로' 가진 index를 페이지 테이블에서 찾아야 한다. (보충) 테이블을 처음부터 훑는 선형 탐색이므로, 페이지 번호를 index로 바로 쓰는 논리 → 실제 변환보다 느리다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-003",
    summary: "프레임 번호 x = (실제주소 − offset) / 프레임 크기(p.36)",
    topic: "주소 변환",
    type: "calc",
    difficulty: 2,
    slideRef: "Ch07 p.36",
    prompt: "페이지 크기 1024, 페이지 테이블 `0→1, 1→2, 2→x`에서 **논리주소 2049가 실제주소 1로 변환**된다. x(프레임 번호)는?",
    answer: p36x,
    tolerance: 0,
    steps: ["논리주소 2049 / 1024 = 페이지 2, offset = 1", "x × 1024 + 1 = 1", `x = (1 − 1) / 1024 = ${p36x}`],
    explanation: "p.36: x = (실제주소 − offset) / 프레임 크기. 따라서 페이지 2가 로드된 메모리의 프레임 번호는 0이다(메모리 그림의 프레임 0 = P2).",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-004",
    summary: "논리 → 실제: 페이지 번호를 프레임 번호로 바꾸고 offset은 그대로(p.32)",
    topic: "주소 변환",
    type: "calc",
    difficulty: 1,
    slideRef: "Ch07 p.32, p.37",
    prompt: "페이지 크기를 **1000**이라 가정하고, 페이지 1이 프레임 5에 있을 때 **논리주소 1,179**의 실제주소는?",
    answer: p32.physical!,
    tolerance: 0,
    steps: [`페이지 번호 = 1,179 / 1000 = ${p32.page} (천 단위), offset = ${p32.offset}`, `실제주소 = ${p32.frame} × 1000 + ${p32.offset} = ${fmt(p32.physical!)}`],
    explanation:
      "p.32: 논리주소 1,179에서 페이지 번호는 천 단위인 1, 프레임 번호 5로 대체하면 실제주소는 5,179다. p.37: 페이지 크기는 항상 2의 거듭제곱이며 1000은 암산 편의용 예시일 뿐이다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-005",
    summary: "페이지 번호 = 주소 / 크기, offset = 주소 % 크기, 실제주소 = 프레임 × 크기 + offset(p.34)",
    topic: "주소 변환",
    type: "trace",
    difficulty: 2,
    slideRef: "Ch07 p.34",
    prompt: "페이지 크기 1024, 페이지 테이블 `0→5, 1→2, 2→7, 3→0`일 때 각 논리주소의 변환 과정을 채우시오. (첫 행은 예시)",
    columns: ["페이지 번호", "offset", "프레임 번호", "실제주소"],
    rows: TRACE_ROWS.map((r, i) => ({
      label: `논리주소 ${fmt(TRACE_ADDRS[i])}`,
      cells: [r.page, r.offset, r.frame!, r.physical!].map((v, j) => ({
        value: String(v),
        ...(i > 0 && (j !== 0 || i === 2) ? { blank: true } : {}),
      })),
    })),
    explanation:
      "p.34의 순서: 페이지 번호 = 논리주소 / 1024, offset = 논리주소 % 1024, 페이지 번호를 index로 프레임 번호를 찾고, 실제주소 = 프레임 번호 × 1024 + offset.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-006",
    summary: "값(프레임 번호)으로 index를 찾는 것은 실제 → 논리 변환(p.35)",
    topic: "주소 변환",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.32, p.35",
    prompt: "p.32의 세 가지 주소 변환 문제 유형 중, 페이지 테이블에서 **값(프레임 번호)으로 index를 찾아야 하는** 것은?",
    choices: [
      "페이지 테이블과 실제주소로 논리주소 찾기",
      "페이지 테이블과 논리주소로 실제주소 계산하기",
      "논리주소와 실제주소로 페이지 테이블의 프레임 번호 결정하기",
      "세 유형 모두 같은 방식으로 index를 바로 쓴다",
    ],
    answerIndex: 0,
    explanation:
      "p.35: 실제주소 → 논리주소는 page table에서 프레임 번호 값을 가지는 index를 찾는다. 논리 → 실제(p.34)와 프레임 번호 결정(p.36)은 페이지 번호를 index로 바로 쓴다. (보충) 값을 찾으려면 처음부터 훑는 선형 탐색이 필요해 가장 느리다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-007",
    summary: "논리 → 실제 변환 단계(p.34) — MMU 하드웨어가 수행(필기)",
    topic: "주소 변환",
    type: "order",
    difficulty: 2,
    slideRef: "Ch07 p.34",
    prompt: "페이징에서 **논리주소 → 실제주소** 변환 단계를 순서대로 배치하시오.",
    items: [
      "논리주소 / 페이지 크기 = 페이지 번호",
      "논리주소 % 페이지 크기 = offset",
      "페이지 번호를 index로 페이지 테이블에서 프레임 번호를 찾음",
      "프레임 번호 × 프레임 크기 = 프레임 시작주소",
      "프레임 시작주소 + offset = 실제주소",
    ],
    explanation: "p.34의 단계 그대로다. 교수님 필기 기준: 이 과정을 MMU 하드웨어 장치가 한다.",
  },
  {
    ...base,
    ...star,
    id: "os-ch07-translation-008",
    summary: "논리 → 실제: 페이지 번호를 페이지 테이블의 index로 쓴다(p.34)",
    topic: "주소 변환",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.34",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "논리주소 → 실제주소 변환에서는 페이지 번호를 페이지 테이블의 {{0}}로 사용하여 프레임 번호를 찾는다.",
    blanks: [{ accept: ["index", "인덱스", "배열 인덱스", "색인", "index(인덱스)"] }],
    explanation: "p.34: Page table에서 페이지 번호를 index로 사용하여 테이블에서 프레임 번호를 찾는다. p.31: 페이지 번호 = 배열 인덱스.",
  },
  pagingGen.generate(1, { variant: "p2l", pageSize: 4096 }),
  pagingGen.generate(2, { variant: "solve", pageSize: 2048 }),

  // ───────────────────────────── 페이지 크기 2^k 비트 분해 (p.33, p.37)
  {
    ...base,
    ...plain,
    id: "os-ch07-bit-slice-001",
    topic: "페이지 크기 2^k 비트 분해",
    type: "calc",
    difficulty: 3,
    slideRef: "Ch07 p.33",
    prompt:
      "Figure 7.11(a): 16비트 논리주소 `000001|0111011110`(상위 6비트 페이지 번호, 하위 10비트 offset), 페이지 테이블 `0→000101, 1→000110, 2→011001`(2진수). 실제주소를 **10진수**로 구하시오.",
    answer: fig711.physical!,
    tolerance: 0,
    steps: [
      `페이지 번호 = 000001₂ = ${fig711.page}, offset = 0111011110₂ = ${fig711.offset}`,
      `페이지 테이블[1] = 000110₂ = 프레임 ${fig711.frame}`,
      `실제주소 = 000110|0111011110₂ = ${fig711.frame} × 1024 + ${fig711.offset} = ${fmt(fig711.physical!)}`,
    ],
    explanation:
      "p.33: 상위 6비트(페이지 번호)를 프레임 번호로 바꾸고 하위 10비트 offset은 그대로 붙인다. MMU가 이 과정을 H/W적으로 자동 실행한다. 교수님 필기 기준: 곱하기·나누기로 하면 시간이 오래 걸린다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-bit-slice-002",
    topic: "페이지 크기 2^k 비트 분해",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.37",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "페이지 크기가 2^k이면 논리주소의 하위 k비트는 {{0}}이고, 나머지 상위 비트는 {{1}}이다.",
    blanks: [
      { accept: ["오프셋", "offset", "페이지 내 오프셋", "페이지 내 offset"] },
      { accept: ["페이지 번호", "페이지번호", "page number", "page #", "페이지 넘버"] },
    ],
    explanation: "p.37: 페이지 크기 = 2ᵏ이면 논리주소 하위 k비트 = 오프셋, 상위 비트 = 페이지 번호. 나눗셈·모듈로 없이 비트 슬라이싱만으로 분해한다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-bit-slice-003",
    topic: "페이지 크기 2^k 비트 분해",
    type: "calc",
    difficulty: 2,
    slideRef: "Ch07 p.37",
    prompt: "16비트 논리주소에서 페이지 크기가 **2KB(2^11)**이면 페이지 번호는 몇 비트인가?",
    answer: bitSplit(0, 16, 2 * KB).pageBits,
    tolerance: 0,
    unit: "비트",
    steps: ["offset 비트 = log₂(2048) = 11", `페이지 번호 비트 = 16 − 11 = ${bitSplit(0, 16, 2 * KB).pageBits}`],
    explanation: "p.37 예(16비트, 1024 = 2¹⁰ → 하위 10비트 offset, 상위 6비트 페이지 번호)와 같은 방법으로, 페이지가 2배 커지면 offset이 1비트 늘고 페이지 번호가 1비트 준다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-bit-slice-004",
    topic: "페이지 크기 2^k 비트 분해",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.37",
    prompt: "페이지 크기를 항상 **2의 거듭제곱**으로 하는 이유로 옳은 것은?",
    choices: [
      "나눗셈·모듈로 없이 주소를 비트로 잘라(비트 슬라이싱) 페이지 번호와 offset을 얻을 수 있어 MMU가 즉시 처리하기 때문",
      "페이지 크기 1000처럼 10의 거듭제곱보다 내부 단편화가 항상 작기 때문",
      "페이지 테이블이 필요 없어지기 때문",
      "2의 거듭제곱이 아니면 프로그램을 페이지로 나눌 수 없기 때문",
    ],
    answerIndex: 0,
    explanation:
      "p.37: 페이지 크기 = 2ᵏ이면 하위 k비트·상위 비트로 바로 분해되어 MMU가 하드웨어로 즉시 처리한다(빠름). 그래서 페이지 크기는 항상 2의 거듭제곱이며, 슬라이드의 1000은 암산 편의용 예시일 뿐이다. 페이지 테이블은 여전히 필요하다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-bit-slice-005",
    topic: "페이지 크기 2^k 비트 분해",
    type: "trace",
    difficulty: 2,
    slideRef: "Ch07 p.37",
    prompt: "16비트 논리주소, 페이지 크기 1024(2^10)일 때 각 주소를 비트로 나눈 페이지 번호와 offset을 채우시오. (첫 행은 p.37 예시)",
    columns: ["이진수 (상위 6비트 | 하위 10비트)", "페이지 번호", "offset"],
    rows: BIT_ROWS.map((r, i) => ({
      label: `논리주소 ${fmt(BIT_ADDRS[i])}`,
      cells: [
        { value: `${r.binary.slice(0, r.pageBits)} | ${r.binary.slice(r.pageBits)}` },
        { value: String(r.page), ...(i > 0 ? { blank: true } : {}) },
        { value: String(r.offset), ...(i > 0 ? { blank: true } : {}) },
      ],
    })),
    explanation: "p.37: 논리주소 3 = 000000 | 0000000011 → 페이지 0, 오프셋 3. 상위 6비트를 그대로 읽으면 페이지 번호, 하위 10비트를 읽으면 offset이다(나눗셈 결과와 같다).",
  },

  // ───────────────────────────── 기본 세그먼테이션 (p.38-41)
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-001",
    topic: "기본 세그먼테이션",
    type: "calc",
    difficulty: 2,
    slideRef: "Ch07 p.41",
    prompt:
      "세그먼트 최대 크기 1024, 세그먼트 테이블 `0: (시작주소 1024, 길이 100), 1: (2048, 200), 2: (x, 150)`일 때 **논리주소 3**의 실제주소는?",
    answer: seg41.physical!,
    tolerance: 0,
    steps: [
      `세그먼트 번호 = 3 / 1024 = ${seg41.segment}, offset = ${seg41.offset}`,
      "길이 검사: offset 3 < 길이 100 → 정상",
      `실제주소 = 시작주소 1024 + 3 = ${seg41.physical}`,
    ],
    explanation:
      "p.41: 세그먼트 번호를 index로 테이블에서 세그먼트 시작주소를 찾아 offset을 더한다. 교수님 필기 기준: 페이징과의 유일한 차이는 프레임 번호가 아닌 세그먼트 시작주소를 쓴다는 것이다(프레임 번호 × 크기를 하지 않음).",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-002",
    topic: "기본 세그먼테이션",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.41",
    prompt: "같은 세그먼트 테이블(`0: (1024, 길이 100), 1: (2048, 200), 2: (x, 150)`, 최대 크기 1024)에서 **논리주소 120**에 접근하면?",
    choices: [
      segTrap.trap ? "보호 위반(트랩)이 발생한다" : fmt(segTrap.physical),
      "실제주소 1,144에 접근한다",
      "실제주소 2,168에 접근한다",
      "실제주소 120에 접근한다",
    ],
    answerIndex: 0,
    explanation:
      "p.41: 세그먼트 0, offset 120. offset ≥ 세그먼트 길이(100)이면 보호 위반(트랩)이다. 1,144는 길이 검사를 빼먹고 시작주소 1024에 더한 값, 2,168은 세그먼트 1을 쓴 값이다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-003",
    topic: "기본 세그먼테이션",
    type: "calc",
    difficulty: 3,
    slideRef: "Ch07 p.40",
    prompt:
      "Figure 7.12(b): 16비트 논리주소 `0001|001011110000`(상위 4비트 세그먼트 번호, 하위 12비트 offset), 세그먼트 1 = (길이 `011110011110`₂, 시작주소 `0010000000100000`₂). 실제주소를 **10진수**로 구하시오.",
    answer: fig712.physical!,
    tolerance: 0,
    steps: [
      `세그먼트 번호 = 0001₂ = ${fig712.segment}, offset = 001011110000₂ = ${fig712.offset}`,
      `길이 011110011110₂ = ${FIG712_TABLE[1].length} → offset ${fig712.offset} < ${FIG712_TABLE[1].length} 정상`,
      `실제주소 = 시작주소 ${FIG712_TABLE[1].base} + ${fig712.offset} = ${fmt(fig712.physical!)} (= 0010001100010000₂)`,
    ],
    explanation: "p.40: 세그먼트 번호로 테이블에서 길이와 시작주소(base)를 꺼내, offset을 시작주소에 더한다(+ 기호). 페이징처럼 비트를 이어 붙이는 것이 아니라 덧셈이다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-004",
    topic: "기본 세그먼테이션",
    type: "blank",
    difficulty: 1,
    slideRef: "Ch07 p.40-41",
    prompt: "빈칸에 알맞은 말을 쓰시오.",
    text: "세그먼트 테이블의 각 엔트리는 세그먼트 {{0}}와 세그먼트 {{1}}로 이루어지며, 앞의 값은 offset이 범위를 넘는지 검사(보호)하는 데 쓰인다.",
    blanks: [
      { accept: ["길이", "length", "세그먼트 길이"] },
      { accept: ["시작주소", "시작 주소", "base", "베이스", "기준 주소", "세그먼트 시작주소"] },
    ],
    explanation: "p.40: 세그먼트 길이(Length) + 세그먼트 시작주소(Base). p.41: offset ≥ 세그먼트 길이면 보호 위반(트랩).",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-005",
    topic: "기본 세그먼테이션",
    type: "ox",
    difficulty: 2,
    slideRef: "Ch07 p.38",
    prompt: "세그먼트마다 길이가 달라 세그먼테이션은 동적 분할과 유사하고, 그래서 압축(compaction)이 필요하다.",
    answer: true,
    explanation: "p.38: 세그먼트들의 크기가 같지 않으므로 세그먼테이션은 동적 분할과 유사하다 → 압축 필요. 그래서 단독으로 잘 안 쓰고 페이징과 결합해 사용된다.",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-006",
    topic: "기본 세그먼테이션",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.41",
    prompt: "페이징과 세그먼테이션의 **논리→실제 주소 변환 방법의 차이**로 옳은 것은?",
    choices: [
      "페이징은 테이블에서 얻은 프레임 번호에 크기를 곱하지만, 세그먼테이션은 테이블의 세그먼트 시작주소에 offset을 바로 더한다",
      "세그먼테이션은 테이블을 쓰지 않는다",
      "페이징은 offset을 쓰지 않는다",
      "세그먼테이션은 논리주소를 그대로 실제주소로 쓴다",
    ],
    answerIndex: 0,
    explanation:
      "교수님 필기 기준(p.41): 유일한 차이는 세그먼트 번호(프레임 번호)가 아닌 세그먼트 시작주소를 쓴다는 것이다. p.34 페이징: 프레임 번호 × 프레임 크기 + offset, p.41 세그먼테이션: 세그먼트 시작주소 + offset(길이 검사 포함).",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-007",
    topic: "기본 세그먼테이션",
    type: "ox",
    difficulty: 1,
    slideRef: "Ch07 p.38",
    prompt: "오늘날 운영체제는 페이징 대신 세그먼테이션을 단독으로 쓰는 것이 일반적이다.",
    answer: false,
    falseReason: "p.38: 세그먼테이션은 압축이 필요해 단독으로 잘 안 쓰고 페이징과 결합해 사용된다. 필기: 오늘날은 실질적으로 세그먼테이션을 쓰지 않고 페이지 시스템을 쓴다.",
    explanation: "세그먼트별 보호/공유가 가능하다는 장점은 있다(p.38).",
  },
  {
    ...base,
    ...plain,
    id: "os-ch07-segmentation-008",
    topic: "기본 세그먼테이션",
    type: "order",
    difficulty: 2,
    slideRef: "Ch07 p.41",
    prompt: "세그먼테이션의 **논리주소 → 실제주소** 변환 단계를 순서대로 배치하시오.",
    items: [
      "논리주소 / 세그먼트 최대 크기 = 세그먼트 번호",
      "논리주소 % 세그먼트 최대 크기 = 세그먼트 내 offset",
      "세그먼트 번호를 index로 테이블에서 세그먼트 시작주소를 찾음",
      "offset < 세그먼트 길이인지 검사(아니면 보호 위반 트랩)",
      "세그먼트 시작주소 + offset = 실제주소",
    ],
    explanation: "p.41의 단계 그대로다. 길이 검사를 통과해야 시작주소에 offset을 더한다.",
  },
  segmentationGen.generate(1, { trap: true }),
];

export default questions;

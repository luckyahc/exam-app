import type { Question } from "@/types/question";
import { block, jokboOf, y22, y23 } from "./jokboSource";

// Ch07 족보 문항(원문 그대로) — 목록·판정: docs/jokbo/os/inventory.md, 대조 기록: docs/verification/os-jokbo.md
// 계산·추적 정답(버디·배치·주소 변환)은 data/subjects/os/jokbo.test.ts가 lib/sim/os로 다시 계산해 확인한다.
const base = { subject: "os", chapter: "ch07", shuffle: false } as const;

const BUDDY_HEAD = "다음은 Buddy 시스템에 의해 관리되는 메모리 할당상태이다. ###로 칠해진 영역은 이미 할당된 메모리 block이고 흰색 영역은 free한 영역이다.";
const FIT_HEAD =
  "다음은 시스템의 현재 메모리 할당상태이다. ###로 칠해진 영역은 이미 할당된 메모리 block이고 A, B, C, D 영역은 free 영역이며, 각각의 크기는 영역 바로 위해 표시되어 있고 마지막으로 할당된 block은 A와 B 사이의 영역이다.";
const FIT_BEFORE = block(" 18K         17K      16K    20K", "| A |######| B |###| C |##| D |");
const FIT_ASK = "이 상태에서 새로 15KB에 대한 메모리 요청이 들어 와서 메모리를 할당해 주었더니 아래와 같은 상태가 되었다. 이때 사용한 메모리 할당 알고리즘은 무엇인가?";

const questions: readonly Question[] = [
  {
    ...base,
    ...jokboOf([y22(32), y23(5)], "buddy"),
    id: "os-ch07-jokbo-001",
    topic: "버디 시스템",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.21-24",
    prompt: `${BUDDY_HEAD} 이 상태에서 두 번째와 네 번째 128K(*표시)가 순서적으로 반납되었을 때 이후의 메모리 상태를 [올바르게] 표현한 것은?\n${block(" 128K   128K*  128K   128K*", "|######|######|      |######|")}`,
    choices: [
      block(" 128K        384K", "|######|                    |"),
      block(" 128K   128K   128K   128K", "|######|      |      |      |"),
      block(" 128K       256K        128K", "|######|             |      |"),
      block(" 128K   128K        256K", "|######|      |             |"),
    ],
    answerIndex: 3,
    explanation:
      "p.21-24: 버디 시스템은 반납된 블록과 그 짝(buddy) 블록이 둘 다 free일 때만 합친다. 두 번째 128K(128~256K)의 짝은 첫 번째 128K(할당 중)라 합쳐지지 않는다. 네 번째 128K(384~512K)의 짝은 세 번째 128K(free)라 256K로 합쳐진다. 결과: 128K(할당) | 128K(free) | 256K(free). 두 번째와 세 번째 128K는 서로 짝이 아니므로 256K로 합칠 수 없다. 2023 캡처는 보기 3~5가 잘려 있어 보기는 2022 원문(같은 문제)을 썼다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y22(33), y23(47)], "buddy"),
    id: "os-ch07-jokbo-002",
    topic: "버디 시스템",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.21-24",
    prompt: `${BUDDY_HEAD} 이 상태에서 129K가 새로 요청되었을 때 이를 할당한 후의 메모리 상태는?\n${block(" 128K   128K        256K", "|######|      |             |")}`,
    choices: [
      block(" 128K   128K   129K   127K", "|######|      |######|      |"),
      block(" 128K   128K        256K", "|######|      |#############|"),
      block(" 128K       256K        128K", "|######|#############|      |"),
      block(" 128K   129K   127K   128K", "|######|######|      |      |"),
    ],
    answerIndex: 1,
    explanation:
      "p.21-24: 버디 시스템은 요청 크기 이상인 가장 작은 2^k 블록을 준다. 129K > 128K이므로 256K 블록 전체가 할당된다(남는 127K는 내부 단편화). 블록을 129K·127K처럼 2의 거듭제곱이 아닌 크기로 쪼갤 수 없고, 128K free 칸에는 129K가 들어가지 않는다. 2023 캡처는 보기 일부가 잘려 있어 보기는 2022 원문(같은 문제)을 썼다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(10), y22(28)], "partitioning"),
    id: "os-ch07-jokbo-003",
    topic: "고정 분할 / 동적 분할",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch07 p.14-19",
    prompt: "Dynamic memory partitioning(Buddy system 제외)과 관련한 다음 설명 중 [틀린] 것을 [두 개] 고르시오.",
    choices: [
      "가상기억장치의 placement policy로 사용될 수 있다.",
      "Best-fit의 경우 가장 적합한 크기의 메모리를 할당하므로 메모리 compaction이 필요 없다.",
      "때때로 memory compaction이 필요하다.",
      "Partition들은 크기도 다양하고 개수도 가변적이다.",
      "External fragmentation이 발생할 수 있지만 best-fit에서는 발생하지 않는다.",
    ],
    answerIndexes: [1, 4],
    explanation:
      "p.14: 동적 분할은 분할의 길이와 개수가 가변적이고, 결국 빈 구멍(외부 단편화)이 생겨 compaction이 필요하다. p.16: Best-fit은 딱 맞는 블록을 찾다 보니 다른 프로그램에게 줄 수 없는 작은 조각(외부 단편화)을 가장 많이 만든다 — compaction이 필요 없거나 외부 단편화가 없다는 말은 틀리다. Ch08 p.40: 세그먼테이션 가상기억장치의 배치 정책은 동적 분할(4가지 Fit)을 참조한다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(46), y22(29)], "partitioning"),
    id: "os-ch07-jokbo-004",
    topic: "배치 알고리즘",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch07 p.16-19",
    prompt: "Dynamic memory partitioning 알고리즘과 관련한 다음 설명 중 [틀린] 것은?",
    choices: [
      "Best-fit은 계속해서 가장 작은 fragmentation들을 발생시킨다.",
      "Next-fit은 마지막으로 할당한 메모리의 위치를 기억하고 있어야 한다.",
      "가장 구현하기가 쉽고, 빠른 알고리즘은 first-fit이다.",
      "Worst-fit은 가장 큰 빈 블록에서 요청한 메모리 크기만큼의 영역을 할당해 준다.",
      "성능이 가장 좋은 알고리즘은 best-fit이다.",
    ],
    answerIndex: 4,
    explanation:
      "p.16: Best-fit은 성능이 가장 나쁘다(작은 외부 단편화를 가장 많이 만듦). p.17: First-fit이 가장 간단하고 빠르며 성능이 가장 좋다. p.18: Next-fit은 마지막 배치 위치부터 찾는다. p.19: Worst-fit은 가장 큰 빈 블록에 할당한다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(16), y22(30)], "fit"),
    id: "os-ch07-jokbo-005",
    topic: "배치 알고리즘",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.16-19",
    prompt: `${FIT_HEAD}\n${FIT_BEFORE}\n${FIT_ASK}\n${block(" 18K             2K   16K    20K", "| A |######|###|  |###| C |##| D |")}`,
    choices: ["buddy system", "best-fit", "next-fit", "worst-fit", "first-fit"],
    answerIndex: 2,
    explanation:
      "p.18: Next-fit은 마지막으로 할당한 위치(A와 B 사이 block) 다음부터 찾아 처음 맞는 블록 B(17K)에 15K를 넣는다 → B 자리에 15K 할당, 2K 남음. First-fit이면 A(18K), Best-fit이면 C(16K), Worst-fit이면 D(20K)에 들어갔을 것이고, buddy system은 2의 거듭제곱 크기로 할당한다. 2022 LMS 정답과 일치(lib/sim/os/placement로 확인).",
  },
  {
    ...base,
    ...jokboOf([y22(31)], "fit"),
    id: "os-ch07-jokbo-006",
    topic: "배치 알고리즘",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.16-19",
    prompt: `${FIT_HEAD}\n${FIT_BEFORE}\n${FIT_ASK}\n${block(" 18K         17K      16K       5K", "| A |######| B |###| C |##|####|  |")}`,
    choices: ["best-fit", "worst-fit", "next-fit", "first-fit", "buddy system"],
    answerIndex: 1,
    explanation:
      "p.19: Worst-fit은 가장 큰 빈 블록 D(20K)에 15K를 넣는다 → D 자리에 15K 할당, 5K 남음. Next-fit이면 B(17K), First-fit이면 A(18K), Best-fit이면 C(16K). 2022 LMS 정답(캡처에서 정답 칸이 가려져 학생 선택·점수 2/2로 판독)과 일치(lib/sim/os/placement로 확인).",
  },
  {
    ...base,
    ...jokboOf([y22(27)], "partitioning"),
    id: "os-ch07-jokbo-007",
    topic: "고정 분할 / 동적 분할",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch07 p.12-13",
    prompt: "Fixed memory partitioning과 관련한 다음 설명 중 [틀린] 것을 [두 개] 고르시오.",
    choices: [
      "아무리 작은 프로그램일지라도 하나의 partition 전체를 할당해 주어야 한다.",
      "구현이 쉽고 빠르지만 때때로 메모리 compaction을 수행해야 한다.",
      "External fragmentation이 발생할 수 있다.",
      "Equal-size partitions과 unequal-size partitions가 있다.",
      "Unequal-size partitions의 경우 특정 크기의 partition은 사용하고자 하는 프로그램들이 많아 대기하는 일이 발생하지만 다른 크기의 partition들은 비어 있는 비효율적인 경우도 발생한다.",
    ],
    answerIndexes: [1, 2],
    explanation:
      "p.13: 고정 분할은 아무리 작은 프로그램이라도 분할 하나를 통째로 차지해 내부 단편화(Internal Fragmentation)가 생긴다 — 외부 단편화와 compaction은 동적 분할(p.14)의 문제다. p.12: 같은 크기·다른 크기 분할이 있고, 다른 크기 분할은 특정 크기에만 대기가 몰리는 비효율이 생길 수 있다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(14), y22(26)]),
    id: "os-ch07-jokbo-008",
    topic: "공유",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.8",
    prompt: "다음 중 메모리 공유(sharing)의 적절한 예가 [아닌] 것은?",
    choices: [
      "여러 프로그램이 동일한 DLL 라이브러리 함수를 사용해도 이 함수 코드는 메모리에 하나만 존재함",
      "2개 이상의 동일한 파워포인트 프로그램이 heap 영역을 공유 영역으로 선언하고 이를 서로 공유할 수 있음",
      "2개 이상의 동일한 아래한글 프로그램이 실행되어도 프로그램 코드는 메모리에 하나만 존재함",
      "하나의 배열을 선언하고 이를 공유 데이타 영역으로 설정하면 여러 프로그램이 이 배열을 공유하여 사용할 수 있음",
    ],
    answerIndex: 1,
    explanation:
      "p.8: 메모리 공유 — 프로그램 코드 공유(PowerPoint 10개 실행 시 프로그램 코드는 공유하고 데이터는 각자 가짐), DLL 라이브러리 코드 공유, 공유 데이터 영역(배열 등)을 통한 데이터 공유. heap은 프로세스마다 따로 있는 동적 할당 영역이라 공유 영역으로 선언해 공유하는 예가 아니다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(19), y22(37)]),
    id: "os-ch07-jokbo-009",
    topic: "기본 페이징",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.27·p.33-34",
    prompt: "다음 중 basic paging system에 대한 설명 중 [옳은] 것은?",
    choices: [
      "프로세스와 실제 메모리를 동일한 크기의 영역으로 분할해 놓은 것을 각각 frames와 pages라 한다.",
      "MMU 장치는 논리주소를 실제주소로 변화하며 메모리 protection 기능까지 제공한다.",
      "한 프로그램의 모든 page들은 메모리의 연속된 공간에 배치되어야 한다.",
      "페이지 테이블은 논리주소를 실제주소로 변환하기 위해 필요하며 MMU가 만들고 관리해 준다.",
      "프로세스에서 사용하는 모든 포인트 변수의 주소 값은 실제 메모리 주소이다.",
    ],
    answerIndex: 1,
    explanation:
      "p.27: 프로세스의 덩어리가 페이지(page), 메모리의 덩어리가 프레임(frame)이고(보기와 반대), 운영체제가 프로세스마다 페이지 테이블을 유지한다. 페이지는 빈 프레임 어디에나 둘 수 있어 연속 배치가 필요 없다. p.33-34: MMU 하드웨어가 논리주소를 실제주소로 바꾸며, p.6: 실행 시점 메모리 보호 검사도 MMU가 수행한다. 포인터 변수의 주소는 논리(가짜) 주소다(p.5). 원문 오타: '변화하며' → '변환하며'. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(35), y22(25)]),
    id: "os-ch07-jokbo-010",
    topic: "보호 / Base·Bounds 레지스터",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.6",
    prompt: "메모리 보호(protection)와 관련한 다음 설명 중 [맞는] 것은?",
    choices: [
      "메모리 보호 기능은 run time보다는 compile time 때 제대로 작동할 수 있다.",
      "메모리 보호는 MMU가 있어야만 구현 가능하다.",
      "내 프로세스가 다른 프로그램 영역을 침범할 때 예외만 발생하고 강제 종료시키지는 않는다.",
      "다른 프로그램이 내 프로세스 영역을 침범할 때 내 프로그램도 일부 영향을 받을 수 있다.",
      "하드웨어의 보조 없이 운영체제의 순수 기능만으로도 충분히 구현할 수 있다.",
    ],
    answerIndex: 1,
    explanation:
      "p.6: 컴파일 시점에는 절대 주소를 검사할 수 없어 실행 시점(run time)에 검사해야 하며, 실행 시점 메모리 보호 검사는 하드웨어(MMU)가 수행한다. 남의 영역을 침범하면 MMU가 CPU에 trap interrupt를 걸어 그 프로그램을 종료시키므로(Ch03 p.42) 내 프로그램 영역은 보호된다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(38), y22(34)], "addr-translate"),
    id: "os-ch07-jokbo-011",
    topic: "주소 변환",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.32-36",
    prompt: `한 page의 크기가 1024인 Paging 기법을 사용하는 메모리 시스템에서 4개의 page로 구성된 process의 page table이 아래와 같다. 이 프로세스의 논리주소 2049번지는 실기억주소 몇 번지로 변환되는가?\n${block("페이지 테이블(첫번째 열은 테이블 인덱스임)", "[0] 1", "[1] 0", "[2] 3", "[3] 2")}`,
    choices: ["2048", "1025", "2049", "3073", "1"],
    answerIndex: 3,
    explanation: "p.32-36: 페이지 번호 = 2049 / 1024 = 2, offset = 2049 % 1024 = 1 → 페이지 테이블[2] = 프레임 3 → 실제주소 = 3 × 1024 + 1 = 3073. 2022 LMS 정답과 일치(lib/sim/os/paging으로 확인).",
  },
  {
    ...base,
    ...jokboOf([y23(40), y22(35)], "addr-translate"),
    id: "os-ch07-jokbo-012",
    topic: "주소 변환",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.32-36",
    prompt: `한 page의 크기가 1024인 Paging 기법을 사용하는 메모리 시스템에서 4개의 page로 구성된 process의 page table이 아래와 같다. 이 프로세스의 실기억주소 2번지로 변환되는 논리주소는 몇 번지인가?\n${block("페이지 테이블(첫번째 열은 테이블 인덱스임)", "[0] 2", "[1] 0", "[2] 3", "[3] 1")}`,
    choices: ["2051", "3074", "1026", "3072", "2"],
    answerIndex: 2,
    explanation:
      "p.32-36: 프레임 번호 = 2 / 1024 = 0, offset = 2 → 페이지 테이블에서 값이 프레임 0인 인덱스는 페이지 1 → 논리주소 = 1 × 1024 + 2 = 1026. 2022 LMS 정답과 일치(lib/sim/os/paging으로 확인).",
  },
  {
    ...base,
    ...jokboOf([y22(36)], "addr-translate"),
    id: "os-ch07-jokbo-013",
    topic: "기본 세그먼테이션",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.41",
    prompt: `시스템 내의 최대 세그먼트 크기가 1024인 Segmentation 기법을 사용하는 메모리 시스템에서 4개의 segmentation으로 구성된 process의 segmentation table이 아래와 같다. 이 프로세스의 논리주소 2051번지는 실기억주소 몇 번지로 변환되는가?\n${block("segmentation 테이블(첫번째 열은 테이블 인덱스이며 세 번째 열이 세그먼트 길이임)", "[0] 1024  768", "[1] 0     512", "[2] 2048  1000", "[3] 512   256")}`,
    choices: ["3", "1027", "3075", "1024", "2051"],
    answerIndex: 4,
    explanation:
      "p.41: 세그먼트 번호 = 2051 / 1024 = 2, offset = 2051 % 1024 = 3 → 세그먼트 테이블[2]의 시작주소 2048, 길이 1000 > offset 3이라 정상 → 실제주소 = 2048 + 3 = 2051. 2022 LMS 정답과 일치(lib/sim/os/segmentation으로 확인).",
  },
  {
    ...base,
    ...jokboOf([y23(45), y22(24)]),
    id: "os-ch07-jokbo-014",
    topic: "재배치",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch07 p.4-5",
    prompt: "메모리 재배치(relocation)와 관련한 다음 설명 중 [틀린] 것은?",
    choices: [
      "메모리 재배치가 있을 경우 논리주소를 실제주소로 변환하는 기능이 반드시 필요하다.",
      "디스크로 프로세스를 swap out한 후 다시 swap in할 때 재배치가 일어난다.",
      "메모리 재배치가 발생해도 프로그램에서 사용하는 포인터 변수의 주소 값은 영향을 받지 않는다.",
      "메모리 compaction할 때 재배치가 일어난다.",
      "first-fit, best-fit, next-fit 알고리즘들을 사용하는 시스템에서는 페이징 기법을 사용하기 때문에 메모리 재배치가 필요 없다.",
    ],
    answerIndex: 4,
    explanation:
      "p.4: 재배치는 Disk swap out 후 다시 swap in할 때와 Memory compaction 때 일어나며, 논리주소 → 실제주소 변환이 필요하다. p.5: 프로그램이 쓰는 주소(포인터 변수 포함)는 가짜(논리) 주소라 재배치되어도 바뀌지 않는다. first/best/next-fit은 동적 분할의 배치 알고리즘으로 페이징이 아니며, 동적 분할에서도 compaction·swap 때 재배치가 필요하다. 2022 LMS 정답과 일치.",
  },
];

export default questions;

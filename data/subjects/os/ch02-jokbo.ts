import type { Question } from "@/types/question";
import { jokboOf, y22, y23 } from "./jokboSource";

// Ch02 족보 문항(원문 그대로) — 목록·판정: docs/jokbo/os/inventory.md, 대조 기록: docs/verification/os-jokbo.md
const base = { subject: "os", chapter: "ch02", shuffle: false } as const;

const questions: readonly Question[] = [
  {
    ...base,
    ...jokboOf([y23(4), y22(4)]),
    id: "os-ch02-jokbo-001",
    topic: "커널 / 시스템 프로그램",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch02 p.10-11",
    prompt: "운영체제의 구성요소에 대한 다음 설명 중 [틀린] 것을 [세 개] 고르시오.",
    choices: [
      "커널은 프로세스관리, 가상기억장치, 파일시스템, 네트워크, 프로세서 스케줄링 등의 구성요소를 포함한다.",
      "커널은 가장 중요한 시스템 프로그램들의 집합이다.",
      "운영체제는 크게 커널과 시스템 프로그램으로 구성된다.",
      "커널은 메모리에 로드되는 시간을 줄이기 위해 부팅된 후 응용프로그램의 실행 시 필요할 때 그때 그때 메모리에 로드된다.",
      "커널은 인터럽트 발생에 의해서만 실행될 수 있다.",
    ],
    answerIndexes: [1, 3, 4],
    explanation:
      "p.10: OS = 커널 + 시스템 프로그램 — 커널은 메모리에 상주(시스템 부팅 시 메모리에 설치되는 함수들의 집합)하고, 시스템 프로그램은 디스크에 실행 파일로 존재한다. 따라서 커널을 '시스템 프로그램들의 집합'이라 하거나 '필요할 때마다 로드된다'고 하면 틀리다. p.11: kernel 함수는 응용프로그램이 API 함수를 호출할 때도, I/O 장치에서 데이터가 들어올 때(인터럽트)도 호출되므로 '인터럽트에 의해서만'도 틀리다. p.11: 커널 함수는 Process 관리, Processor 스케줄링, 실기억장치·가상기억장치, 파일 시스템, 네트워크 등을 포함한다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(24), y22(2)]),
    id: "os-ch02-jokbo-002",
    topic: "OS 정의 / 3대 목표",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch02 p.3-6",
    prompt: "운영체제의 목적에 관한 설명 중 [잘못]된 것을 [두 개] 고르시오.",
    choices: [
      "여러 프로세스를 동시에 실행시켜 processor의 이용률을 높인다.",
      "윈도우 창에서 수정하고자 하는 문서를 선택하고 더블클릭하면 해당 프로그램을 자동으로 실행시켜 준다.",
      "하드웨어가 발전하면 이를 지원하기 위해 운영체제도 함께 발전한다.",
      "하드웨어적 에러 발생은 사용자에게 통보해 줄 수 있지만 소프트웨어적 에러는 탐지할 수 없어 통보할 수 없다.",
      "메모리를 여러 프로세스에게 동적으로 할당해 주기 위해 가능하면 많은 메모리 compaction을 실시하도록 메모리를 관리한다.",
    ],
    answerIndexes: [3, 4],
    explanation:
      "p.6: 운영체제가 제공하는 서비스 '오류 탐지 및 대응'에는 하드웨어 오류뿐 아니라 소프트웨어 오류(산술 오버플로우, 0으로 나누기, 접근이 금지된 메모리 영역 접근)도 있다. compaction은 메모리 조각을 모으려고 모든 프로그램을 옮기는 비싼 작업(Ch07 p.4)이라 '가능하면 많이' 하는 것이 목적이 아니다. 효율성(이용률 향상)·편리성(사용하기 쉽게)·발전성(하드웨어 발전에 맞춰 발전)은 운영체제의 목표(p.3). 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(44), y22(3)]),
    id: "os-ch02-jokbo-003",
    topic: "OS 서비스(편리성)",
    type: "multi",
    difficulty: 1,
    slideRef: "Ch02 p.5-6",
    prompt: "운영체제에 의해 제공되는 서비스가 [아닌] 것을 [두 개] 고르시오.",
    choices: ["Virus detection and deletion", "Program development tools(editors and debuggers)", "Access to I/O devices", "Accounting (collect usage statistics)", "Access to data base"],
    answerIndexes: [0, 4],
    explanation:
      "p.5-6: 운영체제가 제공하는 서비스 — 프로그램 개발 도구, 프로그램 실행, I/O 장치 접근, 파일 접근, 시스템 접근, 오류 탐지 및 대응, 사용 통계 관리(Accounting). p.6 필기: \"바이러스, ai, db체킹 등 운영체제가 지원하지 않는것 고르는걸로 시험에 나올수있음\" — 바이러스 검사·데이터베이스 접근은 운영체제 서비스가 아니다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(25), y22(6)], "mp-ts"),
    id: "os-ch02-jokbo-004",
    topic: "단일 vs 다중프로그래밍",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch02 p.14·p.21",
    prompt: "Multiprogramming system에 대한 설명 중 [틀린] 것은?",
    choices: [
      "응답시간을 최소화하는 것이 주 목적임",
      "현재 실행중인 프로세스가 완료하거나 기다리던 데이터가 들어 올 때 process switch 발생",
      "I/O 함수 호출시 장치에 데이터가 없을 경우 process switch 발생",
      "시분할처리 기능은 제공하지 않음",
      "여러 프로그램을 동시에 실행시키며 멀티태스킹이라고도 함",
    ],
    answerIndex: 0,
    explanation:
      "p.21: 다중프로그램 일괄처리의 목표는 CPU 이용률 최대화이고, 응답시간 최소화는 시분할 시스템의 목표다. p.14: 프로그램이 종료하거나 I/O 입력 대기일 때 CPU를 넘기며, 시분할(타이머에 의한 강제 선점) 기능은 없다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(29), y22(7)], "mp-ts"),
    id: "os-ch02-jokbo-005",
    topic: "단일 vs 다중프로그래밍",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch02 p.20-21",
    prompt: "Time sharing system에 대한 설명 중 [틀린]것을 [두 개] 고르시오.",
    choices: [
      "Response time을 최소화하는 것이 주 목적임",
      "유닉스와 MS Windows NT와 같은 서버시스템들은 이 범주에 속하지만 PC용 MS Windows는 여기에 포함되지 않음",
      "주어진 time quantum을 모두 소진하지 않아도 process switch 발생할 수 있음",
      "대화형 프로그램보다는 배치작업(batch jobs)들을 연속적으로 빠르게 실행시키고자 하는 시스템",
      "I/O 함수 호출시 장치에 데이터가 없을 경우 process switch 발생",
    ],
    answerIndexes: [1, 3],
    explanation:
      "p.20: 시분할 시스템은 여러 대화형 프로그램을 동시 실행하며, 예로 Unix(macOS)·Linux·MS Windows·Android·iOS — PC용 Windows도 포함된다. 배치작업 연속 실행은 일괄처리 시스템의 특징. p.21: 시분할의 목표는 응답시간 최소화. p.20: 종료·I/O 입력 대기 때도 CPU를 넘기므로 time slice를 다 쓰지 않아도 switch가 일어난다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y23(7), y22(10)], "response-time"),
    id: "os-ch02-jokbo-006",
    topic: "시간 계산(응답시간/유효 CPU 이용률)",
    type: "mcq",
    difficulty: 3,
    slideRef: "Ch02 p.20-23",
    prompt:
      "A와 B, 두 개의 프로그램만이 시스템 내에 존재한다고 가정하자. A는 I/O 작업 없이 계산만 하며 B는 0.2초마다 계산 결과를 화면에 출력한다. 두 프로그램 모두 실행시간은 1초가 소요되며, 처음 우선순위는 A가 B보다 더 높다. Time Sharing System에서 프로그램 B의 response time은 얼마인가? (time slice는 0.1초이며, CPU 스위칭에 소요된 시간은 무시하라.)",
    choices: ["0.4", "1.4", "1.2", "0.3", "2.0"],
    answerIndex: 0,
    explanation:
      "p.20: 시분할은 time slice(0.1초)마다 번갈아 실행한다. A 0~0.1, B 0.1~0.2(B 누적 0.1), A 0.2~0.3, B 0.3~0.4(B 누적 0.2) → B의 첫 출력은 0.4초. 0.3은 B가 첫 slice 안에서 출력한다고 잘못 본 값. 2022 LMS 정답과 일치(0.1초 단위 RR로 계산 — data/subjects/os/jokbo.test.ts).",
  },
  {
    ...base,
    ...jokboOf([y23(22), y22(9)], "response-time"),
    id: "os-ch02-jokbo-007",
    topic: "시간 계산(응답시간/유효 CPU 이용률)",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch02 p.14·p.21-22",
    prompt:
      "A와 B, 두 개의 프로그램만이 시스템 내에 존재한다고 가정하자. A는 I/O 작업 없이 계산만 하며 B는 0.2초마다 계산 결과를 화면에 출력한다. 두 프로그램 모두 실행시간은 1초가 소요되며, 처음 우선순위는 A가 B보다 더 높다. Multiprogramming system에서 프로그램 B의 response time은 얼마인가? (time slice는 0.1초이며, CPU 스위칭에 소요된 시간은 무시하라.)",
    choices: ["0.3", "0.4", "2.0", "1.2", "1.4"],
    answerIndex: 3,
    explanation:
      "p.14: 다중프로그램 일괄처리는 실행 중인 프로그램이 종료하거나 I/O 입력 대기일 때만 CPU를 넘긴다(시분할 기능 없음). A는 I/O가 없어 1초 동안 끝까지 실행되고, B는 1초에 시작해 0.2초 실행 후 첫 출력 → 1.2초(time slice 0.1초는 쓰이지 않음). 2022 LMS 정답과 일치(FCFS로 계산 — data/subjects/os/jokbo.test.ts).",
  },
  {
    ...base,
    ...jokboOf([y22(1)]),
    id: "os-ch02-jokbo-008",
    topic: "OS 정의 / 3대 목표",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch02 p.2·p.11",
    prompt: "운영체제에 대한 다음 설명 중 [잘못]된 것은?",
    choices: [
      "응용프로그램의 실행을 제어하는 거대한 프로그램 또는 함수들의 집합이다.",
      "응용프로그램들과 하드웨어의 중간 위치에서 인터페이스 역할을 담당한다.",
      "데이터베이스, 인공지능, 빅데이타, VR/AR 등은 운영체제가 관리하는 자원들이다.",
      "운영체제는 컴퓨터를 편리하게 사용하게 하고 자원을 효율적으로 관리한다.",
      "프로세스, 기억장치, 파일시스템, 네트워크 등을 관리한다.",
    ],
    answerIndex: 2,
    explanation:
      "p.2: 운영체제는 응용프로그램의 실행을 제어하는 (거대한) 함수들의 집합이며 응용프로그램과 하드웨어 사이의 인터페이스다. p.11: 커널 함수는 Process 관리, Processor 스케줄링, 실기억장치·가상기억장치, 파일 시스템, 네트워크 등을 관리한다. 데이터베이스·인공지능·빅데이터·VR/AR은 응용 분야이지 운영체제가 관리하는 자원이 아니다(p.6 필기: db 등은 운영체제가 지원하지 않는 것). 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y22(5)]),
    id: "os-ch02-jokbo-009",
    topic: "단일 vs 다중프로그래밍",
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch02 p.14·p.20",
    prompt: "CPU가 각 프로그램을 일정시간(time slice) 동안 번갈아 가면서 실행시키는 기능을 무엇이라 하는가?",
    choices: ["시분할처리 기능", "다중처리 기능", "멀티프로그래밍 기능", "멀티태스킹 기능", "분산처리 기능"],
    answerIndex: 0,
    explanation:
      "p.14: \"CPU가 각 프로그램을 일정시간 동안 번갈아 가면서 실행시키는 기능(시분할 처리 기능)\" — 다중프로그램 일괄처리에는 이 기능이 없다. p.20: 시분할 시스템은 time quantum(time slice) 동안 번갈아 실행시킨다. 2022 LMS 정답과 일치.",
  },
  {
    ...base,
    ...jokboOf([y22(8)]),
    id: "os-ch02-jokbo-010",
    topic: "시간 계산(응답시간/유효 CPU 이용률)",
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch02 p.21",
    prompt: "사용자 프로그램 실행에 6초, CPU 스위칭에 0.3초, I/O스위칭에 0.7초, 그리고 CPU Idle에 3초가 소요되었다. 이 경우 CPU 이용률은 얼마인가?",
    choices: ["0.6", "0.3", "0.7", "0.8", "0.5"],
    answerIndex: 2,
    explanation:
      "족보 답(0.6)과 다름: p.21의 정의로 CPU 이용률(CPU utilization) = CPU가 바쁜(non-idle) 시간 / 전체 시간 = (6 + 0.3 + 0.7) / 10 = 0.7이다. 0.6 = 6/10은 유효 CPU 이용률(effective CPU utilization = 유효 프로그램 실행시간 / 총 경과시간)로, p.21 예(사용자 7초 + CPU 스위칭 0.6초 + I/O 스위칭 0.4초 + 휴식 2초 → 유효 CPU 이용률 0.7 = 7/10)와 같은 계산이다. 2022 시험은 '유효'를 빼고 물었지만 0.6을 정답으로 채점했으므로, 실제 시험에서는 교수님이 유효 CPU 이용률을 뜻했을 가능성이 크다. 원문 오타: '소요되었었다' → '소요되었다'.",
  },
];

export default questions;

import { batchFirstResponse, switchCount, timeSharingFirstResponse } from "@/lib/sim/os/cpuTime";
import { baseBounds } from "@/lib/sim/os/baseBounds";
import { buddyRequest, createBuddy, simulateBuddy } from "@/lib/sim/os/buddy";
import { GB, invertedEntries, KB, MB, pageTableInfo } from "@/lib/sim/os/memoryCapacity";
import { bitSplit, logicalToPhysical, physicalToLogical, solveFrame } from "@/lib/sim/os/paging";
import { chooseHole, type Hole } from "@/lib/sim/os/placement";
import { clockReplace, enhancedClockVictim, simulateReplacement } from "@/lib/sim/os/replacement";
import { exponentialAverage, type Proc, responseRatio, round2, simulate, timeline } from "@/lib/sim/os/scheduling";
import { segLogicalToPhysical, solveBase } from "@/lib/sim/os/segmentation";
import { workingSet } from "@/lib/sim/os/workingSet";
import type { Question } from "@/types/question";
import { block } from "./jokboSource";

// 단답형(blank) 보강 문항(2026-10-21): 시험 범위 Ch02·03·07·08·09 강의자료에서 뽑은 짧은 답(1~3단어 또는 숫자).
// 후보·중복 판정: docs/os/short-answer-candidates.md, 검증: shortAnswer.test.ts.
// - 계산형 정답은 lib/sim/os 함수로 계산한다(손계산 없음). 해설의 수치도 같은 계산 결과에서 만든다.
// - 용어형 정답 문자열은 슬라이드(source/os/*.pdf)에 실제로 있는 표기를 첫 번째 인정 답안으로 둔다.
// - origin·basedOn 없음(생성 문항, "족보관련" 아님). ⭐은 기존 OS 규칙: 필기 출제 표시 쪽이면 handwritten(+힌트 id),
//   그 밖에 시험 힌트 범위면 exam-hint, Ch09는 힌트가 없어 필기 ⭐ 소주제(HRRN p.22)만 ⭐.
// - 교수님 족보 채점과 이론이 갈리는 지점(유효 CPU 이용률 0.6 vs 0.7 등)은 만들지 않았다.

export type ShortKind = "용어" | "계산" | "공식·목록";

export interface ShortItem {
  kind: ShortKind;
  /** 대표 오답(비슷한 다른 용어·흔한 계산 실수) — 오답 처리되는지 테스트한다 */
  wrong: string[];
  q: Question;
}

const hint = (...hintIds: string[]) => ({ exam: true, examBasis: "exam-hint", hintIds }) as const;
/** 교수님 필기의 출제 표시가 있는 쪽(각 chNN.ts 머리의 ⭐(handwritten) 목록) — 필기 근거를 유지하고 힌트 id만 붙인다 */
const star = (...hintIds: string[]) => ({ exam: true, examBasis: "handwritten", ...(hintIds.length ? { hintIds } : {}) }) as const;
const plain = { exam: false } as const;
/** 해설: 정답 이유 + 헷갈리기 쉬운 오답 1줄 + 근거 줄 */
const why = (reason: string, trap: string, basis: string) => `${reason} 헷갈리기 쉬운 답: ${trap}\n근거: ${basis}`;
const num = (x: number, digits = 2) => String(Math.round(x * 10 ** digits) / 10 ** digits);
const TERM = "다음 빈칸에 알맞은 말을 쓰시오(한국어 또는 영어).";
const NUM = "다음 빈칸에 알맞은 수를 쓰시오(숫자만).";

const C = (chapter: string) => ({ subject: "os", chapter, type: "blank" }) as const;

// ═════════════════════════════════════════════ Ch02 운영체제 개요
const C2 = C("ch02");
const RESP = (n: number, t: number, s: number, out: number) =>
  `프로그램 ${n}개가 있고 각 프로그램의 실행시간은 ${t}초다(I/O 없이 계산만). 내 프로그램은 마지막(${n}번째)에 실행되며, 실행을 시작하고 ${out}초 뒤 첫 결과를 화면에 출력한다. CPU 스위칭 시간은 ${s}초이고 첫 프로그램으로 가는 스위칭도 센다. 프로그램 실행 순서는 프로그램 번호 순서다.`;
const b1 = { n: 8, t: 2, s: 0.02, output: 0.1 };
const t1 = { n: 8, q: 0.1, s: 0.02, output: 0.1 };
const b2 = { n: 5, t: 3, s: 0.05, output: 0.2 };
const t2 = { n: 5, q: 0.2, s: 0.05, output: 0.2 };
const sw = { n: 8, t: 2, q: 0.1 };

const ch02: ShortItem[] = [
  {
    kind: "계산",
    wrong: [num(b1.n * (b1.t + b1.s) + b1.output), num((b1.n - 1) * b1.t + b1.output)],
    q: {
      ...C2,
      ...star("2-10"),
      id: "os-ch02-short-001",
      summary: "일괄처리 첫 응답 = (N−1)×(T+s) + s + 첫 출력 — 앞 프로그램이 모두 끝나야 실행(p.23)",
      topic: "시간 계산(응답시간/유효 CPU 이용률)",
      difficulty: 2,
      slideRef: "Ch02 p.22-23",
      prompt: `${RESP(b1.n, b1.t, b1.s, b1.output)} **다중프로그램 일괄처리(Multiprogrammed Batch)**에서 내 프로그램의 첫 응답시간은 몇 초인가? (숫자만, 소수 둘째 자리까지)`,
      text: "첫 응답시간 = {{0}}초",
      blanks: [{ accept: [num(batchFirstResponse(b1))] }],
      explanation: why(
        `I/O가 없으므로 앞의 ${b1.n - 1}개가 끝나야 내 프로그램이 실행된다. (N−1)×(T+s) + s + 첫 출력 = ${b1.n - 1}×(${b1.t}+${b1.s}) + ${b1.s} + ${b1.output} = ${num(batchFirstResponse(b1))}초.`,
        `내 프로그램 앞의 스위칭(+${b1.s})이나 첫 출력까지의 ${b1.output}초를 빠뜨리기 쉽다.`,
        "Ch02 p.22-23(첫 응답시간 ≈ 9×(0.01+1)+0.01+0.1)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [num(batchFirstResponse({ n: t1.n, t: 2, s: t1.s, output: t1.output })), num(t1.n * (t1.q + t1.s) + t1.output)],
    q: {
      ...C2,
      ...star("2-10"),
      id: "os-ch02-short-002",
      summary: "시분할 첫 응답 = (N−1)×(q+s) + s + 첫 출력 — 앞 프로그램은 time slice만큼만 실행(p.23)",
      topic: "시간 계산(응답시간/유효 CPU 이용률)",
      difficulty: 2,
      slideRef: "Ch02 p.22-23",
      prompt: `${RESP(t1.n, 2, t1.s, t1.output)} **시분할(Time Sharing)**로 ${t1.q}초씩 라운드로빈으로 번갈아 실행할 때 내 프로그램의 첫 응답시간은 몇 초인가? (숫자만, 소수 둘째 자리까지)`,
      text: "첫 응답시간 = {{0}}초",
      blanks: [{ accept: [num(timeSharingFirstResponse(t1))] }],
      explanation: why(
        `앞의 ${t1.n - 1}개가 ${t1.q}초씩만 실행된 뒤 내 차례가 온다. (N−1)×(q+s) + s + 첫 출력 = ${t1.n - 1}×(${t1.q}+${t1.s}) + ${t1.s} + ${t1.output} = ${num(timeSharingFirstResponse(t1))}초.`,
        "프로그램 실행시간(2초)을 그대로 쓰면 일괄처리의 응답시간이 된다 — 시분할은 time slice만큼만 기다린다.",
        "Ch02 p.23(첫 응답시간 ≈ 9×(0.1+0.01)+0.01+0.1)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [num(b2.n * (b2.t + b2.s) + b2.output), num((b2.n - 1) * b2.t + b2.output)],
    q: {
      ...C2,
      ...star("2-10"),
      id: "os-ch02-short-003",
      summary: "일괄처리 첫 응답 = (N−1)×(T+s) + s + 첫 출력(p.23)",
      topic: "시간 계산(응답시간/유효 CPU 이용률)",
      difficulty: 2,
      slideRef: "Ch02 p.22-23",
      prompt: `${RESP(b2.n, b2.t, b2.s, b2.output)} **다중프로그램 일괄처리**에서 내 프로그램의 첫 응답시간은 몇 초인가? (숫자만, 소수 둘째 자리까지)`,
      text: "첫 응답시간 = {{0}}초",
      blanks: [{ accept: [num(batchFirstResponse(b2))] }],
      explanation: why(
        `(N−1)×(T+s) + s + 첫 출력 = ${b2.n - 1}×(${b2.t}+${b2.s}) + ${b2.s} + ${b2.output} = ${num(batchFirstResponse(b2))}초.`,
        `프로그램 수 ${b2.n}을 그대로 곱하면 내 프로그램의 실행시간까지 더하게 된다 — 기다리는 것은 앞의 ${b2.n - 1}개다.`,
        "Ch02 p.23",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [num(t2.n * (t2.q + t2.s) + t2.output), num((t2.n - 1) * t2.q + t2.output)],
    q: {
      ...C2,
      ...star("2-10"),
      id: "os-ch02-short-004",
      summary: "시분할 첫 응답 = (N−1)×(q+s) + s + 첫 출력 — 스위칭 시간 s를 매번 더한다(p.23)",
      topic: "시간 계산(응답시간/유효 CPU 이용률)",
      difficulty: 3,
      slideRef: "Ch02 p.22-23",
      prompt: `${RESP(t2.n, 3, t2.s, t2.output)} **시분할**로 time slice ${t2.q}초씩 라운드로빈으로 실행할 때 내 프로그램의 첫 응답시간은 몇 초인가? (숫자만, 소수 둘째 자리까지)`,
      text: "첫 응답시간 = {{0}}초",
      blanks: [{ accept: [num(timeSharingFirstResponse(t2))] }],
      explanation: why(
        `(N−1)×(q+s) + s + 첫 출력 = ${t2.n - 1}×(${t2.q}+${t2.s}) + ${t2.s} + ${t2.output} = ${num(timeSharingFirstResponse(t2))}초.`,
        `스위칭 시간을 빼면 ${num((t2.n - 1) * t2.q + t2.output)}초가 된다 — 프로그램이 바뀔 때마다 ${t2.s}초씩 든다.`,
        "Ch02 p.23",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(sw.n), String(sw.n * sw.t)],
    q: {
      ...C2,
      ...hint("2-7"),
      id: "os-ch02-short-005",
      topic: "시간 계산(응답시간/유효 CPU 이용률)",
      difficulty: 2,
      slideRef: "Ch02 p.24",
      prompt: `프로그램 ${sw.n}개의 실행시간이 각각 ${sw.t}초(I/O 없이 계산만)이다. **시분할**에서 time slice ${sw.q}초마다 실행할 프로그램을 바꾼다면, 모든 프로그램이 끝날 때까지 CPU 스위칭은 몇 번 일어나는가? (슬라이드 p.24처럼 time slice마다 한 번씩 센다)`,
      text: "스위칭 횟수 = {{0}}번",
      blanks: [{ accept: [String(switchCount(sw, "timesharing"))] }],
      explanation: why(
        `전체 실행시간 ${sw.n}×${sw.t} = ${sw.n * sw.t}초를 time slice ${sw.q}초로 나누면 ${switchCount(sw, "timesharing")}번이다. 다중프로그램 일괄처리라면 종료할 때만 바꾸므로 ${switchCount(sw, "batch")}번이다.`,
        `${switchCount(sw, "batch")}번은 일괄처리의 스위칭 횟수다.`,
        "Ch02 p.24(10개 × 1초 ÷ 0.1초 = 스위칭 100회)",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["CPU", "메모리"],
    q: {
      ...C2,
      ...hint("2-5"),
      id: "os-ch02-short-006",
      topic: "단일 vs 다중프로그래밍",
      difficulty: 2,
      slideRef: "Ch02 p.15",
      prompt: `${TERM} 다중프로그래밍이 필요한 이유를 묻는 슬라이드 제목 "왜 다중프로그래밍인가?"의 첫 줄이다.`,
      text: "{{0}} 장치는 느림 — 그래서 한 작업이 기다리는 동안 다른 작업을 실행한다",
      blanks: [{ accept: ["I/O", "입출력", "IO", "입/출력"] }],
      explanation: why(
        "p.15: I/O 장치는 느리다. 그래서 p.18처럼 한 작업이 I/O를 기다려야 할 때 프로세서가 다른 작업으로 전환한다.",
        "CPU는 빠른 쪽이다 — 느린 것은 I/O 장치다.",
        "Ch02 p.15",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["네트워크", "파일시스템"],
    q: {
      ...C2,
      ...hint("2-3"),
      id: "os-ch02-short-007",
      topic: "커널 / 시스템 프로그램",
      difficulty: 2,
      slideRef: "Ch02 p.11",
      prompt: `${TERM} 커널 함수들을 크게 나눈 목록이다.`,
      text: "Process 관리, Processor 스케줄링, 실기억장치 및 가상기억장치, 파일시스템, 네트워크, {{0}} 함수들, I/O device 드라이버",
      blanks: [{ accept: ["윈도우 관리", "윈도우관리", "window 관리", "window management", "창 관리"] }],
      explanation: why(
        "p.11: 커널은 Process 관리, Processor 스케줄링, 실기억·가상기억장치, 파일시스템, 네트워크, 윈도우 관리 함수들, I/O device 드라이버를 관리하는 함수들의 집합이다.",
        "디바이스 드라이버는 목록의 마지막 항목으로 이미 나와 있다.",
        "Ch02 p.11",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["CPU", "MMU"],
    q: {
      ...C2,
      ...hint("2-1"),
      id: "os-ch02-short-008",
      topic: "발전성",
      difficulty: 2,
      slideRef: "Ch02 p.9",
      prompt: `${TERM} 운영체제가 끊임없이 발전하는 이유 중 '하드웨어 업그레이드와 새로운 하드웨어의 등장'의 예다.`,
      text: "새 프로세서·대용량 메모리·새 장치(SSD·{{0}}·네트워크 등)가 계속 나옴",
      blanks: [{ accept: ["GPU", "그래픽 처리 장치", "그래픽카드", "그래픽 카드"] }],
      explanation: why(
        "p.9: 새 프로세서·대용량 메모리·새 장치(SSD·GPU·네트워크 등)가 계속 나오므로 운영체제가 이를 지원하도록 확장된다.",
        "MMU는 같은 쪽의 다른 예(MMU 도입 → 페이징 기반 가상메모리 지원)다.",
        "Ch02 p.9",
      ),
    },
  },
];

// ═════════════════════════════════════════════ Ch03 프로세스
const C3 = C("ch03");
const ch03: ShortItem[] = [
  {
    kind: "용어",
    wrong: ["FIFO", "선입선출"],
    q: {
      ...C3,
      ...hint("3-6"),
      id: "os-ch03-short-001",
      topic: "스택에 저장되는 것",
      difficulty: 2,
      slideRef: "Ch03 p.31",
      prompt: `${TERM} 약어로 써도 된다.`,
      text: "각 프로세스는 하나 이상의 {{0}} 시스템 스택을 가지며, 스택은 함수 매개변수·지역 변수·복귀 주소를 저장한다.",
      blanks: [{ accept: ["후입선출", "LIFO", "last in first out", "last-in first-out", "후입 선출"] }],
      explanation: why(
        "p.31: 각 프로세스는 하나 이상의 후입선출(LIFO) 시스템 스택을 가진다 — 마지막에 호출된 함수의 정보가 먼저 빠진다.",
        "FIFO(선입선출)는 큐의 방식이다.",
        "Ch03 p.31",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["프로세스 간 통신", "보호"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-002",
      topic: "PCB 3대 구성",
      difficulty: 2,
      slideRef: "Ch03 p.34",
      prompt: `${TERM} 프로세스 제어 정보(Process Control Information)의 한 항목이다.`,
      text: "{{0}}: 프로세스는 접근 가능한 메모리와 실행 가능한 명령어 종류에 대한 권한을 부여받음",
      blanks: [{ accept: ["프로세스 권한", "Process Privileges", "프로세스 특권", "권한"] }],
      explanation: why(
        "p.34: 프로세스 권한(Process Privileges) — 접근 가능한 메모리와 실행 가능한 명령어 종류에 대한 권한이며, 시스템 유틸리티·서비스 사용에도 적용될 수 있다.",
        "프로세스 간 통신은 같은 쪽의 다른 항목(플래그·시그널·메시지)이다.",
        "Ch03 p.34",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["프로세스 권한", "시그널"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-003",
      topic: "PCB 3대 구성",
      difficulty: 2,
      slideRef: "Ch03 p.34",
      prompt: `${TERM} 프로세스 제어 정보(Process Control Information)의 한 항목이다.`,
      text: "{{0}}: 두 독립적인 프로세스 간 통신에 다양한 플래그·시그널·메시지가 연관될 수 있음",
      blanks: [{ accept: ["프로세스 간 통신", "Interprocess Communication", "IPC", "프로세스간 통신", "Inter-process Communication"] }],
      explanation: why(
        "p.34: 프로세스 간 통신(Interprocess Communication) — 두 독립적인 프로세스 간 통신에 플래그·시그널·메시지가 연관될 수 있다.",
        "시그널은 이 항목에 연관되는 수단의 하나일 뿐 항목 이름이 아니다.",
        "Ch03 p.34",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["연결 리스트", "프로세스 트리"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-004",
      topic: "PCB 3대 구성",
      difficulty: 3,
      slideRef: "Ch03 p.33",
      prompt: `${TERM} 프로세스 제어 정보(Process Control Information)의 한 항목이다.`,
      text: "{{0}}: 여러 연결 리스트에 대한 포인터 — 프로세스는 큐·링 등으로 다른 프로세스와 연결되거나 부모-자식 관계를 가질 수 있음",
      blanks: [{ accept: ["데이터 구조화", "Data Structuring", "데이터구조화"] }],
      explanation: why(
        "p.33: 데이터 구조화 — PCB는 큐·링·부모-자식 관계 같은 구조를 지원하려고 다른 프로세스에 대한 포인터를 가질 수 있다.",
        "연결 리스트는 큐를 구현하는 방법이지 PCB 항목 이름이 아니다.",
        "Ch03 p.33",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["자원 소유 및 사용", "가상 메모리"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-005",
      topic: "PCB 3대 구성",
      difficulty: 2,
      slideRef: "Ch03 p.35",
      prompt: `${TERM} 프로세스 제어 정보(Process Control Information)의 한 항목이다.`,
      text: "{{0}}: 이 프로세스에 배정된 가상 메모리를 나타내는 세그먼트·페이지 테이블에 대한 포인터를 포함할 수 있음",
      blanks: [{ accept: ["메모리 관리", "Memory Management", "메모리관리"] }],
      explanation: why(
        "p.35: 메모리 관리(Memory Management) — 프로세스에 배정된 가상 메모리의 세그먼트·페이지 테이블 포인터.",
        "자원 소유 및 사용은 같은 쪽의 다른 항목(열린 파일·소켓·윈도우 구조체 포인터)이다.",
        "Ch03 p.35",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["메모리 관리", "프로세스 권한"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-006",
      topic: "PCB 3대 구성",
      difficulty: 3,
      slideRef: "Ch03 p.35",
      prompt: `${TERM} 프로세스 제어 정보(Process Control Information)의 한 항목이다.`,
      text: "{{0}}: 프로세스가 제어하는 자원(열린 파일·소켓·윈도우 구조체 포인터 등)과 프로세서나 기타 자원의 사용 이력",
      blanks: [{ accept: ["자원 소유 및 사용", "Resource Ownership and Utilization", "자원 소유", "자원 소유와 사용", "Resource Ownership"] }],
      explanation: why(
        "p.35: 자원 소유 및 사용(Resource Ownership and Utilization) — 열린 파일·소켓·윈도우 구조체 포인터 등과 자원 사용 이력. 이 정보는 스케줄러에 필요할 수 있다.",
        "메모리 관리는 세그먼트·페이지 테이블 포인터를 담는 다른 항목이다.",
        "Ch03 p.35",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["우선순위", "인터럽트"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-007",
      topic: "PCB 3대 구성",
      difficulty: 2,
      slideRef: "Ch03 p.32",
      prompt: `${TERM} 프로세스 제어 정보 중 '스케줄링 및 상태 정보'의 대표 항목이다.`,
      text: "{{0}}: 프로세스가 재개되기 전에 기다리는 이벤트의 식별 정보",
      blanks: [{ accept: ["이벤트", "Event", "대기 이벤트"] }],
      explanation: why(
        "p.32: 스케줄링 및 상태 정보의 대표 항목은 프로세스 상태, 우선순위, 스케줄링 관련 정보, 이벤트(재개 전에 기다리는 이벤트의 식별 정보)다.",
        "우선순위는 스케줄링 우선순위를 나타내는 다른 필드다.",
        "Ch03 p.32",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["blocked", "exit"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-008",
      topic: "PCB 3대 구성",
      difficulty: 3,
      slideRef: "Ch03 p.32",
      prompt: `${TERM} 슬라이드의 영어 표기로 쓴다.`,
      text: "PCB의 프로세스 상태 필드 예: running, ready, waiting, {{0}}",
      blanks: [{ accept: ["halted", "halt", "중지", "정지"] }],
      explanation: why(
        "p.32: 프로세스 상태는 실행 스케줄링 대상이 될 준비 정도를 정의하며, 예로 running, ready, waiting, halted를 든다.",
        "5-상태 모델(p.12)의 Blocked·Exit와 섞기 쉽다 — 이 쪽의 예시 표기는 waiting·halted다.",
        "Ch03 p.32",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["최솟값", "평균값"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-009",
      topic: "PCB 3대 구성",
      difficulty: 3,
      slideRef: "Ch03 p.32",
      prompt: TERM,
      text: "PCB의 우선순위 필드는 시스템에 따라 여러 값이 필요하다. 예: 기본값, 현재값, {{0}}",
      blanks: [{ accept: ["최대허용값", "최대 허용값", "최댓값", "최대값", "최대 허용 값"] }],
      explanation: why(
        "p.32: 우선순위는 하나 이상의 필드로, 예를 들어 기본값·현재값·최대허용값이 있다.",
        "최솟값은 슬라이드 예에 없다.",
        "Ch03 p.32",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["사용자 모드", "보호 모드"],
    q: {
      ...C3,
      ...hint("3-2"),
      id: "os-ch03-short-010",
      topic: "실행 모드 / 커널 모드 전환",
      difficulty: 2,
      slideRef: "Ch03 p.36",
      prompt: TERM,
      text: "높은 권한 모드는 시스템 모드, {{0}} 모드, 또는 커널 모드라고 부른다.",
      blanks: [{ accept: ["제어", "control", "제어 모드", "control mode"] }],
      explanation: why(
        "p.36: 높은 권한 모드 = 시스템 모드, 제어 모드, 또는 커널 모드(운영체제의 커널이 실행). 낮은 권한 모드는 사용자 모드다.",
        "사용자 모드는 낮은 권한 모드다.",
        "Ch03 p.36",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["PCB 초기화", "공간 할당"],
    q: {
      ...C3,
      ...hint("3-2"),
      id: "os-ch03-short-011",
      topic: "생성/종료 시 작업",
      difficulty: 2,
      slideRef: "Ch03 p.37",
      prompt: `${TERM} 프로세스를 생성할 때 하는 일의 첫 단계다.`,
      text: "고유한 프로세스 {{0}} 배정 → 프로세스를 위한 공간 할당 → PCB 초기화 → 적절한 연결(linkage) 설정 → 기타 데이터 구조 생성·확장",
      blanks: [{ accept: ["식별자", "ID", "PID", "프로세스 ID", "identifier"] }],
      explanation: why(
        "p.37: 프로세스 생성 = 고유한 프로세스 식별자 배정, 공간 할당, PCB 초기화, 연결(linkage) 설정(예: 스케줄링 큐에 추가), 기타 데이터 구조 생성·확장(예: 어카운팅 파일).",
        "PCB 초기화는 세 번째 단계다.",
        "Ch03 p.37",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["타이머 인터럽트", "디스크 인터럽트"],
    q: {
      ...C3,
      ...hint("3-4"),
      id: "os-ch03-short-012",
      topic: "대기 이벤트표",
      difficulty: 2,
      slideRef: "Ch03 p.14",
      prompt: `${TERM} '언제 이벤트를 기다리고, 언제 발생하는가?' 표의 네트워크 행이다.`,
      text: "receive() 호출 때 Blocked가 된 프로세스는 네트워크 보드에 데이터가 도착했을 때 발생하는 {{0}}로 Ready가 된다.",
      blanks: [{ accept: ["네트워크 인터럽트", "network interrupt", "네트워크 interrupt", "I/O 인터럽트", "I/O interrupt"] }],
      explanation: why(
        "p.14: 네트워크 — receive() 호출 때 Blocked, 네트워크 보드에 데이터가 도착하면 네트워크 인터럽트로 Ready. 장치 대기는 모두 해당 장치의 I/O interrupt로 깨어난다.",
        "타이머 인터럽트는 Sleep()·time quantum 초과 행이다.",
        "Ch03 p.14",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["CISC", "ARM"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-013",
      topic: "문맥 데이터 / dispatcher",
      difficulty: 3,
      slideRef: "Ch03 p.28",
      prompt: `${TERM} 영어 약어로 쓴다.`,
      text: "사용자 레지스터는 보통 8~32개가 있으며, 일부 {{0}} 구현은 100개가 넘기도 한다.",
      blanks: [{ accept: ["RISC", "Reduced Instruction Set Computer", "리스크"] }],
      explanation: why(
        "p.28: 사용자 레지스터는 프로세서가 사용자 모드에서 기계어로 참조할 수 있는 레지스터로, 보통 8~32개이고 일부 RISC 구현은 100개가 넘는다.",
        "CISC는 슬라이드에 없는 반대 계열이다.",
        "Ch03 p.28",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["인터럽트", "세마포어"],
    q: {
      ...C3,
      ...hint("3-7"),
      id: "os-ch03-short-014",
      topic: "PCB 3대 구성",
      difficulty: 2,
      slideRef: "Ch03 p.34",
      prompt: TERM,
      text: "프로세스 간 통신: 두 독립적인 프로세스 간 통신에 다양한 플래그·{{0}}·메시지가 연관될 수 있음",
      blanks: [{ accept: ["시그널", "signal", "신호", "signals"] }],
      explanation: why(
        "p.34: 프로세스 간 통신(Interprocess Communication)에는 플래그·시그널·메시지가 연관될 수 있다.",
        "세마포어는 p.14의 lock 대기에 쓰이는 변수다.",
        "Ch03 p.34",
      ),
    },
  },
];

// ═════════════════════════════════════════════ Ch07 메모리 관리
const C7 = C("ch07");
const PT = (rows: (number | string)[]) => block("페이지 테이블(첫번째 열은 테이블 인덱스임)", ...rows.map((f, i) => `[${i}] ${f}`));
const p1 = { size: 2048, table: [3, 0, 4, 1], logical: 4100 };
const p1r = logicalToPhysical(p1.table, p1.size, p1.logical);
const p2 = { size: 1024, table: [2, 5, 0, 3], physical: 5130 };
const p2r = physicalToLogical(p2.table, p2.size, p2.physical)!;
const p3 = { size: 1024, logical: 3080, physical: 6152 };
const p3x = solveFrame(p3.logical, p3.physical, p3.size);
const bs = bitSplit(13000, 16, 2048);
const s1 = { max: 1024, table: [{ base: 3000, length: 600 }, { base: 1200, length: 900 }, { base: 5000, length: 300 }], logical: 1100 };
const s1r = segLogicalToPhysical(s1.table, s1.max, s1.logical);
const s2 = { max: 1024, logical: 1300, physical: 4372 };
const s2x = solveBase(s2.logical, s2.physical, s2.max);
const bb = { base: 24000, bounds: 5000, rel: 4096 };
const bbr = baseBounds(bb.base, bb.bounds, bb.rel);
const BUDDY_OPS = [
  { type: "request", name: "A", size: 70 },
  { type: "request", name: "B", size: 200 },
  { type: "request", name: "C", size: 60 },
  { type: "request", name: "D", size: 130 },
] as const;
const buddySteps = simulateBuddy(1024, BUDDY_OPS);
const buddyD = buddySteps.at(-1)!.blocks.find((b) => b.name === "D")!;
const frag = buddyRequest(createBuddy(1024), "P", 300);
const fragBlock = frag.ok ? frag.block.size : 0;
const fragWaste = frag.ok ? frag.internalFragmentation : 0;
const HOLES: Hole[] = [
  { start: 10, size: 22 },
  { start: 40, size: 12 },
  { start: 60, size: 30 },
  { start: 100, size: 15 },
];
const HOLE_NAMES = ["A", "B", "C", "D"];
const FIT_PIC = block(" 22K          12K          30K          15K", "|  A  |####|  B  |####|  C  |####|  D  |");
const bestHole = HOLE_NAMES[chooseHole(HOLES, 14, "best").index!];
const nextHole = HOLE_NAMES[chooseHole(HOLES, 14, "next", 52).index!];
const firstHole = HOLE_NAMES[chooseHole(HOLES, 14, "first").index!];
const worstHole = HOLE_NAMES[chooseHole(HOLES, 14, "worst").index!];

const ch07: ShortItem[] = [
  {
    kind: "계산",
    wrong: [String(p1.logical), String((p1r.frame! - 1) * p1.size + p1r.offset)],
    q: {
      ...C7,
      ...star("7-10"),
      id: "os-ch07-short-001",
      summary: "논리 → 실제: 페이지 = 주소 ÷ 크기, offset = 나머지, 실제 = 프레임 × 크기 + offset(p.34)",
      topic: "주소 변환",
      difficulty: 2,
      slideRef: "Ch07 p.34",
      prompt: `한 page의 크기가 ${p1.size}인 Paging 시스템에서 4개의 page로 구성된 process의 page table이 아래와 같다. 이 프로세스의 논리주소 ${p1.logical}번지는 실기억주소 몇 번지인가? (숫자만)\n${PT(p1.table)}`,
      text: "실기억주소 = {{0}}번지",
      blanks: [{ accept: [String(p1r.physical)] }],
      explanation: why(
        `${p1.logical} ÷ ${p1.size} = 페이지 ${p1r.page}, 나머지 offset ${p1r.offset}. 페이지 ${p1r.page}의 프레임은 ${p1r.frame}이므로 ${p1r.frame}×${p1.size} + ${p1r.offset} = ${p1r.physical}.`,
        "슬라이드 예처럼 페이지 크기를 1024로 계산하면 틀린다 — 이 문제는 2048이다.",
        "Ch07 p.34(논리주소 → 실제주소 변환 방법)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(p2.physical), String(p2r.frame * p2.size)],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-002",
      topic: "주소 변환",
      difficulty: 3,
      slideRef: "Ch07 p.35",
      prompt: `한 page의 크기가 ${p2.size}인 Paging 시스템에서 4개의 page로 구성된 process의 page table이 아래와 같다. 이 프로세스의 실기억주소 ${p2.physical}번지로 변환되는 논리주소는 몇 번지인가? (숫자만)\n${PT(p2.table)}`,
      text: "논리주소 = {{0}}번지",
      blanks: [{ accept: [String(p2r.logical)] }],
      explanation: why(
        `${p2.physical} ÷ ${p2.size} = 프레임 ${p2r.frame}, offset ${p2r.offset}. 페이지 테이블에서 값이 ${p2r.frame}인 인덱스는 ${p2r.page}이므로 논리주소 = ${p2r.page}×${p2.size} + ${p2r.offset} = ${p2r.logical}.`,
        `프레임 번호 ${p2r.frame}을 그대로 페이지 번호로 쓰면 실기억주소를 다시 쓰게 된다 — 값이 ${p2r.frame}인 칸의 인덱스를 찾아야 한다.`,
        "Ch07 p.35(실제주소 → 논리주소 변환 방법)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(p3x + 1), "3"],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-003",
      topic: "주소 변환",
      difficulty: 3,
      slideRef: "Ch07 p.36",
      prompt: `한 page의 크기가 ${p3.size}인 Paging 시스템에서 어떤 프로세스의 논리주소 ${p3.logical}번지가 실기억주소 ${p3.physical}번지로 변환되었다. 아래 page table의 x에 들어갈 프레임 번호는? (숫자만)\n${PT([4, 2, 0, "x"])}`,
      text: "x = {{0}}",
      blanks: [{ accept: [String(p3x)] }],
      explanation: why(
        `${p3.logical} ÷ ${p3.size} = 페이지 ${Math.floor(p3.logical / p3.size)}, offset ${p3.logical % p3.size}. x×${p3.size} + ${p3.logical % p3.size} = ${p3.physical}이 되려면 x = (${p3.physical} − ${p3.logical % p3.size}) / ${p3.size} = ${p3x}.`,
        "페이지 번호 3을 그대로 답하기 쉽다 — 구하는 것은 그 페이지가 놓인 프레임 번호다.",
        "Ch07 p.36(페이지 테이블 만들기: x = (실제주소 − offset) / 프레임 크기)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(Math.floor(13000 / 1024)), String(bs.offset)],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-004",
      topic: "페이지 크기 2^k 비트 분해",
      difficulty: 2,
      slideRef: "Ch07 p.37",
      prompt: "16비트 논리주소를 쓰고 페이지 크기가 2048(2¹¹)인 Paging 시스템이다. 논리주소 13000번지의 페이지 번호는? (숫자만)",
      text: "페이지 번호 = {{0}}",
      blanks: [{ accept: [String(bs.page)] }],
      explanation: why(
        `페이지 크기 2¹¹ → 하위 ${bs.offsetBits}비트가 offset, 상위 ${bs.pageBits}비트가 페이지 번호. 13000 = ${bs.binary.slice(0, bs.pageBits)} | ${bs.binary.slice(bs.pageBits)} → 페이지 ${bs.page}, offset ${bs.offset}.`,
        "슬라이드 예의 페이지 크기 1024로 나누면 12가 나온다.",
        "Ch07 p.37(페이지 크기 = 2ᵏ이면 하위 k비트 = 오프셋, 상위 비트 = 페이지 번호)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["6", "11"],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-005",
      topic: "페이지 크기 2^k 비트 분해",
      difficulty: 2,
      slideRef: "Ch07 p.37",
      prompt: "16비트 논리주소를 쓰고 페이지 크기가 2048(2¹¹)인 Paging 시스템이다. 논리주소의 상위 몇 비트가 페이지 번호인가? (숫자만)",
      text: "페이지 번호 비트 수 = {{0}}",
      blanks: [{ accept: [String(bs.pageBits)] }],
      explanation: why(
        `하위 ${bs.offsetBits}비트가 offset(0~2047)이므로 페이지 번호는 16 − ${bs.offsetBits} = ${bs.pageBits}비트(페이지 0~${2 ** bs.pageBits - 1})다.`,
        "6비트는 슬라이드 예(페이지 크기 1024 = 2¹⁰)의 답이다. 11은 offset 비트 수다.",
        "Ch07 p.37(16비트 논리주소, 페이지 크기 1024 → 하위 10비트 오프셋, 상위 6비트 페이지 번호)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(s1.table[1].base + s1.logical), String(s1.table[0].base + 76)],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-006",
      topic: "기본 세그먼테이션",
      difficulty: 2,
      slideRef: "Ch07 p.41",
      prompt: `시스템 내의 최대 세그먼트 크기가 ${s1.max}인 Segmentation 시스템에서 process의 segmentation table이 아래와 같다. 이 프로세스의 논리주소 ${s1.logical}번지는 실기억주소 몇 번지인가? (숫자만)\n${block("segmentation 테이블(첫번째 열은 테이블 인덱스, 두 번째 열은 시작주소, 세 번째 열은 세그먼트 길이)", ...s1.table.map((s, i) => `[${i}] ${s.base}  ${s.length}`))}`,
      text: "실기억주소 = {{0}}번지",
      blanks: [{ accept: [String(s1r.physical)] }],
      explanation: why(
        `${s1.logical} ÷ ${s1.max} = 세그먼트 ${s1r.segment}, offset ${s1r.offset}. offset ${s1r.offset} < 길이 ${s1.table[s1r.segment].length}이므로 정상 → 시작주소 ${s1.table[s1r.segment].base} + ${s1r.offset} = ${s1r.physical}.`,
        "논리주소 전체를 시작주소에 더하면 안 된다 — 더하는 것은 세그먼트 안의 offset이다.",
        "Ch07 p.41(세그먼트 시작주소 + offset = 실제주소, offset ≥ 길이면 보호 위반)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(s2.physical - s2.logical), "1"],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-007",
      topic: "기본 세그먼테이션",
      difficulty: 3,
      slideRef: "Ch07 p.41",
      prompt: `시스템 내의 최대 세그먼트 크기가 ${s2.max}인 Segmentation 시스템에서 어떤 프로세스의 논리주소 ${s2.logical}번지가 실기억주소 ${s2.physical}번지로 변환되었다. 아래 segmentation table의 x(세그먼트 시작주소)는? (숫자만)\n${block("segmentation 테이블(첫번째 열은 테이블 인덱스, 두 번째 열은 시작주소, 세 번째 열은 세그먼트 길이)", "[0] 2000  500", "[1] x     700")}`,
      text: "x = {{0}}",
      blanks: [{ accept: [String(s2x)] }],
      explanation: why(
        `${s2.logical} ÷ ${s2.max} = 세그먼트 ${Math.floor(s2.logical / s2.max)}, offset ${s2.logical % s2.max}(< 길이 700). x + ${s2.logical % s2.max} = ${s2.physical} → x = ${s2x}.`,
        `실기억주소에서 논리주소 전체(${s2.logical})를 빼면 ${s2.physical - s2.logical}이 된다 — 빼야 하는 것은 offset이다.`,
        "Ch07 p.41",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(bb.base + bb.bounds), String(bb.rel)],
    q: {
      ...C7,
      ...hint("7-1", "7-2"),
      id: "os-ch07-short-008",
      topic: "보호 / Base·Bounds 레지스터",
      difficulty: 2,
      slideRef: "Ch07 p.7",
      prompt: `베이스(base) 레지스터 값이 ${bb.base}, 바운드(bounds) 레지스터 값이 ${bb.bounds}인 프로세스가 상대주소 ${bb.rel}번지를 참조한다. 보호 검사를 통과한다면 접근하는 절대주소는? (숫자만)`,
      text: "절대주소 = {{0}}번지",
      blanks: [{ accept: [String(bbr.physical)] }],
      explanation: why(
        `상대주소 ${bb.rel} < bounds ${bb.bounds}이므로 보호 검사를 통과하고, 절대주소 = 상대주소 + base = ${bb.rel} + ${bb.base} = ${bbr.physical}.`,
        "bounds는 영역 크기라 더하지 않는다 — 비교(보호)에만 쓴다.",
        "Ch07 p.7(상대주소 + base = 절대주소, 상대주소 < bounds 검사)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["256", "384"],
    q: {
      ...C7,
      ...star("7-7"),
      id: "os-ch07-short-009",
      summary: "Buddy: 2의 거듭제곱으로 올려 가장 작은 free 블록을 반씩 나눠 왼쪽 반을 할당(p.21-23)",
      topic: "버디 시스템",
      difficulty: 3,
      slideRef: "Ch07 p.21-23",
      prompt: `1024K 메모리를 Buddy 시스템으로 관리한다. 처음에 메모리 전체가 비어 있고, 아래 순서로 요청이 들어왔다(분할할 때는 왼쪽 반을 할당). 마지막 요청 D가 할당된 block의 시작주소는 몇 K인가? (주소 0부터, 숫자만)\n${block(...BUDDY_OPS.map((o) => `Request ${o.size}K (${o.name})`))}`,
      text: "D의 시작주소 = {{0}}K",
      blanks: [{ accept: [String(buddyD.start)] }],
      explanation: why(
        `각 단계 메모리: ${buddySteps.map((s) => s.line).join(" → ")}. D(${BUDDY_OPS[3].size}K → 256K)는 남은 512K를 반으로 나눈 왼쪽 256K에 들어가 시작주소 ${buddyD.start}K다.`,
        "B 옆의 빈 64K는 D를 담을 수 없다. 오른쪽 반에 할당하면 768K가 된다.",
        "Ch07 p.21-23(2의 거듭제곱 크기, 없으면 두 배 블록을 반으로 분할해 왼쪽 반을 할당)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["0", "724"],
    q: {
      ...C7,
      ...star("7-7"),
      id: "os-ch07-short-010",
      summary: "Buddy는 요청을 담는 가장 작은 2의 거듭제곱 블록 전체를 할당 — 남는 부분이 내부 단편화(p.21·23)",
      topic: "버디 시스템",
      difficulty: 2,
      slideRef: "Ch07 p.21, p.23",
      prompt: "비어 있는 1024K 메모리를 Buddy 시스템으로 관리할 때 300K를 요청하면, 할당된 block 안에서 쓰이지 않고 남는 크기(내부 단편화)는 몇 K인가? (숫자만)",
      text: "내부 단편화 = {{0}}K",
      blanks: [{ accept: [String(fragWaste)] }],
      explanation: why(
        `300K를 담는 가장 작은 2의 거듭제곱은 ${fragBlock}K이므로 ${fragBlock}K block 전체가 할당되고 ${fragBlock} − 300 = ${fragWaste}K가 남는다(필기: 100K를 할당해 준 게 아니고 128K 전체를 할당).`,
        "요청한 만큼만 준다고 보면 0이 된다.",
        "Ch07 p.21(가장 작은 2의 거듭제곱 크기 할당), p.23 필기",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [firstHole, worstHole],
    q: {
      ...C7,
      ...star("7-6"),
      id: "os-ch07-short-011",
      summary: "Best-fit = 요청 크기 이상인 블록 중 가장 작은 것(p.16)",
      topic: "배치 알고리즘",
      difficulty: 2,
      slideRef: "Ch07 p.16",
      prompt: `다음은 메모리 할당 상태다. ###은 이미 할당된 block이고 A, B, C, D는 free 영역이며 크기는 영역 위에 표시했다. 14K 요청을 **Best-fit**으로 할당하면 어느 free 영역에 들어가는가? (A~D 중 하나)\n${FIT_PIC}`,
      text: "{{0}} 영역",
      blanks: [{ accept: [bestHole, `${bestHole} 영역`] }],
      explanation: why(
        `14K 이상인 free 영역은 A(22K)·C(30K)·D(15K)이고, Best-fit은 요청 크기에 가장 가까운 블록을 고르므로 ${bestHole}(15K)이다.`,
        `First-fit이면 ${firstHole}, Worst-fit이면 ${worstHole}다. B(12K)는 14K보다 작아 넣을 수 없다.`,
        "Ch07 p.16(최적 적합: 요청 크기에 가장 가까운 블록)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [firstHole, "B"],
    q: {
      ...C7,
      ...hint("7-6"),
      id: "os-ch07-short-012",
      topic: "배치 알고리즘",
      difficulty: 3,
      slideRef: "Ch07 p.18, p.20",
      prompt: `다음은 메모리 할당 상태다. ###은 이미 할당된 block이고 A, B, C, D는 free 영역이며 크기는 영역 위에 표시했다. 마지막으로 할당된 block은 B와 C 사이의 영역이다. 14K 요청을 **Next-fit**으로 할당하면 어느 free 영역에 들어가는가? (A~D 중 하나)\n${FIT_PIC}`,
      text: "{{0}} 영역",
      blanks: [{ accept: [nextHole, `${nextHole} 영역`] }],
      explanation: why(
        `Next-fit은 마지막으로 배치한 위치(B와 C 사이)부터 훑으므로 처음 만나는 C(30K)가 14K를 담을 수 있어 ${nextHole}다.`,
        `처음부터 훑으면 First-fit의 ${firstHole}가 된다.`,
        "Ch07 p.18(다음 적합: 마지막으로 배치한 위치부터 메모리를 훑음), p.20",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["write-only", "read-write"],
    q: {
      ...C7,
      ...plain,
      id: "os-ch07-short-013",
      topic: "논리적 구성",
      difficulty: 2,
      slideRef: "Ch07 p.9",
      prompt: `${TERM} 슬라이드의 영어 표기로 쓴다.`,
      text: "모듈마다 서로 다른 수준의 메모리 보호가 부여됨. 예: read-only, {{0}}",
      blanks: [{ accept: ["execute-only", "execute only", "실행 전용", "실행만"] }],
      explanation: why(
        "p.9: 논리적 구성 — 모듈마다 서로 다른 수준의 메모리 보호(예: read-only, execute-only)가 부여되고, 프로세스 간에 모듈을 공유할 수 있다.",
        "write-only는 슬라이드 예에 없다.",
        "Ch07 p.9",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["데이터 세그먼트", "텍스트 세그먼트"],
    q: {
      ...C7,
      ...hint("7-10"),
      id: "os-ch07-short-014",
      topic: "기본 세그먼테이션",
      difficulty: 2,
      slideRef: "Ch07 p.38",
      prompt: TERM,
      text: "세그먼트는 용도별로 나눈다: 코드 세그먼트, 전역변수 세그먼트, 힙 세그먼트, {{0}} 세그먼트",
      blanks: [{ accept: ["스택", "stack"] }],
      explanation: why(
        "p.38: 코드·전역변수·힙·스택 세그먼트처럼 용도별로 나누며, 세그먼트마다 길이가 다르다.",
        "데이터(전역변수) 세그먼트는 이미 목록에 있다.",
        "Ch07 p.38",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["스택", "커널"],
    q: {
      ...C7,
      ...hint("7-3"),
      id: "os-ch07-short-015",
      topic: "공유",
      difficulty: 2,
      slideRef: "Ch07 p.8",
      prompt: `${TERM} 메모리 공유(Sharing)의 세 가지 예다.`,
      text: "프로그램 코드 공유, DLL 라이브러리 코드 공유, {{0}} 공유(하나의 버퍼를 여러 프로세스가 공유)",
      blanks: [{ accept: ["데이터", "data"] }],
      explanation: why(
        "p.8: 공유의 예는 프로그램 코드 공유(같은 프로그램 여러 개), DLL 라이브러리 코드 공유, 데이터 공유(하나의 버퍼(배열)를 여러 프로세스가 공유)다. 필기: 1·2는 코드를, 3은 실제로 데이터를 공유한다.",
        "스택은 프로세스마다 따로 가진다(필기: 전역변수·힙·스택은 전부 따로).",
        "Ch07 p.8",
      ),
    },
  },
];

// ═════════════════════════════════════════════ Ch08 가상 메모리
const C8 = C("ch08");
const REFS = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2];
const REF_TEXT = REFS.join(" ");
const F = (algo: "lru" | "fifo" | "opt" | "clock") => simulateReplacement(REFS, 3, algo);
const RULE = "F는 슬라이드처럼 3개 프레임이 모두 찬 뒤 일어난 page fault(교체)만 센다(처음 빈 프레임을 채우는 적재는 세지 않는다).";
const clockBuf = { pages: [3, 7, 2, 9], use: [1, 0, 1, 1] as (0 | 1)[], pointer: 2 };
const clockR = clockReplace(clockBuf, 5);
const ws = { refs: [2, 6, 1, 5, 7, 7, 7, 7, 5, 1, 6, 2, 3, 4], t: 10, delta: 5 };
const wsR = workingSet(ws.refs, ws.t, ws.delta);
const pt8 = pageTableInfo(32, 8 * KB, 4);
const pt4 = pageTableInfo(32, 4 * KB, 8);
const inv = { ram: 8 * GB, frame: 4 * KB };
const ENH = [
  { page: 4, u: 1, m: 0 },
  { page: 6, u: 1, m: 1 },
  { page: 1, u: 0, m: 1 },
  { page: 8, u: 1, m: 0 },
] as const;
const enh = enhancedClockVictim(ENH.map((f) => ({ ...f })), 3);
const MEM = "메모리 (첫번째 열은 프레임 인덱스이고, 두번째 열은 페이지 번호임)";

const ch08: ShortItem[] = [
  {
    kind: "계산",
    wrong: [String(F("lru").misses), String(F("fifo").faults)],
    q: {
      ...C8,
      ...star("8-9"),
      id: "os-ch08-short-001",
      summary: "LRU = 가장 오랫동안 참조되지 않은 페이지 교체, F는 프레임이 다 찬 뒤의 폴트(p.44·48)",
      topic: "교체 알고리즘",
      difficulty: 3,
      slideRef: "Ch08 p.44, p.48",
      prompt: `프로세스에 3개의 프레임이 주어지고 처음에는 비어 있다. 페이지 참조열이 \`${REF_TEXT}\`일 때 **LRU** 정책의 F 개수는? ${RULE} (숫자만)`,
      text: "LRU의 F = {{0}}번",
      blanks: [{ accept: [String(F("lru").faults)] }],
      explanation: why(
        `LRU는 가장 오랫동안 참조되지 않은 페이지를 교체한다. 시뮬레이션 결과 전체 미스 ${F("lru").misses}번 중 처음 3번은 빈 프레임 적재라 F = ${F("lru").faults}번.`,
        `처음 채우는 적재까지 세면 ${F("lru").misses}번이 된다.`,
        "Ch08 p.44(LRU), p.48(F 표기)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(F("fifo").misses), String(F("lru").faults)],
    q: {
      ...C8,
      ...star("8-9"),
      id: "os-ch08-short-002",
      summary: "FIFO = 메모리에 가장 오래 있던 페이지 교체(참조돼도 순서 그대로)(p.45·48)",
      topic: "교체 알고리즘",
      difficulty: 3,
      slideRef: "Ch08 p.45, p.48",
      prompt: `프로세스에 3개의 프레임이 주어지고 처음에는 비어 있다. 페이지 참조열이 \`${REF_TEXT}\`일 때 **FIFO** 정책의 F 개수는? ${RULE} (숫자만)`,
      text: "FIFO의 F = {{0}}번",
      blanks: [{ accept: [String(F("fifo").faults)] }],
      explanation: why(
        `FIFO는 메모리에 가장 오래 있던 페이지를 교체한다. 전체 미스 ${F("fifo").misses}번 − 초기 적재 3번 = F ${F("fifo").faults}번.`,
        `LRU(${F("lru").faults}번)와 헷갈리기 쉽다 — FIFO는 참조돼도 들어온 순서를 바꾸지 않는다.`,
        "Ch08 p.45(FIFO), p.48",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(F("opt").misses), String(F("lru").faults)],
    q: {
      ...C8,
      ...star("8-9"),
      id: "os-ch08-short-003",
      summary: "OPT = 다음 참조까지 가장 먼 페이지 교체 — 폴트 수의 하한(p.43·48)",
      topic: "교체 알고리즘",
      difficulty: 3,
      slideRef: "Ch08 p.43, p.48",
      prompt: `프로세스에 3개의 프레임이 주어지고 처음에는 비어 있다. 페이지 참조열이 \`${REF_TEXT}\`일 때 **최적(OPT)** 정책의 F 개수는? ${RULE} (숫자만)`,
      text: "OPT의 F = {{0}}번",
      blanks: [{ accept: [String(F("opt").faults)] }],
      explanation: why(
        `OPT는 다음 참조까지의 시간이 가장 긴 페이지를 교체한다(뒤에 정보가 없으면 맨 앞 프레임). 전체 미스 ${F("opt").misses}번 − 초기 적재 3번 = F ${F("opt").faults}번.`,
        `처음 채우는 적재까지 세면 ${F("opt").misses}번이 된다.`,
        "Ch08 p.43(Optimal), p.48",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(F("clock").misses), String(F("fifo").faults)],
    q: {
      ...C8,
      ...star("8-9"),
      id: "os-ch08-short-004",
      summary: "Clock = pointer부터 use bit 0을 찾아 교체, 지나치는 1은 0으로(p.47-48)",
      topic: "Clock 정책 동작",
      difficulty: 3,
      slideRef: "Ch08 p.47-48",
      prompt: `프로세스에 3개의 프레임이 주어지고 처음에는 비어 있다(next frame pointer는 프레임 0). 페이지 참조열이 \`${REF_TEXT}\`일 때 **Clock** 정책의 F 개수는? ${RULE} (숫자만)`,
      text: "Clock의 F = {{0}}번",
      blanks: [{ accept: [String(F("clock").faults)] }],
      explanation: why(
        `적재·참조 때 use bit = 1, 교체 때 pointer부터 use bit가 0인 프레임을 찾으며 지나치는 1은 0으로 바꾼다. 전체 미스 ${F("clock").misses}번 − 초기 적재 3번 = F ${F("clock").faults}번.`,
        `FIFO(${F("fifo").faults}번)와 다르다 — 참조된 페이지는 use bit 덕분에 한 번 살아남는다.`,
        "Ch08 p.47(클럭 정책), p.48",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(clockBuf.pointer), "3"],
    q: {
      ...C8,
      ...star("8-9"),
      id: "os-ch08-short-005",
      summary: "Clock 교체: pointer부터 use bit 1은 0으로 바꾸며 지나가고 처음 만난 0을 교체(p.47·49-50)",
      topic: "Clock 정책 동작",
      difficulty: 2,
      slideRef: "Ch08 p.47, p.49-50",
      prompt: `다음은 네 개의 frame으로 구성된 메모리 상태다. 페이지 교체 알고리즘은 Clock이고 *는 use bit가 1, <--는 next frame pointer다. 이 상태에서 메모리에 없는 페이지 5가 참조되면 교체되는 프레임 번호는? (숫자만)\n${block(MEM, ...clockBuf.pages.map((p, i) => `[${i}] ${p}${clockBuf.use[i] ? " *" : ""}${i === clockBuf.pointer ? "  <--" : ""}`))}`,
      text: "교체되는 프레임 = [{{0}}]",
      blanks: [{ accept: [String(clockR.victim)] }],
      explanation: why(
        `pointer [${clockBuf.pointer}]부터 use bit가 0인 프레임을 찾는다: [2]·[3]·[0]은 1이라 0으로 바꾸며 지나가고, [${clockR.victim}]의 use bit가 0이라 교체한다. 이후 pointer는 [${clockR.buffer.pointer}].`,
        `pointer가 가리키는 [${clockBuf.pointer}]를 바로 교체하면 틀린다 — use bit가 1이면 0으로 바꾸고 넘어간다.`,
        "Ch08 p.47(next frame pointer부터 처음으로 use bit가 0인 페이지를 찾아 교체), p.49-50",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(ws.delta), String(new Set(ws.refs).size)],
    q: {
      ...C8,
      ...plain,
      id: "os-ch08-short-006",
      topic: "워킹 셋",
      difficulty: 2,
      slideRef: "Ch08 p.60",
      prompt: `페이지 참조열이 \`${ws.refs.join(" ")}\`이다. i번째 참조를 시각 i(1부터)로 보고, 워킹 셋 W(t, Δ)는 시각 t를 포함한 최근 Δ번의 참조(시각 t−Δ+1 ~ t)에 나온 페이지들의 집합이라 하자. W(${ws.t}, ${ws.delta})의 크기(페이지 수)는? (숫자만)`,
      text: `|W(${ws.t}, ${ws.delta})| = {{0}}`,
      blanks: [{ accept: [String(wsR.size)] }],
      explanation: why(
        `시각 ${ws.t - ws.delta + 1}~${ws.t}의 참조는 ${wsR.window.join(", ")}이고, 서로 다른 페이지는 {${wsR.pages.join(", ")}}로 ${wsR.size}개다.`,
        `참조 횟수(${ws.delta})를 그대로 답하면 틀린다 — 같은 페이지는 한 번만 센다.`,
        "Ch08 p.60(워킹 셋 W(t, Δ): 시각 t 직전의 일정 시간 Δ 동안 참조된 페이지들의 집합)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["4", "1"],
    q: {
      ...C8,
      ...plain,
      id: "os-ch08-short-007",
      topic: "2단계 페이지 테이블 계산",
      difficulty: 3,
      slideRef: "Ch08 p.14",
      prompt: "32비트 가상 주소, 페이지 크기 8KB, 페이지 테이블 엔트리 4바이트인 시스템에서 한 프로세스의 페이지 테이블 전체 크기는 몇 MB인가? (숫자만)",
      text: "페이지 테이블 크기 = {{0}}MB",
      blanks: [{ accept: [String(pt8.tableBytes / MB)] }],
      explanation: why(
        `8KB = 2^${pt8.offsetBits} → 페이지 수 = 2^32 / 2^${pt8.offsetBits} = 2^${pt8.pageBits}(${pt8.pages}개). 엔트리 4바이트 × ${pt8.pages} = ${pt8.tableBytes}바이트 = ${pt8.tableBytes / MB}MB.`,
        "4KB 페이지(슬라이드 예)로 계산하면 4MB가 나온다.",
        "Ch08 p.14(4GB ÷ 4KB → 약 100만 페이지, 최악의 경우 페이지 테이블만 4MB)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["1024", String(pt4.pages)],
    q: {
      ...C8,
      ...plain,
      id: "os-ch08-short-008",
      topic: "2단계 페이지 테이블 계산",
      difficulty: 3,
      slideRef: "Ch08 p.14",
      prompt: "32비트 가상 주소, 페이지 크기 4KB, 페이지 테이블 엔트리 8바이트인 시스템이다. 한 프로세스의 페이지 테이블 전체를 담으려면 4KB 페이지가 몇 개 필요한가? (숫자만)",
      text: "필요한 페이지 수 = {{0}}개",
      blanks: [{ accept: [String(pt4.pagesForTable)] }],
      explanation: why(
        `페이지 수 = 2^32 / 2^12 = 2^20개, 페이지 테이블 = 2^20 × 8바이트 = ${pt4.tableBytes / MB}MB. 이를 4KB 페이지에 담으면 ${pt4.tableBytes} / 4096 = ${pt4.pagesForTable}개 — 그래서 페이지 테이블도 페이징하는 2단계 구조가 필요하다.`,
        "엔트리를 4바이트로 보면 슬라이드 예의 1024개가 나온다.",
        "Ch08 p.14(페이지 테이블을 저장하기 위한 페이지 수 1024개 — 엔트리 4바이트 기준)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(invertedEntries(4 * GB, 4 * KB)), String(2 ** 20 * 8)],
    q: {
      ...C8,
      ...plain,
      id: "os-ch08-short-009",
      topic: "역 페이지 테이블",
      difficulty: 2,
      slideRef: "Ch08 p.17-18",
      prompt: "실제 메모리(RAM)가 8GB이고 프레임 크기가 4KB인 시스템이 역 페이지 테이블(Inverted Page Table)을 쓴다. 역 페이지 테이블의 엔트리는 몇 개인가? (숫자만)",
      text: "엔트리 수 = {{0}}개",
      blanks: [{ accept: [String(invertedEntries(inv.ram, inv.frame))] }],
      explanation: why(
        `역 페이지 테이블은 프로세스마다가 아니라 시스템 전체에 하나이고, 프레임 하나당 엔트리 하나다. 8GB / 4KB = 2^33 / 2^12 = 2^21 = ${invertedEntries(inv.ram, inv.frame)}개.`,
        "4GB RAM(필기 예)이면 2^20개(약 100만)다.",
        "Ch08 p.17 필기(RAM 4GB, 프레임 4KB → 프레임 100만 개 → 엔트리도 100만 개), p.18",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["3", "0"],
    q: {
      ...C8,
      ...hint("8-9"),
      id: "os-ch08-short-010",
      topic: "개선된 클럭(Enhanced Clock)",
      difficulty: 3,
      slideRef: "Ch08 p.52-53",
      prompt: `다음은 네 개의 frame으로 구성된 메모리 상태다. 페이지 교체 알고리즘은 Enhanced Clock이고 *는 use bit가 1, +는 modify bit가 1, <--는 next frame pointer다. 이 상태에서 메모리에 없는 페이지가 참조되면 교체되는 프레임 번호는? (숫자만)\n${block(MEM, ...ENH.map((f, i) => `[${i}] ${f.page} ${f.u ? "*" : ""}${f.m ? "+" : ""}${i === 3 ? "  <--" : ""}`.replace(/ +$/, "")))}`,
      text: "교체되는 프레임 = [{{0}}]",
      blanks: [{ accept: [String(enh.victim)] }],
      explanation: why(
        `1단계: pointer [3]부터 한 바퀴 (u=0, m=0)을 찾지만 없다. 2단계: 다시 [3]부터 (u=0, m=1)을 찾으며 지나치는 u=1 프레임([3]·[0]·[1])의 u를 0으로 바꾸고, [${enh.victim}](u=0, m=1)을 교체한다.`,
        "pointer가 가리키는 [3]은 u=1이라 바로 교체되지 않는다. [1]은 m=1이지만 u=1이다.",
        "Ch08 p.52(4가지 분류), p.53(개선된 클럭 알고리즘 1~3단계)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: ["12", "8"],
    q: {
      ...C8,
      ...plain,
      id: "os-ch08-short-011",
      topic: "페이지 테이블 엔트리 제어 비트",
      difficulty: 2,
      slideRef: "Ch08 p.11",
      prompt: "페이지 크기가 8KB인 Paging 시스템에서 논리주소의 offset은 몇 비트인가? (숫자만)",
      text: "offset = {{0}}비트",
      blanks: [{ accept: [String(pt8.offsetBits)] }],
      explanation: why(
        `8KB = 8192 = 2^${pt8.offsetBits}바이트이므로 offset은 ${pt8.offsetBits}비트다.`,
        "12비트는 4KB 페이지(슬라이드 예)의 offset이다.",
        "Ch08 p.11(offset = 10비트 → 1KB, 12비트 → 4KB 페이지)",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["LRU", "클럭"],
    q: {
      ...C8,
      ...hint("8-9"),
      id: "os-ch08-short-012",
      topic: "LFU/MFU · 교체 알고리즘 비교",
      difficulty: 2,
      slideRef: "Ch08 p.46",
      prompt: TERM,
      text: "LFU는 과거 편향 때문에 페이지 교체엔 부적합하지만, {{0}}을 추가한 LFU 변형은 디스크 버퍼·DB·웹 같은 상위 캐시에서 활용된다.",
      blanks: [{ accept: ["에이징", "aging", "에이징(aging)"] }],
      explanation: why(
        "p.46: LFU 변형(에이징 추가)은 상위 캐시(디스크 버퍼·DB·웹 등)에서 활용한다 — 오래된 카운트를 줄여 과거 편향을 완화한다.",
        "LRU 근사인 클럭은 페이지 교체에서 LFU 대신 쓰는 알고리즘이다.",
        "Ch08 p.46",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["LFU", "FIFO"],
    q: {
      ...C8,
      ...hint("8-9"),
      id: "os-ch08-short-013",
      topic: "LFU/MFU · 교체 알고리즘 비교",
      difficulty: 2,
      slideRef: "Ch08 p.44, p.46",
      prompt: `${TERM} 알고리즘 약어로 쓴다.`,
      text: "하드웨어는 use bit 1개만 제공하므로 페이지 교체에는 지역성 기반 {{0}} 근사인 클럭(Clock) 알고리즘을 사용한다.",
      blanks: [{ accept: ["LRU", "Least Recently Used", "최근 최소 사용"] }],
      explanation: why(
        "p.46: 매 접근마다 카운터를 늘리는 오버헤드(하드웨어는 use bit 1개만 제공) 때문에 지역성 기반 LRU 근사인 클럭 알고리즘을 대신 쓴다(p.44도 같은 설명).",
        "LFU는 클럭으로 대신하는 쪽(사용 빈도 기반)이다.",
        "Ch08 p.44, p.46",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["LRU", "FIFO"],
    q: {
      ...C8,
      ...hint("8-9"),
      id: "os-ch08-short-014",
      topic: "교체 알고리즘",
      difficulty: 2,
      slideRef: "Ch08 p.45",
      prompt: TERM,
      text: "FIFO는 프로세스에 할당된 페이지 프레임들을 원형 버퍼처럼 취급하며, 페이지는 {{0}} 방식으로 제거된다.",
      blanks: [{ accept: ["라운드 로빈", "Round-robin", "round robin", "라운드로빈", "RR"] }],
      explanation: why(
        "p.45: FIFO — 프레임들을 원형 버퍼처럼 취급하고 페이지는 라운드 로빈 방식으로 제거된다(메모리에 가장 오래 있던 페이지가 교체됨).",
        "LRU는 마지막 참조 시각을 기준으로 고르는 다른 정책이다.",
        "Ch08 p.45",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["Modify bit", "Lock bit"],
    q: {
      ...C8,
      ...hint("8-8"),
      id: "os-ch08-short-015",
      topic: "프레임 잠금",
      difficulty: 3,
      slideRef: "Ch08 p.42",
      prompt: TERM,
      text: "페이지 테이블 엔트리는 프레임 번호와 여러 제어 비트로 구성된다 — {{0}}(보호), Modify bit(수정 여부), Lock bit(락킹 여부) 등.",
      blanks: [{ accept: ["Protection bit", "보호 비트", "protection", "보호비트", "P bit"] }],
      explanation: why(
        "p.42 필기: 페이지 테이블 엔트리 하나는 프레임 번호 + 제어 비트들(Protection bit, Modify bit, Lock bit 등)이고, 락킹 정보도 이 엔트리 안의 비트에 저장된다.",
        "Modify bit·Lock bit는 이미 문장에 있다.",
        "Ch08 p.42 필기",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["주 메모리", "TLB"],
    q: {
      ...C8,
      ...plain,
      id: "os-ch08-short-016",
      topic: "2단계 페이지 테이블 계산",
      difficulty: 2,
      slideRef: "Ch08 p.15",
      prompt: TERM,
      text: "전체 페이지 테이블은 너무 많은 주 메모리를 차지할 수 있으므로 페이지 테이블 역시 {{0}}에 저장되고, 프로세스가 실행 중일 때는 그 일부만 주 메모리에 있다.",
      blanks: [{ accept: ["가상 메모리", "virtual memory", "가상메모리", "가상 기억장치"] }],
      explanation: why(
        "p.15: 페이지 테이블 역시 가상 메모리에 저장되며, 실행 중에는 그 일부만 주 메모리에 있다.",
        "TLB는 최근 사용한 페이지 테이블 항목만 담는 캐시다.",
        "Ch08 p.15",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["요구", "즉시"],
    q: {
      ...C8,
      ...hint("8-7"),
      id: "os-ch08-short-017",
      topic: "페이지 버퍼링",
      difficulty: 2,
      slideRef: "Ch08 p.56-57",
      prompt: TERM,
      text: "페이지 버퍼링에서 수정 리스트(modified list)는 주기적으로 묶어서 디스크에 {{0}} 기록한 뒤 clean 리스트로 옮긴다.",
      blanks: [{ accept: ["일괄", "일괄적으로", "일괄 기록", "batch"] }],
      explanation: why(
        "p.57: 수정 리스트는 주기적으로 묶어서 일괄 기록 후 clean 리스트로 이동한다 — 일괄 기록으로 쓰기 효율이 오르고 쓰기와 폴트 처리가 분리된다(p.56 그림: 디스크에 일괄 기록).",
        "교체될 때만 그때그때 기록하는 것은 요구 청소다.",
        "Ch08 p.56-57",
      ),
    },
  },
];

// ═════════════════════════════════════════════ Ch09 단일 프로세서 스케줄링
const C9 = C("ch09");
const PROCS: Proc[] = [
  { name: "A", arrival: 0, service: 5 },
  { name: "B", arrival: 1, service: 2 },
  { name: "C", arrival: 3, service: 4 },
  { name: "D", arrival: 4, service: 1 },
  { name: "E", arrival: 6, service: 3 },
];
const TABLE = block(
  `Process Name   ${PROCS.map((p) => p.name).join("  ")}`,
  `Arrival Time   ${PROCS.map((p) => p.arrival).join("  ")}`,
  `Service Time   ${PROCS.map((p) => p.service).join("  ")}`,
);
const HEAD = `아래 표는 프로세스들의 도착 및 서비스 시간 정보이다(같은 조건이면 먼저 도착한 프로세스 우선).\n${TABLE}\n`;
const fcfs = simulate("fcfs", PROCS);
const rr1 = simulate("rr", PROCS, { quantum: 1 });
const spn = simulate("spn", PROCS);
const srt = simulate("srt", PROCS);
const hrrn = simulate("hrrn", PROCS);
const hrrnPick = hrrn.decisions.find((d) => d.candidates.length >= 3) ?? hrrn.decisions.find((d) => d.candidates.length >= 2)!;
const fb = simulate("feedback", PROCS, { feedback: "pow2" });
const ea = { alpha: 0.8, s1: 10, observed: [6, 4, 8] };
const eaR = exponentialAverage(ea.observed, ea.alpha, ea.s1);
const rrq = { waited: 6, service: 4 };

const ch09: ShortItem[] = [
  {
    kind: "계산",
    wrong: [num(spn.avgTurnaround), num(fcfs.avgWaiting)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-001",
      topic: "반환·대기·정규화 반환시간",
      difficulty: 2,
      slideRef: "Ch09 p.11, p.26-27",
      prompt: `${HEAD}이들을 **FCFS**로 스케줄링할 때 평균 반환시간(Tr)은? (숫자만, 소수 둘째 자리까지)`,
      text: "평균 반환시간 = {{0}}",
      blanks: [{ accept: [num(fcfs.avgTurnaround)] }],
      explanation: why(
        `실행 순서 ${timeline(fcfs)}. 반환시간 Tr = 완료 − 도착: ${PROCS.map((p) => `${p.name} ${fcfs.turnaround[p.name]}`).join(", ")} → 평균 ${num(fcfs.avgTurnaround)}.`,
        `평균 대기시간(${num(fcfs.avgWaiting)})과 헷갈리기 쉽다 — 반환시간은 서비스 시간까지 포함한다.`,
        "Ch09 p.11(FCFS), p.26(반환시간 = 완료 − 도착), p.27",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(fcfs.finish.C), String(rr1.finish.C - 1)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-002",
      topic: "라운드 로빈",
      difficulty: 3,
      slideRef: "Ch09 p.13",
      prompt: `${HEAD}이들을 **라운드 로빈(q=1)**으로 스케줄링한다. 새로 도착한 프로세스를 먼저 RQ에 넣고 time quantum을 소진한 프로세스를 그 뒤에 넣는다. 프로세스 C가 완료되는 시각은? (숫자만)`,
      text: "C의 완료 시각 = {{0}}",
      blanks: [{ accept: [String(rr1.finish.C)] }],
      explanation: why(
        `실행 순서(시각 0부터 한 칸 = 1): ${timeline(rr1)}. C는 시각 ${rr1.finish.C}에 끝난다.`,
        `FCFS로 풀면 ${fcfs.finish.C}이 된다. 같은 시각에 도착한 프로세스와 quantum을 소진한 프로세스의 순서(새로 도착한 쪽이 먼저)를 바꾸면 결과가 달라진다.`,
        "Ch09 p.13(새로 도착한 프로세스를 먼저 RQ에 넣고 time quantum을 소진한 프로세스를 그 뒤에 넣음)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(fcfs.waiting.C), String(spn.turnaround.C)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-003",
      topic: "SPN",
      difficulty: 2,
      slideRef: "Ch09 p.19, p.26",
      prompt: `${HEAD}이들을 **SPN**(비선점)으로 스케줄링할 때 프로세스 C의 대기시간(Tw)은? (숫자만)`,
      text: "C의 대기시간 = {{0}}",
      blanks: [{ accept: [String(spn.waiting.C)] }],
      explanation: why(
        `실행 순서 ${timeline(spn)}. C는 시각 ${spn.finish.C}에 끝나므로 Tr = ${spn.finish.C} − ${PROCS[2].arrival} = ${spn.turnaround.C}, Tw = Tr − Ts = ${spn.turnaround.C} − ${PROCS[2].service} = ${spn.waiting.C}.`,
        `반환시간(${spn.turnaround.C})을 답하면 틀린다 — 대기시간은 서비스 시간을 뺀 값이다.`,
        "Ch09 p.19(SPN), p.26(대기시간 = 반환시간 − 서비스시간)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(spn.turnaround.A), String(fcfs.turnaround.A)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-004",
      topic: "SRT",
      difficulty: 3,
      slideRef: "Ch09 p.21, p.26",
      prompt: `${HEAD}이들을 **SRT**로 스케줄링할 때(새 프로세스가 도착할 때마다 남은 시간 s−e가 가장 짧은 것 선택) 프로세스 A의 반환시간(Tr)은? (숫자만)`,
      text: "A의 반환시간 = {{0}}",
      blanks: [{ accept: [String(srt.turnaround.A)] }],
      explanation: why(
        `실행 순서 ${timeline(srt)}. A는 시각 ${srt.finish.A}에 끝나므로 Tr = ${srt.finish.A} − 0 = ${srt.turnaround.A}.`,
        `비선점 SPN으로 풀면 A는 처음부터 끝까지 실행되어 ${spn.turnaround.A}이 된다.`,
        "Ch09 p.21(SRT: SPN의 선점형 버전, 새 프로세스가 도착할 때마다 스케줄링), p.26",
      ),
    },
  },
  {
    kind: "계산",
    wrong: hrrnPick.candidates.filter((c) => c.name !== hrrnPick.chosen).map((c) => c.name),
    q: {
      ...C9,
      ...star(),
      id: "os-ch09-short-005",
      summary: "HRRN은 R = (대기 + 서비스) / 서비스가 가장 큰 프로세스를 비선점으로 고른다(p.22)",
      topic: "HRRN 응답 비율",
      difficulty: 3,
      slideRef: "Ch09 p.22",
      prompt: `${HEAD}이들을 **HRRN**으로 스케줄링할 때 시각 ${hrrnPick.time}에 선택되는 프로세스는? (프로세스 이름 한 글자)`,
      text: `시각 ${hrrnPick.time}에 선택 = {{0}}`,
      blanks: [{ accept: [hrrnPick.chosen] }],
      explanation: why(
        `실행 순서 ${timeline(hrrn)}. 시각 ${hrrnPick.time}의 응답 비율 R = (대기 + 서비스) / 서비스: ${hrrnPick.candidates.map((c) => `${c.name} = (${c.waited}+${c.remaining})/${c.remaining} = ${round2(c.ratio)}`).join(", ")} → 가장 큰 ${hrrnPick.chosen}.`,
        "대기시간만 보거나 서비스 시간만 보면 다른 프로세스를 고르게 된다 — 두 값을 함께 쓰는 비율로 비교한다.",
        "Ch09 p.22(R = (대기한 시간 + 예상 서비스 시간) / 예상 서비스 시간, 비선점)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [num(rrq.waited / rrq.service), num(rrq.service / (rrq.waited + rrq.service))],
    q: {
      ...C9,
      ...star(),
      id: "os-ch09-short-006",
      summary: "HRRN 응답 비율 R = (대기한 시간 + 예상 서비스 시간) / 예상 서비스 시간(p.22)",
      topic: "HRRN 응답 비율",
      difficulty: 2,
      slideRef: "Ch09 p.22",
      prompt: `HRRN에서 Ready 큐에서 ${rrq.waited}만큼 기다린 프로세스의 예상 서비스 시간이 ${rrq.service}이다. 이 프로세스의 응답 비율 R은? (숫자만, 소수 둘째 자리까지)`,
      text: "R = {{0}}",
      blanks: [{ accept: [num(responseRatio(rrq.waited, rrq.service))] }],
      explanation: why(
        `R = (대기한 시간 + 예상 서비스 시간) / 예상 서비스 시간 = (${rrq.waited}+${rrq.service})/${rrq.service} = ${num(responseRatio(rrq.waited, rrq.service))}.`,
        `대기시간/서비스 시간(${num(rrq.waited / rrq.service)})만 계산하면 1이 빠진다.`,
        "Ch09 p.22",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [num(eaR[2], 3), num((ea.observed.reduce((s, x) => s + x, 0)) / ea.observed.length, 3)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-007",
      topic: "서비스 시간 추정",
      difficulty: 3,
      slideRef: "Ch09 p.18",
      prompt: `지수 평균 S(n+1) = α × T(n) + (1 − α) × S(n)으로 다음 CPU burst를 예측한다. α = ${ea.alpha}, 첫 예측값 S(1) = ${ea.s1}이고 실제 실행 시간이 차례로 T(1) = ${ea.observed[0]}, T(2) = ${ea.observed[1]}, T(3) = ${ea.observed[2]}일 때 S(4)는? (숫자만, 소수 셋째 자리까지)`,
      text: "S(4) = {{0}}",
      blanks: [{ accept: [num(eaR[3], 3)] }],
      explanation: why(
        `S(2) = ${ea.alpha}×${ea.observed[0]} + ${num(1 - ea.alpha)}×${ea.s1} = ${num(eaR[1], 3)}, S(3) = ${ea.alpha}×${ea.observed[1]} + ${num(1 - ea.alpha)}×${num(eaR[1], 3)} = ${num(eaR[2], 3)}, S(4) = ${ea.alpha}×${ea.observed[2]} + ${num(1 - ea.alpha)}×${num(eaR[2], 3)} = ${num(eaR[3], 3)}.`,
        `S(3)(${num(eaR[2], 3)})에서 멈추거나 단순 평균(${num(ea.observed.reduce((s, x) => s + x, 0) / ea.observed.length, 3)})을 쓰기 쉽다.`,
        "Ch09 p.18(지수 평균)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(fcfs.turnaround.E), num(fcfs.waiting.E / PROCS[4].service)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-008",
      topic: "반환·대기·정규화 반환시간",
      difficulty: 2,
      slideRef: "Ch09 p.26",
      prompt: `${HEAD}이들을 **FCFS**로 스케줄링할 때 프로세스 E의 정규화 반환시간(Tr/Ts)은? (숫자만, 소수 둘째 자리까지)`,
      text: "E의 Tr/Ts = {{0}}",
      blanks: [{ accept: [num(fcfs.normalized.E)] }],
      explanation: why(
        `실행 순서 ${timeline(fcfs)}. E는 시각 ${fcfs.finish.E}에 끝나 Tr = ${fcfs.finish.E} − ${PROCS[4].arrival} = ${fcfs.turnaround.E}, Ts = ${PROCS[4].service}이므로 Tr/Ts = ${num(fcfs.normalized.E)}.`,
        `반환시간(${fcfs.turnaround.E})을 그대로 답하거나 Tw/Ts(${num(fcfs.waiting.E / PROCS[4].service)})를 쓰면 틀린다 — Tr/Ts = 1 + Tw/Ts.`,
        "Ch09 p.26(정규화 반환시간 = Tr/Ts = 1 + Tw/Ts)",
      ),
    },
  },
  {
    kind: "계산",
    wrong: [String(rr1.finish.B), String(fcfs.finish.B)],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-009",
      topic: "Feedback",
      difficulty: 3,
      slideRef: "Ch09 p.23-25",
      prompt: `${HEAD}이들을 **Feedback**(RQi의 time quantum = 2^i, 새 프로세스는 RQ0, 한 번 실행되면 아래 큐로 내려가되 레디 큐에 자기 혼자면 내려가지 않음, 종료되거나 quantum을 소진한 후에만 다시 스케줄링)으로 스케줄링할 때 프로세스 B가 완료되는 시각은? (숫자만)`,
      text: "B의 완료 시각 = {{0}}",
      blanks: [{ accept: [String(fb.finish.B)] }],
      explanation: why(
        `실행 순서 ${timeline(fb)}. B는 시각 ${fb.finish.B}에 끝난다.`,
        `RR(q=1)로 풀면 ${rr1.finish.B}이 된다 — Feedback은 아래 큐로 갈수록 quantum이 2^i로 길어지고 위 큐가 빌 때만 아래 큐를 실행한다.`,
        "Ch09 p.23-25(피드백, 아래로 내려갈수록 time quantum 2^i)",
      ),
    },
  },
  {
    kind: "공식·목록",
    wrong: ["4", "3"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-010",
      topic: "Feedback",
      difficulty: 2,
      slideRef: "Ch09 p.24-25",
      prompt: `${NUM} Feedback 스케줄링에서 RQi에서 실행될 때 주어지는 time quantum이 2^i라면,`,
      text: "RQ3에서 주어지는 time quantum = {{0}}",
      blanks: [{ accept: [String(2 ** 3)] }],
      explanation: why(
        "p.24-25: 아래 레디 큐로 내려갈수록 실행 시 주어지는 time quantum이 길어진다(2^i): RQ0 = 1, RQ1 = 2, RQ2 = 4, RQ3 = 8.",
        "RQ2의 4나 큐 번호 3을 그대로 쓰기 쉽다.",
        "Ch09 p.24-25",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["time quantum", "시분할"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-011",
      topic: "라운드 로빈",
      difficulty: 2,
      slideRef: "Ch09 p.15",
      prompt: TERM,
      text: "라운드 로빈은 클록 인터럽트가 일정한 주기로 발생해 현재 프로세스를 준비 큐로 보내고 다음 작업을 선택하므로 {{0}}이라고도 한다.",
      blanks: [{ accept: ["타임 슬라이싱", "time slicing", "타임슬라이싱", "time-slicing"] }],
      explanation: why(
        "p.15: 라운드 로빈은 클록 인터럽트가 일정한 주기로 발생하면 현재 실행 중인 프로세스를 준비 큐로 보내고 다음 준비된 작업을 선택하는 방식으로, 타임 슬라이싱(time slicing)이라고도 한다.",
        "time quantum은 한 번에 주어지는 시간의 양이지 방식의 이름이 아니다.",
        "Ch09 p.15",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["CPU", "디스크"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-012",
      topic: "서비스 시간 추정",
      difficulty: 2,
      slideRef: "Ch09 p.18",
      prompt: `${TERM} 영어로 쓴다.`,
      text: "과거 CPU burst 이력으로 다음 실행 시간을 예측한다. 프로세스는 CPU burst → {{0}} → CPU burst → … 를 반복한다.",
      blanks: [{ accept: ["I/O burst", "IO burst", "입출력 burst", "I/O 버스트", "입출력 버스트"] }],
      explanation: why(
        "p.18: CPU burst(CPU에서 쉬지 않고 일하는 시간 양) → I/O burst → CPU burst → I/O burst의 반복이다.",
        "CPU burst끼리 이어지지 않는다 — 사이에 I/O를 기다리는 구간이 있다.",
        "Ch09 p.18",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["지수 평균", "가중 평균"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-013",
      topic: "서비스 시간 추정",
      difficulty: 2,
      slideRef: "Ch09 p.18",
      prompt: TERM,
      text: "{{0}}: 과거 관측값을 모두 같은 가중치로 평균하는 서비스 시간 추정 방법 — 오래된 이력이 최근 변화를 가린다.",
      blanks: [{ accept: ["단순 평균", "Simple Averaging", "단순평균", "simple average"] }],
      explanation: why(
        "p.18: 단순 평균(Simple Averaging)은 과거 관측값을 모두 같은 가중치로 평균해 오래된 이력이 최근 변화를 가린다. 지수 평균은 최근 관측값일수록 가중치가 크다.",
        "지수 평균은 최근 값에 더 큰 가중치를 준다.",
        "Ch09 p.18",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["디스패처", "스케줄러"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-014",
      topic: "스케줄링 목표·수준",
      difficulty: 2,
      slideRef: "Ch09 p.2",
      prompt: TERM,
      text: "스케줄러 안에는 다음에 실행할 프로세스를 고르는 {{0}}과 프로세서를 넘겨주는 디스패처가 있다.",
      blanks: [{ accept: ["스케줄링 알고리즘", "scheduling algorithm", "스케줄링알고리즘"] }],
      explanation: why(
        "p.2 필기: 스케줄러 안에는 스케줄링 알고리즘과 디스패처가 있다 — 알고리즘이 다음 프로세스를 고르고 디스패처가 프로세서를 넘겨준다.",
        "디스패처는 이미 문장에 있는 다른 구성요소다.",
        "Ch09 p.2",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["강등", "선점"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-015",
      topic: "Feedback",
      difficulty: 2,
      slideRef: "Ch09 p.23",
      prompt: TERM,
      text: "Feedback에서 긴 작업의 기아 위험은 상위 큐 {{0}} 또는 하위 큐 퀀텀을 늘리는(2^i) 방법으로 완화한다.",
      blanks: [{ accept: ["승격", "promotion", "승급"] }],
      explanation: why(
        "p.23: 피드백은 더 오래 실행된 작업에 불이익을 주므로 긴 작업에 기아 위험이 있고, 상위 큐 승격 또는 하위 큐 퀀텀↑(2^i)로 완화한다.",
        "아래 큐로 내려가는 것(강등)은 기아를 일으키는 쪽이다.",
        "Ch09 p.23",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["서비스 시간", "우선순위"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-016",
      topic: "FCFS",
      difficulty: 2,
      slideRef: "Ch09 p.12",
      prompt: TERM,
      text: "FCFS는 기아가 없지만 평균 대기시간이 {{0}}에 민감해 대화형 시스템엔 부적합하다.",
      blanks: [{ accept: ["도착 순서", "도착순서", "arrival order", "도착 시간 순서"] }],
      explanation: why(
        "p.12: FCFS는 기아 없음(no starvation), 단 평균 대기시간은 도착 순서에 민감 → 대화형 시스템엔 부적합.",
        "서비스 시간으로 순서를 정하는 것은 SPN이다.",
        "Ch09 p.12",
      ),
    },
  },
  {
    kind: "용어",
    wrong: ["처리량", "효율"],
    q: {
      ...C9,
      ...plain,
      id: "os-ch09-short-017",
      topic: "반환·대기·정규화 반환시간",
      difficulty: 2,
      slideRef: "Ch09 p.26",
      prompt: TERM,
      text: "정규화 반환시간(Tr/Ts)은 실행량 대비 상대적 지연으로, 짧은 작업이 오래 기다리면 값이 크게 튀므로 {{0}} 판단에 쓴다.",
      blanks: [{ accept: ["공정성", "fairness", "공평성"] }],
      explanation: why(
        "p.26: 정규화 반환시간 = 1 + 대기시간/서비스시간(최소 1) — 실행량 대비 상대적 지연이라 짧은 작업이 오래 기다리면 값이 크게 튄다(공정성 판단).",
        "처리량은 단위 시간당 완료되는 프로세스 수다.",
        "Ch09 p.26",
      ),
    },
  },
];

export const SHORT_ITEMS: Readonly<Record<"ch02" | "ch03" | "ch07" | "ch08" | "ch09", readonly ShortItem[]>> = { ch02, ch03, ch07, ch08, ch09 };
export const shortQuestions = (chapter: keyof typeof SHORT_ITEMS): Question[] => SHORT_ITEMS[chapter].map((i) => i.q);

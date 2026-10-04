/**
 * 프로세스 상태 전이 · Process switch 원인 시나리오 (Ch03 p.12-13, p.41-42, 원본 §6-7·§7).
 * 정적 시나리오 은행 + seed로 고르는 조합. 문장은 모두 원본 §7에 있는 사례만 쓴다.
 */

export const SWITCH_CAUSES = [
  "Clock interrupt",
  "I/O interrupt",
  "I/O 함수 호출",
  "Trap interrupt",
  "Memory fault interrupt",
] as const;
export type SwitchCause = (typeof SWITCH_CAUSES)[number];

export const TRANSITIONS = [
  "Running→Ready",
  "Running→Blocked",
  "Blocked→Ready",
  "Running→Exit",
] as const;
export type Transition = (typeof TRANSITIONS)[number];

export interface Scenario {
  text: string;
  cause: SwitchCause;
  transition: Transition;
}

/** 원본 §7 Ch03(p.13 상태 천이, p.41-42 Process switch 5가지)의 사례 */
export const SCENARIOS: readonly Scenario[] = [
  {
    text: "타임슬라이스(0.1초)를 다 써 버렸다",
    cause: "Clock interrupt",
    transition: "Running→Ready",
  },
  {
    text: "sleep(2)로 기다리던 2초가 지났다",
    cause: "Clock interrupt",
    transition: "Running→Ready",
  },
  {
    text: "키보드에서 기다리던 입력 데이터가 도착했다",
    cause: "I/O interrupt",
    transition: "Blocked→Ready",
  },
  {
    text: "디스크에서 읽기를 요청한 데이터가 도착했다",
    cause: "I/O interrupt",
    transition: "Blocked→Ready",
  },
  {
    text: "네트워크에서 기다리던 패킷이 도착했다",
    cause: "I/O interrupt",
    transition: "Blocked→Ready",
  },
  {
    text: "scanf를 호출했는데 입력 데이터가 아직 없다",
    cause: "I/O 함수 호출",
    transition: "Running→Blocked",
  },
  {
    text: "fread로 파일을 읽는 시스템 콜을 호출했다",
    cause: "I/O 함수 호출",
    transition: "Running→Blocked",
  },
  {
    text: "recv로 네트워크 데이터를 받는 함수를 호출했다",
    cause: "I/O 함수 호출",
    transition: "Running→Blocked",
  },
  {
    text: "잘못된 포인터로 메모리에 접근해 Segment fault가 났다",
    cause: "Trap interrupt",
    transition: "Running→Exit",
  },
  {
    text: "명령어가 깨져 Illegal instruction이 발생했다",
    cause: "Trap interrupt",
    transition: "Running→Exit",
  },
  {
    text: "다음에 실행할 명령어가 있는 페이지가 메모리에 없다",
    cause: "Memory fault interrupt",
    transition: "Running→Blocked",
  },
  {
    text: "접근하려는 변수가 있는 페이지가 메모리에 없다",
    cause: "Memory fault interrupt",
    transition: "Running→Blocked",
  },
];

export function scenariosByCause(cause: SwitchCause): Scenario[] {
  return SCENARIOS.filter((s) => s.cause === cause);
}

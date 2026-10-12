import type { Question } from "@/types/question";
import { block, jokboOf, y23 } from "./jokboSource";

// Ch09 족보 문항(원문 그대로) — 모두 2023 시험(정답 표시 없음)이라 슬라이드·시뮬레이터로 정답을 정했다.
// SRT·HRRN 추적 정답은 data/subjects/os/jokbo.test.ts가 lib/sim/os/scheduling으로 다시 계산해 확인한다.
const base = { subject: "os", chapter: "ch09", shuffle: false } as const;

const table = (service: string) => block("Process Name   A  B  C", "Arrival Time   0  1  2", `Service Time   ${service}`);

const questions: readonly Question[] = [
  {
    ...base,
    ...jokboOf([y23(2)], "sched-trace"),
    id: "os-ch09-jokbo-001",
    topic: "SRT",
    type: "multi",
    difficulty: 3,
    slideRef: "Ch09 p.21",
    prompt: `아래 표는 프로세스들의 도착 및 서비스 시간 정보이다.\n${table("5  3  1")}\n이들이 SRT에 의해 스케줄링 될 때 시간 0 ~ 4에서 스케줄링된 프로세스들 중 [잘못된 두 개]를 고르시오.`,
    choices: ["1: A", "2: C", "0: A", "4: B", "3: A"],
    answerIndexes: [0, 4],
    explanation:
      "p.21: SRT는 새 프로세스가 도착할 때마다 남은 시간(s − e)이 가장 짧은 것을 고른다. 시간 0: A(5). 시간 1: B(3) < A 남은 4 → B. 시간 2: C(1) < B 남은 2 → C. 시간 3: B 남은 2 < A 4 → B. 시간 4: B 계속(남은 1). 실행 순서 A B C B B → '1: A'와 '3: A'가 틀렸다. 2023 원문에는 정답 표시가 없어 lib/sim/os/scheduling(simulate srt)으로 계산했다.",
  },
  {
    ...base,
    ...jokboOf([y23(12)], "sched-trace"),
    id: "os-ch09-jokbo-002",
    topic: "HRRN 응답 비율",
    type: "multi",
    difficulty: 3,
    slideRef: "Ch09 p.22",
    prompt: `아래 표는 프로세스들의 도착 및 서비스 시간 정보이다.\n${table("2  2  1")}\n이들이 HRRN에 의해 스케줄링 될 때 시간 0 ~ 4에서 스케줄링된 프로세스들 중 [잘못된 두 개]를 고르시오.`,
    choices: ["0: A", "4: B", "2: B", "3: C", "1: A"],
    answerIndexes: [1, 3],
    explanation:
      "p.22: HRRN은 비선점이며 R = (대기한 시간 + 예상 서비스 시간) / 예상 서비스 시간이 가장 큰 것을 고른다. A가 0~2 실행. 시간 2: B = (1+2)/2 = 1.5, C = (0+1)/1 = 1 → B가 2~4 실행, C는 4~5. 시간 3은 B, 시간 4는 C → '4: B'와 '3: C'가 틀렸다. 2023 원문에는 정답 표시가 없어 lib/sim/os/scheduling(simulate hrrn)으로 계산했다.",
  },
  {
    ...base,
    ...jokboOf([y23(23)]),
    id: "os-ch09-jokbo-003",
    topic: "Feedback",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch09 p.23",
    prompt: "Feedback 스케줄링 알고리즘에 대한 다음 설명 중 [올바른 두 개]를 고르시오.",
    choices: [
      "SPN, SRT, HRRN은 짧은 작업의 프로세스를 우선적으로 실행하고자 하는 전략임",
      "SPN, SRT, HRRN은 필요로 하는 프로세스의 서비스 시간을 미리 알고 있어야 적용 가능함",
      "실제 remaining time을 몰라도 SRT보다 더 뛰어난 효과를 내는 것이 Feedback 알고리즘임",
      "운영체제가 서비스 시간을 미리 쉽게 예측할 수 있기 때문에 SPN, SRT, HRRN의 활용도가 매우 높음",
    ],
    answerIndexes: [0, 1],
    explanation:
      "p.23: SPN, SRT, HRRN 알고리즘은 짧은 작업의 프로세스를 우선적으로 실행하고자 하는 전략이며, 문제점은 실행시간(service time)을 미리 알아야 하고 현실에서 적용하기 힘들다는 것. Feedback은 실제 remaining time을 몰라도 SRT와 '비슷한' 효과를 낸다(더 뛰어난 효과가 아님). 2023 원문에는 정답 표시가 없어 슬라이드로 정했다.",
  },
  {
    ...base,
    ...jokboOf([y23(33)]),
    id: "os-ch09-jokbo-004",
    topic: "라운드 로빈",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch09 p.15-17",
    prompt: "Round-robin 스케줄링 알고리즘에 대한 다음 설명 중 [올바른 두 개]를 고르시오.",
    choices: [
      "I/O-bound 프로세스보다 상대적으로 불리한 CPU-bound 프로세스를 위해 virtual round-robin이 만들어 졌음",
      "Virtual round-robin은 여러 개의 ready queue가 존재하며 프로세스는 한번 실행 때마다 다음 단계의 큐로 한 단계씩 내려감",
      "CPU-bound 프로세스는 대부분 자신에게 주어진 time quantum을 모두 소진한 후에 processor를 반납함",
      "I/O-bound 프로세스는 I/O 작업으로 인해 자신에게 주어진 time slice를 다 사용하지도 못한 채 processor를 반납해야 하는 경우가 종종 발생함",
    ],
    answerIndexes: [2, 3],
    explanation:
      "p.15: RR은 CPU 중심 프로세스에 유리하다 — CPU-bound는 I/O가 거의 없어 quantum을 다 쓰고, p.16 필기: I/O-bound는 scanf() 등으로 quantum을 다 쓰지 못한 채 중단되는 경우가 자주 발생한다. 가상 라운드 로빈(p.17)은 불리한 I/O-bound를 위해 보조 큐를 둔 것이고, 여러 ready queue를 한 단계씩 내려가는 것은 Feedback(p.24)이다. 2023 원문에는 정답 표시가 없어 슬라이드로 정했다.",
  },
  {
    ...base,
    ...jokboOf([y23(37)]),
    id: "os-ch09-jokbo-005",
    topic: "알고리즘 비교",
    type: "multi",
    difficulty: 3,
    slideRef: "Ch09 p.21-22",
    prompt: `다음 중 각 스케줄링 알고리즘의 selection function 중 [올바른 두 개]를 고르시오.\n${block("w = time spent waiting", "e = time spent in execution so far", "s = total service time required by the process, including e")}`,
    choices: ["SPN: min[e]", "SRT: min[s-e]", "FCFS: max[w]", "HRRN: max((w+e)/e)"],
    answerIndexes: [1, 2],
    explanation:
      "p.19: SPN은 예상 처리 시간이 가장 짧은 것 → min[s](min[e] 아님). p.21 필기: SRT는 s − e(총 서비스 시간 − 지금까지 실행된 시간)가 가장 짧은 것 → min[s−e]. p.11: FCFS는 대기시간이 가장 긴 것 → max[w]. p.22: HRRN은 (대기한 시간 + 예상 서비스 시간) / 예상 서비스 시간 → max((w+s)/s)(e가 아님). 2023 원문에는 정답 표시가 없어 슬라이드로 정했다.",
  },
  {
    ...base,
    ...jokboOf([y23(49)]),
    id: "os-ch09-jokbo-006",
    topic: "스케줄링 기준(용어)",
    type: "multi",
    difficulty: 2,
    slideRef: "Ch09 p.5",
    prompt: "다음 용어 설명 중 [올바른 두 개]를 고르시오.",
    choices: [
      "Throughput: 프로세스 시작에서 끝날 때까지 소요된 시간",
      "Response time: 입력이 들어간 후 출력이 나올 때까지 소요된 시간",
      "Deadline: 프로세스 실행을 완료해야 하는 만기 시간",
      "Turnaround time: 단위시간당 처리를 끝낸 프로세스 개수",
    ],
    answerIndexes: [1, 2],
    explanation:
      "p.5: 응답시간(Response time) = 요청 제출부터 응답이 시작되기까지의 시간, 마감시간(Deadlines) = 완료 마감. 처리량(Throughput) = 단위 시간당 완료되는 프로세스 수, 반환시간(Turnaround time) = 제출부터 완료까지의 시간 — 보기의 Throughput·Turnaround time 설명은 서로 뒤바뀌었다. 2023 원문에는 정답 표시가 없어 슬라이드로 정했다.",
  },
];

export default questions;

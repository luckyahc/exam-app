import { describe, expect, it } from "vitest";
import os from "./index";

// Ch09 소주제 목표(docs/progress/sprint-19.md §2): ⭐ 소주제 8문항·유형 3종 이상, 일반 소주제 2~4, 합계 = minQuestions
const TARGET: Record<string, number> = {
  "스케줄링 목표·수준": 4,
  "스케줄러 호출 시점": 8,
  "스케줄링 기준(용어)": 8,
  "우선순위·기아": 3,
  "결정 방식(비선점·선점)": 4,
  "서비스 시간·CPU/I-O 중심": 3,
  FCFS: 4,
  "시각별 스케줄링 추적": 8,
  "라운드 로빈": 4,
  "가상 라운드 로빈": 3,
  "서비스 시간 추정": 4,
  SPN: 3,
  SRT: 3,
  "HRRN 응답 비율": 8,
  Feedback: 4,
  "반환·대기·정규화 반환시간": 4,
  "알고리즘 비교": 4,
};

describe("OS Ch09 소주제 목표", async () => {
  const ch09 = os.chapters.find((c) => c.id === "ch09")!;
  // 족보 문항(origin: "jokbo")과 족보관련 생성 문항(basedOn — jokboPatterns.test.ts)은 소주제 목표·⭐ 규칙 밖(docs/jokbo-plan.md §4)
  const qs = (await ch09.load()).filter((q) => q.topic !== "용어" && q.origin !== "jokbo" && !q.basedOn);

  it("소주제별 문항 수 = 목표, 합계 = minQuestions", () => {
    const count: Record<string, number> = {};
    for (const q of qs) count[q.topic] = (count[q.topic] ?? 0) + 1;
    expect(count).toEqual(TARGET);
    expect(qs.length).toBe(ch09.minQuestions);
  });

  it("⭐ 소주제는 6~10문항·유형 3종 이상이고, ⭐는 그 소주제에만 있다(필기 근거)", () => {
    const stars = new Map<string, Set<string>>();
    const n = new Map<string, number>();
    for (const q of qs.filter((x) => x.exam)) {
      expect(q.examBasis, q.id).toBe("handwritten");
      (stars.get(q.topic) ?? stars.set(q.topic, new Set()).get(q.topic)!).add(q.type);
      n.set(q.topic, (n.get(q.topic) ?? 0) + 1);
    }
    expect([...stars.keys()].sort()).toEqual(["HRRN 응답 비율", "스케줄러 호출 시점", "스케줄링 기준(용어)", "시각별 스케줄링 추적"].sort());
    for (const [topic, types] of stars) {
      expect(types.size, topic).toBeGreaterThanOrEqual(3);
      expect(n.get(topic), topic).toBeGreaterThanOrEqual(6);
      expect(n.get(topic), topic).toBeLessThanOrEqual(10);
      expect(qs.filter((q) => q.topic === topic).every((q) => q.exam), topic).toBe(true);
    }
  });
});

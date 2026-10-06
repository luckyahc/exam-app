/**
 * 데이터과학 문항 비중 규칙(Sprint 15 마무리, ds-question-types.md §8 · coverage-matrix 데이터과학 절).
 * 실제 시험의 코드 문제는 코드 빈칸 채우기가 중심(실행 채점·부분 점수 없음)이고 전체 작성형은 거의 나오지 않는다.
 * - 코드 문제(코드가 딸린 문항) 중 빈칸형 60% 이상, 전체 작성형 15% 이하, 실행 결과 고르기 30% 이하
 * - 복수 선택(정답 2개 이상) 강의 문항의 8% 이상, mcq 30% 이하
 * 전 강의에 적용한다(Lec1~3은 Sprint 16에 코드 빈칸형을 보강해 맞춤). 복수 선택 8% 이상도 전 강의(Lec2는 Sprint 16 마무리에 +2)
 */
import { describe, expect, it } from "vitest";
import { dsRatios } from "@/lib/verify/ratios";
import dataScience from "./index";


describe("데이터과학 비중 규칙(전 강의)", () => {
  for (const ch of dataScience.chapters) {
    it(ch.id, async () => {
      const qs = await ch.load();
      if (qs.length === 0) return; // 아직 작성 전
      const r = dsRatios(qs);
      expect(r.blank, "코드 문제 중 빈칸형 60% 이상").toBeGreaterThanOrEqual(0.6);
      expect(r.write, "코드 문제 중 전체 작성형 15% 이하").toBeLessThanOrEqual(0.15);
      expect(r.output, "코드 문제 중 실행 결과 고르기 30% 이하").toBeLessThanOrEqual(0.3);
      expect(r.multi, "복수 선택 8% 이상").toBeGreaterThanOrEqual(0.08);
      expect(r.mcq, "mcq 30% 이하").toBeLessThanOrEqual(0.3);
    });
  }
});

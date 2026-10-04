import type { ComponentType } from "react";
import type { GradeResult } from "@/lib/qtypes/base";
import type { AnswerOf, DetailOf, QType, QuestionOf } from "@/lib/qtypes/registry";

export interface InputProps<K extends QType> {
  question: QuestionOf<K>;
  answer: AnswerOf<K>;
  onChange(answer: AnswerOf<K>): void;
  /** 채점 후 등 입력을 막을 때 */
  disabled: boolean;
}

export interface ReviewProps<K extends QType> {
  question: QuestionOf<K>;
  answer: AnswerOf<K>;
  result: GradeResult<DetailOf<K>>;
}

/** 문제 유형 하나의 UI: 입력 컴포넌트 + "내 답 vs 정답" 비교 컴포넌트 */
export interface QTypeUI<K extends QType> {
  Input: ComponentType<InputProps<K>>;
  Review: ComponentType<ReviewProps<K>>;
}

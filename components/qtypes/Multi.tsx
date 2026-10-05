"use client";

import { choiceOrder } from "@/lib/qtypes/choiceOrder";
import { toggleChoice } from "@/lib/qtypes/multi";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { ChoiceButton, Mark, ReviewList, ReviewRow, RichText, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"multi">) {
  return (
    <div role="group" aria-label="보기 (복수 선택)" className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        해당하는 것을 모두 고르세요. 틀린 보기를 고르면 감점됩니다.
      </p>
      {/* 표시 순서는 문제 id로 고정해 섞는다(choiceOrder) — 답은 원래 보기 번호로 저장 */}
      {choiceOrder(question).map((orig, pos) => (
        <ChoiceButton
          key={orig}
          index={pos}
          role="checkbox"
          selected={answer.includes(orig)}
          disabled={disabled}
          onClick={() => onChange(toggleChoice(answer, orig))}
        >
          <RichText text={question.choices[orig]} />
        </ChoiceButton>
      ))}
    </div>
  );
}

function Review({ question, answer }: ReviewProps<"multi">) {
  return (
    <ReviewList>
      {choiceOrder(question).map((i, pos) => {
        const c = question.choices[i];
        const isAnswer = question.answerIndexes.includes(i);
        const isMine = answer.includes(i);
        const ok = isAnswer === isMine;
        return (
          <ReviewRow
            key={i}
            tone={ok ? (isAnswer ? "correct" : "neutral") : "incorrect"}
            aside={
              <>
                <Tag tone={isMine ? "primary" : "muted"}>{isMine ? "고름" : "안 고름"}</Tag>
                <Tag tone={isAnswer ? "correct" : "muted"}>
                  {isAnswer ? "정답 보기" : "오답 보기"}
                </Tag>
                <Mark ok={ok} okText="맞음" noText={isAnswer ? "빠뜨림" : "잘못 고름"} />
              </>
            }
          >
            {pos + 1}. <RichText text={c} />
          </ReviewRow>
        );
      })}
    </ReviewList>
  );
}

export const MultiUI: QTypeUI<"multi"> = { Input, Review };

"use client";

import { choiceOrder } from "@/lib/qtypes/choiceOrder";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { ChoiceButton, Mark, ReviewList, ReviewRow, RichText, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"mcq">) {
  return (
    <div role="radiogroup" aria-label="보기" className="flex flex-col gap-2">
      {/* 표시 순서는 문제 id로 고정해 섞는다(choiceOrder) — 답은 원래 보기 번호로 저장 */}
      {choiceOrder(question).map((orig, pos) => (
        <ChoiceButton
          key={orig}
          index={pos}
          selected={answer === orig}
          disabled={disabled}
          onClick={() => onChange(orig)}
        >
          <RichText text={question.choices[orig]} />
        </ChoiceButton>
      ))}
    </div>
  );
}

function Review({ question, answer }: ReviewProps<"mcq">) {
  return (
    <ReviewList>
      {choiceOrder(question).map((i, pos) => {
        const c = question.choices[i];
        const isAnswer = i === question.answerIndex;
        const isMine = i === answer;
        if (!isAnswer && !isMine) return null;
        return (
          <ReviewRow
            key={i}
            tone={isAnswer ? "correct" : "incorrect"}
            aside={
              <>
                {isMine && <Tag tone="primary">내 답</Tag>}
                {isAnswer ? <Tag tone="correct">정답</Tag> : <Mark ok={false} />}
              </>
            }
          >
            {pos + 1}. <RichText text={c} />
          </ReviewRow>
        );
      })}
      {answer === null && <p className="text-sm text-muted">답을 고르지 않았습니다.</p>}
    </ReviewList>
  );
}

export const McqUI: QTypeUI<"mcq"> = { Input, Review };

"use client";

import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { ChoiceButton, Mark, ReviewList, ReviewRow, RichText, Tag } from "./ui";

function Input({ question, answer, onChange, disabled }: InputProps<"mcq">) {
  return (
    <div role="radiogroup" aria-label="보기" className="flex flex-col gap-2">
      {question.choices.map((c, i) => (
        <ChoiceButton
          key={i}
          index={i}
          selected={answer === i}
          disabled={disabled}
          onClick={() => onChange(i)}
        >
          <RichText text={c} />
        </ChoiceButton>
      ))}
    </div>
  );
}

function Review({ question, answer }: ReviewProps<"mcq">) {
  return (
    <ReviewList>
      {question.choices.map((c, i) => {
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
            {i + 1}. <RichText text={c} />
          </ReviewRow>
        );
      })}
      {answer === null && <p className="text-sm text-muted">답을 고르지 않았습니다.</p>}
    </ReviewList>
  );
}

export const McqUI: QTypeUI<"mcq"> = { Input, Review };

"use client";

import { useRef } from "react";
import { RichText } from "@/components/qtypes/ui";
import {
  Calc,
  Classify,
  CodeBlankInput,
  CodeWriteInput,
  Essay,
  Graph,
  Order,
  Trace,
} from "./PracticeInputsMore";
import { ChoiceRow, type ChoiceResult } from "@/components/ui/ChoiceRow";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextInput } from "@/components/ui/TextInput";
import type { GradeResult } from "@/lib/qtypes/base";
import { splitBlankText } from "@/lib/qtypes/blank";
import { choiceOrder } from "@/lib/qtypes/choiceOrder";
import { matchOptions } from "@/lib/qtypes/match";
import { toggleChoice } from "@/lib/qtypes/multi";
import {
  type AnswerOf,
  type AnyAnswer,
  isAllOrNothing,
  type QType,
  type Question,
  type QuestionOf,
} from "@/lib/qtypes/registry";

/**
 * 연습 모드 전용 입력(디자인 개편 6단계: 객관식·복수 선택·OX·빈칸·짝짓기, 7-1단계: 나머지 유형은 PracticeInputsMore.tsx).
 * 시험 화면·시험 모드는 기존 components/qtypes/* 를 그대로 쓴다.
 * 채점은 하지 않는다 — QuizRunner가 gradeQuestion으로 채점한 result(정답 번호·칸별 정오 detail)를 받아 표시만 한다.
 * 채점 뒤에는 입력 자리에서 바로 정답/오답을 보여 주므로(보기 테두리·입력창 아래 정답) 따로 비교 화면이 없다.
 */
export interface PracticeInputProps<K extends QType> {
  question: QuestionOf<K>;
  answer: AnswerOf<K>;
  onChange(answer: AnswerOf<K>): void;
  result: GradeResult | null;
  /** 단답·빈칸의 마지막 칸에서 Enter = 확인 */
  onEnter(): void;
}

function Mcq({ question, answer, onChange, result }: PracticeInputProps<"mcq">) {
  return (
    <div role="radiogroup" aria-label="보기" className="flex flex-col gap-2">
      {/* 표시 순서는 문제 id로 고정해 섞는다(choiceOrder) — 답은 원래 보기 번호로 저장 */}
      {choiceOrder(question).map((orig, pos) => (
        <ChoiceRow
          key={orig}
          marker={pos + 1}
          selected={answer === orig}
          onSelect={() => onChange(orig)}
          result={
            result
              ? orig === question.answerIndex
                ? "correct"
                : orig === answer
                  ? "incorrect"
                  : "neutral"
              : undefined
          }
        >
          <RichText text={question.choices[orig]} />
        </ChoiceRow>
      ))}
    </div>
  );
}

function Multi({ question, answer, onChange, result }: PracticeInputProps<"multi">) {
  const grade = (orig: number): ChoiceResult => {
    const isAnswer = question.answerIndexes.includes(orig);
    const mine = answer.includes(orig);
    return isAnswer ? (mine ? "correct" : "missed") : mine ? "incorrect" : "neutral";
  };
  return (
    <div role="group" aria-label="보기 (복수 선택)" className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        모두 고르세요{isAllOrNothing(question) ? " · 부분 점수 없음" : " · 틀린 보기는 감점"}
      </p>
      {choiceOrder(question).map((orig, pos) => (
        <ChoiceRow
          key={orig}
          multiple
          marker={pos + 1}
          selected={answer.includes(orig)}
          onSelect={() => onChange(toggleChoice(answer, orig))}
          result={result ? grade(orig) : undefined}
        >
          <RichText text={question.choices[orig]} />
        </ChoiceRow>
      ))}
    </div>
  );
}

function Ox({ question, answer, onChange, result }: PracticeInputProps<"ox">) {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="참 또는 거짓" className="grid grid-cols-2 gap-2">
        {[true, false].map((v) => (
          <ChoiceRow
            key={String(v)}
            marker={v ? "O" : "X"}
            selected={answer === v}
            onSelect={() => onChange(v)}
            result={
              result
                ? v === question.answer
                  ? "correct"
                  : v === answer
                    ? "incorrect"
                    : "neutral"
                : undefined
            }
          >
            {v ? "참" : "거짓"}
          </ChoiceRow>
        ))}
      </div>
      {result && question.falseReason && (
        <p className="text-sm">
          <span className="font-semibold">틀린 이유</span> {question.falseReason}
        </p>
      )}
    </div>
  );
}

/** 빈칸·단답형·용어 퀴즈. 지문의 빈칸 자리는 번호 칸으로 보이고, 입력은 아래에 칸마다 하나(단어 은행이면 고르기) */
function Blank({ question, answer, onChange, result, onEnter }: PracticeInputProps<"blank">) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const parts = splitBlankText(question.text);
  // 지문이 빈칸 하나뿐이면(단답형) 지문을 따로 그리지 않고 입력 라벨을 "답"으로
  const single =
    question.blanks.length === 1 && parts.every((p) => typeof p === "number" || !p.trim());
  const set = (i: number, v: string) => onChange(answer.map((x, j) => (j === i ? v : x)));
  const status = (i: number) =>
    result ? ((result.detail as boolean[])[i] ? "correct" : "incorrect") : undefined;
  // 칸이 하나면(단답형·용어 퀴즈) 라벨은 "답", 여러 개면 "빈칸 n"(지문의 번호 칸과 같은 번호)
  const label = (i: number) => (question.blanks.length === 1 ? "답" : `빈칸 ${i + 1}`);

  return (
    <div className="flex flex-col gap-4">
      {!single && (
        <p className="text-base leading-9">
          {parts.map((p, k) =>
            typeof p === "string" ? (
              <span key={k}>{p}</span>
            ) : (
              <span
                key={k}
                className="mx-0.5 inline-block min-w-10 border-b-[1.5px] border-sumi px-1 text-center font-mono text-sm leading-6"
              >
                {p + 1}
              </span>
            ),
          )}
        </p>
      )}
      {question.blanks.map((b, i) =>
        question.bank ? (
          <SelectInput
            key={i}
            label={label(i)}
            options={question.bank.map((w) => ({ value: w, label: w }))}
            value={answer[i] ?? ""}
            disabled={!!result}
            onChange={(e) => set(i, e.target.value)}
            status={status(i)}
            answer={b.accept.join(" / ")}
          />
        ) : (
          <TextInput
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            label={label(i)}
            value={answer[i] ?? ""}
            readOnly={!!result}
            onChange={(e) => set(i, e.target.value)}
            // 마지막 칸이 아니면 Enter로 다음 칸, 마지막 칸이면 확인
            onEnter={() =>
              i < question.blanks.length - 1 ? refs.current[i + 1]?.focus() : onEnter()
            }
            enterKeyHint={i < question.blanks.length - 1 ? "next" : "done"}
            status={status(i)}
            answer={b.accept.join(" / ")}
          />
        ),
      )}
    </div>
  );
}

/** 짝짓기: 왼쪽 항목마다 SelectInput 하나 */
function Match({ question, answer, onChange, result }: PracticeInputProps<"match">) {
  const options = matchOptions(question).map((o) => ({ value: o, label: o }));
  return (
    <div className="flex flex-col gap-4">
      {question.pairs.map((p, i) => (
        <SelectInput
          key={p.left}
          label={<RichText text={p.left} />}
          options={options}
          value={answer[i] ?? ""}
          disabled={!!result}
          onChange={(e) => onChange(answer.map((x, j) => (j === i ? e.target.value || null : x)))}
          status={result ? ((result.detail as boolean[])[i] ? "correct" : "incorrect") : undefined}
          answer={p.right}
        />
      ))}
    </div>
  );
}

/** 연습 모드 입력이 있는 유형(없으면 기존 입력 + 비교 화면) */
export const PRACTICE_TYPES: readonly QType[] = [
  "mcq",
  "multi",
  "ox",
  "blank",
  "match",
  "order",
  "classify",
  "calc",
  "trace",
  "graph",
  "code-blank",
  "code-write",
  "essay",
];

/** 문제 유형에 맞는 연습 모드 입력. 유형마다 고정된 컴포넌트를 그린다 */
export function PracticeInput({
  question,
  ...rest
}: Omit<PracticeInputProps<QType>, "question" | "answer" | "onChange"> & {
  question: Question;
  answer: AnyAnswer;
  onChange(a: AnyAnswer): void;
}) {
  // 유형 ↔ 답 형태 대응은 switch의 유형으로 정해진다(QuestionRenderer의 uiFor와 같은 단언)
  const props = { question, ...rest } as unknown;
  switch (question.type) {
    case "mcq":
      return <Mcq {...(props as PracticeInputProps<"mcq">)} />;
    case "multi":
      return <Multi {...(props as PracticeInputProps<"multi">)} />;
    case "ox":
      return <Ox {...(props as PracticeInputProps<"ox">)} />;
    case "blank":
      return <Blank {...(props as PracticeInputProps<"blank">)} />;
    case "match":
      return <Match {...(props as PracticeInputProps<"match">)} />;
    case "order":
      return <Order {...(props as PracticeInputProps<"order">)} />;
    case "classify":
      return <Classify {...(props as PracticeInputProps<"classify">)} />;
    case "calc":
      return <Calc {...(props as PracticeInputProps<"calc">)} />;
    case "trace":
      return <Trace {...(props as PracticeInputProps<"trace">)} />;
    case "graph":
      return <Graph {...(props as PracticeInputProps<"graph">)} />;
    case "code-blank":
      return <CodeBlankInput {...(props as PracticeInputProps<"code-blank">)} />;
    case "code-write":
      return <CodeWriteInput {...(props as PracticeInputProps<"code-write">)} />;
    case "essay":
      return <Essay {...(props as PracticeInputProps<"essay">)} />;
    default:
      return null;
  }
}

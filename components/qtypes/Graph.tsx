"use client";

import type { GraphFigure } from "@/lib/qtypes/graph";
import { DcFigureSvg } from "./DcFigureSvg";
import type { InputProps, QTypeUI, ReviewProps } from "./types";
import { ChoiceButton, Mark, Tag } from "./ui";

const W = 160;
const H = 110;
const PAD = { l: 18, r: 6, t: 6, b: 18 };

/** 정규화 좌표(0..1) 곡선 또는 데이터 통신 그림(kind: "dc")을 인라인 SVG로. 색은 currentColor/테마 토큰이라 다크모드에서도 대비가 유지된다. */
export function FigureSvg(props: { figure: GraphFigure; xLabel: string; yLabel: string; title: string }) {
  if (props.figure.kind === "dc") return <DcFigureSvg figure={props.figure.figure} title={props.title} />;
  return <CurveSvg {...props} points={props.figure.points} />;
}

function CurveSvg({
  points,
  xLabel,
  yLabel,
  title,
}: {
  points: [number, number][];
  xLabel: string;
  yLabel: string;
  title: string;
}) {
  const x = (v: number) => PAD.l + v * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - v * (H - PAD.t - PAD.b);
  const d = points
    .map(([px, py], i) => `${i ? "L" : "M"}${x(px).toFixed(1)},${y(py).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={title}
      className="h-auto w-full max-w-xs text-foreground"
    >
      <title>{title}</title>
      <g className="text-muted" stroke="currentColor" strokeWidth="1">
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} />
      </g>
      <path
        d={d}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text x={(W + PAD.l) / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="currentColor">
        {xLabel} →
      </text>
      <text
        x={8}
        y={(H - PAD.b + PAD.t) / 2}
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        transform={`rotate(-90 8 ${(H - PAD.b + PAD.t) / 2})`}
      >
        {yLabel} →
      </text>
    </svg>
  );
}

const letter = (i: number) => String.fromCharCode(65 + i);

function Input({ question, answer, onChange, disabled }: InputProps<"graph">) {
  return (
    <div role="radiogroup" aria-label="그래프 보기" className="grid gap-2 sm:grid-cols-2">
      {question.options.map((o, i) => (
        <ChoiceButton
          key={o.key}
          index={i}
          selected={answer === o.key}
          disabled={disabled}
          onClick={() => onChange(o.key)}
        >
          <span className="mb-1 block text-sm font-semibold">그래프 {letter(i)}</span>
          {/* 입력 단계에서는 설명(label)을 숨긴다 — 설명을 읽고 고르는 문제가 되지 않게 */}
          <FigureSvg
            figure={o.figure}
            xLabel={question.xLabel}
            yLabel={question.yLabel}
            title={`그래프 ${letter(i)}`}
          />
        </ChoiceButton>
      ))}
    </div>
  );
}

function Review({ question, answer }: ReviewProps<"graph">) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {question.options.map((o, i) => {
        const isAnswer = o.key === question.answerKey;
        const isMine = o.key === answer;
        return (
          <div
            key={o.key}
            className={`flex flex-col gap-1 rounded-lg border-2 bg-surface p-2 ${isAnswer ? "border-correct" : isMine ? "border-incorrect" : "border-border"}`}
          >
            <span className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="font-semibold">
                그래프 {letter(i)}: {o.label}
              </span>
              {isMine && <Tag tone="primary">내 답</Tag>}
              {isAnswer && <Tag tone="correct">정답</Tag>}
              {isMine && <Mark ok={isAnswer} />}
            </span>
            <FigureSvg
              figure={o.figure}
              xLabel={question.xLabel}
              yLabel={question.yLabel}
              title={`그래프 ${letter(i)}: ${o.label}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export const GraphUI: QTypeUI<"graph"> = { Input, Review };

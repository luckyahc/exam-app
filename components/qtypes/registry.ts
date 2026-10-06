import type { QType } from "@/lib/qtypes/registry";
import { BlankUI } from "./Blank";
import { CalcUI } from "./Calc";
import { ClassifyUI } from "./Classify";
import { CodeBlankUI } from "./CodeBlank";
import { GraphUI } from "./Graph";
import { MatchUI } from "./Match";
import { McqUI } from "./Mcq";
import { MultiUI } from "./Multi";
import { OrderUI } from "./Order";
import { OxUI } from "./Ox";
import { TraceUI } from "./Trace";
import type { QTypeUI } from "./types";

/**
 * ★ 문제 유형 등록 지점 2 (UI). lib/qtypes/registry.ts의 QTYPE_CORE에 있는 유형이 여기 빠지면
 * `satisfies` 때문에 tsc / next build가 실패한다 — 등록 누락이 런타임까지 가지 않는다.
 */
export const QTYPE_UI = {
  mcq: McqUI,
  multi: MultiUI,
  ox: OxUI,
  blank: BlankUI,
  order: OrderUI,
  match: MatchUI,
  classify: ClassifyUI,
  calc: CalcUI,
  trace: TraceUI,
  graph: GraphUI,
  "code-blank": CodeBlankUI,
} satisfies { [K in QType]: QTypeUI<K> };

/** 유니온 문제에 맞는 UI를 꺼낸다(유형 ↔ UI 대응 단언은 이 한 곳에서만). */
export function uiFor<K extends QType>(type: K): QTypeUI<K> {
  return QTYPE_UI[type] as unknown as QTypeUI<K>;
}

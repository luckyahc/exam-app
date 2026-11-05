"use client";

import { type ReactNode, useState } from "react";
import { DarkModeSwitch } from "@/components/theme/DarkModeSwitch";
import { BottomSheet } from "./BottomSheet";
import { Button, ButtonLink } from "./Button";
import { Chip } from "./Chip";
import { ChoiceRow } from "./ChoiceRow";
import { List, ListRow } from "./ListRow";
import { Marker } from "./Marker";
import { SegmentedControl, segmentPanelProps } from "./SegmentedControl";
import { SelectInput } from "./SelectInput";
import { TextInput } from "./TextInput";

/** 디자인 개편 2단계 공통 부품 미리보기(/playground/ui). 실제 화면 아님. */
export function UiPreview() {
  const [seg, setSeg] = useState<"chapter" | "glossary" | "list">("chapter");
  const [types, setTypes] = useState<string[]>(["객관식"]);
  const [sheet, setSheet] = useState(false);
  const [single, setSingle] = useState<number | null>(1);
  const [multi, setMulti] = useState<number[]>([0, 2]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [match, setMatch] = useState("");

  const choices = ["FCFS", "SSTF", "SCAN", "C-LOOK"];
  const toggleType = (t: string) =>
    setTypes((v) => (v.includes(t) ? v.filter((x) => x !== t) : [...v, t]));

  return (
    <div className="flex flex-col gap-10">
      <Section title="Button">
        <Button block>20문제 풀기</Button>
        <Button variant="secondary" block>
          다시 풀기
        </Button>
        <Button variant="secondary" block disabled>
          비활성
        </Button>
        <ButtonLink href="#" variant="text" className="self-start">
          이 과목 틀린 문제 7개 →
        </ButtonLink>
        <ButtonLink href="#" variant="text" className="self-start">
          <Marker>시험 포인트만 풀기 (24)</Marker> →
        </ButtonLink>
      </Section>

      <Section title="ListRow">
        <List aria-label="챕터">
          <ListRow href="#" title="CH11 디스크 스케줄링" trailing="12/40" />
          <ListRow href="#" title="CH08 가상 메모리" trailing="40/40" />
          <ListRow href="#" title="CH09 단일 프로세서 스케줄링" description="아직 안 풂" />
          <ListRow title="정보 행" trailing="—" />
        </List>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          label="과목 보기"
          idPrefix="preview-seg"
          value={seg}
          onChange={setSeg}
          items={[
            { value: "chapter", label: "챕터" },
            { value: "glossary", label: "용어" },
            { value: "list", label: "문제 목록" },
          ]}
        />
        <p {...segmentPanelProps("preview-seg", seg)} className="text-sm text-muted">
          선택: {seg}
        </p>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          {[
            ["객관식", 32],
            ["단답형", 12],
            ["짝짓기", 6],
            ["계산", 0],
          ].map(([t, n]) => (
            <Chip
              key={t}
              selected={types.includes(t as string)}
              count={n as number}
              disabled={n === 0}
              onClick={() => toggleType(t as string)}
            >
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="BottomSheet">
        <Button variant="secondary" block onClick={() => setSheet(true)}>
          직접 고르기 열기
        </Button>
        <BottomSheet
          open={sheet}
          onClose={() => setSheet(false)}
          title="직접 고르기"
          footer={
            <Button block onClick={() => setSheet(false)}>
              조건에 맞는 문제 18개 풀기
            </Button>
          }
        >
          <div className="flex flex-col gap-6 pt-2">
            {["문제 유형", "난이도", "문제 수", "순서", "모드"].map((h) => (
              <div key={h} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">{h}</h3>
                <div className="flex flex-wrap gap-2">
                  <Chip selected>항목 A</Chip>
                  <Chip selected={false}>항목 B</Chip>
                  <Chip selected={false}>항목 C</Chip>
                </div>
              </div>
            ))}
          </div>
        </BottomSheet>
      </Section>

      <Section title="TextInput">
        <TextInput
          label="답"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onEnter={() => setSubmitted(text)}
        />
        <p className="text-sm text-muted">Enter로 제출: {submitted ?? "—"}</p>
        <TextInput label="Q2" defaultValue="교착 상태" status="correct" readOnly />
        <TextInput label="Q3" defaultValue="기아" status="incorrect" answer="교착 상태" readOnly />
      </Section>

      <Section title="SelectInput">
        <SelectInput
          label="Q1"
          value={match}
          onChange={(e) => setMatch(e.target.value)}
          options={[
            { value: "a", label: "상호 배제" },
            { value: "b", label: "점유 대기" },
            { value: "c", label: "비선점" },
          ]}
        />
        <SelectInput
          label="Q2"
          value="b"
          disabled
          status="correct"
          options={[{ value: "b", label: "점유 대기" }]}
        />
        <SelectInput
          label="Q3"
          value="a"
          disabled
          status="incorrect"
          answer="비선점"
          options={[{ value: "a", label: "상호 배제" }]}
        />
      </Section>

      <Section title="ChoiceRow">
        <div role="radiogroup" aria-label="단일 선택" className="flex flex-col gap-2">
          {choices.map((c, i) => (
            <ChoiceRow key={c} marker={i + 1} selected={single === i} onSelect={() => setSingle(i)}>
              {c}
            </ChoiceRow>
          ))}
        </div>
        <div role="group" aria-label="복수 선택" className="flex flex-col gap-2">
          {choices.map((c, i) => (
            <ChoiceRow
              key={c}
              multiple
              selected={multi.includes(i)}
              onSelect={() =>
                setMulti((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]))
              }
            >
              {c}
            </ChoiceRow>
          ))}
        </div>
        <div role="group" aria-label="채점된 복수 선택" className="flex flex-col gap-2">
          <ChoiceRow multiple selected result="correct">
            SSTF
          </ChoiceRow>
          <ChoiceRow multiple selected result="incorrect">
            FCFS
          </ChoiceRow>
          <ChoiceRow multiple selected={false} result="missed">
            SCAN
          </ChoiceRow>
          <ChoiceRow multiple selected={false} result="neutral">
            C-LOOK
          </ChoiceRow>
        </div>
      </Section>

      <Section title="SwitchInk">
        <List>
          <li>
            <DarkModeSwitch />
          </li>
        </List>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs text-muted">{title}</h2>
      {children}
    </section>
  );
}

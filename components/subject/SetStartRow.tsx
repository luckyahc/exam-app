"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OptionGroup as Group, TimerChips } from "@/components/quiz/OptionGroup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ListRow } from "@/components/ui/ListRow";
import { type HintSet, isHintSource, isMockSource, SOURCE_LABEL } from "@/lib/quiz/jokbo";
import type { ExamView, QuizMode } from "@/lib/quiz/session";
import { useSetScores } from "@/lib/storage/setScoresStore";

export type SetSource = "jokbo" | "related2" | "mock1" | "mock2" | `hint${HintSet}` | "short";

/**
 * 과목 상세의 족보·모의시험·단답형 모음 한 줄. 누르면 바텀시트에서 모드·화면·제한 시간을 고르고 시작한다.
 * 퀴즈 주소는 이전 시작 상자(JokboStart)와 같다: 모의시험 세트(mock1·2)는 섞지 않고 기본 시험 모드,
 * 힌트관련1~5도 기본 시험 모드(섞음), 나머지는 기본 연습 모드(섞음). 시험 모드 기본 화면은 실제 시험 화면.
 */
export function SetStartRow({
  subjectId,
  exam,
  source,
  count,
}: {
  subjectId: string;
  exam: string;
  source: SetSource;
  count: number;
}) {
  const router = useRouter();
  const mock = isMockSource(source);
  const hint = isHintSource(source);
  const set = mock || hint;
  const scores = useSetScores(subjectId, source);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<QuizMode>(set ? "exam" : "instant");
  const [view, setView] = useState<ExamView>("eclass");
  const [timer, setTimer] = useState(0);

  const label = set || source === "short" ? SOURCE_LABEL[source] : `${SOURCE_LABEL[source]}만`;
  const minutes = timer;
  const scoreText =
    hint && scores.length > 0
      ? ` · 최근 ${scores[scores.length - 1].correct}/${scores[scores.length - 1].total}`
      : "";

  const start = () => {
    const p = new URLSearchParams({ subject: subjectId, source, shuffle: mock ? "0" : "1", mode });
    p.set("exam", exam);
    if (minutes) p.set("timer", String(minutes * 60));
    if (mode === "exam" && view === "eclass") p.set("view", "eclass");
    router.push(`/quiz?${p.toString()}`);
  };

  return (
    <>
      <ListRow
        title={label}
        description={set ? `모의시험${scoreText}` : undefined}
        trailing={`${count}문제`}
        onClick={() => setOpen(true)}
      />
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        footer={
          <Button block onClick={start}>
            {count}문제 풀기{minutes ? ` · ${minutes}분` : ""}
          </Button>
        }
      >
        <div className="flex flex-col gap-6 pt-1">
          <Group label="모드">
            <Chip selected={mode === "instant"} onClick={() => setMode("instant")}>
              연습 모드
            </Chip>
            <Chip selected={mode === "exam"} onClick={() => setMode("exam")}>
              시험 모드
            </Chip>
          </Group>
          {mode === "exam" && (
            <Group label="화면">
              <Chip selected={view === "eclass"} onClick={() => setView("eclass")}>
                실제 시험 화면
              </Chip>
              <Chip selected={view === "app"} onClick={() => setView("app")}>
                기본 화면
              </Chip>
            </Group>
          )}
          <TimerChips value={timer} onChange={setTimer} />
        </div>
      </BottomSheet>
    </>
  );
}

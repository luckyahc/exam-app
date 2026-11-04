"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { List, ListRow } from "@/components/ui/ListRow";
import { Marker } from "@/components/ui/Marker";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl, segmentPanelProps } from "@/components/ui/SegmentedControl";
import { SelectInput } from "@/components/ui/SelectInput";
import { CURRENT_EXAM, type ExamId } from "@/data/subjects/exams";
import { continueLink } from "@/lib/quiz/startLinks";
import { ddayLabel, useAppSettings } from "@/lib/settings/appSettings";
import { summarize } from "@/lib/storage/records";
import { useRecords } from "@/lib/storage/recordsStore";
import { type SetSource, SetStartRow } from "./SetStartRow";

// 찾아보기 화면은 고를 때만 불러온다(과목 상세 첫 화면을 가볍게)
const loading = () => <p className="text-sm text-muted">불러오는 중…</p>;
const GlossaryView = dynamic(
  () => import("@/components/glossary/GlossaryView").then((m) => m.GlossaryView),
  { loading },
);
const QuestionList = dynamic(
  () => import("@/components/questions/QuestionList").then((m) => m.QuestionList),
  { loading },
);
const FunctionsView = dynamic(
  () => import("@/components/functions/FunctionsView").then((m) => m.FunctionsView),
  { loading },
);

export type View = "chapters" | "glossary" | "functions" | "questions";

export interface DetailSubject {
  id: string;
  name: string;
  shortName: string;
  /** false = 시험 포인트(⭐)를 쓰지 않는 과목 */
  examPoints: boolean;
  glossary: boolean;
  functions: boolean;
  chapters: { id: string; shortTitle: string }[];
}

export interface DetailExam {
  id: ExamId;
  shortName: string;
  chapters: { chapterId: string; shortTitle: string; ids: string[] }[];
  /** 진행률 분모: 이 시험 범위 챕터의 문제 */
  ids: string[];
  /** 시험 포인트 문제 수(다른 시험 챕터의 alsoExam 포함 — 과목 전체 퀴즈와 같은 범위) */
  stars: number;
  /** 바로 시작하는 분류(족보관련·강의 예제) */
  direct: { label: string; count: number; source: "related" | "example" }[];
  /** 바텀시트에서 모드·시간을 고르는 세트(족보·모의시험·단답형 모음) */
  sets: { source: SetSource; count: number }[];
}

type Props = { subject: DetailSubject; exams: DetailExam[] };

const VIEW_LABEL: Record<View, string> = {
  chapters: "챕터",
  glossary: "용어",
  functions: "함수",
  questions: "문제 목록",
};

/** 기본 시험 범위: 준비 중인 시험(챕터가 없으면 챕터가 있는 마지막 시험) */
function defaultExam(exams: DetailExam[]): ExamId {
  return (
    exams.find((e) => e.id === CURRENT_EXAM && e.chapters.length)?.id ??
    [...exams].reverse().find((e) => e.chapters.length)?.id ??
    CURRENT_EXAM
  );
}

/**
 * 과목 상세. 범위 고르기(머리의 시험 드롭다운) / 풀기(요약의 주 버튼·시험 포인트) / 찾아보기(세그먼트: 챕터 | 용어 | 문제 목록).
 * 시험 범위·세그먼트는 주소(?exam=·?view=)에 둔다 — 뒤로가기·새로고침해도 그대로, 예전 /glossary 등 주소는 여기로 넘어온다.
 * 프리렌더 HTML에는 기본값(준비 중인 시험·챕터)으로 그려 두고, 주소를 읽은 뒤 바꾼다.
 */
export function SubjectDetail(props: Props) {
  return (
    <Suspense fallback={<DetailView {...props} exam={defaultExam(props.exams)} view="chapters" />}>
      <FromParams {...props} />
    </Suspense>
  );
}

function FromParams(props: Props) {
  const params = useSearchParams();
  const views = viewsOf(props.subject);
  const examParam = params.get("exam");
  const exam = props.exams.some((e) => e.id === examParam)
    ? (examParam as ExamId)
    : defaultExam(props.exams);
  const viewParam = params.get("view") as View | null;
  const view = viewParam && views.includes(viewParam) ? viewParam : "chapters";
  return <DetailView {...props} exam={exam} view={view} />;
}

function viewsOf(s: DetailSubject): View[] {
  return [
    "chapters",
    ...(s.glossary ? (["glossary"] as const) : []),
    ...(s.functions ? (["functions"] as const) : []),
    "questions",
  ];
}

function DetailView({ subject, exams, exam, view }: Props & { exam: ExamId; view: View }) {
  const router = useRouter();
  const pathname = usePathname();
  const records = useRecords();
  const { loaded, settings } = useAppSettings();
  const ready = records.loaded && loaded;
  const rec = records.subjects[subject.id];
  const ex = exams.find((e) => e.id === exam)!;
  const views = viewsOf(subject);

  const go = (next: { exam?: ExamId; view?: View }) => {
    const p = new URLSearchParams();
    const e = next.exam ?? exam;
    const v = next.view ?? view;
    if (e !== defaultExam(exams)) p.set("exam", e);
    if (v !== "chapters") p.set("view", v);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const solvedOf = (ids: readonly string[]) =>
    rec ? ids.filter((id) => rec.progress[id]).length : 0;
  const solved = solvedOf(ex.ids);
  const openWrong = rec ? summarize(rec).openWrong : 0;
  const dday = exam === CURRENT_EXAM ? ddayLabel(settings.examDates[subject.id]) : null;
  const cont = continueLink(subject.id, exam, solved, ex.ids.length, settings);
  const quiz = `/quiz?subject=${subject.id}&exam=${exam}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/", label: "과목" }}
        title={subject.name}
        trailing={
          <SelectInput
            label="시험 범위"
            hideLabel
            placeholder={null}
            value={exam}
            onChange={(e) => go({ exam: e.target.value as ExamId })}
            options={exams.map((e) => ({
              value: e.id,
              label: e.chapters.length ? e.shortName : `${e.shortName} (준비 중)`,
            }))}
            className="w-36 shrink-0"
          />
        }
      />

      <section aria-label="진행" className="flex flex-col gap-3">
        {ex.ids.length === 0 ? (
          <p className="text-sm text-muted">준비 중</p>
        ) : (
          <>
            <div className="flex min-h-10 items-end justify-between gap-3">
              {/* 기록이 없으면 0/N 대신 "아직 안 풂"(문제 수만 함께) */}
              {!ready ? (
                <span />
              ) : solved > 0 ? (
                <p className="font-mono text-3xl font-bold tabular-nums">
                  {solved}
                  <span className="text-lg font-normal text-muted">/{ex.ids.length}</span>
                </p>
              ) : (
                <p className="text-base">
                  아직 안 풂 <span className="text-muted">· {ex.ids.length}문제</span>
                </p>
              )}
              {dday && <p className="font-mono text-lg font-bold">{dday}</p>}
            </div>
            {ready && solved > 0 && (
              <ProgressBar value={solved} max={ex.ids.length} label={`${ex.shortName} 진행`} />
            )}
            <ButtonLink href={cont.href} block className={ready ? undefined : "invisible"}>
              {cont.label}
            </ButtonLink>
          </>
        )}
        {(subject.examPoints && ex.stars > 0) || (ready && openWrong > 0) ? (
          <div className="flex flex-col items-start">
            {subject.examPoints && ex.stars > 0 && (
              <ButtonLink href={`${quiz}&star=1&shuffle=1&mode=instant`} variant="text">
                <Marker>시험 포인트만 풀기 ({ex.stars})</Marker>→
              </ButtonLink>
            )}
            {ready && openWrong > 0 && (
              <ButtonLink href={`/review?subject=${subject.id}`} variant="text">
                이 과목 틀린 문제 {openWrong}개 →
              </ButtonLink>
            )}
          </div>
        ) : null}
      </section>

      <SegmentedControl
        label="보기"
        idPrefix="subject"
        items={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))}
        value={view}
        onChange={(v) => go({ view: v })}
      />

      <div {...segmentPanelProps("subject", view)} className="flex min-w-0 flex-col gap-6">
        {view === "chapters" && (
          <>
            {ex.chapters.length > 0 ? (
              <List aria-label="챕터">
                {ex.chapters.map((c) => {
                  const n = solvedOf(c.ids);
                  return (
                    <ListRow
                      key={c.chapterId}
                      href={c.ids.length ? `/s/${subject.id}/chapter/${c.chapterId}` : undefined}
                      disabled={!c.ids.length}
                      title={`${c.chapterId.toUpperCase()} ${c.shortTitle}`}
                      trailing={
                        !c.ids.length
                          ? "준비 중"
                          : !ready
                            ? undefined
                            : n > 0
                              ? `${n}/${c.ids.length}`
                              : `${c.ids.length}문제`
                      }
                    />
                  );
                })}
              </List>
            ) : (
              <p className="text-sm text-muted">챕터 준비 중</p>
            )}
            {(ex.direct.length > 0 || ex.sets.length > 0) && (
              <section aria-labelledby="sets-heading" className="flex flex-col gap-2">
                <h2 id="sets-heading" className="font-display text-lg font-bold">
                  모의시험·모음
                </h2>
                <List>
                  {ex.direct.map((d) => (
                    <ListRow
                      key={d.source}
                      href={`${quiz}&source=${d.source}&mode=instant`}
                      title={d.label}
                      trailing={`${d.count}문제`}
                    />
                  ))}
                  {ex.sets.map((s) => (
                    <SetStartRow
                      key={s.source}
                      subjectId={subject.id}
                      exam={exam}
                      source={s.source}
                      count={s.count}
                    />
                  ))}
                </List>
              </section>
            )}
          </>
        )}

        {view === "glossary" && (
          <>
            {ex.ids.length > 0 && (
              <ButtonLink
                href={`${quiz}&topics=용어&shuffle=1&count=20&mode=instant`}
                variant="secondary"
                block
              >
                용어 퀴즈 시작
              </ButtonLink>
            )}
            <GlossaryView subjectId={subject.id} chapters={subject.chapters} />
          </>
        )}

        {view === "functions" && <FunctionsView subjectId={subject.id} />}

        {view === "questions" && (
          <QuestionList
            subject={{
              id: subject.id,
              name: subject.name,
              shortName: subject.shortName,
              ...(subject.examPoints ? {} : { examPoints: false as const }),
              chapters: subject.chapters,
            }}
          />
        )}
      </div>
    </div>
  );
}

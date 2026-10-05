import type { Metadata } from "next";
import { QTypePlayground } from "@/components/qtypes/QTypePlayground";
import { dcPlaygroundQuestions } from "@/lib/qtypes/dcSamples";
import { QTYPE_FIXTURES } from "@/lib/qtypes/fixtures";

export const metadata: Metadata = {
  title: "문제 유형 미리보기",
  robots: { index: false },
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">문제 유형 미리보기</h1>
        <p className="text-sm text-muted">
          10가지 문제 유형의 입력·채점·비교 화면을 확인하는 페이지입니다. 실제 챕터 문제가 아니라
          유형별 예시 1개씩입니다.
        </p>
      </div>
      <QTypePlayground questions={QTYPE_FIXTURES} />
      <section aria-labelledby="dc-preview" className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex flex-col gap-1">
          <h2 id="dc-preview" className="text-lg font-bold">
            데이터 통신 미리보기
          </h2>
          <p className="text-sm text-muted">
            생성기 계산 문제(지수 표기 입력: 3e8, 3×10^8)와 그림 고르기 12종입니다. 정적 문제는 이후 스프린트에서 추가됩니다.
          </p>
        </div>
        <QTypePlayground questions={dcPlaygroundQuestions()} shortcuts={false} />
      </section>
    </div>
  );
}

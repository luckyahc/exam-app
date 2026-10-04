import type { Metadata } from "next";
import { QTypePlayground } from "@/components/qtypes/QTypePlayground";
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
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UiPreview } from "@/components/ui/UiPreview";

export const metadata: Metadata = {
  title: "공통 부품 미리보기",
  robots: { index: false },
};

export default function UiPlaygroundPage() {
  // 개발용 미리보기 — next dev에서만 연다. 배포(production 빌드)에서는 404
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-8">
      <h1 className="font-display text-2xl font-bold">공통 부품</h1>
      <UiPreview />
    </div>
  );
}

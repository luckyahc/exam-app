import Link from "next/link";

export default function ResultPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← 홈으로
      </Link>
      <h1 className="text-xl font-bold sm:text-2xl">결과</h1>
      <p className="text-sm text-muted">
        점수, 유형별/토픽별 정답률, 틀린 문제 목록은 다음 스프린트에서 추가됩니다.
      </p>
    </div>
  );
}

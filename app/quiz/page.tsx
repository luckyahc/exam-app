import Link from "next/link";

export default function QuizPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← 홈으로
      </Link>
      <h1 className="text-xl font-bold sm:text-2xl">문제 풀이</h1>
      <p className="text-sm text-muted">문제 렌더러와 채점기는 다음 스프린트에서 추가됩니다.</p>
    </div>
  );
}

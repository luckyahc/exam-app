import type { ReactNode } from "react";
import type { FieldStatus } from "./fieldStatus";

/** 입력창 아래 채점 문구. 정답은 스크린리더에만(✓ 아이콘이 보인다), 오답은 “오답 · 정답 X”. */
export function FieldStatusNote({
  id,
  status,
  answer,
}: {
  id: string;
  status?: FieldStatus;
  answer?: ReactNode;
}) {
  if (status === "correct")
    return (
      <span id={id} className="sr-only">
        정답
      </span>
    );
  if (status === "incorrect")
    return (
      <p id={id} className="mt-1.5 text-sm">
        <span className="font-semibold text-shu">오답</span>
        {answer != null && (
          <>
            <span className="text-muted"> · 정답 </span>
            <span className="font-semibold">{answer}</span>
          </>
        )}
      </p>
    );
  return null;
}

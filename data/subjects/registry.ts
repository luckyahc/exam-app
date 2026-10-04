import type { SubjectDef } from "./types";
import os from "./os";
import dataComm from "./data-comm";

/**
 * ★ 과목 등록 지점. 새 과목은 `data/subjects/{과목}/` 폴더를 만들고 여기에 한 줄 추가한다.
 * 라우트·홈 카드·오답노트/통계 탭은 모두 이 배열을 순회해 만들어진다.
 */
export const SUBJECTS = [os, dataComm] as const satisfies readonly SubjectDef[];

export type SubjectId = (typeof SUBJECTS)[number]["id"];

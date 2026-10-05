import { SUBJECTS } from "@/data/subjects/registry";
import type { SubjectDef } from "@/data/subjects/types";
import type { Question } from "@/lib/qtypes/registry";
import type { WrongRecord } from "@/lib/storage/schema";
import type { SessionItem } from "./session";

/** 챕터 문제를 불러온다(동적 import — 필요한 챕터만). 없는 과목·챕터는 빈 배열 */
export async function loadChapter(subjectId: string, chapterId: string): Promise<readonly Question[]> {
  const chapter = SUBJECTS.find((s) => s.id === subjectId)?.chapters.find((c) => c.id === chapterId);
  return chapter ? chapter.load() : [];
}

export async function loadSubject(subjectId: string): Promise<Question[]> {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) return [];
  return (await Promise.all(subject.chapters.map((c) => c.load()))).flat();
}

/**
 * 세션 항목(id·과목·챕터)으로 문제를 불러온다. 챕터 데이터에 없으면 항목의 생성기 정보(`item.gen`), 없으면 오답 기록의 생성기 정보로 다시 만든다.
 * 끝내 찾지 못한 문제는 결과 Map에 없다(호출자가 "찾을 수 없음"으로 처리).
 */
export async function loadQuestions(
  items: readonly SessionItem[],
  gens: Record<string, WrongRecord["gen"]> = {},
): Promise<Map<string, Question>> {
  const keys = [...new Set(items.map((i) => `${i.subject}\u0000${i.chapter}`))];
  const chapters = await Promise.all(keys.map((k) => loadChapter(...(k.split("\u0000") as [string, string]))));
  const map = new Map<string, Question>();
  for (const qs of chapters) for (const q of qs) map.set(q.id, q);
  for (const it of items) {
    const gen = it.gen ?? gens[it.id];
    if (map.has(it.id) || !gen) continue;
    const subject: SubjectDef | undefined = SUBJECTS.find((s) => s.id === it.subject);
    const loader = subject?.loadGenerators;
    const g = loader ? (await loader())[gen.name] : undefined;
    if (g) map.set(it.id, g.generate(gen.seed, gen.params));
  }
  return map;
}

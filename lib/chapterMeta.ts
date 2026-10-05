import type { ChapterDef, SubjectDef } from "@/data/subjects/types";
import { coreFor, type QType, QTYPES } from "@/lib/qtypes/registry";

/** 화면(서버 컴포넌트)에서 클라이언트 카드로 넘기는 챕터 요약. 문제 본문은 넘기지 않는다. */
export interface ChapterMeta {
  subjectId: string;
  chapterId: string;
  title: string;
  shortTitle: string;
  ids: string[];
  starIds: string[];
  /** 그 챕터 데이터에 있는 유형(레지스트리 순서), 라벨 포함 */
  types: { type: QType; label: string; count: number }[];
  /** 문제별 필터 키(시작 전 문제 수 미리 보기용) */
  rows: { type: QType; topic: string; exam: boolean }[];
  /** 토픽: 처음 나온 순서 */
  topics: { topic: string; count: number; star: boolean }[];
}

export async function chapterMeta(subject: SubjectDef, chapter: ChapterDef): Promise<ChapterMeta> {
  const qs = await chapter.load();
  const typeCount = new Map<QType, number>();
  const topicMap = new Map<string, { topic: string; count: number; star: boolean }>();
  for (const q of qs) {
    typeCount.set(q.type, (typeCount.get(q.type) ?? 0) + 1);
    const t = topicMap.get(q.topic) ?? { topic: q.topic, count: 0, star: false };
    t.count++;
    t.star ||= q.exam;
    topicMap.set(q.topic, t);
  }
  return {
    subjectId: subject.id,
    chapterId: chapter.id,
    title: chapter.title,
    shortTitle: chapter.shortTitle,
    ids: qs.map((q) => q.id),
    starIds: qs.filter((q) => q.exam).map((q) => q.id),
    types: [...typeCount]
      .sort((a, b) => QTYPES.indexOf(a[0]) - QTYPES.indexOf(b[0]))
      .map(([type, count]) => ({ type, label: coreFor({ type } as never).label, count })),
    rows: qs.map((q) => ({ type: q.type, topic: q.topic, exam: q.exam })),
    topics: [...topicMap.values()],
  };
}

export async function subjectMeta(subject: SubjectDef): Promise<ChapterMeta[]> {
  return Promise.all(subject.chapters.map((c) => chapterMeta(subject, c)));
}

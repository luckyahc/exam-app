import { notFound } from "next/navigation";
import { SUBJECTS } from "@/data/subjects/registry";
import { getSubject } from "@/lib/subjects";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

/** 과목 영역 공통: 없는 과목 id는 404. 과목별 대표 색은 디자인 개편에서 화면에서 뺐다(데이터의 color는 그대로) */
export default async function SubjectLayout({ children, params }: LayoutProps<"/s/[subject]">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  return <div className="flex flex-1 flex-col">{children}</div>;
}

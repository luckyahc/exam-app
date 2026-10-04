import { notFound } from "next/navigation";
import { SUBJECTS } from "@/data/subjects/registry";
import { getSubject, subjectStyle } from "@/lib/subjects";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

/** 과목 영역 전체에 과목 대표 색(--subject)을 적용한다. */
export default async function SubjectLayout({ children, params }: LayoutProps<"/s/[subject]">) {
  const { subject: id } = await params;
  const subject = getSubject(id);
  if (!subject) notFound();

  return (
    <div data-subject={subject.id} style={subjectStyle(subject)} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}

import Link from "next/link";
import type { Subject } from "@/data/subjects";

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <section className="mock-subject-card">
      <div className={`mock-subject-panel mock-subject-panel-${subject.slug}`}>
        <h2>{subject.shortTitle}</h2>
      </div>

      <div className="mock-exam-row">
        <Link href={`/${subject.slug}/oge`}>ОГЭ</Link>
        <Link href={`/${subject.slug}/ege`}>ЕГЭ</Link>
      </div>
    </section>
  );
}

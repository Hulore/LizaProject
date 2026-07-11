import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { exams, type Exam, type Subject } from "@/data/subjects";

export function SubjectPage({ subject, exam }: { subject: Subject; exam: Exam }) {
  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <h1 className="font-display text-[clamp(2.7rem,7vw,5.5rem)] font-black tracking-[-.07em]">
          {exams[exam].title} по {subject.examTitle}
        </h1>
        <Link href="/" className="mt-12 inline-grid min-h-14 place-items-center border-2 border-[var(--ink)] px-7 font-black hover:bg-[var(--ink)] hover:text-white">
          На главную
        </Link>
      </main>
    </div>
  );
}

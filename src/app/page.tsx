import { SiteHeader } from "@/components/site-header";
import { SubjectCard } from "@/components/subject-card";
import { subjects } from "@/data/subjects";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-24 sm:px-8 sm:pt-32 lg:px-10">
        <div className="grid gap-20 md:grid-cols-2 md:gap-24">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      </main>
    </div>
  );
}

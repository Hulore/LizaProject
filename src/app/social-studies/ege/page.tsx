import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SocialStudiesTaskCatalog } from "@/components/social-studies-task-catalog";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ЕГЭ по обществознанию — Лиза + Вайб" };

export default async function SocialStudiesEgePage({
  searchParams,
}: {
  searchParams?: Promise<{ catalogView?: string; number?: string; taskKind?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const subject = getSubject("social-studies");

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="catalog-page mx-auto max-w-[980px] px-3 py-6 sm:px-5">
        <section className="subject-hero subject-hero-compact">
          <p>ЕГЭ</p>
          <h1>ЕГЭ по {subject.examTitle}</h1>
          <Link href="/" className="back-link">
            На главную
          </Link>
        </section>

        <SocialStudiesTaskCatalog
          catalogView={params?.catalogView}
          number={params?.number}
          taskKind={params?.taskKind}
          topic={params?.topic}
        />
      </main>
    </div>
  );
}

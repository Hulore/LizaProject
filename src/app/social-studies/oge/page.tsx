import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SocialStudiesTrainer } from "@/components/social-studies-trainer";
import { getSubject } from "@/data/subjects";
import { getPublishedTasks } from "@/lib/task-bank";
import type { OgeSocialStudiesTask } from "@/data/social-studies-oge-tasks";

export const metadata: Metadata = { title: "ОГЭ по обществознанию — Лиза + Вайб" };

export default async function SocialStudiesOgePage() {
  const subject = getSubject("social-studies");
  const tasks = (await getPublishedTasks()).filter((task): task is OgeSocialStudiesTask => task.exam === "oge");

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="catalog-page mx-auto max-w-[980px] px-3 py-6 sm:px-5">
        <section className="subject-hero subject-hero-compact">
          <p>ОГЭ</p>
          <h1>ОГЭ по {subject.examTitle}</h1>
          <Link href="/" className="back-link">
            На главную
          </Link>
        </section>

        <SocialStudiesTrainer exam="oge" ogeTasks={tasks} />
      </main>
    </div>
  );
}

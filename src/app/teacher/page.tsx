import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { TeacherDashboard } from "@/components/teacher-dashboard";
import { getStudentsForTeacher } from "@/data/students";

export default async function TeacherPage() {
  const students = await getStudentsForTeacher();

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:px-10">
        <Link href="/" className="back-link">
          На главную
        </Link>
        <TeacherDashboard students={students} />
      </main>
    </div>
  );
}

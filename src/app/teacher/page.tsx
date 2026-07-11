import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { TeacherDashboard } from "@/components/teacher-dashboard";
import { getRecentInvitations } from "@/data/invitations";
import { getStudentsForTeacher } from "@/data/students";
import { requireTeacherSession } from "@/lib/auth";
import { logoutAction } from "../login/actions";

export default async function TeacherPage({
  searchParams,
}: {
  searchParams?: Promise<{ invite?: string }>;
}) {
  await requireTeacherSession();
  const params = await searchParams;
  const students = await getStudentsForTeacher();
  const invitations = await getRecentInvitations();

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="teacher-page-actions">
          <Link href="/" className="back-link">
            На главную
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="back-link">
              Выйти
            </button>
          </form>
        </div>
        <TeacherDashboard
          createdInviteCode={params?.invite}
          invitations={invitations}
          students={students}
        />
      </main>
    </div>
  );
}
